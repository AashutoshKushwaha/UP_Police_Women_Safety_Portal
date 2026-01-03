const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const stationController = require('../controllers/stationController');

router.get('/assignments', authRequired(['station']), stationController.getAssignments);
router.post('/verify/:submissionId', authRequired(['station']), stationController.verifySubmission);
router.get('/history', authRequired(['station']), stationController.getHistory);

module.exports = router;
//Aashutosh Kushwaha ,IIT KANPUR