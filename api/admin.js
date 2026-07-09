import * as XLSX from "xlsx";
import { saveFile, getFile, listFolder } from "./github.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb"
    }
  }
};

const RUTAS = {
  catalogo: "data/catalogo.xlsx",
  eventos: "data/turnos.xlsx",
  catering: "data/catering.xlsx"
};

function clean(v) {
  return String(v || "").trim();
}

function validarAdmin(user, pass) {
  return (
    clean(user) === clean(process.env.ADMIN_USER) &&
    clean(pass) === clean(process.env.ADMIN_PASS)
  );
}

function normalizarExcelBase64(contentBase64) {
  const limpio = String(contentBase64 || "")
    .replace(/^data:.*;base64,/, "")
    .replace(/\s/g, "");

  if (!limpio) {
    throw new Error("No se recibió contenido Base64.");
  }

  const buffer = Buffer.from(limpio, "base64");

  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true
  });

  const outputBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer"
  });

  return outputBuffer.toString("base64");
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Método no permitido. Usá POST."
      });
    }

    const { action, user, pass, tipo, contentBase64 } = req.body || {};

    if (!validarAdmin(user, pass)) {
      return res.status(401).json({
        ok: false,
        error: "Usuario o contraseña incorrectos."
      });
    }

    if (action === "login") {
      return res.status(200).json({
        ok: true,
        message: "Login correcto."
      });
    }

    if (action === "uploadExcel") {
      const path = RUTAS[tipo];

      if (!path) {
        return res.status(400).json({
          ok: false,
          error: "Tipo inválido. Usá catalogo, eventos o catering."
        });
      }

      if (!contentBase64) {
        return res.status(400).json({
          ok: false,
          error: "No se recibió contenido Base64."
        });
      }

      const excelNormalizadoBase64 = normalizarExcelBase64(contentBase64);

      const result = await saveFile(
        path,
        excelNormalizadoBase64,
        `Actualizar ${path}`
      );

      return res.status(200).json({
        ok: true,
        message: "Excel actualizado correctamente.",
        path,
        commit: result.commit?.html_url || null
      });
    }

    if (action === "fileInfo") {
      const path = RUTAS[tipo];

      if (!path) {
        return res.status(400).json({
          ok: false,
          error: "Tipo inválido."
        });
      }

      const file = await getFile(path);

      return res.status(200).json({
        ok: true,
        exists: !!file,
        path,
        sha: file?.sha || null,
        downloadUrl: file?.download_url || null
      });
    }

    if (action === "listData") {
      const files = await listFolder("data");

      return res.status(200).json({
        ok: true,
        files: files.map(file => ({
          name: file.name,
          path: file.path,
          downloadUrl: file.download_url,
          sha: file.sha
        }))
      });
    }

    return res.status(400).json({
      ok: false,
      error: "Acción inválida."
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Error interno en admin.js",
      detalle: error.message
    });
  }
}
