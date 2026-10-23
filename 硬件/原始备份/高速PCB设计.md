## 高速PCB设计规范

TEACHER LECTURE TEMPLATE 

## 目录 CONTENTS

高速PCB板材选择
高速PCB叠层设计
高速PCB模块化布局
高速PCB常用存储器设置
高速PCB常用接口设计 

## 高速PCB板材选择

- Dielectric constant 介电常数 

- Dielectric loss 介电损耗 

- TCDk 介电常数的热变化率 

- Moisture absorption 吸湿性 

• Thermal conductivity 导热系数 

- CTE 热膨胀系数 

- Peel strength 剥离强度 

- Copper roughness 铜皮粗糙度 

- Dielectric constant 

- Dielectric loss 

- TCDk 

- Moisture absorption 

• Thermal conductivity. 

- CTE 

- Peel strength 

- Copper roughness (1) Typical values are a representation of an average value for the population of the property. Port specification values contact Rogers Corporation.
(2) The design (i.e. an average number from several different tested lots of material and on the incrt common thicknesses. If more detailed information is required, please contact Rogers Corporation or refer to Rogers Technical papers in the Rogers Technology Support Web at www.rogercorp.com/techb 

<table><tr><td colspan="6">TYPICAL VALUE<eq>^{1}</eq></td></tr><tr><td>PROPERTY</td><td>BO3003G2</td><td>Direction</td><td>Unit</td><td>Condition</td><td>Test Method</td></tr><tr><td>Dielectric Constant, e, Process</td><td>3.00 ± 0.04</td><td>Z</td><td>-</td><td>10 GHz 23°C</td><td>IPC-TM-6502.5.5.5Clamped Stripline</td></tr><tr><td><eq>^{a}</eq>Dielectric Constant, e, Design</td><td>3.07</td><td>Z</td><td>-</td><td>77 GHZ</td><td>Differential PhaseLength Method</td></tr><tr><td>Dissipation Factor, tan d</td><td>0.0011</td><td>Z</td><td>-</td><td>10 GHz 23°C</td><td>IPC-TM-6502.5.5.5</td></tr><tr><td>Thermal Coefficient of e,</td><td>-35</td><td>Z</td><td>ppm/°C</td><td>10 GHz-50 to 150°C</td><td>IPC-TM-6502.5.5.5</td></tr><tr><td>Dimen sional Stability</td><td>-0.16-0.14</td><td>X Y</td><td>mm/m</td><td>Method C</td><td>IPC TM-650 2.2.4</td></tr><tr><td>Volume Resistivity</td><td>1.4 × 10<eq>^{9}</eq></td><td>-</td><td>MO·cm</td><td>CON D A</td><td>IPC 2.5.17.1</td></tr><tr><td>Surface Resistivity</td><td>2.6 × 10<eq>^{9}</eq></td><td>-</td><td>MO</td><td>CON D A</td><td>IPC 2.5.17.1</td></tr><tr><td>Tensile Modulus</td><td>378396</td><td>X Y</td><td>ksi</td><td>23°C</td><td>ASTM D638</td></tr><tr><td>Moisture Absorption</td><td>0.06</td><td>-</td><td>%</td><td>D48/50</td><td>IPC-TM-6502.6.2.1</td></tr><tr><td>Specific Heat</td><td>0.730.83</td><td>Z</td><td>J/g/K</td><td>0°C50°C</td><td>ASTM E1269-11</td></tr><tr><td>Thermal Conductivity</td><td>0.43</td><td>Z</td><td>W/m/K</td><td>50°C</td><td>ASTM D5470</td></tr><tr><td>Coefficient of Thermal Expansion</td><td>161718</td><td>X Y Z</td><td>ppm/°C</td><td>23°C/50% RH</td><td>IPC-TM-650 2.4.41</td></tr><tr><td>Td</td><td>500</td><td>-</td><td>°C TGA</td><td>-</td><td>ASTM D3850</td></tr><tr><td>Density</td><td>2.15</td><td>-</td><td>gm/cm<eq>^{2}</eq></td><td>23°C</td><td>ASTM D792</td></tr><tr><td>Copper Peel Strength</td><td>12.0</td><td>-</td><td>lb/in</td><td>1/2 oz. EDCAfter Solder Float</td><td>IPC-TM-2.4.8</td></tr><tr><td>Flammability</td><td>V-0</td><td>-</td><td>-</td><td>-</td><td>UL94</td></tr><tr><td>Lead Free Process Compatible</td><td>YES</td><td>-</td><td>-</td><td>-</td><td>-</td></tr></table>

<table><tr><td>Surface Roughness (Sq)</td><td>Surface Area Index</td><td>Average Nodule Size</td></tr><tr><td>0.7 μm sq</td><td>277</td><td>0.2 μm</td></tr></table>

<table><tr><td>Standard Thickness</td><td>Standard Panel Size</td><td>Available Copper Cladding</td></tr><tr><td>0.005&quot; (0.15 min)</td><td>24&quot;x106(10×457 min)</td><td>% oz (10μm) very low profile (VLB electrodeposited copper foil)</td></tr><tr><td>0.010&quot; (0.25 min)</td><td>24&quot;x217(610×533 min)</td><td>1 oz (500 μm) very low profile (VLB electrodeposited copper foil)</td></tr></table>

## PCB板材选择

## 以Dk或Df值为关注点

<table><tr><td>信号速率</td><td>1~5Gbps</td><td>5~10Gbps</td><td>10~25Gbps</td><td>&gt;25Gbps</td></tr><tr><td>推荐材料</td><td>TU-862 HF S7038</td><td>TU-872 SLK 
Synamic4(S7439) TU863</td><td>M6 (R-5775) TU-883</td><td>M7 (R-5785NE) TU933</td></tr></table>

## 射频微波

<table><tr><td>频率</td><td>&lt;20GHz</td><td>20~40GHz</td><td>&gt;40GHz</td></tr><tr><td>推荐材料</td><td>R04350B</td><td>R03003</td><td>RT5880</td></tr></table>

## 介电常数Dk&介质损耗因子Df

介电常数Dk 

Dk即Dielectric constant的简称，中文名叫介电常数，又叫介质常数或介电系数，它是表示绝缘能力特性的一个系数，以字母ε表示。在工程应用中，介电常数时常以相对介电常数的形式来表达，而不是绝对值，常见应用有计算阻抗和时延。Dk越小越好，对高速信号越好。 

介质损耗因子Df 

Df即Dissipationfactor的简称，中文名叫介质损耗因子，又叫阻尼因子、内耗(internal dissipation)或损耗角正切(loss tangent)，是材料在交变力场作用下应变与应力周期相位差角的正切，也等于该材料的损耗模量与储能模量之比（通俗讲就是信号线中已漏失在绝缘板材中的能量，与尚存在线中能量的比值）。 


不同等级PCB板材与常规油墨介电常数和损耗因子


<table><tr><td>类型</td><td>常规FR-4</td><td>Middle Loss</td><td>Low Loss</td><td>Very Low Loss</td><td>Super Low Loss</td><td>阻焊油墨</td></tr><tr><td>介电常数/<eq>D_k</eq></td><td>3.9~4.5</td><td>3.6~4.4</td><td>3.2~3.8</td><td>3.1~3.6</td><td>2.5~3.2</td><td>~3.9</td></tr><tr><td>损耗因子<eq>D_f</eq></td><td>~0.02</td><td>0.01~0.02</td><td>0.01~0.006</td><td>0.003~0.006</td><td>0.003</td><td>0.02~0.04</td></tr></table>


注：不同板材等级划分主要依据其损耗因子的大小，表中介电常数值仅代表常规情况下范围. 


## 1

一般地，按损耗因子的高低，基板材料可分为五个等级： 

Standard Loss (Df: 0.015-0.020) 

Mid Loss (Df: 0.010-0.015) 

Low Loss (Df: 0.0065-0.01) 

Very Low Loss (Df: 0.003-0.0065) 

Ultra Low Loss (Df: <0.003) 

Df越小越好，介质损耗就越少。 

以DK DF值为关注点 

<table><tr><td>信号速率</td><td>1-5Gbps</td><td>5-10Gbps</td><td>10-25Gbps</td><td>&gt;25Gbps</td></tr><tr><td>推荐材料</td><td>TU-862 HF</td><td>TU-872 SLK</td><td>M6</td><td>M7</td></tr></table>

## 射频微波

<table><tr><td>频率</td><td>&lt;20GHz</td><td>20-40GHz</td><td>&gt;40GHz</td></tr><tr><td>推荐材料</td><td>R04350B</td><td>R03003</td><td>RT5880</td></tr></table>

## 高速PCB叠层设计

## 2

## PCB叠层的重要性

随着技术的发展，通讯行业芯片的速率也越来越高，对PCB板上信号质量和电源的完整性的要求也越来越严格。芯片的集成度、工作频率越来越高，因此信号传输的速率也越来越快。高速信号的处理也显得越来越重要了。完整的参考平面可以用来保证回路的连续性，宽的线宽可以降低信号的导体损耗，背钻工艺可以减小过孔的Stub，提高信号的完整性，但是这样往往会导致成本的增加。 

优秀的pcb叠层设计对于减少pcb回路和相关电路的辐射 

## 2 常用PCB叠层

四层:
信号层1----优质布线层
地线层----
电源层----
信号层2----易耦合电源噪声

六层:
信号层1----优质布线层
地线层----
信号层2----优质布线层
电源层----
地线层----
信号层3----优质布线层

可以用信号层2铺地补偿，优化翘曲度 

## 2 常用PCB叠层

八层:
信号层1----优质布线层
地线层----
信号层2----优质布线层
电源层1----
电源层2----
信号层3----优质布线层
地线层----
信号层3----优质布线层
用信号层3铺地优化翘曲度 

## 2 常用PCB叠层

## 十二层:

信号层1----优质布线层
地线层----
信号层2----优质布线层
地线层----
信号层3----优质布线层
电源层1----
电源层2----
信号层4----优质布线层
地线层----
信号层5----优质布线层
地线层----
信号层6----优质布线层 

## 十四层：

信号层1----优质布线层
地线层----
信号层2----优质布线层
电源层1----
信号层3----优质布线层
地线层----
信号层4----
信号层5----
地线层----
信号层6----优质布线层
电源层2----
信号层7----优质布线层
地线层----
信号层8----优质布线层 

## 2

## 2 常用PCB叠层

## 十六层:

信号层1----优质布线层
地线层----
信号层2----优质布线层
地线层----
信号层3----优质布线层
地线层----
信号层4----优质布线层
电源层1----
电源层2----
信号层5----优质布线层
地线层----
信号层6----优质布线层
地线层----
信号层7----优质布线层
地线层----
信号层8----优质布线层 

## 十八层：

信号层1----优质布线层
地线层----
信号层2----优质布线层
地线层----
信号层3----优质布线层
地线层----
信号层4----优质布线层
地线层----
电源层1----
电源层2----
地线层----
信号层5----优质布线层
地线层----
信号层6----优质布线层
地线层----
信号层7----优质布线层
地线层----
信号层8----优质布线层 

## 2

## 阻抗要求

根据PCB设计要求中阻抗要求，需将阻抗要求提供板厂。 

提板厂材料: 

1.板材（TU752/TU872/M6/M7）根据信号速率来选择 

2. 板厚（常用板厚1.6mm/1.8mm/2.0mm/2.2mm/2.4mm/2.6mm/2.8mm/3.0mm） 

3.叠层 (6/8/10/12/14/16/18/20) 

4.铜厚（如板中BGA核电较大可加厚内层铜厚） 

5.阻抗（单端50ohm 差分100ohm USB阻抗一般为90ohm PCIE阻抗一般为85ohm 等）具体需要参考数据手册 

## 2

## 阻抗

<table><tr><td>TOP</td><td></td><td></td><td></td><td>0.333 Oz+Plating</td></tr><tr><td></td><td>PP</td><td>TU-87P SLK</td><td>2116</td><td>4.88(mil)</td></tr><tr><td>GND02</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-872 SLK</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>ART03</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-87P SLK</td><td>106+1080</td><td>5.14(mil)</td></tr><tr><td>GND04</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-872 SLK</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>ART05</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-87P SLK</td><td>106+1080</td><td>5.14(mil)</td></tr><tr><td>GND06</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-872 SLK</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>ART07</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-87P SLK</td><td>106+1080</td><td>5.01(mil)</td></tr><tr><td>PWR08</td><td></td><td></td><td></td><td>1 Oz</td></tr><tr><td></td><td>Core</td><td>TU-872 SLK</td><td>0.38</td><td>14.96(mil)</td></tr><tr><td>PWR09</td><td></td><td></td><td></td><td>1 Oz</td></tr><tr><td></td><td>PP</td><td>TU-87P SLK</td><td>106+1080</td><td>5.01(mil)</td></tr><tr><td>ART10</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-872 SLK</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>GND11</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-87P SLK</td><td>106+1080</td><td>5.14(mil)</td></tr><tr><td>ART12</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-872 SLK</td><td>0.11</td><td>4.33(mil)</td></tr></table>

<table><tr><td rowspan="2">GND13</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td>PP</td><td>TU-87P SLK</td><td>106+1080</td><td>5.14(mil)</td></tr><tr><td rowspan="2">ART14</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td>Core</td><td>TU-872 SLK</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td rowspan="2">GND15</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td>PP</td><td>TU-87P SLK</td><td>2116</td><td>4.88(mil)</td></tr><tr><td>BOTTOM</td><td></td><td></td><td></td><td>0.333 Oz+Plating</td></tr></table>

<table><tr><td>控制</td><td>屏蔽</td><td>阻抗类型</td><td>要求值</td><td>阻抗要求</td><td>盖油</td><td>H1</td><td>Er1</td><td>H2</td><td>Er2</td></tr><tr><td>TOP</td><td>GND02</td><td>单端</td><td>8.9</td><td>50+/-10%</td><td>是</td><td>4.88</td><td>3.52</td><td></td><td></td></tr><tr><td>TOP</td><td>GND02</td><td>差分</td><td>5.8/6.3</td><td>100+/-10%</td><td>是</td><td>4.88</td><td>3.52</td><td></td><td></td></tr><tr><td>ART03</td><td>GND02/GND04</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.74</td><td>3.14</td></tr><tr><td>ART03</td><td>GND02/GND04</td><td>差分</td><td>4.3/6</td><td>100+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.74</td><td>3.14</td></tr><tr><td>ART05</td><td>GND04/GND06</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.74</td><td>3.14</td></tr><tr><td>ART05</td><td>GND04/GND06</td><td>差分</td><td>4.3/6</td><td>100+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.74</td><td>3.14</td></tr><tr><td>ART07</td><td>GND06/PWR08</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.61</td><td>3.14</td></tr><tr><td>ART07</td><td>GND06/PWR08</td><td>差分</td><td>4.3/6</td><td>100+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.61</td><td>3.14</td></tr><tr><td>ART10</td><td>PWR09/GND11</td><td>差分</td><td>4.3/6</td><td>100+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.61</td><td>3.14</td></tr><tr><td>ART10</td><td>PWR09/GND11</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.61</td><td>3.14</td></tr><tr><td>ART12</td><td>GND11/GND13</td><td>差分</td><td>4.3/6</td><td>100+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.74</td><td>3.14</td></tr><tr><td>ART12</td><td>GND11/GND13</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.74</td><td>3.14</td></tr><tr><td>ART14</td><td>GND13/GND15</td><td>差分</td><td>4.3/6</td><td>100+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.74</td><td>3.14</td></tr><tr><td>ART14</td><td>GND13/GND15</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.61</td><td>5.74</td><td>3.14</td></tr><tr><td>BOTTOM</td><td>GND15</td><td>差分</td><td>5.8/6.3</td><td>100+/-10%</td><td>是</td><td>4.88</td><td>3.52</td><td></td><td></td></tr><tr><td>BOTTOM</td><td>GND15</td><td>单端</td><td>8.9</td><td>50+/-10%</td><td>是</td><td>4.88</td><td>3.52</td><td></td><td></td></tr></table>

## 2

## 阻抗

<table><tr><td>TOP</td><td></td><td></td><td></td><td>0.333 Oz+Plating</td></tr><tr><td></td><td>PP</td><td>TU-75P</td><td>106+1080</td><td>5.27(mil)</td></tr><tr><td>GND02</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-752</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>ART03</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-75P</td><td>1080*2</td><td>6.06(mil)</td></tr><tr><td>GND04</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-752</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>ART05</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-75P</td><td>1080*2</td><td>6.04(mil)</td></tr><tr><td>GND06</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-752</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>PWR07</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-75P</td><td>1080*2</td><td>6.14(mil)</td></tr><tr><td>PWR08</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-752</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>GND09</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-75P</td><td>1080*2</td><td>6.06(mil)</td></tr><tr><td>ART10</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-752</td><td>0.11</td><td>4.33(mil)</td></tr><tr><td>GND11</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-75P</td><td>1080*2</td><td>6.05(mil)</td></tr><tr><td>ART12</td><td></td><td></td><td></td><td>0.5 Oz</td></tr></table>

<table><tr><td>控制</td><td>屏蔽</td><td>阻抗类型</td><td>要求值</td><td>阻抗要求</td><td>盖油</td><td>H1</td><td>Er1</td><td>H2</td></tr><tr><td>TOP</td><td>GND02</td><td>单端</td><td>9.6</td><td>50+/-10%</td><td>是</td><td>5.27</td><td>3.52</td><td></td></tr><tr><td>TOP</td><td>ART03</td><td>单端</td><td>20</td><td>50+/-10%</td><td>是</td><td>10.2</td><td>3.55</td><td></td></tr><tr><td>TOP</td><td>GND02</td><td>差分</td><td>5.7/5.8</td><td>100+/-10%</td><td>是</td><td>5.27</td><td>3.52</td><td></td></tr><tr><td>ART10</td><td>GND09/GND11</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.6</td><td>6.70</td></tr><tr><td>ART12</td><td>GND11/GND13</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.6</td><td>6.69</td></tr><tr><td>BOTTOM</td><td>GND13</td><td>单端</td><td>9.6</td><td>50+/-10%</td><td>是</td><td>5.27</td><td>3.52</td><td></td></tr><tr><td>ART03</td><td>GND02/GND04</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.6</td><td>6.71</td></tr><tr><td>ART05</td><td>GND04/GND06</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.6</td><td>6.69</td></tr><tr><td>PWR07</td><td>GND06/PWR08</td><td>单端</td><td>4.9</td><td>50+/-10%</td><td></td><td>4.33</td><td>3.6</td><td>6.79</td></tr></table>

## 2

## 阻抗

<table><tr><td>TOP</td><td></td><td></td><td></td><td>0.5 Oz+Plating</td></tr><tr><td></td><td>PP</td><td>TU-768P</td><td>2116</td><td>4.50(mil)</td></tr><tr><td>GND02</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-768</td><td>0.15</td><td>5.91(mil)</td></tr><tr><td>ART03</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-768P</td><td>1080+2116</td><td>7.26(mil)</td></tr><tr><td>GND04</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-768</td><td>0.15</td><td>5.91(mil)</td></tr><tr><td>ART05</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-768P</td><td>1080+2116</td><td>7.14(mil)</td></tr><tr><td>PWR06</td><td></td><td></td><td></td><td>1 Oz</td></tr><tr><td></td><td>Core</td><td>TU-768</td><td>0.15</td><td>5.91(mil)</td></tr><tr><td>GND07</td><td></td><td></td><td></td><td>1 Oz</td></tr><tr><td></td><td>PP</td><td>TU-768P</td><td>1080+2116</td><td>7.14(mil)</td></tr><tr><td>ART08</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-768</td><td>0.15</td><td>5.91(mil)</td></tr><tr><td>GND09</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-768P</td><td>1080+2116</td><td>7.26(mil)</td></tr><tr><td>ART10</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>Core</td><td>TU-768</td><td>0.15</td><td>5.91(mil)</td></tr><tr><td>GND11</td><td></td><td></td><td></td><td>0.5 Oz</td></tr><tr><td></td><td>PP</td><td>TU-768P</td><td>2116</td><td>4.50(mil)</td></tr><tr><td>BOTTOM</td><td></td><td></td><td></td><td>0.5 Oz+Plating</td></tr></table>

<table><tr><td>控制</td><td>屏蔽</td><td>阻抗类型</td><td>要求值</td><td>阻抗要求</td><td>盖油</td><td>H1</td><td>Er1</td><td>H2</td><td>Er2</td></tr><tr><td>TOP</td><td>GND02</td><td>单端</td><td>6.9</td><td>50+/-10%</td><td>是</td><td>4.5</td><td>4.25</td><td></td><td></td></tr><tr><td>TOP</td><td>GND02</td><td>差分</td><td>4.8/6.9</td><td>100+/-10%</td><td>是</td><td>4.5</td><td>4.25</td><td></td><td></td></tr><tr><td>TOP</td><td>GND02</td><td>差分</td><td>6.2/7</td><td>90+/-10%</td><td>是</td><td>4.5</td><td>4.25</td><td></td><td></td></tr><tr><td>ART10</td><td>GND09/GND11</td><td>差分</td><td>4.5/6</td><td>100+/-10%</td><td></td><td>5.91</td><td>3.95</td><td>7.91</td><td>4.07</td></tr><tr><td>ART10</td><td>GND09/GND11</td><td>单端</td><td>5.9</td><td>50+/-10%</td><td></td><td>5.91</td><td>3.95</td><td>7.91</td><td>4.07</td></tr><tr><td>BOTTOM</td><td>GND11</td><td>差分</td><td>4.8/6.9</td><td>100+/-10%</td><td>是</td><td>4.5</td><td>4.25</td><td></td><td></td></tr><tr><td>BOTTOM</td><td>GND11</td><td>单端</td><td>6.9</td><td>50+/-10%</td><td>是</td><td>4.5</td><td>4.25</td><td></td><td></td></tr><tr><td>BOTTOM</td><td>GND11</td><td>差分</td><td>6.2/7</td><td>90+/-10%</td><td>是</td><td>4.5</td><td>4.25</td><td></td><td></td></tr><tr><td>ART03</td><td>GND02/GND04</td><td>单端</td><td>5.9</td><td>50+/-10%</td><td></td><td>5.91</td><td>3.95</td><td>7.91</td><td>4.07</td></tr><tr><td>ART03</td><td>GND02/GND04</td><td>差分</td><td>4.5/6</td><td>100+/-10%</td><td></td><td>5.91</td><td>3.95</td><td>7.91</td><td>4.07</td></tr><tr><td>ART05</td><td>GND04/PWR06</td><td>单端</td><td>5.9</td><td>50+/-10%</td><td></td><td>5.91</td><td>3.95</td><td>7.79</td><td>4.07</td></tr><tr><td>ART05</td><td>GND04/PWR06</td><td>差分</td><td>4.5/6</td><td>100+/-10%</td><td></td><td>5.91</td><td>3.95</td><td>7.79</td><td>4.07</td></tr><tr><td>ART08</td><td>GND07/GND09</td><td>差分</td><td>4.5/6</td><td>100+/-10%</td><td></td><td>5.91</td><td>3.95</td><td>7.79</td><td>4.07</td></tr><tr><td>ART08</td><td>GND07/GND09</td><td>单端</td><td>5.9</td><td>50+/-10%</td><td></td><td>5.91</td><td>3.95</td><td>7.79</td><td>4.07</td></tr></table>

![](images/6527f16166431d6c7b3a500eca66ad23a55e1888cca727948f8c486275f58176.jpg)


36.31 

33.00 23.00
18.00 

## 2

## 背钻

背钻通过二次钻孔，将部分金属化孔钻断，以保证电气连接或是改善残桩对信号的影响。 

背钻设计主要注意事项 

背钻孔D≥0.4mm; 

背钻通孔d≥0.2mm; 

背钻孔径D-通孔直径d≥6mil; 

背钻孔内层隔离单边D1≥6mil; 

背钻深度H1≥0.2mm; 

钻穿层到不可钻穿层间的厚度H3; 

背钻孔到导体内层≥6.5mil；外层≥4.5mil； 

![](images/e45784189ead0f80fe922017d01465c49035df269363c6fadc281d7eab190b03.jpg)


## 高速PCB模块化布局

常用的时钟电路有：晶体、晶振、时钟分配器。有些IC用的时钟可能是由主芯片产生的，但追根溯源，还是由上述三者之一产生的。 

PCB中常用的晶体封装有：2管脚的插件封装和SMD封装、4管脚的SMD封装和4管脚的插针封装。常见封装如下图： 

![](images/bf843a7ea4fc4026c7292279457876235c9e2709da5269ca980e6e66b76136ee.jpg)


## 2

## 晶体

基本的电路设计如下图 

![](images/78680d9161d8b648fc10df7db2f56e67de2dda5b7a9f11086cc31afc8ea891e6.jpg)


晶体电路布局时，两个电容靠近晶体放置，布局效果图如下： 

![](images/2ad9c681ba50be078f704f43252be1153b43c5e220490884216560110772da19.jpg)


3 

布线时，晶体的一对线要走成类差分的形式，线尽量短、且要加粗并进行包地处理，或者直接铺铜处理。如下图： 

![](images/f1b3c303ebed15c91c310c6a5fe78d27041dcda205d331a248c7409b11aeb096.jpg)


![](images/092edaa79b62a92b2e0bacb7f0d6d86cbe14636588f8fcebc40e499e4c1dec23.jpg)


## 3

上述的是最基本和最常见的晶体电路设计，也有一些变形设计，如加串阻、测试点等，如下图，设计思路还是一致的： 

![](images/9fe4eec1e5fdca94678aca4e42a6c9e8d89f25925d0d4f261ec0773e289cbf94.jpg)


![](images/406ef70f29c21075836dcb96da47f79e08464c2dcee8ece3f60437cfd13abd96.jpg)


## 3

## 晶体布局布线

## 布局应注意:

1. 和IC布在同一层面，这样可以少打孔， 

2.布局要紧凑，电容位于晶体和IC之间，且靠近晶体放置，使时钟线到C尽量短； 

3. 对于有测试点的情况，尽量避免stub或者是使stub尽量短； 

4.附近不要摆放大功率器件、如电源芯片、MOS管、电感等发热量大的器件； 

## 布线应注意:

1. 和IC同层布局，同层走线，尽量少打孔，如果打孔，需要在附近加回流地孔； 

2. 差分走线; 

3. 走线要加粗，通常8~12mil；由于晶体时钟波形为正弦波，所以此处按模拟设计思路 

4.信号线包地处理或者直接铺铜，包地线或者铜皮要打屏蔽地孔； 

5. 晶体电路模块区域相当于模拟区域，尽量不要有其他信号穿过； 

## 3

## 晶振

相比于晶体电路，晶振是有源电路，主要有三部分组成：晶振+电源滤波电路+源端匹配电阻；常见电路如右图： 

布局布线效果如右图: 

![](images/828c7e10de632c3997c24ffb67be47d2694ec5754029c6e44b12ccf0ab92ca4e.jpg)


![](images/622fc0e031b0ae5b8c75f36cca09447b08cefa7574930f309aa7ee3757631bcb.jpg)


## 3

## 晶振布局布线

布局、布线注意： 

1. 滤波电容靠近电源管脚，遵循先大后小原则摆放，小电容靠得最近： 

2. 匹配电阻靠近晶振摆放；如果原理图中没有这个电阻，可建议加上； 

3.附近不要摆放大功率器件、如电源芯片、Mos管、电感等发热量大的器件: 

4. 时钟线按50 欧姆阻抗线来走；如果时钟线过长，可以走在内层，打孔换层处加回流地 

5. 其他信号与时钟信号保特4w 问距; 

6. 包地处理，并加屏蔽地孔； 

## 3

## 电容设计

电容在高速PCB设计中扮演重要的作用、通常也是PCB板上用得最多的器件。 

电容在不同应用场合，有不同的作用，在PCB板中：通常分为滤波电容、去耦电容、储能电容等。 

## 滤波电容:

简单理解就是用在滤波电路，保证输入、输出的电源稳定，我们通常把电源模块输人，输出回路的电容称为滤波电容。在电源模块中，滤电容放置的原则：是“先大后小” 

如右图，  
滤波电容按箭头方向：先大后小摆放 

![](images/09f1e581219190825b66d3ba63c0d62d29269100e6f4dda2e981f9f573b88f2b.jpg)



电源设计时，要注意线宽、铜皮宽度和VIA个数要足够，保证过流能力。


## 3

## 去耦电容

高速IC的电源管脚，需要足够多的去耦电容，最好能保证每个管脚有一个。实际的设计中，如果没有空间摆放，可以酌情删减。 

IC电源管脚的去耦电容的容值通常都会比较小，如O.1UF、0.01UF等。对应的封装也都比较小，如0402封装、0603封装等； 

在去耦电容摆放时，扇孔、扇线应该注意： 

1. 尽可能靠近电源管脚放置，否则可能起不到去耦的作用；理论上讲，电容有一定的去耦半径范围，毕竟我们用的电容器件不是理想的，所以还是严格执行就近原则： 

2. 去耦电容到电源管脚引线尽量短（第1条也是这个目的），而且引线要加粗，通常线宽为8～15mil；加粗目的在于减小引线电感，保证电源性能。 

3. 去耦电容的电源、地管脚，从焊盘引出线后，就近打孔，连接接到电源、地平面上。这个引线同样要加粗，过孔尽量用大孔，比如能用孔径10mil 的孔，就不用8mil孔； 

4. 保证去耦环路尽量小。 

## 3

## 常见去耦电容布局

芯片就近引脚放置，就近打VIA 

![](images/d40ca7579d23a16b9abfb29c8c44bb526aabe60875cf3b5947ac85ec0c2ff558.jpg)


![](images/5617290973d17814cb2ddbfeedfe21310dc64f9ddc9828c840580267fe2909cf.jpg)


BGA封装尽量多的放在BGA肚子下面: 

![](images/34cf556455348ac8ec3f60d29f5ccc97d37f617d915c227b98856d81e706c4b5.jpg)


## 3 储能电容

储能电容: 

它的作用就是保证1C 在用电时，能在最短的时间提供电能。储能电容的容值一般都比较大，对应的封装也比较大。在PCB 中，可以离器件远一些，但是也不能远得太离谱，毕竟它是储能的，希望它能在第一时间送电。 

引线尽量短，引线要加粗 

![](images/fd12a533432e8a8badd7edd27e57b01ed3653c59c540d144f79b31c78dbc3c68.jpg)


![](images/17aa5cc748cc0e068fcddf93dfcc91dade8e49b877369d59eb40971be38c9f0d.jpg)


## 常用存储器设计

## 4

## 说教法

![](images/a07fd3f727a5439a7b15fe4fa0e9fc6490a60147021e2d86c4f284eb0511d7ce.jpg)


## 4

## FLASH特点:

1. 速率较低，一般50M左右；2. 静态存储； 

3.布局一般采用菊花链，SDRAM靠近CPU,FLASH和SDRAM中心间距500-1000mil; 

部分仿真结果及Layout Guide要求CPU和FLASH靠近，SDRAM放在远端； 

4.布线要求：a,特征阻抗50欧姆;b,线间距3W;c,等长误差范围控制±100mil. 

Flash样式 

![](images/23d67277082c916b75b1d7e7370a0509ec73258654994f751b6f56abafb8bd90.jpg)


![](images/dd507d467c045895c04d929404b70e26cd61f55f7e1861da4d4c070e689d1412.jpg)


![](images/1495cac4f156b037001dc2f9cfdaa3dfa9475edad317c768d2aec413fcce2928.jpg)


![](images/775b27bd82c27d7b8e4245a224d977dc4869a4f5008afd5302227e53d48eb5ec.jpg)


<table><tr><td>信号名。</td><td>功能描述</td></tr><tr><td>CLK</td><td>时钟。</td></tr><tr><td>CKE</td><td>时钟使能。</td></tr><tr><td>CS#</td><td>片选。</td></tr><tr><td>WE#</td><td>读写。</td></tr><tr><td>RAS#</td><td>列选。</td></tr><tr><td>CAS#</td><td>行选。</td></tr><tr><td>DQM</td><td>数据掩码。</td></tr><tr><td>BAO, BA1.</td><td>Bank 选择。</td></tr><tr><td>A0-A11.</td><td>地址。</td></tr><tr><td>DQO-DQ15.</td><td>数据(输出)。</td></tr><tr><td>VDDQ.</td><td>DQ 电源。</td></tr><tr><td>VSSQ.</td><td>DQ 地。</td></tr><tr><td>VDD.</td><td>电源。</td></tr><tr><td>VSS.</td><td>地。</td></tr></table>

## SDRAM布局原则：

## 一，SDRAM×1时，点对点布局

1, SDRAM到CPU推荐的中心间距无排阻连接时: 900—1000mil;有排阻连接时: 1000—1300mil。 

![](images/ce0732336cd26f78cff3d3a9c0daa5b297ae40d492a028695b85fd6750fd0fb8.jpg)


## 两片SDRAM布局原则：

二，SDRAM×2时，相对于CPU所接的信号管脚中心对称 

1. 空间足够时，与CPU同层 

![](images/b2a363f11f60be1fbbdc8372a6b5afda27da0eba5da9912955624de5cee264c4.jpg)


## 2，顶底对贴

![](images/f3014c5ac60e24713c5478edec0ddcd1c9b0433a38b462fe01eacecaa8e874cb.jpg)


## 4 SDRAM布线规范：

## SDRAM 布线:

a.信号线控制阻抗为50Ω 

b. 数据线每8根（D0~D7、D8~D15）为一组，同组同层； 

c. 数据线、地址（控制）线、时钟线组间间距保持20mil以上或者至少3W; 

d. 空间允许的情况下，应该在各组之间加一根15-30mil的地线隔离，并间隔150-250mil放置地过孔； 

e.所有信号线不能跨分割，且保持完整的参考平面； 

f. 两片以上的SDRAM布线拓扑优选远端分支，T点的过孔打在两片SDRAM之间；次选菊花链。 

![](images/acc5b001ad03dcf0fe9886bb45aaf26745bfa537984069335eb582d754fd339f.jpg)



远端分支


![](images/9ac560648ed7e8896c2807b03240b5e63d92b275eefb86d887fffe3450f9b156.jpg)



菊花链


## SDRAM读写参考时钟：

SDRAM数据的读写都要靠适中的同步，而时钟的同步分为外同步和内同步； 

一，外同步：由外部时钟给系统提供参考时钟，数据从发送到接收需要两个时钟沿，一个锁存发送数据，一个锁存接手数据，在一个时钟周期被完成。框图如右，其中，clkA与clkB需要等长，DATA总长有限制。 

二，内同步：是指时钟和数据同时在两个芯片间传输，不需要外部时钟源来给SDRAM提供时钟，目前应用比较多。框图如右， 

![](images/a43da5207daa9d1827f591d10c08041c0ce7675f2898e86c5c0f6cb9b21936ee.jpg)


## 4 SDRAM等长要求：

## 一，分组：

1. 所有数据线为一组； 

2，所有地址线、控制线、时钟线为一组； 

## 二，所有信号线以时钟线为基准进行等长；

## 三，误差范围：

1. 数据线长度误差范围控制±50mil; 

2. 地址线长度误差范围控制±100mil; 

![](images/c466bb80bd190482b1fb4839637c4ba8f50f60e5f3a0a0f51bfe2ed8ad6295ec.jpg)



顶底对连后再与CPU互连


![](images/c8ad88bb691d85789763378ea93af7ff652a9b42a938daa30a923f932555e6d2.jpg)


## 4 SDRAM等长要求：

## 一，分组：

1. 所有数据线为一组； 

2，所有地址线、控制线、时钟线为一组； 

## 二，所有信号线以时钟线为基准进行等长；

## 三，误差范围：

1. 数据线长度误差范围控制±50mil; 

2. 地址线长度误差范围控制±100mil; 

![](images/e2c94c9005a2df18974b068a825c47ae8ac92fcef1645df7c49fe3777156603d.jpg)



顶底对连后再与CPU互连


![](images/fdef783ec1c230582bf51002d46325e102dc32a8596a22b0578a87e64d6fff83.jpg)


## DDR工作原理：

## 工作原理：

一，DDR的读写操作时序如有下图所示。图中，命令信号与地址参考CK信号上升沿输入到DDR。 

二，读数据时DQ随着DQS并参考DQS的信号沿输出，写数据时DQ随着DQS并参考DQS的信号沿输入，读写数据时DQS都是双沿有效。 

三，读数据时，输出的DQS由送入DDR的差分时钟CK/CK#使用DDR存储器中的一个DLL生成DQS，并使之与输出数据对齐。 

四，虽然DDR存储器不用差分输入时钟来发送或接收数据，但所用的DQS信号与输入时钟的频率有关。 

<table><tr><td>管脚数</td><td>信号名</td><td>功能描述</td></tr><tr><td>2</td><td>CK, CK=</td><td>全周时钟输入。</td></tr><tr><td>1</td><td>CKE</td><td>时钟使能信号输入。</td></tr><tr><td>1</td><td>CS#</td><td>片选信号输入。</td></tr><tr><td>3</td><td>RAS#, CAS#, WE=</td><td>命令信号输入。</td></tr><tr><td>2</td><td>LDM, UDM</td><td>数据mask信号输入。</td></tr><tr><td>13*</td><td>A&lt;0.12&gt;</td><td>地址信号输入。</td></tr><tr><td>2</td><td>BA0, BAI</td><td>BANK选择信号输入。</td></tr><tr><td>16*</td><td>DQ&lt;0.15&gt;</td><td>数据信号输入/输出。</td></tr><tr><td>2</td><td>LDQS, UDQS</td><td>数据暂存信号输入/输出。</td></tr><tr><td>5+</td><td>NC</td><td>空引脚。</td></tr><tr><td>2</td><td>DNU</td><td>不使用引脚。</td></tr><tr><td>5</td><td>VDDQ</td><td>DQ电源电压(25V)。</td></tr><tr><td>5</td><td>VSSQ</td><td>DQ地。</td></tr><tr><td>3</td><td>VDD</td><td>器件电源电压(25V)。</td></tr><tr><td>3</td><td>VSS</td><td>器件地。</td></tr><tr><td>1</td><td>VREF</td><td>SSTL 2参考电压。</td></tr></table>

![](images/994f70a668b01441c86349c1fdd7dd28433b259bf3a8a39c0ec6cc37836d9d47.jpg)


## DDR布局原则：

## 基本要求：

一, 数据线串接电阻一般放在DDR与控制器中间, 并联电阻靠近串接电阻放置, 可放于其背面, 具体位置可由仿真决定; 

![](images/1630a2aec3e7a85455144e7e59143fe02ad50a0c9af388f6d715b50095f71a40.jpg)


二，DM信号是数据线的掩码，一般都是点到点的单向传输，要求串接电阻放在控制器端，并联电阻放在DDR端； 

![](images/b662335f3d84cbf0a950d9c1b2fc6c2b7ed9b7c4a348d0c24a51a77a5d68359e.jpg)


## DDR布局原则：

三，地址线、控制线、时钟线是单向传输，且一般都是点到多点的拓扑结构。要求串联电阻靠近控制器端，多个DDR间使用远端分支，分支尽量短且等长，并联电阻放在DDR端第一个T点处，长度不超过500mil；走菊花链拓扑的，并联电阻放在最后一个DDR后面，长度不超过500mil。 

![](images/fbae811b081fcb5d420ec0d3e824cc8b50672bbbcd47f87f130a0f7e13bd0f67.jpg)


四, 差分时钟信号是单向传输, 串接电阻靠近控制器端, 点到点的终端匹配电阻尽量靠近DDR, 或放在DDR之后; 点到多点, 地址线可以使用T型拓扑结构, 终端匹配电阻放在第一个T点处; 。 

![](images/03eb561a4509408fe754b4330e9f235dc6702e60924656e5d9f9d6cdbff97398.jpg)


## DDR布局原则：

五，Vref电源的退耦电容必须靠近DDR和CPU管脚。 

![](images/847f8106669ccfc667d5fd2628ed4803f8aeb5afb60f5753d601197f7ae9555e.jpg)


六，VTT电压用在信号线上拉电阻上，电流大，电压低，需要表面铺铜连接，宽度大于150mil，每四个上拉电阻或者一个排阻至少对应一个高频退耦电容，且要均匀放置，同时附近应当均匀放置几个bulk电容，至少末端应有一个bulk电容（如：4.7uF、100-220uF），若VTT走内层，高频退耦电容数目应更多。 

## 4

## DDR布局原则：

一，DDR×1时，点对点布局，留出绕线空间； 

二，DDR×2时，相对于CPU所接信号管脚中心对称，注意地址线的走线空间和串接电阻的位置； 

三，DDR×4和DDR×8时，一般两两正反对贴，同层放置时将导致远端分支过长； 

![](images/c48053d394ceaa4a36b75b6ee35b66559e37eddc126880fa271ee1bf05cff1b3.jpg)


![](images/0298e1df0ae7d0734a1f0ce05197f203b719ecec1bb544750502a9cdaf826a7d.jpg)


## DDR 布线基本要求:

一，特征阻抗：单端 $50 \Omega$ 、差分 $100 \mathrm{Q}$ ; 注意保持阻抗的连续性。 

二，数据线每10根(DO-D7,LDM,LDQS)和(D8-D15,UDM,UDQS)同组同层，优先以地为参考面，中间不能夹杂其他信号； 

三，所有信号线少换层，尤其是数据线、时钟线不超过2个过孔，所有信号线间距至少满足3W原则； 

四，数据线、地址线(控制线)、时钟线组间间距保持20mil以上或至少3W; 

五，所有信号线都不能跨分割，且有完整的参考平面，换层时，如果改变了参考层，要注意考虑增加回流地过孔或退耦电容； 

六，Vref电源走线宽度推荐不小于20mil,与其他信号线间距最好20mil以上； 

七，两片以上的DDR布线拓扑结构优选远端分支，T点的过孔打在两片DDR中间；菊花链需得到仿真验证或芯片Layout Guide要求； 

八，所有DDR信号距离相应参考平面边沿至少30-40mil; 

九，任何非DDR部分的信号不得以DDR电源为参考。 

## 4 DDR 布线等长要求:

## 一，分组：

1,DO-D7,LDM,LDQS为一组，D8-D15,UDM,UDQS为一组： 

2,所有地址线、控制线、时钟线为一组; 

二，数据线以DQS为基准等长，地址线、控制线以时钟线为基准等长。 

## 三，误差范围：

1. 数据线最大长度尽量不超过2500mil,组内误差范围控制在±25mil,DQS与时钟线的误差控制在±250mil,单片DDR的最大误差不超过1000mil; 

2,地址线误差范围控制在士100mil; 

3,DQS、时钟差分对内误差范围控制在±5mil。(对内间距不超过2倍线宽)四, 信号实际长度应当包括零件管脚的长度, 尽量取得零件管脚长度, 并导入软件。 

## 4

## DDR 布线等长示例:

## 布线等长示例

<table><tr><td>DDR_DATA0_L(10)</td><td></td><td></td><td></td><td></td><td>15.98 MIL</td></tr><tr><td>U1.A3:U2.F3 [DDR_DOM_6]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td>5.56 MIL</td><td>19.44 MIL</td></tr><tr><td>U1.A4:U2.F1 [DDR_DATA_6]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td>3.60 MIL</td><td>21.4 MIL</td></tr><tr><td>U1.A5:U2.H9 [DDR_DATA_5]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td>2.91 MIL</td><td>22.09 MIL</td></tr><tr><td>U1.A6:U2.H7 [DDR_DATA_7]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td>9.82 MIL</td><td>15.98 MIL</td></tr><tr><td>U1.A7:U2.G2 [DDR_DATA_1]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td>7.33 MIL</td><td>17.67 MIL</td></tr><tr><td>U1.A8:U2.G8 [DDR_DATA_8]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td>6.35 MIL</td><td>18.65 MIL</td></tr><tr><td>U1.B4:U2.F7 [DDR_DOS_8]</td><td></td><td>Global</td><td>TARGET</td><td colspan="2">TARGET</td></tr><tr><td>U1.B5:U2.F9 [DDR_DATA_7]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td colspan="2">Analyze</td></tr><tr><td>U1.B6:U2.H1 [DDR_DATA_4]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td rowspan="11" colspan="2">单击右键设定基准线</td></tr><tr><td>U1.B7:U2.H3 [DDR_DATA_3]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>DDR_DATA1_L(10)</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.A1:U2.D9 [DDR_DATA_13]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.A2:U2.C8 [DDR_DATA_8]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.B1:U2.B9 [DDR_DATA_15]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.B2:U2.D1 [DDR_DATA_17]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.B3:U2.B1 [DDR_DATA_14]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.C1:U2.D3 [DDR_DATA_11]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.D1:U2.C2 [DDR_DATA_9]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.D2:U2.D7 [DDR_DATA_16]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td></tr><tr><td>U1.E1:U2.B7 [DDR_DOS_1]</td><td></td><td>Global</td><td>TARGET</td><td colspan="2">Set as target</td></tr><tr><td>U1.G1:U2.B3 [DDR_DOM_1]</td><td></td><td>Global</td><td>0.00 ML:25.00 ML</td><td colspan="2">Clear</td></tr></table>

<table><tr><td>BOR_A208_01_02_L(72)</td><td></td><td></td><td></td><td></td></tr><tr><td>ULAA102.L3 [BA1_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULAA202.M7 [A18_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULAB102.M8 [A4_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULAC102.M3 [A1_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULAD102.M7 [A2_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULBI102.K8 [CK_9_16]</td><td></td><td></td><td>Global</td><td>TARGET</td></tr><tr><td>ULJ102.J8 [CK_P_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULJ202.K2 [CK2_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULK102.H2 [A3_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULL602.P7 [A11_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULL202.R2 [A12_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULM102.P8 [A8_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULM202.P3 [A9_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULB202.P2 [A7_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULP102.H7 [A6_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULR102.H8 [A4_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULR202.H3 [A5_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULT102.K3 [DDR_WE_L]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULU102.L7 [CAS_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULV102.K7 [DDR_RAS_L]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULW102.L8 [C5_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr><tr><td>ULY102.L7 [BA4_16]</td><td></td><td></td><td>Global</td><td>0.00 ML/100.00 ML</td></tr></table>

<table><tr><td>DDR_CLK_DOS (4)</td><td></td><td></td><td></td><td></td><td></td></tr><tr><td>U1.B402.F7 [DDR_DOS_9]</td><td rowspan="4" colspan="3">DQS、时钟线分组等长情况</td><td>Global</td><td>0.00 MIL:250.00 MIL</td></tr><tr><td>U1.E1:02.B7 [DDR_DOS_1]</td><td>Global</td><td>0.00 MIL:250.00 MIL</td></tr><tr><td>U1.N1:02.K3 [CK_II_16]</td><td>Global</td><td>TARGET</td></tr><tr><td>U1.J1:02.J8 [CK_P_16]</td><td>Global</td><td>@ MIL:5 MIL</td></tr></table>

## 2颗 DDR 布局线示例:

![](images/c26e7628a6458cd600060325c69d9c00f152946b78d3af9595dd25d643725393.jpg)


## 4 颗 DDR 正反叠 布局线示例:

![](images/3b6527ac2b64fefafa13c04737d89d35dad729088d20731d2f714cd6d3f8fdc4.jpg)


## 4颗 DDR同面布局线示例：

![](images/1869a80dd7d3f30550b978ea27d798f978bcd7ab8bbd96916de8af4fd77378f2.jpg)


## DDR2:

DDR2新特点： 

一，DQS可使用差分线传输，频率可达400M； 

二，芯片内部集成数据线终结匹配技术ODT，无需外部匹配端接；注意地址线、命令线依然需要外部匹配端接； 

三，4位预读取，外部时钟频率是内部时钟频率的两倍，数据传输由此提高两倍； 

四，内核电压更低，仅为1.8V； 

## DDR2:

## ODT小知识

使用DDR SDRAM的主板上面为了防止数据线终端反射，信号需要大量的终结电阻，它大大增加了主板的制造成本。 

实际上，不同的内存模组对终结电路的要求是不一样的，终结电阻的大小决定了数据线的信噪比和反射率，终结电阻小则数据线信号反射低但是信噪比也较低；终结电阻高，则数据线的信噪比高，但是信号反射也会增加。 

因此主板上的终结电阻并不能非常好的匹配内存模组，还会在一定程度上影响信号品质。 

DDR2内建了终结电阻器，在DRAM颗粒工作时把终结电阻器关掉，而对于不工作的DRAM颗粒则打开终结电阻，减少信号的反射。 

ODT至少为DDR2带来了两个好处，一个是去掉了主板上的终结电阻器使主板的成本降低，也使PCB板的设计更加容易。第二个好处是终结电阻器可以和内存颗粒的“特性”相符，使DRAM处于最佳状态。 

## 4

## DDR2:

## DDR v.s. DDR2

<table><tr><td>Memory Type</td><td>DDR</td><td>DDR2</td></tr><tr><td>Core Voltage(VDD)</td><td>2.5V</td><td>1.8V</td></tr><tr><td>I/O Voltage (VDDQ)</td><td>SSTL_2(2.5V)</td><td>SSTL_1.8(1.8)</td></tr><tr><td>Data Rate</td><td>200/266/333/400Mbps</td><td>400/533/667/800Mbps</td></tr><tr><td>Bus Frequency</td><td>100/133/166/200MHz</td><td>200/266/333/400MHz</td></tr><tr><td>Core Frequency</td><td>100/133/166/200MHz</td><td>100/133/166/200MHz</td></tr><tr><td>Pre-fetch</td><td>2-bit</td><td>4-bit</td></tr><tr><td>Burst Length</td><td>2/4/8</td><td>4/8</td></tr><tr><td>Data Strobe</td><td>Single DQS</td><td>Differential DQS, /DQS</td></tr><tr><td>Write Latency</td><td>1 clock</td><td>(Read Latency-1) clock</td></tr><tr><td>CAS Latency</td><td>1.5, 2, 2.5</td><td>3, 4, 5</td></tr><tr><td>Package</td><td>x4/x8/x16: 66-pin TSOP(II)x4/x8/x16: 60-ball FBGA</td><td>x4/x8: 60 ball FBGAX16: 84 ball FBGA</td></tr><tr><td>New Features</td><td></td><td>OCDODTPosted CAS</td></tr></table>

<table><tr><td rowspan="2" colspan="2">Case Frequency = 100 MHz</td><td colspan="2">SDRAM</td></tr><tr><td>Clock Freq = 100 MHz</td><td>Data Bus</td></tr><tr><td colspan="2">Memory Cell Array</td><td>I/O Buffers</td><td></td></tr><tr><td rowspan="2" colspan="2">one frequency = 100 MHz</td><td colspan="2">DDR I</td></tr><tr><td>Clock Freq = 100 MHz</td><td>Data Bus</td></tr><tr><td colspan="2">Memory Cell Array</td><td>I/O Buffers</td><td></td></tr><tr><td rowspan="2" colspan="2">one frequency = 100 MHz</td><td colspan="2">DDR II</td></tr><tr><td>Clock Freq = 200 MHz</td><td>Data Bus</td></tr><tr><td colspan="2">Memory Cell Array</td><td>I/O Buffers</td><td></td></tr></table>

<table><tr><td>Item</td><td>DDR2 SDRAM</td><td>DDR SDRAM</td><td>SDR SDRAM</td></tr><tr><td>Prefetch</td><td>4 bit</td><td>2 bit</td><td>1 bit</td></tr><tr><td>Internal bus operating frequency</td><td>100MHz</td><td>100MHz</td><td>100MHz</td></tr><tr><td>External clock frequency</td><td>200MHz</td><td>100MHz</td><td>100MHz</td></tr><tr><td>Data bus speed</td><td>400Mbps</td><td>200Mbps</td><td>100Mbps</td></tr></table>

## DDR 2布局布线:

等长要求：推荐以Layout Guide为准、以仿真结果为准 

一，数据线最大长度尽量不超过2500mil,组内误差范围控制在±15mil,DQS与时钟线的误差控制在±250mil,单片DDR的最大误差不超过1000mil。 

二，地址线误差范围控制在士100mil; 

三，DQS、时钟差分对内误差范围控制在±5mil。(对内间距不超过2倍线宽) 

四，DQGATE组：DQGATE组一般对应低16位和高16位。前者由DQGATEO、串联电阻、DQGATE1组成；后者由DQGATE2、串联电阻、DQGATE3组成；按照以下公式分别计算DQGATE信号长度，误差不超过100mil; DQGATE_L=DDRCLKOUTP+(DDRDQSOP+DDRDQS1P)/2 DQGATE_H=DDRCLKOUTP+(DDRDQS2P+DDRDQS3P)/2 

五，信号实际长度应当包括零件管脚的长度，尽量取得零件管脚长度，并导入软件。 

## 4

## DDR3:

## DDR3新特点:

一，具有DDR2的所有优点，如DQS差分传输、ODT等； 

二，8位预读取，外部时钟频率是内部时钟频率的四倍，数据传输率最高可达1.6Gbps; 

三，内核电压进一步降低，仅为1.5V,功耗比DDR2降低25%; 

四，Ram重置(Reset)功能，关闭所有数据接收和发送，仅提供数据保存的最低电量，使得DDR3达到最省电的目的； 

五，根据芯片温度进行自刷新或者局部自刷新； 

六，单片DDR3可达到8Gbit容量； 

## DDR3:

<table><tr><td></td><td>DDR</td><td>DDR2</td><td>DDR3</td></tr><tr><td>时钟频率</td><td>100/133/166/200MHz</td><td>200/266/333/400MHz</td><td>400/533/667/800MHz</td></tr><tr><td>数据传输速率</td><td>200/266/333/400Mbps</td><td>400/533/667/800Mbps</td><td>800/1066/1333/1600Mbps</td></tr><tr><td>输入/输出位宽</td><td>x4/x8/x16/x32</td><td>x4/x8/x16</td><td>x4/x8/x16</td></tr><tr><td>预取宽度</td><td>2位</td><td>4位</td><td>8位</td></tr><tr><td>突发长度</td><td>2,4,8</td><td>4,8</td><td>8</td></tr><tr><td>数据选通(DQS)</td><td>单线</td><td>单线/差分</td><td>差分</td></tr><tr><td>电源电压</td><td>2.5V±0.2V</td><td>1.8V±0.1V</td><td>1.5V±0.075V</td></tr><tr><td>接口类型</td><td>SSTL_25</td><td>SSTL_18</td><td>SSTL_15</td></tr><tr><td>CAS延迟(CL)</td><td>2, 2.5, 3时钟频率</td><td>3, 4, 5时钟频率</td><td>5, 6, 7, 8, 9, 10时钟频率</td></tr><tr><td>片内终结器(ODT)</td><td>不支持</td><td>支持</td><td>支持</td></tr><tr><td>封装类型</td><td>66pin TSOP2 60pin BGA</td><td>60pin BGA(x4, x8) 84pin BGA(x16)</td><td>78pin BGA(x4, x8) 96pin BGA(x16)</td></tr><tr><td>Write Leveling</td><td>不支持</td><td>不支持</td><td>支持</td></tr></table>

为了得到更好的信号完整性，DDR3存储模块采取了FLYBY的拓扑结构，来处理命令、地址、控制信号和时钟。FLY_BY的拓扑结构可以有效的减少stub的数量和他们的长度，但是却会导致时钟和strobe信号在每个芯片上的flight time skew,这使得控制器(FPGA或者CPU),很难以保持Tdqss,tdss和tdsh这些时序。这样，ddr3支持write leveling这样一个特性，来允许控制器来补偿倾斜(flight time skew)。存储器控制器能够用该特性和从DDR3反馈的数据调成DQS和CK之间的关系。在这种调整中，存储器控制器可以对DQS信号可调整的延时，来与时钟信号的上升边沿对齐。控制器不停对DQS进行延时，直到发现从0到1之间的跳变出现，然后DQS的延时通过这样的方式被建立起来了，由此可以保证tDQSS。 

The following optional DDR3 features are not supported: 

Read and Write leveling 

## 4

## DDR3布局:

地址线布局布线优先选用FLY-BY，过孔到管脚距离尽量短，长度在150MIL以内。 

![](images/6d3b41b0ce1d74c624e9d6f69588e3d2f75092ac5f1f26fe84a358e80b125eef.jpg)


![](images/c957c069eb6ac6d6b1001802936374bbabd49a3405bde63eda201da69888e91c.jpg)


## DDR 3布线要求:

DDR3布线等长要求：推荐以Layout Guide为准、以仿真结果为准 

一，数据线最大长度尽量不超过2500mil,组内长度误差范围控制在士10mil,得益于Write Leveling技术，DQS与时钟线一般无长度误差要求，注意查阅Layout Guide或datasheet,相差不能太大，部分芯片会有组间、DQS和时钟线的等长要求； 

二，地址线误差范围控制在士50mil; 

三，DQS、时钟差分对内误差范围控制在±2mil。(对内间距不超过2倍线宽) 

四，信号实际长度应当包括零件管脚的长度，尽量取得零件管脚长度，并导入软件。 

## DDR4新特点:

一，8位预读取，外部时钟频率是内部时钟频率的八倍，采用单端信号规格的数据传输速率最高可达3.2Gbps,采用差分信号技术的DDR4内存，其传输速率将可达6.4Gbps。目前仅有单端信号规格的DDR4。 

## 二，内核电压仅为1.2V;

DDR4布局布线要求基本同DDR3: 

等长要求(推荐以Layout Guide为准、以仿真结果为准) 

一，数据线最大长度尽量不超过2500mil,组内长度误差范围控制在±5mil,得益于Write Leveling技术，DQS与时钟线一般无长度误差要求，注意查阅Layout Guide或datasheet,相差不能太大，部分芯片会有组间、DQS和时钟线的等长要求； 

## 二，地址线误差范围控制在±20mil;

三，DQS、时钟差分对内误差范围控制在±3mil。(对内间距不超过2倍线宽) 

四，信号实际长度应当包括零件管脚的长度，尽量取得零件管脚长度，并导入软件。 

## 区分内存：

一，芯片封装类型和管脚数目，如SOP的一定不是DDR2、DDR3,TSOP两排Pin相隔较远的，一般是Flash; 

二，芯片电压，一般来说，3.3V是SDRAM,2.5V是DDR,. 

三，信号名、信号种类，如有单线DQS的，一般都是DDR或DDR2,一般不是SDRAM或DDR3; 

四，芯片上带有reset信号，且96pin BGA的是在T2脚(78pin BGA的是在N2脚),则一定是DDR3; 

五，Vref电源在芯片上有两个管脚的，分别为VrefCA、VrefDQ,则一定是DDR3、DDR4。 

## 接口设计

## 5

一,串行接口/SPI/JTAG/E1/T1接口
二,PCI/CPCI接口
三,PCIE接口
四,IDE/SATA接口
五,以太网接口
六,USB接口
七,HDMI/DVI接口
八,VGA接口
九,视频接口(RF,RCA,S-Video,视频色差输入接口)
十,AUDIO接口
十一,光口/光耦
十二,SD/TF卡/CF卡/SIM卡/LCD/Camera 

## 5

## 串行接口(RS232/RS485)

## 1,R232接口

布线要求: 

①串口一般用到的信号只RXD, TXD, GND。 

②TXD/RXD走线须加粗至10mil左右，尽量不要同层平行走线，若必须同层，要求间距至少5W以上。 

![](images/8d4f5194bdbb6d8bd0814df87e05693102e4200ff04c1ac9120bc8ebdd5195da.jpg)


## 5

## 管脚定义:

![](images/e0d3ce5d2eda45cccb4f138af382ac5c6828c968713690278df98d932a1aa782.jpg)


![](images/2f8bee1385343f166137d11eb3f4e68d9925623f70797a34a0607431731525a3.jpg)


## 5

## SPI( Serial Peripheral Interface)串行外围接口

(1)MOSI-主器件数据输出，从器件数据输入 

(2)MISO-主器件数据输入，从器件数据输出 

(3)SCLK-时钟信号，由主器件产生 

(4)/SS-从器件使能信号，由主器件控制。 

![](images/884aaf430fdc6798b7c6dcea4637c8c1cf3e24f9b9ab9713064968cc3048dd0c.jpg)


## 5

## JTAG接口( Serial Peripheral Interface)串行外围接口

标准的JTAG接口是4线：TMS、TCK、TDI、TDO,分别为测试模式选择、测试时钟、测试数据输入和测试数据输出 

![](images/39f5f8eea1e4a9310ede7e225c11ac895332862b454d5ec1b71e650a18883c6c.jpg)


## EJTAG

![](images/da24c8e9f527a9cd82281b6c3913e0cf0f850dd7aeb9d189d38fbf64e148a216.jpg)


## 5

## PCI接口(外设部件互连标准)

PCI V2.1是33Mhz的32 bit总线标准，PCI V2.2是66Mhz的64 bit总线标准。 

1. 通讯板PCI线长一般要求控制在2500mil以内，主板为2.5~10英寸。 

2,特性阻抗一般控制为50ohm+/-15% 

<table><tr><td>Section</td><td>Group</td><td>Signals</td><td>Description</td></tr><tr><td rowspan="4">Section 15.2</td><td>Address/Data</td><td>AD[31:0]</td><td>PCI Address/Data</td></tr><tr><td>Control</td><td>C/BE#[3:0]</td><td>Bus Command and Byte Enables</td></tr><tr><td>Control</td><td>DEVSEL#</td><td>Device Select</td></tr><tr><td>Control</td><td>FRAME#</td><td>Cycle Frame</td></tr></table>

![](images/2defdbb6d7f9d7b1fdfed781e03a4e908126a2c6a9842bdd24fddd024a5e464b.jpg)


## 5

CPCI插座一般都是压接器件，布局时需注意其它器件离插座的间距：Top-3mm;Bottom -5mm时钟信号控制在2500+/-100miI,其他信号<=2500mi。插座位置要严格按照CPCI标准规范进行摆放。 

![](images/0e14f312fe635cc9cb77015682e4d2ccf68aa63c8cb0f76d8665caf39b511b3a.jpg)


## 5

## Pcie(PCIExpress接口)

主要优势就是数据传输速率高，目前最高可达到10GB/s以上；有多种规格，从PCI Express 1X到PCI Express 16X,能满足现在和将来一定时间内出现的低速设备和高速设备的需求。 

Layout注意事项: 

1. 差分信号特性阻抗控制标准一般为85欧姆； 

2,走线长度控制在1inch-12inch,差分队内等长误差为5mil. 

3,尽量不打过孔或将过孔数量控制在2个以内。 

4,信号线需有完整的参考平面，尽量参考GND层走线。 

5,两组差分线之间的间距>=15mil,与其他信号或铜皮的间距也应保证>=15mil. 

## 5

![](images/2b5ed39adfd532029e758babb835287128f3d4fce14c3ff3cabbdfabb76a39c9.jpg)


![](images/4df22eb7839cea02d964798ff34761dd0e40e9a0102cc7f90efdee8475427b11.jpg)


## 5

SATA接口 

串行ATA(Serial ATA,简称SATA),其接口非常小巧,排线很细,有利于机箱内部空气流动,强散热效果,也使机箱内部显得不太凌乱。与并行ATA相比,SATA还有一大优点就是支持热插发展阶段: 

SATA/SATA II/SATAII相对应速率：1.5Gbps/3.0Gbps/6.0Gbps 

![](images/fb2e75ab53701445fd68f55e3ab4531f01ec44551078f42335073e273311eec1.jpg)


![](images/1af631cc1e884149c27b1b4c07b8ee5bb795add9a124d759bfa2a544e3701e64.jpg)


![](images/a327954f19b25bf704309ee48394cdbe69a3492def90bc1e82743a6a01a18682.jpg)


## 5

## Layout注意事项:

1,差分信号特性阻抗控制标准一般为 $100\mathrm{ohm} + / - 10\%$ 。 

2,走线长度控制在0.8inch-3.8inch;速率越高，走线长度应越短。 

3. 尽量不打过孔或将过孔数量控制在3个以内。 

4,同组差分线之间的长度误差需控制在5mil以内。 

5. 信号线需有完整的参考平面，尽量参考GND层走线。 

6,两组差分线之间的间距>=15mil,与其他信号或铜皮的间距也应保证>=15mil 

7,禁止将信号线布在晶体，晶振，时钟芯片等敏感器件下方。 

## 5

## 以太网接口

## 以太网接口

终端接头：RJ45接口 

RJ-45插头, 俗称"水晶头",专业术语为RJ-45连接器(RJ-45是一种网络接口规范, 类似的还有RJ-11接口,就是我们平常所用的“电话接口”,用来连接电话线)。实物示意图: 

![](images/3e6bd88ce5e6237b828611465771f4fb4c4cb27c9861d692976c9c6c4fa8b79c.jpg)


![](images/5966062db717232e75374c0deb54273f83db5399d7306eedac9d4539c25b2311.jpg)


![](images/a987120b2f0bf07bd2640a2e45fc808300811d1a1470ff56918024628e3e4f93.jpg)


![](images/dacd3aea9b495966fce2481b883c650d0c431329ec5d9bf0440c15bf80ae927c.jpg)



(a) RJ45 DTE 类型引脚定义


![](images/81e57092cb343cc47e8b34353ffbae3bbd7ffe7dc64f1e663360d7bed14ab0f0.jpg)



(b) RJ45 DCE 类型引脚定义



RJ45 引脚定义


![](images/a58ea94079a34dcc64ec58cf9fdc25eda4d955504f479c03623f2ca60202c969.jpg)


## 5

## Layout注意事项：

1. 以太网接口和变压器之间的距离尽可能的缩短，以太网转换芯片与变压器之间的距离一般应小于5inc 

2,变压器下面所有层挖空；变压器其他信号线的线宽要>=20mil 

3,外壳地与DGND之间的桥接电容要靠近外壳地管脚放置。 

4,变压器的外壳地(PGND)和DGND的隔离距离最小为80mil。 

5, TX+, TX-和RX+, RX-走差分线，两组差分对之间的间距为20mils距离其它信号需保持在30~50mils之间。 

6,信号线走线长度越短越好，且须有完整的地参考平面。 

7,在每对信号线的换层处增加gnd回流地过孔。 

## 5

## USB接口

## USB为通用序列汇流排的简称

<table><tr><td></td><td>Logo</td><td>速度</td><td>傳輸</td><td>電源供應</td><td>纜線長度</td></tr><tr><td>USB1.1</td><td><img src="images/dce19ca9886af25d12ca54c69334c59dafc6eeda1cf3ef7953d2309dd87a3fbc.jpg"/></td><td>Low-speed (1.5 Mbps) Full-speed (12 Mbps)</td><td>兩線差分傳輸</td><td>5V/500mA</td><td>5M</td></tr><tr><td>USB2.0</td><td><img src="images/e77fc5339d0ec5284ac1d1611cf9a9b0185076ba6e53ca3f30e5cafc5b9594ff.jpg"/></td><td>Low-Speed (1.5 Mbps) Full-Speed (12 Mbps) High-Speed (480 Mbps)</td><td>兩線差分傳輸</td><td>5V/500mA</td><td>5M</td></tr><tr><td>USB3.0</td><td><img src="images/3113a2c7599b150a1a221cc1833d942cda33bdbe18d13ed9d34d47598bfd9f49.jpg"/></td><td>Low-Speed (1.5 Mbps) Full-Speed (12 Mbps) High-Speed (480 Mbps) Super-Speed (5.0 Gbps)</td><td>四線差分傳輸</td><td>5V/900mA</td><td>5M</td></tr></table>

<table><tr><td>Pin Number</td><td>Signal Name</td><td>Description</td></tr><tr><td>1</td><td>VBUS</td><td>Power</td></tr><tr><td>2</td><td>D-</td><td rowspan="2">USB 2.0 differential pair</td></tr><tr><td>3</td><td>D+</td></tr><tr><td>4</td><td>GND</td><td>Ground for power return</td></tr><tr><td>5</td><td>StdA_SSRX-</td><td rowspan="2">SuperSpeed receiver differential pair</td></tr><tr><td>6</td><td>StdA_SSRX+</td></tr><tr><td>7</td><td>GND_DRAIN</td><td>Ground for signal return</td></tr><tr><td>8</td><td>StdA_SSTX-</td><td rowspan="2">SuperSpeed transmitter differential pair</td></tr><tr><td>9</td><td>StdA_SSTX+</td></tr><tr><td>Shell</td><td>Shield</td><td>Connector metal shell</td></tr></table>

![](images/79bd1b82fb7819ef8c57d3a29401543d13d5bb4a6e4fff45c807c97da4f1ace4.jpg)


![](images/a29a705cc18bbff6c545e1f90f220c089d269e72005c7f9204e9ab2e337f43f4.jpg)


## 5

## USB接口

## Layout要求

1, ESD器件必须靠近USB摆放，除电源和地管脚，其他四个信号管脚可以根据走线需要调管脚。 

2,差分线的特性阻抗一般为90欧(+/-15%)。 

3,差分对之间的间距要保证在>=15mils,距离其他高速信号>=20mils,距离时钟信号>=50mils. 

4,信号换层控制在2个过孔(极限为4个过孔)。 

5,信号线需有完整的参考平面，尽量参考GND层。 

6,禁止将信号线布在晶体，晶振，时钟芯片等器件下方。 

7,USB1.1&USB2.0电流约为500mA,电源管脚走线宽度>=30mil;USB3.0电流约为900mA>=50mil. 

![](images/67b06662068bd4819634315884894edc52030385ea2bffc61f4731904092cd8d.jpg)


## 5

HDMI(High-Definition Mult-media Interface高清多媒体接口) 

HDMI接口可以提供高达5Gbps的数据传输带宽，可以传送无压缩的音频信号及高分辨率视频信号。同时无需在信号传送前进行数/模或者模/数转换，可以保证最高质量的影音信号传送。 

<table><tr><td>PIN</td><td>Signal Assignment</td></tr><tr><td>1</td><td>TMDS Data2+</td></tr><tr><td>3</td><td>TMDS Data2-</td></tr><tr><td>5</td><td>TMDS Data1 Shield</td></tr><tr><td>7</td><td>TMDS Data0+</td></tr><tr><td>9</td><td>TMDS Data0-</td></tr><tr><td>11</td><td>TMDS Clock Shield</td></tr><tr><td>13</td><td>CEC</td></tr><tr><td>15</td><td>SCL</td></tr><tr><td>17</td><td>DDC/CEC Ground</td></tr><tr><td>19</td><td>Hot Plug Detect</td></tr></table>

<table><tr><td>PIN</td><td>Signal Assignment</td></tr><tr><td>2</td><td>TMDS Data2 Shield</td></tr><tr><td>4</td><td>TMDS Data1+</td></tr><tr><td>6</td><td>TMDS Data1-</td></tr><tr><td>8</td><td>TMDS Data0 Shield</td></tr><tr><td>10</td><td>TMDS Clock+</td></tr><tr><td>12</td><td>TMDS Clock-</td></tr><tr><td>14</td><td>Reserved (N.C. on device)</td></tr><tr><td>16</td><td>SDA</td></tr><tr><td>18</td><td>+5V Power</td></tr></table>

![](images/45fa4e2a1a97f97ed8f4f40a49bdf00937536476ff283fed0d05210cbc8029b3.jpg)


## 5

![](images/af1c665f38480a0a06b3a10b94aabde62c9253268036f500b3e01a1f235a2d38.jpg)


![](images/3751b163c2d49c955310ef727ac85828d22fe45cb2a139a8faddffb8671cc70a.jpg)


## 5

## Layout注意事项：

1,差分线的特性阻抗标准一般为100欧(+/-10%) 

2,ESD器件必须靠近HDMI接口器件放置。 

3,信号线的匹配电阻起防ESD作用和微调阻抗用途，通常靠近插座放置，但是两个电阻必须是并排放置。 

4,差分对之间的等长误差为10mils,差分之间的误差5mils。 

5,差分信号之间的间距要保证在>=15mil,距离其他信号(包括平面分割线)也应保持在15mil以上。空间允许的情况下作包地处理。 

6,信号走线长度范围：接口->端子3000mils以内，接口->芯片8000mils以内。 

7,信号线需有完整的参考平面，优先考虑参考GND层走线。 

8,在换层处(距离换层VIA 150mil以内)加GND回流地过孔。 

## 5

## 射频接口 (RF)

RF 射频端子--TV 接口：RF 射频端子是最早在电视机上出现的，原意为无线电射频（Radio Frequency） 

![](images/513d45406148552052122f06d84713936738169e9ff2f14f9900c9c8af2808b5.jpg)


![](images/89bf5cc4251364d4f1c48524cce484ca5a3f54ece1ae1a9830c424e32bf37711.jpg)


![](images/12d7eba818409b942aea9b72fa8ca161dfbcdc27ebeb18e0192d63a9eeb9f3c0.jpg)


## 5

## 光模块接口

![](images/afc5d63fbed089717da2f5b870731e429c9bfb3a1018eadd8e72db5b76342a7d.jpg)


![](images/4f2f37f3476ddfb35e89b51cbd2c0a00450de40741e17722894c0707577a8b2f.jpg)


## 5

## Layout注意事项:

1,注意器件接收、发送分开；光模块是用模块盒散热，布局时要注意器件的散热方式(有的器件是通过PCB板导热)。 

2,单端和差分信号都要注意接收和发送分开走线，以减少干扰；尽量走表层无需换层，信号线周围要尽量多打到GND的过孔，不同信号间要隔开。 

3,信号要尽量短而粗(可采用隔层参考的方式，这样既能加粗线宽又可控制阻抗)。 

4,差分布线尽量不打VIA,打VIA必须在铁槽之外，不可靠接口太近。 

![](images/c7de14caaad8cbdd1f11095b388875abdac048fb3832c80d65343aa212a8be21.jpg)


![](images/7a3816f1017abd5fb3060559670ddcdfbd3457a5641be9aeaadb7f18a8424b9f.jpg)


## 5

## 光耦

隔离用，使得输入和输出完全分开（两排管脚之间挖空处理） 

![](images/229b44ac0200b7fa6e6486501c15aca02990f8481c172460c86fa3ba97e5555a.jpg)


![](images/7fc69b8aee2902193e83e5b5cfe63f68fa1b696d908c982c5a4f7ed42c49900e.jpg)



1:ANODE
2:CATHODE
3:EMITTER
4:COLLECTOR



1,3,5,7 :ANODE
2,4,6,8 :CATHODE
9,11,13,15 :EMITTER
10,12,14,16 :COLLECTOR


## 5

## SD/TF卡

1.所有信号线同层布线，参考地平面走线 

2,所有信号需与CLK等长，误差+/-300mil. 

3, SD_CLK与其他信号线的间距 $> = 4 \mathrm{~W}$ . 

## SD CARD

![](images/a849aadeb84a4e7864ec1c825ed63dda23bfe8da9c5097e1cb25ce20bb7eb975.jpg)


![](images/ce53de20b42ea5f5a32495c98d2379a36cfc19d05a201bab30942e542c9a7fef.jpg)


## 5

## SIM卡

1. 时钟信号需包地处理，有完整的参考平面。 

2，信号线距离其他信号需保证3w原则。 

3, SIM卡属于经常热插拔器件，必须要有ESD防护措施 

![](images/04e1c8ab8e3eec9076d18c008e7344d2e148e720e0ce603a70852e2c176c437c.jpg)


![](images/c2534a54738aef051e44b9abf546267f504a2dda2b893718061574068fbf6bce.jpg)


![](images/37b421a7e3ae5e6ea8aebc1ccca8ce05b4184c22982e009e775b3246338c1705.jpg)


![](images/a2fbab05d3ea471436483d79fe68f4ad44bf202608e1bfc520f06fca01902dbe.jpg)


## 5

![](images/57554d20c25505b4863dc879cf6e5d85461554e3cd496c1237d583121f7e39a3.jpg)


LCD总线 

<table><tr><td>LCD_DATA[17:0]</td><td>2</td><td rowspan="5">此组数字信号尽量保证完整的GND平面做参考回流路径。所有信号与LCD_PCLK做等长处理，要求偏差±300mil。由于LCD连接器可能在RF布线区域附近，尤其是对于折叠手机。PCB布线时，考虑LCD信号与其他敏感信号（如RF信号）的影响。建议根据布局布线情况在连接器侧或者FPC的入口侧增加EMI器件。LCD器件注意ESD防护，如果需要，在靠近LCD连接器侧放置ESD防护器件，推荐使用ESD/EMI集成器件。该组信号安排在同一个走线区域，避免走线散乱。</td></tr><tr><td>LCD_PCLK</td><td>2</td></tr><tr><td>LCD_HSYNC</td><td>2</td></tr><tr><td>LCD_VSYNC</td><td>2</td></tr><tr><td>LCD_DE</td><td>2</td></tr></table>

## 5

<table><tr><td>CAM_DATA[7:0]</td><td>2</td><td rowspan="4">此组数字信号尽量保证完整的GND平面做参考回流路径。所有信号与CAM_PCLK做等长处理,要求偏差±300mil。由于Camera信号总线对于容性负载有要求,所以,信号线在设计可能的限度内,尽可能短和少走过孔以减小走线的负载阻抗。由于Camera连接器可能在RF布线区域附近,尤其是对于折叠手机。PCB布线时,考虑Camera信号对其他敏感信号(如RF信号)的影响。建议根据布局布线情况在连接器侧或者FPC的入口侧增加EMI器件。注意EMI器件选择时考虑对于EMI总线的容性负载影响。该组信号安排在同一个走线区域,避免走线散乱。</td></tr><tr><td>CAM[PCLK]</td><td>2</td></tr><tr><td>CAM_HSYNC</td><td>2</td></tr><tr><td>CAM_VHYNC</td><td>2</td></tr></table>

## 感谢观看

THANKS FOR WATCHIN 