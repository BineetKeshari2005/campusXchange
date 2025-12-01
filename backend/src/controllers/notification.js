import * as notificationService from "../services/notification.js";

export const myNotifications = async (req, res) => {
  const data = await notificationService.getNotifications(req.user.id);
  res.status(200).json(data);
};

export const readNotification = async (req, res) => {
  const updated = await notificationService.markAsRead(
    req.params.id,
    req.user.id
  );
  res.status(200).json(updated);
};
