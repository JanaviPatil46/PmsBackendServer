const AccessRight = require('../models/accessRightsModel');
const mongoose = require("mongoose");

//get all AccessRights
const getAccessRights = async (req, res) => {
    try {
        const AccessRights = await AccessRight.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "AccessRights retrieved successfully", AccessRights });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

//Get a single AccessRight
const getAccessRight = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid AccessRight ID" });
    }

    try {
        const accessRight = await AccessRight.findById(id);

        if (!AccessRight) {
            return res.status(404).json({ error: "No such AccessRight" });
        }

        res.status(200).json({ message: "AccessRight retrieved successfully", accessRight });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//POST a new AccessRight 
const createAccessRight = async (req, res) => {
    const { accessDescription, access, active } = req.body;

    try {
        // Check if an access right with the same accessDescription or access already exists
        const existingAccessRight = await AccessRight.findOne({ $or: [{ accessDescription }] });

        if (existingAccessRight) {
            return res.status(400).json({ error: "AccessRight already exists" });
        }

        // If access right does not exist, create a new one
        const newAccessRight = await AccessRight.create({ accessDescription, access, active });
        return res.status(201).json({ message: "AccessRight created successfully", newAccessRight });
    } catch (error) {
        console.error("Error creating AccessRight:", error);
        return res.status(500).json({ error: "Error creating AccessRight" });
    }
};


//delete a AccessRight

const deleteAccessRight = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid AccessRight ID" });
    }

    try {
        const deletedAccessRight = await AccessRight.findByIdAndDelete({ _id: id });
        if (!deletedAccessRight) {
            return res.status(404).json({ error: "No such AccessRight" });
        }
        res.status(200).json({ message: "AccessRight deleted successfully", deletedAccessRight });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update a new AccessRight 
const updateAccessRight = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid AccessRight ID" });
    }

    try {
        const updatedAccessRight = await AccessRight.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );

        if (!updatedAccessRight) {
            return res.status(404).json({ error: "No such AccessRight" });
        }

        res.status(200).json({ message: "AccessRight Updated successfully", updatedAccessRight });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAccessRight,
    getAccessRight,
    getAccessRights,
    deleteAccessRight,
    updateAccessRight
}