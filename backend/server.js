const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Lec-Global está activo");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

async function consultarAbstract({
  req,
  res,
  campo,
  variableClave,
  endpoint,
  parametro
}) {
  const valor = req.body?.valor;
  const apiKey = process.env[variableClave];

  if (!valor) {
    return res.status(400).json({ error: `Falta el dato valor (${campo}).` });
  }

  if (!apiKey) {
    return res.status(503).json({
      error: `Falta configurar ${variableClave} en Render.`
    });
  }

  try {
    const url = new URL(endpoint);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set(parametro, String(valor).trim());

    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    return res.status(respuesta.ok ? 200 : 502).json(datos);
  } catch (error) {
    console.error(`Error en consulta ${campo}:`, error);
    return res.status(502).json({
      error: "No se pudo conectar con AbstractAPI."
    });
  }
}

app.post("/api/ip", (req, res) =>
  consultarAbstract({
    req,
    res,
    campo: "IP",
    variableClave: "IP_API_KEY",
    endpoint: "https://ip-intelligence.abstractapi.com/v1/",
    parametro: "ip_address"
  })
);

app.post("/api/email", (req, res) =>
  consultarAbstract({
    req,
    res,
    campo: "correo",
    variableClave: "EMAIL_API_KEY",
    endpoint: "https://emailreputation.abstractapi.com/v1/",
    parametro: "email"
  })
);

app.post("/api/phone", (req, res) =>
  consultarAbstract({
    req,
    res,
    campo: "teléfono",
    variableClave: "PHONE_API_KEY",
    endpoint: "https://phoneintelligence.abstractapi.com/v1/",
    parametro: "phone"
  })
);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor activo en el puerto ${port}`));
