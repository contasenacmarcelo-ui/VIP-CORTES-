// main.js - frontend completo VipCortes
const API_BASE = window.API_BASE_URL ? window.API_BASE_URL.replace(/\/$/, '') + '/api' : window.location.origin + '/api';

async function apiRequest(path, opts = {}) {
  const res = await fetch(API_BASE + path, opts);
  const json = await res.text().then(t => { try { return t ? JSON.parse(t) : {}; } catch { return {}; } });
  if (!res.ok) throw new Error(json.error || json.message || `Erro ${res.status}`);
  return json;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s]);
}

// render star SVG (filled true/false)
function starSvg(filled) {
  const path = 'M12 .587l3.668 7.431 8.164 1.182-5.916 5.754 1.396 8.138L12 18.896 4.688 23.092l1.396-8.138L0.168 9.2l8.164-1.182z';
  return `<svg class="rating-star ${filled? 'filled': ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
}

// ------------------ AGENDAMENTO ------------------
(function setupAgendar() {
  const form = document.querySelector('form#agendar') || document.querySelector('form');
  if (!form) return;

  const nomeEl = document.getElementById('nome');
  const idadeEl = document.getElementById('idade');
  const foneEl = document.getElementById('fone');
  const servicosEl = document.getElementById('servicos');
  const diaEl = document.getElementById('dia');
  const horarioEl = document.getElementById('horario');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const usuarioId = sessionStorage.getItem('usuarioId');

    const payload = {
      name: nomeEl.value.trim(),
      age: idadeEl ? Number(idadeEl.value) : null,
      phone: foneEl ? foneEl.value.trim() : '',
      service: servicosEl.value,
      date: diaEl.value,
      time: horarioEl.value,
      observacoes: null,
      usuario_id: usuarioId || null
    };

    if (!payload.name || !payload.service || !payload.date) {
      return alert('Preencha Nome, Serviço e Data');
    }

    try {

      // 🔥 FAZ O POST E CAPTURA A RESPOSTA
      const res = await apiRequest('/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // 🔥 SALVA O ID RETORNADO — É AQUI QUE FICA O #1
      localStorage.setItem('agendamento_id', res.id);

      // vai para AGENDAR2
      window.location.href = 'AGENDAR2.html';

    } catch (err) {
      console.error(err);
      alert('Erro ao enviar agendamento: ' + err.message);
    }
  });
})();
// ------------------ ADMINISTRAÇÃO ------------------
(function setupAdmin() {
  // só executa se estiver na admin.html
  if (!window.location.pathname.toLowerCase().includes('admin.html')) return;

  const tabela = document.querySelector('.agenda tbody');
  if (!tabela) return;

  async function carregarAgendamentos() {
    try {
      const { appointments } = await apiRequest('/agendamentos');
      tabela.innerHTML = '';

      if (!appointments.length) {
        tabela.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhum agendamento encontrado.</td></tr>`;
        return;
      }

      for (const ag of appointments) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>${escapeHtml(ag.name)}</td>
          <td>${escapeHtml(ag.phone)}</td>
          <td>${escapeHtml(ag.service)}</td>
          <td>${new Date(ag.data_agendamento).toLocaleDateString('pt-BR')}</td>
          <td>${ag.hora ? ag.hora.substring(0, 5) : ''}</td>
          <td><button class="btn-excluir" data-id="${ag.id}">Excluir</button></td>
        `;

        tabela.appendChild(tr);
      }

      // adiciona evento nos botões de exclusão
      document.querySelectorAll('.btn-excluir').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (!confirm('Deseja realmente excluir este agendamento?')) return;

          try {
            await apiRequest(`/agendamentos/${id}`, { method: 'DELETE' });
            alert('Agendamento excluído com sucesso!');
            await carregarAgendamentos(); // recarrega a lista
          } catch (err) {
            console.error(err);
            alert('Erro ao excluir: ' + err.message);
          }
        });
      });
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      tabela.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Erro ao carregar agendamentos</td></tr>`;
    }
  }

  carregarAgendamentos();
})();

// ------------------ AVALIAÇÕES ------------------
(function setupAvaliacoes() {
  // só executa se estiver na página de avaliações (lida tanto com 'Avaliações.html' quanto com 'Avaliacoes.html' sem acentos)
  const pathname = window.location.pathname.split('/').pop() || '';
  const filename = decodeURIComponent(pathname).toLowerCase();
  // remove diacríticos pra comparar de forma robusta
    const normalized = filename.normalize ? filename.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : filename;
  if (!normalized.includes('avaliacoes')) return;

  const container = document.querySelector('.containerava');
  if (!container) return;

  const PAGINATION_WRAPPER_ID = 'reviews-pagination';
  let currentPage = 1;
  const PAGE_SIZE = window.innerWidth < 768 ? 2 : 9;; // exibir 9 avaliações por página (3 colunas x 3 linhas)

  async function carregarAvaliacoes() {
    try {
      const { reviews } = await apiRequest('/reviews');
      container.innerHTML = '';

      if (!reviews.length) {
        container.innerHTML = `<div style="text-align:center; font-size:18px; color:#555;">Nenhuma avaliação cadastrada ainda.</div>`;
        // remover paginação se existir
        const old = document.getElementById(PAGINATION_WRAPPER_ID);
        if (old) old.remove();
        return;
      }

      // render com paginação
      const total = reviews.length;
      const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * PAGE_SIZE;
      const pageItems = reviews.slice(start, start + PAGE_SIZE);

      for (const review of pageItems) {
        const div = document.createElement('div');
        div.className = 'coluns';

        div.innerHTML = `
          <div class="pefilava">
            <img src="assets/perfil.png" alt="" class="perfilava-foto">
            <div style="display:flex;flex-direction:column;align-items:center;">
              <span class="nome">${escapeHtml(review.author_name || 'Anônimo')}</span>
              <div class="rating" aria-hidden="true">
                ${[1,2,3,4,5].map(i => starSvg(i <= Number(review.rating||0))).join('')}
                <span class="rating-number">${Number(review.rating||0)}/5</span>
              </div>
            </div>
          </div>
          <div class="avali">
            <span>${escapeHtml(review.content)}</span>
          </div>
        `;

        container.appendChild(div);
      }

      // pagination controls
      let pager = document.getElementById(PAGINATION_WRAPPER_ID);
      if (!pager) {
        pager = document.createElement('div');
        pager.id = PAGINATION_WRAPPER_ID;
        pager.className = 'reviews-pager';
        container.parentNode.appendChild(pager);
      }
      pager.innerHTML = '';

      const createButton = (label, disabled, onClick) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.disabled = disabled;
        b.className = 'pager-btn';
        b.addEventListener('click', onClick);
        return b;
      };

      pager.appendChild(createButton('« Anterior', currentPage <= 1, () => { currentPage--; carregarAvaliacoes(); }));

      // page numbers (mostrar até 5 números: current ±2)
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);
      for (let p = startPage; p <= endPage; p++) {
        const btn = document.createElement('button');
        btn.textContent = String(p);
        btn.className = 'pager-btn page-number' + (p === currentPage ? ' active' : '');
        btn.addEventListener('click', () => { currentPage = p; carregarAvaliacoes(); });
        pager.appendChild(btn);
      }

      pager.appendChild(createButton('Próximo »', currentPage >= totalPages, () => { currentPage++; carregarAvaliacoes(); }));
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
      container.innerHTML = `<div style="text-align:center; color:red;">Erro ao carregar avaliações</div>`;
    }
  }

  carregarAvaliacoes();
})();

// ------------------ ENVIAR AVALIAÇÃO ------------------
(function setupEnviarAvaliacao() {
  // só executa se estiver na avalienos.html
  if (!window.location.pathname.toLowerCase().includes('avalienos.html')) return;

  const stars = document.querySelectorAll('.star');
  const textarea = document.querySelector('.digiteaqui');
  const enviarBtn = document.querySelector('.enviar');

  let selectedRating = 0;

  // inicializa visual da tabela de estrelas
  const initStarTable = () => {
    const sel = document.getElementById('selected-rating');
    if (sel) sel.textContent = `${selectedRating} de 5`;
    const cells = document.querySelectorAll('.star-table .star-cell');
    cells.forEach(c => c.classList.remove('selected'));
  };
  // chamar agora para garantir estado inicial
  initStarTable();

  // funcionalidade das estrelas
  stars.forEach((star, index) => {
    star.addEventListener('click', () => {
      selectedRating = index + 1;
      stars.forEach((s, i) => {
        s.classList.toggle('active', i < selectedRating);
      });
      // atualizar contador e tabela visual
      const sel = document.getElementById('selected-rating');
      if (sel) sel.textContent = `${selectedRating} de 5`;
      const cells = document.querySelectorAll('.star-table .star-cell');
      cells.forEach(c => {
        const v = Number(c.getAttribute('data-value')) || 0;
        c.classList.toggle('selected', v <= selectedRating);
      });
    });
  });

  // envio da avaliação
  enviarBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    const content = textarea.value.trim();
    if (!content) {
      alert('Por favor, escreva sua avaliação.');
      return;
    }

    // Usar nome do usuário logado se disponível, senão anonimato
    const usuarioNome = sessionStorage.getItem('usuarioNome');
    const autenticado = sessionStorage.getItem('autenticado');

    const payload = {
      author_name: (autenticado && usuarioNome) ? usuarioNome : 'Anônimo',
      content: content,
      rating: selectedRating || 0
    };

    try {
      await apiRequest('/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Avaliação enviada com sucesso!');
      textarea.value = '';
      stars.forEach(s => s.classList.remove('active'));
      selectedRating = 0;
      // redirecionar para Avaliações.html
      window.location.href = 'Avaliações.html';
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar avaliação: ' + err.message);
    }
  });
})();

const stars = document.querySelectorAll('.star');
let lastClickedIndex = 0; // guarda qual estrela foi clicada por último
 
stars.forEach(star => {
  star.addEventListener('click', () => {
    const index = parseInt(star.getAttribute('data-index'));
   
    if (lastClickedIndex === index) {
      // Se clicar duas vezes na mesma estrela, desmarca todas
      stars.forEach(s => s.classList.remove('active'));
      lastClickedIndex = 0; // resetar o índice
    } else {
      // Marca até a estrela clicada
      stars.forEach(s => s.classList.remove('active'));
      for(let i = 0; i < index; i++) {
        stars[i].classList.add('active');
      }
      lastClickedIndex = index; // atualiza o índice da última estrela clicada
    }
  });
});

//------------------- CANCELAR AGENDAMENTO ------------------    
document.getElementById('btnCancelar').addEventListener('click', async () => {
  const id = localStorage.getItem('agendamento_id');

  if (!id) {
    alert("Nenhum agendamento encontrado.");
    return;
  }

  const res = await apiRequest(`/agendamentos/${id}`, {
    method: 'DELETE'
  });

  alert("Agendamento cancelado com sucesso.");

  // limpa para garantir que não cancele mais nada depois
  localStorage.removeItem('agendamento_id');
});
