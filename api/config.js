// ============================================
// api/config.js
// Configuración central del proyecto Espacio Oliva
// ============================================

export const DATA_FILES = {
  catalogo: "data/catalogo.xlsx",
  eventos: "data/turnos.xlsx",
  catering: "data/catering.xlsx"
};

export const VALID_TYPES = Object.keys(DATA_FILES);

export const ADMIN_ACTIONS = {
  LOGIN: "login",
  UPLOAD_EXCEL: "uploadExcel",
  FILE_INFO: "fileInfo",
  LIST_DATA: "listData"
};

export function getDataPath(tipo) {
  return DATA_FILES[tipo] || null;
}

export function validateAdmin(user, pass) {
  return (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS
  );
}

export function getGithubConfig() {
  const config = {
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || "main",
    token: process.env.GITHUB_TOKEN
  };

  const missing = [];

  if (!config.owner) missing.push("GITHUB_OWNER");
  if (!config.repo) missing.push("GITHUB_REPO");
  if (!config.token) missing.push("GITHUB_TOKEN");

  if (missing.length) {
    throw new Error("Faltan variables de entorno: " + missing.join(", "));
  }

  return config;
}

export function getWhatsappNumber() {
  return process.env.WHATSAPP_NUMBER || "5493434649039";
}
