const User = require("../model/User");
const bcrypt = require("bcrypt");
const { sendResetCodeEmail } = require("../utils/sendEmail");
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

const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    const { password: pw, ...userData } = user._doc;
    return res
      .status(200)
      .json({ message: "Login successfully", user: userData });
  } catch (error) {
    return res.status(500).json({ message: "Error on server", error });
  }
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // mã 6 số

    user.resetCode = code;
    user.resetCodeExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 phút
    await user.save();

    await sendResetCodeEmail(email, code);

    res.json({ message: "Đã gửi mã xác nhận về email" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.resetCode !== code)
      return res.status(400).json({ message: "Mã không chính xác" });

    if (user.resetCodeExpiration < new Date())
      return res.status(400).json({ message: "Mã đã hết hạn" });

    res.json({ message: "Xác minh mã thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    const hashed = await bcrypt.hash(newPassword, 10); // mã hóa
    user.password = hashed;
    user.resetCode = null;
    user.resetCodeExpiration = null;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};

module.exports = { Register, Login, forgotPassword, verifyCode, resetPassword };
