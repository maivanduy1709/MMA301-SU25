const e = require("express");
const express = require("express");
require("dotenv").config();

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
