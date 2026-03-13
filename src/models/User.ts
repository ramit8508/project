import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    credits: { type: Number, default: 10 },
    resetCodeHash: { type: String },
    resetCodeExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const User =
  mongoose.models.User || mongoose.model("User", userSchema);
