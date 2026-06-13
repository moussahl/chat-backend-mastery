import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import { Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  avatar?: string | null;
  status: "online" | "offline" | "away";
  lastSeen?: Date;

   comparePassword(password: string): Promise<boolean>;
   toJSON(): Record<string, unknown>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username required"],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, "Email required"],
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    avatar: { type: String, default: null },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Hash the password before save it
userSchema.pre("save", async function (this: mongoose.HydratedDocument<IUser>) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// method for compare the password
userSchema.methods.comparePassword = async function (
  this: mongoose.HydratedDocument<IUser>,
  plain: string,
): Promise<boolean> {
  return await bcrypt.compare(plain, this.password);
};

// never return password hash in JSON
userSchema.methods.toJSON = function (this: mongoose.HydratedDocument<IUser>) {
  const { password, ...obj } = this.toObject();
  return obj;
};

export default mongoose.model<IUser>("User", userSchema);
