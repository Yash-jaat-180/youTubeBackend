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

const toggleLike = asyncHandler(async (req, res) => {
    const { toggleLike, commentId, videoId, tweetId } = req.query;
    let reqLike;

    if (
        !isValidObjectId(commentId) &&
        !isValidObjectId(tweetId) &&
        !isValidObjectId(videoId)
    )
        throw new apiError(400, "Invalid id");
    if (toggleLike === "true") reqLike = true;
    else if (toggleLike === "false") reqLike = false;
    else throw new apiError(400, "Invalid query string!!!");

    let userLike;

    if (commentId) {
        const comment = await Comment.findById(commentId);
        if (!comment) throw new apiError(400, "No comment found");

        userLike = await Like.find({
            comment: commentId,
            likedBy: req.user?._id,
        });
    } else if (videoId) {
        const video = await Video.findById(videoId);
        if (!video) throw new apiError(400, "No video found");

        userLike = await Like.find({
            video: videoId,
            likedBy: req.user?._id,
        });
    } else if (tweetId) {
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) throw new apiError(400, "No tweet found");

        userLike = await Like.find({
            tweet: tweetId,
            likedBy: req.user?._id,
        });
    }

    let isLiked = false;
    let isDisLiked = false;

    if (userLike?.length > 0) {
        // entry is present so toggle status
        if (userLike[0].liked) {
            // like is present
            if (reqLike) {
                // toggle like so delete like
                await Like.findByIdAndDelete(userLike[0]._id);
                isLiked = false;
                isDisLiked = false;
            } else {
                // toggle dis-like so make it dislike
                userLike[0].liked = false;
                let res = await userLike[0].save();
                if (!res) throw new apiError(500, "error while updating like");
                isLiked = false;
                isDisLiked = true;
            }
        } else {
            // dis-like is present
            if (reqLike) {
                // toggle like so make it like
                userLike[0].liked = true;
                let res = await userLike[0].save();
                if (!res) throw new apiError(500, "error while updating like");
                isLiked = true;
                isDisLiked = false;
            } else {
                // toggle dis-like so delete dis-like
                await Like.findByIdAndDelete(userLike[0]._id);
                isLiked = false;
                isDisLiked = false;
            }
        }
    } else {
        // entry is not present so create new
        let like;
        if (commentId) {
            like = await Like.create({
                comment: commentId,
                likedBy: req.user?._id,
                liked: reqLike,
            });
        } else if (videoId) {
            like = await Like.create({
                video: videoId,
                likedBy: req.user?._id,
                liked: reqLike,
            });
        } else if (tweetId) {
            like = await Like.create({
                tweet: tweetId,
                likedBy: req.user?._id,
                liked: reqLike,
            });
        }
        if (!like) throw new apiError(500, "error while toggling like");
        isLiked = reqLike;
        isDisLiked = !reqLike;
    }

    let totalDisLikes, totalLikes;

    if (commentId) {
        totalLikes = await Like.find({ comment: commentId, liked: true });
        totalDisLikes = await Like.find({ comment: commentId, liked: false });
    } else if (videoId) {
        totalLikes = await Like.find({ video: videoId, liked: true });
        totalDisLikes = await Like.find({ video: videoId, liked: false });
    } else if (tweetId) {
        totalLikes = await Like.find({ tweet: tweetId, liked: true });
        totalDisLikes = await Like.find({ tweet: tweetId, liked: false });
    }

    return res.status(200).json(
        new apiResponse(
            200,
            {
                isLiked,
                totalLikes: totalLikes.length,
                isDisLiked,
                totalDisLikes: totalDisLikes.length,
            },
            "Like toggled successfully"
        )
    );
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
    getLikedVideos,
    toggleLike
}