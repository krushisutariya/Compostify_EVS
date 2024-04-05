const express = require('express');
const router = express.Router();
const passport = require('passport');
const donorController = require('../controller/donor');

router.get('/nearby-agency/:role', passport.checkDonor, donorController.nearby_agency);
router.get('/reward-store', passport.checkDonor, donorController.reward_store);
router.post('/redeem-reward', passport.checkDonor, donorController.redeem_reward);
router.post('/donate-supplies', passport.checkDonor, donorController.donate_supplies);

module.exports = router;