// — [SPRINT 01 – BASE: Express e ES Modules – mantido da primeira aula] —
import express from "express";

// — [SPRINT 04 – NOVO] —
// Módulo que lê e grava as tarefas em arquivo JSON.
import { lerTarefas, salvarTarefas } from "./store.js";

const app = express();
const PORT = 3000;

// — [SPRINT 01 – ROTAS HERDADAS: /, /status, /sobre] —
// Rotas da Sprint 01 – continuam disponíveis.
app.get("/", (req, res) => res.send("API de Tarefas ativa! ✅"));
app.get("/status", (req, res) => res.json({ status: "online", sprint: 4 }));
app.get("/sobre", (req, res) => res.send("Gerenciador de Tarefas Local com Node.js, Express e ES Modules."));

// — [SPRINT 04 – ROTAS ALTERADAS PARA USAR ARQUIVOS] —
app.get("/tarefas", async (req, res) => {
  try { res.json(await lerTarefas()); }
  catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível carregar as tarefas." });
  }
});

app.get("/tarefas/:id", async (req, res) => {
  try {
    const lista = await lerTarefas();
    const tarefa = lista.find(t => t.id === Number(req.params.id));
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada." });
    res.json(tarefa);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao buscar a tarefa." });
  }
});

app.get("/total-tarefas", async (req, res) => {
  try { res.json({ total: (await lerTarefas()).length }); }
  catch (erro) { res.status(500).json({ erro: "Falha ao contar tarefas." }); }
});

// Rota TEMPORÁRIA: apenas para aprender escrita em arquivo.
// GET não deve modificar dados numa API real; será removida na Sprint 05.
app.get("/exemplo-salvar", async (req, res) => {
  try {
    const lista = await lerTarefas();
    lista.push({ id: Date.now(), responsavel: "Aluno", titulo: "Estudar Node.js", concluida: false });
    await salvarTarefas(lista);
    res.json({ aviso: "Tarefa de exemplo gravada", total: lista.length });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gravar arquivo." });
  }
});

// GET modifica dados somente para esta demonstração; em uma API real, use POST.
let filaGravacoes = Promise.resolve();
app.get("/gravar-tarefa-correta", (req, res) => {
  const operacao = filaGravacoes.then(async () => {
    const lista = await lerTarefas();
    const id = lista.reduce((maior, item) => Math.max(maior, Number(item.id) || 0), 0) + 1;
    const novaTarefa = { id, responsavel: "Aluno", titulo: "Tarefa salva na fila!", concluida: false };
    await salvarTarefas([...lista, novaTarefa]);
    return { aviso: "Tarefa gravada com sucesso!", tarefa: novaTarefa, total: lista.length + 1 };
  });
  filaGravacoes = operacao.catch(() => {});
  operacao.then(resultado => res.json(resultado)).catch(erro => {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gravar arquivo." });
  });
});

// — [SPRINT 01 – SERVIDOR: iniciado na porta 3000; mantido ao longo das aulas] —
app.listen(PORT, () => {
  console.log(`Servidor de Tarefas rodando em http://localhost:${PORT}`);
});
