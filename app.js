const modal=document.getElementById('modal');
const startBtn=document.getElementById('startBtn');
const demoBtn=document.getElementById('demoBtn');
const closeBtn=document.getElementById('closeBtn');
const continueBtn=document.getElementById('continueBtn');
const choices=[...document.querySelectorAll('.career-choice')];
function openModal(){modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''}
startBtn.addEventListener('click',openModal);demoBtn.addEventListener('click',openModal);closeBtn.addEventListener('click',closeModal);
choices.forEach(choice=>choice.addEventListener('click',()=>{choices.forEach(c=>c.classList.remove('selected'));choice.classList.add('selected')}));
continueBtn.addEventListener('click',()=>{const selected=document.querySelector('.career-choice.selected');if(!selected){choices[0].classList.add('selected')}closeModal();window.scrollTo({top:document.getElementById('match').offsetTop,behavior:'smooth'})});
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
