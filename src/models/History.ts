import mongoose, { Schema, type InferSchemaType } from "mongoose";

const historySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    prompt: { type: String, required: true },
    resultText: { type: String },
    resultUrl: { type: String },
    messages: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export type HistoryDocument = InferSchemaType<typeof historySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const History =
  mongoose.models.History || mongoose.model("History", historySchema);
