import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const likeSchema = new Schema(
    {
        liked: {
            type: Boolean,
            default: true,
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }, 
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: 'Tweets'
        }
    },
    {timestamps: true}
)

likeSchema.plugin(mongooseAggregatePaginate) 
export const Like = mongoose.model('Like', likeSchema);