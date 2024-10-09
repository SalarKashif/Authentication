import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please input an email"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please input an email"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please input a password"],
    },
    photo: {
      type: String,
      default: "../../images/defaultUserProfilePicture.jpg",
    },
    bio: {
      type: String,
      default: "I am a new user.",
    },
    role: {
      type: String,
      enum: ["user", "admin", "creator"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    minimize: true,
  }
);

//hash password before saving to DB
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  //generate salt
  const salt = await bcrypt.genSalt(10);

  //sha256 hash algo
  const hashedPassword = await bcrypt.hash(this.password, salt);

  //save hashed password to the one being saved in the Schema
  this.password = hashedPassword;

  //call the next middleware
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
