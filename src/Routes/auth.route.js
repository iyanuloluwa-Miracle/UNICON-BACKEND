const router = require("express").Router();
const userController = require("../Controllers/authController");



router.get("/", async (req, res, next) => {
  res.send({ message: "Squadco api is working 🚀" });
});

// Define user routes
router.post("/auth/signup", userController.signupUser);
router.post("/auth/login", userController.signInUser);
router.post("/auth/logout", userController.logoutUser);
router.post('/auth/forgot-password', userController.forgotPassword);
router.post('/auth/reset-password', userController.resetPassword);




module.exports = router;
