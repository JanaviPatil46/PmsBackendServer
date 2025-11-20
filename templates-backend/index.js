const express = require("express");
const app = express();
const cors = require("cors");
const tagsRoutes = require("./routes/tagsRoutes");
const sortJobsByRoutes = require("./routes/sortJobsByRoutes");
const dbconnect = require("./database/db");
const jobTemplateRoutes = require("./routes/jobTemplateRoutes");
const emailTemplateRoutes = require("./routes/emailTemplateRoutes");
const pipelineTemplateRoutes = require("./routes/pipelineTemplateRoutes");
const taskTemplateRoutes = require("./routes/taskTemplateRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const CategoryRoutes = require("./routes/CategoryRoutes");
const invoiceTemplateRoutes = require("./routes/invoiceTemplateRoutes");
const ChatTemplateRoutes = require("./routes/ChatTempRoutes");
const ClientfacingjobstatusRoutes = require("./routes/ClientfacingjobstatusRoutes");
const ProposalsandelsRoutes = require("./routes/ProposalsandelsRoutes");
// Middleware
app.use(cors());
app.use(express.json());

// routes for tags
app.use("/tags", tagsRoutes);

// routes for sort jobs
app.use("/sortjobs", sortJobsByRoutes);

// routes for JobTemplates
app.use("/workflow/jobtemplate", jobTemplateRoutes);

// routes for emailtemplate
app.use("/workflow", emailTemplateRoutes);

// routes for pipelineTemplates
app.use("/workflow/pipeline", pipelineTemplateRoutes);

// routes for tasktemplate
app.use("/workflow/tasks", taskTemplateRoutes);

// routes for services
app.use("/workflow/services", serviceRoutes);

// routes for category
app.use("/workflow/category", CategoryRoutes);

// routes for category
app.use("/workflow/invoicetemp", invoiceTemplateRoutes);

app.use("/workflow/chats", ChatTemplateRoutes);

// routes for in backend clientfacing  index.js

app.use("/workflow/clientfacingjobstatus", ClientfacingjobstatusRoutes);

// routes for ChatTemplate
app.use("/workflow/proposalesandels", ProposalsandelsRoutes);
// database connect
dbconnect();

const port = process.env.PORT || 8002;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
