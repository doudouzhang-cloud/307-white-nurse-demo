(()=>{
 const key='cx-white-nurse307-patient-tone';
 let soft=false;try{soft=localStorage.getItem(key)==='soft'}catch{}
 const control=(compact=false)=>`<label class="tone-toggle ${compact?'tone-compact':''}"><span>淡化配色</span><input type="checkbox" role="switch" aria-label="淡化患者端配色" ${soft?'checked':''}></label>`;
 document.querySelector('.demo-guide').insertAdjacentHTML('afterbegin',`<section class="guide-card tone-card"><h3>界面配色</h3><p>蓝色突出院外计划入口，让重要任务更容易找到。</p>${control()}<small>开启后，入口与内页点缀改为接近背景的浅灰米色。异常预警仍保留提示色。</small></section>`);
 document.querySelector('.demo-tools').insertAdjacentHTML('afterbegin',control(true));
 function apply(){document.documentElement.dataset.patientTone=soft?'soft':'blue';document.querySelectorAll('.tone-toggle input').forEach(e=>e.checked=soft)}
 document.querySelectorAll('.tone-toggle input').forEach(e=>e.onchange=()=>{soft=e.checked;try{localStorage.setItem(key,soft?'soft':'blue')}catch{}apply()});apply();
})();
