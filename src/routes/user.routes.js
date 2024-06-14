import { Router } from "express";
import { registerUser } from "../controllers/user.contoller.js"; // I can import like this only if there is not export default
import { upload } from "../middlewares/multer.middleware.js";

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


export default router;
