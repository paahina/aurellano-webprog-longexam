const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { SALT } = require("../config/config");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    userRole: {
      type: String,
      required: true,
      enum: ["customer", "Admin"],
      default: "customer",
    },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

userSchema.index({ userRole: 1 });
userSchema.index({ isActive: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema, "user");
