import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetsSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        content: {
            type: String,
            required: true
        },
        
    },
    {timestamps: true}
)

tweetsSchema.plugin(mongooseAggregatePaginate) 
export const Tweets = mongoose.model('Tweets', tweetsSchema);