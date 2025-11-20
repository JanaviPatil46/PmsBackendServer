const Roles = require('../models/roleModel')
const mongoose = require('mongoose')

//GET all roles 
const getRoles = async (req, res) => {
    try {
        const roles = await Roles.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "Roles retrieved successfully", roles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//GET a single role
const getRole = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Role ID" });
    }

    try {
        const role = await Roles.findById(id);

        if (!role) {
            return res.status(404).json({ error: "No such Role" });
        }

        res.status(200).json({ message: "Role retrieved successfully", role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//POST create a new role

const createRole = async (req, res) => {
    const { role } = req.body;

    try {

        const existingRole = await Roles.findOne({role});
        if (existingRole){
            return res.status(400).json({message: "Role already exists"});
        }


        const newRole = await Roles.create({ role });
        res.status(200).json({ message: "Role created successfully", role: newRole });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
//delete a role

const deleteRole = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Role ID" });
    }

    try {
        const deletedRole = await Roles.findByIdAndDelete({ _id: id });

        if (!deletedRole) {
            return res.status(404).json({ error: "No such Role" });
        }

        res.status(200).json({ message: "Role deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// update a new role
const updateRole = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Role ID" });
    }

    try {
        const updatedRole = await Roles.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true } // This option ensures that the updated document is returned
        );

        if (!updatedRole) {
            return res.status(404).json({ error: "No such Role" });
        }

        res.status(200).json({ message: "Role updated successfully", role: updatedRole });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createRole,
    getRoles,
    getRole,
    deleteRole,
    updateRole
}

