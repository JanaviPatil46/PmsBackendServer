const TeamMember = require('../models/teamMemberModel')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

// GET all TeamMembers
const getTeamMembers = async (req, res) => {
    try {
      const teamMembers = await TeamMember.find({}).sort({ createdAt: -1 });
      res.status(200).json({ message: "Team Member retrieved successfully", teamMembers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // GET a single TeamMember
  const getTeamMember = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Team Member ID" });
    }
    try {
      const teamMember = await TeamMember.findById(id);
      if (!teamMember) {
        return res.status(404).json({ error: "No such Team Member" });
      }
      res.status(200).json({ message: "Team Member retrieved successfully", teamMember });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // POST create a new TeamMember
  // const createTeamMember = async (req, res) => {
  //   const { firstName, middleName, lastName, phoneNumber, role, email, managePayments, manageInvoices, managePipelines,
  //        manageJobRecurrence, manageTimeEntries, manageRatesinTimeEntries, manageAccounts, viewallAccounts, 
  //        manageTags, manageCustomFields, manageOrganizers, assignTeamMates, chargeFirmBalance, viewAllContacts, 
  //        manageContacts, manageProposals, manageSites, manageEmails, manageServices, editOrganizersAnswers, 
  //        managePublicFilterTemplates, manageDocuments, manageTemplates, manageIRSTranscripts, manageMarketPlace, 
  //        viewReporting, userid, active } = req.body;
  
  //   try {
  //     //check the email already exists
  //     const existingAdmin = await TeamMember.findOne({ email });
  //     if (existingAdmin) {
  //       return res.status(400).json({ message: "Team Member with this Email already exists" });
  //     }
  
  //     const teamMember = await TeamMember.create({
  //       firstName, middleName, lastName, phoneNumber, role, email, managePayments, manageInvoices, managePipelines,
  //        manageJobRecurrence, manageTimeEntries, manageRatesinTimeEntries, manageAccounts, viewallAccounts, 
  //        manageTags, manageCustomFields, manageOrganizers, assignTeamMates, chargeFirmBalance, viewAllContacts, 
  //        manageContacts, manageProposals, manageSites, manageEmails, manageServices, editOrganizersAnswers, 
  //        managePublicFilterTemplates, manageDocuments, manageTemplates, manageIRSTranscripts, manageMarketPlace, 
  //        viewReporting,userid,active
  //     });
  //     res.status(200).json({ message: "Team Member created successfully", teamMember });
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };
  // POST create a new TeamMember
const createTeamMember = async (req, res) => {
  const {
    firstName, middleName, lastName, phoneNumber, role, email, managePayments, manageInvoices, managePipelines,
    manageJobRecurrence, manageTimeEntries, manageRatesinTimeEntries, manageAccounts, viewallAccounts,
    manageTags, manageCustomFields, manageOrganizers, assignTeamMates, chargeFirmBalance, viewAllContacts,
    manageContacts, manageProposals, manageSites, manageEmails, manageServices, editOrganizersAnswers,
    managePublicFilterTemplates, manageDocuments, manageTemplates, manageIRSTranscripts, manageMarketPlace,
    viewReporting, userid, active
  } = req.body;

  try {
    // Check if the email already exists
    const existingAdmin = await TeamMember.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Team Member with this email already exists" });
    }

    // Get profile picture file path if uploaded
    let profilePicture = null;
    if (req.file) {
      profilePicture = req.file.path;  // Store the file path (uploads/filename)
    }

    // Create a new team member
    const teamMember = await TeamMember.create({
      firstName, middleName, lastName, phoneNumber, role, email, managePayments, manageInvoices, managePipelines,
      manageJobRecurrence, manageTimeEntries, manageRatesinTimeEntries, manageAccounts, viewallAccounts,
      manageTags, manageCustomFields, manageOrganizers, assignTeamMates, chargeFirmBalance, viewAllContacts,
      manageContacts, manageProposals, manageSites, manageEmails, manageServices, editOrganizersAnswers,
      managePublicFilterTemplates, manageDocuments, manageTemplates, manageIRSTranscripts, manageMarketPlace,
      viewReporting, userid, active,
      profilePicture // Save the file path for the profile picture
    });

    res.status(200).json({ message: "Team Member created successfully", teamMember });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
  
  // DELETE a Team Member
  const deleteTeamMember = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Team Member ID" });
    }
  
    try {
      const teamMember = await TeamMember.findOneAndDelete({ _id: id });
  
      if (!teamMember) {
        return res.status(404).json({ error: "No such Team Member" });
      }
  
      res.status(200).json({ message: "Team Member deleted successfully", teamMember });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // UPDATE a Team Member
  // const updateTeamMember = async (req, res) => {
  //   const { id } = req.params;
  
  //   if (!mongoose.Types.ObjectId.isValid(id)) {
  //     return res.status(404).json({ error: "Invalid Team Member ID" });
  //   }
  
  //   try {
  //     const updatedTeamMember = await TeamMember.findOneAndUpdate(
  //       { _id: id },
  //       { ...req.body },
  //       { new: true } // This option ensures that the updated document is returned
  //     );
  
  //     if (!updatedTeamMember) {
  //       return res.status(404).json({ error: "No such Team Member" });
  //     }
  
  //     res.status(200).json({ message: "Team Member updated successfully", TeamMember: updatedTeamMember });
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // };


  // UPDATE a Team Member
const updateTeamMember = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid Team Member ID" });
  }

  try {
    // Prepare the update object from the request body
    let updateData = { ...req.body };

    // If a file is uploaded, update the profile picture path
    if (req.file) {
      updateData.profilePicture = req.file.path; // Store the file path
    }

    // Find and update the team member document
    const updatedTeamMember = await TeamMember.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true } // This option ensures that the updated document is returned
    );

    if (!updatedTeamMember) {
      return res.status(404).json({ error: "No such Team Member" });
    }

    res.status(200).json({ message: "Team Member updated successfully", teamMember: updatedTeamMember });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
  

//get all TeamMember List
const getTeamMemberList = async (req, res) => {
  try {
    const { value } = req.params;

      // const teamMembers = await TeamMember.find({})
      const teamMembers = await TeamMember.find({ active: value });
                const teamMemberslist = teamMembers.map(teammember => {
          return {
              id: teammember._id,
              FirstName: teammember.firstName,
              MiddleName : teammember.middleName,
              LastName :teammember.lastName,
              Email: teammember.email,
              Role: teammember.role,
              Created: teammember.createdAt,
              
          };
      });


      //sort({ createdAt: -1 });
      res.status(200).json({ message: "TeamMembers retrieved successfully", teamMemberslist })
  } catch (error) {
      res.status(500).json({ error: error.message })
  }
};




// UPDATE a password 
const updateTeamMemberPassword = async (req, res) => {
    const { email, password, cpassword } = req.body;

    try {
        // Check if password and confirm password match
        if (password !== cpassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }
       // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedcPassword = await bcrypt.hash(cpassword, 10);

        // Find the admin by email and update their password
        const updatedTeamMember = await TeamMember.findOneAndUpdate(
            { email: email },
            { password: hashedPassword, cpassword: hashedcPassword },
            { new: true } // This option ensures that the updated document is returned
        );

        if (!updatedTeamMember) {
            return res.status(404).json({ error: "No such TeamMember" });
        }
        res.status(200).json({ message: "TeamMember password updated successfully", teamMember: updatedTeamMember });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const findTeamMemberByUserId = async (req, res) => {
  try {
    const { userid } = req.params;  // Get the userid from URL parameter
// Check if userid is provided and valid
if (!userid || !mongoose.Types.ObjectId.isValid(userid)) {
  return res.status(400).json({ message: "Invalid or missing userid" });
}
    // Find the team member with the matching userid
    const teammember = await TeamMember.findOne({ userid });

    if (!teammember) {
      return res.status(404).json({ message: "Team member not found" });
    }

    // Return the found team member
    res.status(200).json({message: "TeamMembers retrieved successfully",teammember});
  } catch (error) {
    console.error("Error finding team member:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const getTeamMemberByEmail = async (req, res) => {
    const { email } = req.params;

    try {
        // Find the admin by email
        const admin = await TeamMember.find({ email });

        if (!admin) {
            return res.status(404).json({ error: "No such TeamMember" });
        }

        res.status(200).json({ message: "TeamMember retrieved successfully", admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports = {
    createTeamMember,
    getTeamMembers,
    getTeamMember,
    deleteTeamMember,
    updateTeamMember,
    getTeamMemberList,
    updateTeamMemberPassword,
    findTeamMemberByUserId,getTeamMemberByEmail
}