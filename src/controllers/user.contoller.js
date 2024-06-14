import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';


const registerUser = asyncHandler( async (req, res) => {
    // get users details form the frontend
    // handle validation - not empty
    // check if user is already exist: username, email
    // check form images, check for avatar
    // upload them to cloudinary, avatar 
    // create user object - create entry in db 
    // remove password and refresh token field from response
    // check for user creation
    // retrun response 

    const {fullName, email, username, password} = req.body  // These details are coming from frontend 
    console.log("email : ", email);

    // Check if any field is empty or not 
    if (
        [fullName, email, username, password].some((field) => 
        field?.trim() === "") // if after trimming field if it is empty then retrun true
    ) {
        throw new apiError(400, "All fields are required")
    }

    // check if user is already exist or not
    const existedUser = User.findOne({
        $or: [{ username }, { email }] // if username or email already exist then
    })

    console.log("existed user is : ",existedUser)
    if(existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }

    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    // check if avatar is not 
    if(!avatarLocalPath){
        throw new apiError(400, "Avatar file is required")
    }

    // upload localpath on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // check if we have avatar othervise our db pakka fatega
    if(!avatar){
        throw new apiError(400, "Avatar file is required")
    }

    // entry in database
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // These are the corners cases 
        email,
        password,
        username: username.toLowerCase()
    })

    // if user object is created we will find it by an id and by defauld all are selected. We deslected the password and refreshToken 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering a user !!!!!")
    }

    // Now we have to return the response
    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )
})

export { registerUser }