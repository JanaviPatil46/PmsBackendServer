const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types; // Import ObjectId from mongoose
const Tags = require('../models/tagsModel');
const Accounts = require('../models/AccountModel')

// get all tags
const getAllTags = async (req,res)=>{
    // const tags = await Tags.find({}).sort({createdAt: -1})
    // res.status(200).json(tags)
    try {
        const tags = await Tags.find({}).sort({createdAt: -1})
    res.status(200).json({ message: "Tags retrieved successfully", tags })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get single tag
const getSingleTag = async (req,res)=>{
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:'No such a tag'})
    }

    // const tags = await Tags.findById(id)
    // if(!tags){
    //         return res.status(200).json({error:'No such a tag'})
    // }
    // res.status(200).json(tags)
    try {
        const tag = await Tags.findById(id);

        if (!tag) {
            return res.status(404).json({ error: "No such Tag" });
        }

        res.status(200).json({ message: "Tag retrieved successfully", tag });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



//create new contact
// const createTag = async (req, res) => {
//     const { tagName,tagColour,active} = req.body
//     try {
//          const existingTag = await Tags.findOne({ tagName });

//  if (existingTag) {
//             return res.status(200).json({message: "Tag with this TagName already exists" });
//         }

//         const newTag = await Tags.create({ tagName,tagColour,active })
//         res.status(200).json({ message: "Tag created successfully", tags: newTag });
//     }
//     catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }


// const createTag = async (req, res) => {
//     const { tagName, tagColour, active } = req.body;
//     try {
//         const existingTag = await Tags.findOne({ tagName });

//         if (existingTag) {
//             return res.status(200).json({
//                 message: "Tag with this TagName already exists",
//                 tags: existingTag // Send existing tag data
//             });
//         }

//         const newTag = await Tags.create({ tagName, tagColour, active });
//         res.status(200).json({ message: "Tag created successfully", tags: newTag });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };
const createTag = async (req, res) => {
    let { tagName, tagColour, active } = req.body;
    try {
        // Normalize the tag name (convert to lowercase and trim spaces)
        const normalizedTagName = tagName.trim();

        // Check if a tag with the same normalized name exists
        const existingTag = await Tags.findOne({ tagName: new RegExp(`^${normalizedTagName}$`, 'i') });

        if (existingTag) {
            return res.status(200).json({
                message: "Tag with this TagName already exists",
                tags: existingTag // Send existing tag data
            });
        }

        // Store the tag name in lowercase for consistency
        const newTag = await Tags.create({ tagName: normalizedTagName, tagColour, active });
        res.status(200).json({ message: "Tag created successfully", tags: newTag });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// delte tags
const deleteTags = async(req, res)=>{
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Tag ID" });
    }

    try {
        const deletedTag = await Tags.findByIdAndDelete({ _id: id });

        if (!deletedTag) {
            return res.status(404).json({ error: "No such Tag" });
        }

        res.status(200).json({ message: "Tag deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// update tags
const updateTags = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Tag ID" });
    }

    try {
        const updatedTag = await Tags.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true } // This option ensures that the updated document is returned
        );

        if (!updatedTag) {
            return res.status(404).json({ error: "No such Tag" });
        }

        res.status(200).json({ message: "Tag updated successfully", tag: updatedTag });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// const { ObjectId } = mongoose.Types; // Import ObjectId from mongoose

const getaccountcounttags = async (req, res) => {
    try {
        const accounts = await Accounts.find().populate('tags');
        const tags = await Tags.find().sort({ createdAt: -1 });
        // if (!tags || tags.length === 0) {
        //     return res.status(404).json({ error: "No tags found" });
        // }
        const tagCounts = [];

        for (const tag of tags) {
            try {
                // Create a new ObjectId instance
                const accountCount = await Accounts.countDocuments({ tags: new ObjectId(tag._id) }); // Use new ObjectId here
                // console.log(Count for tag ${tag.tagName}: ${accountCount});

                tagCounts.push({
                    tagName: tag.tagName,
                    _id: tag._id,
                    tagColour:tag.tagColour,
                    count: accountCount,
                    archivedAccounts:0,
                    pendingTasks:0,
                    completedTasks:0,
                    pipelines:0
                });
            } catch (err) {
                console.error(`Error counting accounts for tag ${tag.tagName}:`, err);
            }
        }
        return res.status(200).json({ tagCounts });
    } catch (error) {
        console.error("Error processing request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
// Function to find tags by tagName
// const findTagsByName = async (req, res) => {
//     try {
//         const { tagName } = req.query;
//         if (!tagName) {
//             return res.status(400).json({ message: "tagName is required" });
//         }

//         // Find tags with case-insensitive matching
//         const tags = await Tags.find({ tagName: { $regex: new RegExp(tagName, "i") } });

//         if (tags.length === 0) {
//             return res.status(404).json({ message: "No tags found" });
//         }

//         res.json(tags);
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };

const findTagsByName = async (req, res) => {
    try {
        let { tagName } = req.query;
        if (!tagName) {
            return res.status(400).json({ message: "tagName is required" });
        }

        tagName = tagName.trim(); // Remove leading/trailing spaces

        console.log("Searching for tag:", tagName); // Debug log

        // Case-insensitive search
        const tags = await Tags.find({ tagName: { $regex: `^${tagName}$`, $options: "i" } });

        if (tags.length === 0) {
            return res.status(404).json({ message: "No such tag found" });
        }

        res.json(tags);
    } catch (error) {
        console.error("Error finding tag:", error); // Log error
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
module.exports = {
    getAllTags,
    getSingleTag,
    createTag,
    deleteTags,
    updateTags,
    getaccountcounttags,
    findTagsByName
}