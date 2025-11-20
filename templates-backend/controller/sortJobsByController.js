const SortJobsBy = require('../models/sortJobsByModel');
const mongoose = require('mongoose')

//GET all SortJobsBy 
const getSortJobsBy = async (req, res) => {
    try {
        const sortJobsBy = await SortJobsBy.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "Sort Jobs By retrieved successfully", sortJobsBy });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//GET a single SortJobBy
const getSortJobBy = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Sort Job By ID" });
    }

    try {
        const sortJobBy = await SortJobsBy.findById(id);

        if (!sortJobBy) {
            return res.status(404).json({ error: "No such Role" });
        }

        res.status(200).json({ message: "Sort Job By retrieved successfully", sortJobBy });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//POST create a SortJobsBy

const createSortJobsBy = async (req, res) => {
    const { description } = req.body;
    try {
        const existingSortJobsBy = await SortJobsBy.findOne({description});
        if (existingSortJobsBy){
            return res.status(400).json({message: "Sort Jobs By already exists"});
        }
        const newSortJobsBy = await SortJobsBy.create({ description });
        res.status(200).json({ message: "Sort Jobs By created successfully", SortJobsBy: newSortJobsBy });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
//delete a role

const deleteSortJobsBy = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Sort Jobs By ID" });
    }

    try {
        const deletedSortJobsBy = await SortJobsBy.findByIdAndDelete({ _id: id });

        if (!deletedSortJobsBy) {
            return res.status(404).json({ error: "No such Sort Jobs By" });
        }

        res.status(200).json({ message: "Sort Jobs By deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// update a new role
const updateSortJobsBy = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Sort Jobs By ID" });
    }

    try {
        const updatedSortJobsBy = await SortJobsBy.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true } // This option ensures that the updated document is returned
        );

        if (!updatedSortJobsBy) {
            return res.status(404).json({ error: "No such Sort Jobs By" });
        }

        res.status(200).json({ message: "SortJobsBy updated successfully", SortJobsBy: updatedSortJobsBy });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createSortJobsBy,
    getSortJobsBy,
    getSortJobBy,
    deleteSortJobsBy,
    updateSortJobsBy
}

