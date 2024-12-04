import { Router } from 'express';

import { verifyJWT } from '../middlewares/auth.middleware.js';
import { createTweet, deleteTweet, getAllTweets, getAllUserFeedTweets, getUserTweets, updateTweet } from '../controllers/tweet.controller.js';

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/feed").get(getAllUserFeedTweets);
router.route("/").post(createTweet).get(getAllTweets);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router