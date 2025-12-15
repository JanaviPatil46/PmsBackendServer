const Pipeline = require('../models/pipelineTemplateModel');
const Job = require('../models/JobModel')
const mongoose = require("mongoose");

//get all Pipelines
const getPipelines = async (req, res) => {
    try {
        const pipeline = await Pipeline.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: "Pipeline retrieved successfully", pipeline })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};

const getPipelinesWithActiveJobsCount = async (req, res) => {
    try {
      // Fetch all pipelines
      const pipelines = await Pipeline.find();
  
      // Fetch active jobs count for each pipeline
      const pipelinesWithJobCount = await Promise.all(
        pipelines.map(async (pipeline) => {
          const activeJobsCount = await Job.countDocuments({
            pipeline: pipeline._id,
            active: true,
          });
          return {
            ...pipeline.toObject(),
            activeJobsCount,
          };
        })
      );
  
      res.status(200).json({ success: true, data: pipelinesWithJobCount });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  
//get all Pipelines
const getPipelinesByUserId = async (req, res) => {
    try {
        const { userid } = req.params;

        // Fetch pipelines belonging to the given user
        const pipeline = await Pipeline.find({ availableto: userid }).sort({ createdAt: -1 });

        if (!pipeline.length) {
            return res.status(404).json({ message: "No pipelines found for this user" });
        }

        res.status(200).json({ message: "Pipelines retrieved successfully", pipeline });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Get a single Pipeline
const getPipeline = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Pipeline ID" });
    }
    try {
        const pipeline = await Pipeline.findById(id) .populate({ path: 'availableto', model: 'User' })
       .populate({ path : 'sortjobsby', model : 'SortJobsBy'})
        .populate({ path : 'defaultjobtemplate', model : 'JobTemplate'})
;

        if (!pipeline) {
            return res.status(404).json({ error: "No such Pipeline" });
        }

        res.status(200).json({ message: "Pipeline retrieved successfully", pipeline });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST a new Pipeline
//const createPipeline = async (req, res) => {
 //   try {
    //    let newPipeline;
      //  const { pipelineName, availableto, sortjobsby, defaultjobtemplate, accountId, description, duedate, accounttags, priority,days_on_Stage, assignees, name, startdate, stages, active } = req.body;

      //  newPipeline = await Pipeline.create({ pipelineName, availableto, sortjobsby, defaultjobtemplate, accountId, description, duedate, accounttags, priority,days_on_Stage, assignees, name, startdate, stages, active });

      //  res.status(200).json({
      //      message: "Pipeline created successfully",newPipeline      
      //  });

  //  } catch (error) {
     //   res.status(400).json({ error: error.message });
   // }
//};

// POST a new Pipeline


// CREATE Pipeline
const createPipeline = async (req, res) => {
  try {
    const {
      pipelineName,
      availableto,
      sortjobsby,
      defaultjobtemplate,
      accountId,
      description,
      duedate,
      accounttags,
      priority,
      days_on_Stage,
      assignees,
clientFacing_status,
      name,
      startdate,
      stages,
      active,
    } = req.body;

    // Validate required fields
    if (!pipelineName) {
      return res.status(400).json({ error: "pipelineName is required" });
    }

   
    // Create new pipeline document
    const newPipeline = new Pipeline({
      pipelineName,
      availableto,
      sortjobsby,
      defaultjobtemplate,
      accountId,
      description,
      duedate,
      accounttags,
      priority,
      days_on_Stage,
      assignees,
      name,
      startdate,
clientFacing_status,
      stages,
      active,
    });

    const savedPipeline = await newPipeline.save();
    return res.status(201).json({
      message: "Pipeline created successfully",
      pipeline: savedPipeline,
    });
  } catch (error) {
    console.error("Error creating pipeline:", error);

    // Handle duplicate name error
    if (error.code === 11000 && error.keyValue?.pipelineName) {
      return res.status(409).json({
        error: `Pipeline name '${error.keyValue.pipelineName}' already exists`,
      });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};
//delete a Pipeline

const deletePipeline = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Pipeline ID" });
    }

    try {
        const deletedPipeline = await Pipeline.findByIdAndDelete({ _id: id });
        if (!deletedPipeline) {
            return res.status(404).json({ error: "No such Pipeline" });
        }
        res.status(200).json({ message: "Pipeline deleted successfully", deletedPipeline });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

//update  Pipeline 
const updatePipeline = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Pipeline ID" });
    }

    try {
        const updatedPipeline = await Pipeline.findOneAndUpdate(
            { _id: id },
            { ...req.body },
            { new: true }
        );

        if (!updatedPipeline) {
            return res.status(404).json({ error: "No such Pipeline" });
       }
         res.status(200).json({ message: "Pipeline Updated successfully", updatedPipeline });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



//Get a single JobTemplate List
//const getPipelineTemplateList = async (req, res) => {
  //  const { id } = req.params;

  //  if (!mongoose.Types.ObjectId.isValid(id)) {
   //     return res.status(404).json({ error: "Invalid JobTemplate ID" });
   // }

   // try {
       // const pipelineTemplate = await Pipeline.findById(id)
       //  .populate({ path: 'availableto', model: 'User' })
       //  .populate({ path : 'sortjobsby', model : 'SortJobsBy'})
        // .populate({ path : 'defaultjobtemplate', model : 'JobTemplate'})
         

      //  if (!pipelineTemplate) {
      //      return res.status(404).json({ error: "No such PipelineTemplate" });
      //  }

       // res.status(200).json({ message: "PipelineTemplate retrieved successfully", pipelineTemplate });
   // } catch (error) {
     //   res.status(500).json({ error: error.message });
  //  }
//};

const getPipelineTemplateList = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid JobTemplate ID" });
  }

  try {
    const pipelineTemplate = await Pipeline.findById(id)
  .populate("availableto")
  .populate("sortjobsby")
  .populate("defaultjobtemplate")

  // ? refPath dynamic population (Mongoose handles automatically)
  .populate("stages.automations.selectedtemp")
  .populate("stages.automations.template")

  // ? Normal population
  .populate("stages.automations.selectedTags")
  .populate("stages.automations.addTags")
  .populate("stages.automations.removeTags")
  .populate("stages.automations.selectedAssignees")
  .populate("stages.automations.assigneesToRemove")
  .populate("stages.automations.selectedClientStatus");

    if (!pipelineTemplate) {
      return res.status(404).json({ error: "No such PipelineTemplate" });
    }

    res.status(200).json({
      message: "PipelineTemplate retrieved successfully",
      pipelineTemplate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const checkTemplateNameExists = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ exists: false, message: 'Name is required' });
  }

  try {
    const template = await Pipeline.findOne({ pipelineName: { $regex: `^${name.trim()}$`, $options: 'i' } });

    if (template) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking template name:', error);
    return res.status(500).json({ exists: false, message: 'Server error' });
  }
};

module.exports = {
    getPipelines,
    getPipeline,
    createPipeline,
    updatePipeline,
    deletePipeline,
    getPipelineTemplateList,
    getPipelinesByUserId,
    getPipelinesWithActiveJobsCount,checkTemplateNameExists 
}

