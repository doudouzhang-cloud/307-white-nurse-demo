/* NCI CTCAE v6.0 (July 2025): selected terms used by this fictional demo.
   Source: https://dctd.cancer.gov/research/ctep-trials/for-sites/adverse-events/ctcae-v6.pdf */
(function(root){
'use strict';
const VERSION='CTCAE v6.0';
const SOURCE='https://dctd.cancer.gov/research/ctep-trials/for-sites/adverse-events/ctcae-v6.pdf';
const TERMS={
 fever:{name:'发热',criteria:[[1,'38.0–39.0℃'],[2,'>39.0–40.0℃'],[3,'>40.0℃，持续不超过 24 小时'],[4,'>40.0℃，持续超过 24 小时']]},
 chills:{name:'寒战',criteria:[[1,'轻微畏寒、发抖或牙齿打颤'],[2,'全身中度震颤，需镇痛药物'],[3,'严重或持续，镇痛药物无效']]},
 nausea:{name:'恶心',criteria:[[1,'食欲下降，但进食习惯未改变'],[2,'经口摄入减少，但无明显体重下降、脱水或营养不良；需静脉干预'],[3,'经口热量或液体摄入不足；需管饲、肠外营养或住院']]},
 vomiting:{name:'呕吐',criteria:[[1,'无需干预'],[2,'需门诊静脉补液或医疗干预'],[3,'需管饲、肠外营养或住院'],[4,'危及生命']]},
 fatigue:{name:'乏力',criteria:[[1,'休息后缓解'],[2,'休息后不缓解，限制工具性日常活动'],[3,'休息后不缓解，限制自我照护活动']]},
 bonePain:{name:'骨痛',criteria:[[1,'轻度疼痛'],[2,'中度疼痛，限制工具性日常活动'],[3,'重度疼痛，限制自我照护活动']]}
};
function labGrade(key,value,lln){
 if(value===''||value===null||value===undefined||!Number.isFinite(Number(value))||Number(value)<0)return null;
 const n=Number(value);
 if(key==='wbc')return n<1?4:n<2?3:n<3?2:lln===''||lln===null||lln===undefined||!Number.isFinite(Number(lln))?null:n<Number(lln)?1:0;
 if(key==='anc')return n<0.1?4:n<0.5?3:n<1?2:n<1.5?1:0;
 return null;
}
function feverGrade(value,hours){
 if(value===''||value===null||!Number.isFinite(Number(value)))return null;
 const n=Number(value);if(n<38)return 0;if(n<=39)return 1;if(n<=40)return 2;
 return hours===''||hours===null||hours===undefined||!Number.isFinite(Number(hours))?null:Number(hours)>24?4:3;
}
function criterion(term,index){if(index===''||index===null||index===undefined)return null;const item=TERMS[term]?.criteria[Number(index)];return item?{term,grade:item[0],description:item[1],version:VERSION}:null}
const api={version:VERSION,source:SOURCE,terms:TERMS,labGrade,feverGrade,criterion};
root.CTCAE307=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
