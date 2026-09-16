"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ThundereggPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");
var import_child_process = require("child_process");
var import_util = require("util");
var os3 = __toESM(require("os"));
var path3 = __toESM(require("path"));
var fs3 = __toESM(require("fs"));

// core.ts
var AV_EXTENSIONS = /* @__PURE__ */ new Set([
  "mp3",
  "m4a",
  "wav",
  "aiff",
  "aif",
  "caf",
  "aac",
  "flac",
  "opus",
  "mp4",
  "mov",
  "m4v"
]);
var CONVERTIBLE = /* @__PURE__ */ new Set([
  "pdf",
  "docx",
  "doc",
  "rtf",
  "xlsx",
  "xls",
  "pptx",
  "html",
  "htm",
  "csv",
  "json",
  "eml",
  "msg",
  "png",
  "jpg",
  "jpeg",
  "tiff",
  "tif",
  "heic",
  "gif",
  "bmp",
  "webp",
  ...AV_EXTENSIONS
]);
function isAudioVideo(ext) {
  return AV_EXTENSIONS.has(ext.toLowerCase());
}
function shellQuote(s) {
  return "'" + s.replace(/'/g, "'\\''") + "'";
}
var NO_OCR_TOKEN = "DISTILL_NO_OCR";
function isNoOcrError(e) {
  const stderr = e?.stderr;
  return typeof stderr === "string" && stderr.includes(NO_OCR_TOKEN);
}
var GRADE_META = {
  blank: { label: "Blank", icon: "\u2B1C", css: "blank" },
  rough: { label: "Rough", icon: "\u{1FAA8}", css: "rough" },
  polished: { label: "Polished", icon: "\u{1F539}", css: "polished" },
  crystal: { label: "Crystal", icon: "\u{1F4A0}", css: "crystal" },
  gem: { label: "Gem", icon: "\u{1F48E}", css: "gem" },
  synthesis: { label: "Synthesis", icon: "\u{1F5FA}\uFE0F", css: "synthesis" }
};
var VALID_GRADES = new Set(Object.keys(GRADE_META));
var LEGACY_GRADES = {
  vapor: "blank",
  crude: "rough",
  distillate: "polished",
  refined: "crystal",
  essence: "gem"
};
function normalizeGrade(raw) {
  if (typeof raw !== "string")
    return null;
  const g = raw.trim().toLowerCase();
  if (VALID_GRADES.has(g))
    return g;
  return LEGACY_GRADES[g] ?? null;
}
function emptyBondGraph() {
  return { outgoing: /* @__PURE__ */ new Map(), incoming: /* @__PURE__ */ new Map() };
}
function buildBondGraph(resolved, root) {
  const out = /* @__PURE__ */ new Map();
  const inc = /* @__PURE__ */ new Map();
  for (const [src, targets] of Object.entries(resolved)) {
    if (root && !src.startsWith(root))
      continue;
    for (const tgt of Object.keys(targets)) {
      if (root && !tgt.startsWith(root))
        continue;
      if (!out.has(src))
        out.set(src, /* @__PURE__ */ new Set());
      out.get(src).add(tgt);
      if (!inc.has(tgt))
        inc.set(tgt, /* @__PURE__ */ new Set());
      inc.get(tgt).add(src);
    }
  }
  return { outgoing: out, incoming: inc };
}
function bondCount(bonds, filePath) {
  return (bonds.outgoing.get(filePath)?.size ?? 0) + (bonds.incoming.get(filePath)?.size ?? 0);
}
function isCondenser(bonds, filePath, threshold) {
  return bondCount(bonds, filePath) >= threshold;
}
function referencingCondensers(bonds, filePath, threshold) {
  const incoming = bonds.incoming.get(filePath);
  if (!incoming)
    return [];
  return [...incoming].filter((src) => isCondenser(bonds, src, threshold));
}

// publish-ui.ts
var import_obsidian2 = require("obsidian");

// publish-core.ts
var NODE_TEXT_CAP = 280;
var SUMMARY_MIN = 150;
var SUMMARY_MAX = 500;
var VISIBILITIES = ["private", "followers", "public"];
var AI_ASSISTED = ["none", "drafted", "edited"];
var SOURCE_TYPES = [
  "book",
  "paper",
  "article",
  "government-publication",
  "course",
  "video",
  "webpage",
  "dataset",
  "personal-notes",
  "other"
];
var LICENSES = [
  "CC0-1.0",
  "public-domain",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "CC-BY-NC-4.0",
  "CC-BY-ND-4.0",
  "MIT",
  "Apache-2.0",
  "user-generated",
  "all-rights-reserved",
  "proprietary",
  "unknown"
];
var DEFAULT_BLOCKED_ZONES = ["#health", "#work", "#client", "#private"];
function firstLine(text) {
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line)
      return line.replace(/^#{1,6}\s+/, "").trim();
  }
  return "";
}
function inferKind(text) {
  return firstLine(text).endsWith("?") ? "question" : "concept";
}
var RE_DOI = /10\.\d{4,9}\/\S+/;
var WEB_KEY_PARAMS = ["article", "id", "p"];
function queryParams(query) {
  const params = /* @__PURE__ */ new Map();
  for (const pair of query.split("&")) {
    if (!pair)
      continue;
    const eq = pair.indexOf("=");
    const k = eq === -1 ? pair : pair.slice(0, eq);
    const v = eq === -1 ? "" : pair.slice(eq + 1);
    if (!params.has(k))
      params.set(k, v);
  }
  return params;
}
function sourceKey(url) {
  let u = (url ?? "").trim();
  u = u.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  u = u.replace(/^www\./i, "");
  u = u.split("#")[0];
  const qIdx = u.indexOf("?");
  const hostPath = qIdx === -1 ? u : u.slice(0, qIdx);
  const query = qIdx === -1 ? "" : u.slice(qIdx + 1);
  const slash = hostPath.indexOf("/");
  const host = (slash === -1 ? hostPath : hostPath.slice(0, slash)).toLowerCase();
  const path4 = (slash === -1 ? "" : hostPath.slice(slash)).replace(/\/+$/, "");
  const doi = path4.match(RE_DOI);
  if (doi)
    return `doi:${doi[0].toLowerCase().replace(/[.,;:!?)\]/]+$/, "")}`;
  if (host === "pubmed.ncbi.nlm.nih.gov") {
    const m = path4.match(/^\/(\d+)$/);
    if (m)
      return `pmid:${m[1]}`;
  }
  if (host === "arxiv.org") {
    const m = path4.match(/^\/(?:abs|pdf)\/(.+)$/);
    if (m)
      return `arxiv:${m[1].replace(/\.pdf$/i, "").replace(/v\d+$/i, "").toLowerCase()}`;
  }
  if (host === "youtu.be") {
    const id = path4.replace(/^\//, "").split("/")[0];
    if (id)
      return `yt:${id}`;
  }
  if (host === "youtube.com" || host === "m.youtube.com") {
    const v = queryParams(query).get("v");
    if (path4 === "/watch" && v)
      return `yt:${v}`;
    const m = path4.match(/^\/(?:shorts|live)\/([^/]+)/);
    if (m)
      return `yt:${m[1]}`;
  }
  let key = `${host}${path4}`.toLowerCase();
  const params = queryParams(query);
  const kept = [];
  for (const allowed of WEB_KEY_PARAMS) {
    for (const [k, v] of params) {
      if (k.toLowerCase() === allowed) {
        kept.push(`${allowed}=${v}`);
        break;
      }
    }
  }
  if (kept.length)
    key += `?${kept.join("&")}`;
  return `web:${key}`;
}
function transformCanvas(canvas, meta, clientUuid, lineage) {
  const warnings = [];
  const blocking = [];
  const excluded = [];
  const nodes = [];
  const kinds = {};
  const includedIds = /* @__PURE__ */ new Set();
  for (const n of canvas.nodes ?? []) {
    if (n.draft) {
      excluded.push({ id: n.id, type: n.type, reason: "draft node (never exported)" });
      warnings.push(`Excluded draft node "${firstLine(n.text ?? "") || n.id}" \u2014 finish drafting it to publish it.`);
      continue;
    }
    if (n.type === "group") {
      excluded.push({ id: n.id, type: "group", reason: "group (visual-only)" });
      continue;
    }
    if (n.type === "file") {
      excluded.push({ id: n.id, type: "file", reason: "file node references a vault path (privacy)" });
      warnings.push(`Excluded file node "${n.file ?? n.id}" \u2014 convert it to a text node to publish it.`);
      continue;
    }
    if (n.type === "link") {
      excluded.push({ id: n.id, type: "link", reason: "link node URL belongs in provenance" });
      warnings.push(`Excluded link node "${n.url ?? n.id}" \u2014 add its URL as a provenance entry instead.`);
      continue;
    }
    const text = (n.text ?? "").trim();
    if (!text) {
      excluded.push({ id: n.id, type: "text", reason: "empty text node" });
      continue;
    }
    if (text.length > NODE_TEXT_CAP) {
      blocking.push(`Node "${firstLine(text).slice(0, 40)}\u2026" is ${text.length} chars (max ${NODE_TEXT_CAP}). Shorten it before publishing.`);
    }
    nodes.push({
      id: n.id,
      type: "text",
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
      text,
      ...n.color !== void 0 ? { color: n.color } : {}
    });
    includedIds.add(n.id);
    const kind = meta.kinds?.[n.id] ?? inferKind(text);
    kinds[n.id] = { kind };
  }
  if (nodes.length === 0) {
    blocking.push("This canvas has no text nodes to publish.");
  }
  const edges = [];
  for (const e of canvas.edges ?? []) {
    if (!includedIds.has(e.fromNode) || !includedIds.has(e.toNode)) {
      excluded.push({ id: e.id, type: "edge", reason: "edge endpoint was excluded" });
      warnings.push(`Dropped an edge connected to an excluded node.`);
      continue;
    }
    edges.push({
      id: e.id,
      fromNode: e.fromNode,
      toNode: e.toNode,
      ...e.fromSide !== void 0 ? { fromSide: e.fromSide } : {},
      ...e.toSide !== void 0 ? { toSide: e.toSide } : {},
      ...e.fromEnd !== void 0 ? { fromEnd: e.fromEnd } : {},
      ...e.toEnd !== void 0 ? { toEnd: e.toEnd } : {},
      ...e.label !== void 0 ? { label: e.label } : {},
      ...e.color !== void 0 ? { color: e.color } : {}
    });
  }
  const artifact = {
    schema: "distill.map/0.2",
    client_uuid: clientUuid,
    title: meta.title,
    summary: meta.summary,
    topics: meta.topics,
    visibility: meta.visibility,
    map: { format: "jsoncanvas/1.0", nodes, edges },
    "x-distill": {
      nodes: kinds,
      ...meta.ai_assisted !== void 0 ? { authoring: { ai_assisted: meta.ai_assisted } } : {},
      ...lineage ? { forked_from: lineage } : {}
    },
    provenance: meta.provenance.map((p) => ({ ...p, source_key: p.source_key ?? sourceKey(p.url) })),
    license: meta.license,
    distill_version: meta.distill_version
  };
  blocking.push(...validatePublishMeta(meta));
  return { artifact, warnings, blocking, excluded };
}
function validatePublishMeta(meta) {
  const errs = [];
  const len = meta.summary.trim().length;
  if (len < SUMMARY_MIN || len > SUMMARY_MAX) {
    errs.push(`Summary must be ${SUMMARY_MIN}\u2013${SUMMARY_MAX} chars (currently ${len}).`);
  }
  if (!meta.topics || meta.topics.length < 1) {
    errs.push("At least one topic is required.");
  }
  if (!VISIBILITIES.includes(meta.visibility)) {
    errs.push(`Invalid visibility "${meta.visibility}".`);
  }
  if (!LICENSES.includes(meta.license)) {
    errs.push(`Invalid map license "${meta.license}".`);
  }
  if (!meta.provenance || meta.provenance.length < 1) {
    errs.push("At least one provenance entry is required.");
  } else {
    meta.provenance.forEach((p, i) => {
      if (!p.source_title?.trim())
        errs.push(`Provenance #${i + 1}: source_title is required.`);
      if (!p.url?.trim())
        errs.push(`Provenance #${i + 1}: url is required.`);
      if (!SOURCE_TYPES.includes(p.source_type)) {
        errs.push(`Provenance #${i + 1}: invalid source_type "${p.source_type}".`);
      }
      if (!LICENSES.includes(p.license)) {
        errs.push(`Provenance #${i + 1}: invalid license "${p.license}".`);
      }
    });
  }
  return errs;
}
var RE_EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
var RE_PHONE = /(?:\+?\d[\d\s().-]{8,}\d)/;
var RE_HANDLE = /(?:^|\s)@[A-Za-z0-9_]{2,}/;
var RE_URL = /https?:\/\/\S+/;
function normTag(s) {
  return s.replace(/^#/, "").trim().toLowerCase();
}
function redactionScan(artifact, blockedZones = DEFAULT_BLOCKED_ZONES) {
  const blocks = [];
  const warnings = [];
  const blocked = new Set(blockedZones.map(normTag));
  const taggedSources = [
    { where: "title", text: artifact.title },
    ...artifact.map.nodes.map((n) => ({ where: `node ${n.id}`, text: n.text }))
  ];
  for (const topic of artifact.topics) {
    if (blocked.has(normTag(topic)))
      blocks.push(`Topic "${topic}" is in a blocked privacy zone.`);
  }
  for (const { where, text } of taggedSources) {
    const tags = text.match(/#[A-Za-z0-9_/-]+/g) ?? [];
    for (const t of tags) {
      if (blocked.has(normTag(t)))
        blocks.push(`Tag "${t}" (in ${where}) is in a blocked privacy zone.`);
    }
  }
  const piiSources = [
    { where: "title", text: artifact.title },
    { where: "summary", text: artifact.summary },
    { where: "topics", text: artifact.topics.join(" ") },
    ...artifact.map.nodes.map((n) => ({ where: `node ${n.id}`, text: n.text })),
    ...artifact.provenance.map((p, i) => ({ where: `provenance #${i + 1} title`, text: p.source_title }))
  ];
  for (const { where, text } of piiSources) {
    if (RE_EMAIL.test(text))
      warnings.push(`Possible email address in ${where}.`);
    if (RE_PHONE.test(text))
      warnings.push(`Possible phone number in ${where}.`);
    if (RE_HANDLE.test(text))
      warnings.push(`Possible @handle in ${where}.`);
    if (RE_URL.test(text))
      warnings.push(`A URL appears in ${where} \u2014 make sure it isn't private.`);
  }
  return { blocks, warnings };
}
function buildSidecar(artifact, signature) {
  const topicsYaml = artifact.topics.map((t) => JSON.stringify(t)).join(", ");
  const lines = [
    "---",
    `title: ${JSON.stringify(artifact.title)}`,
    `schema: ${artifact.schema}`,
    `license: ${artifact.license}`,
    `visibility: ${artifact.visibility}`,
    `topics: [${topicsYaml}]`
  ];
  if (artifact["x-distill"].authoring) {
    lines.push(`ai_assisted: ${artifact["x-distill"].authoring.ai_assisted}`);
  }
  if (signature) {
    lines.push(
      `signature_algo: ${signature.algo}`,
      `public_key: ${signature.public_key}`,
      `signature: ${signature.signature}`
    );
  }
  lines.push(
    "---",
    "",
    `# ${artifact.title}`,
    "",
    artifact.summary,
    "",
    `**License:** ${artifact.license}`,
    "",
    "## Sources"
  );
  for (const p of artifact.provenance) {
    const acc = p.accessed ? ` (accessed ${p.accessed})` : "";
    lines.push(`- ${p.source_title} \u2014 ${p.url} \xB7 ${p.source_type} \xB7 ${p.license}${acc}`);
  }
  lines.push(
    "",
    "_Exported from Thunderegg. The concept map is in the companion `.distill.json` (distill.map/0.2). Share both together._"
  );
  if (signature) {
    lines.push(
      `_Signed (${signature.algo}). Verify the exact bytes of the \`.distill.json\` against \`public_key\` above._`
    );
  }
  return lines.join("\n");
}
function parseSidecarSignature(md) {
  const field = (name) => {
    const m = md.match(new RegExp(`^${name}:[ \\t]*(.+)$`, "m"));
    return m ? m[1].trim() : null;
  };
  const algo = field("signature_algo");
  const public_key = field("public_key");
  const signature = field("signature");
  if (!algo || !public_key || !signature)
    return null;
  return { algo, public_key, signature };
}
var FORK_MAX_BYTES = 2 * 1024 * 1024;
var FORK_MAX_NODES = 500;
function sanitizeMapNode(raw) {
  const n = raw;
  if (!n || typeof n !== "object")
    return null;
  if (n.type !== "text" || typeof n.id !== "string" || typeof n.text !== "string")
    return null;
  if (typeof n.x !== "number" || typeof n.y !== "number" || typeof n.width !== "number" || typeof n.height !== "number")
    return null;
  return {
    id: n.id,
    type: "text",
    x: n.x,
    y: n.y,
    width: n.width,
    height: n.height,
    text: n.text,
    ...typeof n.color === "string" ? { color: n.color } : {}
  };
}
function sanitizeMapEdge(raw) {
  const e = raw;
  if (!e || typeof e !== "object")
    return null;
  if (typeof e.id !== "string" || typeof e.fromNode !== "string" || typeof e.toNode !== "string")
    return null;
  return {
    id: e.id,
    fromNode: e.fromNode,
    toNode: e.toNode,
    ...typeof e.fromSide === "string" ? { fromSide: e.fromSide } : {},
    ...typeof e.toSide === "string" ? { toSide: e.toSide } : {},
    ...typeof e.fromEnd === "string" ? { fromEnd: e.fromEnd } : {},
    ...typeof e.toEnd === "string" ? { toEnd: e.toEnd } : {},
    ...typeof e.label === "string" ? { label: e.label } : {},
    ...typeof e.color === "string" ? { color: e.color } : {}
  };
}
function checkForkMap(map) {
  const warnings = [];
  const blocking = [];
  const rawNodes = map?.nodes ?? [];
  if (rawNodes.length > FORK_MAX_NODES) {
    blocking.push(`Map has ${rawNodes.length} nodes (max ${FORK_MAX_NODES}) \u2014 refusing to import.`);
    return { nodes: [], edges: [], warnings, blocking };
  }
  const nodes = [];
  const overCap = [];
  let skipped = 0;
  for (const raw of rawNodes) {
    const n = sanitizeMapNode(raw);
    if (!n) {
      skipped++;
      continue;
    }
    if (n.text.length > NODE_TEXT_CAP) {
      overCap.push(`"${firstLine(n.text).slice(0, 40)}\u2026" (${n.text.length} chars)`);
      continue;
    }
    nodes.push(n);
  }
  if (skipped)
    warnings.push(`Skipped ${skipped} node(s) that are not schema text nodes.`);
  if (overCap.length) {
    warnings.push(`Rejected ${overCap.length} node(s) over the ${NODE_TEXT_CAP}-char cap: ${overCap.join(", ")}. The rest were imported.`);
  }
  if (nodes.length === 0)
    blocking.push("This map has no importable text nodes.");
  const includedIds = new Set(nodes.map((n) => n.id));
  const edges = [];
  let dropped = 0;
  for (const raw of map?.edges ?? []) {
    const e = sanitizeMapEdge(raw);
    if (!e || !includedIds.has(e.fromNode) || !includedIds.has(e.toNode)) {
      dropped++;
      continue;
    }
    edges.push(e);
  }
  if (dropped)
    warnings.push(`Dropped ${dropped} edge(s) that were malformed or connected to a rejected node.`);
  return { nodes, edges, warnings, blocking };
}
function sanitizeForkArtifact(raw) {
  const a = raw;
  if (!a || typeof a !== "object")
    return null;
  const map = a.map;
  if (!map || typeof map !== "object")
    return null;
  const str = (v) => typeof v === "string" ? v : "";
  const nodes = [];
  for (const n of Array.isArray(map.nodes) ? map.nodes : []) {
    const s = sanitizeMapNode(n);
    if (s)
      nodes.push(s);
  }
  const includedIds = new Set(nodes.map((n) => n.id));
  const edges = [];
  for (const e of Array.isArray(map.edges) ? map.edges : []) {
    const s = sanitizeMapEdge(e);
    if (s && includedIds.has(s.fromNode) && includedIds.has(s.toNode))
      edges.push(s);
  }
  const xd = a["x-distill"];
  const kinds = {};
  const rawKinds = xd && typeof xd === "object" ? xd.nodes ?? {} : {};
  for (const id of Object.keys(rawKinds)) {
    const k = rawKinds[id]?.kind;
    if (includedIds.has(id) && (k === "concept" || k === "source" || k === "question" || k === "claim")) {
      kinds[id] = { kind: k };
    }
  }
  const auth = xd && typeof xd === "object" ? xd.authoring : void 0;
  const ai = auth && typeof auth === "object" ? auth.ai_assisted : void 0;
  const authoring = ai === "none" || ai === "drafted" || ai === "edited" ? { ai_assisted: ai } : void 0;
  const fl = xd && typeof xd === "object" ? xd.forked_from : void 0;
  const forked_from = fl && typeof fl === "object" && typeof fl.client_uuid === "string" && typeof fl.author_fingerprint === "string" && typeof fl.content_hash === "string" ? { client_uuid: fl.client_uuid, author_fingerprint: fl.author_fingerprint, content_hash: fl.content_hash } : void 0;
  const provenance = [];
  for (const raw2 of Array.isArray(a.provenance) ? a.provenance : []) {
    const p = raw2;
    if (!p || typeof p !== "object")
      continue;
    provenance.push({
      source_title: str(p.source_title),
      url: str(p.url),
      source_type: str(p.source_type),
      license: str(p.license),
      ...typeof p.accessed === "string" ? { accessed: p.accessed } : {},
      ...typeof p.source_key === "string" ? { source_key: p.source_key } : {}
    });
  }
  return {
    schema: "distill.map/0.2",
    client_uuid: str(a.client_uuid),
    title: str(a.title),
    summary: str(a.summary),
    topics: Array.isArray(a.topics) ? a.topics.filter((t) => typeof t === "string") : [],
    visibility: VISIBILITIES.includes(str(a.visibility)) ? a.visibility : "private",
    map: { format: "jsoncanvas/1.0", nodes, edges },
    "x-distill": { nodes: kinds, ...authoring ? { authoring } : {}, ...forked_from ? { forked_from } : {} },
    provenance,
    license: str(a.license) || "unknown",
    distill_version: str(a.distill_version)
  };
}
function prepareForkImport(json) {
  const bytes = new TextEncoder().encode(json).length;
  if (bytes > FORK_MAX_BYTES) {
    return { artifact: null, blocking: [`File is ${bytes} bytes (max ${FORK_MAX_BYTES}) \u2014 refusing to import.`] };
  }
  let raw;
  try {
    raw = JSON.parse(json);
  } catch {
    return { artifact: null, blocking: ["File is not valid JSON."] };
  }
  const artifact = sanitizeForkArtifact(raw);
  if (!artifact)
    return { artifact: null, blocking: ["File is not a distill map artifact (no map object)."] };
  return { artifact, blocking: [] };
}
function buildAttributionNote(a) {
  const lines = [
    "---",
    `forked_from: ${a.forkedFrom}`,
    `author: ${a.author}`,
    `license: ${a.license}`,
    `source_url: ${a.sourceUrl}`
  ];
  if (a.lineage) {
    lines.push(
      `lineage_client_uuid: ${a.lineage.client_uuid}`,
      `lineage_author_fingerprint: ${a.lineage.author_fingerprint}`,
      `lineage_content_hash: ${a.lineage.content_hash}`
    );
  }
  lines.push(
    "---",
    "",
    `# ${a.displayTitle} (forked)`,
    "",
    `Forked from [@${a.author}](${a.sourceUrl}). License: ${a.license}.`,
    "",
    `The map is in \`${a.canvasName}.canvas\` in this folder.`,
    ""
  );
  return lines.join("\n");
}
function parseLineageFrontmatter(md) {
  const field = (name) => {
    const m = md.match(new RegExp(`^${name}:[ \\t]*(.+)$`, "m"));
    return m ? m[1].trim() : null;
  };
  const client_uuid = field("lineage_client_uuid");
  const author_fingerprint = field("lineage_author_fingerprint");
  const content_hash = field("lineage_content_hash");
  if (!client_uuid || !author_fingerprint || !content_hash)
    return null;
  return { client_uuid, author_fingerprint, content_hash };
}
function buildForkReceipt(artifact, lineage) {
  const sources = artifact.provenance.map((p) => p.source_key ?? sourceKey(p.url)).filter((s) => s && s !== "web:");
  const lines = [
    `Forked "${artifact.title}" via Thunderegg`,
    `- author: \`${lineage.author_fingerprint}\``,
    `- content: \`${lineage.content_hash.slice(0, 12)}\u2026\``
  ];
  if (sources.length)
    lines.push(`- sources: ${sources.map((s) => `\`${s}\``).join(", ")}`);
  return lines.join("\n");
}

// publish-net.ts
var import_obsidian = require("obsidian");
var os = __toESM(require("os"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
var TOKEN_DIR = path.join(os.homedir(), "Library", "Application Support", "MarkItDownDroplet");
var TOKEN_FILE = path.join(TOKEN_DIR, "distill-token");
function readDeviceToken() {
  try {
    return fs.readFileSync(TOKEN_FILE, "utf8").trim();
  } catch {
    return "";
  }
}
function writeDeviceToken(token) {
  fs.mkdirSync(TOKEN_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, token.trim(), { mode: 384 });
  try {
    fs.chmodSync(TOKEN_FILE, 384);
  } catch {
  }
}
function clearDeviceToken() {
  try {
    fs.unlinkSync(TOKEN_FILE);
  } catch {
  }
}
function hasDeviceToken() {
  return readDeviceToken().length > 0;
}
function trimSlash(u) {
  return u.replace(/\/+$/, "");
}
async function publishArtifact(baseUrl, token, artifact) {
  const res = await (0, import_obsidian.requestUrl)({
    url: `${trimSlash(baseUrl)}/api/maps`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(artifact),
    throw: false
  });
  if (res.status < 200 || res.status >= 300) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = res.json;
      if (j && typeof j === "object" && typeof j.error === "string") {
        msg = j.error;
      }
    } catch {
    }
    throw new Error(msg);
  }
  return res.json;
}
async function fetchForkFile(baseUrl, mapId) {
  const res = await (0, import_obsidian.requestUrl)({
    url: `${trimSlash(baseUrl)}/api/maps/${encodeURIComponent(mapId)}/forkfile`,
    method: "GET",
    throw: false
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Fork fetch failed: HTTP ${res.status}`);
  }
  return res.json;
}

// publish-sign.ts
var import_crypto = require("crypto");
var os2 = __toESM(require("os"));
var path2 = __toESM(require("path"));
var fs2 = __toESM(require("fs"));
var KEY_DIR = path2.join(os2.homedir(), "Library", "Application Support", "MarkItDownDroplet");
var KEY_FILE = path2.join(KEY_DIR, "distill-signing-key.pem");
function publicKeySpki(pub) {
  return pub.export({ type: "spki", format: "der" }).toString("base64");
}
function signBytes(data, privateKey) {
  return (0, import_crypto.sign)(null, Buffer.from(data, "utf8"), privateKey).toString("base64");
}
function verifyBytes(data, signatureB64, publicKeySpkiB64) {
  try {
    const pub = (0, import_crypto.createPublicKey)({
      key: Buffer.from(publicKeySpkiB64, "base64"),
      format: "der",
      type: "spki"
    });
    return (0, import_crypto.verify)(null, Buffer.from(data, "utf8"), pub, Buffer.from(signatureB64, "base64"));
  } catch {
    return false;
  }
}
function keyFingerprint(publicKeySpkiB64) {
  return (0, import_crypto.createHash)("sha256").update(publicKeySpkiB64).digest("hex").slice(0, 16);
}
function contentHash(data) {
  return (0, import_crypto.createHash)("sha256").update(data, "utf8").digest("hex");
}
function getOrCreateSigningKey() {
  try {
    return (0, import_crypto.createPrivateKey)(fs2.readFileSync(KEY_FILE, "utf8"));
  } catch {
    const { privateKey } = (0, import_crypto.generateKeyPairSync)("ed25519");
    const pem = privateKey.export({ type: "pkcs8", format: "pem" });
    fs2.mkdirSync(KEY_DIR, { recursive: true });
    fs2.writeFileSync(KEY_FILE, pem, { mode: 384 });
    try {
      fs2.chmodSync(KEY_FILE, 384);
    } catch {
    }
    return privateKey;
  }
}
function signArtifact(jsonString) {
  const priv = getOrCreateSigningKey();
  const pub = (0, import_crypto.createPublicKey)(priv);
  return {
    algo: "ed25519",
    public_key: publicKeySpki(pub),
    signature: signBytes(jsonString, priv)
  };
}
function signingKeyFingerprint() {
  try {
    const priv = (0, import_crypto.createPrivateKey)(fs2.readFileSync(KEY_FILE, "utf8"));
    return keyFingerprint(publicKeySpki((0, import_crypto.createPublicKey)(priv)));
  } catch {
    return null;
  }
}

// publish-ui.ts
function emptyProvenance() {
  return { source_title: "", url: "", source_type: "webpage", license: "public-domain" };
}
var PublishModal = class extends import_obsidian2.Modal {
  constructor(app, canvas, defaultTitle, ctx, lineage) {
    super(app);
    this.canvas = canvas;
    this.ctx = ctx;
    this.lineage = lineage;
    this.clientUuid = crypto.randomUUID();
    this.meta = {
      title: defaultTitle,
      summary: "",
      topics: [],
      visibility: ctx.defaultVisibility,
      license: ctx.defaultLicense,
      provenance: [emptyProvenance()],
      distill_version: ctx.distillVersion,
      kinds: {},
      ai_assisted: "none"
    };
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Publish concept map" });
    contentEl.createEl("p", {
      cls: "setting-item-description",
      text: "Only text nodes are included, as your own synthesis. The exact JSON is shown below \u2014 nothing else leaves your device. \u201CExport to vault\u201D writes a shareable file with no account; \u201CPublish\u201D sends it to the server (needs a device token)."
    });
    new import_obsidian2.Setting(contentEl).setName("Title").addText((t) => t.setValue(this.meta.title).onChange((v) => {
      this.meta.title = v;
      this.refresh();
    }));
    new import_obsidian2.Setting(contentEl).setName("Summary").setDesc(`${SUMMARY_MIN}\u2013${SUMMARY_MAX} characters.`).addTextArea((t) => t.setPlaceholder("What this map is, in your words\u2026").onChange((v) => {
      this.meta.summary = v;
      this.refresh();
    }));
    new import_obsidian2.Setting(contentEl).setName("Topics").setDesc("Comma-separated. At least one.").addText((t) => t.setPlaceholder("medtech, regulatory").onChange((v) => {
      this.meta.topics = v.split(",").map((s) => s.trim()).filter(Boolean);
      this.refresh();
    }));
    new import_obsidian2.Setting(contentEl).setName("Visibility").addDropdown((d) => {
      VISIBILITIES.forEach((v) => {
        d.addOption(v, v);
      });
      d.setValue(this.meta.visibility).onChange((v) => {
        this.meta.visibility = v;
        this.refresh();
      });
    });
    new import_obsidian2.Setting(contentEl).setName("Map license").addDropdown((d) => {
      LICENSES.forEach((l) => {
        d.addOption(l, l);
      });
      d.setValue(this.meta.license).onChange((v) => {
        this.meta.license = v;
        this.refresh();
      });
    });
    new import_obsidian2.Setting(contentEl).setName("AI assistance").setDesc("Disclose whether AI helped make this map (travels in the artifact).").addDropdown((d) => {
      AI_ASSISTED.forEach((a) => {
        d.addOption(a, a);
      });
      d.setValue(this.meta.ai_assisted ?? "none").onChange((v) => {
        this.meta.ai_assisted = v;
        this.refresh();
      });
    });
    contentEl.createEl("h3", { text: "Provenance (sources)" });
    const provWrap = contentEl.createDiv();
    const renderProv = () => {
      provWrap.empty();
      this.meta.provenance.forEach((p, i) => {
        const row = provWrap.createDiv({ cls: "thunderegg-prov-row" });
        new import_obsidian2.Setting(row).setName(`Source #${i + 1}`).addText((t) => t.setPlaceholder("Title").setValue(p.source_title).onChange((v) => {
          p.source_title = v;
          this.refresh();
        })).addText((t) => t.setPlaceholder("https://\u2026").setValue(p.url).onChange((v) => {
          p.url = v;
          this.refresh();
        })).addDropdown((d) => {
          SOURCE_TYPES.forEach((s) => {
            d.addOption(s, s);
          });
          d.setValue(p.source_type).onChange((v) => {
            p.source_type = v;
            this.refresh();
          });
        }).addDropdown((d) => {
          LICENSES.forEach((l) => {
            d.addOption(l, l);
          });
          d.setValue(p.license).onChange((v) => {
            p.license = v;
            this.refresh();
          });
        }).addExtraButton((b) => b.setIcon("trash").setTooltip("Remove").onClick(() => {
          if (this.meta.provenance.length > 1) {
            this.meta.provenance.splice(i, 1);
            renderProv();
            this.refresh();
          }
        }));
      });
    };
    renderProv();
    new import_obsidian2.Setting(contentEl).addButton((b) => b.setButtonText("+ Add source").onClick(() => {
      this.meta.provenance.push(emptyProvenance());
      renderProv();
      this.refresh();
    }));
    contentEl.createEl("h3", { text: "Review" });
    this.issuesEl = contentEl.createDiv({ cls: "thunderegg-publish-issues" });
    this.previewEl = contentEl.createEl("pre", { cls: "thunderegg-publish-preview" });
    const btns = new import_obsidian2.Setting(contentEl);
    btns.addButton((b) => b.setButtonText("Copy JSON").onClick(async () => {
      await navigator.clipboard.writeText(this.previewEl.getText());
      new import_obsidian2.Notice("Artifact JSON copied.");
    }));
    btns.addButton((b) => {
      this.exportBtn = b.buttonEl;
      b.setButtonText("Export to vault").onClick(() => this.doExport());
    });
    btns.addButton((b) => {
      this.publishBtn = b.buttonEl;
      b.setButtonText("Publish").setCta().onClick(() => this.doPublish());
    });
    this.refresh();
  }
  /** Re-run the transform + redaction and repaint preview + issues + button state. */
  refresh() {
    const { artifact, warnings, blocking, excluded } = transformCanvas(this.canvas, this.meta, this.clientUuid, this.lineage);
    const redaction = redactionScan(artifact, this.ctx.blockedZones);
    this.previewEl.setText(JSON.stringify(artifact, null, 2));
    this.issuesEl.empty();
    const blocks = [...blocking, ...redaction.blocks];
    const warns = [...warnings, ...redaction.warnings, ...excluded.filter((e) => e.type !== "group").map((e) => `Excluded ${e.type} node (${e.reason}).`)];
    if (blocks.length) {
      const ul = this.issuesEl.createEl("ul", { cls: "thunderegg-publish-blocks" });
      blocks.forEach((b) => ul.createEl("li", { text: `\u26D4 ${b}` }));
    }
    if (warns.length) {
      const ul = this.issuesEl.createEl("ul", { cls: "thunderegg-publish-warnings" });
      warns.forEach((w) => ul.createEl("li", { text: `\u26A0\uFE0F ${w}` }));
    }
    if (!blocks.length && !warns.length) {
      this.issuesEl.createEl("p", { text: "\u2705 No issues.", cls: "setting-item-description" });
    }
    const ready = blocks.length === 0 && this.ctx.token.length > 0;
    this.publishBtn.disabled = !ready;
    this.publishBtn.title = this.ctx.token ? blocks.length ? "Resolve the blocking issues above." : "" : "Connect a device token in Settings \u2192 Thunderegg first.";
    this.exportBtn.disabled = blocks.length > 0;
    this.exportBtn.title = blocks.length ? "Resolve the blocking issues above." : "Write a shareable map file into your vault \u2014 no account needed.";
  }
  async doPublish() {
    const { artifact } = transformCanvas(this.canvas, this.meta, this.clientUuid, this.lineage);
    const notice = new import_obsidian2.Notice("Thunderegg: publishing\u2026", 0);
    try {
      const res = await publishArtifact(this.ctx.baseUrl, this.ctx.token, artifact);
      notice.hide();
      new import_obsidian2.Notice(`\u2705 Published: ${res.url}`);
      this.close();
    } catch (e) {
      notice.hide();
      new import_obsidian2.Notice(`\u274C Publish failed: ${e instanceof Error ? e.message : String(e)}`, 8e3);
    }
  }
  /** Write a shareable map file (+ provenance sidecar) into the vault. No account, no network. */
  async doExport() {
    const { artifact } = transformCanvas(this.canvas, this.meta, this.clientUuid, this.lineage);
    const folder = "Thunderegg Exports";
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      try {
        await this.app.vault.createFolder(folder);
      } catch {
      }
    }
    const base = safeName(artifact.title);
    const json = JSON.stringify(artifact, null, 2);
    let signature;
    try {
      signature = signArtifact(json);
    } catch (e) {
      console.error("[Thunderegg] signing failed; exporting unsigned", e);
    }
    try {
      await writeOrReplace(this.app, (0, import_obsidian2.normalizePath)(`${folder}/${base}.distill.json`), json);
      await writeOrReplace(this.app, (0, import_obsidian2.normalizePath)(`${folder}/${base} \u2014 provenance.md`), buildSidecar(artifact, signature));
      new import_obsidian2.Notice(`\u2705 Exported "${artifact.title}"${signature ? " (signed)" : ""} to ${folder}/ \u2014 share the .distill.json (no account needed).`);
      this.close();
    } catch (e) {
      new import_obsidian2.Notice(`\u274C Export failed: ${e instanceof Error ? e.message : String(e)}`, 8e3);
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
function safeName(s) {
  return (s || "map").replace(/[\\/:*?"<>|]/g, "-").slice(0, 80).trim() || "map";
}
async function importMapPayload(app, payload, opts) {
  const check = checkForkMap(payload.map);
  if (check.blocking.length)
    throw new Error(check.blocking.join(" "));
  const folder = "Forked";
  if (!app.vault.getAbstractFileByPath(folder)) {
    try {
      await app.vault.createFolder(folder);
    } catch {
    }
  }
  const title = safeName(payload.title ?? opts.forkedFrom);
  const canvasBody = JSON.stringify({ nodes: check.nodes, edges: check.edges }, null, 2);
  const canvasPath = (0, import_obsidian2.normalizePath)(`${folder}/${title}.canvas`);
  await writeOrReplace(app, canvasPath, canvasBody);
  if (opts.sourceJson !== void 0) {
    await writeOrReplace(app, (0, import_obsidian2.normalizePath)(`${folder}/${title}.distill.json`), opts.sourceJson);
  }
  const attribution = buildAttributionNote({
    displayTitle: payload.title ?? title,
    canvasName: title,
    forkedFrom: opts.forkedFrom,
    author: opts.author,
    license: payload.license ?? "unknown",
    sourceUrl: opts.sourceUrl,
    ...opts.lineage ? { lineage: opts.lineage } : {}
  });
  await writeOrReplace(app, (0, import_obsidian2.normalizePath)(`${folder}/${title} \u2014 source.md`), attribution);
  for (const w of check.warnings)
    new import_obsidian2.Notice(`\u26A0\uFE0F ${w}`, 8e3);
  new import_obsidian2.Notice(`\u2705 Forked "${payload.title ?? title}" into ${folder}/`);
  const f = app.vault.getAbstractFileByPath(canvasPath);
  if (f instanceof import_obsidian2.TFile)
    void app.workspace.getLeaf(true).openFile(f);
}
async function importForkedMap(app, baseUrl, mapId) {
  const notice = new import_obsidian2.Notice("Thunderegg: forking map\u2026", 0);
  try {
    const data = await fetchForkFile(baseUrl, mapId);
    const author = data.author?.handle ?? "unknown";
    const link = `${baseUrl.replace(/\/+$/, "")}/@${author}/${data.id ?? mapId}`;
    await importMapPayload(app, data, {
      author,
      forkedFrom: data.id ?? mapId,
      sourceUrl: link
    });
    notice.hide();
  } catch (e) {
    notice.hide();
    new import_obsidian2.Notice(`\u274C Fork failed: ${e instanceof Error ? e.message : String(e)}`, 8e3);
  }
}
async function forkMapFileIntoVault(app, sourcePath, json, authorFingerprint) {
  const notice = new import_obsidian2.Notice("Thunderegg: forking map\u2026", 0);
  try {
    const prep = prepareForkImport(json);
    if (prep.blocking.length || !prep.artifact)
      throw new Error(prep.blocking.join(" "));
    const artifact = prep.artifact;
    const canonical = JSON.stringify(artifact, null, 2);
    const lineage = {
      client_uuid: artifact.client_uuid,
      author_fingerprint: authorFingerprint ?? "unsigned",
      content_hash: contentHash(canonical)
    };
    await importMapPayload(app, artifact, {
      author: lineage.author_fingerprint,
      forkedFrom: artifact.client_uuid,
      sourceUrl: sourcePath,
      sourceJson: canonical,
      lineage
    });
    notice.hide();
    new import_obsidian2.Notice("Fork receipt ready \u2014 run \u201CThunderegg: Copy fork receipt\u201D to share it.");
    return buildForkReceipt(artifact, lineage);
  } catch (e) {
    notice.hide();
    new import_obsidian2.Notice(`\u274C Fork failed: ${e instanceof Error ? e.message : String(e)}`, 8e3);
    return null;
  }
}
var ConfirmForkModal = class extends import_obsidian2.Modal {
  constructor(app, problem, onConfirm) {
    super(app);
    this.problem = problem;
    this.onConfirm = onConfirm;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Fork unverified map?" });
    contentEl.createEl("p", {
      cls: "setting-item-description",
      text: `This map's authorship could not be verified: ${this.problem}. Fork it only if you trust where it came from.`
    });
    new import_obsidian2.Setting(contentEl).addButton((b) => b.setButtonText("Cancel").onClick(() => this.close())).addButton((b) => b.setWarning().setButtonText("Fork anyway (unverified)").onClick(() => {
      this.close();
      this.onConfirm();
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
async function writeOrReplace(app, path4, content) {
  const existing = app.vault.getAbstractFileByPath(path4);
  if (existing instanceof import_obsidian2.TFile) {
    await app.vault.modify(existing, content);
  } else {
    await app.vault.create(path4, content);
  }
}

// main.ts
var execAsync = (0, import_util.promisify)(import_child_process.exec);
var DEFAULT_SETTINGS = {
  enginePath: `${os3.homedir()}/Library/Application Support/MarkItDownDroplet/convert.sh`,
  frontmatter: true,
  openAfter: true,
  refineryEnabled: false,
  vaultRoot: "",
  condenserThreshold: 5,
  showGradeBadges: true,
  showBondCounts: true,
  showCondenserLinks: true,
  // The community publish server has NOT been redeployed since the Thunderegg rebrand — this
  // legacy host currently 404s, and thunderegg.ai is a static site with no /api. Deliberately
  // left pointing at the legacy zone (a clean HTTP failure) rather than re-pointed (a JSON
  // parse failure against marketing HTML). Revisit when/if the publish backend ships.
  serverBaseUrl: "https://distillmd.dev",
  blockedZonesCsv: "#health, #work, #client, #private",
  defaultVisibility: "private",
  defaultLicense: "user-generated"
};
var _ThundereggPlugin = class _ThundereggPlugin extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.refineryBarEl = null;
    /* State */
    this.thundereggAvailable = false;
    this.bonds = emptyBondGraph();
    this.lastForkReceipt = null;
  }
  /* ── Lifecycle ──────────────────────────────────────────────── */
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new ThundereggSettingTab(this.app, this));
    this.statusThunderegg = this.addStatusBarItem();
    this.statusRefinery = this.addStatusBarItem();
    await this.checkThundereggAvailable();
    this.renderThundereggStatus();
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof import_obsidian3.TFile && CONVERTIBLE.has(file.extension.toLowerCase())) {
          menu.addItem(
            (item) => item.setTitle("Convert to Markdown (Thunderegg)").setIcon("file-down").onClick(() => this.convertFile(file))
          );
        } else if (file instanceof import_obsidian3.TFile && file.extension.toLowerCase() === "canvas") {
          menu.addItem(
            (item) => item.setTitle("Publish concept map (Thunderegg)").setIcon("upload").onClick(() => this.openPublishModal(file))
          );
        } else if (file instanceof import_obsidian3.TFile && file.name.toLowerCase().endsWith(".distill.json")) {
          menu.addItem(
            (item) => item.setTitle("Verify signature (Thunderegg)").setIcon("shield-check").onClick(() => this.verifyMapFile(file))
          );
          menu.addItem(
            (item) => item.setTitle("Fork map file into vault (Thunderegg)").setIcon("git-fork").onClick(() => this.forkMapFile(file))
          );
        } else if (file instanceof import_obsidian3.TFolder) {
          menu.addItem(
            (item) => item.setTitle("Thunderegg: convert all attachments").setIcon("folder-down").onClick(() => this.convertFolder(file))
          );
        }
      })
    );
    this.addCommand({
      id: "convert-file",
      name: "Convert file",
      checkCallback: (checking) => {
        const f = this.app.workspace.getActiveFile();
        const ok = f instanceof import_obsidian3.TFile && CONVERTIBLE.has(f.extension.toLowerCase());
        if (ok && !checking)
          void this.convertFile(f);
        return ok;
      }
    });
    this.addCommand({
      id: "convert-clipboard",
      name: "Convert clipboard",
      callback: () => {
        void this.convertClipboard();
      }
    });
    this.addCommand({
      id: "publish-canvas",
      name: "Publish concept map",
      checkCallback: (checking) => {
        const f = this.app.workspace.getActiveFile();
        const ok = f instanceof import_obsidian3.TFile && f.extension.toLowerCase() === "canvas";
        if (ok && !checking)
          void this.openPublishModal(f);
        return ok;
      }
    });
    this.addCommand({
      id: "verify-map",
      name: "Verify concept-map signature",
      checkCallback: (checking) => {
        const f = this.app.workspace.getActiveFile();
        const ok = f instanceof import_obsidian3.TFile && f.name.toLowerCase().endsWith(".distill.json");
        if (ok && !checking)
          void this.verifyMapFile(f);
        return ok;
      }
    });
    this.addCommand({
      id: "fork-map-file",
      name: "Fork map file into vault",
      checkCallback: (checking) => {
        const f = this.app.workspace.getActiveFile();
        const ok = f instanceof import_obsidian3.TFile && f.name.toLowerCase().endsWith(".distill.json");
        if (ok && !checking)
          void this.forkMapFile(f);
        return ok;
      }
    });
    this.addCommand({
      id: "copy-fork-receipt",
      name: "Copy fork receipt",
      checkCallback: (checking) => {
        const receipt = this.lastForkReceipt;
        if (receipt === null)
          return false;
        if (!checking) {
          void navigator.clipboard.writeText(receipt);
          new import_obsidian3.Notice("Thunderegg: fork receipt copied \u2014 paste it wherever you self-report.");
        }
        return true;
      }
    });
    this.registerObsidianProtocolHandler("distill-fork", (params) => {
      const mapId = params.map;
      if (!mapId) {
        new import_obsidian3.Notice("Thunderegg: fork link is missing ?map=\u2026");
        return;
      }
      void importForkedMap(this.app, this.settings.serverBaseUrl, mapId);
    });
    if (this.settings.refineryEnabled) {
      this.bootRefinery();
    }
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.renderRefineryStatus();
        this.decorateActiveLeaf();
      })
    );
    this.registerEvent(
      this.app.metadataCache.on("resolved", () => {
        if (this.settings.refineryEnabled) {
          this.buildBondGraph();
          this.renderRefineryStatus();
          this.decorateActiveLeaf();
        }
      })
    );
    this.registerInterval(
      window.setInterval(() => {
        void this.checkThundereggAvailable().then(() => this.renderThundereggStatus());
      }, 6e4)
    );
  }
  onunload() {
    this.stripRefineryBar();
  }
  /* ═════════════════════════════════════════════════════════════════
     Thunderegg availability
     ═════════════════════════════════════════════════════════════════ */
  async checkThundereggAvailable() {
    try {
      await fs3.promises.access(this.settings.enginePath, fs3.constants.X_OK);
      this.thundereggAvailable = true;
    } catch {
      this.thundereggAvailable = false;
    }
  }
  renderThundereggStatus() {
    this.statusThunderegg.empty();
    const dot = this.thundereggAvailable ? "\u{1F7E2}" : "\u{1F534}";
    const label = this.thundereggAvailable ? "Ready" : "Unavailable";
    this.statusThunderegg.createSpan({
      cls: "thunderegg-status",
      text: `\u2697\uFE0F ${label} ${dot}`
      // ⚗️
    });
    this.statusThunderegg.setAttribute(
      "aria-label",
      this.thundereggAvailable ? `Thunderegg engine: ${this.settings.enginePath}` : "Thunderegg engine not found \u2014 check Settings \u2192 Thunderegg"
    );
  }
  /* ═════════════════════════════════════════════════════════════════
     File conversion
     ═════════════════════════════════════════════════════════════════ */
  /** Resolve a vault-relative TFile to an absolute filesystem path. */
  absPath(file) {
    const adapter = this.app.vault.adapter;
    const base = adapter instanceof import_obsidian3.FileSystemAdapter ? adapter.getBasePath() : "";
    return path3.join(base, file.path);
  }
  /** Shell-escape a single argument (see core.ts). */
  shellQuote(s) {
    return shellQuote(s);
  }
  /**
   * Environment for an engine call. DISTILL_VAULT_PATH tells the engine which vault to enrich
   * against — convert.sh's own comment names this plugin as the setter; without it the engine
   * falls back to the Mac app's configured vault and writes bonds/wikilinks that resolve in
   * SOMEONE ELSE'S vault, not this one. maxBuffer is raised because a transcription run can
   * chat well past exec's 1 MB default over the minutes a recording takes.
   */
  engineEnv() {
    const env = { ...process.env };
    if (!this.settings.frontmatter)
      env["DISTILL_FRONTMATTER"] = "0";
    const adapter = this.app.vault.adapter;
    if (adapter instanceof import_obsidian3.FileSystemAdapter)
      env["DISTILL_VAULT_PATH"] = adapter.getBasePath();
    return env;
  }
  async convertFile(file) {
    const engine = this.settings.enginePath;
    const full = this.absPath(file);
    const notice = new import_obsidian3.Notice(
      isAudioVideo(file.extension) ? `Thunderegg: transcribing ${file.name} \u2014 recordings take a few minutes\u2026` : `Thunderegg: converting ${file.name}\u2026`,
      0
    );
    try {
      const env = this.engineEnv();
      await execAsync(
        `${this.shellQuote(engine)} ${this.shellQuote(full)}`,
        { env, maxBuffer: _ThundereggPlugin.ENGINE_MAX_BUFFER }
      );
      notice.hide();
      new import_obsidian3.Notice(`\u2705 Thunderegg: created ${file.name}.md`);
      if (this.settings.openAfter) {
        const mdPath = (0, import_obsidian3.normalizePath)(`${file.path}.md`);
        await sleep(300);
        const md = this.app.vault.getAbstractFileByPath(mdPath);
        if (md instanceof import_obsidian3.TFile)
          void this.app.workspace.getLeaf(true).openFile(md);
      }
    } catch (e) {
      notice.hide();
      if (isNoOcrError(e)) {
        new import_obsidian3.Notice(
          `Thunderegg couldn't read "${file.name}" \u2014 on-device OCR isn't available. Reinstall the Thunderegg app to enable image OCR.`,
          9e3
        );
        return;
      }
      new import_obsidian3.Notice(
        `\u274C Thunderegg failed: ${errMsg(e)}. Is the Thunderegg app installed?`,
        8e3
      );
      console.error("[Thunderegg]", e);
    }
  }
  async convertFolder(folder) {
    const targets = [];
    const walk = (f) => {
      if (f instanceof import_obsidian3.TFile && CONVERTIBLE.has(f.extension.toLowerCase())) {
        targets.push(f);
      } else if (f instanceof import_obsidian3.TFolder) {
        f.children.forEach(walk);
      }
    };
    walk(folder);
    if (targets.length === 0) {
      new import_obsidian3.Notice("Thunderegg: no convertible files here.");
      return;
    }
    const notice = new import_obsidian3.Notice(`Thunderegg: converting ${targets.length} files\u2026`, 0);
    let ok = 0;
    let noOcr = 0;
    for (const t of targets) {
      try {
        const env = this.engineEnv();
        await execAsync(
          `${this.shellQuote(this.settings.enginePath)} ${this.shellQuote(this.absPath(t))}`,
          { env, maxBuffer: _ThundereggPlugin.ENGINE_MAX_BUFFER }
        );
        ok++;
      } catch (e) {
        if (isNoOcrError(e))
          noOcr++;
        console.error("[Thunderegg]", t.path, e);
      }
    }
    notice.hide();
    let msg = `\u2705 Thunderegg: converted ${ok}/${targets.length} files.`;
    if (noOcr > 0) {
      msg += ` ${noOcr} image(s) need on-device OCR \u2014 reinstall the Thunderegg app to enable it.`;
    }
    new import_obsidian3.Notice(msg, noOcr > 0 ? 1e4 : void 0);
  }
  /* ═════════════════════════════════════════════════════════════════
     Clipboard conversion
     ═════════════════════════════════════════════════════════════════ */
  async convertClipboard() {
    let clipHtml = "";
    let clipText = "";
    try {
      if (!window.require)
        throw new Error("window.require unavailable");
      const electron = window.require("electron");
      const cb = electron.clipboard ?? electron.remote?.clipboard;
      if (cb) {
        clipHtml = cb.readHTML?.() ?? "";
        clipText = cb.readText?.() ?? "";
      }
    } catch {
      try {
        clipText = await navigator.clipboard.readText();
      } catch {
        new import_obsidian3.Notice("\u274C Could not read clipboard.");
        return;
      }
    }
    const content = clipHtml.trim() || clipText.trim();
    if (!content) {
      new import_obsidian3.Notice("Clipboard is empty.");
      return;
    }
    const ext = clipHtml.trim() ? "html" : "txt";
    const stamp = Date.now();
    const tempName = `_thunderegg_clip_${stamp}.${ext}`;
    const tempPath = (0, import_obsidian3.normalizePath)(tempName);
    const notice = new import_obsidian3.Notice("Thunderegg: converting clipboard\u2026", 0);
    try {
      await this.app.vault.create(tempPath, content);
      const tempFile = this.app.vault.getAbstractFileByPath(tempPath);
      if (!(tempFile instanceof import_obsidian3.TFile))
        throw new Error("Could not create temp file");
      const env = this.engineEnv();
      await execAsync(
        `${this.shellQuote(this.settings.enginePath)} ${this.shellQuote(this.absPath(tempFile))}`,
        { env, maxBuffer: _ThundereggPlugin.ENGINE_MAX_BUFFER }
      );
      await this.app.fileManager.trashFile(tempFile);
      notice.hide();
      const mdRawPath = (0, import_obsidian3.normalizePath)(`${tempPath}.md`);
      await sleep(400);
      const mdFile = this.app.vault.getAbstractFileByPath(mdRawPath);
      if (mdFile instanceof import_obsidian3.TFile) {
        const dateStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16).replace("T", " ").replace(":", "-");
        const niceName = `Clipboard ${dateStr}.md`;
        const nicePath = (0, import_obsidian3.normalizePath)(niceName);
        await this.app.fileManager.renameFile(mdFile, nicePath);
        new import_obsidian3.Notice(`\u2705 Thunderegg: created ${niceName}`);
        if (this.settings.openAfter) {
          const renamed = this.app.vault.getAbstractFileByPath(nicePath);
          if (renamed instanceof import_obsidian3.TFile) {
            void this.app.workspace.getLeaf(true).openFile(renamed);
          }
        }
      } else {
        new import_obsidian3.Notice("\u2705 Clipboard converted (file may take a moment to appear).");
      }
    } catch (e) {
      notice.hide();
      try {
        const tf = this.app.vault.getAbstractFileByPath(tempPath);
        if (tf instanceof import_obsidian3.TFile)
          await this.app.fileManager.trashFile(tf);
      } catch {
      }
      new import_obsidian3.Notice(`\u274C Clipboard conversion failed: ${errMsg(e)}`, 8e3);
      console.error("[Thunderegg]", e);
    }
  }
  /* ═════════════════════════════════════════════════════════════════
     Publish concept map (Canvas → distill.map/0.2)
     ═════════════════════════════════════════════════════════════════ */
  /** Open the Publish modal for a .canvas file. */
  async openPublishModal(file) {
    let canvas;
    try {
      canvas = JSON.parse(await this.app.vault.read(file));
    } catch (e) {
      new import_obsidian3.Notice(`Thunderegg: could not read canvas \u2014 ${errMsg(e)}`);
      return;
    }
    const ctx = {
      baseUrl: this.settings.serverBaseUrl,
      token: readDeviceToken(),
      blockedZones: this.settings.blockedZonesCsv.split(",").map((s) => s.trim()).filter(Boolean),
      distillVersion: this.manifest.version,
      defaultVisibility: this.settings.defaultVisibility,
      defaultLicense: this.settings.defaultLicense
    };
    let lineage;
    const notePath = (0, import_obsidian3.normalizePath)(file.path.replace(/[^/]+$/, `${file.basename} \u2014 source.md`));
    const note = this.app.vault.getAbstractFileByPath(notePath);
    if (note instanceof import_obsidian3.TFile) {
      lineage = parseLineageFrontmatter(await this.app.vault.read(note)) ?? void 0;
    }
    new PublishModal(this.app, canvas, file.basename, ctx, lineage).open();
  }
  /** Verify the Ed25519 signature on an exported .distill.json against its sidecar. */
  async verifyMapFile(file) {
    try {
      const json = await this.app.vault.read(file);
      const base = file.name.replace(/\.distill\.json$/i, "");
      const sidecarPath = (0, import_obsidian3.normalizePath)(file.path.replace(/[^/]+$/, `${base} \u2014 provenance.md`));
      const sidecar = this.app.vault.getAbstractFileByPath(sidecarPath);
      if (!(sidecar instanceof import_obsidian3.TFile)) {
        new import_obsidian3.Notice("Thunderegg: no provenance sidecar found next to this map \u2014 can't verify.");
        return;
      }
      const sig = parseSidecarSignature(await this.app.vault.read(sidecar));
      if (!sig) {
        new import_obsidian3.Notice("Thunderegg: sidecar has no signature block \u2014 this map is unsigned.");
        return;
      }
      const ok = verifyBytes(json, sig.signature, sig.public_key);
      new import_obsidian3.Notice(
        ok ? `\u2705 Signature valid \u2014 authored by key ${keyFingerprint(sig.public_key)} (${sig.algo}).` : "\u274C Signature INVALID \u2014 the map may have been altered or re-signed.",
        ok ? 8e3 : 1e4
      );
    } catch (e) {
      new import_obsidian3.Notice(`Thunderegg: verify failed \u2014 ${errMsg(e)}`);
    }
  }
  /** Fork a local .distill.json into Forked/, verifying its signature first. */
  async forkMapFile(file) {
    try {
      const json = await this.app.vault.read(file);
      const base = file.name.replace(/\.distill\.json$/i, "");
      const sidecarPath = (0, import_obsidian3.normalizePath)(file.path.replace(/[^/]+$/, `${base} \u2014 provenance.md`));
      const sidecar = this.app.vault.getAbstractFileByPath(sidecarPath);
      let fingerprint = null;
      let problem = null;
      if (!(sidecar instanceof import_obsidian3.TFile)) {
        problem = "no provenance sidecar found next to this map";
      } else {
        const sig = parseSidecarSignature(await this.app.vault.read(sidecar));
        if (!sig) {
          problem = "the sidecar has no signature block (unsigned map)";
        } else if (!verifyBytes(json, sig.signature, sig.public_key)) {
          problem = "the signature is INVALID \u2014 the map may have been altered";
        } else {
          fingerprint = keyFingerprint(sig.public_key);
        }
      }
      const run = async () => {
        const receipt = await forkMapFileIntoVault(this.app, file.path, json, fingerprint);
        if (receipt)
          this.lastForkReceipt = receipt;
      };
      if (problem) {
        new import_obsidian3.Notice(`Thunderegg: ${problem}.`, 8e3);
        new ConfirmForkModal(this.app, problem, () => {
          void run();
        }).open();
      } else {
        await run();
      }
    } catch (e) {
      new import_obsidian3.Notice(`Thunderegg: fork failed \u2014 ${errMsg(e)}`);
    }
  }
  /* ═════════════════════════════════════════════════════════════════
     Refinery — Grades · Bonds · Condensers
     ═════════════════════════════════════════════════════════════════ */
  /** Called once when Refinery is first enabled or on plugin load. */
  bootRefinery() {
    this.buildBondGraph();
    this.renderRefineryStatus();
    this.app.workspace.onLayoutReady(() => this.decorateActiveLeaf());
  }
  /** Tear down Refinery visuals. */
  teardownRefinery() {
    this.stripRefineryBar();
    this.bonds = emptyBondGraph();
    this.renderRefineryStatus();
  }
  /* ── Bond graph ─────────────────────────────────────────────── */
  /** Build the Bond graph from Obsidian's resolved-link cache (see core.ts). */
  buildBondGraph() {
    this.bonds = buildBondGraph(
      this.app.metadataCache.resolvedLinks,
      this.settings.vaultRoot
    );
  }
  /* ── Grade helpers ──────────────────────────────────────────── */
  /** Read the `grade` frontmatter field of a markdown file. */
  getGrade(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    return normalizeGrade(cache?.frontmatter?.["grade"]);
  }
  /* ── Bond helpers ───────────────────────────────────────────── */
  /** Total bond count = outgoing links + incoming links. */
  getBondCount(filePath) {
    return bondCount(this.bonds, filePath);
  }
  /* ── Condenser helpers ──────────────────────────────────────── */
  /** A note is a Condenser when its bond count meets the threshold. */
  isCondenser(filePath) {
    return isCondenser(this.bonds, filePath, this.settings.condenserThreshold);
  }
  /** Return Condenser notes that link TO the given file. */
  getReferencingCondensers(filePath) {
    return referencingCondensers(
      this.bonds,
      filePath,
      this.settings.condenserThreshold
    );
  }
  /* ── Status-bar Refinery section ────────────────────────────── */
  renderRefineryStatus() {
    this.statusRefinery.empty();
    if (!this.settings.refineryEnabled)
      return;
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md")
      return;
    const grade = this.getGrade(file);
    const bondCount2 = this.getBondCount(file.path);
    const condenser = this.isCondenser(file.path);
    const wrap = this.statusRefinery.createSpan({ cls: "thunderegg-refinery-status" });
    if (grade && this.settings.showGradeBadges) {
      const m = GRADE_META[grade];
      if (m) {
        wrap.createSpan({
          cls: `thunderegg-grade thunderegg-grade-${m.css}`,
          text: `${m.icon} ${m.label}`
        });
      }
    }
    if (this.settings.showBondCounts) {
      wrap.createSpan({
        cls: "thunderegg-bonds",
        text: `\u{1F517} ${bondCount2}`
        // 🔗
      });
    }
    if (condenser) {
      wrap.createSpan({
        cls: "thunderegg-condenser-badge",
        text: "\u2697\uFE0F Condenser"
        // ⚗️
      });
    }
  }
  /* ── Refinery info bar inside the active leaf ────────────────── */
  decorateActiveLeaf() {
    this.stripRefineryBar();
    if (!this.settings.refineryEnabled)
      return;
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md")
      return;
    const view = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!view)
      return;
    const grade = this.getGrade(file);
    const bondCount2 = this.getBondCount(file.path);
    const condenser = this.isCondenser(file.path);
    const condenserRefs = this.settings.showCondenserLinks ? this.getReferencingCondensers(file.path) : [];
    if (!grade && bondCount2 === 0 && condenserRefs.length === 0)
      return;
    const bar = createDiv({ cls: "thunderegg-refinery-bar" });
    if (grade && this.settings.showGradeBadges) {
      const m = GRADE_META[grade];
      if (m) {
        bar.createSpan({
          cls: `thunderegg-grade thunderegg-grade-${m.css}`,
          text: `${m.icon} ${m.label}`
        });
      }
    }
    if (this.settings.showBondCounts && bondCount2 > 0) {
      bar.createSpan({
        cls: "thunderegg-bonds",
        text: `\u{1F517} ${bondCount2} bond${bondCount2 === 1 ? "" : "s"}`
      });
    }
    if (condenser) {
      bar.createSpan({
        cls: "thunderegg-condenser-badge",
        text: "\u2697\uFE0F Condenser"
      });
    }
    if (condenserRefs.length > 0) {
      const linksEl = bar.createSpan({ cls: "thunderegg-condenser-links" });
      linksEl.createSpan({ text: "Hub: " });
      condenserRefs.forEach((cPath, i) => {
        const name = cPath.replace(/\.md$/, "").split("/").pop() ?? cPath;
        const a = linksEl.createEl("a", {
          cls: "internal-link",
          text: name,
          href: cPath
        });
        a.addEventListener("click", (ev) => {
          ev.preventDefault();
          const target = this.app.vault.getAbstractFileByPath(cPath);
          if (target instanceof import_obsidian3.TFile) {
            void this.app.workspace.getLeaf(false).openFile(target);
          }
        });
        if (i < condenserRefs.length - 1) {
          linksEl.createSpan({ text: ", " });
        }
      });
    }
    const viewContent = view.containerEl.querySelector(".view-content");
    if (viewContent) {
      viewContent.insertBefore(bar, viewContent.firstChild);
      this.refineryBarEl = bar;
    }
  }
  /** Remove Refinery bar from the DOM. */
  stripRefineryBar() {
    this.refineryBarEl?.remove();
    this.refineryBarEl = null;
    activeDocument.querySelectorAll(".thunderegg-refinery-bar").forEach((el) => el.remove());
  }
  /* ═════════════════════════════════════════════════════════════════
     Persistence
     ═════════════════════════════════════════════════════════════════ */
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
_ThundereggPlugin.ENGINE_MAX_BUFFER = 10 * 1024 * 1024;
var ThundereggPlugin = _ThundereggPlugin;
function sleep(ms) {
  return new Promise((r) => window.setTimeout(r, ms));
}
function errMsg(e) {
  return e instanceof Error ? e.message : String(e);
}
var ThundereggSettingTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("p", {
      text: "Converts attachments on-device via the Thunderegg engine. The Refinery adds note-maturity Grades, wikilink Bonds, and hub-note Condensers to your vault.",
      cls: "setting-item-description"
    });
    new import_obsidian3.Setting(containerEl).setName("Conversion").setHeading();
    new import_obsidian3.Setting(containerEl).setName("Engine path").setDesc("Full path to the Thunderegg convert.sh helper script.").addText(
      (t) => t.setPlaceholder(DEFAULT_SETTINGS.enginePath).setValue(this.plugin.settings.enginePath).onChange(async (v) => {
        this.plugin.settings.enginePath = v.trim();
        await this.plugin.saveSettings();
        await this.plugin.checkThundereggAvailable();
        this.plugin.renderThundereggStatus();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Add YAML frontmatter").setDesc(
      "Prepend title / source / type / tags so converted notes land with full Properties."
    ).addToggle(
      (t) => t.setValue(this.plugin.settings.frontmatter).onChange(async (v) => {
        this.plugin.settings.frontmatter = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Open after converting").setDesc("Automatically open the resulting .md in a new pane.").addToggle(
      (t) => t.setValue(this.plugin.settings.openAfter).onChange(async (v) => {
        this.plugin.settings.openAfter = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Refinery").setHeading();
    const refineryDesc = containerEl.createDiv({
      cls: "setting-item-description thunderegg-refinery-desc"
    });
    refineryDesc.createEl("p", {
      text: "The Refinery is Thunderegg\u2019s knowledge-management layer \u2014 free, like everything else. It introduces three concepts:"
    });
    const ul = refineryDesc.createEl("ul");
    const liGrades = ul.createEl("li");
    liGrades.createEl("strong", { text: "Grades" });
    liGrades.appendText(" \u2014 note maturity: ");
    liGrades.createEl("em", { text: "Blank \u2192 Rough \u2192 Polished \u2192 Crystal \u2192 Gem" });
    const liBonds = ul.createEl("li");
    liBonds.createEl("strong", { text: "Bonds" });
    liBonds.appendText(" \u2014 connections discovered via ");
    liBonds.createEl("code", { text: "[[wikilinks]]" });
    const liCondensers = ul.createEl("li");
    liCondensers.createEl("strong", { text: "Condensers" });
    liCondensers.appendText(" \u2014 hub notes with many Bonds");
    new import_obsidian3.Setting(containerEl).setName("Enable Refinery").setDesc("Show Grade badges, Bond counts, and Condenser links in the UI.").addToggle(
      (t) => t.setValue(this.plugin.settings.refineryEnabled).onChange(async (v) => {
        this.plugin.settings.refineryEnabled = v;
        await this.plugin.saveSettings();
        if (v) {
          this.plugin.bootRefinery();
        } else {
          this.plugin.teardownRefinery();
        }
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Vault root for bond discovery").setDesc(
      'Limit bond scanning to a subfolder (e.g. "Notes"). Leave empty to scan the entire vault.'
    ).addText(
      (t) => t.setPlaceholder("(entire vault)").setValue(this.plugin.settings.vaultRoot).onChange(async (v) => {
        this.plugin.settings.vaultRoot = v.trim();
        await this.plugin.saveSettings();
        if (this.plugin.settings.refineryEnabled) {
          this.plugin.buildBondGraph();
        }
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Condenser threshold").setDesc(
      "Minimum number of Bonds for a note to be flagged as a Condenser (hub note)."
    ).addSlider(
      (s) => s.setLimits(2, 30, 1).setValue(this.plugin.settings.condenserThreshold).setDynamicTooltip().onChange(async (v) => {
        this.plugin.settings.condenserThreshold = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Show grade badges").setDesc("Display Vapor / Distillate / Essence maturity indicators.").addToggle(
      (t) => t.setValue(this.plugin.settings.showGradeBadges).onChange(async (v) => {
        this.plugin.settings.showGradeBadges = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Show bond counts").setDesc("Display the number of wikilink connections for the active note.").addToggle(
      (t) => t.setValue(this.plugin.settings.showBondCounts).onChange(async (v) => {
        this.plugin.settings.showBondCounts = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Show condenser links").setDesc("When viewing a note, list which Condenser (hub) notes reference it.").addToggle(
      (t) => t.setValue(this.plugin.settings.showCondenserLinks).onChange(async (v) => {
        this.plugin.settings.showCondenserLinks = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Publish & Community").setHeading();
    containerEl.createEl("p", {
      cls: "setting-item-description",
      text: "Publish a Canvas as a concept map to the server configured below. Nothing is sent unless you explicitly publish; your vault never leaves your machine."
    });
    new import_obsidian3.Setting(containerEl).setName("Server URL").setDesc("Where maps are published.").addText(
      (t) => t.setValue(this.plugin.settings.serverBaseUrl).onChange(async (v) => {
        this.plugin.settings.serverBaseUrl = v.trim() || DEFAULT_SETTINGS.serverBaseUrl;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Device token").setDesc(
      hasDeviceToken() ? "A device token is connected (stored outside your vault). Paste a new one to replace it." : "Paste a publish-only device token from your server's settings page. Stored outside your vault \u2014 never in plugin data."
    ).addText((t) => {
      t.inputEl.type = "password";
      t.setPlaceholder(hasDeviceToken() ? "\u2022\u2022\u2022\u2022 connected \u2022\u2022\u2022\u2022" : "paste token").onChange((v) => {
        const tok = v.trim();
        if (tok)
          writeDeviceToken(tok);
      });
    }).addExtraButton(
      (b) => b.setIcon("trash").setTooltip("Disconnect (delete local token)").onClick(() => {
        clearDeviceToken();
        new import_obsidian3.Notice("Thunderegg: device token removed.");
        this.display();
      })
    );
    const fp = signingKeyFingerprint();
    new import_obsidian3.Setting(containerEl).setName("Signing key").setDesc(
      fp ? `Maps are signed with device key ${fp} (Ed25519). The public key travels in each exported map's sidecar so others can verify you authored it.` : "An Ed25519 signing key is created on your first export, stored outside your vault. Its public key travels with each map so others can verify authorship."
    );
    new import_obsidian3.Setting(containerEl).setName("Default visibility").setDesc("Pre-selected visibility for new publishes.").addDropdown((d) => {
      ["private", "followers", "public"].forEach((v) => {
        d.addOption(v, v);
      });
      d.setValue(this.plugin.settings.defaultVisibility).onChange(async (v) => {
        this.plugin.settings.defaultVisibility = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian3.Setting(containerEl).setName("Default map license").addText(
      (t) => t.setValue(this.plugin.settings.defaultLicense).onChange(async (v) => {
        this.plugin.settings.defaultLicense = v.trim() || "user-generated";
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Blocked privacy zones").setDesc("Comma-separated tags that block publishing (checked on-device).").addText(
      (t) => t.setValue(this.plugin.settings.blockedZonesCsv).onChange(async (v) => {
        this.plugin.settings.blockedZonesCsv = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian3.Setting(containerEl).setName("Get the app").setHeading();
    const cta = containerEl.createEl("p", {
      cls: "setting-item-description"
    });
    cta.appendText(
      "Thunderegg converts 30+ file types to clean Markdown \u2014 including meeting recordings, transcribed on-device \u2014 100% on your Mac, free. Get the Mac app at "
    );
    cta.createEl("a", { href: "https://thunderegg.ai", text: "thunderegg.ai" });
    cta.appendText(".");
  }
};

/* nosourcemap */