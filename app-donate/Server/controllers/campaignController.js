// controllers/campaignController.js
const Campaign = require("../model/Campaign");

const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find(); // lấy tất cả chiến dịch
    res.status(200).json(campaigns);
  } catch (error) {
    console.error("❌ Error fetching campaigns from database:", error.message);
    res.status(500).json({ error: "Lỗi khi lấy danh sách chiến dịch" });
  }
};

const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ error: "Không tìm thấy chiến dịch" });
    res.status(200).json(campaign);
  } catch (error) {
    console.error("❌ Error fetching campaign by ID:", error.message);
    res.status(500).json({ error: "Lỗi khi lấy chiến dịch" });
  }
};

const donateToCampaign = async (req, res) => {
  try {
    const { amount } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign)
      return res.status(404).json({ error: "Không tìm thấy chiến dịch" });

    campaign.current_amount += amount;
    await campaign.save();

    res.status(200).json({ message: "Đã quyên góp thành công", campaign });
  } catch (error) {
    console.error("❌ Error donating to campaign:", error.message);
    res.status(500).json({ error: "Lỗi khi quyên góp" });
  }
};

module.exports = {
  getCampaigns,
  getCampaignById,
  donateToCampaign,
};
