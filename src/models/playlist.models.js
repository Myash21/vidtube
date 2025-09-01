/*
  id string
  name string
  description string
  videos ObjectID[] videos
  owner ObjectID users
  createdAt Date
  updatedAt Date
*/

import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    { timestamps: true }
)

export const Playlist = mongoose.model("Playlist", playlistSchema) 
/*creates a table/document in the mongodb database
 names user and having the structure defined in userSchema
*/