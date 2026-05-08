const router  = require('express').Router();
const ctrl    = require('../controllers/habitController');
const protect = require('../middleware/auth');

router.use(protect);

router.get   ('/',             ctrl.getHabits);
router.post  ('/',             ctrl.createHabit);
router.post  ('/:id/checkin',  ctrl.checkIn);
router.delete('/:id',          ctrl.deleteHabit);

module.exports = router;
