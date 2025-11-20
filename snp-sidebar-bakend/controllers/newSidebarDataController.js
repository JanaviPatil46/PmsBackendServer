const NewSidebarData = require("../models/newSidebarData")
const mongoose = require('mongoose')


// get 
const getNewSidebarData = async (req, res)=>{
    const newsidebardata = await NewSidebarData.find({}).sort({createdAt: -1})
    res.status(200).json(newsidebardata)
}
//create
const createNewSidebarData = async (req, res)=>{
    const {label,path,icon} = req.body
try{
    const newsidebardata = await NewSidebarData.create({label,path,icon})
    res.status(200).json(newsidebardata)
}
catch(error){
    res.status(400).json({error:error.message})
}
}
// get single sidebardata
const getNewSidebarDataMenu = async (req, res) => {
    const { id } = req.params


    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    const newsidebardata = await NewSidebarData.findById(id)

    if (!newsidebardata) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    res.status(200).json(newsidebardata)

}


// delete sidebardata menu
const deleteNewSidebarData = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    const newsidebardata = await NewSidebarData.findOneAndDelete({ _id: id })

    if (!newsidebardata) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    res.status(200).json(newsidebardata)
}

// update sidebardata menu
const updateNewSidebarData = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }

    const newsidebardata = await NewSidebarData.findOneAndUpdate({ _id: id },{
        ...req.body
    })

    if (!newsidebardata) {
        return res.status(404).json({ error: "No such a sidebar menu" })
    }
    res.status(200).json(newsidebardata)
}

module.exports = {
    getNewSidebarData,
    createNewSidebarData,
    updateNewSidebarData,
    deleteNewSidebarData,
    getNewSidebarDataMenu
}