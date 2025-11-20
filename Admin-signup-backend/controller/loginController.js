// const User = require("../models/userModel");
// const mongoose = require("mongoose");
// const jwt = require("jsonwebtoken");

// const secretKey = process.env.TOKEN_KEY;

// //todo Handle admin login
// const adminLogin = async (req, res) => {
//   const { email, password } = req.body;
//   const token = req.headers.authorization;

//   try {
//     const user = await User.login({ email, password });

//     if (!user) {
//       res.status(400).json({ error: "Invalid Details" })
//     }

//     else {
//       res.status(200).json({ status: 200, user });
//       console.log("Login Successfull.")
//     }
//   }
//   catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// };

// const generatetoken = async (req, res) => {
//   const { email, password, expiryTime } = req.body;
//   try {
//     const user = await User.login({ email, password });

//     if (!user) {
//       return res.status(422).json({ error: "Invalid Details" });
//     }

//     let expiresIn;
//     switch (expiryTime) {
//       case expiryTime:
//         expiresIn = expiryTime * 60 * 100; // This looks like a mistake, consider fixing
//     }

//     const payload = {
//       id: user._id,
//       role: user.role
//     };

//     jwt.sign(payload, secretKey, { expiresIn: expiryTime }, (err, token) => {
//       if (err) {
//         return res.status(500).json({ error: 'Token generation failed' });
//       }

//       const result = {
//         token
//       };

//       res.cookie('usercookie', result, {
//         httpOnly: true,
//       });

//       return res.status(200).json({ status: 200, result });
//     });
//   } catch (error) {
//     return res.status(404).json({ error: error.message });
//   }
// };

// module.exports = { adminLogin, generatetoken };

const User = require("../models/userModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
//const bcrypt =require("bcrypt")
const bcrypt = require("bcryptjs");
const secretKey = process.env.TOKEN_KEY;

//todo Handle admin login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const token = req.headers.authorization;

  try {
    const user = await User.login({ email, password });

    if (!user) {
      res.status(400).json({ error: "Invalid Details" });
    } else {
      res.status(200).json({ status: 200, user });
      console.log("Login Successfull.");
    }
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

//const generatetoken = async (req, res) => {
//  const { email, password, expiryTime } = req.body;
 // try {
 //   const user = await User.login({ email, password });

  //  if (!user) {
  //    return res.status(422).json({ error: "Invalid Details" });
  //  }

   // let expiresIn;
   // switch (expiryTime) {
   //   case expiryTime:
   //     expiresIn = expiryTime * 60 * 100; // This looks like a mistake, consider fixing
   // }

   // const payload = {
   //   id: user._id,
    //  role: user.role,
  //  };

   // jwt.sign(payload, secretKey, { expiresIn: expiryTime }, (err, token) => {
   //   if (err) {
   //    return res.status(500).json({ error: "Token generation failed" });
     // }

      //const result = {
     //   token,
    //  };

     // res.cookie("usercookie", result, {
    //    httpOnly: true,
    //  });

     // return res.status(200).json({ status: 200, result });
  //  });
 // } catch (error) {
  //  return res.status(404).json({ error: error.message });
//  }
//};

const generatetoken = async (req, res) => {
  const { email, username, password, expiryTime, userId } = req.body;
  console.log("Login request:", req.body);

  try {
    let user;

    if (userId) {
      // ? Prefer userId (safer than just email/username)
    //   user = await User.findOne({ _id: userId, email });
    //   if (!user) {
    //     return res.status(404).json({ error: "User not found for given ID and email" });
    //   }

    //   // verify password manually if not handled in schema
    //   const isMatch = await bcrypt.compare(password, user.password);
    //   if (!isMatch) {
    //     return res.status(401).json({ error: "Invalid password" });
    //   }
    // } 
    user = await User.findOne({ _id: userId, email });
  if (!user) {
    return res.status(404).json({ error: "User not found for given ID and email" });
  }

  // ? only check password if provided (normal login)
  if (password && password.trim() !== "") {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }
  }
    }
    else {
      // fallback to existing User.login logic
      user = await User.login({ email, username, password });
    }

    // Default to 8 hours if expiryTime is not valid
    const expiresIn = typeof expiryTime === "number" ? expiryTime : 28800;

    const payload = {
      id: user._id,
      role: user.role,
    };

    jwt.sign(payload, secretKey, { expiresIn }, (err, token) => {
      if (err) {
        return res.status(500).json({ error: "Token generation failed" });
      }

      const result = { token };

      res.cookie("usercookie", result, { httpOnly: true });

      return res.status(200).json({ status: 200, result });
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { adminLogin, generatetoken };
