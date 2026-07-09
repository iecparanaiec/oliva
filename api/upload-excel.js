export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Método no permitido. Usá POST."
      });
    }

    const {
      user,
      pass,
      tipo,
      contentBase64
    } = req.body || {};

    const ADMIN_USER = process.env.ADMIN_USER;
    const ADMIN_PASS = process.env.ADMIN_PASS;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

    if (!ADMIN_USER || !ADMIN_PASS || !GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return res.status(500).json({
        ok: false,
        error: "Faltan variables de entorno en Vercel."
      });
    }

    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
      return res.status(401).json({
        ok: false,
        error: "Usuario o contraseña incorrectos."
      });
    }

    const rutas = {
      catalogo: "data/catalogo.xlsx",
      eventos: "data/turnos.xlsx",
      catering: "data/catering.xlsx"
    };

    const path = rutas[tipo];

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

    const githubHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    };

    const getUrl =
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

    let sha = null;

    const getResponse = await fetch(getUrl, {
      method: "GET",
      headers: githubHeaders
    });

    if (getResponse.ok) {
      const existingFile = await getResponse.json();
      sha = existingFile.sha;
    }

    const putUrl =
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

    const putResponse = await fetch(putUrl, {
      method: "PUT",
      headers: githubHeaders,
      body: JSON.stringify({
        message: `Actualizar ${path}`,
        content: contentBase64,
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {})
      })
    });

    const putData = await putResponse.json();

    if (!putResponse.ok) {
      return res.status(500).json({
        ok: false,
        error: "GitHub rechazó la subida.",
        detalle: putData
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Excel actualizado correctamente.",
      path,
      commit: putData.commit?.html_url || null
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Error interno en upload-excel.",
      detalle: error.message
    });
  }
}
