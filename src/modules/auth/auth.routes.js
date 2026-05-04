/**
 * Rutas del módulo Auth
 */
const { Router } = require('express');
const { AuthController } = require('./controllers/auth.controller');
const { loginValidation, registerValidation } = require('./validations/auth.validation');
const { authMiddleware, roleMiddleware } = require('./middleware/auth.middleware');

const router = Router();
const controller = new AuthController();

// Públicas
router.post('/login', loginValidation, controller.login);
router.post('/register', registerValidation, controller.register);

// Protegidas (ADMIN)
router.get('/users', authMiddleware, roleMiddleware('ADMIN'), controller.findAll);
router.get('/users/:id', authMiddleware, roleMiddleware('ADMIN'), controller.findById);
router.put('/users/:id', authMiddleware, roleMiddleware('ADMIN'), controller.update);
router.delete('/users/:id', authMiddleware, roleMiddleware('ADMIN'), controller.delete);

module.exports = router;
