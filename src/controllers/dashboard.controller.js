import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const userId = req.user._id
    const totalVideoAndViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $group: {
                _id: "$owner",
                totalViews: {
                    $sum: "$views",
                },
                totalVideos: {
                    $sum: 1,
                },
            },
        },
    ]);

    const subsicrberCount = await Subscription.aggregate([
        {
            $match: {
                channal: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: '$channal',
                subscribers: {
                    $sum: 1
                }
            }
        }
    ])

    const channalStats = {
        totalVideoAndViews,
        subsicrberCount
    }

    if (totalVideoAndViews.length === 0) {
        res
            .status(200)
            .json(
                new apiResponse(200, {}, "No content on this channal")
            )
    }
    return res
        .status(200)
        .json(
            new apiResponse(200, channalStats, "fetched channal stats successfully")
        )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id;

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
    ]);

    if (videos.length === 0) {
        return res
            .status(200)
            .json(new apiResponse(200, {}, "user has not uploaded any video"));
    }

    return res
        .status(200)
        .json(new apiResponse(200, videos, "channel videos fetched successfully"));
});

export {
    getChannelStats,
    getChannelVideos
}