const { Register } = require("../controllers/authController");
const express = require("express");
const router = express.Router();
router.post("/register", Register);
module.exports = router;
