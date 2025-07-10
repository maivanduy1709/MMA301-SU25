const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');

router.post('/webhook/sepay', donationController.receiveWebhook);
router.get('/donations', donationController.getAllDonations);
router.get('/donations/:personId', donationController.getByPersonId);

module.exports = router;