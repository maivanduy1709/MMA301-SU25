const express = require("express");
const cors = require("cors");
const fs = require("fs");
const mongoose = require("mongoose");
const Transaction = require('./model/Transaction');
const transactionRoutes = require('./routes/transactionRoutes');

require("dotenv").config();

// Khởi tạo server
const server = express();
server.use(cors());
server.use(express.json());

// Kết nối MongoDB
mongoose
  .connect(`${process.env.URL}${process.env.DB_NAME}`)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("🔍 Đang dùng DB:", process.env.DB_NAME);
  })
  .catch((error) => console.log("❌ MongoDB error:", error));

// Import routes
const authRoute = require("./routes/authRoute");
const supportedPeopleRoute = require("./routes/supportedPeople");
const donationRoutes = require("./routes/donationRoutes");

// Sử dụng routes
server.use("/api/auth", authRoute);
server.use("/api/supported-people", supportedPeopleRoute);
server.use("/api", donationRoutes);
server.use("/api", transactionRoutes); // Gắn vào /api/transactions

// Mặc định root
server.get("/", (req, res) => {
  res.send("Server is running 🚀");
});


server.post("/hooks/sepay-payment", async (req, res) => {
  const data = req.body;

  console.log("📥 Nhận Webhook:", data);

  try {
    // Kiểm tra trùng mã giao dịch
    const exists = await Transaction.findOne({ "raw.referenceCode": data.referenceCode });
    if (exists) {
      console.log("⚠️ Trùng mã giao dịch, bỏ qua:", data.referenceCode);
      return res.status(200).send({ status: "Trùng mã, đã bỏ qua" });
    }

    const transaction = new Transaction({
      accountNumber: data?.account,
      amount: data?.amount,
      type: data?.type || "Tiền vào",
      time: new Date(data?.time || Date.now()),
      raw: data
    });

    await transaction.save();
    console.log("✅ Giao dịch đã được lưu");

    res.status(200).send({ status: "Đã lưu giao dịch" });
  } catch (err) {
    console.error("❌ Lỗi khi lưu giao dịch:", err);
    res.status(500).send({ status: "Lỗi server", error: err.message });
  }
});


// Lắng nghe server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server chạy tại http://${HOST}:${PORT}`);
});
