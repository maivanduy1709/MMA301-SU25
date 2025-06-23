const { Register, Longin } = require("../controllers/authController");
const express = require("express");
const router = express.Router();
router.post("/register", Register);
router.post("/login", Longin);
module.exports = router;
