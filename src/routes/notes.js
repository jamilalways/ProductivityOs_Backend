const router  = require('express').Router();
const ctrl    = require('../controllers/noteController');
const protect = require('../middleware/auth');

router.use(protect);

router.get   ('/',    ctrl.getNotes);
router.post  ('/',    ctrl.createNote);
router.patch ('/:id', ctrl.updateNote);
router.delete('/:id', ctrl.deleteNote);

module.exports = router;
