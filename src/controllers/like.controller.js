import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiResponse } from "../utils/apiResponse.js"
import { apiError } from "../utils/apiError.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweets } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video id ")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "Video not found")
    }

    const likeVideo = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (likeVideo) {
        const like = await likeVideo.deleteOne()

        if (!like) {
            throw new apiError(400, "Error deleting Like")
        }
        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "unlike video successfully")
            )
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })
    if (!like) {
        throw new apiError(400, "Error creating Like")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, like, "Liked video successfully")
        )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment id ")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new apiError(400, "comment not found")
    }

    const likeComment = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (likeComment) {
        const like = await likeComment.deleteOne()

        if (!like) {
            throw new apiError(400, "Error deleting Like")
        }
        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "unlike comment successfully")
            )
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })
    if (!like) {
        throw new apiError(400, "Error creating Like")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, like, "Liked comment successfully")
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id ")
    }

    const tweet = await Tweets.findById(tweetId)
    if (!tweet) {
        throw new apiError(400, "tweet not found")
    }

    const likeTweet = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (likeTweet) {
        const like = await likeTweet.deleteOne()

        if (!like) {
            throw new apiError(400, "Error deleting Like")
        }
        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "unlike tweet successfully")
            )
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })
    if (!like) {
        throw new apiError(400, "Error creating Like")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, like, "Liked tweet successfully")
        )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const { page = 1, limit = 10 } = req.query

    const option = {
        page,
        limit
    }


    const likePipeline = Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: {
                    $exists: true
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $addFields: {
                videoDetails: {
                    $first: "$videoDetails"
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])
    const result = await Like.aggregatePaginate(likePipeline, option)

    if (result.totalDocs === 0) {
        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "User not liked any videos")
            )
    }
    return res
        .status(200)
        .json(
            new apiResponse(200, result, "User liked videos fetched successfully")
        )
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}