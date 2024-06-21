import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const { videoId } = req.params
    //TODO: create playlist

    if (!name?.trim() || !description?.trim()) {
        throw new apiError(400, "all fields are required")
    }

    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "invalid video id");
    }

    const playlist = await Playlist.create({
        name,
        description,
        videos: [videoId],
        owner: req.user?._id
    })

    console.log(playlist)
    if (!playlist) {
        throw new apiError(400, "playlist does not created")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "playlist created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!userId && !isValidObjectId(userId)) {
        throw new apiError(400, "userId is required")
    }

    const user = await User.findById(userId)
    if (!user) {
        new apiError(400, "user does not exist")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }

    ])

    if (!playlists && playlists.length === 0) {
        throw new apiError(400, "user not have any playlists")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, playlists, "playlists are fetched successfully")
        )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!playlistId && !isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId)

    if (playlist == null && !playlist) {
        new apiError(400, "playlist does not exist");
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "get playlist by id successfully")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    
    if (!playlistId?.trim() && !videoId?.trim() && !isValidObjectId(videoId) && !isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlistId and videoId")
    }
    const newObjectVideoId = new mongoose.Types.ObjectId(videoId)
    const mainPlaylist = await Playlist.findById(playlistId)
    
    mainPlaylist.videos.some((value) => {
        if(value.equals(newObjectVideoId)){
            throw new apiError(400, "VideoId already exists")
        }
    })

    const video = await Video.findById(videoId)

    if (!video) {
        throw new apiError(400, "video not found")
    }


    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {
                videos: [videoId]
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        throw new apiError(400, "Playlist does not exist")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "video added successfully")
        )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!playlistId?.trim() && !videoId?.trim() && !isValidObjectId(videoId) && !isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlistId and videoId")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new apiError(400, "Playlist does not exist")
    }

    const videoIndex = playlist.videos.indexOf(videoId)
    if (videoIndex === -1) {
        throw new apiError(400, "Video does not exist")
    }

    const updatePlaylist = playlist.videos.splice(videoIndex, 1)
    if (!updatePlaylist) {
        throw new apiError(400, "error while removing video")
    }

    await playlist.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new apiResponse(200, updatePlaylist, "video removed successfully")
        )


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!playlistId && !isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if (!playlist) {
        new apiError(400, "playlist does not exist");
    }

    return res
        .status(200)
        .json(new apiResponse(200, {}, "playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist

    if (!name?.trim() || !description?.trim()) {
        throw new apiError(400, "all fields are required")
    }

    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "invalid playlist id");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name,
                description: description
            }
        },
        {
            new: true
        }
    )

    if (!playlist) {
        new apiError(400, "playlist not found")
    }

    return res
        .status(200)
        .json(
            new apiResponse(200, playlist, "playlist updated successfully")
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
