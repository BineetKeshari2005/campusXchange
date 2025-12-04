import Message from "../models/message.js";
import Conversation from "../models/conversation.js";

const chatService = {
    async sendMessage(conversationId, senderId, receiverId, text) {
       
        const newMessage = new Message({
            conversationId,
            sender: senderId,
            text,
        });

        const savedMessage = await newMessage.save();

       
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
            updatedAt: new Date(),
        });

        return savedMessage;
    },
};

export default chatService;
