import mongoose from 'mongoose'

const roomMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
  },

  role: {
    type: String,
    enum: ["member", "admin"],
    default: "member",
    required: true,
  },

  joinedAt: {type: Date, default: Date.now},
});

// Empêche un user de rejoindre la même room deux fois
roomMemberSchema.index({ userId: 1, roomId: 1 }, { unique: true });


export const RoomMember =  mongoose.model("RoomMember", roomMemberSchema);
