const { Router } = require('express');
const router = Router();

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
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */
router.get('/', categoriasController.listar);

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtener una categoría por id
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', idValidator, validarCampos, categoriasController.obtener);

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crear una nueva categoría
 *     tags: [Categorias]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Error de validación
 */
router.post('/', crearCategoriaValidator, validarCampos, categoriasController.crear);

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categorias]
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
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/:id', actualizarCategoriaValidator, validarCampos, categoriasController.actualizar);

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Eliminar una categoría
 *     tags: [Categorias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 */
router.delete('/:id', idValidator, validarCampos, categoriasController.eliminar);
router.get('/', categoriasController.listar);
router.get('/:id', idValidator, validarCampos, categoriasController.obtener);
router.post('/', crearCategoriaValidator, validarCampos, categoriasController.crear);
router.put('/:id', actualizarCategoriaValidator, validarCampos, categoriasController.actualizar);
router.delete('/:id', idValidator, validarCampos, categoriasController.eliminar);

module.exports = router;