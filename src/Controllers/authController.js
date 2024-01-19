require("../Models/mongoose");
const User = require("../Models/users");
const argon2 = require("argon2");
const {
  // generateAccessToken,
  generateRefreshToken,
  generateLongToken,
} = require("../Utils/authUtils");
const {
  sendResetTokenByEmail,
  generateResetToken,
  validateResetToken,
  sendVerificationEmail,
} = require("../Services/authService");
const {
  userRegistrationSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailRequestSchema,
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
    const profilePicture = `https://api.dicebear.com/7.x/micah/svg?seed=${username}`;

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
      profilePicture,
    });

    const emailToken = generateLongToken();
    user.verifyEmailToken = emailToken;
    user.verifyEmailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const link =
      process.env.NODE_ENV === "production"
        ? `https://unicorn-22up.onrender.com/api/v1/auth/verify-email?token=${emailToken}`
        : `http://localhost:2800/api/v1/auth/verify-email?token=${emailToken}`;

    await user.save();
    await sendVerificationEmail(email, link, username);

    res.status(201).json({
      success: true,
      data: user,
      message:
        "User registration successful, please check your mail to verify your account",
    });

    //send the user a mail
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

const verifyEmail = async (req, res) => {
  try {
    const { error, value } = verifyEmailRequestSchema.validate(req.query);

    if (error)
      return res.status(400).json({
        success: false,
        data: null,
        error: error.details[0].message,
        message: "Email verification failed",
      });

    const redirectURL =
      process.env.NODE_ENV === "development"
        ? `http://localhost:3000/auth/login`
        : `https://useunicon.vercel.app/auth/login`;

    const verifyEmailToken = value.token;

    const user = await User.findOne({
      verifyEmailToken,
      verifyEmailTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .redirect(
          redirectURL + "?success=false&message=Invalid or expired token!"
        );
    }

    user.verifyEmailToken = undefined;
    user.verifyEmailTokenExpiry = undefined;
    user.isVerified = true;

    await user.save();

    return res
      .status(200)
      .redirect(
        redirectURL + "?success=true&message=User Email verified successfully"
      );
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      error: err.message,
      message: null,
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
      return res
        .status(404)
        .json({ success: false, message: "Invalid credential", data: null });
    }

    // Compare the password using Argon2
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credential", data: null });
    }

    if (!user.isVerified)
      return res
        .status(400)
        .json({ success: false, message: "You are not verified", data: null });

    // Generate the access token and refresh token
    //const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken();
    // Store the refresh token in the user document
    user.refreshToken = refreshToken;
    await user.save();

    // Combine access and refresh tokens into a single cookie
    const combinedToken = `${refreshToken}`;

    // Set a single cookie with the combined token

    res.cookie("authToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 604800000,
      path: "/",
    });

    // Send both tokens in the response
    return res.status(200).json({
      success: true,
      data: {
        user,
        // accessToken,
        refreshToken,
      },
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
    const refreshToken = req.headers.authorization?.split(" ")[1];

    // Invalidate or clear the access token
    invalidateAccessToken(refreshToken);

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
  verifyEmail,
};
