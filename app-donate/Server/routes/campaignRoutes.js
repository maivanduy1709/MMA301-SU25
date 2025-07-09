const express = require("express");
const router = express.Router();

const {
  getCampaigns,
  getCampaignById,
  donateToCampaign,
} = require("../controllers/campaignController");

router.get("/", getCampaigns);
router.get("/:id", getCampaignById);
router.post("/:id/donate", donateToCampaign);

module.exports = router;
