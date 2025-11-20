const mongoose = require('mongoose');
const Clientfacingjobstatuses = require('../models/clientfacingjobstatusesModel');

// get all Clientfacingjobstatuses
const getAllClientfacingjobstatuses = async (req,res)=>{

    try {
        const clientFacingJobStatues = await Clientfacingjobstatuses.find({}).sort({createdAt: -1})
    res.status(200).json({ message: "clientFacingJobStatues retrieved successfully", clientFacingJobStatues })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get single Clientfacingjobstatuses
const getSingleClientfacingjobstatuses = async (req,res)=>{
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:'No such a Clientfacingjobstatus'})
    }

    try {
        const clientfacingjobstatuses = await Clientfacingjobstatuses.findById(id);

        if (!clientfacingjobstatuses) {
            return res.status(404).json({ error: "No such Clientfacingjobstatus" });
        }

        res.status(200).json({ message: "Clientfacingjobstatus retrieved successfully", clientfacingjobstatuses });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//create new Clientfacingjobstatuses
const createClientfacingjobstatuses = async (req, res) => {
    const { clientfacingName,clientfacingColour,clientfacingdescription,active} = req.body
    try {
         const existingClientfacingjobstatus = await Clientfacingjobstatuses.findOne({ clientfacingName });

 if (existingClientfacingjobstatus) {
            return res.status(200).json({message: "Clientfacingjobstatus with this Name already exists" });
        }

        const newClientfacingjobstatus = await Clientfacingjobstatuses.create({ clientfacingName,clientfacingColour,clientfacingdescription,active })
        res.status(200).json({ message: "Clientfacingjobstatus created successfully", tags: newTag });
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delte Clientfacingjobstatuses
const deleteClientfacingjobstatuses = async(req, res)=>{
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Clientfacingjobstatus ID" });
    }

    try {
        const deletedClientfacingjobstatus = await Clientfacingjobstatuses.findByIdAndDelete({ _id: id });

        if (!deletedClientfacingjobstatus) {
            return res.status(404).json({ error: "No such Clientfacingjobstatus" });
        }

        res.status(200).json({ message: "Clientfacingjobstatus deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// update Clientfacingjobstatuses
const updateClientfacingjobstatus = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Clientfacingjobstatus ID" });
    }

    try {
        const updatedClientfacingjobstatuses = await Clientfacingjobstatuses.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true } // This option ensures that the updated document is returned
        );

        if (!updatedClientfacingjobstatuses) {
            return res.status(404).json({ error: "No such Clientfacingjobstatus" });
        }

        res.status(200).json({ message: "Clientfacingjobstatus updated successfully", clientfacingjobstatus: updatedClientfacingjobstatuses });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllClientfacingjobstatuses,
    getSingleClientfacingjobstatuses,
    createClientfacingjobstatuses,
    deleteClientfacingjobstatuses,
    updateClientfacingjobstatus,
    // getaccountcounttags
}