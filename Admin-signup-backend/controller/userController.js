// const User = require("../models/userModel");
// const mongoose = require("mongoose");
// const express = require("express");
// const bcrypt = require("bcryptjs");
// // const { use } = require("../middlewares/clientsignupOTPmail");

// const adminSignup = async (req, res) => {
//   const { username, email, password, role } = req.body;
//   console.log(req.body);

//   try {
//     const user = await User.signup({ username, email, password, role });
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// const adminInfo = async (req, res) => {
//   res.send("Hello World!");
// };

// //todo SOP api
// //GET all Users

// const getUsers = async (req, res) => {
//   const user = await User.find({}).sort({ createdAt: -1 });
//   res.status(200).json(user);
// };

// //GET a single User
// const getUser = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "no such User " });
//   }

//   const user = await User.findById(id);
//   if (!user) {
//     return res.status(404).json({ error: "no such User " });
//   }

//   res.status(200).json(user);
// };

// //create new user

// const createUser = async (req, res) => {
//   const { username, email, password, cpassword, role, access, loginStatus, active } = req.body;
//   console.log(req.body);

//   try {
//     const user = await User.create({ username, email, password, cpassword, role, access, loginStatus, active });
//     console.log(user)
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// //delete a User

// const deleteUser = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "no such User " });
//   }

//   const user = await User.findOneAndDelete({ _id: id });

//   if (!user) {
//     return res.status(404).json({ error: "no such User " });
//   }

//   res.status(200).json(user);
// };

// //update a User

// const updateUser = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(404).json({ error: "no such User " });
//   }

//   const user = await User.findOneAndUpdate(
//     { _id: id },
//     {
//       ...req.body,
//     }
//   );

//   if (!user) {
//     return res.status(404).json({ error: "no such User " });
//   }

//   res.status(200).json(user);
// };

// // UPDATE a password
// const updateUserPassword = async (req, res) => {
//   const { password } = req.body;
//   const { id } = req.headers;
//   const token = req.headers.authorization;
//   console.log(req.body)
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Find the user by id and update their password
//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { password: hashedPassword, cpassword: hashedPassword },
//       { new: true } // This option ensures that the updated document is returned
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ error: "No such User" });
//     }

//     res.status(200).json({ message: "User password updated successfully", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getUserByEmail = async (req, res) => {
//   const { email } = req.params;
//   try {
//     // Find the User by email
//     const user = await User.find({ email });

//     if (user.length === 0) {
//       return res.status(200).json({ error: "No such User", user });
//     }

//     res.status(200).json({ message: "User retrieved successfully", user });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // UPDATE a LoginStatus
// const updateLoginStatus = async (req, res) => {
//   const { email, loginStatus } = req.body;

//   try {
//     const updatedUser = await User.findOneAndUpdate(
//       { email: email },
//       { loginStatus: loginStatus },
//       { new: true } // This option ensures that the updated document is returned
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ error: "No such User" });
//     }
//     res.status(200).json({ message: "User Login Status updated successfully", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getUserListbyId = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(404).json({ error: "Invalid User ID" });
//     }

//     const user = await User.findById(id); // Pass id directly as a string

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const userslist = {
//       id: user._id,
//       FirstName: user.firstName,
//       MiddleName: user.middleName,
//       LastName: user.lastName,
//       Email: user.email,
//       Role: user.role,
//       Created: user.createdAt,
//     };

//     res.status(200).json({ message: "User retrieved successfully", user: userslist });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// // GET Users by Roles
// const getUsersByRoles = async (req, res) => {
//   const { roles } = req.query;

//   // Convert roles from a comma-separated string to an array
//   const rolesArray = roles.split(',');

//   try {
//     const users = await User.find({ role: { $in: rolesArray } }).sort({ createdAt: -1 });
//     if (users.length === 0) {
//       return res.status(404).json({ error: "No users found with the specified roles" });
//     }
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const getVerifyUserbyPassword = async (req, res) => {

//   const { email, password } = req.body;

//   try {
//     // Find the User by email
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({ error: "No such User" });
//     }

//     // Check if the password is correct
//     const isPasswordValid = bcrypt.compare(password, user.password);

//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Invalid password" });
//     }

//     res.status(200).json({ message: "User verified successfully", user });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = { createUser, getUsers, getUser, deleteUser, updateUser, adminSignup, updateUserPassword,
//   getUserByEmail, updateLoginStatus, getUserListbyId, getUsersByRoles, getVerifyUserbyPassword };

const User = require("../models/userModel");
const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");
const path = require('path');
const fs = require('fs');
const Account = require("../models/AccountModel");
const Contact = require("../models/contactsModel")
// const { use } = require("../middlewares/clientsignupOTPmail");

const adminSignup = async (req, res) => {
  const { username, email, password, role,login,notify,emailSync ,contactId } = req.body;
  console.log(req.body);

  try {
    const user = await User.signup({ username, email, password, role,login,notify,emailSync ,contactId });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const adminInfo = async (req, res) => {
  res.send("Hello World!");
};

//todo SOP api
//GET all Users

const getUsers = async (req, res) => {
  const user = await User.find({}).sort({ createdAt: -1 });
  res.status(200).json(user);
};

//GET a single User

const getUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "no such User " });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: "no such User " });
  }

  res.status(200).json(user);
};
const deleteUserByContactId = async (req, res) => {
  const { contactId } = req.params;

  // Validate contactId (adjust validation based on your contactId format)
  if (!contactId || contactId.trim() === '') {
    return res.status(400).json({ error: "Contact ID is required" });
  }

  try {
    // Find and delete the user by contactId
    const user = await User.findOneAndDelete({ contactId: contactId });
    
    if (!user) {
      return res.status(404).json({ error: "No user found with this contact ID" });
    }

    res.status(200).json({ 
      message: "User successfully deleted",
      deletedUser: user 
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error while deleting user" });
  }
};
//create new user

const createUser = async (req, res) => {
  const {
    username,
    email,
    password,
    cpassword,
    role,
    access,
    loginStatus,
    active,
  } = req.body;
  console.log(req.body);

  try {
    const user = await User.create({
      username,
      email,
      password,
      cpassword,
      role,
      access,
      loginStatus,
      active,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//delete a User

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "no such User " });
  }

  const user = await User.findOneAndDelete({ _id: id });

  if (!user) {
    return res.status(404).json({ error: "no such User " });
  }

  res.status(200).json(user);
};

//update a User

const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "no such User " });
  }

  const updatedUser = await User.findOneAndUpdate(
    { _id: id },
    { ...req.body },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ error: "no such User " });
  }
  res
    .status(200)
    .json({ message: "User updated successfully", user: updatedUser });
};



// UPDATE a password
const updateUserPassword = async (req, res) => {
  const { password } = req.body;
  const { id } = req.headers;
  const token = req.headers.authorization;
  console.log(req.body);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the user by id and update their password
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword, cpassword: hashedPassword },
      { new: true } // This option ensures that the updated document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "No such User" });
    }

    res
      .status(200)
      .json({
        message: "User password updated successfully",
        user: updatedUser,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserPasswordwithoutAut = async (req, res) => {
  const { password } = req.body;
  const { id } = req.headers;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find the user by id and update their password
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword, cpassword: hashedPassword },
      { new: true } // Ensure the updated document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "No such User" });
    }

    res
      .status(200)
      .json({
        message: "User password updated successfully",
        user: updatedUser,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    // Find the User by email
    const user = await User.find({ email });

    if (user.length === 0) {
      return res.status(200).json({ error: "No such User", user });
    }

    res.status(200).json({ message: "User retrieved successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getUserClientByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Find all users with this email
    const users = await User.find({ email });

    if (!users.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get userIds
    const userIds = users.map(u => u._id);

    // Find all accounts where userid includes one of these users
    const accounts = await Account.find({ userid: { $in: userIds } })
      .select("accountName userid");

    // Map accounts to users
    const usersWithAccounts = users.map(user => {
      const account = accounts.find(acc =>
        acc.userid.some(id => id.toString() === user._id.toString())
      );
      return {
        ...user.toObject(),
        // accountName: account ? account.accountName : null
 accountId: account ? account._id : null,
        accountName: account ? account.accountName : null
      };
    });

    res.json({ user: usersWithAccounts });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
 const createUserFromContact = async (req, res) => {
  try {
    const { contactId, password,username } = req.body;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (!contact.login) {
      return res.status(400).json({ message: "This contact is not marked as login user" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: username,
      email: contact.email,
      password: hashedPassword,
      role: "client",
      login: contact.login,
      notify: contact.notify,
      emailSync: contact.emailSync,
      contactId:contact._id
    });

    await newUser.save();

    // ?? After creating user ? reset login fields in Contact
    contact.login = false;
    contact.notify = false;
    contact.emailSync = false;
    //contact.userid = newUser._id
    await contact.save();

    res.status(201).json({
      message: "User created from contact successfully",
      user: newUser,
      updatedContact: contact,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user from contact", error: error.message });
  }
};

// UPDATE a LoginStatus
const updateLoginStatus = async (req, res) => {
  const { email, loginStatus } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { loginStatus: loginStatus },
      { new: true } // This option ensures that the updated document is returned
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "No such User" });
    }
    res
      .status(200)
      .json({
        message: "User Login Status updated successfully",
        user: updatedUser,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserListbyId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid User ID" });
    }

    const user = await User.findById(id); // Pass id directly as a string

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userslist = {
      id: user._id,
      FirstName: user.username,
      // MiddleName: user.middleName,
      // LastName: user.lastName,
      Email: user.email,
      Role: user.role,
      Created: user.createdAt,
    };

    res
      .status(200)
      .json({ message: "User retrieved successfully", user: userslist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Users by Roles
const getUsersByRoles = async (req, res) => {
  const { roles } = req.query;

  // Convert roles from a comma-separated string to an array
  const rolesArray = roles.split(",");

  try {
    const users = await User.find({ role: { $in: rolesArray } }).sort({
      createdAt: -1,
    });
    // if (users.length === 0) {
    //   return res.status(404).json({ error: "No users found with the specified roles" });
    // }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getVerifyUserbyPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the User by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "No such User" });
    }

    // Check if the password is correct
    const isPasswordValid = bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.status(200).json({ message: "User verified successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { id } = req.params; // Get user ID from URL params
    const user = await User.findById(id);
    
    if (!user) {
      // Delete the uploaded file if user doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old profile picture if exists
    if (user.profilePicture) {
      const oldImagePath = path.join(__dirname, '../uploads', user.profilePicture);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

  // Store path relative to uploads directory
    const relativePath = `users/${id}/${req.file.filename}`;
    user.profilePicture = `uploads/${relativePath}`; // Include 'uploads' in the stored path
    await user.save();

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: user.profilePicture // Returns "uploads/users/..."
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
};

const getUserByContactId = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(404).json({ error: "Invalid contact ID format" });
  }

  try {
    const user = await User.findOne({ contactId })
      .populate({
        path: "contactId",
        model: "Contacts",
        select: "_id contactName note", // ? only include these fields
      });


    if (!user) {
      return res.status(404).json({ error: "No user found with this contact ID" });
    }

    // ? Return a simplified object
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching user" });
  }
};

const updateEmailByContact = async (req, res) => {
  try {
    const { email } = req.body;
    const contactId = req.params.contactId;

    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(contactId);

    // Update all users who are linked with this contact
    const result = await User.updateMany(
      { contactId: objectId },
      { $set: { email: email } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "No users linked with this contact" });
    }

    res.status(200).json({
      message: "User emails updated successfully",
      updatedUsers: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating user email:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  adminSignup,
  updateUserPassword,
  getUserByEmail,
  updateLoginStatus,
  getUserListbyId,
  getUsersByRoles,
  getVerifyUserbyPassword,
  updateUserPasswordwithoutAut,updateEmailByContact,
  uploadProfilePicture,deleteUserByContactId ,getUserClientByEmail,createUserFromContact ,getUserByContactId 
};
