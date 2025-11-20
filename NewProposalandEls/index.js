import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import proposalRoutes from './routes/proposals.js';
import accountProposalRoutes from "./routes/accountProposal.js"
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/proposals', proposalRoutes);
app.use('/account/proposals',accountProposalRoutes)

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/proposal-app')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(error));