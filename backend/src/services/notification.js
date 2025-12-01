import Notification from "../models/notification.js";

export const createNotification = async (userId, message, type, link = null) => {
  return await Notification.create({
    user: userId,
    message,
    type,
    link,
  });
};

export const getNotifications = async (userId) => {
  return await Notification.find({ user: userId })
    .sort({ createdAt: -1 });
};

export const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};
