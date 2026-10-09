/* Template-shaped research export. The supplied workbook defines the column order. */
(function(root){
'use strict';
const T=root.Research307Template;
const detail=(result,name)=>result.details?.find(([key])=>key===name)?.[1];
function rows(state,score){
 const assessments=[...(state.assessments||[])].sort((a,b)=>String(a.created||a.date).localeCompare(String(b.created||b.date)));
 const groups=new Map();
 for(const record of assessments){const key=(record.taskId||'adhoc')+'|'+record.date;if(!groups.has(key))groups.set(key,{date:record.date,records:{}});groups.get(key).records[record.scale]=record;}
 const keys=T.headers[0],missing=Object.fromEntries(T.codebook.slice(1).map(row=>[row[1],/^999\b/.test(String(row[12]||''))?999:/^99\b/.test(String(row[12]||''))?99:'']));
 return [...groups.values()].map((group,index)=>{
  const data={ID:'307-001',patient_id_hosp:'',survey_date:group.date,survey_no:index+1,cycle1_day1_date:state.config?.start||'',chemo_current_no:1};
  const latestBlood=(state.reports||[]).filter(r=>r.kind==='blood'&&r.date<=group.date).at(-1);
  const latestLiver=(state.reports||[]).filter(r=>r.kind==='liver'&&r.date<=group.date).at(-1);
  if(latestBlood?.wbc!==''&&latestBlood?.wbc!=null)data.wbc=Number(latestBlood.wbc);
  if(latestLiver)data.liver_abnormal=latestLiver.risk?.level==='normal'?0:1;
  for(const [id,record] of Object.entries(group.records)){
   let result;try{result=score(id,record.answers)}catch{continue}
   const prefix={mdasi:'MDASI',bfi:'BFI',psqi:'PSQI',tfi:'TFI',factb:'FACTB',gad7:'GAD7',phq9:'PHQ9'}[id];if(!prefix)continue;
   record.answers.forEach((answer,i)=>{if(answer===''||answer==null)return;const key=prefix+'_'+(i+1);data[key]=id==='psqi'&&[0,2].includes(i)?answer:id==='tfi'&&[0,11,14].includes(i)?1-Number(answer):Number(answer)});
   if(id==='mdasi')Object.assign(data,{MDASI_core_mean:detail(result,'核心均分（1–13题）'),MDASI_breast_mean:detail(result,'乳腺模块均分（14–21题）'),MDASI_interf_mean:detail(result,'干扰均分（22–27题）'),MDASI_interf_activity:detail(result,'活动干扰均分'),MDASI_interf_affect:detail(result,'情感干扰均分')});
   if(id==='bfi')Object.assign(data,{BFI_mean:result.value,BFI_level:result.value===0?0:result.value<4?1:result.value<7?2:3});
   if(id==='psqi'){const psqiKeys=['PSQI_compA','PSQI_compB','PSQI_compC','PSQI_compD','PSQI_compE','PSQI_compF','PSQI_compG'];result.details.slice(0,7).forEach(([,value],i)=>data[psqiKeys[i]]=value);data.PSQI_total=result.value;data.PSQI_1_bedtime=record.answers[0];data.PSQI_2_latency_min=Number(record.answers[1]);data.PSQI_3_risetime=record.answers[2];data.PSQI_4_sleephours=Number(record.answers[3]);for(let i=4;i<18;i++)data['PSQI_'+(i<14?'5'+String.fromCharCode(97+i-4):i===14?'6_quality':i===15?'7_med':i===16?'8_drowsy':'9_lowenergy')]=Number(record.answers[i])+1;}
   if(id==='tfi')Object.assign(data,{TFI_physical:detail(result,'生理维度'),TFI_psychological:detail(result,'心理维度'),TFI_social:detail(result,'社会维度'),TFI_total:result.value,TFI_frail:result.value>=5?1:0});
   if(id==='factb')Object.assign(data,{FACTB_PWB:detail(result,'生理状况 PWB'),FACTB_SWB:detail(result,'社会/家庭状况 SWB'),FACTB_EWB:detail(result,'情感状况 EWB'),FACTB_FWB:detail(result,'功能状况 FWB'),FACTB_BCS:detail(result,'附加关注 BCS'),FACT_G:detail(result,'FACT-G'),FACTB_total:result.value,FACTB_TOI:detail(result,'FACT-B TOI')});
   if(id==='gad7')Object.assign(data,{GAD7_total:result.value,GAD7_anxiety:result.value>=10?1:0});
   if(id==='phq9')Object.assign(data,{PHQ9_total:result.value,PHQ9_depression:result.value>=10?1:0});
  }
  return keys.map((key,i)=>i===2?data.survey_date:key in data?data[key]:missing[key]??'');
 });
}
const xml=s=>String(s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
function column(n){let s='';for(;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s}
function sheetXml(rows){const end=column(Math.max(1,...rows.map(row=>row.length)))+Math.max(1,rows.length);let out='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:'+end+'"/><sheetData>';
 rows.forEach((row,ri)=>{let cells='';row.forEach((value,ci)=>{if(value===null||value===undefined||value==='')return;const ref=column(ci+1)+(ri+1);if(typeof value==='number'&&Number.isFinite(value))cells+=`<c r="${ref}"><v>${value}</v></c>`;else if(typeof value==='string'&&value.startsWith('='))cells+=`<c r="${ref}"><f>${xml(value.slice(1))}</f></c>`;else cells+=`<c r="${ref}" t="inlineStr"><is><t>${xml(value)}</t></is></c>`});if(cells)out+=`<row r="${ri+1}">${cells}</row>`});return out+'</sheetData></worksheet>'}
const utf=s=>new TextEncoder().encode(s);
const u16=(view,p,n)=>view.setUint16(p,n,true),u32=(view,p,n)=>view.setUint32(p,n>>>0,true);
const crcTable=Array.from({length:256},(_,i)=>{let n=i;for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
function crc(bytes){let n=0xffffffff;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return(n^0xffffffff)>>>0}
function zip(files){const chunks=[],central=[];let offset=0;for(const [path,contents] of files){const name=utf(path),body=utf(contents),checksum=crc(body),head=new Uint8Array(30+name.length),v=new DataView(head.buffer);u32(v,0,0x04034b50);u16(v,4,20);u16(v,6,2048);u32(v,14,checksum);u32(v,18,body.length);u32(v,22,body.length);u16(v,26,name.length);head.set(name,30);chunks.push(head,body);const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,2048);u32(cv,16,checksum);u32(cv,20,body.length);u32(cv,24,body.length);u16(cv,28,name.length);u32(cv,42,offset);c.set(name,46);central.push(c);offset+=head.length+body.length}const centralSize=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);u32(v,0,0x06054b50);u16(v,8,files.length);u16(v,10,files.length);u32(v,12,centralSize);u32(v,16,offset);return new Blob([...chunks,...central,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
function workbook(state,score){const first=[...T.headers,[],...rows(state,score)],sheets=[first,T.codebook,T.quality];const names=['1_数据导出模板','2_变量编码手册','4_数据质量核查'];const files=[['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')+'</Types>'],['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+names.map((name,i)=>`<sheet name="${xml(name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')+'</sheets><calcPr fullCalcOnLoad="1"/></workbook>'],['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')+'</Relationships>']];sheets.forEach((sheet,i)=>files.push([`xl/worksheets/sheet${i+1}.xml`,sheetXml(sheet)]));return zip(files)}
const api={rows,workbook};root.Research307Export=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
