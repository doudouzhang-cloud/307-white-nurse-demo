const assert=require('node:assert/strict');
require('../research-template.js');
require('../research-template-package.js');
const E=require('../outpatient-engine.js');
const X=require('../research-export.js');
const keys=globalThis.Research307Template.headers[0];
const state={config:{start:'2026-09-01'},reports:[],assessments:[
 {scale:'psqi',taskId:'visit-1',date:'2026-10-01',created:'2026-10-01 08:00',answers:['22:00',60,'06:00',6,...Array(14).fill(0)]},
 {scale:'tfi',taskId:'visit-1',date:'2026-10-01',created:'2026-10-01 08:01',answers:Array.from({length:15},(_,i)=>[0,11,14].includes(i)?1:0)}
]};
const row=X.rows(state,E.score)[0],at=name=>row[keys.indexOf(name)];
assert.equal(row.length,251);
assert.equal(at('ID'),'307-001');
assert.equal(row[2],'2026-10-01');
assert.equal(at('PSQI_5a'),1);
assert.equal(at('PSQI_6_quality'),1);
assert.equal(at('PSQI_compB'),2);
assert.equal(at('PSQI_compC'),2);
assert.equal(at('TFI_1'),0);
assert.equal(at('TFI_total'),0);
X.workbook(state,E.score).arrayBuffer().then(buffer=>{
 assert.equal(new DataView(buffer).getUint32(0,true),0x04034b50);
 const contents=new TextDecoder().decode(buffer);
 assert.match(contents,/<styleSheet /);
 assert.match(contents,/<c r="A1" s="1"/);
 assert.match(contents,/<c r="A5" s="21" t="inlineStr"/);
 assert.doesNotMatch(contents.slice(contents.indexOf('<worksheet'),contents.indexOf('</worksheet>')+12),/BC001/);
 console.log('Passed research template column, scale coding, and XLSX style checks.');
});
