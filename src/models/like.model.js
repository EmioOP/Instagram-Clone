import mongoose,{Schema} from "mongoose"

const likeSchema = new Schema({
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    imageId: {
        type: Schema.Types.ObjectId,
        ref: "Image"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
    {
        timestamps: true
    })

export const Like = mongoose.model("Like", likeSchema)