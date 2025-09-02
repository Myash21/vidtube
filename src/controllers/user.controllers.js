import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;

  // Basic validation
  if ([fullname, username, email, password].some(f => !f || f.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Uniqueness check
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Files from multer
  const avatarFile = req.files?.avatar?.[0];
  const coverFile  = req.files?.coverImage?.[0];

  if (!avatarFile?.path) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Uploads — folder organization is optional but helpful
  const [avatarUpload, coverUpload] = await Promise.all([
    uploadOnCloudinary(avatarFile.path, { folder: "avatars" }),
    coverFile?.path ? uploadOnCloudinary(coverFile.path, { folder: "covers" }) : Promise.resolve(null),
  ]);

  if (!avatarUpload?.secure_url) {
    throw new ApiError(500, "Failed to upload avatar");
  }

  const user = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatarUpload.secure_url,
    coverImage: coverUpload?.secure_url || "",
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user!");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});
