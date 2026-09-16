const { Router } = require('express');
const router = Router();

const ventasController = require('../controllers/ventas.controller');
const validarCampos = require('../middlewares/validar.middleware');
const {
  crearVentaValidator,
  idValidator,
} = require('../middlewares/ventas.validator');

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: Registro de ventas diarias y control de inventario
 */

/**
 * @swagger
 * /ventas:
 *   get:
 *     summary: Listar todas las ventas
 *     tags: [Ventas]
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 */
router.get('/', ventasController.listar);

/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Obtener una venta por id
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', idValidator, validarCampos, ventasController.obtener);

/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Registrar una nueva venta (descuenta stock automáticamente)
 *     tags: [Ventas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - detalle
 *             properties:
 *               detalle:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productoId
 *                     - cantidad
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                       example: 1
 *                     cantidad:
 *                       type: integer
 *                       example: 3
 *     responses:
 *       201:
 *         description: Venta registrada, stock descontado y total calculado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       400:
 *         description: Stock insuficiente o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', crearVentaValidator, validarCampos, ventasController.crear);

/**
 * @swagger
 * /ventas/{id}:
 *   delete:
 *     summary: Eliminar una venta
 *     tags: [Ventas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Venta eliminada
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', idValidator, validarCampos, ventasController.eliminar);
router.get('/', ventasController.listar);
router.get('/:id', idValidator, validarCampos, ventasController.obtener);
router.post('/', crearVentaValidator, validarCampos, ventasController.crear);
router.delete('/:id', idValidator, validarCampos, ventasController.eliminar);

module.exports = router;