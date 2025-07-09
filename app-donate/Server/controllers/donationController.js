const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const mongoose = require("mongoose");

// Create donation
exports.createDonation = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      campaign_id,
      amount,
      donor_name,
      donor_email,
      donor_phone,
      message,
    } = req.body;

    // Validate campaign exists
    const campaign = await Campaign.findById(campaign_id).session(session);
    if (!campaign) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy chiến dịch",
      });
    }

    // Check campaign is active
    if (campaign.status !== "active") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Chiến dịch không còn hoạt động",
      });
    }

    // Create donation
    const donation = new Donation({
      campaign_id,
      amount: parseInt(amount),
      donor_name: donor_name || "Ẩn danh",
      donor_email,
      donor_phone,
      message,
      status: "completed",
    });

    await donation.save({ session });

    // Update campaign amounts
    await Campaign.findByIdAndUpdate(
      campaign_id,
      {
        $inc: {
          current_amount: parseInt(amount),
          total_donors: 1,
        },
        updated_at: Date.now(),
      },
      { session }
    );

    // Get updated campaign
    const updatedCampaign = await Campaign.findById(campaign_id).session(
      session
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Quyên góp thành công",
      data: {
        donation,
        campaign: updatedCampaign,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: "Lỗi quyên góp",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Get donations for campaign
exports.getDonationsByCampaign = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const donations = await Donation.find({
      campaign_id: req.params.campaignId,
      status: "completed",
    })
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await Donation.countDocuments({
      campaign_id: req.params.campaignId,
      status: "completed",
    });

    res.json({
      success: true,
      data: donations,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(total / limit),
        total_donations: total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
