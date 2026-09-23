const assert=require('node:assert/strict');const E=require('../outpatient-engine.js');let checks=0;function eq(a,b){assert.deepEqual(a,b);checks++}
const c={start:'2026-09-01',finalEnd:'2026-10-01',catheter:'picc',lastCare:'2026-09-01'};const p=E.plan(c);
eq(p.filter(x=>x.type==='lab').map(x=>[x.day,x.date,x.kinds.length]),[[5,'2026-09-05',1],[7,'2026-09-07',2],[9,'2026-09-09',1],[11,'2026-09-11',1],[14,'2026-09-14',2],[17,'2026-09-17',1],[21,'2026-09-21',2]]);
eq(p.find(x=>x.id==='full-2026-10-01').date,'2026-10-22');eq(p.filter(x=>x.type==='scale').map(x=>x.scales.length),[1,1,6]);eq(p.find(x=>x.type==='care').date,'2026-09-08');eq(E.plan({...c,catheter:'port'}).find(x=>x.type==='care').date,'2026-09-29');eq(E.plan({...c,catheter:'port',portInterval:21}).find(x=>x.type==='care').date,'2026-09-22');eq(E.plan({...c,catheter:'none',finalEnd:''}).filter(x=>['care','video'].includes(x.type)||x.scales?.length===6).length,0);
eq(E.dayAdd('2028-02-28',1),'2028-02-29');eq(E.dayAdd('2026-12-31',1),'2027-01-01');
for(const [id,n,max] of [['bfi',9,10],['gad7',7,21],['phq9',9,27],['mdasi',27,10]]){eq(E.score(id,Array(n).fill(0)).value,0);eq(E.score(id,Array(n).fill(['bfi','mdasi'].includes(id)?10:3)).value,max);assert.throws(()=>E.score(id,Array(n).fill('')));checks++;}
eq(E.score('bfi',Array(9).fill(4)).level,'attention');eq(E.score('bfi',[...Array(8).fill(3),8]).level,'normal');
let phq=Array(9).fill(0);phq[8]=1;eq(E.score('phq9',phq).urgent,true);eq(E.score('phq9',phq).value,1);
eq(E.score('gad7',[3,3,3,1,0,0,0]).level,'attention');eq(E.score('gad7',[3,3,3,0,0,0,0]).level,'normal');
let md=Array(27).fill(0);md[20]=7;eq(E.score('mdasi',md).level,'high');eq(E.score('mdasi',md).details[1][1],0);eq(E.score('mdasi',md).details[2][1],7/8);
const tfi=Array.from({length:15},(_,i)=>[0,11,14].includes(i)?1:0);eq(E.score('tfi',tfi).value,0);eq(E.score('tfi',tfi.map(x=>1-x)).value,15);let tf=[...tfi];tf[8]=2;eq(E.score('tfi',tf).value,0);tf[9]=tf[10]=tf[13]=2;eq(E.score('tfi',tf).value,3);
const ps=['22:00',10,'06:00',7.5,...Array(14).fill(0)];eq(E.score('psqi',ps).value,0);eq(E.score('psqi',['23:00',70,'06:00',4,...Array(14).fill(3)]).value,21);eq(E.score('psqi',['22:00',15,'06:00',6,...Array(14).fill(0)]).details[3][1],1);assert.throws(()=>E.score('psqi',['22:00',10,'06:00',9,...Array(14).fill(0)]));checks++;assert.throws(()=>E.score('psqi',['22:00',10,'22:00',6,...Array(14).fill(0)]));checks++;
for(const [v,g] of [[0.99,4],[1,3],[1.5,3],[2,2],[3,1],[3.5,0]])eq(E.labGrade('wbc',v,3.5),g);
for(const [v,g] of [[0.49,4],[0.5,3],[0.99,3],[1,2],[1.5,1],[1.8,0]])eq(E.labGrade('anc',v,1.8),g);
eq(E.labRisk({kind:'blood',wbc:1.5,anc:1,wbcLLN:3.5,ancLLN:1.8}).level,'attention');eq(E.labRisk({kind:'blood',wbc:1.49,anc:1,wbcLLN:3.5,ancLLN:1.8}).level,'urgent');eq(E.labRisk({kind:'blood',wbc:3,anc:.99,wbcLLN:3.5,ancLLN:1.8}).level,'urgent');eq(E.labRisk({kind:'blood',wbc:3.5,anc:1.8,wbcLLN:3.5,ancLLN:1.8}).level,'normal');eq(E.labGrade('wbc','',3.5),null);
eq(E.labRisk({kind:'liver',alt:41,altULN:40,ast:20,astULN:40,tbil:12,tbilULN:21}).level,'attention');eq(E.labRisk({kind:'ecg',ecg:'待复核'}).level,'attention');assert(E.csv([['=1+1','a"b']]).includes("'=1+1"));checks++;
eq(E.score('psqi',['22:00',10,'08:00',8.5,...Array(14).fill(0)]).details[3][1],1);assert.throws(()=>E.score('tfi',Array(15).fill(2)));checks++;
console.log('Passed',checks,'checks: schedules, all scales, missing answers, PSQI time validation, blood thresholds, CSV escaping.');
