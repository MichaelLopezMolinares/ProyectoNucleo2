const { Router } = require('express');
const scheduleViewerService = require('../service/scheduleViewer.service');

const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    res.json({ success: true, data: await scheduleViewerService.getFullSchedule(req.params.id) });
  } catch (e) { next(e); }
});

router.get('/:id/matrix', async (req, res, next) => {
  try {
    res.json({ success: true, data: await scheduleViewerService.getScheduleMatrix(req.params.id) });
  } catch (e) { next(e); }
});

router.get('/:id/teacher/:teacherId', async (req, res, next) => {
  try {
    const { id, teacherId } = req.params;
    res.json({ success: true, data: await scheduleViewerService.getScheduleByTeacher(id, teacherId) });
  } catch (e) { next(e); }
});

router.get('/:id/group/:groupId', async (req, res, next) => {
  try {
    const { id, groupId } = req.params;
    res.json({ success: true, data: await scheduleViewerService.getScheduleByGroup(id, groupId) });
  } catch (e) { next(e); }
});

router.get('/:id/classroom/:classroomId', async (req, res, next) => {
  try {
    const { id, classroomId } = req.params;
    res.json({ success: true, data: await scheduleViewerService.getScheduleByClassroom(id, classroomId) });
  } catch (e) { next(e); }
});

module.exports = router;
