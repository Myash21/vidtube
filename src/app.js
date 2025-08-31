import express from "express"
import cors from "cors"

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

//import routes
import healtcheckRouter from "./routes/healthcheck.routes.js"

//routes
app.use("/api/v1/healthcheck", healtcheckRouter)

export { app }