const express = require("express");
const cors = require("cors");
const fs = require("fs");
const mongoose = require("mongoose");
const Transaction = require('./model/Transaction');
const transactionRoutes = require('./routes/transactionRoutes');

require("dotenv").config();

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
const campaignRoutes = require("./routes/campaigns");
const categoryRoutes = require("./routes/categories");
const eventRoutes = require("./routes/events");
const userRoutes = require("./routes/users");
const tagRoutes = require("./routes/tags");
const dashboardRoutes = require('./routes/dashboard');
const organizationRoutes = require('./routes/organizations');
const feedRoutes = require('./routes/feed');

// Sử dụng routes
server.use("/api/auth", authRoute);
server.use("/api/supported-people", supportedPeopleRoute);
server.use("/api", donationRoutes);
server.use("/api", transactionRoutes); // Giao dịch

// Thêm đủ 5 nhóm API từ hệ thống thiện nguyện
server.use("/api/campaigns", campaignRoutes);
server.use("/api/categories", categoryRoutes);
server.use("/api/events", eventRoutes);
server.use("/api/users", userRoutes);
server.use("/api/tags", tagRoutes);
server.use('/api/dashboard', dashboardRoutes);
server.use('/api/organizations', organizationRoutes);
server.use('/api/feed', feedRoutes);
// Mặc định root
server.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Webhook xử lý thanh toán
server.post("/hooks/sepay-payment", async (req, res) => {
  const data = req.body;
  console.log("📥 Nhận Webhook:", data);

  try {
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

// Khởi động server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server chạy tại http://${HOST}:${PORT}`);
});
