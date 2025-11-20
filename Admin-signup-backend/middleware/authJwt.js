const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const tokenBlacklist = []; // Array to store invalidated tokens
const secretKey = process.env.TOKEN_KEY;

//function validateToken(req, res, next) {
//const token = req.headers.authorization;
//console.log("TOKEN", token)
 //if (!token) {
   //return res.status(401).json({ message: "Token is missing" });
  //}

 // // Check if token is in the blacklist
  //if (tokenBlacklist.includes(token)) {
   // return res.status(401).json({ error: "Access denied. Token is invalid." });
 //}

 //jwt.verify(token, secretKey, (err, decoded) => {
   // if (err) {
     // return res.status(400).json({ message: "Invalid token" });
    //}
    // //const token = token;
    //req.user = decoded; // Attach decoded user information to the request object
    //next();
// });
//}
function validateToken(req, res, next) {
  let token = req.headers.authorization || req.query.token;
console.log("TOKEN:", token)
  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }

  // ? Remove "Bearer " prefix if present
  if (token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  if (tokenBlacklist.includes(token)) {
    return res.status(401).json({ error: "Access denied. Token is invalid." });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(400).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
}
// Function to remove expired or unnecessary tokens from the blacklist
function cleanupBlacklist() {
  // Get the current timestamp
  const currentTime = Date.now();

  // Filter out tokens that are expired or no longer needed
  tokenBlacklist = tokenBlacklist.filter((token) => {
    // Parse the token to extract the expiration time (if available)
    const decodedToken = jwt.decode(token, { complete: true });
    const expirationTime = decodedToken?.payload?.exp * 1000; // Convert expiration time to milliseconds

    // Remove the token if it's expired or if the expiration time is in the past
    if (!expirationTime || expirationTime <= currentTime) {
      return false; // Remove the token from the blacklist
    }
    return true; // Keep the token in the blacklist
  });
}

// Handle user logout
const logout = async (req, res) => {
  const token = req.headers.authorization; // Assuming token is sent in the Authorization header
  // Add the token to the blacklist
  tokenBlacklist.push(token);
  res.status(200).json({ status: 200, message: "User logged out successfully." });
};

module.exports = { validateToken, logout, cleanupBlacklist };
