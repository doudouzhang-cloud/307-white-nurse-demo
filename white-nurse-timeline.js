(()=>{
'use strict';
const host=document.getElementById('wn-timeline');
const E=window.Outpatient307Engine;
const OP=window.Outpatient307;
if(!host||!E||!OP)return;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[char]));
const kind={lab:'复查报告',scale:'身体评估',care:'导管维护',video:'护理宣教',daily:'每日随访'};
const dateLabel=date=>{const [y,m,d]=date.split('-');return `${Number(m)}月${Number(d)}日`};
function render(){
 const data=OP.snapshot();
 const day=Math.max(1,E.days(data.now,data.config.start)+1);
 let dailyState={};try{dailyState=JSON.parse(localStorage.getItem('cx-white-nurse307-v1')||'{}')}catch{}
 const daily={id:'daily-health',date:data.now,type:'daily',label:'今日身体情况记录',day,done:Boolean(dailyState.voiceDone||dailyState.selfDone)};
 const due=[...data.tasks.filter(task=>task.date<=data.now),daily];
 const pending=due.filter(task=>!task.done);
 const next=data.tasks.filter(task=>task.date>data.now).slice(0,2);
 const shown=due.slice(-5);
 const done=due.filter(task=>task.done).length;
 const heading='今日任务';
 host.innerHTML=`<div class="wn-care-hero"><img src="assets/medical-illustrations/team-warm-cartoon.png" alt="白护士长与307医院医生团队卡通形象"><div><span>307医院白护士长团队 · 专属陪伴</span><h2>化疗期间，照护继续</h2><p>复查、身体感受和导管护理<br>按日程一步步完成</p></div></div>
 <section class="wn-progress"><div class="wn-day">${day}</div><div class="wn-progress-copy"><b>化疗第 ${day} 天</b><small>已完成 ${done} 项${pending.length?` · 待完成 ${pending.length} 项`:' · 当前任务已完成'}</small></div><button type="button" data-wn="calendar">进入日历 <span aria-hidden="true">›</span></button></section>
 <section class="wn-today"><header><div><h2>${heading}</h2><span>${shown.length} 项</span></div><strong>${done}/${due.length}</strong></header>
 ${shown.length?shown.map(task=>`<button type="button" class="wn-task" data-wn-task="${esc(task.id)}" aria-label="${esc(kind[task.type]||'随访任务')}：${esc(task.label)}，${task.done?'已完成':'待完成'}"><span class="wn-task-ring ${task.done?'is-done':''}">${task.done?'✓':''}</span><span class="wn-task-date">${dateLabel(task.date)}</span><span class="wn-task-name"><b>${esc(task.label)}</b><small>${esc(kind[task.type]||'随访任务')}${task.day?` · D${task.day}`:''}</small></span><em>${task.done?'已完成':task.date<data.now?'已到期':'待完成'}</em></button>`).join(''):'<p class="wn-empty">目前没有待完成事项。进入日历可查看后续安排。</p>'}
 <p class="wn-next">${due.length>shown.length?`另有 ${due.length-shown.length} 项较早任务，可进入日历查看。`:next.length?`后续安排：${dateLabel(next[0].date)} · ${esc(next[0].label)}`:'后续安排请进入日历查看'}</p><footer><button type="button" data-wn="reports">上传报告</button><button type="button" data-wn="scales">健康评估</button><button type="button" data-wn="care">导管护理</button><button type="button" data-wn="alerts">健康提醒</button></footer></section>`;
 host.querySelector('[data-wn=calendar]').onclick=()=>OP.openFromTimeline('plan');
 host.querySelectorAll('[data-wn-task]').forEach(button=>button.onclick=()=>{
  const task=data.tasks.find(t=>t.id===button.dataset.wnTask);
  if(!task)return;
  if(task.type==='daily'){window.Project307.navigate(dailyState.mode==='voice'?'phoneReady':'selfTask');return}
  if(task.date>data.now){OP.openFromTimeline('plan');return}
  OP.openTaskFromTimeline(task.id);
 });
 host.querySelectorAll('.wn-today footer [data-wn]').forEach(button=>button.onclick=()=>button.dataset.wn==='alerts'?OP.openAlertsFromTimeline():OP.openFromTimeline(button.dataset.wn));
}
window.WhiteNurseTimeline={render};
window.addEventListener('outpatient307-change',()=>{if(document.getElementById('special')?.classList.contains('active'))render()});
render();
})();
