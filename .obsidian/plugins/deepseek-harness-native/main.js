/*
 * obsidian-dsh-native — 原生 Obsidian 聊天客户端（驱动本地 DeepSeek Harness / DSH）
 *
 * 架构（第一性原理）：
 * DSH(`@deepseek-ai/dsh`) 是完整 agent harness。它起一个本地 Web 服务，暴露：
 *   - REST 命令： POST /api/<method>  {type:"client-request", rpcId, method, payload}
 *   - 事件流（WebSocket）： ws://127.0.0.1:{port}/api/events.mux （upgrade 端点；普通 GET 返回 426；session/event、projection、approval/*、question/*）
 * 本插件不再裸嵌 DSH GUI（那会重复显示文件列表），而是用 Obsidian 原生 UI 直连这套 API：
 * 工作区自动绑定 vault 并固定、完全 Obsidian 主题化、无冗余文件列表。
 *
 * 协议已实测（参考 dsh-vsc 与现场抓包）：
 *   workspace.list / workspace.create{path}
 *   session.list / session.create{workspaceId} / session.prompt{sessionId,mode,content:[{type:"text",text}]}
 *   session.cancel / respond(rpcId, {ok, value})  // 审批/提问
 *   session/event: turn/start, step/start, assistant/chunk{chunk:{type:text|reasoning|block|usage|final,text}}, assistant/message, step/end, turn/end
 *   session/projection: title, sessionStats, tokenUsage, contextPressure ...
 *   approval/requested{approvalId,toolName,reason?} -> respond {sessionId, approvalId, outcome}
 *   question/requested{questions}                   -> respond {sessionId, answer:{answers:[...]}}
 */

const {
    Plugin,
    PluginSettingTab,
    Setting,
    ItemView,
    Notice,
    MarkdownRenderer,
    Component,
    Modal,
    MarkdownView,
    requestUrl,
} = require("obsidian");
const net = require("net");
const child_process = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

const VIEW_TYPE = "dsh-native-view";

const DEFAULT_DSH_REPO_URL = "https://github.com/deepseek-ai/deepseek-harness.git";

const DEFAULT_SETTINGS = {
    port: 3080,
    startupCommand:
        'node "C:\\Users\\wurui\\deepseek-harness\\node_modules\\@deepseek-ai\\dsh\\lib\\bin.js" web --port {port}',
    autoStart: true,
    detached: true,
    vaultPath: "", // 空 = 用 app.vault.adapter.basePath
    pollIntervalMs: 5000,
    readyTimeoutMs: 120000,
    mode: "queue", // session.prompt 的 mode: "queue" | "steer"
    installDir: "", // 一键安装目标目录（默认 ~\\deepseek-harness）
    installUrl: DEFAULT_DSH_REPO_URL, // 克隆地址（国内可换 gh-proxy 镜像）
    selectionButton: false, // 框选后显示「发送到 DSH」浮动按钮
    openPanelOnSend: false, // 发送后自动打开/聚焦 DSH 面板
};

/* ====================================================================
 * DSH 安装检测 + 一键安装（从 dsh-harness 旧插件移植，简化版）
 * ================================================================== */
const INSTALL_TIMEOUT_MS = 600000; // git clone / pnpm install 单步上限

function isDshRepo(dir) {
    const fs = require("fs");
    const path = require("path");
    if (!dir) return false;
    try {
        if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return true;
        const pkgPath = path.join(dir, "package.json");
        if (!fs.existsSync(pkgPath)) return false;
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        if (pkg.name && typeof pkg.name === "string" && pkg.name.includes("deepseek-harness")) return true;
        return Boolean(pkg.scripts && typeof pkg.scripts.dsh === "string");
    } catch (_e) { return false; }
}
function defaultDshCandidates(homeDir, cwd) {
    const os = require("os");
    const path = require("path");
    homeDir = homeDir || os.homedir();
    cwd = cwd || process.cwd();
    const winPaths = process.platform === "win32" ? ["D:\\deepseek-harness", "C:\\deepseek-harness"] : [];
    const posixPaths = process.platform === "darwin" ? ["/opt/deepseek-harness", "/usr/local/deepseek-harness"] : [];
    return [...new Set([cwd, path.join(homeDir, "deepseek-harness"), ...posixPaths, ...winPaths].filter(Boolean))];
}
function hasBin(name) {
    const cp = require("child_process");
    const probe = process.platform === "win32" ? "where" : "which";
    try { cp.execFileSync(probe, [name], { stdio: "ignore" }); return true; }
    catch (_e) { return false; }
}
function detectDsh(homeDir, cwd) {
    // 1) PATH 里有没有 dsh
    if (hasBin("dsh")) {
        return {
            found: true,
            kind: "path",
            dir: "",
            startupCommand: "dsh web --port {port}",
            startupCwd: cwd || process.cwd(),
            message: "已在 PATH 中找到 dsh（直接用 `dsh web` 启动）",
        };
    }
    // 2) 常见目录扫描
    const fs = require("fs");
    for (const dir of defaultDshCandidates(homeDir, cwd)) {
        if (fs.existsSync(dir) && isDshRepo(dir)) {
            const cmd = hasBin("pnpm") ? "pnpm dsh web --port {port}" : "npm run dsh -- web --port {port}";
            return {
                found: true,
                kind: "repo",
                dir,
                startupCommand: cmd,
                startupCwd: dir,
                message: "已找到 DSH 仓库：" + dir,
            };
        }
    }
    return { found: false, kind: "none", dir: "", startupCommand: "", startupCwd: "", message: "未检测到 DSH 安装（PATH 与常见目录均无）" };
}
/** 用 spawn 跑一条命令并实时把进度通过 onStep 回调上抛（避免长任务阻塞 UI） */
function spawnStep(cmd, args, opts, onStep) {
    const cp = require("child_process");
    return new Promise((resolve) => {
        let child;
        try { child = cp.spawn(cmd, args, { windowsHide: true, ...opts }); }
        catch (e) { resolve({ ok: false, out: "", err: "spawn 失败：" + (e && e.message || String(e)) }); return; }
        let out = "", err = "";
        let killed = false;
        const killTimer = setTimeout(() => {
            killed = true;
            try { child.kill(); } catch (_e) {}
            resolve({ ok: false, out, err: (err || "（超时，已终止）") + " [timeout " + (opts && opts.timeout || INSTALL_TIMEOUT_MS) + "ms]" });
        }, (opts && opts.timeout) || INSTALL_TIMEOUT_MS);
        child.stdout.on("data", (b) => {
            const s = b.toString(); out += s;
            if (onStep) onStep({ stream: "stdout", text: s });
        });
        child.stderr.on("data", (b) => {
            const s = b.toString(); err += s;
            if (onStep) onStep({ stream: "stderr", text: s });
        });
        child.on("error", (e) => { clearTimeout(killTimer); resolve({ ok: false, out, err: "spawn error: " + (e.message || String(e)) }); });
        child.on("close", (code) => {
            clearTimeout(killTimer);
            if (killed) return;
            if (code === 0) resolve({ ok: true, out, err });
            else resolve({ ok: false, out, err: (err || "exit " + code) });
        });
    });
}
async function installDsh(targetDir, onStep, repoUrl) {
    const fs = require("fs");
    const path = require("path");
    if (!targetDir) return { ok: false, message: "目标目录为空" };
    if (fs.existsSync(targetDir) && isDshRepo(targetDir)) {
        return { ok: true, message: "目录已是 DSH 仓库：" + targetDir, dir: targetDir };
    }
    if (fs.existsSync(targetDir)) {
        // 非空且不是 DSH 仓库——不动用户的目录，告知手动
        return { ok: false, message: "目标目录已存在且不是 DSH 仓库，请先清空或换一个目录：" + targetDir };
    }
    // 依赖检查
    if (!hasBin("git")) return { ok: false, message: "缺少依赖：git（请先安装 git）" };
    if (!hasBin("node")) return { ok: false, message: "缺少依赖：node（请先安装 Node.js）" };
    const stepNotify = (msg) => { if (onStep) onStep({ phase: msg }); };
    // 1) git clone
    stepNotify("正在 clone DSH 仓库（首次可能较慢）…");
    const r1 = await spawnStep("git", [
        "clone", "--depth", "1",
        "--config", "http.postBuffer=524288000",
        "--config", "http.lowSpeedLimit=1000",
        "--config", "http.lowSpeedTime=30",
        repoUrl || DEFAULT_DSH_REPO_URL, targetDir,
    ], { timeout: INSTALL_TIMEOUT_MS });
    if (!r1.ok) return { ok: false, message: "git clone 失败：" + (r1.err || r1.out).slice(0, 300) };
    if (!fs.existsSync(targetDir) || !isDshRepo(targetDir)) {
        return { ok: false, message: "clone 完成但目录不是 DSH 仓库，请检查网络或目录权限" };
    }
    // 2) pnpm install（有 pnpm 用 pnpm，否则 npm install）
    if (hasBin("pnpm")) {
        stepNotify("正在 pnpm install（首次较慢，可能数分钟）…");
        const r2 = await spawnStep("pnpm", ["-C", targetDir, "install"], { timeout: INSTALL_TIMEOUT_MS });
        if (!r2.ok) {
            return { ok: true, message: "clone 成功，但 pnpm install 失败：\n" + (r2.err || r2.out).slice(0, 500) + "\n\n请手动到 " + targetDir + " 跑 `pnpm install`", dir: targetDir };
        }
    } else {
        stepNotify("未检测到 pnpm，跳过 install（请手动跑 npm install）…");
    }
    return { ok: true, message: "DSH 安装完成：" + targetDir, dir: targetDir };
}

/* ====================================================================
 * 服务生命周期（启动 / 探活 / 停止 dsh web）—— 沿用已验证机制
 * ================================================================== */
function tokenizeCommand(template) {
    const trimmed = (template || "").trim();
    if (!trimmed) return { command: "", args: [] };
    const tokens = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < trimmed.length; i++) {
        const ch = trimmed[i];
        if (ch === '"') {
            inQuotes = !inQuotes;
        } else if (/\s/.test(ch) && !inQuotes) {
            if (cur) {
                tokens.push(cur);
                cur = "";
            }
        } else {
            cur += ch;
        }
    }
    if (cur) tokens.push(cur);
    return { command: tokens[0] || "", args: tokens.slice(1) };
}

function tcpProbe(port, timeoutMs) {
    return new Promise((resolve) => {
        const socket = net.connect({ host: "127.0.0.1", port });
        const timer = setTimeout(() => {
            socket.destroy();
            resolve(false);
        }, timeoutMs);
        socket.once("connect", () => {
            clearTimeout(timer);
            socket.destroy();
            resolve(true);
        });
        socket.once("error", () => {
            clearTimeout(timer);
            resolve(false);
        });
    });
}

function winQuote(part) {
    return /\s/.test(part) ? '"' + part + '"' : part;
}

function winSpawnHidden(command, args, cwd, detached) {
    const cmdLine = [winQuote(command), ...args.map(winQuote)].join(" ");
    const vbsPath = path.join(os.tmpdir(), `dsh-launch-${process.pid}-${Date.now()}.vbs`);
    const body =
        'Set sh = CreateObject("WScript.Shell")\r\n' +
        "On Error Resume Next\r\n" +
        `Set ex = sh.Run("cmd.exe /d /s /c ${cmdLine.replaceAll('"', '""')}", 0, True)\r\n` +
        "If Err.Number = 0 And Not ex Is Nothing Then WScript.Quit ex.ExitCode\r\n";
    fs.writeFileSync(vbsPath, "﻿" + body, "utf16le");
    const child = child_process.spawn("wscript.exe", ["//nologo", "//b", vbsPath], {
        cwd,
        detached,
        stdio: "ignore",
        windowsHide: true,
    });
    const cleanup = () => {
        try {
            fs.unlinkSync(vbsPath);
        } catch (e) {
            /* ignore */
        }
    };
    child.once("exit", cleanup);
    child.once("error", cleanup);
    return child;
}

function spawnLaunch(command, args, cwd, detached) {
    if (process.platform === "win32") return winSpawnHidden(command, args, cwd, detached);
    return child_process.spawn(command, args, { cwd, detached: true, stdio: "ignore", windowsHide: true });
}

function killPort(port) {
    return new Promise((resolve) => {
        if (process.platform !== "win32") return resolve(false);
        const ps = `try { $p = (Get-NetTCPConnection -LocalPort ${port} -ErrorAction Stop).OwningProcess | Sort-Object -Unique; foreach ($id in $p) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue } } catch { }`;
        const child = child_process.spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", ps], {
            stdio: "ignore",
            windowsHide: true,
        });
        child.once("exit", () => resolve(true));
        child.once("error", () => resolve(false));
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class ServiceManager {
    constructor(opts) {
        this.opts = opts;
        this.child = null;
        this.spawned = false;
        this.spawnError = null;
        this.disposed = false;
    }
    async probe() {
        return tcpProbe(this.opts.port, 3000);
    }
    describeOffline() {
        if (this.spawnError) return this.spawnError;
        if (!this.opts.autoStart) return `127.0.0.1:${this.opts.port} 无服务，且自动启动已关闭`;
        if (this.spawned) return `DSH 服务已停止（进程退出或端口 ${this.opts.port} 无响应）`;
        return `127.0.0.1:${this.opts.port} 无服务`;
    }
    async ensureOnline() {
        if (await this.probe()) return { kind: "online" };
        if (!this.opts.autoStart) return { kind: "failed", message: this.describeOffline() };
        this.start();
        const deadline = Date.now() + this.opts.readyTimeoutMs;
        while (Date.now() < deadline) {
            if (this.disposed) return { kind: "failed", message: "插件已卸载" };
            if (this.spawnError) return { kind: "failed", message: "启动失败：" + this.spawnError };
            await delay(this.opts.pollIntervalMs);
            if (await this.probe()) return { kind: "online" };
        }
        return { kind: "failed", message: `等待服务就绪超时（${Math.ceil(this.opts.readyTimeoutMs / 1000)}s）` };
    }
    start() {
        if (this.disposed || this.child) return;
        const { command, args } = tokenizeCommand(this.opts.startupCommand);
        if (!command) {
            this.spawnError = "启动命令为空，请在设置里填写";
            return;
        }
        const child = spawnLaunch(command, args, this.opts.startupCwd, this.opts.detached);
        this.child = child;
        this.spawned = true;
        child.on("exit", (code) => {
            this.child = null;
            if (code !== 0 && code !== null) this.spawnError = this.spawnError || `进程退出，代码 ${code}`;
        });
        child.on("error", (err) => {
            this.spawnError = err.message;
            this.child = null;
        });
    }
    dispose() {
        this.disposed = true;
        if (this.child && !this.opts.detached) {
            const pid = this.child.pid;
            if (pid && process.platform === "win32") {
                try {
                    child_process.execFileSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore" });
                } catch (e) {
                    /* ignore */
                }
            } else if (pid) {
                try {
                    process.kill(-pid, "SIGTERM");
                } catch (e) {
                    /* ignore */
                }
            } else {
                this.child.kill();
            }
            this.child = null;
        }
    }
    reset() {
        this.child = null;
        this.disposed = false;
        this.spawnError = null;
        this.spawned = false;
    }
}

/* ====================================================================
 * DSH REST API 客户端
 * ================================================================== */
function rpcId() {
    return typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "id-" + Math.random().toString(36).slice(2);
}
function normPath(p) {
    // 两种分隔符都归一成 "/"，并去掉首尾空白与尾部分隔符，避免 DSH 返回的反斜杠与
    // Obsidian basePath 的正斜杠比对失败（曾导致误判"无匹配 workspace"而去重复创建/报错）。
    return (p || "")
        .replace(/[\\/]+/g, "/")
        .replace(/^\s+|\s+$/g, "")
        .replace(/\/+$/, "")
        .toLowerCase();
}

/* ====================================================================
 * dsh-ui 富卡片渲染器
 * 搬运自 VSCode DSH 扩展 dsh-ui-inject.js（community patch 2026-08-17），
 * 逻辑保持一致；类名沿用 dui-*，配色在 styles.css 里用 Obsidian 变量接管。
 * 调用方：把 ```dsh-ui 围栏块（Obsidian 渲染成 <pre><code class="language-dsh-ui">）
 * 解析 JSON spec 后替换成卡片。
 * ================================================================== */
function dshUiEsc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function dshUiRenderNode(n, deep) {
    if (n == null) return "";
    const t = n.type || "";
    switch (t) {
        case "text": {
            const size = n.size || "body";
            const cls = "dui-t-" + size + (n.center ? " dui-center" : "");
            return '<div class="' + cls + '">' + dshUiEsc(n.content) + "</div>";
        }
        case "callout": {
            const tone = n.tone || "info";
            const title = n.title ? '<div class="dui-callout-title">' + dshUiEsc(n.title) + "</div>" : "";
            return '<div class="dui-callout dui-co-' + dshUiEsc(tone) + '">' + title + '<div class="dui-callout-content">' + dshUiEsc(n.content) + "</div></div>";
        }
        case "badge": {
            const b = n.tone ? " dui-bd-" + dshUiEsc(n.tone) : "";
            const icon = n.icon ? dshUiEsc(n.icon) + " " : "";
            return '<span class="dui-badge' + b + '">' + icon + dshUiEsc(n.label) + "</span>";
        }
        case "stat": {
            const delta = n.delta ? '<span class="dui-stat-delta ' + (String(n.delta).startsWith("-") ? "dui-delta-down" : "dui-delta-up") + '">' + dshUiEsc(n.delta) + "</span>" : "";
            return '<div class="dui-stat"><span class="dui-stat-label">' + dshUiEsc(n.label) + '</span><span class="dui-stat-value">' + dshUiEsc(n.value) + "</span>" + delta + "</div>";
        }
        case "progress": {
            const v = Math.max(0, Math.min(100, Number(n.value) || 0));
            const vl = n.valueLabel != null ? dshUiEsc(n.valueLabel) : v + "%";
            return '<div class="dui-progress"><div class="dui-progress-label"><span>' + dshUiEsc(n.label || "") + "</span><span>" + vl + '</span></div><div class="dui-progress-bar"><div class="dui-progress-fill" style="width:' + v + '%"></div></div></div>';
        }
        case "table": {
            const cols = (n.columns || []).map((c) => "<th>" + dshUiEsc(c) + "</th>").join("");
            const rows = (n.rows || []).map((r) => "<tr>" + (Array.isArray(r) ? r : []).map((c) => "<td>" + dshUiEsc(c) + "</td>").join("") + "</tr>").join("");
            return '<table class="dui-table"><thead><tr>' + cols + "</tr></thead><tbody>" + rows + "</tbody></table>";
        }
        case "list": {
            const items = Array.isArray(n.items) ? n.items.map((it) => {
                if (typeof it === "string") return "<li>" + dshUiEsc(it) + "</li>";
                if (it && typeof it === "object") {
                    const tt = it.title ? '<div class="dui-list-item-title">' + dshUiEsc(it.title) + "</div>" : "";
                    const dd = it.desc ? '<div class="dui-list-item-desc">' + dshUiEsc(it.desc) + "</div>" : "";
                    return "<li>" + tt + dd + "</li>";
                }
                return "<li>" + dshUiEsc(it) + "</li>";
            }).join("") : "";
            return '<ul class="dui-list">' + items + "</ul>";
        }
        case "keyvalue": {
            const rows = (n.pairs || []).map((p) => "<tr><td>" + dshUiEsc(p.key) + "</td><td>" + dshUiEsc(p.value) + "</td></tr>").join("");
            return '<table class="dui-kv">' + rows + "</table>";
        }
        case "steps": {
            const cur = Number(n.current) || 0;
            const steps = (n.steps || []).map((s, i) => '<div class="dui-step' + (i === cur ? " current" : "") + '"><span class="dui-step-num">' + (i + 1) + '</span><div><div class="dui-step-title">' + dshUiEsc(s.title) + '</div>' + (s.desc ? '<div class="dui-step-desc">' + dshUiEsc(s.desc) + "</div>" : "") + "</div></div>").join("");
            return '<div class="dui-steps">' + steps + "</div>";
        }
        case "divider":
            return '<hr class="dui-divider">';
        case "spacer":
            return '<div class="dui-spacer" style="height:' + (Number(n.size) || 10) + 'px"></div>';
        case "grid": {
            const cols = Math.max(1, Number(n.cols) || 1);
            const inner = (n.items || []).map((i) => "<div>" + dshUiRenderNode(i, deep + 1) + "</div>").join("");
            return '<div class="dui-grid" style="grid-template-columns:repeat(' + cols + ',minmax(0,1fr))">' + inner + "</div>";
        }
        case "row":
            return '<div class="dui-row">' + (n.items || []).map((i) => "<div>" + dshUiRenderNode(i, deep + 1) + "</div>").join("") + "</div>";
        case "col":
            return '<div class="dui-col">' + (n.items || []).map((i) => dshUiRenderNode(i, deep + 1)).join("") + "</div>";
        case "card": {
            const title = n.title ? '<div class="dui-card-title">' + dshUiEsc(n.title) + "</div>" : "";
            return '<div class="dui-card">' + title + (n.items || []).map((i) => dshUiRenderNode(i, deep + 1)).join("") + "</div>";
        }
        case "link":
            return n.href ? '<a class="dui-link" href="' + dshUiEsc(n.href) + '" target="_blank" rel="noreferrer">' + dshUiEsc(n.label || n.href) + "</a>" : "<span>" + dshUiEsc(n.label || "") + "</span>";
        case "json":
            return '<div class="dui-json">' + dshUiEsc(typeof n.value === "string" ? n.value : JSON.stringify(n.value, null, 2)) + "</div>";
        case "code":
            return '<div class="dui-codeblock">' + dshUiEsc(n.code) + "</div>";
        case "copy": {
            const label = n.label || "复制";
            return '<span class="dui-copy" data-copy="' + dshUiEsc(n.text || "") + '" data-label="' + dshUiEsc(label) + '" title="点击复制">' + dshUiEsc(label) + " 📋</span>";
        }
        case "tabs": {
            const tabs = n.tabs || [];
            const heads = tabs.map((tb, i) => '<span class="dui-tab' + (i === 0 ? " active" : "") + '" data-idx="' + i + '">' + dshUiEsc(tb.label) + "</span>").join("");
            const bodies = tabs.map((tb, i) => '<div class="dui-tab-panel" data-idx="' + i + '" style="' + (i === 0 ? "" : "display:none") + '">' + (tb.items || []).map((x) => dshUiRenderNode(x, deep + 1)).join("") + "</div>").join("");
            return '<div class="dui-tabs"><div class="dui-tab-head">' + heads + "</div>" + bodies + "</div>";
        }
        case "accordion": {
            const items = (n.items || []).map((a) => "<details><summary>" + dshUiEsc(a.title) + '</summary><div class="dui-acc-body">' + (a.items || []).map((i) => dshUiRenderNode(i, deep + 1)).join("") + "</div></details>").join("");
            return '<div class="dui-acc">' + items + "</div>";
        }
        case "timeline": {
            const items = (n.items || []).map((it) => '<div class="dui-tl-item"><span class="dui-tl-dot"></span><div><span class="dui-tl-title">' + dshUiEsc(it.title) + "</span>" + (it.time ? '<span class="dui-tl-time">' + dshUiEsc(it.time) + "</span>" : "") + (it.desc ? '<div class="dui-tl-desc">' + dshUiEsc(it.desc) + "</div>" : "") + "</div></div>").join("");
            return '<div class="dui-timeline">' + items + "</div>";
        }
        case "chart": {
            const data = n.data || [];
            const max = Math.max(1, ...data.map((d) => Math.abs(Number(d.value) || 0)));
            const bars = data.map((d) => {
                const v = Number(d.value) || 0;
                const w = Math.max(2, Math.round((Math.abs(v) / max) * 100));
                const color = d.color || "";
                return '<div class="dui-bar-row"><span class="dui-bar-label">' + dshUiEsc(d.label) + '</span><div class="dui-bar-track"><div class="dui-bar-fill" style="width:' + w + "%;" + (color ? "background:" + dshUiEsc(color) : "") + '"></div></div><span class="dui-bar-val">' + v + "</span></div>";
            }).join("");
            return '<div class="dui-chart">' + bars + "</div>";
        }
        case "button":
        case "input":
        case "textarea":
        case "select":
        case "checkbox":
        case "switch":
        case "slider":
        case "radio":
        case "submit":
        case "quiz": {
            const label = n.label || n.title || n.question || "";
            const extra = n.content ? " — " + n.content : "";
            return '<span class="dui-ro-input">🔒 ' + dshUiEsc(label) + dshUiEsc(extra) + "</span>";
        }
        case "mermaid":
            return '<div class="dui-callout dui-co-info"><div class="dui-callout-title">Mermaid 图</div><div class="dui-callout-content">图表在网页版查看。\n' + dshUiEsc(n.code || "") + "</div></div>";
        case "plot":
        case "scene3d":
            return '<div class="dui-callout dui-co-info"><div class="dui-callout-title">' + (t === "plot" ? "函数图" : "3D 场景") + '</div><div class="dui-callout-content">该组件仅在网页版渲染。</div></div>';
        case "avatar":
            return '<span class="dui-badge">👤 ' + dshUiEsc(n.name || "") + "</span>";
        case "breadcrumb":
            return '<div class="dui-note">' + (n.items || []).map((i) => dshUiEsc(i)).join(" › ") + "</div>";
        case "file-tree": {
            const renderTree = (items) => '<ul class="dui-list">' + (items || []).map((it) => "<li>" + (it.type === "dir" ? "📁" : "📄") + " " + dshUiEsc(it.name) + (it.children ? renderTree(it.children) : "") + "</li>").join("") + "</ul>";
            return renderTree(n.items);
        }
        default:
            return '<div class="dui-json">' + dshUiEsc(JSON.stringify(n, null, 2)) + "</div>";
    }
}
function dshUiRenderSpec(spec) {
    const title = spec.title ? '<div class="dui-title">' + dshUiEsc(spec.title) + "</div>" : "";
    const gap = Number(spec.gap) || 10;
    const items = (spec.items || []).map((i) => dshUiRenderNode(i, 0)).join("");
    return '<div class="dui-wrap" style="gap:' + gap + 'px">' + title + items + "</div>";
}

class DshApi {
    constructor(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/+$/u, "");
    }
    async call(method, payload = {}) {
        // 用 Obsidian 的 requestUrl 而不是原生 fetch：renderer 进程的 fetch 受 CSP 限制
        // (默认 connect-src 不含 http://127.0.0.1:任意port)，会直接抛 "Failed to fetch"。
        // requestUrl 走宿主进程，绕开 CSP/沙箱。
        const url = `${this.baseUrl}/api/${method}`;
        const body = JSON.stringify({ type: "client-request", rpcId: rpcId(), method, payload });
        let resp;
        try {
            resp = await requestUrl({
                url,
                method: "POST",
                contentType: "application/json",
                body,
                throw: false,
            });
        } catch (e) {
            throw new Error(`DSH RPC ${method} 网络错误：${e && e.message ? e.message : String(e)} (${url})`);
        }
        if (resp.status < 200 || resp.status >= 300) {
            throw new Error(`DSH RPC ${method} HTTP ${resp.status} (${url})`);
        }
        let json;
        try { json = typeof resp.json === "function" ? resp.json : JSON.parse(resp.text || ""); }
        catch (e) { throw new Error(`DSH RPC ${method} 返回非 JSON：${(resp.text || "").slice(0, 200)}`); }
        if (json.result && json.result.ok) return json.result.value;
        const err = json.result && json.result.error ? JSON.stringify(json.result.error) : "unknown";
        throw new Error(`DSH RPC ${method} 失败: ${err}`);
    }
    async respond(rpcIdValue, value) {
        // DSH /api/respond 约定：{type:"client-response", rpcId:<原请求rpcId>, result:{ok,value}}
        const url = `${this.baseUrl}/api/respond`;
        const body = JSON.stringify({ type: "client-response", rpcId: rpcIdValue, result: { ok: true, value } });
        const resp = await requestUrl({
            url,
            method: "POST",
            contentType: "application/json",
            body,
            throw: false,
        });
        let json;
        try { json = typeof resp.json === "function" ? resp.json : JSON.parse(resp.text || ""); }
        catch (e) { return { ok: false, error: e.message }; }
        return json;
    }
    async ensureWorkspace(vaultPath) {
        const wl = await this.call("workspace.list");
        let ws = wl.items.find((i) => normPath(i.path) === normPath(vaultPath));
        if (!ws) ws = await this.call("workspace.create", { path: vaultPath });
        return ws;
    }
    async listSessions(workspaceId) {
        const wl = await this.call("workspace.list");
        const ws = wl.items.find((w) => w.workspaceId === workspaceId);
        const ids = new Set(ws ? ws.sessionIds : []);
        const archived = new Set(wl.archivedSessionIds || []);
        const sl = await this.call("session.list");
        return sl.items
            .filter((i) => ids.has(i.sessionId))
            .filter((i) => !archived.has(i.sessionId))
            .filter((i) => i.origin !== "subagent")
            .filter((i) => !i.blank)
            // 把后端返回的 title 拾起来；空 title 的留给 UI 显示「未命名」
            .map((i) => ({ sessionId: i.sessionId, title: typeof i.title === "string" ? i.title : "", updatedAt: i.updatedAt }))
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    async createSession(workspaceId) {
        return this.call("session.create", { workspaceId });
    }
    async prompt(sessionId, text, mode = "queue") {
        return this.call("session.prompt", {
            sessionId,
            mode,
            content: [{ type: "text", text }],
        });
    }
    async getModels(sessionId) {
        // DSH 真实结构：{current:{provider,model,reasoningEffort?}, groups:[{id, name, models:[{id, name, description?, reasoning?: {efforts, defaultEffort}}]}]}
        // 失败时返回空目录（不抛，避免破坏面板）
        try { return await this.call("session.models", { sessionId }); }
        catch (_e) { return { current: null, groups: [] }; }
    }
    async selectModel(sessionId, provider, model, effort) {
        // DSH 的 selectModel 接受 reasoningEffort（"low"/"medium"/"high"），没有则省略
        const payload = { sessionId, provider, model };
        if (effort) payload.reasoningEffort = effort;
        return this.call("session.selectModel", payload);
    }
    async getPermissionPreset() {
        // 走 settings.describe 拿 permission namespace 当前的 defaultPreset（projection 通道只推变化，初值拿不到）
        try {
            const d = await this.call("settings.describe", {});
            const ns = Array.isArray(d && d.namespaces) ? d.namespaces.find((n) => n.ns === "permission") : null;
            if (ns && ns.value && typeof ns.value.defaultPreset === "string") {
                return {
                    value: ns.value.defaultPreset,
                    revision: typeof ns.revision === "number" ? ns.revision : null,
                    presets: extractPresetOptionsFromSchema(ns.schema)
                };
            }
            return { value: null, revision: null, presets: [] };
        } catch (_e) {
            return { value: null, revision: null, presets: [] };
        }
    }
    async setPermissionPreset(preset, expectedRevision) {
        // 写入：permission.defaultPreset；DSH 要求 expectedRevision 防止冲突
        return this.call("settings.mutate", {
            ns: "permission",
            ops: [{ op: "set", path: ["defaultPreset"], value: preset }],
            expectedRevision: typeof expectedRevision === "number" ? expectedRevision : undefined
        });
    }
    async cancel(sessionId) {
        try {
            await this.call("session.cancel", { sessionId });
        } catch (e) {
            /* ignore */
        }
    }
    async getHistory(sessionId) {
        // session.history 返回 { events:[{event:{type,seq,time,data}}], hasMore, projections }
        // 是新建会话也能可靠拿到完整 turn（含 turn/end），用来兜底渲染（WS 对新会话不推事件）
        try { return await this.call("session.history", { sessionId }); }
        catch (_e) { return { events: [] }; }
    }
}

/* 把 settings schema 里 union→const 的可选 preset 名挑出来（从 namespace.schema 反查）
 * DSH schema 形态：{type:"union", list:["#presetA","#presetB"]} → schema.refs[list[i]] = {type:"const", value:"x", meta?:{description:"…"}}
 */
function extractPresetOptionsFromSchema(schema) {
    try {
        if (!schema || typeof schema !== "object") return [];
        const refs = schema.refs || {};
        if (!refs || typeof refs !== "object") return [];
        // DSH 真实结构：schema.refs 里有一个 object 节点，其 dict.defaultPreset 指向 union 节点；
        // union.list 是一组 const 节点（每个 value 是一个预设名）。退化：全局找第一个 union。
        let union = null;
        for (const k of Object.keys(refs)) {
            const node = refs[k];
            if (node && node.type === "object" && node.dict && node.dict.defaultPreset != null) {
                const target = refs[String(node.dict.defaultPreset)] || node.dict.defaultPreset;
                if (target && target.type === "union") { union = target; break; }
            }
        }
        if (!union) {
            for (const k of Object.keys(refs)) {
                const node = refs[k];
                if (node && node.type === "union" && Array.isArray(node.list)) { union = node; break; }
            }
        }
        if (!union || !Array.isArray(union.list)) return [];
        const out = [];
        for (const ref of union.list) {
            const choice = (typeof ref === "string" || typeof ref === "number") ? refs[String(ref)] : ref;
            if (!choice || choice.type !== "const" || typeof choice.value !== "string") continue;
            const label = (choice.meta && typeof choice.meta.description === "string") ? choice.meta.description : choice.value;
            out.push({ id: choice.value, label });
        }
        return out;
    } catch (_e) { return []; }
}
/* ====================================================================
 * 聊天视图（原生 Obsidian UI）
 * ================================================================== */
class DshNativeView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.api = plugin.api;
        this.workspace = null;
        this.sessionId = null;
        this.sessions = [];
        this.ws = null;
        this.wsConnected = false;
        this.wsReconnectTimer = null;
        this.assistantEl = null;
        this.assistantMd = "";
        this.thinkingMd = "";
        this.renderPending = false;
        this.pending = new Map(); // key -> {rpcId, kind, ...}
        // 轮询渲染（兜底新会话 WS 不推事件）+ turn 生命周期标志
        this._pollTimer = null;
        this._turnDone = false;
        this._contentSetByWs = false;
        this._pollStart = 0;
        this._modelFixPromise = null;
    }

    getViewType() {
        return VIEW_TYPE;
    }
    getDisplayText() {
        return "DeepSeek Harness";
    }
    getIcon() {
        return "bot";
    }

    /* ---------- DOM ---------- */
    async onOpen() {
        const root = this.contentEl;
        root.empty();
        root.addClass("dsh-native-container");

        // 报告函数：把错误以纯文本直接渲染到 panel，永远不会再"静默白板"
        const fatal = (where, e) => {
            const msg = (e && (e.stack || e.message)) ? (e.stack || e.message) : String(e);
            console.error(`[dsh-native] onOpen @ ${where}:`, e);
            try {
                root.empty();
                const box = root.createDiv();
                box.style.cssText = "padding:16px;font-family:var(--font-monospace,monospace);font-size:12px;line-height:1.5;color:#c00;background:#fff;white-space:pre-wrap;word-break:break-word;overflow:auto;height:100%;box-sizing:border-box;";
                const t = box.createEl("div");
                t.textContent = `❌ DSH 面板初始化失败 @ ${where}`;
                t.style.cssText = "font-weight:700;color:#c00;";
                const pre = box.createEl("pre");
                pre.textContent = msg;
                pre.style.cssText = "white-space:pre-wrap;margin:8px 0 0 0;color:#333;";
                const hint = box.createEl("div");
                hint.textContent = "→ 把这段红字截图给我，我会按堆栈定位修复。";
                hint.style.cssText = "color:#666;margin-top:12px;";
            } catch (_) {
                root.textContent = `DSH 面板初始化失败 @ ${where}: ${msg}`;
            }
        };

        // 0) 视觉信号已移除：调试期的大红字标题（"DSH panel — vX — onOpen reached"）不再展示；
        //    版本号改在「设置」面板展示（见 DshNativeSettingTab）。

        // 1) overlay
        try { this.overlay = root.createDiv("dsh-native-overlay"); }
        catch (e) { return fatal("createDiv overlay", e); }

        // 2) header
        let header;
        try { header = root.createDiv("dsh-native-header"); }
        catch (e) { return fatal("createDiv header", e); }
        // 2.1) 顶部条：状态点 + 标题 + 新建 + 历史
        let headerTop;
        try { headerTop = header.createDiv("dsh-native-header-top"); }
        catch (e) { return fatal("createDiv headerTop", e); }
        try { this.statusDot = headerTop.createSpan("dsh-status-dot"); }
        catch (e) { return fatal("createSpan statusDot", e); }
        try {
            const titleEl = headerTop.createSpan("dsh-native-title");
            titleEl.textContent = "DeepSeek Harness";
        } catch (e) { return fatal("createSpan title", e); }
        try {
            this.newBtn = headerTop.createEl("button", { cls: "dsh-btn dsh-icon-btn", attr: { title: "新建会话" } });
            this.newBtn.textContent = "＋";
            this.newBtn.addEventListener("click", () => this.newSession());
        } catch (e) { return fatal("createEl newBtn", e); }
        try {
            this.historyBtn = headerTop.createEl("button", { cls: "dsh-btn dsh-icon-btn", attr: { title: "历史会话" } });
            this.historyBtn.textContent = "☰";
            this.historyBtn.addEventListener("click", () => this.openHistory());
        } catch (e) { return fatal("createEl historyBtn", e); }
        // 2.2) 多标签会话栏（Claudian 风格）
        try { this.tabBar = header.createDiv("dsh-tabbar"); }
        catch (e) { return fatal("createDiv tabBar", e); }

        // 3) messages
        try { this.messagesEl = root.createDiv("dsh-native-messages"); }
        catch (e) { return fatal("createDiv messages", e); }
        // 3.1) dsh-ui 卡片交互委托（tab 切换 + 复制）——挂一次在容器上
        try {
            this.messagesEl.addEventListener("click", (e) => {
                const t = e.target;
                if (!t || !t.closest) return;
                const tab = t.closest(".dui-tab");
                if (tab) {
                    const wrap = tab.closest(".dui-tabs");
                    if (!wrap) return;
                    const idx = tab.getAttribute("data-idx");
                    wrap.querySelectorAll(".dui-tab").forEach((x) => x.classList.toggle("active", x.getAttribute("data-idx") === idx));
                    wrap.querySelectorAll(".dui-tab-panel").forEach((p) => { p.style.display = p.getAttribute("data-idx") === idx ? "" : "none"; });
                    return;
                }
                const copy = t.closest(".dui-copy");
                if (copy) {
                    const txt = copy.getAttribute("data-copy") || "";
                    const label = copy.getAttribute("data-label") || "复制";
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(txt).then(() => {
                            copy.textContent = "已复制 ✓";
                            setTimeout(() => { copy.textContent = label + " 📋"; }, 1200);
                        }).catch(() => {});
                    }
                }
            });
        } catch (e) { /* 委托失败不影响主流程 */ }
        // status line
        try { this.statusLine = root.createDiv("dsh-native-statusline"); }
        catch (e) { return fatal("createDiv statusline", e); }

        // 3.5) controls bar（模式 / 模型 / 权限 — 对齐 VSCode DSH 底部下拉）
        try {
            this.controlsBar = root.createDiv("dsh-native-controls");
            // 模式（queue / steer 段控件）
            this.modeLabel = this.controlsBar.createSpan("dsh-ctl-label");
            this.modeLabel.textContent = "模式";
            this.modeToggle = this.controlsBar.createDiv("dsh-mode-toggle");
            this.modeBtnQueue = this.modeToggle.createEl("button", { cls: "dsh-mode-btn", attr: { title: "queue — 排队等当前 turn 结束" } });
            this.modeBtnQueue.textContent = "队列";
            this.modeBtnSteer = this.modeToggle.createEl("button", { cls: "dsh-mode-btn", attr: { title: "steer — 立即打断/引导当前 turn" } });
            this.modeBtnSteer.textContent = "引导";
            const curMode = (this.plugin && this.plugin.settings && this.plugin.settings.mode) || "queue";
            this._applyModeUi(curMode);
            this.modeBtnQueue.addEventListener("click", () => this.setMode("queue"));
            this.modeBtnSteer.addEventListener("click", () => this.setMode("steer"));

            // 模型（session.models RPC 驱动）
            this.modelLabel = this.controlsBar.createSpan("dsh-ctl-label");
            this.modelLabel.textContent = "模型";
            this.modelSelect = this.controlsBar.createEl("select", { cls: "dsh-model-select" });
            const phOpt = this.modelSelect.createEl("option", { value: "" });
            phOpt.textContent = "加载中…";
            this.modelSelect.disabled = true;
            this.modelSelect.addEventListener("change", () => {
                const v = this.modelSelect.value;
                if (!v) return;
                const parts = v.split("::");
                const provider = parts[0] || "";
                const model = parts[1] || "";
                const effort = parts[2] || undefined;
                this.switchModel(provider, model, effort);
            });

            // 权限（settings.describe 静态读 defaultPreset + projection 实时更新；下拉切换走 settings.mutate）
            this.permLabel = this.controlsBar.createSpan("dsh-ctl-label");
            this.permLabel.textContent = "权限";
            this.permSelect = this.controlsBar.createEl("select", { cls: "dsh-perm-select" });
            const ph = this.permSelect.createEl("option", { value: "" });
            ph.textContent = "加载中…";
            this.permSelect.disabled = true;
            this.permSelect.addEventListener("change", () => this.switchPermission());
            // 兼容旧字段 permValue（占位符，给 setSession 用）
            this.permValue = this.permSelect;
        }
        catch (e) { return fatal("createDiv controls", e); }

        // 4) input
        let inputBar;
        try { inputBar = root.createDiv("dsh-native-inputbar"); }
        catch (e) { return fatal("createDiv inputbar", e); }
        try {
            this.inputEl = inputBar.createEl("textarea", {
                cls: "dsh-native-input",
                placeholder: "给 DSH 发消息…（Enter 发送，Shift+Enter 换行）",
            });
            this.inputEl.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    this.send();
                }
            });
        } catch (e) { return fatal("createEl textarea", e); }
        // 注：底部输入框不画发送按钮——通用惯例 Enter 发送 / Shift+Enter 换行（keydown 已处理）

        // 5) 启动后台连接（boot 内部已自捕获异常并显式浮出）
        this.boot().catch((e) => {
            console.error("[dsh-native] onOpen boot 异常:", e);
            this.setStatus("offline");
            this.showOverlay("初始化失败：" + (e && e.message ? e.message : String(e)), true);
        });
    }

    async onClose() {
        this.closeWs();
        if (this.messagesEl) this.messagesEl.empty();
    }

    showOverlay(message, withReconnect) {
        if (!this.overlay) return;
        this.overlay.empty();
        const msgEl = this.overlay.createEl("div", { cls: "dsh-native-msg" });
        msgEl.textContent = message;
        if (withReconnect) {
            const btn = this.overlay.createEl("button", { cls: "mod-cta" });
            btn.textContent = "重连";
            btn.addEventListener("click", () => this.boot());
            const testBtn = this.overlay.createEl("button", { cls: "dsh-btn" });
            testBtn.textContent = "诊断 DSH";
            testBtn.style.marginLeft = "8px";
            testBtn.addEventListener("click", () => this.diagnose());
        }
        // 用 class 控制显隐（避免 obsidian 的 show()/hide() 与 CSS display 冲突，导致空 overlay 永久盖住界面）
        this.overlay.addClass("is-visible");
    }
    hideOverlay() {
        if (this.overlay) this.overlay.removeClass("is-visible");
    }

    /* ---------- 启动流程 ---------- */
    async boot() {
        this.setStatus("connecting");
        this.showOverlay("正在连接 DSH 服务…");
        try {
            const online = await this.plugin.ensureServiceOnline();
            if (online.kind !== "online") {
                this.setStatus("offline");
                this.showOverlay("DSH 服务未启动：" + online.message, true);
                return;
            }
            this.workspace = await this.api.ensureWorkspace(this.plugin.getVaultPath());
            await this.loadSessions();
            // 全局默认权限（DSH 不分会话：permission.defaultPreset 写一次即可）
            await this.loadPermissions();
            this.hideOverlay();
            this.setStatus("online");
            this.connectWs();
        } catch (e) {
            console.error("[dsh-native] boot 失败:", e);
            const msg = e && e.message ? e.message : String(e);
            this.setStatus("offline");
            this.showOverlay(
                "初始化失败：" + msg +
                "\n\n可能原因：\n• DSH 服务没在监听 127.0.0.1:" + this.plugin.settings.port + "（终端跑 curl -sf http://127.0.0.1:" + this.plugin.settings.port + "/ 验证）\n• 端口被防火墙/别的程序占用\n• 设置里的 startupCommand 路径不对（打开 DSH 设置核对）",
                true
            );
            new Notice("DSH 面板初始化失败：" + msg);
        }
    }

    async diagnose() {
        // 用 requestUrl 直接打 DSH 根 URL + /api/workspace.list 双重验证，把结果写到 overlay
        const base = this.api.baseUrl;
        const probeUrl = base + "/";
        const rpcUrl = base + "/api/workspace.list";
        const lines = [];
        const pings = await this.plugin.ensureServiceOnline();
        lines.push("• 127.0.0.1:" + this.plugin.settings.port + " TCP: " + (pings.kind === "online" ? "✅ 通" : "❌ 不通 — " + (pings.message || "")));
        try {
            const r = await requestUrl({ url: probeUrl, method: "GET", throw: false });
            lines.push("• GET " + probeUrl + " → HTTP " + r.status);
        } catch (e) {
            lines.push("• GET " + probeUrl + " → 抛错：" + (e && e.message ? e.message : String(e)));
        }
        try {
            const r = await requestUrl({
                url: rpcUrl,
                method: "POST",
                contentType: "application/json",
                body: JSON.stringify({ type: "client-request", rpcId: "diag", method: "workspace.list", payload: {} }),
                throw: false,
            });
            lines.push("• POST " + rpcUrl + " → HTTP " + r.status + (r.status === 200 ? " ✅" : " ❌"));
        } catch (e) {
            lines.push("• POST " + rpcUrl + " → 抛错：" + (e && e.message ? e.message : String(e)));
        }
        this.showOverlay("诊断结果：\n" + lines.join("\n") + "\n\n把这段截图给我。", true);
    }

    async loadSessions() {
        this.sessions = await this.api.listSessions(this.workspace.workspaceId);
        if (this.sessions.length > 0) {
            this.openTabs = [this.sessions[0].sessionId];
            this.setSession(this.sessions[0].sessionId);
        } else {
            const s = await this.api.createSession(this.workspace.workspaceId);
            this.sessions = [{ sessionId: s.sessionId, title: "新会话", blank: true }];
            this.openTabs = [s.sessionId];
            this.setSession(s.sessionId);
        }
        this.renderTabs();
    }

    _tabTitle(s) {
        if (s && s.title) return s.title;
        if (s && s.sessionId) return "未命名 · " + s.sessionId.slice(0, 12);
        return "未命名";
    }

    renderTabs() {
        if (!this.tabBar) return;
        this.tabBar.empty();
        const open = this.openTabs || [];
        for (const id of open) {
            const s = this.sessions.find((x) => x.sessionId === id);
            if (!s) continue;
            const tab = this.tabBar.createEl("div", {
                cls: "dsh-tab" + (id === this.sessionId ? " is-active" : ""),
            });
            const label = tab.createSpan("dsh-tab-label");
            label.textContent = this._tabTitle(s);
            label.title = s.sessionId;
            if (open.length > 1) {
                const close = tab.createEl("span", { cls: "dsh-tab-close", attr: { title: "关闭标签" } });
                close.textContent = "×";
                close.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.closeTab(id);
                });
            }
            tab.addEventListener("click", () => this.openSessionAsTab(id));
        }
    }

    openSessionAsTab(id) {
        if (!this.openTabs) this.openTabs = [];
        if (!this.openTabs.includes(id)) {
            this.openTabs.push(id);
            // 超过 6 个标签回收最旧（最左）
            while (this.openTabs.length > 6) this.openTabs.shift();
        }
        if (id === this.sessionId) { this.renderTabs(); return; }
        this.setSession(id);
        this.renderTabs();
    }

    closeTab(id) {
        if (!this.openTabs || this.openTabs.length <= 1) return;
        const idx = this.openTabs.indexOf(id);
        if (idx < 0) return;
        this.openTabs.splice(idx, 1);
        if (id === this.sessionId) {
            const next = this.openTabs[Math.max(0, idx - 1)];
            this.setSession(next);
        }
        this.renderTabs();
    }

    setSession(id) {
        this.sessionId = id;
        this.clearConversation();
        // 清空待处理审批
        this.pending.clear();
        this.setStatus("online");
        // 会话切换后重新拉模型目录 + 权限（投影 + settings.describe 双通道）
        this.loadModels();
        this.loadPermissions();
        // 渲染该会话的历史消息（对齐 VSCode/Claudian：切到会话即看到完整对话）
        this.loadHistory(id);
    }

    async switchSession(id) {
        this.openSessionAsTab(id);
    }

    openHistory() {
        try { new HistoryModal(this.app, this).open(); }
        catch (e) { new Notice("打开历史会话失败：" + (e && e.message ? e.message : String(e))); }
    }

    async newSession() {
        const s = await this.api.createSession(this.workspace.workspaceId);
        this.sessions.unshift({ sessionId: s.sessionId, title: "新会话", blank: true });
        this.openSessionAsTab(s.sessionId);
    }

    /* ---------- 模式 / 模型 / 权限 ---------- */
    _applyModeUi(mode) {
        if (!this.modeBtnQueue || !this.modeBtnSteer) return;
        const isQueue = mode === "queue";
        this.modeBtnQueue.classList.toggle("is-active", isQueue);
        this.modeBtnSteer.classList.toggle("is-active", !isQueue);
        this.modeBtnQueue.setAttribute("aria-pressed", isQueue ? "true" : "false");
        this.modeBtnSteer.setAttribute("aria-pressed", !isQueue ? "true" : "false");
        // 引导（steer）模式：输入框青色边，作为「计划待确认」的可视化信号（对齐 Claudian）
        if (this.inputEl) this.inputEl.classList.toggle("is-steer", !isQueue);
    }
    async setMode(mode) {
        if (mode !== "queue" && mode !== "steer") return;
        this._applyModeUi(mode);
        if (this.plugin && this.plugin.settings) {
            this.plugin.settings.mode = mode;
            try { await this.plugin.saveSettings(); } catch (_e) {}
        }
    }
    async loadModels() {
        if (!this.sessionId || !this.modelSelect) return;
        try {
            // DSH 真实结构：{ current:{provider,model,reasoningEffort?}, groups:[{id, name, models:[{id, name, description?, reasoning?: {efforts, defaultEffort}}]}] }
            // 不是扁平的 models:[]，所以必须从 groups[].models[] 平铺出来。
            const r = await this.api.getModels(this.sessionId);
            const groups = Array.isArray(r && r.groups) ? r.groups : [];
            const current = r && r.current;

            this.modelSelect.empty();
            let flatCount = 0;
            for (const g of groups) {
                const models = Array.isArray(g && g.models) ? g.models : [];
                if (models.length === 0) continue;
                // 用 <optgroup> 把不同 provider 分组显示（对齐 VSCode DSH 弹层体验）
                const og = this.modelSelect.createEl("optgroup");
                og.label = g.name || g.id || g.provider || "未知分组";
                for (const m of models) {
                    // 优先从 m.id 解析 provider（DSH 用 "provider/model" 格式），其次 m.provider
                    let provider = m.provider || "";
                    let model = m.model || "";
                    if ((!provider || !model) && typeof m.id === "string" && m.id.includes("/")) {
                        const idx = m.id.indexOf("/");
                        provider = provider || m.id.slice(0, idx);
                        model = model || m.id.slice(idx + 1);
                    } else if (!model && typeof m.id === "string") {
                        // m.id 是规范模型 id（如 deepseek-v4-flash，小写）。优先用它而非 m.name（大写 DeepSeek-V4-Flash），
                        // 否则把大写 id 发给后端、转发到 LLM API 时会被 400 拒绝（见下方 autoCorrectModel）。
                        model = m.id;
                    }
                    if (!model) model = m.name || "";
                    provider = provider || g.id || "";
                    if (!provider || !model) continue;
                    const effort = m.reasoning && m.reasoning.defaultEffort ? m.reasoning.defaultEffort : "";
                    const labelParts = [m.name || model];
                    if (m.description) labelParts.push(m.description);
                    const label = labelParts.join(" — ");
                    const opt = og.createEl("option", {
                        value: provider + "::" + model + (effort ? "::" + effort : "")
                    });
                    opt.textContent = label;
                    // 大小写不敏感匹配当前模型，避免规范 id 与 current.model 大小写不一致时无法选中
                    if (current && current.provider === provider && (current.model || "").toLowerCase() === model.toLowerCase()) {
                        opt.selected = true;
                    }
                    flatCount++;
                }
            }
            // 自动纠正默认模型大小写：harness 给新会话的默认模型常是大写（如 DeepSeek-V4-Flash），
            // 但 LLM API 只接受小写规范 id（deepseek-v4-flash），不纠正会让每次 prompt 被 400 拒绝、新会话“不回复”。
            // 加载模型后静默把它纠正为规范 id；已正确则跳过（不会循环触发）。
            if (current && current.provider && current.model) {
                const g = groups.find((gg) => gg.id === current.provider || gg.provider === current.provider);
                const mm = g && Array.isArray(g.models) ? g.models.find((x) => (x.id || "").toLowerCase() === current.model.toLowerCase()) : null;
                const canonical = mm && mm.id;
                if (canonical && canonical !== current.model) {
                    // 记录纠正 promise，send() 会 await 它，避免用户极快发送时 prompt 抢在纠正之前、仍用错误模型
                    this._modelFixPromise = this.api.selectModel(this.sessionId, current.provider, canonical, current.reasoningEffort || undefined)
                        .then(() => { /* 纠正成功，后续 prompt 即用正确模型 */ })
                        .catch(() => { /* 忽略，下拉仍可手选 */ });
                } else {
                    this._modelFixPromise = null;
                }
            }
            if (flatCount === 0) {
                // 真没目录时给个提示，仍展示 current 让用户至少看到当前值
                const o = this.modelSelect.createEl("option", { value: "" });
                o.textContent = current
                    ? ((current.provider || "") + "/" + (current.model || "") + "（无目录）")
                    : "未发现模型目录";
                this.modelSelect.disabled = true;
            } else {
                this.modelSelect.disabled = false;
            }
        } catch (_e) {
            this.modelSelect.empty();
            const o = this.modelSelect.createEl("option", { value: "" });
            o.textContent = "模型加载失败";
            this.modelSelect.disabled = true;
        }
    }
    async switchModel(provider, model, effort) {
        if (!this.sessionId) return;
        try {
            await this.api.selectModel(this.sessionId, provider, model, effort);
            new Notice("已切换模型：" + provider + "/" + model);
        } catch (e) {
            new Notice("切换模型失败：" + (e && e.message ? e.message : String(e)));
            // 失败后回滚下拉（重拉）
            await this.loadModels();
        }
    }
    async loadPermissions() {
        if (!this.permSelect) return;
        try {
            const r = await this.api.getPermissionPreset();
            const presets = Array.isArray(r.presets) ? r.presets : [];
            const cur = r.value;
            this._permRevision = r.revision;
            this.permSelect.empty();
            if (presets.length === 0) {
                // 没枚举到选项：单值展示 + 不可切换
                const opt = this.permSelect.createEl("option", { value: cur || "" });
                opt.textContent = cur || "未配置";
                this.permSelect.disabled = true;
            } else {
                for (const p of presets) {
                    const opt = this.permSelect.createEl("option", { value: p.id });
                    opt.textContent = p.label || p.id;
                    if (p.id === cur) opt.selected = true;
                }
                this.permSelect.disabled = false;
            }
        } catch (_e) {
            this.permSelect.empty();
            const opt = this.permSelect.createEl("option", { value: "" });
            opt.textContent = "加载失败";
            this.permSelect.disabled = true;
        }
    }
    async switchPermission() {
        const target = this.permSelect.value;
        if (!target) return;
        try {
            await this.api.setPermissionPreset(target, this._permRevision);
            new Notice("已切换权限预设：" + target);
            // 写完后 DSH 会推 projection 更新当前值；不主动 reload，避免抢投影
        } catch (e) {
            new Notice("切换权限失败：" + (e && e.message ? e.message : String(e)));
            // 失败回滚：重拉
            await this.loadPermissions();
        }
    }

    clearConversation() {
        this._stopPoll();
        this._turnDone = true; // 切会话即终止上一个 turn 的轮询
        if (this.messagesEl) this.messagesEl.empty();
        if (this.statusLine) this.statusLine.setText("");
        this.assistantEl = null;
        this.assistantContent = null;
        this.assistantMd = "";
        this.thinkingMd = "";
        this._contentSetByWs = false;
    }

    setStatus(state) {
        if (!this.statusDot) return;
        this.statusDot.className = "dsh-status-dot " + (state === "online" ? "online" : state === "connecting" ? "connecting" : "offline");
    }

    /* ---------- 发送 ---------- */
    async send() {
        const text = (this.inputEl && this.inputEl.value || "").trim();
        if (!text) return;
        if (!this.sessionId) {
            new Notice("请先选择或新建一个会话");
            return;
        }
        this.lastUserText = text;
        this.inputEl.value = "";
        this.addUserBubble(text);
        // 重置 turn 生命周期标志，启动「轮询 history 兜底渲染」
        // —— 新建会话的 WS 事件不会被 mux 推送（无 session/subscribed），只能靠 REST history 拿回复
        this._turnDone = false;
        this._contentSetByWs = false;
        this._pollStart = Date.now();
        this.beginAssistantBubble();
        this.startTurnPoll();
        try {
            // 若加载会话时正在后台纠正默认模型大小写，先等它完成，避免 prompt 抢跑仍用错误模型
            if (this._modelFixPromise) {
                try { await this._modelFixPromise; } catch (_e) { /* 忽略，继续用原模型发送 */ }
                this._modelFixPromise = null;
            }
            // 当前 mode 从 settings 取（用户在底部段控件切换后已持久化）
            const curMode = (this.plugin && this.plugin.settings && this.plugin.settings.mode) || "queue";
            const resp = await this.api.prompt(this.sessionId, text, curMode);
            this.diagLastPrompt = "prompt:ok " + JSON.stringify(resp || {}).slice(0, 120);
            this.updateDiag();
        } catch (e) {
            const msg = e && e.message ? e.message : String(e);
            this.diagLastPrompt = "prompt:err " + msg.slice(0, 200);
            this.updateDiag();
            this.appendAssistant("*\n\n> ⚠️ 发送失败：" + msg + "\n");
            this.finalizeAssistant();
        }
    }

    addUserBubble(text) {
        const bubble = this.messagesEl.createDiv("dsh-msg dsh-msg-user");
        const content = bubble.createDiv("dsh-msg-content");
        MarkdownRenderer.render(this.app, text, content, "", this);
        this.scrollToBottom();
    }

    beginAssistantBubble() {
        // 幂等：send() 和 DSH turn/start 都会调用，重复建泡会留一个空 DSH 泡。先到的赢，后到的复用。
        if (this.assistantEl) return;
        this.assistantEl = this.messagesEl.createDiv("dsh-msg dsh-msg-assistant");
        const roleEl = this.assistantEl.createDiv("dsh-msg-role");
        roleEl.textContent = "DSH";
        this.assistantContent = this.assistantEl.createDiv("dsh-msg-content");
        // hover 操作条（复制 / 重试 / 分支）—— 对齐 VSCode DSH 每条消息的 hover 操作
        const bubble = this.assistantEl;
        const actions = bubble.createDiv("dsh-msg-actions");
        const copyBtn = actions.createEl("button", { cls: "dsh-mini-btn", attr: { title: "复制助手回答" } });
        copyBtn.textContent = "复制";
        copyBtn.addEventListener("click", () => {
            const txt = (bubble && bubble._md) || this.assistantMd || "";
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(txt).then(() => {
                    copyBtn.textContent = "已复制";
                    setTimeout(() => { copyBtn.textContent = "复制"; }, 1200);
                }).catch(() => {});
            }
        });
        const retryBtn = actions.createEl("button", { cls: "dsh-mini-btn", attr: { title: "重试：重发上一条用户消息" } });
        retryBtn.textContent = "重试";
        retryBtn.addEventListener("click", () => {
            const t = this.lastUserText;
            if (t) { this.inputEl.value = t; this.send(); }
        });
        const branchBtn = actions.createEl("button", { cls: "dsh-mini-btn", attr: { title: "分支：新会话并重发上一条" } });
        branchBtn.textContent = "分支";
        branchBtn.addEventListener("click", async () => {
            const t = this.lastUserText;
            await this.newSession();
            if (t) { this.inputEl.value = t; this.send(); }
        });
        this.assistantMd = "";
        this.thinkingMd = "";
    }

    appendAssistant(text, isThinking) {
        if (!this.assistantEl) this.beginAssistantBubble();
        if (isThinking) this.thinkingMd += text;
        else this.assistantMd += text;
        this.scheduleRender();
    }

    scheduleRender() {
        if (this.renderPending) return;
        this.renderPending = true;
        requestAnimationFrame(() => {
            this.renderPending = false;
            this.renderAssistantNow();
        });
    }

    // 把「思考 + 正文」渲染进指定 content 元素（实时气泡与历史气泡共用）
    async renderThinkingAndText(contentEl, text, thinking) {
        contentEl.empty();
        // 思考折叠（<details>），对齐 VSCode DSH 的 thinking 折叠
        if (thinking) {
            const det = contentEl.createEl("details", { cls: "dsh-thinking" });
            const sum = det.createEl("summary");
            sum.textContent = "💭 思考过程";
            const tw = det.createDiv("dsh-thinking-body");
            await MarkdownRenderer.render(this.app, thinking, tw, "", this);
            this.postProcessDshUi(tw);
        }
        const body = contentEl.createDiv("dsh-msg-md");
        await MarkdownRenderer.render(this.app, text || "", body, "", this);
        this.postProcessDshUi(body);
    }
    async renderAssistantNow() {
        if (!this.assistantContent) return;
        await this.renderThinkingAndText(this.assistantContent, this.assistantMd, this.thinkingMd);
        this.scrollToBottom();
    }
    // 历史会话里的单条助手回复（静态，不占用 this.assistantEl）
    renderStaticAssistant(text, thinking) {
        const bubble = this.messagesEl.createDiv("dsh-msg dsh-msg-assistant");
        bubble.createDiv("dsh-msg-role").textContent = "DSH";
        const content = bubble.createDiv("dsh-msg-content");
        this.renderThinkingAndText(content, text, thinking);
        this.scrollToBottom();
    }

    // 把 Obsidian 渲染后的 <pre><code class="language-dsh-ui"> 替换成 dsh-ui 富卡片
    postProcessDshUi(el) {
        if (!el || !el.querySelectorAll) return;
        el.querySelectorAll("pre").forEach((pre) => {
            const code = pre.querySelector("code");
            if (!code) return;
            const cls = (code.className || "") + " " + (code.getAttribute("data-language") || "") + " " + (code.getAttribute("lang") || "");
            const text = (code.textContent || "").trim();
            const isDshUi = /dsh-ui/i.test(cls);
            const looksLikeSpec = text.startsWith("{") && text.includes('"items"') && text.includes('"type"');
            if (!isDshUi && !looksLikeSpec) return;
            let spec;
            try { spec = JSON.parse(text); } catch (_e) { return; }
            if (!spec || typeof spec !== "object" || !Array.isArray(spec.items)) return;
            let html;
            try { html = dshUiRenderSpec(spec); } catch (_e) { return; }
            const wrap = document.createElement("div");
            wrap.innerHTML = html;
            try { pre.replaceWith(wrap); } catch (_e) {}
        });
    }

    finalizeAssistant() {
        this.renderAssistantNow();
        if (this.assistantEl) this.assistantEl._md = this.assistantMd || "";
        this.assistantEl = null;
        this.assistantContent = null;
        this.assistantMd = "";
        this.thinkingMd = "";
        this._turnDone = true;
        this._stopPoll();
    }

    _stopPoll() {
        if (this._pollTimer) {
            clearTimeout(this._pollTimer);
            this._pollTimer = null;
        }
    }

    // 从 history 事件里抽取「最新一个 turn」的正文与思考（含是否结束）
    extractLatestTurn(events) {
        if (!Array.isArray(events) || events.length === 0) return null;
        let startIdx = -1;
        for (let i = 0; i < events.length; i++) {
            const t = events[i].event && events[i].event.type;
            if (t === "turn/start") startIdx = i;
        }
        if (startIdx < 0) return null;
        let text = "";
        let thinking = "";
        let ended = false;
        for (let i = startIdx; i < events.length; i++) {
            const ev = events[i].event || {};
            if (ev.type === "turn/end") { ended = true; }
            else if (ev.type === "assistant/chunk") {
                const ch = ev.data && ev.data.chunk;
                if (!ch) continue;
                if (ch.type === "text-delta" && typeof ch.text === "string") text += ch.text;
                else if (ch.type === "reasoning-delta" && typeof ch.text === "string") thinking += ch.text;
            } else if (ev.type === "assistant/message") {
                // 退化：个别版本把整段回复放在 assistant/message
                const m = ev.data && (ev.data.message || ev.data.content || ev.data);
                const mt = typeof m === "string" ? m : (m && m.content);
                if (typeof mt === "string" && !text) text = mt;
            }
        }
        return { text, thinking, ended };
    }

    // 把最新 turn 的内容渲染进当前助手气泡（轮询兜底用，authoritative）
    renderAssistantFull(text, thinking) {
        if (!this.assistantEl) this.beginAssistantBubble();
        this.assistantMd = text || "";
        this.thinkingMd = thinking || "";
        this.renderAssistantNow();
    }

    // 发消息后启动轮询：新建会话的 WS 不推事件，只能靠 REST history 兜底渲染
    startTurnPoll() {
        this._stopPoll();
        const tick = async () => {
            if (this._turnDone) return;
            if (!this.sessionId) return;
            try {
                const h = await this.api.getHistory(this.sessionId);
                const events = (h && h.events) || (h && h.result && h.result.value && h.result.value.events) || [];
                const turn = this.extractLatestTurn(events);
                if (!turn) return;
                // history 比当前已渲染的更长才覆盖（避免把 WS 实时增量截断回落后的 history）
                const historyAhead =
                    turn.text.length > (this.assistantMd || "").length ||
                    turn.thinking.length > (this.thinkingMd || "").length;
                if (turn.ended) {
                    if (this._turnDone) return;
                    // 空 turn（warmup 占位）不算真正结束：继续轮询等真实回复，否则会漏掉后续正文
                    const hasContent = turn.text || turn.thinking;
                    if (!hasContent) return;
                    if (historyAhead) this.renderAssistantFull(turn.text, turn.thinking);
                    this.finalizeAssistant();
                    return;
                }
                // 未结束：history 领先时补齐（新建会话 WS 不推事件 / 仅思考漏正文等场景）
                if (historyAhead) {
                    this.renderAssistantFull(turn.text, turn.thinking);
                }
            } catch (_e) {
                /* 轮询失败不影响 WS 实时路径 */
            } finally {
                if (!this._turnDone && Date.now() - this._pollStart < 120000) {
                    this._pollTimer = setTimeout(tick, 700);
                } else if (!this._turnDone) {
                    // 超过 120s 仍未结束（DSH 卡住）：强制收尾，避免永久空白气泡
                    this.finalizeAssistant();
                }
            }
        };
        tick();
    }

    // 渲染某会话的历史对话（切到该会话时调用，对齐 VSCode/Claudian）
    async loadHistory(id) {
        if (!this.messagesEl) return;
        try {
            const h = await this.api.getHistory(id);
            const events = (h && h.events) || (h && h.result && h.result.value && h.result.value.events) || [];
            // 按时间顺序收集 user / assistant(turn) 条目，只渲染最近若干条避免卡顿
            const items = [];
            let buf = null;
            for (const e of events) {
                const ev = e.event || {};
                if (ev.type === "user/message") {
                    items.push({ role: "user", ev });
                } else if (ev.type === "turn/start") {
                    buf = { text: "", thinking: "" };
                } else if (ev.type === "assistant/chunk" && buf) {
                    const ch = ev.data && ev.data.chunk;
                    if (!ch) continue;
                    if (ch.type === "text-delta" && typeof ch.text === "string") buf.text += ch.text;
                    else if (ch.type === "reasoning-delta" && typeof ch.text === "string") buf.thinking += ch.text;
                } else if (ev.type === "assistant/message" && buf && !buf.text) {
                    const m = ev.data && (ev.data.message || ev.data.content || ev.data);
                    const mt = typeof m === "string" ? m : (m && m.content);
                    if (typeof mt === "string") buf.text = mt;
                } else if (ev.type === "turn/end" && buf) {
                    items.push({ role: "assistant", text: buf.text, thinking: buf.thinking });
                    buf = null;
                }
            }
            if (buf) items.push({ role: "assistant", text: buf.text, thinking: buf.thinking });
            const recent = items.slice(-24);
            for (const it of recent) {
                if (it.role === "user") this.addUserBubbleFromEvent(it.ev);
                else this.renderStaticAssistant(it.text, it.thinking);
            }
            this.scrollToBottom();
        } catch (_e) {
            /* 历史加载失败不阻塞 */
        }
    }

    addUserBubbleFromEvent(ev) {
        let text = "";
        const d = ev.data || ev;
        if (typeof d.text === "string") text = d.text;
        else if (Array.isArray(d.content)) text = d.content.map((c) => (c && c.text) || "").join("");
        else if (typeof d.content === "string") text = d.content;
        if (text) this.addUserBubble(text);
    }

    scrollToBottom() {
        if (this.messagesEl) this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    /* ---------- WebSocket 事件流（订阅 plugin 主进程手写 WS 客户端，规避 Chromium 全局 WS 的 Origin 拦截） ---------- */
    connectWs() {
        // 主进程已经在 plugin onload 里建好 WS；view 只是订阅
        // 先取消旧订阅（idempotent）
        this.plugin.wsUnsubscribe(this._frameHandler);
        this.plugin.wsStatusUnsubscribe(this._statusHandler);

        this._frameHandler = (frame) => {
            // 计数 + 诊断
            const ft = frame?.payload?.type;
            if (ft) {
                this.diagLastFrameTypes = (this.diagLastFrameTypes || []);
                this.diagLastFrameTypes.push(ft);
                if (this.diagLastFrameTypes.length > 6) this.diagLastFrameTypes.shift();
            }
            if (ft === "assistant/chunk") this.diagChunkCount = (this.diagChunkCount || 0) + 1;
            this.handleFrame(frame);
        };
        this._statusHandler = () => {
            const s = this.plugin.getWsStatus();
            this.wsConnected = s.connected;
            this.diagReconnectCount = s.reconnectCount;
            this.diagFrameCount = s.frameCount;
            this.diagChunkCount = s.chunkCount;
            this.diagLastFrameTypes = s.lastFrameTypes;
            if (s.connected) {
                this.setStatus("online");
                this.updateDiag();
            } else {
                this.setStatus("offline");
                this.updateDiag(s.closeReason || "ws:off");
            }
        };
        this.plugin.wsSubscribe(this._frameHandler);
        this.plugin.wsStatusSubscribe(this._statusHandler);
        // 立即拉一次当前状态（plugin 可能在 view 打开前就已连上/断了）
        this._statusHandler();
    }

    updateDiag(note) {
        if (!this.statusLine) return;
        const parts = [];
        parts.push(this.wsConnected ? "ws:on" : "ws:off");
        // 构建指纹：明确告诉用户"plugin 加载到的是哪版 main.js"
        const build = (this.plugin && this.plugin._buildTag) ? this.plugin._buildTag.split("-")[2] : "?";
        parts.push("build:" + build);
        if (this.diagReconnectCount) parts.push("re:" + this.diagReconnectCount);
        if (this.diagFrameCount) parts.push("frames:" + this.diagFrameCount);
        if (this.diagChunkCount) parts.push("chunks:" + this.diagChunkCount);
        if (this.diagLastFrameTypes && this.diagLastFrameTypes.length) parts.push("last:" + this.diagLastFrameTypes.join("/"));
        if (this.diagTokens) parts.push("·" + this.diagTokens);
        if (this.diagLastPrompt) parts.push("·" + this.diagLastPrompt);
        // note 只承载"瞬时信号"（close code / reason / ws:err 等），不重复写 ws:on/off
        if (note && !parts.includes(note)) parts.push("·" + note);
        this.statusLine.setText(parts.join("  "));
    }

    closeWs() {
        if (this._frameHandler) this.plugin.wsUnsubscribe(this._frameHandler);
        if (this._statusHandler) this.plugin.wsStatusUnsubscribe(this._statusHandler);
        this._frameHandler = null;
        this._statusHandler = null;
        this.wsConnected = false;
    }

    handleFrame(frame) {
        const payload = frame.payload;
        if (!payload) return;
        const sessionId = payload.sessionId;
        // 只处理当前会话（WS 会广播所有会话）
        if (sessionId && this.sessionId && sessionId !== this.sessionId) return;

        switch (payload.type) {
            case "session/event":
                this.handleSessionEvent(payload.event);
                break;
            case "session/projection":
                this.handleProjection(payload);
                break;
            case "approval/requested":
                this.handleApproval(payload, frame.rpcId);
                break;
            case "approval/resolved":
                this.clearPending("a:" + payload.approvalId);
                break;
            case "question/requested":
                this.handleQuestion(payload, frame.rpcId);
                break;
            case "question/resolved":
                this.clearPending("q:" + payload.questionRpcId);
                break;
            default:
                break;
        }
    }

    handleSessionEvent(ev) {
        if (!ev) return;
        switch (ev.type) {
            case "turn/start":
                this.beginAssistantBubble();
                break;
            case "assistant/chunk": {
                const chunk = ev.data && ev.data.chunk;
                if (!chunk) break;
                this.diagChunkCount = (this.diagChunkCount || 0) + 1;
                // 跳过纯元数据 chunk
                if (
                    chunk.type === "usage" ||
                    chunk.type === "finish" ||
                    chunk.type === "tool-call-delta" ||
                    chunk.type === "block-start" ||
                    chunk.type === "block-end"
                ) {
                    break;
                }
                // 真实文字 delta：text-delta (普通文字) / reasoning-delta (思考文字)
                if (chunk.type === "text-delta" || chunk.type === "reasoning-delta") {
                    if (typeof chunk.text !== "string" || chunk.text.length === 0) break;
                    this._contentSetByWs = true; // 标记 WS 实时增量已到（轮询会因历史变化自动对齐，这里仅是语义标记）
                    this.appendAssistant(chunk.text, chunk.type === "reasoning-delta");
                }
                break;
            }
            case "assistant/message": {
                // 兜底：若后续 chunk 含有完整消息体且流式未渲染，再用它覆盖（这里保守起见不动 UI）
                break;
            }
            case "turn/end":
                this.finalizeAssistant();
                break;
            default:
                break;
        }
    }

    handleProjection(p) {
        if (p.key === "tokenUsage" || p.key === "liveTokenUsage") {
            const v = p.value || {};
            const parts = [];
            if (v.outputTokens != null) parts.push(`out ${v.outputTokens}`);
            if (v.uncachedInputTokens != null) parts.push(`in ${v.uncachedInputTokens}`);
            if (v.cacheReadTokens != null) parts.push(`cache ${v.cacheReadTokens}`);
            this.diagTokens = parts.join("  ·  ");
            this.updateDiag();
        } else if (p.key === "title" && this.sessionId) {
            // 更新当前会话标题
            const s = this.sessions.find((x) => x.sessionId === this.sessionId);
            if (s && typeof p.value === "string" && p.value) {
                s.title = p.value;
                this.renderTabs();
            }
        } else if (p.key === "permissions") {
            // 实时更新当前权限值（投影通道），并刷新 revision 以便下次写入不冲突
            if (!this.permSelect) return;
            const v = p.value;
            let cur = null;
            if (typeof v === "string") cur = v;
            else if (v && typeof v === "object") {
                cur = v.currentPreset || v.currentValue || v.preset || v.value || v.name || null;
            }
            // 先看现有 option 里有没有；没有则临时塞一个
            if (cur) {
                let exists = false;
                for (const opt of Array.from(this.permSelect.options)) {
                    if (opt.value === cur) { opt.selected = true; exists = true; break; }
                }
                if (!exists) {
                    const opt = this.permSelect.createEl("option", { value: cur });
                    opt.textContent = cur;
                    opt.selected = true;
                    this.permSelect.disabled = false;
                }
            }
            // revision 同步过来（projection 也带 revision）
            if (typeof p.seq === "number") this._permRevision = p.seq;
            if (typeof p.revision === "number") this._permRevision = p.revision;
        }
    }

    /* ---------- 审批 / 提问 ---------- */
    handleApproval(payload, rpcIdValue) {
        const key = "a:" + payload.approvalId;
        // 把除已知字段外的额外信息（path / command / args 等）挑出来展示（对齐 Claudian 审批卡）
        const known = new Set(["approvalId", "toolName", "reason", "rpcId"]);
        const extra = {};
        for (const k of Object.keys(payload || {})) {
            if (!known.has(k) && payload[k] != null) {
                const v = payload[k];
                extra[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
            }
        }
        this.pending.set(key, { kind: "approval", rpcId: rpcIdValue, toolName: payload.toolName, reason: payload.reason, extra });
        this.renderPendingCards();
    }

    handleQuestion(payload, rpcIdValue) {
        const key = "q:" + rpcIdValue;
        this.pending.set(key, { kind: "question", rpcId: rpcIdValue, questions: payload.questions });
        this.renderPendingCards();
    }

    clearPending(key) {
        if (this.pending.delete(key)) this.renderPendingCards();
    }

    renderPendingCards() {
        // 移除旧卡片
        this.messagesEl.querySelectorAll(".dsh-pending").forEach((n) => n.remove());
        for (const [key, entry] of this.pending) {
            const card = this.messagesEl.createDiv("dsh-msg dsh-pending");
            if (entry.kind === "approval") {
                const titleEl = card.createDiv("dsh-pending-title");
                titleEl.textContent = "🔐 需要审批：" + (entry.toolName || "");
                if (entry.reason) {
                    const reasonEl = card.createDiv("dsh-pending-reason");
                    reasonEl.textContent = entry.reason;
                }
                if (entry.extra && Object.keys(entry.extra).length) {
                    const kv = card.createDiv("dsh-pending-extra");
                    for (const [k, v] of Object.entries(entry.extra)) {
                        const row = kv.createDiv("dsh-pending-kv");
                        const kk = row.createSpan("dsh-pending-k");
                        kk.textContent = k;
                        const vv = row.createSpan("dsh-pending-v");
                        vv.textContent = v;
                    }
                }
                const actions = card.createDiv("dsh-pending-actions");
                const allowBtn = actions.createEl("button", { cls: "dsh-btn mod-cta" });
                allowBtn.textContent = "允许";
                allowBtn.addEventListener("click", () => {
                    this.answerApproval(key, "allowed");
                });
                const denyBtn = actions.createEl("button", { cls: "dsh-btn" });
                denyBtn.textContent = "拒绝";
                denyBtn.addEventListener("click", () => {
                    this.answerApproval(key, "rejected");
                });
            } else {
                const qTitleEl = card.createDiv("dsh-pending-title");
                qTitleEl.textContent = "❓ DSH 提问";
                const questions = (entry.questions || []).map((q) => (typeof q === "string" ? q : q.label || q.question || JSON.stringify(q)));
                const input = card.createEl("textarea", { cls: "dsh-native-input", placeholder: questions.join("\n") });
                const actions = card.createDiv("dsh-pending-actions");
                const ansBtn = actions.createEl("button", { cls: "dsh-btn mod-cta" });
                ansBtn.textContent = "回答";
                ansBtn.addEventListener("click", () => {
                    this.answerQuestion(key, input.value);
                });
            }
            this.scrollToBottom();
        }
    }

    async answerApproval(key, outcome) {
        const entry = this.pending.get(key);
        if (!entry) return;
        const approvalId = key.slice(2);
        try {
            await this.api.respond(entry.rpcId, {
                sessionId: this.sessionId,
                approvalId,
                outcome,
            });
        } catch (e) {
            new Notice("审批回复失败：" + e.message);
        }
        this.clearPending(key);
    }

    async answerQuestion(key, text) {
        const entry = this.pending.get(key);
        if (!entry) return;
        const answers = (entry.questions || []).map(() => text);
        try {
            await this.api.respond(entry.rpcId, {
                sessionId: this.sessionId,
                answer: { answers },
            });
        } catch (e) {
            new Notice("回答失败：" + e.message);
        }
        this.clearPending(key);
    }
}

/* ====================================================================
 * 历史会话浏览器（Modal）
 * ================================================================== */
class HistoryModal extends Modal {
    constructor(app, view) {
        super(app);
        this.view = view;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("dsh-history-modal");
        const head = contentEl.createDiv("dsh-history-head");
        head.setText("历史会话");
        const search = contentEl.createEl("input", {
            cls: "dsh-history-search",
            attr: { placeholder: "搜索会话名 / ID…", type: "text" },
        });
        const list = contentEl.createDiv("dsh-history-list");
        const render = (q) => {
            list.empty();
            const all = this.view.sessions || [];
            const ql = (q || "").trim().toLowerCase();
            const filtered = all.filter((s) => {
                if (!ql) return true;
                const t = (s.title || "") + " " + (s.sessionId || "");
                return t.toLowerCase().includes(ql);
            });
            if (filtered.length === 0) {
                list.createDiv("dsh-history-empty").setText("无匹配会话");
                return;
            }
            for (const s of filtered) {
                const row = list.createDiv("dsh-history-row");
                const name = row.createDiv("dsh-history-name");
                name.setText(this.view._tabTitle(s));
                const meta = row.createDiv("dsh-history-meta");
                meta.setText(s.sessionId);
                if (s.sessionId === this.view.sessionId) row.addClass("is-current");
                row.addEventListener("click", () => {
                    this.view.openSessionAsTab(s.sessionId);
                    this.close();
                });
            }
        };
        search.addEventListener("input", () => render(search.value));
        // 自动聚焦搜索框
        setTimeout(() => { try { search.focus(); } catch (_e) {} }, 30);
        render("");
    }
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

/* ====================================================================
 * 设置页
 * ================================================================== */
class DshNativeSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        const buildTag = (this.plugin && this.plugin._buildTag) || "?";
        new Setting(containerEl)
            .setName("插件版本")
            .setDesc("当前加载的 main.js 构建标识（反馈问题时对照用）。")
            .addText((t) => t.setValue(buildTag).setDisabled(true));
        new Setting(containerEl)
            .setName("插件作者")
            .setDesc("本插件的作者。")
            .addText((t) => t.setValue("wupang").setDisabled(true));
        new Setting(containerEl).setName("服务端口").setDesc("DSH Web 服务端口，默认 3080。").addText((t) =>
            t.setPlaceholder("3080").setValue(String(this.plugin.settings.port)).onChange(async (v) => {
                const n = parseInt(v, 10);
                if (!isNaN(n)) {
                    this.plugin.settings.port = n;
                    await this.plugin.saveSettings();
                }
            })
        );
        new Setting(containerEl).setName("启动命令").setDesc("启动 dsh web 的命令，{port} 自动替换。必须以 vault 为 cwd 启动（见 CLAUDE.md）。").addText((t) =>
            t.setPlaceholder('node "..."\\bin.js web --port {port}').setValue(this.plugin.settings.startupCommand).onChange(async (v) => {
                this.plugin.settings.startupCommand = v;
                await this.plugin.saveSettings();
            })
        );
        new Setting(containerEl).setName("自动启动").setDesc("打开面板时若端口无服务，自动运行启动命令。").addToggle((t) =>
            t.setValue(this.plugin.settings.autoStart).onChange(async (v) => {
                this.plugin.settings.autoStart = v;
                await this.plugin.saveSettings();
            })
        );
        new Setting(containerEl).setName("Vault 路径").setDesc("DSH 工作区绑定的文件夹；留空则用当前 vault 根目录。").addText((t) =>
            t.setPlaceholder(this.plugin.app.vault.adapter.basePath).setValue(this.plugin.settings.vaultPath).onChange(async (v) => {
                this.plugin.settings.vaultPath = v.trim();
                await this.plugin.saveSettings();
            })
        );

        // ===== DSH 安装状态 =====
        const os = require("os");
        const path = require("path");
        const defaultInstallDir = this.plugin.settings.installDir || path.join(os.homedir(), "deepseek-harness");
        new Setting(containerEl)
            .setName("DSH 安装状态")
            .setDesc("检查 DSH（@deepseek-ai/dsh）是否已安装；未安装时可一键克隆 + install。")
            .addButton((b) => b.setButtonText("重新检测").onClick(async () => {
                this._dshStatusEl.setText("检测中…");
                const r = detectDsh();
                this._dshStatus(r, defaultInstallDir);
            }))
            .addButton((b) => b.setButtonText("一键安装").onClick(async () => {
                const target = this.plugin.settings.installDir || path.join(os.homedir(), "deepseek-harness");
                this._dshStatusEl.setText("开始安装到 " + target + " …");
                new Notice("DSH 克隆开始（首次较慢，可能 1-5 分钟）", 0);
                const result = await installDsh(target, ({ phase, stream, text }) => {
                    if (phase) this._dshStatusEl.setText(phase);
                    else if (text && stream === "stderr") {
                        // git/pnpm 进度只取末尾几行，避免 statusEl 刷屏
                        const tail = text.trim().split("\n").slice(-1)[0].slice(0, 80);
                        if (tail) this._dshStatusEl.setText("… " + tail);
                    }
                }, this.plugin.settings.installUrl);
                this._dshStatusEl.setText(result.message);
                if (result.ok) {
                    new Notice("DSH 安装完成 ✓", 5000);
                    // 把配置自动填上
                    this.plugin.settings.startupCommand = "pnpm dsh web --port {port}";
                    this.plugin.settings.installDir = result.dir || target;
                    await this.plugin.saveSettings();
                    // 重新刷一下展示
                    this.display();
                } else {
                    new Notice("安装失败：" + result.message, 10000);
                }
            }));
        // 安装目标目录
        new Setting(containerEl)
            .setName("安装目标目录")
            .setDesc("一键安装克隆到此目录。留空用 ~/deepseek-harness。")
            .addText((t) =>
                t.setPlaceholder(defaultInstallDir).setValue(this.plugin.settings.installDir).onChange(async (v) => {
                    this.plugin.settings.installDir = v.trim();
                    await this.plugin.saveSettings();
                })
            );
        // 状态行
        const statusRow = new Setting(containerEl).setName("状态").setDesc("");
        this._dshStatusEl = statusRow.descEl;
        this._dshStatusEl.style.fontFamily = "var(--font-monospace,monospace)";
        // 首次进入页面就跑一次
        const r = detectDsh();
        this._dshStatus(r, defaultInstallDir);

        // ===== 收发模式（mode）=====
        new Setting(containerEl)
            .setName("发送模式")
            .setDesc("session.prompt 的 mode：queue（追加排队）/ steer（打断当前轮，DSH 决定是插入还是转下一条）。")
            .addDropdown((d) =>
                d
                    .addOption("queue", "queue（默认，追加排队）")
                    .addOption("steer", "steer（打断/插队）")
                    .setValue(this.plugin.settings.mode || "queue")
                    .onChange(async (v) => {
                        this.plugin.settings.mode = v;
                        await this.plugin.saveSettings();
                    })
            );

        // ===== 快捷操作 =====
        new Setting(containerEl).setName("在浏览器打开 DSH").setDesc("用系统默认浏览器打开 DSH Web GUI（独立窗口，不受侧栏面板限制）。").addButton((b) =>
            b.setButtonText("打开").onClick(() => this.plugin.openDshInBrowser())
        );
        new Setting(containerEl).setName("重启 DSH 服务").setDesc("结束占用端口的进程并重新启动；用于加载配置改动或面板卡住。").addButton((b) =>
            b.setButtonText("重启").onClick(async () => {
                b.setDisabled(true);
                await this.plugin.restartService();
                b.setDisabled(false);
            })
        );
        new Setting(containerEl).setName("一键检测并填入").setDesc("已安装 DSH 时，自动检测位置并填好启动命令 / 工作目录 / 安装目录。").addButton((b) =>
            b.setButtonText("检测并填入").onClick(async () => {
                b.setDisabled(true);
                const r = detectDsh();
                if (r.found) {
                    this.plugin.settings.startupCommand = r.startupCommand;
                    if (r.startupCwd) this.plugin.settings.vaultPath = r.startupCwd;
                    if (r.dir) this.plugin.settings.installDir = r.dir;
                    await this.plugin.saveSettings();
                    new Notice("已自动填入：" + r.message);
                    this.display();
                } else {
                    new Notice(r.message);
                }
                b.setDisabled(false);
            })
        );

        // ===== 收发 =====
        new Setting(containerEl).setName("框选发送按钮").setDesc("在编辑器框选文字后，选区旁显示「发送到 DSH」浮动按钮（命令面板与右键菜单始终可用）。").addToggle((t) =>
            t.setValue(this.plugin.settings.selectionButton).onChange(async (v) => {
                this.plugin.settings.selectionButton = v;
                await this.plugin.saveSettings();
                if (!v) this.plugin.hideSelectionButton();
            })
        );
        new Setting(containerEl).setName("发送后自动打开面板").setDesc("从笔记发送文字到 DSH 后，自动打开/聚焦 DSH 面板查看回复。").addToggle((t) =>
            t.setValue(this.plugin.settings.openPanelOnSend).onChange(async (v) => {
                this.plugin.settings.openPanelOnSend = v;
                await this.plugin.saveSettings();
            })
        );

        // ===== 高级 =====
        new Setting(containerEl).setName("启动等待时间").setDesc("自动启动后等待服务就绪的最长时间（当前 " + Math.round(this.plugin.settings.readyTimeoutMs / 1000) + " 秒）；首次启动可能需 1–2 分钟。").addSlider((s) =>
            s.setLimits(60, 600, 30).setValue(Math.round(this.plugin.settings.readyTimeoutMs / 1000)).onChange(async (v) => {
                this.plugin.settings.readyTimeoutMs = v * 1000;
                await this.plugin.saveSettings();
                this.plugin.serviceManager.opts = this.plugin.getServiceOpts();
            })
        );
        new Setting(containerEl).setName("进程独立常驻").setDesc("开启后，插件启动的 DSH 进程在 Obsidian 退出后继续运行（默认关：随 Obsidian 退出而终止）。").addToggle((t) =>
            t.setValue(this.plugin.settings.detached).onChange(async (v) => {
                this.plugin.settings.detached = v;
                await this.plugin.saveSettings();
                this.plugin.serviceManager.opts = this.plugin.getServiceOpts();
            })
        );
        new Setting(containerEl).setName("安装地址").setDesc("克隆 DSH 的仓库地址；国内网络受限时可换代理镜像（如 https://gh-proxy.com/https://github.com/deepseek-ai/deepseek-harness.git）。").addText((t) =>
            t.setPlaceholder(DEFAULT_DSH_REPO_URL).setValue(this.plugin.settings.installUrl).onChange(async (v) => {
                this.plugin.settings.installUrl = v.trim() || DEFAULT_DSH_REPO_URL;
                await this.plugin.saveSettings();
            })
        );
    }
    _dshStatus(r, defaultInstallDir) {
        if (!this._dshStatusEl) return;
        if (r.found) {
            this._dshStatusEl.setText(
                "✓ 已找到 (" + r.kind + ")：" + (r.dir || "PATH") +
                "\n启动命令：" + r.startupCommand +
                (r.startupCwd ? "\ncwd：" + r.startupCwd : "")
            );
        } else {
            this._dshStatusEl.setText(
                "✗ " + r.message +
                "\n点击上方「一键安装」将克隆到：" + defaultInstallDir
            );
        }
    }
}

/* ====================================================================
 * 插件主类
 * ================================================================== */
class DshNativePlugin extends Plugin {
    async onload() {
        await this.loadSettings();
        this.api = new DshApi(`http://127.0.0.1:${this.settings.port}`);
        this.serviceManager = new ServiceManager(this.getServiceOpts());

        // === 版本指纹（用于诊断"Obsidian 是否加载到新版 main.js"） ===
        const BUILD_TAG = "dsh-native-v0.1.8-cleanup-diag-" + new Date().toISOString();
        console.log("[dsh-native] BUILD_TAG =", BUILD_TAG);
        try {
            require("fs").writeFileSync(
                require("path").join(this.app.vault.adapter.basePath, ".obsidian", "plugins", this.manifest.id, "last_loaded.txt"),
                BUILD_TAG + "\n",
                "utf8"
            );
        } catch (e) { /* ignore */ }
        this._buildTag = BUILD_TAG;

        // ===== WebSocket 事件流状态 + 订阅（主进程级手写 WS 客户端，规避 Chromium 全局 WS 的 Origin 信任拦截） =====
        this.wsConnected = false;
        this.wsFrameCount = 0;
        this.wsChunkCount = 0;
        this.wsReconnectCount = 0;
        this.wsLastFrameTypes = []; // 最近若干帧的 payload.type
        this.wsCloseReason = null; // 最近一次 close 的 code/reason
        this.eventSubs = new Set(); // 收到每条帧时回调
        this.statusSubs = new Set(); // ws 状态变化时回调（立即拿到 getWsStatus）
        this._wsReconnectTimer = null;
        this.ws = null;
        // 启动 WS 桥接（独立于 view 是否打开；view 打开时再通过 wsSubscribe 订阅）
        this.connectDshWs();

        this.registerView(VIEW_TYPE, (leaf) => new DshNativeView(leaf, this));

        this.addRibbonIcon("bot", "打开 DeepSeek Harness", () => this.activateView());
        this.addCommand({ id: "open-panel", name: "打开面板", callback: () => this.activateView() });
        this.addCommand({ id: "restart-service", name: "重启 DSH 服务", callback: () => this.restartService() });
        this.addCommand({
            id: "open-in-browser",
            name: "在浏览器打开 DSH",
            callback: () => require("electron").shell.openExternal(`http://127.0.0.1:${this.settings.port}/`),
        });
        this.addCommand({
            id: "send-note-to-dsh",
            name: "发送当前笔记到 DSH",
            callback: () => this.sendCurrentNote(),
        });

        this.addSettingTab(new DshNativeSettingTab(this.app, this));

        // 框选浮动发送按钮：Obsidian 无选区工作区事件，由文档级 mouseup/keyup/selectionchange 驱动
        const onSel = () => this.onSelectionEvent(true);
        this.registerDomEvent(document, "mouseup", onSel);
        this.registerDomEvent(document, "keyup", onSel);
        this.registerDomEvent(document, "selectionchange", () => this.onSelectionEvent(false));
    }

    onunload() {
        this.closeDshWs();
        this.serviceManager.dispose();
    }

    /* ========== WebSocket 事件流桥接（主进程级，手写 WS 客户端） ==========
     * DSH 的 /api/events.mux 是 WebSocket upgrade 端点（普通 GET 返回 426）。
     * 不能用全局 `new WebSocket()`：Obsidian/Chromium 的 WebSocket 自动带页面
     * Origin 头，与 Host 127.0.0.1:3080 不匹配，被 DSH 的 isTrustedApiRequest
     * 信任检查拒绝（403 → 客户端看到 1006）。
     * 这里用 Node 内置 http/crypto 手写 WS 客户端：握手时不带 Origin（或带匹配的
     * Origin），通过信任检查；再自行解析 WS 帧（服务端帧未 mask、单文本帧）。
     * 帧解析与重连自控，view 层订阅接口不变。
     * ================================================= */
    connectDshWs() {
        this.closeDshWs();
        const port = this.settings.port;
        const path = "/api/events.mux";
        const key = crypto.randomBytes(16).toString("base64");
        this._wsBuf = Buffer.alloc(0);
        const req = http.request({
            host: "127.0.0.1",
            port,
            path,
            headers: {
                Connection: "Upgrade",
                Upgrade: "websocket",
                "Sec-WebSocket-Key": key,
                "Sec-WebSocket-Version": "13",
                Host: `127.0.0.1:${port}`,
                // 故意不带 Origin —— 规避 DSH isTrustedApiRequest 的 origin 检查（根因）
            },
        });
        req.on("upgrade", (res, socket, head) => {
            this.wsConnected = true;
            this.wsCloseReason = null;
            this.ws = { req, socket };
            console.log("[dsh-native] WS open:", `ws://127.0.0.1:${port}${path}`);
            this.notifyStatusSubs();
            this._wsBuf = Buffer.concat([this._wsBuf, Buffer.from(head || [])]);
            socket.on("data", (chunk) => this.onWsData(chunk));
            socket.on("close", () => this.onWsDown("ws:close"));
            socket.on("error", () => this.onWsDown("ws:err"));
        });
        req.on("response", (res) => {
            // 非 101（如 403/426）——握手被信任检查拒绝
            console.error("[dsh-native] WS 握手失败:", res.statusCode);
            this.wsCloseReason = `hs:${res.statusCode}`;
            this.notifyStatusSubs();
            res.resume();
            req.destroy();
            this.scheduleDshWsReconnect();
        });
        req.on("error", (e) => {
            console.error("[dsh-native] WS request error:", e && e.message);
            this.wsConnected = false;
            this.wsCloseReason = "ws:reqerr";
            this.notifyStatusSubs();
            this.scheduleDshWsReconnect();
        });
        req.end();
    }

    /** 累积并解析 WS 帧：服务端帧未 mask、单文本帧（opcode 0x1）。 */
    onWsData(chunk) {
        this._wsBuf = Buffer.concat([this._wsBuf, chunk]);
        let buf = this._wsBuf;
        while (buf.length >= 2) {
            const b0 = buf[0];
            const b1 = buf[1];
            const opcode = b0 & 0x0f;
            const masked = (b1 & 0x80) !== 0;
            let len = b1 & 0x7f;
            let offset = 2;
            if (len === 126) {
                if (buf.length < 4) break;
                len = buf.readUInt16BE(2);
                offset = 4;
            } else if (len === 127) {
                if (buf.length < 10) break;
                len = buf.readUInt32BE(6); // 帧很小，取低 32 位足够
                offset = 10;
            }
            if (buf.length < offset + len) break; // 等更多数据
            const payload = buf.slice(offset, offset + len);
            buf = buf.slice(offset + len);
            if (opcode === 0x1 || opcode === 0x2) {
                this.deliverWsFrame(payload); // text / binary：DSH 发的是文本 envelope
            } else if (opcode === 0x8) {
                this.onWsDown("ws:close-frame");
                return;
            } else if (opcode === 0x9) {
                this.wsSend(0xa, payload); // ping → 回 pong（echo payload）
            }
            // 0x0 continuation：DSH 单帧发送，忽略
        }
        this._wsBuf = buf;
    }

    /** 解析 envelope 并喂给订阅（逻辑同原 message 回调）。 */
    deliverWsFrame(payload) {
        let frame;
        try {
            frame = JSON.parse(payload.toString("utf8"));
        } catch (e) {
            console.warn("[dsh-native] WS frame parse error:", e, payload.slice(0, 100).toString());
            return;
        }
        this.wsFrameCount++;
        const ft = frame?.payload?.type;
        if (ft) {
            this.wsLastFrameTypes.push(ft);
            if (this.wsLastFrameTypes.length > 6) this.wsLastFrameTypes.shift();
            if (ft === "assistant/chunk") this.wsChunkCount++;
        }
        this.notifyStatusSubs();
        for (const cb of this.eventSubs) {
            try {
                cb(frame);
            } catch (e) {
                console.error("[dsh-native] event sub cb err:", e);
            }
        }
    }

    /** 客户端→服务端发送（必须 mask，RFC 6455）。 */
    wsSend(opcode, data) {
        if (!this.ws || !this.ws.socket) return;
        const sock = this.ws.socket;
        const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
        const len = payload.length;
        let header;
        if (len < 126) {
            header = Buffer.from([0x80 | opcode, 0x80 | len]);
        } else if (len < 65536) {
            header = Buffer.alloc(4);
            header[0] = 0x80 | opcode;
            header[1] = 0x80 | 126;
            header.writeUInt16BE(len, 2);
        } else {
            header = Buffer.alloc(10);
            header[0] = 0x80 | opcode;
            header[1] = 0x80 | 127;
            header.writeUInt32BE(0, 2);
            header.writeUInt32BE(len, 6);
        }
        const mask = crypto.randomBytes(4);
        const masked = Buffer.alloc(len);
        for (let i = 0; i < len; i++) masked[i] = payload[i] ^ mask[i & 3];
        try {
            sock.write(Buffer.concat([header, mask, masked]));
        } catch (_) { /* ignore */ }
    }

    /** WS 通道断开的统一处理：置状态 + 重连（已是关闭态则跳过，避免重复重连）。 */
    onWsDown(reason) {
        if (this.ws === null) return;
        this.wsConnected = false;
        this.ws = null;
        this.wsCloseReason = reason;
        console.warn("[dsh-native] WS down:", reason);
        this.notifyStatusSubs();
        this.scheduleDshWsReconnect();
    }

    closeDshWs() {
        if (this._wsReconnectTimer) {
            clearTimeout(this._wsReconnectTimer);
            this._wsReconnectTimer = null;
        }
        if (this.ws) {
            try {
                this.wsSend(0x8, Buffer.alloc(0)); // 发 close 帧
            } catch (_) { /* ignore */ }
            try {
                if (this.ws.socket) this.ws.socket.destroy();
                if (this.ws.req) this.ws.req.destroy();
            } catch (_) { /* ignore */ }
            this.ws = null;
        }
        this.wsConnected = false;
    }

    scheduleDshWsReconnect() {
        if (this._wsReconnectTimer) return;
        this.wsReconnectCount++;
        this._wsReconnectTimer = setTimeout(() => {
            this._wsReconnectTimer = null;
            if (!this.ws) this.connectDshWs();
        }, 3000);
    }

    wsSubscribe(cb) { this.eventSubs.add(cb); }
    wsUnsubscribe(cb) { this.eventSubs.delete(cb); }
    wsStatusSubscribe(cb) { this.statusSubs.add(cb); }
    wsStatusUnsubscribe(cb) { this.statusSubs.delete(cb); }
    notifyStatusSubs() {
        for (const cb of this.statusSubs) {
            try { cb(); } catch (e) { console.error("[dsh-native] status sub err:", e); }
        }
    }
    getWsStatus() {
        return {
            connected: this.wsConnected,
            reconnectCount: this.wsReconnectCount,
            frameCount: this.wsFrameCount,
            chunkCount: this.wsChunkCount,
            lastFrameTypes: this.wsLastFrameTypes.slice(),
            closeReason: this.wsCloseReason,
        };
    }

    getVaultPath() {
        return this.settings.vaultPath || this.app.vault.adapter.basePath;
    }

    getServiceOpts() {
        return {
            port: this.settings.port,
            startupCommand: this.settings.startupCommand,
            startupCwd: this.getVaultPath(),
            autoStart: this.settings.autoStart,
            detached: this.settings.detached,
            pollIntervalMs: this.settings.pollIntervalMs,
            readyTimeoutMs: this.settings.readyTimeoutMs,
        };
    }

    async ensureServiceOnline() {
        this.serviceManager.opts = this.getServiceOpts();
        this.api.baseUrl = `http://127.0.0.1:${this.settings.port}`;
        return this.serviceManager.ensureOnline();
    }

    getView() {
        const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE);
        return leaves.length ? leaves[0].view : null;
    }

    async activateView() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
        if (!leaf) {
            // 用 true：右侧尚无 leaf 时也能创建，避免 getRightLeaf(false) 在无 leaf 时返回空导致空白拆分
            leaf = workspace.getRightLeaf(true);
            await leaf.setViewState({ type: VIEW_TYPE, active: true });
        }
        workspace.revealLeaf(leaf);
    }

    async restartService() {
        await killPort(this.settings.port);
        this.serviceManager.dispose();
        this.serviceManager.reset();
        new Notice("DSH 服务已重启");
        const view = this.getView();
        if (view && view.boot) await view.boot();
    }

    /* ===== 在浏览器打开 DSH Web GUI ===== */
    openInBrowser(url) {
        try {
            const electron = require("electron");
            if (electron && electron.shell) {
                electron.shell.openExternal(url);
                return;
            }
        } catch (e) {
            /* electron 不可用时降级 */
        }
        try {
            if (typeof window !== "undefined" && window.open) window.open(url, "_blank");
        } catch (e2) {
            /* ignore */
        }
    }
    openDshInBrowser() {
        this.openInBrowser(`http://127.0.0.1:${this.settings.port}/`);
    }

    /* ===== 框选文字浮动「发送到 DSH」按钮 ===== */
    onSelectionEvent(reposition) {
        if (!this.settings.selectionButton) {
            this.hideSelectionButton();
            return;
        }
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        const editor = view ? view.editor : null;
        const text = editor && editor.getSelection ? editor.getSelection().trim() : "";
        if (!text) {
            this.hideSelectionButton();
            return;
        }
        const changed = text !== this._lastSelText;
        this._lastSelText = text;
        this._pendingSelText = text;
        if (!this._selBtn) {
            const btn = document.createElement("button");
            btn.className = "dsh-native-send-btn";
            btn.textContent = "发送到 DSH";
            btn.addEventListener("click", () => {
                const send = this._pendingSelText;
                this.hideSelectionButton();
                this.sendCurrentNote();
            });
            btn.style.cssText =
                "position:fixed;z-index:9999;padding:2px 8px;font-size:12px;cursor:pointer;" +
                "background:var(--interactive-accent);color:var(--text-on-accent);border:none;" +
                "border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.3);";
            document.body.appendChild(btn);
            this._selBtn = btn;
        }
        if (changed || reposition) this._positionSelBtn(editor);
    }
    _positionSelBtn(editor) {
        if (!this._selBtn) return;
        try {
            const el = editor.containerEl;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            let left = rect.right - 8;
            let top = rect.top + 8;
            if (editor.coordsAtPos) {
                const c = editor.coordsAtPos(editor.getCursor("from"));
                if (c) {
                    left = rect.left + c.left;
                    top = rect.top + c.top - 8;
                }
            }
            this._selBtn.style.left = Math.round(left) + "px";
            this._selBtn.style.top = Math.round(top) + "px";
        } catch (e) {
            /* ignore */
        }
    }
    hideSelectionButton() {
        if (this._selBtn) {
            this._selBtn.remove();
            this._selBtn = null;
        }
        this._lastSelText = "";
        this._pendingSelText = "";
    }

    async sendCurrentNote() {
        const view = this.getView();
        if (!view || !view.sessionId) {
            new Notice("请先打开 DSH 面板并选择会话");
            return;
        }
        const active = this.app.workspace.getActiveFile();
        if (!active) {
            new Notice("没有打开的笔记");
            return;
        }
        let text = await this.app.vault.read(active);
        const sel = this.app.workspace.getActiveViewOfType && null; // placeholder
        // 优先用当前编辑器选区
        const editor = this.app.workspace.activeEditor;
        if (editor && editor.getSelection && editor.getSelection()) {
            text = editor.getSelection();
        }
        const header = `以下是 Obsidian 笔记《${active.path}》的内容，请基于它回答：\n\n`;
        try {
            await this.api.prompt(view.sessionId, header + text.slice(0, 20000));
            new Notice("已发送到 DSH");
            if (this.settings.openPanelOnSend) await this.activateView();
            if (!view.assistantEl) view.beginAssistantBubble();
        } catch (e) {
            new Notice("发送失败：" + e.message);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
}

module.exports = DshNativePlugin;

/* nosourcemap */