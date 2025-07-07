const express = require("express");
const cors = require("cors");
require("dotenv").config();
require('./routes/supportedPeople');

const User = require("./model/User");

const server = express();
server.use(cors());
server.use(express.json());

const mongoose = require("mongoose");
mongoose
  .connect(`${process.env.URL}${process.env.DB_NAME}`)
  .then(() => {
    console.log(" MongoDB connected");
     console.log('🔍 Đang dùng DB:', process.env.DB_NAME);
  })
  .catch((error) => console.log("❌ MongoDB error:", error));

const authRoute = require("./routes/authRoute");
const supportedPeopleRoute = require("./routes/supportedPeople");



server.use("/api/auth", authRoute);
server.use('/api/supported-people', supportedPeopleRoute)

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0"; // đúng chuẩn

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
