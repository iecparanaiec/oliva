export const config = {
  api: {
    bodyParser: true
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

    const { user, pass } = req.body || {};

    const ADMIN_USER = process.env.ADMIN_USER;
    const ADMIN_PASS = process.env.ADMIN_PASS;

    if (!ADMIN_USER || !ADMIN_PASS) {
      return res.status(500).json({
        ok: false,
        error: "Faltan variables ADMIN_USER o ADMIN_PASS en Vercel."
      });
    }

    if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
      return res.status(401).json({
        ok: false,
        error: "Usuario o contraseña incorrectos."
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Login correcto."
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Error interno en login.",
      detalle: error.message
    });
  }
}
