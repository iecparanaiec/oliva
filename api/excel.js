// ============================================
// api/excel.js
// Utilidades para archivos Excel en Espacio Oliva
// ============================================

export function cleanBase64(contentBase64) {
  if (!contentBase64 || typeof contentBase64 !== "string") {
    throw new Error("El contenido Base64 es inválido.");
  }

  return contentBase64.replace(/^data:.*;base64,/, "");
}

export function validateExcelFileName(filename = "") {
  const validExtensions = [".xlsx", ".xls", ".csv"];
  const lower = filename.toLowerCase();

  return validExtensions.some(ext => lower.endsWith(ext));
}

export function validateUploadPayload({ tipo, contentBase64 }) {
  if (!tipo) {
    throw new Error("Falta el tipo de archivo.");
  }

  if (!contentBase64) {
    throw new Error("No se recibió contenido Base64.");
  }

  return true;
}

export function getExpectedColumns(tipo) {
  const columns = {
    catalogo: ["nombre", "categoria", "marca", "precio", "stock", "imagen"],
    eventos: ["fecha", "hora", "tipo", "estado", "capacidad", "precio", "notas"],
    catering: ["nombre", "categoria", "personas", "descripcion", "precio", "imagen"]
  };

  return columns[tipo] || [];
}

export function buildUploadMessage(tipo, path) {
  const labels = {
    catalogo: "catálogo de productos",
    eventos: "turnos de eventos",
    catering: "catálogo de catering"
  };

  return `Actualizar ${labels[tipo] || "archivo"} (${path})`;
}

export function getPublicDataPath(tipo) {
  const paths = {
    catalogo: "/data/catalogo.xlsx",
    eventos: "/data/turnos.xlsx",
    catering: "/data/catering.xlsx"
  };

  return paths[tipo] || null;
}
