const { Router } = require('express');
const scheduleEngineService = require('../service/scheduleEngine.service');
const { authorize } = require('../../../core/middlewares/auth');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, data: await scheduleEngineService.getAllSchedules() });
  } catch (e) { next(e); }
});

router.post('/', authorize('admin', 'coordinator'), async (req, res, next) => {
  try {
    const data = await scheduleEngineService.createScheduleDraft(req.body);
    res.status(201).json({ success: true, data });
  } catch (e) { next(e); }
});

router.post('/:id/generate', authorize('admin', 'coordinator'), async (req, res, next) => {
  try {
    const result = await scheduleEngineService.generateSchedule(req.params.id, req.body);
    res.json({ success: true, data: result });
  } catch (e) { next(e); }
});

router.post('/:id/publish', authorize('admin'), async (req, res, next) => {
  try {
    const data = await scheduleEngineService.publishSchedule(req.params.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/:id/validate', authorize('admin', 'coordinator'), async (req, res, next) => {
  try {
    const data = await scheduleEngineService.validateExistingSchedule(req.params.id);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

module.exports = router;
