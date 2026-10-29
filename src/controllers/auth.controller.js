const { matchedData } = require("express-validator");
const usuariosService = require("../services/usuarios.service");
const { generarToken } = require("../utils/jwt.util");

// ========================================
// Registro
// ========================================
const registrar = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ["body"] });

    const usuarioExistente = await usuariosService.obtenerUsuarioPorEmail(datos.email);
    if (usuarioExistente) {
      return res.status(409).json({ mensaje: "Ya existe un usuario con ese correo electrónico" });
    }

    const usuario = await usuariosService.crearUsuario(datos);

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
      },
    });
  } catch (error) {
    // Dos registros simultáneos con el mismo correo: lo frena el UNIQUE de PostgreSQL
    if (error.code === "23505") {
      return res.status(409).json({ mensaje: "Ya existe un usuario con ese correo electrónico" });
    }
    next(error);
  }
};

// ========================================
// Login
// ========================================
const login = async (req, res, next) => {
  try {
    const datos = matchedData(req, { locations: ["body"] });

    const usuario = await usuariosService.verificarCredenciales(datos.email, datos.password);

    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: "Usuario deshabilitado" });
    }

    const token = generarToken(usuario);

    return res.status(200).json({
      mensaje: "Autenticación correcta",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registrar, login };