const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetCodeEmail = async (to, code) => {
  await transporter.sendMail({
    from: `"App Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Mã xác nhận đặt lại mật khẩu",
    text: `Mã xác nhận của bạn là: ${code}`,
    html: `<p>Mã xác nhận đặt lại mật khẩu của bạn là: <strong>${code}</strong></p>`,
  });
};