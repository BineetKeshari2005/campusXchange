import Message from "../models/message.js";
import Conversation from "../models/conversation.js";

const chatService = {
    async sendMessage(conversationId, senderId, receiverId, text) {
        // 1. Create the message
        const newMessage = new Message({
            conversationId,
            sender: senderId,
            text,
        });

        const savedMessage = await newMessage.save();

        // 2. Update the conversation's lastMessage
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            updatedAt: new Date(),
        });

        // 3. Return the populated message (if you want sender details, populate here)
        // For now, just return the message doc
        return savedMessage;
    },
};

export default chatService;
