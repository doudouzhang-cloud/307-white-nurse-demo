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
function filledTemplateSheet(source,data){
 const start=source.indexOf('<row r="4"'),end=source.indexOf('</sheetData>',start);
 if(start<0||end<0)throw new Error('量表导出模板的数据区域无法识别');
 const originalRow=source.slice(start,source.indexOf('</row>',start)+6);
 const styles=new Map([...originalRow.matchAll(/<c r="([A-Z]+)4" s="(\d+)"/g)].map(([,col,style])=>[col,style]));
 const render=(values,rowNumber)=>`<row r="${rowNumber}">${values.map((value,i)=>{
  const col=column(i+1),ref=col+rowNumber,style=styles.get(col),attr=`r="${ref}"${style?` s="${style}"`:''}`;
  if(value===null||value===undefined||value==='')return `<c ${attr}/>`;
  if(typeof value==='number'&&Number.isFinite(value))return `<c ${attr}><v>${value}</v></c>`;
  return `<c ${attr} t="inlineStr"><is><t>${xml(value)}</t></is></c>`;
 }).join('')}</row>`;
 const blank=Array(T.headers[0].length).fill(''),dataRows=data.length?data:[blank];
 const replacement=render(blank,4)+dataRows.map((row,i)=>render(row,i+5)).join('');
 return (source.slice(0,start)+replacement+source.slice(end)).replace(/<dimension ref="[^"]+"\/>/,`<dimension ref="A1:IR${Math.max(5,4+data.length)}"/>`);
}
const utf=s=>new TextEncoder().encode(s);
const u16=(view,p,n)=>view.setUint16(p,n,true),u32=(view,p,n)=>view.setUint32(p,n>>>0,true);
const crcTable=Array.from({length:256},(_,i)=>{let n=i;for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
function crc(bytes){let n=0xffffffff;for(const b of bytes)n=crcTable[(n^b)&255]^(n>>>8);return(n^0xffffffff)>>>0}
function zip(files){const chunks=[],central=[];let offset=0;for(const [path,contents] of files){const name=utf(path),body=utf(contents),checksum=crc(body),head=new Uint8Array(30+name.length),v=new DataView(head.buffer);u32(v,0,0x04034b50);u16(v,4,20);u16(v,6,2048);u32(v,14,checksum);u32(v,18,body.length);u32(v,22,body.length);u16(v,26,name.length);head.set(name,30);chunks.push(head,body);const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,2048);u32(cv,16,checksum);u32(cv,20,body.length);u32(cv,24,body.length);u16(cv,28,name.length);u32(cv,42,offset);c.set(name,46);central.push(c);offset+=head.length+body.length}const centralSize=central.reduce((n,c)=>n+c.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);u32(v,0,0x06054b50);u16(v,8,files.length);u16(v,10,files.length);u32(v,12,centralSize);u32(v,16,offset);return new Blob([...chunks,...central,end],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
function workbook(state,score){
 const packageParts=root.Research307TemplatePackage?.parts;
 if(!packageParts)throw new Error('量表导出模板未加载');
 const data=rows(state,score);
 return zip(packageParts.map(([path,contents])=>[path,path==='xl/worksheets/sheet1.xml'?filledTemplateSheet(contents,data):contents]));
}
function tableWorkbook(headers,data,title='患者基础信息'){
 const template=Object.fromEntries(root.Research307TemplatePackage?.parts||[]);
 if(!template['xl/styles.xml']||!template['xl/theme/theme1.xml'])throw new Error('Excel 样式未加载');
 const records=[headers,...data],last=column(headers.length)+records.length;
 const sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="A1:'+last+'"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="20"/><cols><col min="1" max="'+headers.length+'" width="20" customWidth="1"/></cols><sheetData>'+records.map((row,ri)=>`<row r="${ri+1}"${ri===0?' ht="28" customHeight="1"':''}>${row.map((value,ci)=>{const ref=column(ci+1)+(ri+1),attr=`r="${ref}" s="${ri===0?24:21}"`;return typeof value==='number'&&Number.isFinite(value)?`<c ${attr}><v>${value}</v></c>`:`<c ${attr} t="inlineStr"><is><t>${xml(value??'')}</t></is></c>`}).join('')}</row>`).join('')+'</sheetData></worksheet>';
 return zip([
  ['[Content_Types].xml','<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/></Types>'],
  ['_rels/.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
  ['xl/workbook.xml','<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="'+xml(title)+'" sheetId="1" r:id="rId1"/></sheets></workbook>'],
  ['xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/></Relationships>'],
  ['xl/worksheets/sheet1.xml',sheet],['xl/styles.xml',template['xl/styles.xml']],['xl/theme/theme1.xml',template['xl/theme/theme1.xml']]
 ]);
}
const api={rows,workbook,tableWorkbook};root.Research307Export=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
