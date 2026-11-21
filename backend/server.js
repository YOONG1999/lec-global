app.use((req, res, next) => {
  const origen = req.headers.origin;
  const permitidos = [
    "http://localhost:8080",
    "https://lec-global.onrender.com"
  ];

  if (permitidos.includes(origen)) {
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

