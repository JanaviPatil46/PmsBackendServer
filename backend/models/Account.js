import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    clientType: {
      type: String,
      enum: ["Individual", "Company"],
      required: true,
    },
    accountName: { type: String, required: true, uniques: true },
    companyName: { type: String }, // only if Company
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contact" }],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", accountSchema);
export default Account;
