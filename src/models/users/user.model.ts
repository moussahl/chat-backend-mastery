import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username requis"],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: [true, "Email requis"],
    unique: true,
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












/* 

// Hash le mot de passe avant save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Méthode pour comparer le mot de passe
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Ne jamais retourner passwordHash en JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
}; */





export default  mongoose.model("User", userSchema);
