const router  = require('express').Router();
const ctrl    = require('../controllers/analyticsController');
const protect = require('../middleware/auth');

router.use(protect);
router.get('/', ctrl.getAnalytics);

module.exports = router;
