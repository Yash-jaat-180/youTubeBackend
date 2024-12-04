import mongoose, { Mongoose, isValidObjectId } from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) throw new apiError(400, "Invalid ChannelId");

    let isSubscribed;

    const findRes = await Subscription.findOne({
        subscriber: req.user?._id,
        channal: channelId,
    });


    if (findRes) {
        const res = await Subscription.deleteOne({
            subscriber: req.user?._id,
            channal: channelId,
        });
        isSubscribed = false;
    } else {
        const newSub = await Subscription.create({
            subscriber: req.user?._id,
            channal: channelId,
        });
        console.log(newSub);
        if (!newSub) throw new apiError(500, "Failed to toggle Subscription");
        isSubscribed = true;
    }

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                { isSubscribed },
                `${isSubscribed ? "Subscribed successfully" : "Un-Subscribed successfully"}`
            )
        );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId = req.user?._id } = req.params;

    if (!isValidObjectId(channelId)) throw new apiError(400, "Invalid ChannelId");

    const subscriberList = await Subscription.aggregate([
        {
            $match: {
                channal: new mongoose.Types.ObjectId(channelId),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "channal",
                foreignField: "subscriber",
                as: "subscribedChannels",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channal",
                            as: "subscribersSubscribers",
                        },
                    },
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1,
                            subscribersCount: {
                                $size: "$subscribersSubscribers",
                            },
                        },
                    },
                ],
            },
        },
        {
            $unwind: {
                path: "$subscriber",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                "subscriber.isSubscribed": {
                    $cond: {
                        if: {
                            $in: ["$subscriber._id", "$subscribedChannels.channal"],
                        },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $group: {
                _id: "channal",
                subscriber: {
                    $push: "$subscriber",
                },
            },
        },
    ]);

    const subscribers =
        subscriberList?.length > 0 ? subscriberList[0].subscriber : [];

    return res
        .status(200)
        .json(new apiResponse(200, subscribers, "Subscriber Sent Successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId))
        throw new apiError(400, "Invalid subscriberId");

    const subscribedChannels = await Subscription.aggregate([
        // get all subscribed channels
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        // get channel details
        {
            $lookup: {
                from: "users",
                localField: "channal",
                foreignField: "_id",
                as: "channal",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        {
            $unwind: "$channal",
        },
        // get channel's subscribers
        {
            $lookup: {
                from: "subscriptions",
                localField: "channal._id",
                foreignField: "channal",
                as: "channelSubscribers",
            },
        },
        {
            // logic if current user has subscribed the channel or not
            $addFields: {
                "channal.isSubscribed": {
                    $cond: {
                        if: { $in: [req.user?._id, "$channelSubscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
                // channel subscriber count
                "channal.subscribersCount": {
                    $size: "$channelSubscribers",
                },
            },
        },
        {
            $group: {
                _id: "subscriber",
                subscribedChannels: {
                    $push: "$channal",
                },
            },
        },
    ]);

    const users =
        subscribedChannels?.length > 0
            ? subscribedChannels[0].subscribedChannels
            : [];

    return res
        .status(200)
        .json(
            new apiResponse(200, users, "Subscribed channel list sent successfully")
        );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}