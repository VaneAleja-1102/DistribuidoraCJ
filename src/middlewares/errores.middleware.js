const manejarErrores = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    mensaje: err.message || 'Error interno del servidor',
  });
};

module.exports = manejarErrores;