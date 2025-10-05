// config.js
// Evita erro de redeclaração se o arquivo for incluído mais de uma vez
window.API_BASE = window.API_BASE || "https://sistema-sesmt.onrender.com";

// 🔹 Função auxiliar global para requisições autenticadas
window.fetchComAuth = async function (url, options = {}) {
  const resposta = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: "include", // mantém cookies/sessão
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  if (!resposta.ok) throw new Error(`Erro ${resposta.status}: ${resposta.statusText}`);
  return resposta.json();
};



















