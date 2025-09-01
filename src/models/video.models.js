/*
  id string pk
  owner ObjectID users
  videofile string
  thumbnail string
  title string
  description string
  duration number
  views number
  isPublished boolean
  createdAt Date
  updatedAt Date
*/

import mongoose, { Schema } from "mongoose";
import { User } from "./user.models";

const videoSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: User
        },
        videoFile: {
            type: String, //cloudinary url
            required: true,
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean
        }
    },
    { timestamps: true }
)

export const Video = mongoose.model("Video", videoSchema) 
/*creates a table/document in the mongodb database
 names user and having the structure defined in userSchema
*/