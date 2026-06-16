// ======= Dados (edite aqui) =======
const data = {
  projects: [
    {
      id: 'estacionamento',
      name: 'Sistema de Estacionamento (SSE + BeagleBone)',
      short: 'Monitoramento em tempo real de vagas usando SSE e GPIO na BeagleBone Black.',
      details: 'Backend em C usando Server-Sent Events para atualizar o status das vagas sem recarregar a página. Frontend em HTML/JS com painel ao vivo e integração com Google Maps.',
      tech: ['C','HTML','JS','SSE','BeagleBone'],
      stars: 3,
      date: '2025-07-16',
      links: { repo: '#', demo: '#' }
    },
    {
      id: 'vhdl-processor',
      name: 'Processador Didático em VHDL',
      short: 'Implementação de ULA, FSM e datapath com instruções (PSH/POP/CMP/JMP/JEQ/JLT/JGT/IN/OUT/SHR/SHL/ROR/ROL).',
      details: 'Inclui testbenches separados por grupos de instruções e guia de waveform esperado.',
      tech: ['VHDL','Vivado','Testbench'],
      stars: 5,
      date: '2025-07-31',
      links: { repo: '#', demo: '' }
    },
    {
      id: 'dashboard-financas',
      name: 'Dashboard de Finanças Pessoais',
      short: 'Leitura de CSV e gráficos de despesas por categoria/mês.',
      details: 'Projeto simples em Python/Matplotlib, publicado aqui com prints e instruções de execução. (Link aponta para repositório.)',
      tech: ['Python','Pandas','Matplotlib'],
      stars: 2,
      date: '2025-08-01',
      links: { repo: '#', demo: '' }
    },
    {
      id: 'sistema-login',
      name: 'Sistema de Login (Flask/Node opcional)',
      short: 'Cadastro, login e sessão; armazenamento local (SQLite/JSON).',
      details: 'Foco em boas práticas de organização e documentação. Inclui guia de execução.',
      tech: ['HTML','CSS','JS','Flask'],
      stars: 2,
      date: '2025-08-10',
      links: { repo: '#', demo: '' }
    }
  ],
  notes: [
    { title: 'SSE: quando usar', text: 'SSE é ótimo para streams unidirecionais (notificações, contadores). Para bidirecional, considere WebSocket.' },
    { title: 'Vivado: dicas rápidas', text: 'Organize testbenches por grupo de instruções, gere ondas nomeadas e salve setups reutilizáveis.' },
    { title: 'BeagleBone GPIO', text: 'Documente pinos, níveis lógicos e debounce. Adicione diagrama simples no README.' }
  ],
  tags: ['C','Python','JS','VHDL','Web','SSE','BeagleBone','Flask','Node','Dados']
};

// ======= Estado =======
const state = { query: '', tag: null, sort: 'recent' };

// ======= Util =======
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));
const fmtDate = s => new Date(s).toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });
const setTheme = mode => {
  if (mode === 'light') document.documentElement.classList.add('light');
  else document.documentElement.classList.remove('light');
  localStorage.setItem('theme', mode);
};

const getTheme = () => localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

// ======= Render =======
function renderTags() {
  const bar = $('#tagsBar');
  bar.innerHTML = '';
  const all = document.createElement('button');
  all.className = 'chip';
  all.textContent = 'Todos';
  all.ariaPressed = String(!state.tag);
  all.onclick = () => { state.tag = null; renderProjects(); highlightTags(); };
  bar.appendChild(all);
  data.tags.forEach(t => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = t;
    b.onclick = () => { state.tag = (state.tag === t ? null : t); renderProjects(); highlightTags(); };
    bar.appendChild(b);
  });
  highlightTags();
}

function highlightTags(){
  const chips = $$('#tagsBar .chip');
  chips.forEach(ch => {
    const active = !state.tag ? ch.textContent==='Todos' : ch.textContent===state.tag;
    ch.style.borderColor = active ? 'var(--brand-2)' : 'var(--border)';
    ch.style.color = active ? 'var(--brand-2)' : 'var(--text-2)';
  });
}

function renderProjects() {
  const cards = $('#cards');
  const q = state.query.toLowerCase();
  let items = data.projects.filter(p =>
    (!state.tag || p.tech.includes(state.tag)) &&
    (p.name.toLowerCase().includes(q) || p.short.toLowerCase().includes(q))
  );
  if (state.sort === 'az') items.sort((a,b)=> a.name.localeCompare(b.name));
  else if (state.sort === 'stars') items.sort((a,b)=> (b.stars||0)-(a.stars||0));
  else items.sort((a,b)=> new Date(b.date) - new Date(a.date));
  cards.innerHTML = '';
  items.forEach(p => cards.appendChild(projectCard(p)));
  // status hero
  if (items.length) $('#lastProject').textContent = `${items[0].name} (${fmtDate(items[0].date)})`;
}

function projectCard(p) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="thumb" aria-hidden>Prévia/cover (opcional)</div>
    <div class="row">
      <h3>${p.name}</h3>
      <span class="chip" title="Destaque">★ ${p.stars||0}</span>
    </div>
    <p>${p.short}</p>
    <div class="row">
      <div class="grid" style="grid-auto-flow: column; grid-auto-columns: max-content; gap:8px;">
        ${p.tech.map(t=>`<span class="chip">${t}</span>`).join('')}
      </div>
      <small class="muted">${fmtDate(p.date)}</small>
    </div>
    <div class="row">
      <button class="btn" aria-label="Abrir detalhes">Detalhes</button>
      <div class="grid" style="grid-auto-flow: column; gap: 8px;">
        ${p.links.repo ? `<a class="btn" href="${p.links.repo}" target="_blank" rel="noreferrer">Código</a>`:''}
        ${p.links.demo ? `<a class="btn" href="${p.links.demo}" target="_blank" rel="noreferrer">Demo</a>`:''}
      </div>
    </div>
  `;
  const detailsBtn = el.querySelector('button');
  detailsBtn.onclick = () => openProjectDialog(p);
  return el;
}

function openProjectDialog(p){
  $('#dialogTitle').textContent = p.name;
  $('#dialogBody').innerHTML = `
    <p>${p.details}</p>
    <p><strong>Tecnologias:</strong> ${p.tech.join(' • ')}</p>
    <p><strong>Data:</strong> ${fmtDate(p.date)}</p>
    ${p.links.repo ? `<p><a class="btn" href="${p.links.repo}" target="_blank" rel="noreferrer">Ver repositório</a></p>`:''}
  `;
  projectDialog.showModal();
}

function renderNotes(){
  const wrap = $('#notes');
  wrap.innerHTML = '';
  data.notes.forEach(n => {
    const el = document.createElement('article');
    el.className = 'note';
    el.innerHTML = `<strong>${n.title}</strong><p style="margin:.4rem 0 0;">${n.text}</p>`;
    wrap.appendChild(el);
  })
}


//================== CURSOR ANIMATION ===================

function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.cursor-dot');

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    let isHidden = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (isHidden) {
            isHidden = false;
            cursor.classList.remove('cursor-hidden');
        }
    });

    document.addEventListener('mouseleave', () => {
        isHidden = true;
        cursor.classList.add('cursor-hidden');
    });

    const hoverables = document.querySelectorAll('a, button, .btn, .card, input, select, textarea, .chip');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });

    document.addEventListener('mousedown', () => cursor.classList.add('cursor-click'));
    document.addEventListener('mouseup', () => cursor.classList.remove('cursor-click'));

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;

        cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;

        requestAnimationFrame(animateCursor);
    }

    animateCursor();
}


// ======= Eventos =======
document.addEventListener('DOMContentLoaded', () => {
  // Tema inicial
  setTheme(getTheme());
  $('#themeToggle').addEventListener('click', () => setTheme(document.documentElement.classList.contains('light') ? 'dark' : 'light'));
  // Busca/Ordenação
  $('#search').addEventListener('input', e => { state.query = e.target.value; renderProjects(); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderProjects(); });
  // Conteúdo

  initCustomCursor();
  renderTags();
  renderProjects();
  renderNotes();
  // Rodapé
  $('#year').textContent = new Date().getFullYear();
});

//================== TIPEWRITING EFFECT =================
consoleText(
  [
    "I'm Vitoria Silva.",
    "Computer Engineering Student.",
    "Full Stack Developer in progress.",
    "Passionate about Technology."
  ],
  'text',
  ['#b4b4b4ff']
);

function consoleText(words, id, colors) {
  if (colors === undefined) colors = ['#fff'];
  var target = document.getElementById(id);
  var wordIndex = 0;
  var letterCount = 0;
  var currentWord = words[wordIndex];
  target.style.color = colors[0];

  function typeWord() {
    if (letterCount <= currentWord.length) {
      target.innerHTML = currentWord.substring(0, letterCount);
      letterCount++;
      setTimeout(typeWord, 120); // velocidade da digitação
    } else {
      // espera um pouco antes de ir para a próxima palavra
      setTimeout(nextWord, 1500);
    }
  }

  function nextWord() {
    wordIndex++;
    if (wordIndex < words.length) {
      currentWord = words[wordIndex];
      letterCount = 0;
      typeWord();
    }
     else {
       wordIndex = 0;
       currentWord = words[wordIndex];
       letterCount = 0;
       typeWord();
     }
  }

  typeWord();
}

//============== Stars Background Animation  ===============
function createStars(containerId, totalStars, size, animationDuration) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  for (let i = 0; i < totalStars; i++) {
    const star = document.createElement('div');
    star.style.position = 'absolute';
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.borderRadius = '50%';
    star.style.background = 'var(--star-color)';
    
    // sempre começa acima da tela (-100px a -2000px)
    star.style.top = `${-Math.random() * 2000}px`;
    star.style.left = `${Math.random() * window.innerWidth}px`;
    star.style.opacity = Math.random();

    // cada estrela começa em um tempo diferente
    const delay = Math.random() * animationDuration;
    star.style.animation = `animStar ${animationDuration}s linear infinite`;
    star.style.animationDelay = `-${delay}s`;

    container.appendChild(star);
  }
}

// Cria as 3 camadas
// passa parametros para a funcao createStars
createStars('stars', 200, 1, 50);
createStars('stars2', 400, 2, 100);
createStars('stars3', 150, 3, 150);
