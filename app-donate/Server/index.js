const e = require("express");
const express = require("express");
require("dotenv").config();

const User = require("./model/User");

// tao server
const server = express();
server.use(express.json());

const mongoose = require("mongoose");
mongoose
  .connect(`${process.env.URL}${process.env.DB_NAME}`)
  .then(() => {
    console.log("connect success");
  })
  .catch((error) => console.log(error));

// test api
// server.get("/User", async (req, res) => {
//   const users = await User.find();
//   res.json(users);
// });

// dinh tuyen router auth
const authRoute = require("./routes/authRoute");
server.use("/api/auth", authRoute);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "localhost";

server.listen(3001, "localhost", () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
