import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse} from "../utils/apiResponse.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!videoId && !isValidObjectId(videoId)){
        throw new apiError(400, "Video id required")
    }

    const video = await Video.findById(videoId)
    if(!video){
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
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    if(!comments && !comments.length === 0){
        throw new apiError(400, "video has no comments")
    }

    const allComment = await Comment.aggregatePaginate(comments, options)

    if(!allComment){
        throw new apiError(400, "")
    }

    if(allComment.totalDocs === 0){
        return res
        .status(200)
        .json(
            new apiResponse(200, {}, "video has zero comments")
        )
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, allComment, "all comments fetched successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params

    if(!(content && videoId) && !isValidObjectId(videoId)){
        throw new apiError(400, "All fields are required")
    }

    const comment = await Comment.create({
        content,
        owner: req.user._id,
        video: videoId
    })

    if(!comment){
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
    const {commentId} = req.params
    const {content} = req.body

    if(!content && !commentId && !isValidObjectId(commentId)){
        throw new apiError(400, "commentId and content is required")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: content
            }
        },
        { new: true}
    )
    if(!comment){
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
    const {commentId} = req.params

    if(!commentId && !isValidObjectId(commentId)){
        throw new apiError(400, "commentId is required")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment){
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
