import mongoose,{Schema} from "mongoose";


const storySchema = new Schema({
    storyFile:{
        type:String,
        required:true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Story = mongoose.model("Story",storySchema)