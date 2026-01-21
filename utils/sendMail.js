const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true only for 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

exports.sendMail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"Nursing Exam System" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
    });
};
