import express from 'express';
import StepperForm from '../models/StepperForm.js';

const router = express.Router();

// Create new proposal
router.post('/', async (req, res) => {
  try {
    const proposalData = {
templatename:req.body.general.templateName || "",
      proposalName:req.body.general.proposalName|| "",

      general: req.body.general || {},
      introduction: req.body.introduction || {},
      terms: req.body.terms || {},
      services: req.body.services || { option: "", invoices: [], itemizedData: {} },
      payments: req.body.payments || {}
    };

    const proposal = new StepperForm(proposalData);
    await proposal.save();
    res.status(201).json(proposal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all proposals
router.get('/', async (req, res) => {
  try {
    const proposals = await StepperForm.find().sort({ createdAt: -1 });
res.json({ proposallist: proposals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get all proposals with only id, proposal name and template name
// router.get('/', async (req, res) => {
//   try {
//     const proposals = await StepperForm.find()
//       .select('_id general.templateName general.proposalName')
//       .sort({ createdAt: -1 });
    
//     // Transform the data to match your desired format
//     const proposallist = proposals.map(proposal => ({
//       _id: proposal._id,
//       proposalName: proposal.general?.proposalName,
//       templateName: proposal.general?.templateName
//     }));
    
//     res.json({ proposallist });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get single proposal
router.get('/:id', async (req, res) => {
  try {
    const proposal = await StepperForm.findById(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update proposal by ID
//router.put('/:id', async (req, res) => {
//  try {
  //  const proposal = await StepperForm.findByIdAndUpdate(
    //  req.params.id,
    //  req.body,

    //  { new: true, runValidators: true }
   // );
    
   // if (!proposal) {
   //   return res.status(404).json({ error: 'Proposal not found' });
   // }
    
  //  res.json(proposal);
 // } catch (error) {
 //   res.status(500).json({ error: error.message });
 // }
//});
router.put("/:id", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      templatename: req.body?.general?.templateName || "",
      proposalName: req.body?.general?.proposalName || "",
    };

    const proposal = await StepperForm.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }

    res.json(proposal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete proposal
router.delete('/:id', async (req, res) => {
  try {
    const proposal = await StepperForm.findByIdAndDelete(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    res.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;