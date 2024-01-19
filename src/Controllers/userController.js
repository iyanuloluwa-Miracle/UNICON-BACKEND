require("../Models/mongoose");
const User = require("../Models/users");
const argon2 = require("argon2");

const {
  userFindByIdRequestSchema,
  searchUserRequestSchema,
  updateUserRequestSchema,
  updateUserRequestSchema2,
  deleteUserRequestSchema,
} = require("./../Validators/users");

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find();

    return res.status(200).json({
      success: true,
      data: allUsers,
      message: "All users fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { error, value } = userFindByIdRequestSchema.validate(req.params);

    if (error)
      return res.status(400).json({
        success: false,
        data: null,
        message: error.details[0].message,
      });

    const user = await User.findById(value.id);

    return res.status(200).json({
      success: true,
      data: user,
      message: "User fetched successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { error, value } = searchUserRequestSchema.validate(req.query);
    if (error)
      return res.status(400).json({
        success: false,
        data: null,
        message: error.details[0].message,
      });

    const { searchTerm } = value;

    const user = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { username: { $regex: searchTerm, $options: "i" } },
      ],
    });

    if (user.length == 0) return response(res, 404, "No user found", []);

    if (!user) return response(res, 400, "Couldn't get user");

    return response(res, 200, "User fetched successfully", user);
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { error, value } = updateUserRequestSchema.validate(req.body);
    const { error: paramsError, value: paramsValue } =
      updateUserRequestSchema2.validate(req.params);

    if (error)
      return res.status(400).json({
        success: false,
        data: null,
        message: error.details[0].message,
      });

    if (paramsError)
      return res.status(400).json({
        success: false,
        data: null,
        message: paramsError.details[0].message,
      });

    const userId = paramsValue.id;
    const existingUser = await User.findById(userId);
    if (!existingUser)
      return res
        .status(404)
        .json({ success: false, data: null, message: "User not found" });

    //check if email has been taken by another user
    const { username, email } = requestBodyValue;
    if (email && email !== existingUser.email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) return response(res, 400, "Email already taken");
    }

    // Check if username has been taken by another user
    if (username && username !== existingUser.username) {
      const existingUsernameUser = await User.findOne({ username });
      if (existingUsernameUser) {
        return response(
          res,
          400,
          "Username has already been taken by another user"
        );
      }
    }

    const options = { new: true, runValidators: true };
    const updatedUser = await User.findByIdAndUpdate(id, value, options);

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const { error, value } = deleteUserRequestSchema.validate(req.params);
  if (error)
    return res.status(400).json({
      success: false,
      data: null,
      message: error.details[0].message,
    });

  const deleteUser = await User.findByIdAndDelete(value.id);
  if (!deleteUser) return response(res, 404, "User with given id not found!");

  return response(res, 200, "User deleted successfully");
};

module.exports = {
  getAllUsers,
  getUserById,
  searchUsers,
  updateUser,
  deleteUser,
};
