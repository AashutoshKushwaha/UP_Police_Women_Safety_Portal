console.log('Admin routes loaded');
const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.post('/create', authRequired(['admin']), adminController.createUser);
router.get('/users', authRequired(['admin']), adminController.getUsers);

router.get('/submissions', authRequired(['admin']), adminController.getSubmissions);
router.post('/assign/:submissionId', authRequired(['admin']), adminController.assignToStation);
router.post('/verify/:submissionId', authRequired(['admin']), adminController.handleVerification);
router.get('/driver-database', authRequired(['admin']), adminController.searchDrivers);
router.get('/driver-details/:driverId', authRequired(['admin']), adminController.getDriverDetails);
module.exports = router;
//Aashutosh Kushwaha ,IIT KANPUR