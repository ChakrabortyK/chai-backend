import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
    {
        subscribers: {
            type: Schema.Types.ObjectId, // subscriber id
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId, // channel id
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", SubscriptionSchema);
