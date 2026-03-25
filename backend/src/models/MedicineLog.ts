import mongoose, { Schema, type InferSchemaType } from "mongoose";

const MedicineLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    medicineName: { type: String, required: true, trim: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

MedicineLogSchema.index({ userId: 1, medicineName: 1, timestamp: -1 });

export type MedicineLogDocument = InferSchemaType<typeof MedicineLogSchema> & { _id: mongoose.Types.ObjectId };

export const MedicineLog = mongoose.models.MedicineLog || mongoose.model("MedicineLog", MedicineLogSchema);
