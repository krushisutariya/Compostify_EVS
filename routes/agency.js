const express = require('express');
const router = express.Router();
const passport = require('passport');
const agencyController = require('../controller/agency');

router.get('/', passport.checkAgency, agencyController.queue);
router.post('/confirm-supplies', passport.checkAgency, agencyController.cofirm_supplies);
router.post('/reject-request', passport.checkAgency, agencyController.reject_reward);
router.get('/history', passport.checkAgency, agencyController.history);
router.post('/add-reward', passport.checkAgency, agencyController.add_reward);
router.post('/delete-reward', authenticateAgencyToken, agencyController.delete_reward);
router.get('/rewards', passport.checkAgency, agencyController.rewards);

module.exports = router;