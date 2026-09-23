(() => {
  const ROOT = document.getElementById('workbench');
  const OPEN = document.getElementById('openWorkbench');
  if (!ROOT || !OPEN) return;
  window.__workbenchV2 = true;

  const KEY = 'cx-white-nurse307-v1';
  const DEMO_PATIENTS = [
    {
      name:'陈女士', id:'P-2026', node:'ddEC 第1周期 D6', note:'体温异常已进入预审', level:'R1', action:'查看风险卡',
      chemo:{received:'是', date:'2026-08-13', cycle:'第1周期', record:'给药记录已同步'},
      report:{uploaded:'是', date:'2026-08-18 09:42', source:'患者拍照上传', values:[['WBC','2.6 ×10⁹/L','偏低'],['ANC','1.4 ×10⁹/L','已提取'],['NEUT%','53.8%','已提取'],['LYM','0.82 ×10⁹/L','已提取'],['LYM%','31.5%','已提取'],['HGB','112 g/L','已提取'],['PLT','176 ×10⁹/L','已提取']]},
      gcsf:{used:'是', date:'2026-08-14 15:20', note:'患者报告已使用长效升白针'},
      events:[['D1 · 08-13','已接受化疗','完成'],['D2–D3','长效升白针一次性记录','完成'],['D4 · 08-16','自主填报健康记录','完成'],['D6 · 08-18','血常规上传、今日健康随访','需关注']],
      adverse:[['发热','最高 38.8℃','红色预审'],['寒战','轻微发冷，无意识异常','已上报'],['恶心','轻度，可进食饮水','已记录']]
    },
    {
      name:'王女士', id:'P-2031', node:'ddEC 第2周期 D8', note:'血常规已上传，等待团队复核', level:'R2', action:'查看报告',
      chemo:{received:'是', date:'2026-08-11', cycle:'第2周期', record:'给药记录已同步'},
      report:{uploaded:'是', date:'2026-08-18 08:56', source:'患者拍照上传', values:[['WBC','3.1 ×10⁹/L','偏低'],['ANC','1.7 ×10⁹/L','已提取'],['NEUT%','55.0%','已提取'],['LYM','0.92 ×10⁹/L','已提取'],['LYM%','29.7%','已提取'],['HGB','106 g/L','已提取'],['PLT','158 ×10⁹/L','已提取']]},
      gcsf:{used:'是', date:'2026-08-12 14:10', note:'患者报告已使用长效升白针'},
      events:[['D1 · 08-11','已接受第2周期化疗','完成'],['D2 · 08-12','升白针使用已确认','完成'],['D6 · 08-16','语音随访','完成'],['D8 · 08-18','血常规已上传','待复核']],
      adverse:[['恶心','2次，无呕吐','已记录'],['乏力','较平时明显，仍能日常活动','团队关注'],['发热/出血','未上报','未命中']]
    },
    {
      name:'李女士', id:'P-2048', node:'ddEC 第1周期 D5', note:'自主填报连续 2 次未完成，AI 提醒电话待呼出', level:'待确认', action:'查看待办',
      chemo:{received:'是', date:'2026-08-14', cycle:'第1周期', record:'给药记录已同步'},
      report:{uploaded:'否', date:'—', source:'暂无患者上传', values:[]},
      gcsf:{used:'未到节点', date:'—', note:'待确认化疗后再按团队安排记录'},
      events:[['D1 · 08-14','化疗当天健康记录','完成'],['D3 · 08-16','自主填报未完成','未完成'],['D4 · 08-17','自主填报未完成','未完成'],['D5 · 08-18','AI 提醒电话 13:00–15:00','待呼出']],
      adverse:[['恶心/呕吐','未上报','未采集'],['发热/寒战','未上报','未采集'],['出血表现','未上报','未采集']]
    },
    {
      name:'赵女士', id:'P-2053', node:'ddEC 第3周期 D10', note:'随访完成，已回传总结', level:'已完成', action:'查看总结',
      chemo:{received:'是', date:'2026-08-09', cycle:'第3周期', record:'给药记录已同步'},
      report:{uploaded:'是', date:'2026-08-18 10:03', source:'患者拍照上传', values:[['WBC','5.8 ×10⁹/L','已提取'],['ANC','3.6 ×10⁹/L','已提取'],['NEUT%','62.1%','已提取'],['LYM','1.38 ×10⁹/L','已提取'],['LYM%','23.8%','已提取'],['HGB','109 g/L','已提取'],['PLT','203 ×10⁹/L','已提取']]},
      gcsf:{used:'是', date:'2026-08-10 13:40', note:'患者报告已使用长效升白针'},
      events:[['D1 · 08-09','已接受第3周期化疗','完成'],['D2 · 08-10','升白针使用已确认','完成'],['D6 · 08-14','语音随访','完成'],['D8 · 08-16','血常规上传','完成'],['D10 · 08-18','随访总结已回传','完成']],
      adverse:[['骨痛','3/10，现已缓解','已记录'],['恶心','轻度，无呕吐','已记录'],['发热/出血','未上报','未命中']]
    }
  ];
  const QUALITY = [
    {q:'我体温 38.8℃，需要等团队回复吗？', p:'陈女士 · P-2026', a:'先记录体温，建议继续观察。', s:'需优化', key:'应识别为红色风险；完成全部采集后提示及时挂号就诊，并推送团队工作台。若伴明显寒战、意识异常或憋气喘不上气，则提示立即就近急诊。'},
    {q:'血常规白细胞低，明天还能不能按时化疗？', p:'王女士 · P-2031', a:'白细胞稍低一般没有问题，可以按计划来。', s:'需优化', key:'不得直接给出是否按期治疗结论；需提取原始报告并转团队复核。'},
    {q:'有点恶心，但还能喝水吃饭，要怎么记录？', p:'李女士 · P-2048', a:'已记录恶心；请补充次数、能否进水进食及是否影响日常活动，团队将结合医嘱回复。', s:'回答良好', key:'症状采集完整，未越权给出处方或用药调整。'},
    {q:'打完升白针后有点骨头酸，是正常的吗？', p:'赵女士 · P-2053', a:'请记录疼痛位置、程度及是否伴皮疹、呼吸不适等；具体处理请按医嘱并由团队确认。', s:'回答良好', key:'风险追问充分，明确人工复核边界。'}
  ];
  const RESEARCH = {
    exposure:{title:'治疗暴露', metric:'按计划完成周期', value:'91%', chart:'各周期治疗完成率', points:[96,94,91,88], labels:['C1','C2','C3','C4'], fields:['方案与治疗意图','计划/实际给药日期与剂量','延迟、减量、停治原因','相对剂量强度（RDI）','长效升白针使用情况']},
    safety:{title:'安全性', metric:'关键字段完整性', value:'94%', chart:'D6–D10 安全性字段采集率', points:[97,94,91,94], labels:['血常规','体温','症状','医疗利用'], fields:['血常规：白细胞/中性粒/血红蛋白/血小板','团队确认的 CTCAE 不良事件','患者报告症状（PRO-CTCAE）','发热、感染征象、出血等风险事件','急诊、住院与非计划就医']},
    pro:{title:'患者报告结局', metric:'PRO 有效完成率', value:'89%', chart:'随访节点 PRO 完成率', points:[92,89,86,88], labels:['D1','D6','D8','D10'], fields:['PRO-CTCAE：频率、严重度、干扰程度','EORTC QLQ-C30 核心生活质量','EORTC QLQ-BR45 乳腺癌模块','功能、疲乏、恶心、睡眠等时间序列','患者便利接听时段与失访情况']},
    outcome:{title:'医疗利用与结局', metric:'治疗路径可追溯率', value:'96%', chart:'结构化结局字段完成率', points:[90,96,92,95], labels:['急诊','住院','回传','随访'], fields:['风险卡创建、团队联系与闭环时间','急诊/住院和非计划就医','治疗完成、延迟与中止','复发与生存等远期结局（按方案随访）','原始报告、语音摘要与人工复核留痕']}
  };
  let view = 'home';
  let queueFilter = '全部';
  let qualityReviewed = false;
  let researchKey = 'exposure';
  let selectedPatient = '';
  let selectedRecipients = new Set();
  let messageRecording = false;

  // Doctor workspace: local, fictional team and patient records.
  const TEAM_KEY='cx-white-nurse307-team-v1';
  const doctors=[{id:'lead',name:'张医生',title:'主任医师'},{id:'zhou',name:'周医生',title:'副主任医师'},{id:'li',name:'李医生',title:'主治医师'}];
  let teamState;try{teamState=JSON.parse((localStorage.getItem(TEAM_KEY)||'null').replace(/汤立晨主任|汤立晨|汤主任/g,'张医生'))}catch{}
  const freshTeam=()=>({owners:{'P-2026':'lead','P-2031':'zhou','P-2048':'li','P-2053':'zhou'},messages:{},invites:[],audit:[]});
  teamState=teamState||freshTeam();
  let role='lead',ownerFilter='all',queueQuery='',recordTab='archive',recordMetric='WBC',chatOrigin='patientDetail';
  const lead=()=>role==='lead',doctor=id=>doctors.find(d=>d.id===id)||doctors[0];
  const scopedPatients=()=>DEMO_PATIENTS.filter(p=>lead()||teamState.owners[p.id]===role);
  const ownerName=p=>doctor(teamState.owners[p.id]).name;
  const activePatient=()=>scopedPatients().find(p=>p.name===selectedPatient);
  const saveTeam=()=>localStorage.setItem(TEAM_KEY,JSON.stringify(teamState));
  const audit=text=>{teamState.audit.unshift({time:new Date().toLocaleString('zh-CN'),text,actor:doctor(role).name});saveTeam()};
  const canViewOutpatient=()=>lead()||teamState.owners['P-2026']===role;
  const opAlerts=()=>{if(!canViewOutpatient())return [];try{return (JSON.parse(localStorage.getItem('cx-white-nurse307-outpatient-v1'))?.alerts||[]).filter(a=>a.state!=='closed')}catch{return []}};
  const opPending=()=>opAlerts().length;
  function outpatientSummary(){if(!canViewOutpatient())return '';const list=opAlerts(),urgent=list.filter(a=>a.level==='urgent').length;return `<section class="dx-op-summary"><div class="dx-section"><h2>院外预警</h2><button data-outpatient="doctor">查看全部 ›</button></div><div class="dx-op-counts"><button data-outpatient="doctor"><b class="urgent">${urgent}</b><span>立即关注</span></button><button data-outpatient="doctor"><b>${list.filter(a=>a.level==='high').length}</b><span>优先处理</span></button><button data-outpatient="doctor"><b>${list.filter(a=>a.level==='attention').length}</b><span>需关注</span></button></div>${list.length?`<button class="dx-task dx-patient-alert" data-outpatient="doctor"><i>陈</i><span><b>陈女士 · ${list.length} 条待处理预警</b><small>${urgent?'立即关注':list.some(a=>a.level==='high')?'优先处理':'需关注'}${list.some(a=>a.contactRequested&&a.state!=='contacted')?' · 患者请求联系':''}</small><small>${esc([...new Set(list.map(a=>a.title))].join(' / '))}</small></span><em>›</em></button>`:''}</section>`}

  const icon=(name)=>{const paths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',shield:'M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7z M8 12l3 3 5-6',user:'M20 21v-2a7 7 0 0 0-14 0v2 M13 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',file:'M14 2H5v20h14V7z M14 2v6h5 M8 13h8 M8 17h6'};return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.file}"/></svg>`};
  function doctorNav(){return `<nav class="dx-nav" aria-label="医生工作台导航">${[['home','grid','工作台'],['queue','people','患者'],...(lead()?[['team','shield','团队']]:[]),['account','user','我的']].map(([id,i,t])=>`<button data-go="${id}" class="${view===id||id==='queue'&&['patientDetail','records','chat'].includes(view)?'active':''}">${icon(i)}<span>${t}</span></button>`).join('')}</nav>`}
  function doctorHome(){const all=scopedPatients(),me=doctor(role);ROOT.innerHTML=`<div class="wbv2 dx-workspace"><div class="dx-top"><div><small>307 PROJECT · DOCTOR</small><h1>${lead()?'主任工作台':'我的工作台'}</h1></div><button data-go="account" aria-label="医生账户">${icon('user')}</button></div><section class="dx-hero"><div class="dx-person"><span class="dx-avatar"><img src="assets/medical-illustrations/team-warm-cartoon.png" alt="中国医护团队插画"></span><div><span class="dx-work-chip">医生端 · ${lead()?'团队负责人':'团队医生'}</span><h2>化疗随访工作台</h2><p>${me.name} · 307医院</p></div></div><div class="dx-hero-total"><div><b>${all.length}</b><span>${lead()?'团队患者':'我的患者'}</span><small>化疗全周期 · 持续随访</small></div><button data-go="queue">查看患者 ›</button></div></section><p class="dx-scope">${icon('shield')}${lead()?'当前范围：整个团队':'当前范围：本人负责患者'} · 虚构演示</p><div class="dx-stats"><button data-go="queue"><b>${all.length}</b><span>管理患者</span></button><button data-go="risk"><b class="warm">${riskData().length}</b><span>需关注患者</span></button><button ${lead()?'data-outpatient="doctor"':'data-go="queue"'}><b>${lead()?opPending():all.filter(p=>p.level!=='已完成').length}</b><span>${lead()?'院外待处理':'随访中'}</span></button></div>${lead()?`<div class="dx-section"><h2>团队患者分布</h2><button data-go="team">管理团队 ›</button></div><section class="dx-team-list">${doctors.map(d=>`<button data-owner="${d.id}"><span class="dx-mini-avatar">${d.name[0]}</span><span><b>${d.name}<em>${d.id==='lead'?'我':d.title}</em></b><small>${d.id==='lead'?'本人负责':'团队医生'}</small></span><strong>${all.filter(p=>teamState.owners[p.id]===d.id).length}</strong><i>›</i></button>`).join('')}</section>`:''}<div class="dx-section"><h2>${lead()?'团队待办':'我的待办'}</h2><span>及时跟进 · 全程留痕</span></div><button class="dx-task" data-go="risk"><i class="warm">!</i><span><b>风险患者复核</b><small>${riskData().length} 位患者待关注 · 查看原始记录</small></span><em>›</em></button>${lead()?`<button class="dx-task" data-outpatient="doctor"><i>${icon('file')}</i><span><b>院外预警处理</b><small>${opPending()} 条待处理 · 患者留言、报告与处理记录</small></span><em>›</em></button><div class="dx-tools">${[['quality','AI 回答质检','4 条抽检样本'],['research','科研看板','治疗 · 安全 · 结局'],['logs','处理日志','系统与团队留痕']].map(([id,t,n])=>`<button data-go="${id}"><b>${t}</b><small>${n}</small><span>↗</span></button>`).join('')}</div>`:''}<p class="wbv2-foot">AI 辅助采集与预审，临床判断由医疗团队完成。</p></div>`}
  function doctorQueue(){const all=scopedPatients().filter(p=>(ownerFilter==='all'||teamState.owners[p.id]===ownerFilter)&&(queueFilter==='全部'||queueFilter==='需关注'&&['R1','R2'].includes(p.level)||queueFilter==='已完成'&&p.level==='已完成'||queueFilter==='随访中'&&p.level!=='已完成'));const shown=all.filter(p=>(p.name+' '+p.id).toLowerCase().includes(queueQuery.toLowerCase()));ROOT.innerHTML=`<div class="wbv2">${header('患者队列',lead()?'整个团队 · 按主管医生筛选':'仅展示本人负责的患者')}<label class="wbv2-search">⌕<input id="dxSearch" placeholder="搜索患者姓名 / 编号" aria-label="搜索患者" value="${esc(queueQuery)}"></label>${lead()?`<div class="dx-filter">${[['all','整个团队'],...doctors.map(d=>[d.id,d.name])].map(([id,t])=>`<button data-owner="${id}" class="${ownerFilter===id?'active':''}">${t}</button>`).join('')}</div>`:''}<div class="wbv2-pills">${['全部','随访中','需关注','已完成'].map(t=>`<button data-filter="${t}" class="${queueFilter===t?'active':''}">${t}</button>`).join('')}</div><p class="dx-scope" id="dxResultCount">当前筛选 · ${shown.length} 位患者</p><div id="dxPatients">${all.map(p=>`<article class="dx-patient" data-patient-search="${esc(p.name+' '+p.id)}" ${shown.includes(p)?'':'hidden'}><div class="dx-patient-top"><span class="dx-mini-avatar">${p.name[0]}</span><div><button data-patient="${p.name}">${p.name}</button><small>${p.id} · ${p.chemo.cycle}</small></div><button class="dx-chat-pill" data-chat="${p.name}">发起聊天</button></div><p>${p.note}</p><div class="dx-owner">主管医生：${ownerName(p)} ${status(p.level)}</div><button class="dx-record-entry" data-record="${p.name}">${icon('file')}<span><b>患者病历</b><small>病历档案 · 检查报告 · 关键指标</small></span><em>›</em></button></article>`).join('')}</div><div id="dxEmpty" class="wbv2-empty" ${shown.length?'hidden':''}>当前范围内没有匹配患者</div></div>`}
  function teamView(){ROOT.innerHTML=`<div class="wbv2">${header('团队管理','张医生团队 · 演示')}<section class="dx-info"><h2>协作照护，各有所属</h2><p>1 位负责人 · 2 位团队医生<br>负责人查看全队列，团队医生查看本人患者。</p></section>${doctors.map(d=>`<article class="dx-member"><span class="dx-mini-avatar">${d.name[0]}</span><div><b>${d.name}</b><small>${d.title} · ${d.id==='lead'?'负责人':'团队医生'}</small></div><em>${DEMO_PATIENTS.filter(p=>teamState.owners[p.id]===d.id).length} 位</em></article>`).join('')}${teamState.invites.map(d=>`<article class="dx-member"><span class="dx-mini-avatar">邀</span><div><b>${esc(d.name)}</b><small>${esc(d.title)} · 邀请预览</small></div><em>未发送</em></article>`).join('')}<details class="dx-info"><summary>＋ 邀请医生加入</summary><form id="dxInvite"><label>医生姓名<input name="name" required maxlength="20" placeholder="输入医生姓名"></label><label>职称<select name="title"><option>副主任医师</option><option>主治医师</option><option>住院医师</option></select></label><button class="wbv2-wide">生成邀请预览（演示）</button></form></details><h2 class="wbv2-section-title">团队操作记录</h2><section class="dx-info">${teamState.audit.length?teamState.audit.map(a=>`<div class="dx-audit"><b>${esc(a.text)}</b><small>${esc(a.time)} · ${esc(a.actor)}</small></div>`).join(''):'<p>暂无团队操作记录</p>'}</section></div>`}
  function accountView(){ROOT.innerHTML=`<div class="wbv2">${header('我的账户')}<section class="dx-info"><span class="dx-mini-avatar">${doctor(role).name[0]}</span><h2>${doctor(role).name}</h2><p>${doctor(role).title} · 张医生团队</p><p>${lead()?'可查看全部患者，管理团队和患者归属。':'仅可查看、搜索和联系本人负责的患者。'}</p></section><section class="dx-info"><h2>切换演示身份</h2><p>以下是虚构角色体验，不是真实账号授权。</p>${doctors.map(d=>`<button class="dx-role ${role===d.id?'active':''}" data-role="${d.id}">${d.name}<small>${d.id==='lead'?'团队负责人':'团队医生'} ${role===d.id?'· 当前身份':''}</small></button>`).join('')}</section></div>`}
  function recordsView(){const p=activePatient();ROOT.innerHTML=`<div class="wbv2">${header('患者病历',p.name+' · '+p.id,'queue')}<section class="dx-info"><h2>${p.name}</h2><p>${p.node} · 主管医生 ${ownerName(p)}</p><span class="dx-readonly">虚构资料 · 只读查看</span></section><div class="dx-record-tabs">${[['archive','病历档案'],['reports','检查报告'],['metrics','关键指标']].map(([id,t])=>`<button data-record-tab="${id}" class="${recordTab===id?'active':''}">${t}</button>`).join('')}</div>${recordTab==='archive'?`<section class="dx-info"><h2>病情与治疗</h2>${[['疾病','乳腺癌（演示）'],['治疗方案','ddEC · '+p.chemo.cycle],['实际给药日期',p.chemo.date],['升白针记录',p.gcsf.used],['分子分型','待补充'],['TNM 分期','待补充'],['ER / PR / HER2','待补充'],['Ki-67','待补充'],['BRCA1/2','待补充']].map(([k,v])=>`<div class="dx-data-row"><span>${k}</span><b>${v}</b></div>`).join('')}</section>`:recordTab==='reports'?`<section class="dx-info"><h2>血常规报告</h2><p>${p.report.date} · ${p.report.source}</p>${p.report.values.length?`<div class="dx-data-row"><span>指标</span><b>记录值 / 状态</b></div>${p.report.values.map(x=>`<div class="dx-data-row"><span>${x[0]}</span><b>${x[1]}<small>${x[2]}</small></b></div>`).join('')}<p>演示数据，无真实原件附件。</p>`:'<div class="wbv2-empty">尚未上传检查报告</div>'}</section>`:`<section class="dx-info"><h2>关键指标</h2><div class="dx-filter">${['WBC','ANC','HGB','PLT'].map(k=>`<button data-metric="${k}" class="${recordMetric===k?'active':''}">${k}</button>`).join('')}</div><div class="dx-metric"><small>${recordMetric} · 最近记录</small><b>${p.report.values.find(x=>x[0]===recordMetric)?.[1]||'暂无记录'}</b><p>${p.report.uploaded==='是'?p.report.date:'尚未上传'}</p></div><div class="dx-trend-empty">⌁<b>暂无连续趋势</b><small>当前${p.report.values.length?'仅有单次':'没有'}检验记录，待补充后展示趋势。</small></div><p>参考范围以原报告为准，由团队核对异常。</p></section>`}<button class="wbv2-wide" data-chat="${p.name}" data-origin="records">与患者沟通</button></div>`}
  function chatView(){const p=activePatient();ROOT.innerHTML=`<div class="wbv2">${header('与'+p.name+'沟通',p.id+' · 主管医生 '+ownerName(p),chatOrigin)}<p class="dx-scope">发送身份：${doctor(role).name} · 仅本地演示</p><div class="dx-chat-history"><div class="dx-bubble"><small>${p.name} · 虚构消息</small>医生您好，我想了解接下来的复查安排。</div>${(teamState.messages[p.id]||[]).map(m=>`<div class="dx-bubble sent"><small>${esc(m.author)} · ${esc(m.time)}</small>${esc(m.text)}</div>`).join('')}</div><form id="dxChat"><label>回复内容<textarea name="message" aria-label="回复内容" maxlength="1000" required placeholder="输入回复，仅保存到演示会话"></textarea></label><button class="wbv2-wide">保存演示回复</button></form><p class="wbv2-foot">不会向真实患者发送消息。</p></div>`}
  function doctorBind(){ROOT.querySelectorAll('[data-owner]').forEach(b=>b.onclick=()=>{ownerFilter=b.dataset.owner;queueQuery='';view='queue';render()});ROOT.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{role=b.dataset.role;ownerFilter='all';queueFilter='全部';queueQuery='';selectedPatient='';selectedRecipients.clear();view='home';render();ROOT.scrollTo(0,0)});ROOT.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>{selectedPatient=b.dataset.record;recordTab='archive';view='records';render();ROOT.scrollTo(0,0)});ROOT.querySelectorAll('[data-record-tab]').forEach(b=>b.onclick=()=>{recordTab=b.dataset.recordTab;render()});ROOT.querySelectorAll('[data-metric]').forEach(b=>b.onclick=()=>{recordMetric=b.dataset.metric;render()});ROOT.querySelectorAll('[data-chat]').forEach(b=>b.onclick=()=>{selectedPatient=b.dataset.chat;chatOrigin=b.dataset.origin||'patientDetail';view='chat';render();ROOT.scrollTo(0,0)});
 const search=ROOT.querySelector('#dxSearch');if(search)search.oninput=()=>{queueQuery=search.value;let count=0;ROOT.querySelectorAll('[data-patient-search]').forEach(el=>{el.hidden=!el.dataset.patientSearch.toLowerCase().includes(queueQuery.trim().toLowerCase());if(!el.hidden)count++});ROOT.querySelector('#dxEmpty').hidden=!!count;ROOT.querySelector('#dxResultCount').textContent=`当前筛选 · ${count} 位患者`};
 const invite=ROOT.querySelector('#dxInvite');if(invite)invite.onsubmit=e=>{e.preventDefault();if(!lead())return;const f=new FormData(invite),name=f.get('name').trim();if(!name)return;teamState.invites.push({name,title:f.get('title')});audit('生成 '+name+' 的邀请预览（未发送）');render();notice('已保存邀请预览，未实际发送')};
 const transfer=ROOT.querySelector('#dxTransfer');if(transfer)transfer.onsubmit=e=>{e.preventDefault();const p=activePatient();if(!lead()||!p)return;const next=new FormData(transfer).get('owner');if(next===teamState.owners[p.id]){notice('主管医生未变更');return}const old=ownerName(p);teamState.owners[p.id]=next;audit(`${p.name}：${old} → ${doctor(next).name}`);render();notice('已更新演示患者归属')};
 const chat=ROOT.querySelector('#dxChat');if(chat)chat.onsubmit=e=>{e.preventDefault();const p=activePatient(),text=new FormData(chat).get('message').trim();if(!p||!text)return;(teamState.messages[p.id]||=[]).push({author:doctor(role).name,time:new Date().toLocaleString('zh-CN'),text});saveTeam();render();notice('回复已保存到演示会话')};
 }

  const state = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
  };
  const sourceName = (s) => s.completionSource || (s.voiceDone&&s.selfDone?'混合完成':s.voiceDone?'AI 电话随访':s.selfDone?'自主填报':'尚未完成');
  const esc = (s) => String(s || '').replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[x]));
  const go = (id) => {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
  };
  const notice = (text) => {
    let el = document.getElementById('wbv2Notice');
    if (!el) { el = document.createElement('div'); el.id = 'wbv2Notice'; document.querySelector('.phone')?.append(el); }
    el.textContent = text; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2300);
  };
  const riskData = () => {
    const s = state();
    const actionText=s.emergency?'已提示立即就近急诊':s.red?'体温超过 38.5℃，已提示及时挂号就诊':'体温异常已进入预审';
    const lead = {...DEMO_PATIENTS[0], note:s.red?`${sourceName(s)}命中红色风险；${actionText}`:DEMO_PATIENTS[0].note, action:'查看风险卡'};
    return [lead, {...DEMO_PATIENTS[1], action:'查看风险卡'}].filter(p=>scopedPatients().some(v=>v.id===p.id));
  };
  const header = (title, sub='张医生团队 · 化疗随访', back='home', right='patient') => `<header class="wbv2-head"><button class="wbv2-back" data-go="${back}" aria-label="返回${({home:'工作台',queue:'患者队列',risk:'风险队列',records:'患者病历',patientDetail:'患者详情'})[back]||'工作台'}">‹</button><div><h1>${title}</h1><small>${sub}</small></div><button class="wbv2-patient" data-go="${right}" aria-label="返回患者端">${right==='logs'?'日志':'↗'}</button></header>`;
  const overview = (active='') => `<div class="wbv2-overview"><button class="wbv2-kpi ${active==='risk'?'selected':''}" data-go="risk"><span>♙</span><b>${riskData().length}</b><strong>风险患者</strong><small>点击展开今日待办</small></button>${lead()?`<button class="wbv2-kpi ${active==='quality'?'selected':''}" data-go="quality"><span>AI</span><b>4</b><strong>抽检回答质量</strong><small>点击查看 4 条抽检样本</small></button>`:''}</div>`;
  const status = (level) => `<em class="wbv2-status ${level==='R1'?'urgent':level==='R2'||level==='待确认'?'priority':level==='需优化'?'fix':'good'}">${level}</em>`;
  const patientSwitch = () => `<button class="wbv2-switch-patient" data-go="patient" type="button">切换回患者端</button>`;
  const patientRow = (p, isRisk=false) => isRisk
    ? `<article class="wbv2-patient-row"><span class="wbv2-initial">${p.name[0]}</span><div><b>${p.name} · ${p.id}</b><small>${p.node} · ${p.note}</small></div>${status(p.level)}<button class="wbv2-outline" data-risk="${esc(p.name)}" type="button">${p.action}</button></article>`
    : `<article class="wbv2-patient-row wbv2-queue-row"><input class="wbv2-select" data-select="${esc(p.name)}" type="checkbox" aria-label="选择${esc(p.name)}" ${selectedRecipients.has(p.name)?'checked':''}><span class="wbv2-initial">${p.name[0]}</span><div><b>${p.name} · ${p.id}</b><small>${p.node} · ${p.note}</small></div><button class="wbv2-outline" data-patient="${esc(p.name)}" type="button">查看</button></article>`;

  const messagePanel = (recipients, mode='risk') => {
    const valid = recipients.filter(Boolean);
    const recipientText = valid.length ? valid.join('、') : '请先在患者队列中勾选患者';
    const enabled = valid.length > 0;
    return `<section class="wbv2-panel wbv2-message"><div class="wbv2-panel-head"><h2>以张医生团队身份发送消息</h2><span>演示</span></div><small>接收患者：${esc(recipientText)}</small><label>文字内容（用于 AI 风险审核）<textarea id="wbv2Message" placeholder="输入群发消息…"></textarea></label><div id="wbv2MessageReview" class="wbv2-message-review">AI 风险审核：等待输入</div><button class="wbv2-record" data-record-message type="button">${messageRecording?'结束录制语音':'开始录制语音'}</button><p>${messageRecording?'正在录制语音（演示）。':'未录制语音。语音消息也需填写或审核文字内容，作为 AI 审核依据。'}</p><button class="wbv2-wide" data-send-message="${esc(valid.join('|'))}" type="button" ${enabled?'':'disabled'}>确认向${enabled?valid.length:'已选'}位患者推送（演示）</button></section>`;
  };

  function home() {
    ROOT.innerHTML = `<div class="wbv2"> <div class="wbv2-handle"></div><section class="wbv2-hero"><img src="assets/tang-cartoon-transparent.png" alt="张医生"><div><span>医生端</span><h1>化疗随访工作台</h1><p>风险处置、AI 质检与科研数据闭环</p></div></section>${overview()}<button class="op-home-entry" data-outpatient="doctor"><span class="op-home-icon">!</span><span><b>307 院外预警处理</b><small>查看报告、筛查结果与处理记录</small></span><i>›</i></button><h2 class="wbv2-section-title">快捷入口</h2><div class="wbv2-quick"><button data-go="queue"><i>◌</i><b>患者队列</b><small>按节点与风险分组查看</small></button><button data-go="research"><i>▥</i><b>科研看板</b><small>化疗全流程数据沉淀</small></button><button data-go="logs"><i>▤</i><b>处理日志</b><small>系统与团队操作留痕</small></button></div><p class="wbv2-foot">全部为演示数据。AI 做结构化采集与风险预审，临床判断由团队完成。</p>${patientSwitch()}</div>`;
  }
  function risk() {
    ROOT.innerHTML = `<div class="wbv2">${header('风险患者')}${overview('risk')}<section class="wbv2-panel"><div class="wbv2-panel-head"><h2>今日待办 · 风险队列</h2><span>R1 / R2</span></div>${riskData().map((p,i)=>patientRow(p,true)).join('')}<div class="wbv2-safe">风险卡展示原始输入、规则命中、团队联系与处置留痕；不自动生成临床处置结论。</div></section>${messagePanel(riskData().map(p=>p.name),'risk')}${patientSwitch()}</div>`;
  }
  function riskDetail() {
    const s = state();
    const p = activePatient();
    const contacted=Boolean(teamState.contacts?.[p.id]||(p.name==='陈女士'&&s.contacted));
    const current = p.name==='陈女士' && (s.voiceDone||s.selfDone);
    const report = current ? (s.uploaded ? {uploaded:'是',date:'今日 D6 · 患者拍照上传',source:'患者端模拟上传',values:[['WBC','2.8 ×10⁹/L','偏低'],['ANC','1.5 ×10⁹/L','已提取'],['NEUT%','54.2%','已提取'],['LYM','0.86 ×10⁹/L','已提取'],['LYM%','30.7%','已提取'],['HGB','118 g/L','已提取'],['PLT','172 ×10⁹/L','已提取']]} : {uploaded:'否',date:'—',source:'患者回答“尚未上传”',values:[]}) : p.report;
    const summaryValue = (label) => (s.summaryRows || []).find(x => x[0] === label)?.[1] || '';
    const feverRecord = current ? (summaryValue('体温与感染征象')||summaryValue('最高体温')) : '';
    const highest = p.name!=='陈女士'?'未记录':feverRecord.match(/(?:体温)?\s*(3[789]|40)(?:[.点][0-9一二三四五六七八九])?/)?.[0] || '38.8℃';
    const rash = current && s.rashReported ? (s.rashPhotoUploaded ? '已回传皮疹照片，待团队人工复核' : '已报告皮疹，已提醒患者拍照回传') : '未报告皮疹';
    const symptom = feverRecord ? `患者原话：${esc(feverRecord)}` : '最高体温 38.8℃，伴轻微发冷；随访已完成。';
    const riskText = p.name==='陈女士' ? `D6 ${sourceName(s)}中记录最高体温 ${highest}；${symptom}` : p.note;
    const labs = report.uploaded==='是' ? `<div class="wbv2-risk-labs">${report.values.map(x=>`<div><small>${x[0]}</small><b>${x[1]}</b><em class="${x[2]==='偏低'?'low':''}">${x[2]}</em></div>`).join('')}</div>` : `<div class="wbv2-empty">患者本次尚未上传血常规报告；系统已在随访结束后提示患者补传，团队仍需结合原始记录复核。</div>`;
    ROOT.innerHTML = `<div class="wbv2">${header('风险患者详情',p.id+' · '+p.node,'risk','logs')}<section class="wbv2-risk-hero"><span>${p.id} · ${p.node}</span><h2>${p.name} · ${p.level} 风险</h2><p>乳腺癌术后辅助化疗 · ${p.chemo.cycle}</p></section><section class="wbv2-panel wbv2-risk-summary"><div class="wbv2-panel-head"><h2>今日风险摘要</h2>${status(p.level==='R2'?'R2':'R1')}</div><p>${riskText}</p><div class="wbv2-risk-metrics"><div><b>${highest}</b><small>最高体温</small></div><div><b>${report.uploaded==='是'?(report.values.find(x=>x[0]==='WBC')?.[1]||'—'):'待上传'}</b><small>白细胞 WBC</small></div><div><b>${p.chemo.cycle}</b><small>化疗周期</small></div></div></section><section class="wbv2-panel"><div class="wbv2-panel-head"><h2>化疗与支持治疗</h2><span>结构化记录</span></div><dl class="wbv2-risk-dl"><div><dt>是否接受化疗</dt><dd>${p.chemo.received}</dd></div><div><dt>实际给药日期</dt><dd>${p.chemo.date}</dd></div><div><dt>升白针使用</dt><dd>${p.gcsf.used} · ${p.gcsf.date}</dd></div></dl></section><section class="wbv2-panel"><div class="wbv2-panel-head"><h2>血常规与其他指标</h2><span>${report.uploaded==='是'?'已上传':'待补传'}</span></div>${labs}<p class="wbv2-risk-note">AI 只整理已采集字段与规则命中，不判断是否可继续化疗或调整治疗。</p></section><section class="wbv2-panel"><div class="wbv2-panel-head"><h2>患者原始随访记录</h2><span>待人工复核</span></div><div class="wbv2-risk-record"><b>症状记录</b><p>${riskText}</p><b>皮疹照片</b><p>${rash}</p><b>其他不良反应</b>${p.adverse.map(x=>`<p>${x[0]}：${x[1]}（${x[2]}）</p>`).join('')}</div></section><section class="wbv2-panel wbv2-contact"><b>团队处置留痕</b><small>${contacted?'已联系患者；风险卡保留供团队继续复核。':'尚未记录联系；请由团队确认后留痕。'}</small>${contacted?'<span class="wbv2-contacted">已联系患者</span>':'<button class="wbv2-wide" data-contact type="button">标记已联系患者（演示）</button>'}</section>${patientSwitch()}</div>`;
    ROOT.querySelector('.wbv2-risk-hero')?.insertAdjacentHTML('beforeend',`<em class="wbv2-source">采集来源：${sourceName(s)}</em>`);
  }
  function quality() {
    ROOT.innerHTML = `<div class="wbv2">${header('抽检回答质量')}${overview('quality')}<section class="wbv2-panel"><div class="wbv2-panel-head"><h2>抽检回答质量</h2><span>${qualityReviewed?'已完成首轮复核':'2 条需优化 · 2 条良好'}</span></div>${QUALITY.map((x,i)=>`<article class="wbv2-quality"><span class="wbv2-num">${i+1}</span><div><h3>${x.q}</h3><small>${x.p}</small><p><b>AI 原回答：</b>${x.a}</p><p class="wbv2-key"><b>质检要点：</b>${x.key}</p></div>${status(x.s)}</article>`).join('')}<button class="wbv2-wide" data-review="quality">${qualityReviewed?'已生成质检留痕':'确认首轮质检并留痕（演示）'}</button></section></div>`;
  }
  function queue() {
    const filters = ['全部','随访中','需关注','已完成'];
    const shown = DEMO_PATIENTS.filter(p => queueFilter==='全部' || (queueFilter==='需关注'&&['R1','R2'].includes(p.level)) || (queueFilter==='已完成'&&p.level==='已完成') || (queueFilter==='随访中'&&p.level!=='已完成'));
    const chosen = [...selectedRecipients];
    ROOT.innerHTML = `<div class="wbv2">${header('患者队列')}<section class="wbv2-panel wbv2-queue"><label class="wbv2-search">⌕<input id="wbv2Search" placeholder="按患者姓名或编号搜索"></label><div class="wbv2-pills">${filters.map(x=>`<button class="${queueFilter===x?'active':''}" data-filter="${x}">${x}</button>`).join('')}</div><div class="wbv2-select-line"><b>化疗随访队列</b><span>已选择 ${chosen.length} 位 · 共 ${shown.length} 位</span></div><div id="wbv2QueueList">${shown.map(p=>patientRow(p)).join('')}</div></section>${messagePanel(chosen,'queue')}${patientSwitch()}</div>`;
  }
  function patientDetail() {
    const s = state();
    const p = activePatient();
    const report = p.report.uploaded==='是'
      ? `<button class="wbv2-report-toggle" data-report-toggle type="button">查看化验单详情</button><div class="wbv2-report-detail" hidden><div class="wbv2-report-meta">${p.report.date} · ${p.report.source}</div>${p.report.values.map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b><em class="${x[2]==='偏低'?'low':''}">${x[2]}</em></div>`).join('')}<p>AI 仅提取关键字段并提示人工复核，不判断是否按期化疗。</p></div>`
      : `<div class="wbv2-empty">尚未上传化验单，当前无可查看的检验指标。</div>`;
    ROOT.innerHTML = `<div class="wbv2">${header(p.name+' · '+p.id,p.node,'queue')}<section class="wbv2-patient-summary"><span class="wbv2-initial">${p.name[0]}</span><div><b>${p.chemo.cycle}</b><small>${p.note}</small></div>${status(p.level)}</section><section class="wbv2-panel wbv2-detail"><div class="wbv2-panel-head"><h2>化疗记录</h2><span>${p.chemo.received==='是'?'已记录':'待核对'}</span></div><dl><div><dt>是否接受化疗</dt><dd>${p.chemo.received}</dd></div><div><dt>实际/计划日期</dt><dd>${p.chemo.date}</dd></div><div><dt>记录状态</dt><dd>${p.chemo.record}</dd></div></dl></section><section class="wbv2-panel wbv2-detail"><div class="wbv2-panel-head"><h2>化验单</h2><span>${p.report.uploaded==='是'?'已上传':'未上传'}</span></div>${report}</section><section class="wbv2-panel wbv2-detail"><div class="wbv2-panel-head"><h2>升白针</h2><span>${p.gcsf.used}</span></div><dl><div><dt>使用情况</dt><dd>${p.gcsf.used}</dd></div><div><dt>记录时间</dt><dd>${p.gcsf.date}</dd></div><div><dt>备注</dt><dd>${p.gcsf.note}</dd></div></dl></section><section class="wbv2-panel wbv2-detail"><div class="wbv2-panel-head"><h2>每日事项</h2><span>按治疗节点</span></div><div class="wbv2-event-list">${p.events.map(x=>`<article><time>${x[0]}</time><span>${x[1]}</span><em class="${x[2]==='需关注'||x[2]==='待复核'?'warn':x[2]==='待补充'?'pending':''}">${x[2]}</em></article>`).join('')}</div></section><section class="wbv2-panel wbv2-detail"><div class="wbv2-panel-head"><h2>患者上报不良反应</h2><span>${p.name==='陈女士'?sourceName(s):'AI 电话随访'}</span></div><div class="wbv2-adverse">${p.adverse.map(x=>`<article><b>${x[0]}</b><span>${x[1]}</span><em>${x[2]}</em></article>`).join('')}</div><div class="wbv2-safe">以上均为虚构演示数据；风险预审与报告提取需要张医生团队结合原始记录复核。</div></section>${patientSwitch()}</div>`;
  }
  function research() {
    const d = RESEARCH[researchKey];
    const bars = d.points.map((v,i)=>`<div class="wbv2-bar"><i style="height:${v}%"></i><b>${v}%</b><small>${d.labels[i]}</small></div>`).join('');
    ROOT.innerHTML = `<div class="wbv2">${header('科研看板','化疗全流程 · 演示队列')}<div class="wbv2-research-kpi"><div><i>♙</i><b>68</b><strong>累计入组</strong><small>演示队列</small></div><div><i>⌁</i><b>28</b><strong>随访中</strong><small>ddEC 全周期</small></div><div><i>✓</i><b>94%</b><strong>数据完整性</strong><small>核心字段</small></div></div><section class="wbv2-panel wbv2-research"><h2>${d.title}趋势</h2><div class="wbv2-pills wbv2-research-tabs">${Object.entries(RESEARCH).map(([k,v])=>`<button class="${researchKey===k?'active':''}" data-research="${k}">${v.title}</button>`).join('')}</div><div class="wbv2-chart"><div><b>${d.chart}</b><span>${d.metric} <strong>${d.value}</strong></span></div><div class="wbv2-bars">${bars}</div></div><p class="wbv2-caption">演示队列的结构化汇总，不用于个体临床决策或疗效推断。</p></section><section class="wbv2-panel wbv2-fields"><div class="wbv2-panel-head"><h2>建议采集字段</h2><span>研究方案与伦理确认后使用</span></div>${d.fields.map((x,i)=>`<div><b>${String(i+1).padStart(2,'0')}</b><span>${x}</span></div>`).join('')}</section></div>`;
  }
  function logs() {
    const s = state();
    const rows = [
      ['10:00','系统推送',`已生成 ddEC D6 今日健康任务；默认方式：${s.mode==='self'?'自主填报':'AI 电话随访'}。`],
      ['10:08','系统质检','已生成 4 条 AI 回答质量抽检样本。'],
      ['13:12','患者回传',(s.voiceDone||s.selfDone)?`${sourceName(s)}完成，已生成今日总结卡。`:(s.reminderCall?'连续两次未完成，已进入 AI 提醒电话队列。':'等待患者完成今日健康记录。')],
      ['13:15','风险预审',s.red?'已生成红色风险卡；'+(s.contacted?'团队已联系患者。':'待团队联系。'):'当前无患者端演示红色风险。']
    ];
    rows.push(...teamState.audit.map(a=>[esc(a.time),'团队操作',esc(a.text)]));
    rows.push(...(s.careCalls||[]).filter(c=>c.sent).map(c=>[c.time,'陪伴电话','独立陪伴总结已回传；不改变每日健康记录的完成状态。']));
    ROOT.innerHTML = `<div class="wbv2">${header('处理日志')}<section class="wbv2-log-hero"><img src="assets/tang-cartoon-transparent.png" alt="张医生"><span>结构化数据沉淀</span><h2>处理与推送日志</h2><p>系统推送、团队确认与患者回传均留痕</p></section><section class="wbv2-panel wbv2-logs">${rows.map(x=>`<article><time>${x[0]}</time><div><span>${x[1]}</span><p>${x[2]}</p></div></article>`).join('')}</section></div>`;
  }
  ROOT.addEventListener('click',e=>{if(canViewOutpatient()&&e.target.closest('[data-outpatient]'))window.Outpatient307?.open('doctor')});
  function render() {
    if(!lead()&&['team','quality','research','logs'].includes(view))view='home';
    if(['patientDetail','riskDetail','records','chat'].includes(view)&&!activePatient())view='queue';
    if (view==='home') doctorHome();
    if (view==='team') teamView();
    if (view==='account') accountView();
    if (view==='records') recordsView();
    if (view==='chat') chatView();
    if (view==='risk') risk();
    if (view==='riskDetail') riskDetail();
    if (view==='quality') quality();
    if (view==='queue') doctorQueue();
    if (view==='patientDetail') patientDetail();
    if (view==='research') research();
    if (view==='logs') logs();
    if(['home','risk'].includes(view))ROOT.querySelector('.dx-stats,.wbv2-overview')?.insertAdjacentHTML('afterend',outpatientSummary());
    if (!ROOT.querySelector('.wbv2-switch-patient')) ROOT.querySelector('.wbv2')?.insertAdjacentHTML('beforeend',patientSwitch());
    if(view==='patientDetail'){
      const p=activePatient();ROOT.querySelector('.wbv2-patient-summary').insertAdjacentHTML('afterend',`<section class="dx-info"><p>主管医生：${ownerName(p)}</p><button class="dx-record-entry" data-record="${p.name}">${icon('file')}<span><b>患者病历</b><small>病历档案 · 检查报告 · 关键指标</small></span><em>›</em></button><button class="wbv2-wide" data-chat="${p.name}">与患者沟通</button>${lead()?`<details><summary>调整主管医生</summary><form id="dxTransfer"><label>主管医生<select name="owner">${doctors.map(d=>`<option value="${d.id}" ${teamState.owners[p.id]===d.id?'selected':''}>${d.name}</option>`).join('')}</select></label><button class="wbv2-wide">保存归属调整（演示）</button></form></details>`:''}</section>`);
    }
    ROOT.querySelector('.wbv2')?.insertAdjacentHTML('beforeend',doctorNav());
    bind();doctorBind();
  }
  function bind() {
    ROOT.querySelectorAll('[data-go]').forEach(el => el.onclick = () => {
      if (el.dataset.go==='patient') { go('special'); return; }
      view = el.dataset.go; render(); ROOT.scrollTo({top:0,behavior:'smooth'});
    });
    ROOT.querySelectorAll('[data-filter]').forEach(el => el.onclick = () => { queueFilter=el.dataset.filter; render(); });
    ROOT.querySelectorAll('[data-select]').forEach(el => el.onchange = () => { if(el.checked) selectedRecipients.add(el.dataset.select); else selectedRecipients.delete(el.dataset.select); render(); });
    ROOT.querySelectorAll('[data-patient]').forEach(el => el.onclick = () => { selectedPatient=el.dataset.patient; view='patientDetail'; render(); ROOT.scrollTo({top:0,behavior:'smooth'}); });
    ROOT.querySelectorAll('[data-report-toggle]').forEach(el => el.onclick = () => { const detail=ROOT.querySelector('.wbv2-report-detail'); detail.hidden=!detail.hidden; el.textContent=detail.hidden?'查看化验单详情':'收起化验单详情'; });
    ROOT.querySelectorAll('[data-risk]').forEach(el => el.onclick = (event) => { event.preventDefault(); event.stopPropagation(); selectedPatient=el.dataset.risk || '陈女士'; view='riskDetail'; render(); ROOT.scrollTo({top:0,behavior:'smooth'}); });
    ROOT.querySelectorAll('[data-contact]').forEach(el => el.onclick = () => { const p=activePatient();if(!p)return;(teamState.contacts||={})[p.id]=true;audit(p.name+'：团队已联系（演示）');if(p.name==='陈女士'){const s=state();s.contacted=true;localStorage.setItem(KEY,JSON.stringify(s));} notice('已记录“团队已联系患者”（演示）。'); render(); });
    ROOT.querySelectorAll('[data-review]').forEach(el => el.onclick = () => { qualityReviewed=true; audit('完成 AI 回答首轮质检（演示）'); notice('已完成首轮质检并写入演示处理日志。'); render(); });
    ROOT.querySelectorAll('[data-research]').forEach(el => el.onclick = () => { researchKey=el.dataset.research; render(); });
    ROOT.querySelectorAll('[data-record-message]').forEach(el => el.onclick = () => { messageRecording=!messageRecording; notice(messageRecording?'已开始录制团队语音消息（演示）。':'已结束录制团队语音消息（演示）。'); render(); });
    ROOT.querySelectorAll('[data-send-message]').forEach(el => el.onclick = () => { const names=(el.dataset.sendMessage||'').split('|').filter(Boolean); const content=ROOT.querySelector('#wbv2Message')?.value.trim(); if(!names.length){notice('请先选择接收患者。');return} if(!content){notice('请先填写需要发送的消息内容。');return} messageRecording=false; notice(`已完成 AI 风险审核，并生成向 ${names.length} 位患者推送的演示记录。`); render(); });
    const message = ROOT.querySelector('#wbv2Message');
    if (message) message.oninput = () => { const review=ROOT.querySelector('#wbv2MessageReview'); if(review) review.textContent=message.value.trim() ? 'AI 风险审核：未发现明确紧急关键词，发送前仍请团队核对。' : 'AI 风险审核：等待输入'; };
    const search=ROOT.querySelector('#wbv2Search');
    if (search) search.oninput = () => {
      const term=search.value.trim();
      ROOT.querySelectorAll('#wbv2QueueList .wbv2-patient-row').forEach(row=>row.hidden=!!term&&!row.textContent.includes(term));
    };
  }
  OPEN.onclick = () => { view='home'; go('workbench'); render(); };
  window.Doctor307={reset(){teamState=freshTeam();saveTeam();role='lead';ownerFilter='all';queueFilter='全部';queueQuery='';selectedRecipients.clear();selectedPatient='';view='home';qualityReviewed=false;render()}};
  window.addEventListener('outpatient307-change',()=>{if(ROOT.classList.contains('active')&&['home','risk'].includes(view))render()});
  new MutationObserver(()=>{if(ROOT.classList.contains('active'))render()}).observe(ROOT,{attributes:true,attributeFilter:['class']});
  render();
})();
