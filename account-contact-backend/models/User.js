import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, },
    email: { type: String,   },
    password: { type: String,  },
    role: { type: String, default: "client" },
    login: { type: Boolean, default: false },
    notify: { type: Boolean, default: false },
    emailSync: { type: Boolean, default: false },
    contact: { type: mongoose.Schema.Types.ObjectId, ref: "Contact" }, // link to contact
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
