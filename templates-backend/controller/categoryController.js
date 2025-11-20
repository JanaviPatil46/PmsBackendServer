const Category = require('../models/categoryModel');
const mongoose = require("mongoose");

//get all Category
const getCategorys = async (req, res) => {
    try {
        const category = await Category.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "Category retrieved successfully", category });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

//Get a single Category
const getCategory = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Category ID" });
    }

    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: "No such Category" });
        }

        res.status(200).json({ message: "Category retrieved successfully", category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//POST a new Category 
const createCategory = async (req, res) => {
    const { categoryName, active } = req.body;
    try {
        const existingTemplate = await Category.findOne({
            categoryName
        });

        if (existingTemplate) {
            return res.status(400).json({ message: "Category already exists" });
        }
        const newCategory = await Category.create({ categoryName, active });
        return res.status(201).json({ message: "Category created successfully", newCategory });

    } catch (error) {
        console.error("Error creating Category:", error);
        return res.status(500).json({ error: "Error creating Category" });
    }
};


//delete a Category

const deleteCategory = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Category ID" });
    }
    try {
        const deletedCategory = await Category.findByIdAndDelete({ _id: id });
        if (!deletedCategory) {
            return res.status(404).json({ error: "No such Category" });
        }
        res.status(200).json({ message: "Category deleted successfully", deletedCategory });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update a new Category 
const updateCategory = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Category ID" });
    }

    try {
        const updatedCategory = await Category.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: "No such Category" });
        }

        res.status(200).json({ message: "Category Updated successfully", updatedCategory });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCategory,
    getCategorys,
    getCategory,
    deleteCategory,
    updateCategory,
}