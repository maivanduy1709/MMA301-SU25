const User = require("../model/User");
const Register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Tạo user mới
    const newUser = await User.create({ name, email, password });
    const { password: pw, ...userData } = newUser._doc;
    res
      .status(201)
      .json({ message: "User registered successfully", user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { Register };
