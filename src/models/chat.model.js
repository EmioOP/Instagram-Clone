import mongoose,{Schema} from "mongoose";

const chatSchema = new Schema({
    message:{
        type:String,
        required:true,
    },
    sender:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    reciever:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Chat = mongoose.model("Chat",chatSchema)