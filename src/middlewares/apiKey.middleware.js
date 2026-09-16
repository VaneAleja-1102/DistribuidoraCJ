require('dotenv').config();

const validarApiKey = (req, res, next) => {
  const apiKeyRecibida = req.header('x-api-key');

  if (!apiKeyRecibida) {
    return res.status(401).json({ mensaje: 'Falta el header x-api-key' });
  }

  if (apiKeyRecibida !== process.env.API_KEY) {
    return res.status(401).json({ mensaje: 'API key inválida' });
  }

  next();
};

module.exports = validarApiKey;