const ProposalesAndElsTemplate = require("../models/proposalsandelsModel");
const mongoose = require("mongoose");

//get all ProposalesAndElsTemplate
const getProposalesAndElsTemplates = async (req, res) => {
  try {
    const proposalesAndElsTemplates = await ProposalesAndElsTemplate.find({}).sort({ createdAt: -1 });
    res.status(200).json({ message: "ProposalesAndEls Template retrieved successfully", proposalesAndElsTemplates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get a single ServiceTemplate
const getProposalesAndElsTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ProposalesAndEls Template ID" });
  }

  try {
    const proposalesAndElsTemplate = await ProposalesAndElsTemplate.findById(id);
    if (!proposalesAndElsTemplate) {
      return res.status(404).json({ error: "No such ProposalesAndEls Template" });
    }

    res.status(200).json({ message: "ProposalesAndEls Template retrieved successfully", proposalesAndElsTemplate });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//POST a new ServiceTemplate
const createProposalesAndElsTemplate = async (req, res) => {
  const { templatename, teammember, proposalname, introduction, terms, servicesandinvoices, introductiontextname, introductiontext, termsandconditionsname, termsandconditions, custommessageinemail, custommessageinemailtext, reminders, daysuntilnextreminder, numberofreminder, servicesandinvoicetempid, invoicetemplatename, invoiceteammember, issueinvoice, specificdate, specifictime, description, lineItems, summary, notetoclient, Addinvoiceoraskfordeposit, Additemizedserviceswithoutcreatinginvoices, paymentterms, paymentduedate, paymentamount, active } = req.body;
  try {
    const existingTemplate = await ProposalesAndElsTemplate.findOne({
      templatename,
    });
    if (existingTemplate) {
      return res.status(400).json({ message: "ProposalesAndEls Template already exists" });
    }
    const newProposalesAndElsTemplate = await ProposalesAndElsTemplate.create({ templatename, teammember, proposalname, introduction, terms, servicesandinvoices, introductiontextname, introductiontext, termsandconditionsname, termsandconditions, custommessageinemail, custommessageinemailtext, reminders, daysuntilnextreminder, numberofreminder, servicesandinvoicetempid, invoicetemplatename, invoiceteammember, issueinvoice, specificdate, specifictime, description, lineItems, summary, notetoclient, Addinvoiceoraskfordeposit, Additemizedserviceswithoutcreatinginvoices, paymentterms, paymentduedate, paymentamount, active });
    return res.status(201).json({ message: "ProposalesAndEls Template created successfully", newProposalesAndElsTemplate });
  } catch (error) {
    console.error("Error creating ProposalesAndEls Template:", error);
    return res.status(500).json({ error: "Error creating ProposalesAndEls Template" });
  }
};

//delete a ServiceTemplate

const deleteProposalesAndElsTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ProposalesAndEls Template ID" });
  }
  try {
    const deletedProposalesAndElsTemplate = await ProposalesAndElsTemplate.findByIdAndDelete({ _id: id });
    if (!deletedProposalesAndElsTemplate) {
      return res.status(404).json({ error: "No such ProposalesAndEls Template" });
    }
    res.status(200).json({ message: "ProposalesAndEls Template deleted successfully", deletedProposalesAndElsTemplate });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//update a new ServiceTemplate
const updateProposalesAndElsTemplate = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ProposalesAndEls Template ID" });
  }

  try {
    const updatedProposalesAndElsTemplate = await ProposalesAndElsTemplate.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });

    if (!updatedProposalesAndElsTemplate) {
      return res.status(404).json({ error: "No such ProposalesAndEls Template" });
    }

    res.status(200).json({ message: "ProposalesAndEls Template Updated successfully", updatedProposalesAndElsTemplate });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getProposalesAndElsTemplateById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ProposalesAndEls Template ID" });
  }

  try {
    const proposalesAndElsTemplate = await ProposalesAndElsTemplate.findById(id)
      .populate({
        path: "teammember",
        model: "User",
        // select: 'name email',  // Check if the users have the correct fields
      })
      .populate({
        path: "servicesandinvoicetempid",
        model: "InvoiceTemplate",
        // select: 'invoiceName totalAmount',  // Select necessary fields for debugging
      })
      .populate({
        path: "invoiceteammember",
        model: "User",
        // select: 'name email',  // Check if the users have the correct fields
      });

    if (!proposalesAndElsTemplate) {
      return res.status(404).json({ error: "No such ProposalesAndEls Template found" });
    }

    res.status(200).json({
      message: "ProposalesAndEls Template retrieved successfully",
      proposalesAndElsTemplate,
    });
  } catch (error) {
    console.error("Error retrieving template:", error);
    res.status(500).json({ error: "An error occurred while retrieving the template" });
  }
};

module.exports = {
  createProposalesAndElsTemplate,
  getProposalesAndElsTemplates,
  getProposalesAndElsTemplate,
  deleteProposalesAndElsTemplate,
  updateProposalesAndElsTemplate,
  getProposalesAndElsTemplateById,
};
