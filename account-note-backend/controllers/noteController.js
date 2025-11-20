const Note = require("../model/noteModel");

// Create note
const createNote = async (req, res) => {
  try {
    const { account,noteData, createdBy ,pinned,active } = req.body;
    const note = await Note.create({ account,noteData, createdBy ,pinned,active});
    res.status(201).json({ message: "Note created successfully",note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find();
    res.status(200).json({ message: "Note retrieved successfully",notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get note by ID
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });
    res.status(200).json({ message: "Note retrieved successfully",note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update note
const updateNote = async (req, res) => {
  try {
    const { noteData,pinned,active } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { noteData,pinned,active },

      { new: true }
    );
    res.status(200).json({ message: "Note Updated successfully",note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete note
const deleteNote = async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(200).json({ message: "Note deleted successfully",deletedNote });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Get all notes for a given account
const getNotesByAccountId = async (req, res) => {
  try {
    const accountId = req.params.accountId;

    const notes = await Note.find({ account: accountId }).sort({ createdAt: -1 });

    res.status(200).json({message: "Note retrieved successfully",notes});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
  getNotesByAccountId
};
