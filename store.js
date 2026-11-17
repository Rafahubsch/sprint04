// — [SPRINT 01 – BASE: Express e ES Modules] —
import express from "express";

// — [SPRINT 04 – NOVO] —
// Módulo que lê e grava os recados/mensagens da escola em arquivo JSON.
import { lerMensagens, salvarMensagens } from "./store.js";

const app = express();
const PORT = 3000;

// — [SPRINT 01 – ROTAS HERDADAS DA ESCOLA] —
app.get("/", (req, res) => {
  res.send("Bem-vindo à Central de Informações da Escola! 🚀");
});

app.get("/status", (req, res) => {
  res.json({
    status: "online",
    sprint: 4,
    mensagem: "O servidor da escola está funcionando corretamente."
  });
});

app.get("/escola", (req, res) => {
  res.json({
    nome: "Escola Técnica Horizonte",
    cidade: "São Paulo",
    tipo: "Ensino Técnico"
  });
});

app.get("/cursos", (req, res) => {
  const cursos = [
    { id: 1, nome: "Desenvolvimento de Sistemas" },
    { id: 2, nome: "Redes de Computadores" },
    { id: 3, nome: "Administração" }
  ];
  res.json(cursos);
});

app.get("/professor", (req, res) => {
  res.json({
    nome: "Carlos Oliveira",
    disciplina: "Programação Back-End"
  });
});

app.get("/ajuda", (req, res) => {
  res.send(
    "Rotas disponíveis:\n" +
    "/ - Página inicial e boas-vindas.\n" +
    "/status - Verifica se o servidor está online.\n" +
    "/escola - Exibe informações da instituição.\n" +
    "/cursos - Lista os cursos disponíveis.\n" +
    "/professor - Exibe informações do professor.\n" +
    "/mensagens - Lista os recados salvos no arquivo.\n" +
    "/mensagens/:id - Busca um recado específico.\n" +
    "/total-mensagens - Mostra a quantidade de recados.\n" +
    "/gravar-mensagem-correta - Salva um novo recado na fila."
  );
});

app.get("/requisicao", (req, res) => {
  res.json({
    metodo: req.method,
    caminho: req.path,
    mensagem: "Requisição recebida com sucesso."
  });
});

// — [SPRINT 04 – ROTAS ALTERADAS PARA USAR ARQUIVOS] —
app.get("/mensagens", async (req, res) => {
  try {
    res.json(await lerMensagens());
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Não foi possível ler os recados da escola." });
  }
});

app.get("/mensagens/:id", async (req, res) => {
  try {
    const lista = await lerMensagens();
    const mensagem = lista.find(m => m.id === Number(req.params.id));
    if (!mensagem) return res.status(404).json({ erro: "Recado não encontrado." });
    res.json(mensagem);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Falha ao consultar recado." });
  }
});

app.get("/total-mensagens", async (req, res) => {
  try {
    res.json({ total: (await lerMensagens()).length });
  } catch (erro) {
    res.status(500).json({ erro: "Falha na contagem de recados." });
  }
});

// Rota TEMPORÁRIA: apenas para aprender escrita em arquivo.
app.get("/exemplo-salvar", async (req, res) => {
  try {
    const lista = await lerMensagens();
    lista.push({
      id: Date.now(),
      usuario: "Secretaria",
      texto: "Aviso de exemplo gravado em arquivo!"
    });
    await salvarMensagens(lista);
    res.json({ aviso: "Exemplo didático gravado", total: lista.length });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao gravar arquivo." });
  }
});

// Fila de gravação para evitar conflitos de escrita simultânea
let filaGravacoes = Promise.resolve();
app.get("/gravar-mensagem-correta", (req, res) => {
  const tarefa = filaGravacoes.then(async () => {
    const lista = await lerMensagens();
    const id = lista.reduce((maior, mensagem) => Math.max(maior, Number(mensagem.id) || 0), 0) + 1;
    const mensagem = {
      id,
      usuario: "Coordenação",
      texto: "Novo comunicado oficial da Escola Técnica Horizonte!"
    };
    await salvarMensagens([...lista, mensagem]);
    return { aviso: "Recado gravado com sucesso!", mensagem, total: lista.length + 1 };
  });

  filaGravacoes = tarefa.catch(() => {});
  tarefa
    .then(resultado => res.json(resultado))
    .catch(erro => {
      console.error(erro);
      res.status(500).json({ erro: "Erro ao gravar arquivo." });
    });
});

// — [SPRINT 01 – SERVIDOR] —
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor da Escola rodando em http://localhost:${PORT}`);
});
