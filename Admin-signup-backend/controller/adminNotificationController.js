const Notification = require('../models/adminNotificationPreferences')
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")

// GET all Notifications
const getNotifications = async (req, res) => {
    try {
      const Notifications = await Notification.find({}).sort({ createdAt: -1 });
      res.status(200).json({ message: "Notifications retrieved successfully", Notifications });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // GET a single Notification
  const getNotification = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Notification ID" });
    }
    try {
      const notification = await Notification.findById(id);
      if (!notification) {
        return res.status(404).json({ error: "No such Notification" });
      }
      res.status(200).json({ message: "Notification retrieved successfully", notification });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // POST create a new Notification
  const createNotification = async (req, res) => {
    const { userId, notifications, active} = req.body;
  
    try {
      //check the email already exists
      const existingNotification = await Notification.findOne({ userId });
      if (existingNotification) {
        return res.status(400).json({ message: "Notification already exists" });
      }
  
      const notification = await Notification.create({
        userId, notifications, active});
      res.status(200).json({ message: "Notification created successfully", notification });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  // DELETE a Notification
  const deleteNotification = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Notification ID" });
    }
  
    try {
      const Notification = await Notification.findOneAndDelete({ _id: id });
  
      if (!Notification) {
        return res.status(404).json({ error: "No such Notification" });
      }
  
      res.status(200).json({ message: "Notification deleted successfully", Notification });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // UPDATE a Notification
  const updateNotification = async (req, res) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Invalid Notification ID" });
    }
  
    try {
      const updatedNotification = await Notification.findOneAndUpdate(
        { _id: id },
        { ...req.body },
        { new: true } // This option ensures that the updated document is returned
      );
  
      if (!updatedNotification) {
        return res.status(404).json({ error: "No such Notification" });
      }
  
      res.status(200).json({ message: "Notification updated successfully", notification: updatedNotification });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

    
  // GET a single Notification
  const getNotificationbyUser = async (req, res) => {
    const { userid } = req.params;
     try {

      const notification = await Notification.findOne({ userId: userid });
      if (!notification) {
        return res.status(404).json({ error: "No such Notification" });
      }
      res.status(200).json({ message: "Notification retrieved successfully", notification });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

  };
  

module.exports = {
    createNotification,
    getNotifications,
    getNotification,
    deleteNotification,
    updateNotification,
    getNotificationbyUser
}

