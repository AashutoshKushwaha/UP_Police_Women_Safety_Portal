const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const officerController = require('../controllers/officerController');

router.post('/scan', authRequired(['officer']), officerController.scanQrAndFetchDriverData);
router.get('/audit/:submissionId', authRequired(['officer', 'admin']), officerController.getAuditTrail);

module.exports = router;
//Aashutosh Kushwaha ,IIT KANPUR