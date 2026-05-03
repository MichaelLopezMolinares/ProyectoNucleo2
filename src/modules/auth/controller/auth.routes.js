const { Router } = require('express');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');
const authService = require('../service/auth.service');
const { authenticate } = require('../../../core/middlewares/auth');
const { ValidationError } = require('../../../core/errors/AppError');

const router = Router();

router.post('/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationError('Datos inválidos', errors.array());
      const data = await authService.login(req.body);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
);

router.post('/register',
  [body('email').isEmail(), body('password').isLength({ min: 8 }), body('username').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationError('Datos inválidos', errors.array());
      const data = await authService.register(req.body);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }
);

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await authService.getProfile(req.user.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

module.exports = router;
