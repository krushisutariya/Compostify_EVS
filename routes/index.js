const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controller/index');
const dotenv = require('dotenv');
dotenv.config();

router.get('/', controller.home);
router.get('/sign-up', controller.sign_up);
router.get('/sign-in', controller.sign_in);
router.post('/create-user', controller.create_user);
router.post('/create-session', passport.authenticate(
    'local',
    { failureRedirect: '/sign-in' }
),controller.create_session);
router.get('/profile', passport.checkAuthentication, controller.profile);
router.post('/update-profile', passport.checkAuthentication, controller.update_profile);
router.get('/guidelines', controller.guidelines);
router.get('/about-us', controller.about_us)
router.get('/contact',  controller.contact);
router.get('/getTomTomApiKey', passport.checkAuthentication, (req, res) => {
    return res.status(200).json({ message: 'Api key sent successfully!', apiKey: process.env.API_KEY });
});
router.get('/sign-out', controller.logout);

router.use('/donor', require('./donor'));
router.use('/agency', require('./agency'));
router.use('/ngo', require('./ngo'));

module.exports = router;