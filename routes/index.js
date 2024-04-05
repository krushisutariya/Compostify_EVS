const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controller/index');
const dotenv = require('dotenv');
dotenv.config();

router.use('/donor', require('./donor'));
router.use('/agency', require('./agency'));
router.use('/ngo', require('./ngo'));
router.get('/', controller.home);
router.post('/signup', controller.signup);
router.post('/create_user', controller.create_user);
router.post('/create-session', controller.create_session);
router.get('/profile', passport.checkAuthentication, controller.profile);
router.post('/update-profile', passport.checkAuthentication, controller.update_profile);
router.get('/guidelines', controller.guidelines)
router.get('/getTomTomApiKey', passport.checkAuthentication, (req, res) => {
    return res.status(200).json({ message: 'Api key sent successfully!', apiKey: process.env.API_KEY });
});
router.post('/logout', controller.logout);

module.exports = router;