import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId && !isValidObjectId(videoId)) {
        throw new apiError(400, "Video id required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(400, "Video not found")
    }

    const options = {
        page,
        limit
    }

    const comments = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {// short by date
            $sort: {
                createdAt: -1
            }
        },
        // fetch likes of comment
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes",
                pipeline: [
                    {
                        $match: {
                            liked: true
                        }
                    },
                    {
                        $group: {
                            _id: "liked",
                            owners: { $push: "$likedBy" }
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "dislikes",
                pipeline: [
                    {
                        $match: {
                            liked: false,
                        },
                    },
                    {
                        $group: {
                            _id: "liked",
                            owners: { $push: "$likedBy" },
                        },
                    },
                ],
            },
        },
        // Reshape likes and dislikes
        {
            $addFields: {
                likes: {
                    $cond: {
                        if: {
                            $gt: [{ $size: "$likes" }, 0],
                        },
                        then: { $first: "$likes.owners" },
                        else: [],
                    },
                },
                dislikes: {
                    $cond: {
                        if: {
                            $gt: [{ $size: "$dislikes" }, 0],
                        },
                        then: { $first: "$dislikes.owners" },
                        else: [],
                    },
                },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            _id: 1,
                        },
                    },
                ],
            }
        },
        { $unwind: "$owner" },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
                isOwner: {
                    $cond: {
                        if: { $eq: [req.user?._id, "$owner._id"] },
                        then: true,
                        else: false,
                    },
                },
                likesCount: {
                    $size: "$likes",
                },
                disLikesCount: {
                    $size: "$dislikes",
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$likes"],
                        },
                        then: true,
                        else: false,
                    },
                },
                isDisLiked: {
                    $cond: {
                        if: {
                            $in: [req.user?._id, "$dislikes"],
                        },
                        then: true,
                        else: false,
                    },
                },
                isLikedByVideoOwner: {
                    $cond: {
                        if: {
                            $in: [video.owner, "$likes"],
                        },
                        then: true,
                        else: false,
                    },
                },
            }
        }

    ]);

    if (!comments && !comments.length === 0) {
        throw new apiError(400, "video has no comments")
    }


    Comment.aggregatePaginate(comments, options, function (err, results) {
        console.log("results", results);
        if (!err) {
            const {
                docs,
                totalDocs,
                limit,
                page,
                totalPages,
                pagingCounter,
                hasPrevPage,
                hasNextPage,
                prevPage,
                nextPage,
            } = results;

            return res.status(200).json(
                new apiResponse(
                    200,
                    {
                        Comments: docs,
                        totalDocs,
                        limit,
                        page,
                        totalPages,
                        pagingCounter,
                        hasPrevPage,
                        hasNextPage,
                        prevPage,
                        nextPage,
                    },
                    "Comments fetched successfully"
                )
            );
        } else throw new apiError(500, err.message);
    });
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { content } = req.body
    const { videoId } = req.params

    if (!(content && videoId) && !isValidObjectId(videoId)) {
        throw new apiError(400, "All fields are required")
    }

    const comment = await Comment.create({
        content,
        owner: req.user._id,
        video: videoId
    })

    if (!comment) {
        new apiError(400, "can't post a comment")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, comment, "Create comment successfully")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body

    if (!content && !commentId && !isValidObjectId(commentId)) {
        throw new apiError(400, "commentId and content is required")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true }
    )
    if (!comment) {
        throw new apiError(400, "comment not found")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, comment, "comment updated successfully")
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId && !isValidObjectId(commentId)) {
        throw new apiError(400, "commentId is required")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if (!comment) {
        throw new apiError(400, "comment not found or deleted")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, {}, "comment deleted successfully")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
