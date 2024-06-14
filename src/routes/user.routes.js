import { Router } from "express";
import { registerUser } from "../controllers/user.contoller.js"; // I can import like this only if there is not export default

const router = Router()

router.route("/register").post(registerUser)


export default router;
