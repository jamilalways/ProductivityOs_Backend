const router  = require('express').Router();
const ctrl    = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);

// Protected routes
router.get  ('/me',     protect, ctrl.getMe);
router.patch('/update', protect, ctrl.updateProfile);

module.exports = router;
