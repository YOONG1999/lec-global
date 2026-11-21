const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS: permite TrebEdit y el sitio desplegado en Render.
const origenesPermitidos = new Set([
  "http://localhost:8080",
  "https://lec-global.onrender.com"
]);

app.use((req, res, next) => {
  const origen = req.headers.origin;

  if (origen && origenesPermitidos.has(origen)) {
    res.setHeader("Access-Control-Allow-Origin", origen);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

async function consultarAbstract(url, parametro, valor, apiKey) {
  if (!apiKey) {
    const error = new Error("Falta configurar la clave de esta API en Render.");
    error.status = 500;
    throw error;
  }

  const endpoint = new URL(url);
  endpoint.searchParams.set("api_key", apiKey);
  endpoint.searchParams.set(parametro, valor);

  const respuesta = await fetch(endpoint);

  let datos;
  try {
    datos = await respuesta.json();
  } catch {
    datos = { error: "La API devolvió una respuesta que no es JSON." };
  }

  if (!respuesta.ok) {
    const error = new Error(
      datos.error?.message || datos.error || `La API respondió con estado ${respuesta.status}.`
    );
    error.status = respuesta.status;
    throw error;
  }

  return datos;
}

function obtenerValor(req) {
  return String(req.body?.valor || req.query?.valor || "").trim();
}

app.post("/api/ip", async (req, res) => {
  const valor = obtenerValor(req);
  if (!valor) return res.status(400).json({ error: "Falta indicar la dirección IP." });

  try {
    const datos = await consultarAbstract(
      "https://ip-intelligence.abstractapi.com/v1/",
      "ip_address",
      valor,
      process.env.IP_API_KEY
    );
    res.json(datos);
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message });
  }
});

app.post("/api/email", async (req, res) => {
  const valor = obtenerValor(req);
  if (!valor) return res.status(400).json({ error: "Falta indicar el correo electrónico." });

  try {
    const datos = await consultarAbstract(
      "https://emailreputation.abstractapi.com/v1/",
      "email",
      valor,
      process.env.EMAIL_API_KEY
    );
    res.json(datos);
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message });
  }
});

app.post("/api/phone", async (req, res) => {
  const valor = obtenerValor(req);
  if (!valor) return res.status(400).json({ error: "Falta indicar el número de teléfono." });

  try {
    const datos = await consultarAbstract(
      "https://phonevalidation.abstractapi.com/v1/",
      "phone",
      valor,
      process.env.PHONE_API_KEY
    );
    res.json(datos);
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Servidor LEC activo.");
});

app.listen(PORT, () => {
  console.log(`Servidor activo en el puerto ${PORT}`);
});
