import mongoose, { isValidObjectId } from "mongoose"
import { Tweets } from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse} from "../utils/apiResponse.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body 

    if(!content){
        throw new apiError(400, "all fields are required")
    }

    const tweet = await Tweets.create({
        content,
        owner: req.user._id
    })

    if(!tweet){
        throw new apiError(400, "error while creating tweet")
    }

    return res 
    .status(200)
    .json(
        new apiResponse(200, tweet, "tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    const { page= 1, limit = 1} = req.query 

    if(!isValidObjectId(userId)){
        throw new apiError(400, "invalid user id")
    }

    const user = await User.findById(userId)
    if(!user){
        throw new apiError(400, "user not found")
    }

    const options = {
        page, 
        limit
    }

    const tweetsPipeline = Tweets.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])

    const result = await Tweets.aggregatePaginate(tweetsPipeline, options)

    if(result.totalDocs === 0){
        res
        .status(200)
        .json(
            new apiError(200, {}, "user have no tweets")
        )
    }

    return res 
    .status(200)
    .json(
        new apiResponse(200, result, "all tweets have been fetched successfully")
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body
    const { tweetId} = req.params 

    if(!content && !isValidObjectId(tweetId)){
        throw new apiError(400, "all fields are required")
    }

    const tweet = await Tweets.findByIdAndUpdate(
        tweetId,
        {
            content: content
        }
    )

    if(!tweet){
        throw new apiError(400, "tweet not updated")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, tweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)){
        throw new apiError(400, "invalid tweet id")
    }

    const tweet = await Tweets.findByIdAndDelete(
        tweetId
    )

    if(!tweet){
        throw new apiError(400, "error while deleting tweet")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, {}, "tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
