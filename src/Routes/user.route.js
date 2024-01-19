const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/userController');
const { verifyToken } = require("../Utils/authUtils");

// Route to get all users
router.get('/users', verifyToken, UserController.getAllUsers);

// Route to get a user by ID
router.get('/users/:id', verifyToken, UserController.getUserById);

// Route to search for users
router.get('/users/search', verifyToken, UserController.searchUsers);

// Route to update a user
router.put('/users/:id', verifyToken, UserController.updateUser);

// Route to delete a user
router.delete('/users/:id',verifyToken,UserController.deleteUser);

module.exports = router;
