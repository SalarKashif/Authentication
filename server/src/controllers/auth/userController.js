import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModels.js";
import generateToken from "../../helpers/generateJWTToken.js";
import bcrypt from "bcrypt";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //validation
  if (!name || !email || !password) {
    //400 bad request
    return res
      .status(400)
      .json({ message: "invalid params...all fields are required" });
  }

  //Checks password length
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  //check if user already exists
  const userExists = await User.findOne({ email: email }).exec();

  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  //create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  //generate token with user id
  const token = generateToken(user._id);

  //send back user and token in response to a valid request
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: true,
    secure: true,
  });

  if (user) {
    //destructure
    const { _id, name, email, role, photo, bio, isVerified } = user;

    //created
    res.status(201).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

/**
 * User Login callback function
 * Parses HTTP request body for parameters
 * @email - email parameters passed in HTTP request body
 * @password - password parameter passed in HTTP request body
 */
export const loginUser = asyncHandler(async (req, res) => {
  //get email and password from request body
  const { email, password } = req.body;

  //validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "You will need to fill out all required parameters" });
  }

  const userExists = await User.findOne({ email: email }).exec();

  if (!userExists) {
    return res.status(400).json({ message: "User not found, sign up!" });
  }

  //check if password matches the one in database
  const isMatch = await bcrypt.compare(password, userExists.password);

  //checks to see if password matches
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateToken(userExists._id);

  if (userExists && isMatch) {
    const { _id, name, email, role, photo, bio, isVerified } = userExists;

    //send token back in cookie

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: true,
      secure: true,
    });

    //send back user result to client
    res.status(200).json({
      message: "Successful login",
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({ message: "Invalid user credentials" });
  }
});

/**
 * logoutUser callback function
 * This function is accessed via a Get request to "api/v1/logout"
 * No params need to be passed
 */
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({ message: "User has been logged out" });
});

/**
 * getUser function
 */

export const getUser = asyncHandler(async (req, res) => {
  //get user id from token, EXCLUDE password
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

/**
 * updateUser function()
 *
 */

export const updateUser = asyncHandler(async (req, res) => {
  //get user details from token ----> protect middleware
  const user = await User.findById(req.user._id);

  if (user) {
    //user properties to update
    const { name, bio, photo } = req.body;

    //update user properties
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.photo = req.body.photo || user.photo;

    const updated = await user.save();

    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      photo: updated.photo,
      bio: updated.bio,
      isVerified: updated.isVerified,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});
