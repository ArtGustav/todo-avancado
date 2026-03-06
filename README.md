# To-Do List Avançado

## Objetivo
Projeto de gerenciador de tarefas feito com HTML, CSS e JavaScript puro, com armazenamento em `localStorage` e funcionamento local (abrindo apenas o `index.html`).

## Funcionalidades
- Cadastro de tarefa com:
  - Título obrigatório (mínimo de 3 caracteres)
  - Descrição opcional
  - Prioridade (`baixa`, `media`, `alta`)
- Listagem automática ao abrir a página
- Edição de tarefa existente
- Exclusão com confirmação
- Marcação de tarefa como concluída/reaberta
- Filtros por status:
  - Todas
  - Pendentes
  - Concluídas
- Busca por texto no título ou descrição
- Contadores de tarefas:
  - Total
  - Pendentes
  - Concluídas
- Data de criação automática
- Persistência em `localStorage`

## Como usar
1. Abra `todo-avancado/index.html` no navegador.
2. Preencha o formulário no topo e clique em **Salvar tarefa**.
3. Use os botões de cada item para concluir, editar ou excluir.
4. Utilize os filtros e a busca para localizar tarefas rapidamente.

## Estrutura do projeto
```text
todo-avancado/
  assets/
    css/
      style.css
    js/
      app.js
  index.html
  README.md
```

## Organização do código
O arquivo `app.js` está organizado por responsabilidades:
- Inicialização e registro de eventos
- Validação e tratamento do formulário
- Operações de CRUD das tarefas
- Renderização de lista, filtros e contadores
- Persistência em `localStorage`
- Funções utilitárias (formatação, escape de HTML, geração de ID)

Também foi utilizado **event delegation** na lista de tarefas para centralizar as ações de editar, excluir e concluir em um único listener.
