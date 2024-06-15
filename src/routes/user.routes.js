import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.contoller.js"; // I can import like this only if there is not export default
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    // This is How we use middleware jaha jaa rhe ho jao pahle mujhse milkar jao
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser) // Post method is used because you are taking the information from the user 

// secured routes
router.route("/logout").post(verifyJWT, logoutUser) // Here we give two functions to run the next function also we use next() at the end of the verifyJWT method

router.route("/refresh-token").post(refreshAccessToken)

export default router;
