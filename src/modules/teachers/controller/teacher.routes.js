const { Router } = require('express');
const { body, param } = require('express-validator');
const teacherService = require('../service/teacher.service');
const { validationResult } = require('express-validator');
const { ValidationError } = require('../../../core/errors/AppError');
const { authorize } = require('../../../core/middlewares/auth');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await teacherService.getAllTeachers();
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const data = await teacherService.getTeacherById(req.params.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.post('/', authorize('admin'),
  [
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('email').isEmail(),
    body('contractType').isIn(['full_time', 'part_time', 'contractor']),
    body('maxHoursPerWeek').isInt({ min: 1, max: 40 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationError('Datos inválidos', errors.array());
      const data = await teacherService.createTeacher(req.body);
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  }
);

router.put('/:id/availability', authorize('admin', 'coordinator'),
  async (req, res, next) => {
    try {
      const data = await teacherService.setTeacherAvailability(req.params.id, req.body.slots);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  }
);

module.exports = router;
