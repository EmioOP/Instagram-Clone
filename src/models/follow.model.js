import mongoose,{Schema} from "mongoose";

const followerSchema = new Schema({
    follower:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    account:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Follower = mongoose.model("Follower",followerSchema)