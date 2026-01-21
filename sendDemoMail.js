const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "mail.smsinstitute.com",
  port: 587,
  secure: false,
  auth: { user: "noreply@smsinstitute.com", pass: "74,;,SeMeNS" }
});

transporter.sendMail({
  from: '"SMS Skills & Trades Institute" <noreply@smsinstitute.com>',
  to: "abhayshah013@gmail.com",
  subject: "Test OTP",
  text: "This is a test OTP email"
}).then(console.log).catch(console.error);
