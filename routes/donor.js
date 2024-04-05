const express = require('express');
const router = express.Router();
const passport = require('passport');
const donorController = require('../controller/donor');

router.get('/nearby-agency/:role', passport.chechDonor, donorController.nearby_agency);
router.get('/reward-store', passport.chechDonor, donorController.reward_store);
router.post('/redeem-reward', passport.chechDonor, donorController.reedem_reward);
router.post('/donate-supplies', passport.chechDonor, donorController.donate_supplies);

module.exports = router;