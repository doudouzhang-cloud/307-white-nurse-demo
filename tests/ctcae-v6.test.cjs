const assert=require('node:assert/strict');
const C=require('../ctcae-v6.js');
assert.equal(C.version,'CTCAE v6.0');
for(const [value,grade] of [[0.09,4],[0.1,3],[0.5,2],[1,1],[1.5,0]])assert.equal(C.labGrade('anc',value,1.8),grade);
for(const [value,hours,grade] of [[37.9,0,0],[38,0,1],[39,0,1],[39.1,0,2],[40,0,2],[40.1,24,3],[40.1,25,4],[40.1,'',null]])assert.equal(C.feverGrade(value,hours),grade);
assert.deepEqual(C.criterion('nausea',1),{term:'nausea',grade:2,description:C.terms.nausea.criteria[1][1],version:'CTCAE v6.0'});
assert.equal(C.criterion('nausea',''),null);
assert.equal(C.criterion('nausea',4),null);
console.log('Passed CTCAE v6.0 count, fever, and symptom criteria checks.');
