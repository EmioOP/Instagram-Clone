import mongoose,{Schema} from "mongoose";

const videoSchema = new Schema({
    videoFile:{
        type:String,
        required:true
    },
    caption:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    views:{
        type:Number,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true
    }
},{timestamps:true})


// add pagination as a plugin or implement infinity scrll

export const Video = mongoose.model("Video",videoSchema)