import User from "../models/User.js";
import Contact from "../models/Contact.js";
import bcrypt from "bcryptjs";
// CREATE user from contact with login=true

// export const createUserFromContact = async (req, res) => {
//   try {
//     const { contactId } = req.body;

//     // Fetch contact
//     const contact = await Contact.findById(contactId);
//     if (!contact) {
//       return res.status(404).json({ error: "Contact not found" });
//     }

//     if (!contact.login) {
//       return res
//         .status(400)
//         .json({ error: "This contact does not have login enabled" });
//     }

//     // Generate username from name
//     const username = `${contact.firstName} ${contact.lastName}`.toLowerCase();

//     // Hash a default password
//     const hashedPassword = await bcrypt.hash("changeme123", 10);

//     // Create user
//     const newUser = new User({
//       username,
//       email: contact.email,
//       password: hashedPassword,
//       role: "client",
//       login: contact.login,
//       notify: contact.notify,
//       emailSync: contact.emailSync,
//       contact: contact._id,
//     //   accountId,
//     });

//     await newUser.save();

//     res.status(201).json({
//       message: "User created from contact successfully",
//       user: newUser,
//     });
//   } catch (error) {
//     console.error("Error creating user from contact:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };
export const createUserFromContact = async (req, res) => {
  try {
    const { contactId, password } = req.body;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    if (!contact.login) {
      return res.status(400).json({ message: "This contact is not marked as login user" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: contact.contactName,
      email: contact.email,
      password: hashedPassword,
      role: "client",
      login: contact.login,
      notify: contact.notify,
      emailSync: contact.emailSync,
    });

    await newUser.save();

    // 🔹 After creating user → reset login fields in Contact
    contact.login = false;
    contact.notify = false;
    contact.emailSync = false;
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
// READ all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("contact");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// READ single user
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("contact");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE user
export const updateUser = async (req, res) => {
  try {
    const { username, email, role, login, notify, emailSync } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role, login, notify, emailSync },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
