import mongoose, { isValidObjectId, Mongoose } from "mongoose";
import { Video } from "../models/video.model.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";


const getAllVideosByOption = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        search = "",
        sortBy,
        sortType = "video",
        order,
        userId,
    } = req.query;
    // filter video by given filters
    let filters = { isPublished: true };
    if (isValidObjectId(userId)) {
        filters.owner = new Mongoose.Types.ObjectId(userId);
    }

    let pipeline = [
        {
            $match: {
                ...filters,
            }
        }
    ]

    const sort = {};

    // if query is given filter the videos
    if (search) {
        const queryWords = search.trim().toLowerCase().replace(/\s+/g, " ").split(" ");
        const filteredWords = queryWords.filter((word) => !stopWords.includes(word));

        console.log("Search is :", search);
        console.log("filteredWords: ", filteredWords);

        pipeline.push({
            $addFields: {
                titleMatchWordCount: {
                    $size: {
                        $filter: {
                            input: filteredWords,
                            as: "word",
                            cond: {
                                $in: ["$$word", { $split: [{ $toLower: "$title" }, " "] }],
                            }
                        }
                    }
                }
            }
        })

        pipeline.push({
            $addFields: {
                descriptionMatchWordCount: {
                    $size: {
                        $filter: {
                            input: filteredWords,
                            as: "word",
                            cond: {
                                $in: [
                                    "$$word",
                                    { $split: [{ $toLower: "$description" }, " "] }
                                ]
                            }
                        }
                    }
                }
            }
        })
        sort.titleMatchWordCount = -1;
    }

    // sort the documents
    if (sortBy) {
        sort[sortBy] = parseInt(order);
    } else if (!search && !sortBy) {
        sort["createdAt"] = -1
    }

    pipeline.push({
        $sort: {
            ...sort,
        }
    });

    // fetch owner detail
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$owner",
        }
    );

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    }

    const allVideos = await Video.aggregatePaginate(videoAggregate, options);

    const { docs, ... pagingInfo} = allVideos
    return res
    .status(200)
    .json(
        new apiResponse(200, {videos: docs, pagingInfo}, "All Query Videos Sent Successfully")
    )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    if (!userId && !isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user id")
    }

    if (!query && !sortBy && !sortType) {
        throw new apiError(400, "All fields are required")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new apiError(400, "User not found")
    }

    let options = {
        page,
        limit
    }

    let sortOptions = {}

    if (sortBy) {
        sortOptions[sortBy] = sortType === 'desc' ? -1 : 1 // sortOptions= {title: -1}
    }

    const videoPipeline = Video.aggregate([
        {
            $match: {
                $and: [
                    {
                        owner: new mongoose.Types.ObjectId(userId)
                    },
                    {
                        title: {
                            $regex: query,
                            $options: "i",
                        }
                    }
                ]
            }
        },
        {
            $sort: sortOptions
        }

    ])
    const resultVideos = await Video.aggregatePaginate(videoPipeline, options)

    if (resultVideos.totalDocs === 0) {
        return res.status(200).json(new apiResponse(200, {}, "user has no video"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, resultVideos, "video fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title.trim() && !description.trim()) {
        throw new apiError(400, "title and description are required");
    }

    console.log(req.files);
    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoFileLocalPath && !thumbnailLocalPath) {
        throw new apiError(400, "video file and thumbnail are required");
    }

    const duration = await req.files?.videoFile[0]?.duration;

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log(videoFile);

    if (!videoFile && !thumbnail) {
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
            new apiResponse(200, video, "Video uploaded successfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    //TODO: get video by id
    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, video, "Get video successfuly")
        );
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const { title, description } = req.body;

    if (!title.trim() && !description.trim()) {
        throw new apiError(400, "title and description are required");
    }

    const thumbnailLocalPath = req.file?.path;

    if (!thumbnailLocalPath) {
        throw new apiError(400, "thumbnailLocalPath is required");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
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
    if (!videoId) {
        throw new apiError(400, "video not found")
    }

    const video = await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(
            new apiResponse(200, {}, "Video deleted successfully")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new apiError(400, "video not found")
    }

    const video = await Video.findById(videoId)


    if (!video) {
        throw new apiError(400, "video don't exist");
    }

    if (video.isPublished) {
        video.isPublished = false
    }
    else {
        video.isPublished = true
    }

    await video.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new apiResponse(200, video, "toggle publish status successfully")
        )

})

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus, getAllVideosByOption }