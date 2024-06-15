import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


// This is the function to find the user details 
// It is used again and again not only for logout but also for uploading many times we use this function 

export const verifyJWT = asyncHandler(async(req, /*res*/_, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")  // Because of cookie parser used in app.js. req have access of cookie
        // const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token) {
            throw new apiError(401, "Unauthorized request could'nt get token");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            
            throw new apiError(401, "Invalid access token");
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token");
    }
})