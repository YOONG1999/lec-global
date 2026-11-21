const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Lec-Global está activo");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/ip", async (req, res) => {
  const ip = req.body?.valor;
  const apiKey = process.env.IP_API_KEY;

  if (!ip) return res.status(400).json({ error: "Falta el dato valor." });
  if (!apiKey) return res.status(503).json({ error: "Falta configurar IP_API_KEY en Render." });

  try {
    const url = new URL("https://ipgeolocation.abstractapi.com/v1/");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("ip_address", ip);

    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    res.status(respuesta.ok ? 200 : 502).json(datos);
  } catch {
    res.status(502).json({ error: "No se pudo conectar con el servicio." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor activo en el puerto ${port}`));
