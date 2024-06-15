import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from "jsonwebtoken"
import { response } from 'express';

const generateAccessAndRefreshTokens = async(userId) =>{
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // Saving the refresh token in database
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) // if save method call then it will kick the mongoose model and password is required

        return {accessToken, refreshToken}

    }catch(error){
        throw new apiError(500, "Something went wrond while generating access and refresh tokens");
    }
}


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

    // Check if any field is empty or not 
    if (
        [fullName, email, username, password].some((field) => 
        field?.trim() === "") // if after trimming field if it is empty then retrun true
    ) {
        throw new apiError(400, "All fields are required")
    }

    // check if user is already exist or not
    const existedUser = await User.findOne({
        $or: [{ username }, { email }] // if username or email already exist then
    })
    if(existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }

    //TODO - Also apply the email validity also 

    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(req.files.avatar);
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

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

    // if user object is created we will find it by an id and by default all are selected. We deslected the password and refreshToken 
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


const loginUser = asyncHandler( async(req, res) => {
    // get details from the user
    // check validation - not empty
    // find the user
    // password check
    // access and refresh token generate 
    // send cookie 

    const { email, username, password} = req.body;

    if(!(email || username)){
        throw new apiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username}, {email}]
    })

    if(!user){
        throw new apiError(404, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new apiError(401, "Password is not correct");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // Now send cookies
    // cookie can be modified by the frontend 
    const options = {// Here we can modified the cookie through server only
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler( async(req, res) => {
    // if get the user _id then we delete its refresh token
    // Here the main concept for how to bring this user we make a custom middleware function.
    await User.findByIdAndUpdate(
        req.user._id, // find the user by id
        // What to update
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {// Here we can modified the cookie through server only
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken // if used mobile then we get it by req.body.refreshToken
    
    if(!incomingRefreshToken){
        throw new apiError(401, "unautherized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new apiError(401, "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401, "Refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true, 
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed successfully",
            )
        )
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid refresh token")
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken }