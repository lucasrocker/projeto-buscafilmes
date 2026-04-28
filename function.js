const API_KEY = "ccb5c2cbf775a4e61dac32d3355ffaaa";
const BASE_IMG = "https://image.tmdb.org/t/p/w500";

let grid;
let trailerAtual = "";
let timeout;

/* =========================
   INIT (ESPERA DOM)
========================= */
window.addEventListener("DOMContentLoaded", () => {
  grid = document.getElementById("grid");

  carregarPopulares();
  carregarTendencias();
  carregarStreaming("streaming");
  carregargratis("filmes");
  carregarTrailers();
  carregarGenerosMenu();
  configurarDropdown();
});

/* =========================
   POPULARES
========================= */
async function carregarPopulares() {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR`
  );
  const data = await res.json();
  mostrarFilmes(data.results);
}

/* =========================
   GRID
========================= */
function mostrarFilmes(filmes) {
  if (!grid) return;

  grid.innerHTML = "";

  filmes.forEach(filme => {
    if (!filme.poster_path) return;

    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <img src="${BASE_IMG + filme.poster_path}">
      <div class="info">
        <h3>${filme.title}</h3>
      </div>
    `;

    div.addEventListener("click", () => {
      mostrarDetalhes(filme.id);
    });

    grid.appendChild(div);
  });
}

/* =========================
   TRAILERS CARROSSEL
========================= */
async function carregarTrailers() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`
    );

    const data = await res.json();
    const container = document.querySelector(".carrossel-trailers");

    if (!container) return;

    container.innerHTML = "";

    for (let filme of data.results.slice(0, 10)) {
      const resVideo = await fetch(
        `https://api.themoviedb.org/3/movie/${filme.id}/videos?api_key=${API_KEY}`
      );

      const dataVideo = await resVideo.json();

      const trailer = dataVideo.results.find(
        v => v.type === "Trailer" && v.site === "YouTube"
      );

      if (!trailer) continue;

      container.innerHTML += `
        <div class="trailer-item">
          <div class="thumb" onclick="abrirModal('${trailer.key}')">
            <img src="https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg">
            <div class="play">▶</div>
          </div>
          <h4>${filme.title}</h4>
        </div>
      `;
    }

  } catch (error) {
    console.log("Erro trailers:", error);
  }
}

/* =========================
   DETALHES COMPLETOS
========================= */
async function mostrarDetalhes(id) {
  try {
    const [detRes, credRes, vidRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`),
      fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${API_KEY}`),
      fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`)
    ]);

    const det = await detRes.json();
    const cred = await credRes.json();
    const vids = await vidRes.json();

    document.getElementById("detalhe-img").src =
      det.poster_path ? BASE_IMG + det.poster_path : "";

    document.getElementById("detalhe-titulo").textContent = det.title;
    document.getElementById("detalhe-desc").textContent = det.overview;
    document.getElementById("detalhe-data").textContent = det.release_date;
    document.getElementById("detalhe-nota").textContent = det.vote_average;

    document.getElementById("detalhe-duracao").textContent =
      det.runtime ? det.runtime + " min" : "N/A";

    document.getElementById("detalhe-budget").textContent =
      det.budget ? "$" + det.budget.toLocaleString() : "N/A";

    document.getElementById("detalhe-revenue").textContent =
      det.revenue ? "$" + det.revenue.toLocaleString() : "N/A";

    document.getElementById("detalhe-tagline").textContent =
      det.tagline || "";

    document.getElementById("detalhe-generos").textContent =
      det.genres.map(g => g.name).join(", ");

    // CAST
    const castDiv = document.getElementById("detalhe-cast");
    castDiv.innerHTML = "";

    cred.cast.slice(0, 10).forEach(ator => {
      if (!ator.profile_path) return;

      castDiv.innerHTML += `
        <div>
          <img src="${BASE_IMG + ator.profile_path}">
          <p>${ator.name}</p>
        </div>
      `;
    });

    // TRAILER
    const trailerDiv = document.getElementById("detalhe-trailer");
    trailerDiv.innerHTML = "";

    const trailer = vids.results.find(
      v => v.type === "Trailer" && v.site === "YouTube"
    );

    if (trailer) {
      trailerAtual = trailer.key;

      trailerDiv.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${trailer.key}"
          allowfullscreen>
        </iframe>
      `;
    }

  } catch (erro) {
    console.error("Erro detalhes:", erro);
  }
}

/* =========================
   MODAL
========================= */
function abrirModal(key) {
  const modal = document.getElementById("modalTrailer");
  const iframe = document.getElementById("videoFrame");

  iframe.src = `https://www.youtube.com/embed/${key}?autoplay=1`;
  modal.style.display = "block";
}

function fecharModal() {
  document.getElementById("modalTrailer").style.display = "none";
  document.getElementById("videoFrame").src = "";
}

/* =========================
   TENDÊNCIAS
========================= */
async function carregarTendencias() {
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`
  );

  const data = await res.json();
  const container = document.querySelector(".carrossel");

  if (!container) return;

  container.innerHTML = "";

  data.results.forEach(f => {
    if (!f.poster_path) return;

    container.innerHTML += `
      <div class="item">
        <img src="${BASE_IMG + f.poster_path}">
      </div>
    `;
  });
}

/* =========================
   STREAMING
========================= */
async function carregarStreaming(tipo) {
  let url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;

  if (tipo === "tv") {
    url = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  const container = document.querySelector(".carrossel2");
  if (!container) return;

  container.innerHTML = "";

  data.results.forEach(f => {
    if (!f.poster_path) return;

    container.innerHTML += `
      <div class="item">
        <img src="${BASE_IMG + f.poster_path}">
      </div>
    `;
  });
}

/* =========================
   GRÁTIS
========================= */
async function carregargratis(tipo) {
  let url;

  if (tipo === "filmes") {
    url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}`;
  } else {
    url = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`;
  }

  const res = await fetch(url);
  const data = await res.json();

  const container = document.querySelector(".carrossel3");
  if (!container) return;

  container.innerHTML = "";

  data.results.forEach(f => {
    if (!f.poster_path) return;

    container.innerHTML += `
      <div class="item">
        <img src="${BASE_IMG + f.poster_path}">
      </div>
    `;
  });
}

/* =========================
   BUSCA → REDIRECIONA
========================= */
function buscarFilmes() {
  const input = document.getElementById("busca").value 
             || document.getElementById("buscaHero").value;

  if (!input) return;

  window.location.href = `busca.html?q=${encodeURIComponent(input)}`;
}

/* =========================
   TOGGLE BUSCA
========================= */
function toggleBusca() {
  document.getElementById("buscaContainer").classList.toggle("active");
}

/* =========================
   GÊNEROS MENU
========================= */
async function carregarGenerosMenu() {
  const res = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=pt-BR`
  );

  const data = await res.json();
  const menu = document.getElementById("menuGeneros");

  if (!menu) return;

  menu.innerHTML = "";

  data.genres.forEach(g => {
    const li = document.createElement("li");

    li.innerHTML = `
      <a href="busca.html?genero=${g.id}">
        ${g.name}
      </a>
    `;

    menu.appendChild(li);
  });
}

/* =========================
   DROPDOWN MELHORADO
========================= */
function configurarDropdown() {
  const btn = document.getElementById("btnGeneros");
  const menu = document.getElementById("menuGeneros");

  if (!btn || !menu) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    menu.classList.toggle("ativo");
  });

  let timeout;

  menu.addEventListener("mouseleave", () => {
    timeout = setTimeout(() => {
      menu.classList.remove("ativo");
    }, 500);
  });

  menu.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
  });

  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("ativo");
    }
  });
}
function novaBusca() {
  const input = document.getElementById("buscaInput").value;

  if (!input) return;

  window.location.href = `busca.html?q=${encodeURIComponent(input)}`;
}
function buscarHero() {
  const input = document.getElementById("buscaHero").value;

  if (!input) return;

  window.location.href = `busca.html?q=${encodeURIComponent(input)}`;
}


function criarCardFilme(filme) {
  return `
    <div class="card">
      <img src="${filme.imagem}">

      <h3>${filme.titulo}</h3>

      <button onclick="marcarAssistido('${filme.titulo}', '${filme.imagem}')">
        ✔ Marcar como assistido
      </button>
    </div>
  `;
  const btnFavorito = `
    <button class="btn-fav" onclick="toggleFavorito(event, ${filme.id}, '${tituloLimpo}', '${imagemPath}')">
        ❤
    </button>
`;
}
// Coloque isso no final do seu arquivo de funções JS
function atualizarLinkPerfil() {
    // Como estamos usando HTML puro, vamos verificar se o servidor PHP setou um cookie ou 
    // simplesmente apontar para um arquivo que decide o destino
    const iconesPerfil = document.querySelectorAll('a[href="login.html"]');
    iconesPerfil.forEach(link => {
        link.href = "usuario.php"; // O PHP no usuario.php já protege se não estiver logado
    });
}
window.onload = atualizarLinkPerfil;
function mostrarFilmes(filmes) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  filmes.forEach(filme => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Preparamos a URL da imagem e limpamos o título para evitar erros de aspas
    const imagemURL = `https://image.tmdb.org/t/p/w500${filme.poster_path}`;
    const tituloLimpo = filme.title.replace(/'/g, "\\'");

    card.innerHTML = `
      <img src="${imagemURL}" alt="${filme.title}" onclick="mostrarDetalhes(${filme.id})">
      <div class="card-info">
        <h3>${filme.title}</h3>
        <button class="btn-assistido" onclick="marcarComoAssistido('${tituloLimpo}', '${imagemURL}')">
          ✔ Assistido
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Função que envia o filme para o banco de dados via PHP
function marcarComoAssistido(titulo, imagem) {
  const formData = new FormData();
  formData.append('titulo', titulo);
  formData.append('imagem', imagem);

  fetch('php/assistidos.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.text())
  .then(data => {
    if (data.trim() === "OK") {
      alert("Filme adicionado aos assistidos!");
    } else if (data.includes("não logado")) {
      alert("Você precisa estar logado!");
      window.location.href = "login.html";
    } else {
      alert("Erro ao salvar filme.");
    }
  })
  .catch(error => console.error('Erro:', error));
}
function mostrarFilmes(filmes) {
    if (!grid) return;
    grid.innerHTML = "";

    filmes.forEach(filme => {
        if (!filme.poster_path) return;

        const div = document.createElement("div");
        div.classList.add("card");

        const imagemURL = BASE_IMG + filme.poster_path;
        // Limpa aspas do título para não quebrar o clique do botão
        const tituloLimpo = filme.title.replace(/'/g, "\\'");

        div.innerHTML = `
            <button class="btn-fav" onclick="toggleFavorito(event, ${filme.id}, '${tituloLimpo}', '${imagemURL}')">
                ❤
            </button>
            <img src="${imagemURL}" alt="${filme.title}" onclick="mostrarDetalhes(${filme.id})">
            <div class="card-info">
                <h3>${filme.title}</h3>
                <button class="btn-assistido" onclick="marcarComoAssistido('${tituloLimpo}', '${imagemURL}')">
                    ✔ Assistido
                </button>
            </div>
        `;
        grid.appendChild(div);
    });
}
function toggleFavorito(event, id, titulo, imagem) {
    event.stopPropagation(); // Impede de abrir os detalhes do filme ao clicar no coração
    const btn = event.currentTarget;

    const formData = new FormData();
    formData.append('tmdb_id', id);
    formData.append('titulo', titulo);
    formData.append('imagem', imagem);

    fetch('php/favoritos.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        if (data.trim() === "adicionado") {
            btn.classList.add('active'); // Fica vermelho
        } else if (data.trim() === "removido") {
            btn.classList.remove('active'); // Volta ao normal
        } else if (data.trim() === "erro_login") {
            alert("Faça login para salvar seus favoritos!");
            window.location.href = "login.html";
        }
    })
    .catch(err => console.error("Erro:", err));
}
// Adicione esse botão dentro do seu card HTML