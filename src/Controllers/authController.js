require("../Models/mongoose");
const User = require("../Models/users");
const argon2 = require("argon2");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../Utils/authUtils");
const {
  sendResetTokenByEmail,
  generateResetToken,
  validateResetToken,
} = require("../Services/authService");
const {
  userRegistrationSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../Validators/validation");

// Controller for user sign-up
const signupUser = async (req, res) => {
  try {
    const { error, value } = userRegistrationSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.details[0].message,
        message: "User registration failed",
      });
    }

    const { username, email, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "User already exists",
      });
    }

    // Hash the password using Argon2
    const hashedPassword = await argon2.hash(password);

    // Create a new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    res.status(201).json({
      success: true,
      data: user,
      message: "User registration successful",
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      success: false,
      data: null,
      error: err.message,
      message: "User registration failed",
    });
  }
};
const signInUser = async (req, res) => {
  try {
    const { error, value } = userLoginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.details[0].message,
        message: "Login failed",
      });
    }

    const { email, password } = value;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Compare the password using Argon2
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Generate the access token and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    // Store the refresh token in the user document
    user.refreshToken = refreshToken;
    await user.save();

    // Combine access and refresh tokens into a single cookie
    const combinedToken = `${accessToken}.${refreshToken}`;

    // Set a single cookie with the combined token
    res.cookie("authToken", combinedToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Send both tokens in the response
    res.status(200).json({
      success: true,
      data: { user, accessToken },
      error: null,
      message: "Login Successful",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      data: null,
      error: err.message,
      message: null,
    });
  }
};

// Controller for user logout
const logoutUser = async (req, res) => {
  try {
    // Extract token from Authorization header
    const accessToken = req.headers.authorization?.split(" ")[1];

    // Invalidate or clear the access token
    invalidateAccessToken(accessToken);

    res.status(200).json({
      success: true,
      data: null,
      message: "Logged out successfully!",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      data: null,
      error: err.message,
      message: null,
    });
  }
};

// Controller for forgot password
const forgotPassword = async (req, res) => {
  try {
    const { error, value } = forgotPasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.details[0].message,
        message: "Password reset email failed",
      });
    }

    const { email } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Generate a reset token and save its hash in the user document
    const { token, hash } = await generateResetToken();
    user.resetToken = token;
    user.resetTokenHash = hash;
    user.resetTokenExpiry = Date.now() + 3600000; // Token expiry time (1 hour)
    await user.save();

    // Send the reset token via email
    await sendResetTokenByEmail(user.email, token);

    res.status(200).json({
      success: true,
      data: { email: user.email },
      message: "Password reset email sent",
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Controller for reset password
const resetPassword = async (req, res) => {
  try {
    const { error, value } = resetPasswordSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.details[0].message,
        message: "Password reset failed",
      });
    }

    const { email, resetToken, newPassword } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Validate the reset token
    if (!validateResetToken(user.resetTokenHash, resetToken)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired reset token" });
    }

    // Reset the user's password
    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;
    user.resetToken = null; // Clear the reset token after use
    user.resetTokenHash = null; // Clear the reset token hash after use
    user.resetTokenExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      data: { email: user.email },
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

module.exports = {
  signupUser,
  signInUser,
  logoutUser,
  forgotPassword,
  resetPassword,
};
