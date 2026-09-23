(()=>{
'use strict';
const host=document.getElementById('wn-timeline');
const E=window.Outpatient307Engine,OP=window.Outpatient307;
if(!host||!E||!OP)return;
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const kind={lab:'复查报告',scale:'身体评估',care:'导管维护',video:'护理宣教',daily:'每日随访'};
const dateLabel=date=>{const [,m,d]=date.split('-');return `${Number(m)}月${Number(d)}日`};
const weekday=['一','二','三','四','五','六','日'];
let selectedDate='',visibleMonth='',calendarExpanded=false;
function changeMonth(month,offset){const [year,number]=month.split('-').map(Number);const d=new Date(Date.UTC(year,number-1+offset,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`}
function dailyTask(data,day){let state={};try{state=JSON.parse(localStorage.getItem('cx-white-nurse307-v1')||'{}')}catch{}return {task:{id:'daily-health',date:data.now,type:'daily',label:'今日身体情况记录',day,done:Boolean(state.voiceDone||state.selfDone)},state}}
function taskRow(task,data,compact=false){
 const future=task.date>data.now,label=task.done?'已完成':future?'未到期':task.date<data.now?'已到期':'待完成';
 return `<button type="button" class="wn-task ${compact?'wn-task-compact':''}" data-wn-task="${esc(task.id)}" aria-label="${esc(kind[task.type]||'随访任务')}：${esc(task.label)}，${label}" ${future?'disabled':''}><span class="wn-task-ring ${task.done?'is-done':''}">${task.done?'✓':''}</span><span class="wn-task-date">${dateLabel(task.date)}</span><span class="wn-task-name"><b>${esc(task.label)}</b><small>${esc(kind[task.type]||'随访任务')}${task.day?` · D${task.day}`:''}</small></span><em>${label}</em></button>`;
}
function calendar(data,tasks,day,done,pending){
 if(!visibleMonth)visibleMonth=data.now.slice(0,7);
 if(!selectedDate)selectedDate=data.now;
 const first=`${visibleMonth}-01`,firstWeekday=(new Date(`${first}T12:00:00Z`).getUTCDay()+6)%7;
 const daysInMonth=new Date(Date.UTC(Number(visibleMonth.slice(0,4)),Number(visibleMonth.slice(5)),0)).getUTCDate();
 const cells=Array.from({length:firstWeekday+daysInMonth},(_,index)=>{
  if(index<firstWeekday)return '<span class="wn-calendar-blank" aria-hidden="true"></span>';
  const date=`${visibleMonth}-${String(index-firstWeekday+1).padStart(2,'0')}`;
  const count=tasks.filter(task=>task.date===date).length,isToday=date===data.now;
  return `<button type="button" class="wn-calendar-day ${date===selectedDate?'is-selected':''} ${isToday?'is-today':''}" data-wn-date="${date}" aria-label="${dateLabel(date)}${isToday?'，今天':''}${count?`，${count}项安排`:''}" aria-pressed="${date===selectedDate}"><b>${index-firstWeekday+1}</b>${count?'<i aria-hidden="true"></i>':''}</button>`;
 }).join('');
 const selected=tasks.filter(task=>task.date===selectedDate);
 return `<section class="wn-calendar" aria-label="照护日历"><header><div><span>照护日历</span><h2>${Number(visibleMonth.slice(0,4))}年${Number(visibleMonth.slice(5))}月</h2></div><button type="button" class="wn-calendar-toggle" aria-expanded="${calendarExpanded}" aria-controls="wn-calendar-content">${calendarExpanded?'收起日历':'展开日历'}<i aria-hidden="true"></i></button></header><p class="wn-calendar-progress">化疗第 ${day} 天 · 已完成 ${done} 项 · 待完成 ${pending} 项</p><div id="wn-calendar-content" ${calendarExpanded?'':'hidden'}><div class="wn-calendar-toolbar"><small>选择日期，查看当天安排</small><nav aria-label="切换月份"><button type="button" data-wn-month="-1" aria-label="上个月">‹</button><button type="button" data-wn-month="1" aria-label="下个月">›</button></nav></div><div class="wn-calendar-week">${weekday.map(label=>`<span>${label}</span>`).join('')}</div><div class="wn-calendar-grid">${cells}</div><div class="wn-calendar-agenda"><div class="wn-calendar-agenda-head"><b>${dateLabel(selectedDate)}${selectedDate===data.now?' · 今天':''}</b><small>${selected.length?`${selected.length} 项安排`:'暂无安排'}</small></div>${selected.length?selected.map(task=>taskRow(task,data,true)).join(''):'<p>这一天没有院外照护任务。</p>'}</div><details class="wn-settings"><summary>调整演示日程</summary><form id="wn-settings-form"><label>本周期化疗开始日期<input name="start" type="date" value="${esc(data.config.start)}" required></label><label>末次化疗结束日期<input name="finalEnd" type="date" value="${esc(data.config.finalEnd)}"></label><label>演示日期（留空跟随今天）<input name="asOf" type="date" value="${esc(data.config.asOf)}"></label><button type="submit">保存日程</button></form><div class="wn-settings-shortcuts"><button type="button" data-wn-jump="7">体验 D7</button><button type="button" data-wn-jump="14">体验 D14</button></div><small>仅调整本地演示日期，不会发送真实提醒。</small></details></div></section>`;
}
function render(){
 const data=OP.snapshot(),day=Math.max(1,E.days(data.now,data.config.start)+1);
 const {task:daily,state:dailyState}=dailyTask(data,day);
 const tasks=[...data.tasks,daily].sort((a,b)=>a.date.localeCompare(b.date));
 const due=tasks.filter(task=>task.date<=data.now),pending=due.filter(task=>!task.done),next=data.tasks.filter(task=>task.date>data.now);
 const shown=due.slice(-5),done=due.filter(task=>task.done).length;
 host.innerHTML=`<div class="wn-care-hero"><img src="assets/medical-illustrations/team-warm-cartoon.png" alt="白护士长与307医院医生团队卡通形象"><div><span>307医院白护士长团队 · 专属陪伴</span><h2>化疗期间，照护继续</h2><p>复查、身体感受和导管护理<br>按日程一步步完成</p></div></div>
 ${calendar(data,tasks,day,done,pending.length)}
 ${data.tasks.some(t=>t.doctorOrdered&&!t.done)?`<section class="wn-doctor-orders"><h2>医护团队安排的复查</h2>${data.tasks.filter(t=>t.doctorOrdered&&!t.done).map(t=>`<button data-wn-review="${t.id}"><b>${esc(t.label)}</b><span>${dateLabel(t.date)} · ${t.date>data.now?'已安排':'待提交报告'} ›</span><small>${esc(t.message)}</small></button>`).join('')}</section>`:''}
 <section class="wn-today"><header><div><h2>当前待办</h2><span>${shown.length} 项</span></div><strong>${done}/${due.length}</strong></header>
 ${shown.length?shown.map(task=>taskRow(task,data)).join(''):'<p class="wn-empty">目前没有待完成事项。上方日历可查看后续安排。</p>'}
 <p class="wn-next">${due.length>shown.length?`另有 ${due.length-shown.length} 项较早任务，可在日历中查看。`:next.length?`后续安排：${dateLabel(next[0].date)} · ${esc(next[0].label)}`:'后续安排请查看上方日历。'}</p></section>
 <section class="wn-services"><h2>照护服务与记录</h2><div><button type="button" data-wn="reports"><img src="assets/medical-illustrations/lab.png" alt="" aria-hidden="true"><b>检查报告</b><small>上传与查看预审</small><span>›</span></button><button type="button" data-wn="scales"><img src="assets/medical-illustrations/scale.png" alt="" aria-hidden="true"><b>健康评估</b><small>查看量表任务</small><span>›</span></button><button type="button" data-wn="care"><img src="assets/medical-illustrations/care.png" alt="" aria-hidden="true"><b>导管护理</b><small>维护与宣教</small><span>›</span></button><button type="button" data-wn="alerts"><img src="assets/medical-illustrations/calendar.png" alt="" aria-hidden="true"><b>健康提醒</b><small>${data.alerts.length} 条待关注</small><span>›</span></button></div></section>`;
 host.querySelectorAll('[data-wn-review]').forEach(b=>b.onclick=()=>{const t=data.tasks.find(t=>t.id===b.dataset.wnReview);if(t.date>data.now)openDate(t.date);else OP.openTaskFromTimeline(t.id)});
 host.querySelector('.wn-calendar-toggle').onclick=event=>{calendarExpanded=!calendarExpanded;const button=event.currentTarget;button.setAttribute('aria-expanded',String(calendarExpanded));button.innerHTML=(calendarExpanded?'收起日历':'展开日历')+'<i aria-hidden="true"></i>';host.querySelector('#wn-calendar-content').hidden=!calendarExpanded};
 host.querySelectorAll('[data-wn-month]').forEach(button=>button.onclick=()=>{visibleMonth=changeMonth(visibleMonth,Number(button.dataset.wnMonth));selectedDate=`${visibleMonth}-01`;render()});
 host.querySelectorAll('[data-wn-date]').forEach(button=>button.onclick=()=>{selectedDate=button.dataset.wnDate;render()});
 host.querySelector('#wn-settings-form').onsubmit=event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));if(OP.updateConfig(values)){const updated=OP.snapshot();selectedDate=updated.now;visibleMonth=updated.now.slice(0,7);render()}};
 host.querySelectorAll('[data-wn-jump]').forEach(button=>button.onclick=()=>{const asOf=E.dayAdd(data.config.start,Number(button.dataset.wnJump)-1);if(OP.updateConfig({asOf})){selectedDate=asOf;visibleMonth=asOf.slice(0,7);render()}});
 host.querySelectorAll('[data-wn-task]').forEach(button=>button.onclick=()=>{const task=tasks.find(item=>item.id===button.dataset.wnTask);if(!task||task.date>data.now)return;if(task.type==='daily'){window.Project307.navigate(dailyState.mode==='voice'?'phoneReady':'selfTask');return}OP.openTaskFromTimeline(task.id)});
 host.querySelectorAll('.wn-services [data-wn]').forEach(button=>button.onclick=()=>button.dataset.wn==='alerts'?OP.openAlertsFromTimeline():OP.openFromTimeline(button.dataset.wn));
}
function openCalendar(){calendarExpanded=true;window.Project307.navigate('special');visibleMonth='';selectedDate='';render();const pane=document.getElementById('special');const y=host.getBoundingClientRect().top-pane.getBoundingClientRect().top+pane.scrollTop-12;pane.scrollTo({top:Math.max(0,y),behavior:'auto'})}
function returnToTasks(){calendarExpanded=false;window.Project307.navigate('special');render();const pane=document.getElementById('special');const y=host.getBoundingClientRect().top-pane.getBoundingClientRect().top+pane.scrollTop-12;pane.scrollTo({top:Math.max(0,y),behavior:'auto'})}
function openDate(date){calendarExpanded=true;selectedDate=date;visibleMonth=date.slice(0,7);window.Project307.navigate('special');render();host.scrollIntoView({block:'start'})}
window.WhiteNurseTimeline={openDate,render,open:openCalendar,openCalendar,returnToTasks,reset(){selectedDate='';visibleMonth='';calendarExpanded=false;render()}};
window.addEventListener('outpatient307-change',()=>{if(document.getElementById('special')?.classList.contains('active'))render()});
render();
})();
