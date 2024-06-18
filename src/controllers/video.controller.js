import mongoose from "mongoose";
import { Video} from "../models/video.model.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if(!title.trim() && !description.trim()){
        throw new apiError(400, "title and description are required");
    }

    console.log(req.files);
    const videoFileLocalPath = req.files?.videoFile[0]?.path;  
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    
    if(!videoFileLocalPath && !thumbnailLocalPath){
        throw new apiError(400, "video file and thumbnail are required");
    }

    const duration = await req.files?.videoFile[0]?.duration;

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log(videoFile);

    if(!videoFile && !thumbnail){
        throw new apiError(400, "cloudinary uploading error");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user
    })

    return res
    .status(200)
    .json(
        new apiResponse(200, video ,"Video uploaded successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    //TODO: get video by id
    const video = await Video.findById(videoId);

    return res
    .status(200)
    .json(
        new apiResponse(200, video, "Get video successfuly")
    );
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description} = req.body;

    if(!title.trim() && !description.trim()){
        throw new apiError(400, "title and description are required");
    }

    const thumbnailLocalPath = req.file?.path;

    if(!thumbnailLocalPath){
        throw new apiError(400, "thumbnailLocalPath is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!thumbnail){
        throw new apiError(400, "uploadOnCloudinary error of thumbnail");
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail?.url,
                title: title,
                description: description
            }
        }
    )

    return res
    .status(200)
    .json(
        new apiResponse(200, video, "video details updated")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new apiError(400, "video not found")
    }

    const video = await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(
        new apiResponse(200,{} ,"Video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new apiError(400, "video not found")
    }

    const video = await Video.findById(videoId)
        
        
    if(!video){
        throw new apiError(400, "video don't exist");
    }

    if(video.isPublished){
        video.isPublished = false
    }
    else{
        video.isPublished = true
    }

    await video.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new apiResponse(200, video, "toggle publish status successfully")
    )

})

export {getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus }