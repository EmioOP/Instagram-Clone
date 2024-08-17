import mongoose, { Schema } from "mongoose"

const commentSchema = new Schema({
    videoId:{
        type:Schema.Types.ObjectId(),
        ref:"Video"
    },
    imageId:{
        type:Schema.Types.ObjectId(),
        ref:"Image"
    },
    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Comment = mongoose.model("Comment",commentSchema)