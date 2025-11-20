const SidebarData = require("../models/sidebarData")
const mongoose = require('mongoose')
// get all sidebardata
const getSidebarData = async (req, res) => {
    const sidebardata = await SidebarData.find({}).sort({ createdAt: -1 })
    res.status(200).json(sidebardata)
}

// get single sidebardata
const getSidebarDataMenu = async (req, res) => {
    const { id } = req.params


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    const sidebardata = await SidebarData.findById(id)

    if (!sidebardata) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    res.status(200).json(sidebardata)

}


//create new sidebardata
const createSidebarData = async (req, res) => {
    const { label, path, icon, submenu } = req.body
    try {
        const sidebardata = await SidebarData.create({ label, path, icon, submenu })
        res.status(200).json(sidebardata)
    }
    catch (error) {
        res.status(400).json({ error: error.message })
    }
}

// delete sidebardata menu
const deleteSidebarData = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    const sidebardata = await SidebarData.findOneAndDelete({ _id: id })

    if (!sidebardata) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    res.status(200).json(sidebardata)
}

// update sidebardata menu
const updateSidebarData = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    const sidebardata = await SidebarData.findOneAndUpdate({ _id: id },{
        ...req.body
    })

    if (!sidebardata) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }
    res.status(200).json(sidebardata)
}

module.exports = {
    getSidebarData,
    createSidebarData,
    getSidebarDataMenu,
    deleteSidebarData,
    updateSidebarData
}