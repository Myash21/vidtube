import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/apiError.js"

const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))

//common middleware
app.use(express.json({limit: "16kb"})) //allows parsing of incoming requests with json payloads
app.use(express.urlencoded({extended:true, limit:"16kb"})) // parses URL-encoded data
app.use(express.static("public")) //This serves static files from the public folder
app.use(cookieParser())

//import routes
import healthcheckRouter from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"

//routes
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" })
})

// Centralized error handler
app.use((err, req, res, next) => {
    const statusCode = err instanceof ApiError && err.statusCode ? err.statusCode : 500
    const message = err?.message || "Something went wrong"
    const errors = err?.errors || []
    res.status(statusCode).json({ success: false, message, errors, statusCode })
})

export { app }