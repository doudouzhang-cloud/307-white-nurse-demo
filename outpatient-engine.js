/* 307 outpatient rules. Pure functions shared by the UI and boundary tests. */
(function(root){
'use strict';
const sum=a=>a.reduce((s,v)=>s+Number(v),0),mean=a=>sum(a)/a.length;
const severity=v=>v===0?'无症状':v<4?'轻度':v<7?'中度':'重度';
function dayAdd(d,n){const x=new Date(d+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+n);return x.toISOString().slice(0,10)}
function days(a,b){return Math.round((new Date(a+'T12:00:00Z')-new Date(b+'T12:00:00Z'))/86400000)}
function plan(c){
 if(!c.start)return [];
 const rows=[5,7,9,11,14,17,21].map(d=>({id:`lab-${c.start}-${d}`,day:d,date:dayAdd(c.start,d-1),type:'lab',label:[7,14,21].includes(d)?'血常规 + 肝功能复查':'血常规复查',kinds:[7,14,21].includes(d)?['blood','liver']:['blood']}));
 [7,14].forEach(d=>rows.push({id:`mdasi-${c.start}-${d}`,day:d,date:dayAdd(c.start,d-1),type:'scale',label:'安德森症状评估',scales:['mdasi']}));
 if(c.finalEnd)rows.push({id:'full-'+c.finalEnd,date:dayAdd(c.finalEnd,21),type:'scale',label:'末次化疗结束后 21 天 · 综合评估',scales:['bfi','gad7','phq9','mdasi','tfi','psqi','factb']});
 if(c.catheter!=='none'&&c.lastCare){const interval=c.catheter==='picc'?7:Number(c.portInterval||28);rows.push({id:`care-${c.catheter}-${c.lastCare}`,date:dayAdd(c.lastCare,interval),type:'care',label:c.catheter==='picc'?'PICC 导管维护':'输液港维护'});}
 if(c.catheter!=='none')rows.push({id:'video-'+c.catheter,date:c.start,type:'video',label:'导管维护宣教视频'});
 return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
function numeric(x){return x!==''&&x!==null&&x!==undefined&&Number.isFinite(Number(x))}
function validateScale(id,a){const sizes={bfi:9,gad7:7,phq9:9,mdasi:27,tfi:15,psqi:18,factb:36};if(!Array.isArray(a)||a.length!==sizes[id])return '请完成全部题目后再提交';
 const filled=part=>part.filter(v=>v!==''&&v!==null&&v!==undefined).length;
 if(id==='mdasi'&&(filled(a.slice(0,13))<7||filled(a.slice(13,21))<4||filled(a.slice(21))<4))return '核心症状至少填写 7 项、乳腺模块至少 4 项、干扰条目至少 4 项';
 if(id==='factb'&&(filled(a)<29||[[0,7],[7,14],[14,20],[20,27],[27,36]].some(([start,end])=>filled(a.slice(start,end))<Math.floor((end-start)/2)+1)))return 'FACT-B 至少填写 29 题，且每个领域须回答超过一半条目';
 for(let i=0;i<a.length;i++){
  if(['mdasi','factb'].includes(id)&&(a[i]===''||a[i]===null||a[i]===undefined))continue;
  if(id==='tfi'&&![0,1].includes(Number(a[i])))return '请使用本题提供的选项';
  if(id==='psqi'&&(i===0||i===2)){if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(a[i]||''))return '请填写有效的上床和起床时间';continue}
  const max=id==='psqi'?(i===1?1440:i===3?24:3):['bfi','mdasi'].includes(id)?10:id==='factb'?4:id==='tfi'?1:3;
  if(!numeric(a[i])||Number(a[i])<0||Number(a[i])>max||(!(id==='psqi'&&(i===1||i===3))&&!Number.isInteger(Number(a[i]))))return '请完成全部题目，并核对数值范围';
 }
 if(id==='psqi'){const minute=t=>Number(t.slice(0,2))*60+Number(t.slice(3)),bed=(minute(a[2])-minute(a[0])+1440)%1440;
  if(!bed)return '上床和起床时间不能相同';if(Number(a[3])>bed/60)return '实际睡眠时间不能超过卧床时间';if(Number(a[1])>bed)return '入睡用时不能超过卧床时间';}
 return '';
}
function score(id,a){const error=validateScale(id,a);if(error)throw Error(error);const n=a.map(v=>v===''||v===null||v===undefined?null:Number(v));let value=0,label='',level='normal',details=[],urgent=false;
 if(id==='bfi'){value=mean(n);label=value===0?'无疲乏':value<4?'轻度疲乏':value<7?'中度疲乏':value<10?'重度疲乏':'能想象的最严重疲乏';level=value>=7?'high':value>=4?'attention':'normal';details=[['疲乏总均分',value],['程度均分（1–3题）',mean(n.slice(0,3))],['干扰均分（4–9题）',mean(n.slice(3))]];}
 if(id==='gad7'){value=sum(n);label=value>=10?'焦虑筛查阳性，需专业评估':'未达到模板预警阈值';level=value>=10?'attention':'normal';}
 if(id==='phq9'){value=sum(n);label=value<5?'未见明显抑郁症状':value<10?'轻度抑郁症状':value<15?'中度抑郁症状':value<20?'中重度抑郁症状':'重度抑郁症状';urgent=n[8]>0;level=urgent?'urgent':value>=15?'high':value>=5?'attention':'normal';details=[['第9题单独关注',n[8]]];}
 if(id==='mdasi'){const avg=items=>mean(items.filter(v=>v!==null));value=avg(n.slice(0,21));label=severity(value)+'症状负担';const peak=Math.max(...n.filter(v=>v!==null));level=peak>=7?'high':peak>=4?'attention':'normal';details=[['总症状均分（1–21题）',value],['核心均分（1–13题）',avg(n.slice(0,13))],['乳腺模块均分（14–21题）',avg(n.slice(13,21))],['干扰均分（22–27题）',avg(n.slice(21))],['活动干扰均分',avg([n[21],n[23],n[25]])],['情感干扰均分',avg([n[22],n[24],n[26]])],['最高单项',peak]];}
 if(id==='tfi'){const v=n.map((v,i)=>[0,11,14].includes(i)?1-v:v);value=sum(v);label=value>=5?'存在衰弱风险':'未达到衰弱阈值';level=value>=5?'attention':'normal';details=[['生理维度',sum(v.slice(0,8))],['心理维度',sum(v.slice(8,12))],['社会维度',sum(v.slice(12))]];}
 if(id==='factb'){const reverse=new Set([0,1,2,3,4,5,6,14,16,17,18,19,27,28,29,31,32,33,35]);const domain=(start,end)=>{const items=n.slice(start,end).map((v,i)=>v===null?null:reverse.has(start+i)?4-v:v).filter(v=>v!==null);return sum(items)*(end-start)/items.length};const scores=[domain(0,7),domain(7,14),domain(14,20),domain(20,27),domain(27,36)];value=sum(scores);label='FACT-B 生活质量评分';details=['生理状况 PWB','社会/家庭状况 SWB','情感状况 EWB','功能状况 FWB','附加关注 BCS'].map((name,i)=>[name,scores[i]]);details.push(['FACT-G',sum(scores.slice(0,4))],['FACT-B TOI',scores[0]+scores[3]+scores[4]]);}
 if(id==='psqi'){
  const minute=t=>Number(t.slice(0,2))*60+Number(t.slice(3));const inbed=((minute(a[2])-minute(a[0])+1440)%1440)/60,eff=n[3]/inbed*100;
  const group=v=>v===0?0:v<=2?1:v<=4?2:3,latency=n[1]<=15?0:n[1]<=30?1:n[1]<60?2:3;
  const disturbance=sum(n.slice(5,14));
  const v=[n[14],group(latency+n[4]),n[3]>7?0:n[3]>6?1:n[3]>5?2:3,eff>85?0:eff>=75?1:eff>=65?2:3,disturbance===0?0:disturbance<=9?1:disturbance<=18?2:3,n[15],group(n[16]+n[17])];
  value=sum(v);label=value<=5?'睡眠质量很好':value<=10?'睡眠质量还行':value<=15?'睡眠质量一般':'睡眠质量很差';level=value>15?'high':value>10?'attention':'normal';details=['主观睡眠质量','入睡时间','睡眠时长','睡眠效率','睡眠障碍','催眠药物','日间功能'].map((x,i)=>[x,v[i]]);details.push(['睡眠效率（%）',eff]);
 }
 return {value,label,level,details,urgent,version:'307-2026.10-v2'};
}
function labGrade(key,v,lln){if(!numeric(v)||Number(v)<0)return null;v=Number(v);if(key==='wbc')return v<1?4:v<2?3:v<3?2:v<Number(lln)?1:0;if(key==='anc')return v<.5?4:v<1?3:v<1.5?2:v<Number(lln)?1:0;return null}
function labRisk(r){const hits=[];if(r.kind==='blood'){if(numeric(r.wbc)&&Number(r.wbc)<1.5)hits.push('白细胞 < 1.5 ×10⁹/L');if(numeric(r.anc)&&Number(r.anc)<1.0)hits.push('中性粒细胞绝对值 < 1.0 ×10⁹/L');}
 const attention=r.kind==='blood'?(numeric(r.wbc)&&Number(r.wbc)<Number(r.wbcLLN)||numeric(r.anc)&&Number(r.anc)<Number(r.ancLLN)):r.kind==='liver'?(Number(r.alt)>Number(r.altULN)||Number(r.ast)>Number(r.astULN)||Number(r.tbil)>Number(r.tbilULN)):r.ecg==='异常';
 return {level:hits.length?'urgent':attention?'attention':r.kind==='ecg'&&r.ecg==='待复核'?'attention':'normal',hits};}
function csv(rows){return '\ufeff'+rows.map(r=>r.map(v=>{let s=String(v??'');if(/^[=+@\-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}).join(',')).join('\r\n')}
const api={dayAdd,days,plan,validateScale,score,labGrade,labRisk,csv};root.Outpatient307Engine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
