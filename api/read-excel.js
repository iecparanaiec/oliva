export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        ok: false,
        error: "Método no permitido. Usá GET."
      });
    }

    const { tipo } = req.query;

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER;
    const GITHUB_REPO = process.env.GITHUB_REPO;
    const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return res.status(500).json({
        ok: false,
        error: "Faltan variables de entorno en Vercel."
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

    const url =
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

    const githubResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    });

    const data = await githubResponse.json();

    if (!githubResponse.ok) {
      return res.status(404).json({
        ok: false,
        error: "No se pudo leer el archivo desde GitHub.",
        detalle: data
      });
    }

    return res.status(200).json({
      ok: true,
      tipo,
      path,
      downloadUrl: data.download_url,
      sha: data.sha,
      updated: data.git_url || null
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Error interno en read-excel.",
      detalle: error.message
    });
  }
}
