// import mongoose from "mongoose";

// const contactSchema = new mongoose.Schema(
//   {
//     account: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Account",
     
//     },
//     firstName: { type: String,  },
//     middleName: { type: String },
//     lastName: { type: String,  },
//     contactName: { type: String }, // derived from first+middle+last
//     email: { type: String,  },
//     phoneNumbers: [{ type: String }], // array of phones
//     login: { type: Boolean, default: false },
//     notify: { type: Boolean, default: false },
//     emailSync: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// // Middleware: auto-generate contactName
// contactSchema.pre("save", function (next) {
//   this.contactName = [this.firstName, this.middleName, this.lastName]
//     .filter(Boolean)
//     .join(" ");
//   next();
// });

// const Contact = mongoose.model("Contact", contactSchema);
// export default Contact;
