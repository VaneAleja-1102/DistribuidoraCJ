const express = require("express");
const { crearUsuario } = require("../controllers/usuarios.controller");
const { validarCreacionUsuario } = require("../middlewares/usuarios.validator");
const validar = require("../middlewares/validar.middleware");
const autenticarJWT = require("../middlewares/auth.middleware");
const autorizarRoles = require("../middlewares/roles.middleware");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UsuarioAdministrativoEntrada:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *         - password
 *         - rol
 *       properties:
 *         nombre:
 *           type: string
 *           example: Vendedor Tienda
 *         email:
 *           type: string
 *           format: email
 *           example: vendedor@tiendacj.com
 *         password:
 *           type: string
 *           format: password
 *           example: ClaveVendedor2026!
 *         rol:
 *           type: string
 *           enum:
 *             - vendedor
 *             - administrador
 *           example: vendedor
 */

/**
 * @swagger
 * /usuarios:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear usuario privilegiado
 *     description: >
 *       Permite a un administrador autenticado crear
 *       usuarios con rol vendedor o administrador.
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioAdministrativoEntrada'
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Usuario no autenticado
 *       403:
 *         description: Usuario sin permisos
 *       409:
 *         description: Correo electrónico ya registrado
 */
router.post(
  "/",
  autenticarJWT,
  autorizarRoles("administrador"),
  validarCreacionUsuario,
  validar,
  crearUsuario
);

module.exports = router;