const modal = document.getElementById('modal');
const startBtn = document.getElementById('startBtn');
const demoBtn = document.getElementById('demoBtn');
const closeBtn = document.getElementById('closeBtn');
const continueBtn = document.getElementById('continueBtn');

function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

startBtn.addEventListener('click', openModal);
demoBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
continueBtn.addEventListener('click', () => {
  closeModal();
  alert('Prototype shell hazır. Sıradaki aşama: kulüp oluşturma ve maç motoru.');
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});
