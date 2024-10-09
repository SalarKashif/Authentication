import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    //pull token from HTTP request
    const token = req.cookies.token;

    //if there is no token, the user is likely not logged in
    if (!token) {
      res.status(400).json({ message: "Not authorized, please log in" });
    }

    //Decode token using our Secret
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    //get user from token
    const user = await User.findById(decoded.id).select("-password");

    //check if user exists
    if (!user) {
      res.status(400).json({ message: "User not found!" });
    }

    //set user data in request object
    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error: ", error });
  }
});

//admin middleware
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next();
    return;
  } else {
    res.status(403).json({ message: "This requst is invalid" });
  }
});

//This middleware checks if you are an admin or creator prior to moving you forward
export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  if (
    req.user &&
    req.user.role === "creator" &&
    req.user &&
    req.user.role === "admin"
  ) {
    //if the user is a creator and we have the username in the request, move to next middleware
    next();
    return;
  }

  res
    .status(403)
    .json({ message: "Only Creator roles can access this route." });
});

//Checks if user has verified their account
export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    //If user has a verified account move to the next middleware/controller
    next();
    return;
  }

  //If user has not verified their email we will ask them to check thier email
  res
    .status(403)
    .json({ message: "User has not been verified, please check your email." });
});
