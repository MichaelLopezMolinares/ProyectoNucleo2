const { Router } = require('express');
const classroomService = require('../service/classroom.service');
const { authorize } = require('../../../core/middlewares/auth');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, data: await classroomService.getAllClassrooms() });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await classroomService.getClassroomById(req.params.id) });
  } catch (e) { next(e); }
});

router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    res.status(201).json({ success: true, data: await classroomService.createClassroom(req.body) });
  } catch (e) { next(e); }
});

router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    res.json({ success: true, data: await classroomService.updateClassroom(req.params.id, req.body) });
  } catch (e) { next(e); }
});

module.exports = router;
