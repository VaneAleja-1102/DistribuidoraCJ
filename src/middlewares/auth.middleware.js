const { verificarToken } = require("../utils/jwt.util");

// ========================================
// Autenticar mediante JWT
// ========================================
const autenticarJWT = (req, res, next) => {
  const authorization = req.get("Authorization");

  if (!authorization) {
    return res.status(401).json({ mensaje: "Token de autenticación requerido" });
  }

  const partes = authorization.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer" || !partes[1]) {
    return res.status(401).json({ mensaje: "Formato de token inválido" });
  }

  const token = partes[1];

  try {
    const payload = verificarToken(token);

    req.usuario = {
      id: Number(payload.sub),
      email: payload.email,
      rol: payload.rol,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ mensaje: "Token expirado" });
    }
    return res.status(401).json({ mensaje: "Token inválido" });
  }
};

module.exports = autenticarJWT;