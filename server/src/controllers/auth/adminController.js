import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModels.js";

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  //attempt to find and delete user
  const user = await User.findByIdAndDelete(id);

  try {
    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.status(404).json({ message: "This user has been deleted" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ messag: "Cannot delete user, internal server error" });
  }
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  if (!users) {
    res.status(404).json({ message: "Users could not be found" });
  }

  res.status(200).json({ message: "Here are all the users", users });
});

//test commit
