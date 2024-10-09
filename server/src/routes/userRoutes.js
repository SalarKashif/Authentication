import express from "express";
import {
  protect,
  adminMiddleware,
  creatorMiddleware,
} from "../middleware/authMiddleware.js";

import {
  logoutUser,
  registerUser,
  loginUser,
  getUser,
  updateUser,
} from "../controllers/auth/userController.js";

import {
  deleteUser,
  getAllUsers,
} from "../controllers/auth/adminController.js";

const router = express.Router();

router
  .post("/register", registerUser) //route for registering users
  .post("/login", loginUser) //route for logging in users
  .get("/logout", logoutUser) //route for logging out users
  .get("/user", protect, getUser) //failsafe route to get users
  .patch("/user", protect, updateUser); //route to update user information

//Admin Route
router.delete("/admin/users/:id", protect, adminMiddleware, deleteUser);

//Get all Users route
router.get("/users", protect, creatorMiddleware, getAllUsers);

export default router;
