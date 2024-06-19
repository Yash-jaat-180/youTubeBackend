import mongoose, { Mongoose, isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    // take value of user and channal from req.user._id and channalId
    // validate it
    // find channal id and user id from subscription model 
    // if yes then delete it 
    // if no then create it

    if (!channelId) {
        throw new apiError(400, "channalId required");
    }

    const isChannalExist = await User.findById(channelId)
    if (!isChannalExist) {
        throw new apiError(400, "channal does not exist");
    }

    const isSubscribed = await Subscription.findOne({
        channal: channelId,
        subscriber: req.user?._id
    })

    if (isSubscribed) {
        await Subscription.deleteOne({
            channal: channelId,
            subscriber: req.user?._id
        })

        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "unsubscribed")
            )
    }
    else {
        const subscribed = await Subscription.create({
            channal: channelId,
            subscriber: req.user?._id
        })

        return res
            .status(200)
            .json(
                new apiResponse(200, subscribed, "subscribed")
            )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) {
        throw new apiError(400, "channalId is required")
    }

    const channal = await User.findById(channelId)

    if (!channal) {
        throw new apiError(400, "channal not exist")
    }

    
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channal: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        
    ])

    if (!subscribers) {
        throw new apiError(400, "can't found any channals ")
    }
    if(subscribers.length === 0){
        return res
        .status(200)
        .json(
            new apiResponse(200, {}, "channal don't have any subscribers")
        )
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, subscribers, "all channals fetched")
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new apiError(400, "subscriberId is required")
    }

    const subscriber = await User.findById(subscriberId)

    if (!subscriber) {
        throw new apiError(400, "subscriber not exist")
    }

    
    const channals = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channal",
                foreignField: "_id",
                as: "channalInfo",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        
    ])

    if (!channals) {
        throw new apiError(400, "can't found any channals ")
    }
    if(channals.length === 0){
        return res
        .status(200)
        .json(
            new apiResponse(200, {}, "user does not subscribed to any channals")
        )
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, channals, "all channals fetched")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}