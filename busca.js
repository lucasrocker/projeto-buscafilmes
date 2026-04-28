const API_KEY = "ccb5c2cbf775a4e61dac32d3355ffaaa";
const BASE_IMG = "https://image.tmdb.org/t/p/w500";

let pagina = 1;
let query = "";
let genero = "";

const grid = document.getElementById("grid");

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);

  query = params.get("q") || "";
  genero = params.get("genero") || "";

  const input = document.getElementById("buscaInput");
  if (input) input.value = query;

  carregarGenerosMenu();
  buscar();
});

/* =========================
   BUSCAR FILMES
========================= */
async function buscar() {
  let url = "";

  if (query) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&page=${pagina}&language=pt-BR`;
  } 
  else if (genero) {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genero}&page=${pagina}&language=pt-BR`;
  } 
  else {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${pagina}&language=pt-BR`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();

    atualizarTitulo();
    mostrarFilmes(data.results);
    atualizarPagina();

  } catch (erro) {
    console.error("Erro ao buscar:", erro);
  }
}

/* =========================
   MOSTRAR FILMES
========================= */
function mostrarFilmes(filmes) {
  grid.innerHTML = "";

  if (!filmes || filmes.length === 0) {
    grid.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }

  filmes.forEach(filme => {
    if (!filme.poster_path) return;

    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <img src="${BASE_IMG + filme.poster_path}">
      <div class="info">
        <h3>${filme.title}</h3>
        <p>${filme.release_date || "Sem data"}</p>
      </div>
    `;

    grid.appendChild(div);
  });
}

/* =========================
   PAGINAÇÃO
========================= */
function proximaPagina() {
  pagina++;
  buscar();
}

function paginaAnterior() {
  if (pagina > 1) {
    pagina--;
    buscar();
  }
}

function atualizarPagina() {
  const el = document.getElementById("paginaAtual");
  if (el) {
    el.textContent = `Página ${pagina}`;
  }
}

/* =========================
   NOVA BUSCA
========================= */
function novaBusca() {
  const input = document.getElementById("buscaInput").value;

  window.location.href = `busca.html?q=${encodeURIComponent(input)}`;
}

/* =========================
   TÍTULO DINÂMICO
========================= */
function atualizarTitulo() {
  const titulo = document.getElementById("tituloBusca");

  if (!titulo) return;

  if (query) {
    titulo.textContent = `Resultados para: "${query}"`;
  } 
  else if (genero) {
    titulo.textContent = "Filmes por Gênero";
  } 
  else {
    titulo.textContent = "Filmes Populares";
  }
}

/* =========================
   GÊNEROS (DROPDOWN)
========================= */
async function carregarGenerosMenu() {
  try {
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

  } catch (erro) {
    console.error("Erro ao carregar gêneros:", erro);
  }
}

/* =========================
   DROPDOWN ABRIR/FECHAR
========================= */
const btnGeneros = document.getElementById("btnGeneros");
const menuGeneros = document.getElementById("menuGeneros");

if (btnGeneros && menuGeneros) {

  btnGeneros.addEventListener("click", (e) => {
    e.preventDefault();
    menuGeneros.classList.toggle("ativo");
  });

  document.addEventListener("click", (e) => {
    if (!btnGeneros.contains(e.target) && !menuGeneros.contains(e.target)) {
      menuGeneros.classList.remove("ativo");
    }
  });

  let timeoutMenu;

  menuGeneros.addEventListener("mouseleave", () => {
    timeoutMenu = setTimeout(() => {
      menuGeneros.classList.remove("ativo");
    }, 500);
  });

  menuGeneros.addEventListener("mouseenter", () => {
    clearTimeout(timeoutMenu);
  });
}
function marcarComoAssistido(titulo, imagem) {
  fetch("assistido.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `titulo=${titulo}&imagem=${imagem}`
  })
  .then(res => res.text())
  .then(data => {
    alert("Marcado como assistido!");
  });
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
}
function mostrarFilmes(filmes) {
  const grid = document.getElementById("grid");
  if (!grid) return;

  grid.innerHTML = "";

  filmes.forEach(filme => {
    if (!filme.poster_path) return;

    const div = document.createElement("div");
    div.classList.add("card");

    // Montamos o HTML do card com o botão
    // Usamos encodeURIComponent no título para evitar erro com nomes que tenham aspas
    const tituloLimpo = filme.title.replace(/'/g, "&apos;");
    const imagemPath = BASE_IMG + filme.poster_path;

    div.innerHTML = `
      <img src="${imagemPath}" onclick="mostrarDetalhes(${filme.id})">
      <div class="info">
        <h3>${filme.title}</h3>
        <button class="btn-assistido" onclick="marcarComoAssistido('${tituloLimpo}', '${imagemPath}')">
          ✔ Assistido
        </button>
      </div>
    `;

    grid.appendChild(div);
  });
}

// Função que envia para o PHP
function marcarComoAssistido(titulo, imagem) {

  // O caminho 'php/assistidos.php' deve bater com a pasta onde está seu arquivo
  fetch("php/assistidos.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `titulo=${encodeURIComponent(titulo)}&imagem=${encodeURIComponent(imagem)}`
  })
  .then(res => res.text())
  .then(data => {
    if (data.trim() === "OK") {
      alert("Filme adicionado à sua lista!");
    } else {
      alert("Erro: " + data);
    }
  })
  .catch(err => {
    console.error("Erro ao salvar:", err);
    alert("Erro ao conectar com o servidor.");
  });
// Dentro da função mostrarFilmes(filmes)
const imagemURL = BASE_IMG + filme.poster_path;
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
function toggleFavorito(event, id, titulo, imagem) {
    event.stopPropagation(); // Impede de abrir os detalhes ao clicar no coração
    const btn = event.currentTarget;

    const formData = new FormData();
    formData.append('tmdb_id', id);
    formData.append('titulo', titulo);
    formData.append('imagem', imagem);

    fetch('php/favoritos.php', { method: 'POST', body: formData })
    .then(res => res.text())
    .then(data => {
        if (data === "adicionado") btn.classList.add('active');
        else if (data === "removido") btn.classList.remove('active');
        else if (data === "erro_login") window.location.href = "login.html";
    });
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