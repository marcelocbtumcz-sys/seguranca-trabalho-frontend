const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const { dispararEmailsEpiVencido } = require("./cron/verificarEpiVencido");
const fs = require("fs");

// Importa middleware e rotas
const protegerRotas = require("./middlewares/authMiddleware");
const authRoutes = require("./routes/authRoutes");
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
const recuperarSenhaRoutes = require("./routes/recuperarSenhaRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const epiRoutes = require("./routes/epiRoutes");
const epiFuncionarioRoutes = require("./routes/epiFuncionarioRoutes");
const relatorioEpiRoutes = require("./routes/relatorioEpiRoutes");
const relatorioEpiFuncionarioRoutes = require("./routes/relatorioEpiFuncionarioRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // caso use Vite localmente
  "https://segurancatrabalho.netlify.app" // ✅ seu site publicado
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Origem não permitida pelo CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "chave_super_secreta",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,     // ✅ necessário, pois o Render usa HTTPS
    sameSite: "none"  // ✅ permite que o Netlify acesse o cookie de sessão
  }
}));


// ============================
// 🔹 Rotas Públicas (API e HTML de Login)
// ============================

// Status sempre acessível
app.get("/status", (req, res) => {
    res.send("✅ Servidor rodando e acessível!");
});

// Rotas de recuperação de senha
app.use("/", recuperarSenhaRoutes);

// Rotas de autenticação (Login e Logout)
app.use("/", authRoutes);

// Página inicial → login.html (só serve se existir localmente)
app.get("/", (req, res) => {
  const localLogin = path.join(__dirname, "../frontend/login.html");
  if (fs.existsSync(localLogin)) {
    res.sendFile(localLogin);
  } else {
    res.send("✅ API Segurança do Trabalho rodando com sucesso!");
  }
});


// ============================
// 🔹 Middleware global de proteção (SÓ A PARTIR DAQUI TUDO É PRIVADO)
// ============================
app.use(protegerRotas);

// ============================
// 🔹 Proteção de todas as páginas .html
// ============================
app.get(/.*\.html$/, (req, res) => {
    console.log(`[AUTH] Servindo página protegida: ${req.path}`);
    res.sendFile(path.join(__dirname, "../frontend", req.path));
});

// ============================
// 🔹 Rotas Privadas (Arquivos estáticos, Páginas HTML e APIs)
// ============================
app.use(express.static(path.join(__dirname, "../frontend")));

// Rotas de API privadas
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
app.use("/", relatorioEpiRoutes);                 // → /relatorios-epi-geral
app.use("/", relatorioEpiFuncionarioRoutes);      // → /relatorios-epi-funcionario e /funcionarios-nomes

// ============================
// 🔹 Rota manual para testar envio de e-mails de EPIs vencidos
// ============================
app.get("/verificar-epis-vencidos", async (req, res) => {
  try {
    await dispararEmailsEpiVencido();
    res.send("✅ Verificação manual de EPIs vencidos concluída (verifique o e-mail).");
  } catch (err) {
    console.error("Erro ao executar verificação manual:", err);
    res.status(500).send("Erro ao executar verificação manual de EPIs vencidos.");
  }
});

// ============================
// 🔹 Rodar servidor (Render usa process.env.PORT)
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

// ============================
// 🔹 Inicia cron automático
// ============================
require("./cron/verificarEpiVencido");
