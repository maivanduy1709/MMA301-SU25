const express = require("express");
const router = express.Router();
const Transaction = require("../model/Transaction");

// ✅ API: Lấy toàn bộ giao dịch
// Endpoint: GET /api/transactions
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.aggregate([
      {
        $sort: { createdAt: -1 }, // Ưu tiên bản mới nhất
      },
      {
        $group: {
          _id: "$raw.referenceCode",
          doc: { $first: "$$ROOT" }, // Lấy bản đầu tiên theo group (mới nhất)
        },
      },
      {
        $replaceRoot: { newRoot: "$doc" }, // Trả về đúng format
      },
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy giao dịch:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});


module.exports = router;
