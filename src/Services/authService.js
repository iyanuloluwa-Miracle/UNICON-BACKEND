// services/authService.js
const nodemailer = require("nodemailer");
const argon2 = require("argon2");
const User = require("../Models/users");

const hashFunction = async (data) => {
  return argon2.hash(data);
};

const generateResetToken = async () => {
  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const hash = await hashFunction(token);
  return { token, hash };
};

const validateResetToken = (savedTokenHash, inputToken) => {
  return argon2.verify(savedTokenHash, inputToken);
};

const sendResetTokenByEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Here is your password reset Password: ${resetToken}\n\nPlease copy this token and use it in the password reset form on our website.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendVerificationEmail = async (email, verificationLink, username) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Unicon Account Verification",
      text: `
       Dear ${username}, thank you for creating an account with Unicon. Kindly verify your email address by clicking on the link below.  
       ${verificationLink}             
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = {
  generateResetToken,
  validateResetToken,
  sendResetTokenByEmail,
  sendVerificationEmail,
};
