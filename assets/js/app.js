const CHAVE_STORAGE = "tarefas_todo_avancado";

const estado = {
  tarefas: [],
  filtroAtual: "todas",
  termoBusca: "",
};

const elementos = {
  form: document.getElementById("form-tarefa"),
  idTarefa: document.getElementById("id-tarefa"),
  titulo: document.getElementById("titulo"),
  descricao: document.getElementById("descricao"),
  prioridade: document.getElementById("prioridade"),
  erroTitulo: document.getElementById("erro-titulo"),
  tituloFormulario: document.getElementById("titulo-formulario"),
  btnSalvar: document.getElementById("btn-salvar"),
  btnCancelar: document.getElementById("btn-cancelar"),
  filtros: document.querySelector(".filtros"),
  busca: document.getElementById("busca"),
  lista: document.getElementById("lista-tarefas"),
  mensagemVazia: document.getElementById("mensagem-vazia"),
  contadores: document.getElementById("contadores"),
};

function iniciarAplicacao() {
  estado.tarefas = carregarTarefas();
  registrarEventos();
  renderizarTudo();
}

function registrarEventos() {
  elementos.form.addEventListener("submit", onEnviarFormulario);
  elementos.btnCancelar.addEventListener("click", limparFormulario);
  elementos.busca.addEventListener("input", onBuscar);

  // Event delegation para botões de ação da lista.
  elementos.lista.addEventListener("click", onAcaoLista);

  elementos.filtros.addEventListener("click", onTrocarFiltro);
}

function onEnviarFormulario(evento) {
  evento.preventDefault();
  const dados = lerDadosFormulario();

  if (!validarTitulo(dados.titulo)) {
    elementos.erroTitulo.textContent = "O título precisa ter ao menos 3 caracteres.";
    return;
  }

  elementos.erroTitulo.textContent = "";

  if (dados.id) {
    atualizarTarefa(dados);
  } else {
    adicionarTarefa(dados);
  }

  salvarTarefas();
  limparFormulario();
  renderizarTudo();
}

function onBuscar(evento) {
  estado.termoBusca = evento.target.value.trim().toLowerCase();
  renderizarLista();
}

function onTrocarFiltro(evento) {
  const botao = evento.target.closest("[data-filtro]");
  if (!botao) {
    return;
  }

  estado.filtroAtual = botao.dataset.filtro;
  atualizarBotoesFiltro();
  renderizarLista();
}

function onAcaoLista(evento) {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) {
    return;
  }

  const id = botao.dataset.id;
  const acao = botao.dataset.acao;

  if (acao === "editar") {
    prepararEdicao(id);
    return;
  }

  if (acao === "excluir") {
    excluirTarefa(id);
    return;
  }

  if (acao === "concluir") {
    alternarConclusao(id);
  }
}

function lerDadosFormulario() {
  return {
    id: elementos.idTarefa.value,
    titulo: elementos.titulo.value.trim(),
    descricao: elementos.descricao.value.trim(),
    prioridade: elementos.prioridade.value,
  };
}

function validarTitulo(titulo) {
  return titulo.length >= 3;
}

function adicionarTarefa(dados) {
  const novaTarefa = {
    id: gerarId(),
    titulo: dados.titulo,
    descricao: dados.descricao,
    prioridade: dados.prioridade,
    concluida: false,
    criadaEm: new Date().toISOString(),
  };

  estado.tarefas.unshift(novaTarefa);
}

function atualizarTarefa(dados) {
  const indice = encontrarIndicePorId(dados.id);
  if (indice === -1) {
    return;
  }

  const tarefaAtual = estado.tarefas[indice];
  estado.tarefas[indice] = {
    ...tarefaAtual,
    titulo: dados.titulo,
    descricao: dados.descricao,
    prioridade: dados.prioridade,
  };
}

function prepararEdicao(id) {
  const tarefa = buscarTarefaPorId(id);
  if (!tarefa) {
    return;
  }

  elementos.idTarefa.value = tarefa.id;
  elementos.titulo.value = tarefa.titulo;
  elementos.descricao.value = tarefa.descricao;
  elementos.prioridade.value = tarefa.prioridade;
  elementos.tituloFormulario.textContent = "Editar tarefa";
  elementos.btnSalvar.textContent = "Atualizar tarefa";
  elementos.btnCancelar.hidden = false;
  elementos.titulo.focus();
}

function limparFormulario() {
  elementos.form.reset();
  elementos.idTarefa.value = "";
  elementos.prioridade.value = "media";
  elementos.tituloFormulario.textContent = "Nova tarefa";
  elementos.btnSalvar.textContent = "Salvar tarefa";
  elementos.btnCancelar.hidden = true;
  elementos.erroTitulo.textContent = "";
}

function excluirTarefa(id) {
  const confirma = window.confirm("Tem certeza que deseja excluir esta tarefa?");
  if (!confirma) {
    return;
  }

  estado.tarefas = estado.tarefas.filter(function (tarefa) {
    return tarefa.id !== id;
  });

  salvarTarefas();
  renderizarTudo();
}

function alternarConclusao(id) {
  const indice = encontrarIndicePorId(id);
  if (indice === -1) {
    return;
  }

  estado.tarefas[indice].concluida = !estado.tarefas[indice].concluida;
  salvarTarefas();
  renderizarTudo();
}

function renderizarTudo() {
  atualizarBotoesFiltro();
  renderizarLista();
  renderizarContadores();
}

function renderizarLista() {
  const tarefasFiltradas = filtrarTarefasVisiveis();

  if (tarefasFiltradas.length === 0) {
    elementos.lista.innerHTML = "";
    elementos.mensagemVazia.style.display = "block";
    return;
  }

  elementos.mensagemVazia.style.display = "none";
  elementos.lista.innerHTML = tarefasFiltradas
    .map(function (tarefa) {
      return montarItemTarefa(tarefa);
    })
    .join("");
}

function montarItemTarefa(tarefa) {
  const descricao = tarefa.descricao
    ? `<p class="item-descricao">${escaparHtml(tarefa.descricao)}</p>`
    : "";

  const textoBotao = tarefa.concluida ? "Reabrir" : "Concluir";
  const classeConcluida = tarefa.concluida ? "concluida" : "";

  return `
    <li class="item-tarefa ${classeConcluida}" data-prioridade="${tarefa.prioridade}">
      <div class="item-topo">
        <h3 class="item-titulo">${escaparHtml(tarefa.titulo)}</h3>
        <strong>${obterLabelPrioridade(tarefa.prioridade)}</strong>
      </div>
      ${descricao}
      <p class="item-meta">Criada em: ${formatarData(tarefa.criadaEm)}</p>
      <div class="item-acoes">
        <button class="btn" data-acao="concluir" data-id="${tarefa.id}" type="button">${textoBotao}</button>
        <button class="btn" data-acao="editar" data-id="${tarefa.id}" type="button">Editar</button>
        <button class="btn" data-acao="excluir" data-id="${tarefa.id}" type="button">Excluir</button>
      </div>
    </li>
  `;
}

function renderizarContadores() {
  const total = estado.tarefas.length;
  const concluidas = contarConcluidas();
  const pendentes = total - concluidas;

  elementos.contadores.innerHTML = `
    <span>Total: <strong>${total}</strong></span>
    <span>Pendentes: <strong>${pendentes}</strong></span>
    <span>Concluídas: <strong>${concluidas}</strong></span>
  `;
}

function filtrarTarefasVisiveis() {
  return estado.tarefas.filter(function (tarefa) {
    return passaFiltro(tarefa) && passaBusca(tarefa);
  });
}

function passaFiltro(tarefa) {
  if (estado.filtroAtual === "pendentes") {
    return !tarefa.concluida;
  }

  if (estado.filtroAtual === "concluidas") {
    return tarefa.concluida;
  }

  return true;
}

function passaBusca(tarefa) {
  if (!estado.termoBusca) {
    return true;
  }

  const titulo = tarefa.titulo.toLowerCase();
  const descricao = tarefa.descricao.toLowerCase();
  return titulo.includes(estado.termoBusca) || descricao.includes(estado.termoBusca);
}

function atualizarBotoesFiltro() {
  const botoes = elementos.filtros.querySelectorAll(".btn-filtro");

  botoes.forEach(function (botao) {
    const ativo = botao.dataset.filtro === estado.filtroAtual;
    botao.classList.toggle("ativo", ativo);
  });
}

function carregarTarefas() {
  const bruto = localStorage.getItem(CHAVE_STORAGE);

  if (!bruto) {
    return [];
  }

  try {
    const dados = JSON.parse(bruto);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    return [];
  }
}

function salvarTarefas() {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado.tarefas));
}

function buscarTarefaPorId(id) {
  return estado.tarefas.find(function (tarefa) {
    return tarefa.id === id;
  });
}

function encontrarIndicePorId(id) {
  return estado.tarefas.findIndex(function (tarefa) {
    return tarefa.id === id;
  });
}

function contarConcluidas() {
  let total = 0;

  estado.tarefas.forEach(function (tarefa) {
    if (tarefa.concluida) {
      total += 1;
    }
  });

  return total;
}

function gerarId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function obterLabelPrioridade(prioridade) {
  const labels = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
  };

  return labels[prioridade] || "Média";
}

function formatarData(iso) {
  const data = new Date(iso);
  return data.toLocaleString("pt-BR");
}

function escaparHtml(texto) {
  const mapa = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return texto.replace(/[&<>"']/g, function (caractere) {
    return mapa[caractere];
  });
}

iniciarAplicacao();
