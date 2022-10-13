import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Create a schema for the user
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  code: {
    type: String,
    required: false, // random code to verify email
  },
  isDisabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  favorites: {
    type: [Object],
    required: false,
  },
  completed: {
    type: [Object],
    required: false,
  },
  watching: {
    type: [Object],
    required: false,
  },
  watchList: {
    // type is json object
    type: [Object],
    required: false,
  },
  watching: {
    type: [Object],
    required: false,
  },
  following: {
    type: [Object],
    required: false,
  },
  followers: {
    type: [Object],
    required: false,
  },
});
// Generate an auth token and refresh token for the user
userSchema.methods = {
  generateAvatar: async function (userName) {
    // generate avatar with user._id with loadash
    try {
      const avatar =
        "https://robohash.org/" + userName + ".png?set=set4&size=100x100";
      return avatar;
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};

// Hash the password before saving the user model
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// Search for a user by email and password.
userSchema.statics.findByCredentials = async (
  credential,
  password,
  isEmail
) => {
  console.log(credential, password, isEmail);
  let user;
  isEmail
    ? (user = await User.findOne({ email: credential }))
    : (user = await User.findOne({ username: credential }));
  if (!user) {
    return { status: "error", error: "Invalid login credentials" };
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return { status: "error", error: "Invalid login credentials" };
  }
  return user;
};
const User = mongoose.model("User", userSchema);
export { User };
