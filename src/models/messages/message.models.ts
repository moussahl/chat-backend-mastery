import mongoose from "mongoose";
import { Types } from "mongoose";

export interface IMessage extends mongoose.Document {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  room: Types.ObjectId;
  content: string;
  type: "text" | "image" | "file" | "system";
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}


// mongoose Schema for Messags

const Schema = mongoose.Schema;

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
      index: true,
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [5000, "Message cannot exceed 5000 characters"],
    },

    type: {
      type: String,
      enum: {
        values: ["text", "image", "file", "system"],
        message: "Message type must be text, image, file, or system",
      },
      default: "text",
    },
     isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Index pour récupérer l'historique d'un salon rapidement (pagination)
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ room: 1, isRead: 1 });

export const Message = mongoose.model("Message", messageSchema);