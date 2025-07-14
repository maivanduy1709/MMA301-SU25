const {
  Register,
  Login,
  forgotPassword,
  verifyCode,
  resetPassword,
} = require("../controllers/authController");
const express = require("express");
const router = express.Router();
router.post("/register", Register);
router.post("/login", Login);

// send mail
router.post("/forgot-password", forgotPassword);
router.post("/verify-code", verifyCode);
router.post("/reset-password", resetPassword);
module.exports = router;