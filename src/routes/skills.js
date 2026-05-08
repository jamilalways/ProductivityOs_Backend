const router  = require('express').Router();
const ctrl    = require('../controllers/skillController');
const protect = require('../middleware/auth');

router.use(protect);

router.get   ('/',                          ctrl.getSkills);
router.post  ('/',                          ctrl.createSkill);
router.patch ('/:id',                       ctrl.updateSkill);
router.patch ('/:id/topics/:topicId/toggle',ctrl.toggleTopic);
router.delete('/:id/topics/:topicId',       ctrl.deleteTopic);
router.delete('/:id',                       ctrl.deleteSkill);

module.exports = router;
