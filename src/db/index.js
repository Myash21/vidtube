//Connecting to MongoDB database
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv"
dotenv.config()

const mongodb_url = process.env.mongodb_url
const connectdb = async() => {
    try {
        const connection_instance = await mongoose.connect(`${mongodb_url}/${DB_NAME}`)
        console.log(`\n MongoDB Connected! DB host: ${connection_instance.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection error!", error)
        process.exit(1)
    }
}

export default connectdb