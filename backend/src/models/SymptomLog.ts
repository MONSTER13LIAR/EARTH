import mongoose, { Schema, type InferSchemaType } from "mongoose";

const SymptomLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symptoms: { type: String, required: true },
    result: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export type SymptomLogDocument = InferSchemaType<typeof SymptomLogSchema> & { _id: mongoose.Types.ObjectId };

export const SymptomLog = mongoose.models.SymptomLog || mongoose.model("SymptomLog", SymptomLogSchema);
