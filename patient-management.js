/* Doctor-side patient organization for the local fictional demo. */
(function(root){
'use strict';
const defaults={
 '307-001':{marker:'需优先联系',category:'重点关注',tags:['发热','血常规']},
 '307-002':{marker:'报告待复核',category:'复查跟进',tags:['血常规','报告待复核']},
 '307-003':{marker:'待完成随访',category:'常规随访',tags:['随访待完成']},
 '307-004':{marker:'随访已完成',category:'已完成',tags:['随访完成']}
};
function normalize(meta){
 const tags=(Array.isArray(meta.tags)?meta.tags:String(meta.tags||'').split(/[,，、\n]+/)).map(x=>String(x).trim().slice(0,20)).filter(Boolean);
 return {marker:String(meta.marker||'').trim().slice(0,24),category:String(meta.category||'').trim().slice(0,24),tags:[...new Set(tags)].slice(0,10)};
}
function metadata(patient,stored){return normalize(stored?.[patient.id]||defaults[patient.id]||{})}
function matches(patient,meta,query,tag){const q=String(query||'').trim().toLowerCase();const text=[patient.name,patient.id,meta.marker,meta.category,...meta.tags].join(' ').toLowerCase();return (!q||text.includes(q))&&(!tag||meta.tags.includes(tag))}
const headers=['姓名','患者唯一ID','标识','分类','标签','主管医生','治疗节点','化疗日期','最近报告日期','导出日期'];
function exportRows(patients,getMeta,getOwner,date){return patients.map(p=>{const m=getMeta(p);return [p.name,p.id,m.marker,m.category,m.tags.join('、'),getOwner(p),p.node,p.chemo.date,p.report.uploaded==='是'?p.report.date.slice(0,10):'',date]})}
const api={defaults,normalize,metadata,matches,headers,exportRows};root.Patient307Management=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
