import mongoose, { Schema, type InferSchemaType } from "mongoose";

const UserActivitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    feature: { type: String, required: true, index: true },
    inputSummary: { type: String, required: true },
    outputSummary: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

UserActivitySchema.index({ userId: 1, createdAt: -1 });

export type UserActivityDocument = InferSchemaType<typeof UserActivitySchema> & { _id: mongoose.Types.ObjectId };

export const UserActivity =
  mongoose.models.UserActivity || mongoose.model("UserActivity", UserActivitySchema);
