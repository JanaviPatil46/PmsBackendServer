const ServiceTemplate = require('../models/serviceTemplateModel');
const mongoose = require("mongoose");

//get all ServiceTemplate
const getServiceTemplates = async (req, res) => {
    try {
        const serviceTemplate = await ServiceTemplate.find({}).sort({ createdAt: -1 }).populate({ path: 'category', model: 'Category' });
        res.status(200).json({ message: "ServiceTemplate retrieved successfully", serviceTemplate });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

//Get a single ServiceTemplate
const getServiceTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ServiceTemplate ID" });
    }

    try {
        const serviceTemplate = await ServiceTemplate.findById(id);
        if (!serviceTemplate) {
            return res.status(404).json({ error: "No such ServiceTemplate" });
        }

        res.status(200).json({ message: "ServiceTemplate retrieved successfully", serviceTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//POST a new ServiceTemplate 
const createServiceTemplate = async (req, res) => {
    const { serviceName, description, rate, ratetype, tax, category, active } = req.body;
    try {
        const existingTemplate = await ServiceTemplate.findOne({
            serviceName
        });

        if (existingTemplate) {
            return res.status(400).json({ message: "ServiceTemplate already exists" });
        }
        const newServiceTemplate = await ServiceTemplate.create({ serviceName, description, rate, ratetype, tax, category, active });
        return res.status(201).json({ message: "ServiceTemplate created successfully", newServiceTemplate });

    } catch (error) {
        console.error("Error creating ServiceTemplate:", error);
        return res.status(500).json({ error: "Error creating ServiceTemplate" });
    }
};


//delete a ServiceTemplate

const deleteServiceTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ServiceTemplate ID" });
    }
    try {
        const deletedServiceTemplate = await ServiceTemplate.findByIdAndDelete({ _id: id });
        if (!deletedServiceTemplate) {
            return res.status(404).json({ error: "No such ServiceTemplate" });
        }
        res.status(200).json({ message: "ServiceTemplate deleted successfully", deletedServiceTemplate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update a new ServiceTemplate 
const updateServiceTemplate = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ServiceTemplate ID" });
    }

    try {
        const updatedServiceTemplate = await ServiceTemplate.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );

        if (!updatedServiceTemplate) {
            return res.status(404).json({ error: "No such ServiceTemplate" });
        }

        res.status(200).json({ message: "ServiceTemplate Updated successfully", updatedServiceTemplate });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



//Get a single JobTemplate List
const getServiceTemplateById = async (req, res) => {
    const { id } = req.params;
    console.log(id)
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ServiceTemplate ID" });
    }
    try {
        const serviceTemplate = await ServiceTemplate.findById(id)
         .populate({ path: 'category', model: 'Category' });
                 
        if (!serviceTemplate) {
            return res.status(404).json({ error: "No such ServiceTemplate" });
        }

        res.status(200).json({ message: "ServiceTemplate retrieved successfully", serviceTemplate });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createServiceTemplate,
    getServiceTemplates,
    getServiceTemplate,
    deleteServiceTemplate,
    updateServiceTemplate,
    getServiceTemplateById
}