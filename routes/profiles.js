const profilesCtrl = require('../controllers/profiles');

// POST /profiles (create a profile -after sign up)
router.post('/', profilesCtrl.create);

module.exports = router; 