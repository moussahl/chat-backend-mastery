import mongoose from "mongoose";
import * as bcrypt from "bcrypt";

interface IUser {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  status: "online" | "offline" | "away";
  lastSeen?: Date;
  createdAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
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
    toLowerCase: true,
    index: true,
  },
  password: { type: String, required: true, select: false },
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
  createdAt: { type: Date, default: Date.now },
});

// Hash the password before save it
userSchema.pre("save", async function (this: mongoose.HydratedDocument<IUser>) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// method for compare the password
userSchema.methods.comparePassword = function (
  this: mongoose.HydratedDocument<IUser>,
  plain: string,
): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

// never return password hash in JSON
userSchema.methods.toJSON = function (this: mongoose.HydratedDocument<IUser>) {
  const { password, ...obj } = this.toObject();
  return obj;
};

export default mongoose.model("User", userSchema);
