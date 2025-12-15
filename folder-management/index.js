const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const docManagement = require("./Routes/docManagementRoutes");
const folderTempRoutes = require("./Routes/folderTemplate")
const accountsDocsRoutes = require("./Routes/accountsDocRoutes")
dotenv.config();
const app = express();
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    // Allow all localhost URLs
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
     return callback(null, true);
    }

    // Allow all subdomains or domains of snptaxes.com
   if (origin &&
    (origin.endsWith(".snptaxes.com") || origin === "https://snptaxes.com" || origin === "https://www.snptaxes.com")
) {
   return callback(null, true);
}
    // Otherwise, block
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));


//app.use(cors());


//app.use(express.json()); // ? Needed for JSON body
//app.use(express.urlencoded({ extended: true })); // ? For form submissions
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// Use routers

app.use("/api/docManagement", docManagement);
app.use("/api/foldertemp",folderTempRoutes);
app.use("/api/accountsdoc",accountsDocsRoutes)
const BASE_UPLOAD_PATH = path.join(__dirname, "uploads/FolderTemplates");
const BASE_DOC_PATH = path.join(__dirname, "uploads/accounts")
// Serve files under /uploads/FolderTemplates
app.use("/uploads/FolderTemplates", express.static(BASE_UPLOAD_PATH));
app.use("/uploads/accounts", express.static(BASE_DOC_PATH));
const PORT = 8020;
app.listen(PORT, () => console.log(`http://127.0.0.1:${PORT}`));
