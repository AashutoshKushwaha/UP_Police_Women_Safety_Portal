const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const driverController = require('../controllers/driverController');

router.post('/submit', authRequired(['driver']), driverController.submitData);
router.get('/my', authRequired(['driver']), driverController.getMySubmission);
router.get('/qr/:id', authRequired(['driver']), driverController.getQr);

router.get('/data/:submissionId', driverController.getDriverDetailsBySubmissionId);
module.exports = router;
//Aashutosh Kushwaha ,IIT KANPUR