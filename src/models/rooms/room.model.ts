import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Room name is required"] },
    type: { type: String, enum: ["public", "private"], default: "public" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index pour trier par activité récente
roomSchema.index({ lastActivity: -1 });

export const Room = mongoose.model("Room", roomSchema);
