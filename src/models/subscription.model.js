import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
    {
        subscribers: {
            type: Schema.Types.ObjectId, // one who is subscribing
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId, // channel user owner
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Subscription", SubscriptionSchema);
