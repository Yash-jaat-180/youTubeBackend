import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// Middleware 
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({
    limit: "16kb"
}))

// When data comes from the url
app.use(express.urlencoded({
    extended: true, 
    limit: "16kb"
}))

// to store the file in public folder  
app.use(express.static("public"))
// to access the cokkie of user browser from my server and set the cookies
app.use(cookieParser())


// Routes

import userRouter from "./routes/user.routes.js"
import videoRouter from './routes/video.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import commentRouter from './routes/comment.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import likeRouter from './routes/like.routes.js'
import healthcheckRouter from './routes/healthCheck.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import aboutRouter from './routes/about.routes.js'

// routes declarations
app.use("/api/v1/users", userRouter)
// http://localhost:8000/api/v1/users/register
// http://localhost:8000/api/v1/users/login
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/about/user/", aboutRouter)

export { app }