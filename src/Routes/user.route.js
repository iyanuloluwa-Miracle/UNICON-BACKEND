const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/userController');
const { verifyToken } = require("../Utils/authUtils");
const { validateEvent } = require("../Validators/users");

// Route to get all users
router.get('/users', verifyToken, validateEvent, UserController.getAllUsers);

// Route to get a user by ID
router.get('/users/:id', verifyToken, validateEvent, UserController.getUserById);

// Route to search for users
router.get('/users/search', verifyToken, validateEvent, UserController.searchUsers);

// Route to update a user
router.put('/users/:id', verifyToken, validateEvent, UserController.updateUser);

// Route to delete a user
router.delete('/users/:id',verifyToken, validateEvent,UserController.deleteUser);

module.exports = router;
