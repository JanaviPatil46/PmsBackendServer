const Admin = require('../models/adminSignupModel')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const path = require("path");
// GET all Admins
const getAdmins = async (req, res) => {
    try {
      const Admins = await Admin.find({}).sort({ createdAt: -1 });
      res.status(200).json({ message: "Admins retrieved successfully", Admins });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // GET a single Admin
  const getAdmin = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Admin ID" });
    }
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ error: "No such Admin" });
      }
      res.status(200).json({ message: "Admin retrieved successfully", admin });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

    // GET a  Admin by userid
    const getAdminByUserid = async (req, res) => {
      const { userid } = req.params;
      try {
          const admin = await Admin.findOne({ userid });
  
          if (!admin) {
              return res.status(404).json({
                  message: 'Admin not found',
              });
          }
  
         
          res.status(200).json({
              message: 'Admin retrieved successfully',
              admin,
          });
      } catch (error) {
          console.error('Error retrieving admin:', error);
          res.status(500).json({
              message: 'An error occurred while retrieving the admin',
              error: error.message,
          });
      }
    };
  
  // POST create a new Admin
  const createAdmin = async (req, res) => {
    const { firstName, middleName, lastName, phoneNumber, email, password, cpassword, firmName, firmEmail, streetAddress, city, state, postalCode, country, firmPhoneNumber, website, firmSize, referenceFrom, services, role, firmURL, currency, language,userid, } = req.body;
  
    try {
      //check the email already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin with this Email already exists" });
      }
  
      const admin = await Admin.create({
        firstName,
        middleName,
        lastName,
        phoneNumber,
        email,
        password,
        cpassword,
        firmName,
        firmEmail,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        firmPhoneNumber,
        website,
        firmSize,
        referenceFrom,
        services,
        role,
        firmURL,
        currency,
        language,
        userid,
       
      });
      res.status(200).json({ message: "Admin created successfully", admin });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // DELETE a Admin
  const deleteAdmin = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Admin ID" });
    }
  
    try {
      const Admin = await Admin.findOneAndDelete({ _id: id });
  
      if (!Admin) {
        return res.status(404).json({ error: "No such Admin" });
      }
  
      res.status(200).json({ message: "Admin deleted successfully", Admin });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // UPDATE a Admin
  const updateAdmin = async (req, res) => {
    const { id } = req.params;
  console.log(req.params)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Admin ID" });
    }
  
    try {
      // Prepare the update object from the request body
    let updateData = { ...req.body };

     // If a file is uploaded, update the profile picture path
     if (req.file) {
      updateData.profilePicture = req.file.path; // Store the file path
    }

      const updatedAdmin = await Admin.findOneAndUpdate(
        { _id: id },
        updateData,
        { ...req.body },
        { new: true } // This option ensures that the updated document is returned
      );
  
      if (!updatedAdmin) {
        return res.status(404).json({ error: "No such Admin" });
      }
  
      res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  // UPDATE a Admin
  // const updateAdmin = async (req, res) => {
  //   const { id } = req.params;
  // console.log(req.params)
  //   if (!mongoose.Types.ObjectId.isValid(id)) {
  //     return res.status(404).json({ error: "Invalid Admin ID" });
  //   }
  
  //   try {
  //     const updatedAdmin = await Admin.findOneAndUpdate(
  //       { _id: id },
  //       { ...req.body },
  //       { new: true } // This option ensures that the updated document is returned
  //     );
  
  //     if (!updatedAdmin) {
  //       return res.status(404).json({ error: "No such Admin" });
  //     }
  
  //     res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // };
// UPDATE a password 
const updatePassword = async (req, res) => {
    const { email, password, cpassword } = req.body;

    try {
        // Check if password and confirm password match
        if (password !== cpassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }
       // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedcPassword = await bcrypt.hash(cpassword, 10);

        // Find the admin by email and update their password
        const updatedAdmin = await Admin.findOneAndUpdate(
            { email: email },
            { password: hashedPassword, cpassword: hashedcPassword },
            { new: true } // This option ensures that the updated document is returned
        );

        if (!updatedAdmin) {
            return res.status(404).json({ error: "No such Admin" });
        }
        res.status(200).json({ message: "Admin password updated successfully", admin: updatedAdmin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAdminByEmail = async (req, res) => {
    const { email } = req.params;

    try {
        // Find the admin by email
        const admin = await Admin.find({ email });

        if (!admin) {
            return res.status(404).json({ error: "No such Admin" });
        }

        res.status(200).json({ message: "Admin retrieved successfully", admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// const getAdminByEmail = async (req, res) => {
//   const { email } = req.params;

//   try {
//       // Find the admin by email
//       const admin = await Admin.findOne({ email });

//       if (!admin) {
//           return res.status(404).json({ error: "No such Admin" });
//       }

//       // Update the profilePicture field to include the public URL
//       if (admin.profilePicture) {
//           admin.profilePicture = `/middleware/uploads/${path.basename(admin.profilePicture)}`; // Ensure correct relative URL
//       }

//       res.status(200).json({ message: "Admin retrieved successfully", admin });
//   } catch (error) {
//       res.status(500).json({ error: error.message });
//   }
// };

module.exports = {
    createAdmin,
    getAdmins,
    getAdmin,
    deleteAdmin,
    updateAdmin,
    updatePassword,
    getAdminByEmail,
    getAdminByUserid
}

