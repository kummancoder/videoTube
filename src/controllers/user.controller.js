import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse }  from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  if (
    [fullName, email, userName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields Are required");
  }
  const existedUser = User.findOne({ $or: [{ userName }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or userName already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });
  createdUser = await User.findById(user._id).select("-password -refreshToken");
  if(!createdUser)
  {
    throw new ApiError(500,"Somthing went wrong when registering the user");
  }
 return res.status(201).json(new ApiResponse(201,createdUser,"User registered Successfully"))
});

export { registerUser };

// get user details from frontend
// validation - not empty
// check if user already exists : username, email
// avatar file hai ya nhi
// upload then to cloudinary, chek avtar uploaded
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return response
