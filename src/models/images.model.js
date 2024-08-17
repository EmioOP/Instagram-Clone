import mongoose,{Schema} from "mongoose";

const imageSchema = new Schema({
    imageFile:{
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
    isPublished:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

export const Image = mongoose.model("Image",imageSchema)