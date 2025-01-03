import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (user) => {
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error);
    throw new ApiError(500, "Something went wrong when generating tokens");
  }
};

// cg code started
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;

  // Validate required fields
  if (
    [fullName, email, userName, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or userName already exists");
  }

  // Validate and handle file uploads
  const avatarFile = req.files?.avatar;
  if (!avatarFile || avatarFile.length === 0) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatarLocalPath = avatarFile[0].path;

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;

  // Upload files to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar || !avatar.url) {
    throw new ApiError(400, "Failed to upload avatar");
  }

  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  // Create user in database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong when registering the user");
  }

  // Return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, password, email } = req.body;
  if (!userName && !email) {
    throw new ApiError(400, "username or email is required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ $or: [{ userName }, { email }] });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  console.log("Login user info : ", user);

  return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", refreshToken)
    .json(
      new ApiResponse(
        200,
        { user,accessToken,refreshToken },
        "User logged in successfully"
      )
    );
});

export { registerUser };
//cg code end

/*
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, userName, password } = req.body;
  if (
    [fullName, email, userName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields Are required");
  }
  const existedUser =await User.findOne({ $or: [{ userName }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User with email or userName already exists");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;
  //   console.log("avatar and cover loacl path : ",avatarLocalPath,coverImageLocalPath)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
//   console.log("avatar and cover path : ",avatar.url,"\n",coverImage)


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
  const createdUser = await User.findById(user._id).select("-password -refreshToken");
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
*/
