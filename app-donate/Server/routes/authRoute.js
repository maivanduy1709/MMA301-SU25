const { Register, Login } = require("../controllers/authController");
const express = require("express");
const router = express.Router();
router.post("/register", Register);
router.post("/login", Login);
module.exports = router;
