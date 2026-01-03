const router = require('express').Router();
const { registerDriver, login } = require('../controllers/userController');
const { checkLockout } = require('../middleware/lockout');

router.post('/register', registerDriver); // Driver signup only
router.post('/login', checkLockout, login);

module.exports = router;
//Aashutosh Kushwaha ,IIT KANPUR