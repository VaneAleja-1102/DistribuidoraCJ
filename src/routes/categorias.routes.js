const { Router } = require('express');
const router = Router();
const autenticarJWT = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const categoriasController = require('../controllers/categorias.controller');
const validarCampos = require('../middlewares/validar.middleware');
const {
  crearCategoriaValidator,
  actualizarCategoriaValidator,
  idValidator,
} = require('../middlewares/categorias.validator');

/**
 * @swagger
 * tags:
 *   name: Categorias
 *   description: Gestión de categorías de productos
 */

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Listar todas las categorías
 *     tags: [Categorias]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 */
router.get(
  '/',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor', 'cliente'),
  categoriasController.listar
);

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtener una categoría por id
 *     tags: [Categorias]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Categoría no encontrada
 */
router.get(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor', 'cliente'),
  idValidator,
  validarCampos,
  categoriasController.obtener
);

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorias]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Bebidas
 *               descripcion:
 *                 type: string
 *                 example: Gaseosas, jugos y agua
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 */
router.post(
  '/',
  autenticarJWT,
  autorizarRoles('administrador'),
  crearCategoriaValidator,
  validarCampos,
  categoriasController.crear
);

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categorias]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Categoría no encontrada
 */
router.put(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador'),
  actualizarCategoriaValidator,
  validarCampos,
  categoriasController.actualizar
);

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Eliminar una categoría
 *     tags: [Categorias]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Categoría no encontrada
 */
router.delete(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador'),
  idValidator,
  validarCampos,
  categoriasController.eliminar
);

module.exports = router;