import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Content required"],
      trim: true,
      maxlength: 2000,
    },

    type: { type: String, enum: ["text", "image", "system"], default: "text" },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Index pour récupérer l'historique d'un salon rapidement (pagination)
messageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
