import mongoose, { isValidObjectId, Mongoose } from "mongoose";
import { Video } from "../models/video.model.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { stopWords } from "../utils/helperData.js";


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

    const { docs, ...pagingInfo } = allVideos
    return res
        .status(200)
        .json(
            new apiResponse(200, { videos: docs, pagingInfo }, "All Query Videos Sent Successfully")
        )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { userId } = req.query;

    let filters = { isPublished: true };
    if (isValidObjectId(userId))
        filters.owner = new mongoose.Types.ObjectId(userId);

    let pipeline = [
        {
            $match: {
                ...filters,
            },
        },
    ];

    pipeline.push({
        $sort: {
            createdAt: -1,
        },
    });

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

    const allVideos = await Video.aggregate(Array.from(pipeline));

    return res
        .status(200)
        .json(new apiResponse(200, allVideos, "all videos sent"));
});

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
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video id");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
                isPublished: true,
            },
        },
        // get all likes array
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
                pipeline: [
                    {
                        $match: {
                            liked: true,
                        },
                    },
                    {
                        $group: {
                            _id: "$liked",
                            likeOwners: { $push: "$likedBy" },
                        },
                    },
                ],
            },
        },
        // get all dislikes array
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "dislikes",
                pipeline: [
                    {
                        $match: {
                            liked: false,
                        },
                    },
                    {
                        $group: {
                            _id: "$liked",
                            dislikeOwners: { $push: "$likedBy" },
                        },
                    },
                ],
            },
        },
        // adjust shapes of likes and dislikes
        {
            $addFields: {
                likes: {
                    $cond: {
                        if: {
                            $gt: [{ $size: "$likes" }, 0],
                        },
                        then: { $first: "$likes.likeOwners" },
                        else: [],
                    },
                },
                dislikes: {
                    $cond: {
                        if: {
                            $gt: [{ $size: "$dislikes" }, 0],
                        },
                        then: { $first: "$dislikes.dislikeOwners" },
                        else: [],
                    },
                },
            },
        },
        // fetch owner details
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
        },
        // added like fields
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                duration: 1,
                thumbnail: 1,
                views: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
                totalLikes: {
                    $size: "$likes",
                },
                totalDisLikes: {
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
            },
        },
    ]);

    if (!video.length > 0) throw new apiError(400, "No video found");

    return res
        .status(200)
        .json(new apiResponse(200, video[0], "Video sent successfully"));
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
    const { videoId } = req.params;
    if (!videoId) throw new apiError(400, "videoId required");

    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "Video not found");

    video.isPublished = !video.isPublished;
    const updatedVideo = await video.save();

    if (!updatedVideo) throw new apiError(400, "Failed to toggle publish status");

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { isPublished: updatedVideo.isPublished },
                "Video publishStatus toggled successfully"
            )
        );
});



const updateView = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new apiError(400, "videoId required");

    const video = await Video.findById(videoId);
    if (!video) throw new apiError(400, "Video not found");

    video.views += 1;
    const updatedVideo = await video.save();
    if (!updatedVideo) throw new apiError(400, "Error occurred on updating view");

    let watchHistory;
    if (req.user) {
        watchHistory = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $push: {
                    watchHistory: new mongoose.Types.ObjectId(videoId),
                },
            },
            {
                new: true,
            }
        );
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { isSuccess: true, views: updatedVideo.views, watchHistory },
                "Video views updated successfully"
            )
        );
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus, getAllVideosByOption, updateView }