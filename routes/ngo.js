const express = require('express');
const router = express.Router();
const passport = require('passport');
const ngoController = require('../controller/ngo');

router.get('/requests', passport.checkNgo, ngoController.requests);

module.exports = router;