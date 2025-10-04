// ============================
// 🔹 Importações principais
// ============================
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { dispararEmailsEpiVencido } = require("./cron/verificarEpiVencido");

// 🔹 Middlewares e rotas
const protegerRotas = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const recuperarSenhaRoutes = require("./routes/recuperarSenhaRoutes");
const funcionarioRoutes = require("./routes/funcionarioRoutes");
const acidentesRoutes = require("./routes/acidentesRoutes");
const doencaRoutes = require("./routes/doencaRoutes");
const corpoRoutes = require("./routes/corpoRoutes");
const agenteRoutes = require("./routes/agenteRoutes");
const empresasRoutes = require("./routes/empresasRoutes");
const cadastroRoutes = require("./routes/cadastroRoutes");
const relatorioAcidenteRoutes = require("./routes/relatorioAcidenteRoutes");
const relatoriogeralRoutes = require("./routes/relatoriogeralRoutes");
const relatorioperiodoRoutes = require("./routes/relatorioperiodoRoutes");
const relatorioEstatisticoRoutes = require("./routes/relatorioEstatisticoRoutes");
const relatorioEstatisticoFuncaoRoutes = require("./routes/relatorioEstatisticoFuncaoRoutes");
const relatorioEstatisticoSetorRoutes = require("./routes/relatorioEstatisticoSetorRoutes");
const listarCadastroRoutes = require("./routes/listarCadastroRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const epiRoutes = require("./routes/epiRoutes");
const epiFuncionarioRoutes = require("./routes/epiFuncionarioRoutes");
const relatorioEpiRoutes = require("./routes/relatorioEpiRoutes");
const relatorioEpiFuncionarioRoutes = require("./routes/relatorioEpiFuncionarioRoutes");

const app = express();

// ============================
// 🔹 CORS (permite Netlify e localhost)
// ============================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // caso use Vite localmente
  "https://segurancatrabalho.netlify.app" // ✅ seu domínio Netlify
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // permite Postman
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Origem não permitida pelo CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// ============================
// 🔹 Sessão (cookies cross-domain seguros)
// ============================
app.use(session({
  secret: "chave_super_secreta",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,     // HTTPS obrigatório no Render
    sameSite: "none"  // permite Netlify <-> Render
  }
}));

// ============================
// 🔹 Rotas Públicas (sem login)
// ============================
app.get("/status", (req, res) => {
  res.send("✅ API Segurança do Trabalho rodando com sucesso!");
});

app.use("/", recuperarSenhaRoutes);
app.use("/", authRoutes);

// ============================
// 🔹 Middleware global (tudo abaixo exige login)
// ============================
app.use(protegerRotas);

// ============================
// 🔹 Rotas privadas (API protegida)
// ============================
app.use("/funcionarios", funcionarioRoutes);
app.use("/acidentes", acidentesRoutes);
app.use("/doenca", doencaRoutes);
app.use("/corpo", corpoRoutes);
app.use("/agente", agenteRoutes);
app.use("/empresa", empresasRoutes);
app.use("/cadastro", cadastroRoutes);
app.use("/", relatorioAcidenteRoutes);
app.use("/relatorios-geral", relatoriogeralRoutes);
app.use("/relatorios-periodo", relatorioperiodoRoutes);
app.use("/relatorios-estatistico", relatorioEstatisticoRoutes);
app.use("/relatorios-estatistico", relatorioEstatisticoFuncaoRoutes);
app.use("/relatorios-estatistico", relatorioEstatisticoSetorRoutes);
app.use("/", listarCadastroRoutes);
app.use(usuarioRoutes);
app.use(epiRoutes);
app.use("/epi_funcionario", epiFuncionarioRoutes);
app.use("/", relatorioEpiRoutes);
app.use("/", relatorioEpiFuncionarioRoutes);

// ============================
// 🔹 Teste manual de e-mails (cron)
// ============================
app.get("/verificar-epis-vencidos", async (req, res) => {
  try {
    await dispararEmailsEpiVencido();
    res.send("✅ Verificação manual de EPIs vencidos concluída.");
  } catch (err) {
    console.error("Erro ao executar verificação manual:", err);
    res.status(500).send("Erro ao executar verificação manual de EPIs vencidos.");
  }
});

// ============================
// 🔹 Inicialização do servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

// ============================
// 🔹 Inicia cron automático
// ============================
require("./cron/verificarEpiVencido");
