import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { faker, simpleFaker } from '@faker-js/faker'

const createSingleChat = async (chatsCount) => {
    try {
        const users = await User.find().select("_id");
        const chatPromise = [];
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                chatPromise.push(
                    Chat.create({
                        name: faker.lorem.words(2),
                        members: [users[i], users[j]],
                    })
                );
            }
        }
        await Promise.all(chatPromise);
        console.log("Chats created successfully!", chatsCount);
        process.exit(1);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

const createGroupChat = async (groupChatsCount) => {
    try {
        const users = await User.find().select("_id");
        const chatPromise = [];
        for (let i = 0; i < groupChatsCount; i++) {
            const numMembers = simpleFaker.number.int({ min: 3, max: users.length });
            const members = [];
            for (let j = 0; j < numMembers; j++) {
                const randomIndex = Math.floor(Math.random() * users.length);
                const randomUser = users[randomIndex];

                if (!members.includes(randomUser)) {
                    members.push(randomUser);
                }
            }

            const chat = Chat.create({
                name: faker.lorem.words(1),
                groupChat: true,
                members,
                creator: members[0],
            })

            chatPromise.push(chat);
        }
        await Promise.all(chatPromise);
        console.log("Group Chats created successfully!", groupChatsCount);
        process.exit(1);
    } catch (error) {
        console.error(error);
        process.exit(1)
    }
}

const createMessages = async (numMessages) => {
    try {
        const users = await User.find().select("_id");
        const chats = await Chat.find().select("_id");

        const messagePromise = [];
        for (let i = 0; i < numMessages; i++) {
            const randomUser = Math.floor(Math.random() * users.length);
            const randomChat = Math.floor(Math.random() * chats.length);

            messagePromise.push(
                Message.create({
                    content: faker.lorem.sentence(),
                    sender: randomUser,
                    chat: randomChat
                })
            );
        }

        await Promise.all(messagePromise);
        console.log("Messages created successfully!", numMessages);
        process.exit(1);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

const createMessagesInAGroup = async (chatId, numMessages) => {
    try {
        const users = await User.find().select("_id");
        const messagePromise = [];
        for (let i = 0; i < numMessages; i++) {
            const randomUser = Math.floor(Math.random() * users.length);
            messagePromise.push(
                Message.create({
                    content: faker.lorem.sentence(),
                    sender: users[randomUser],
                    chat: chatId
                })
            )
        }
        await Promise.all(messagePromise);
        console.log("Messages created successfully in a group chat!", numMessages);
        process.exit(1);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
export {
    createSingleChat,
    createGroupChat,
    createMessages,
    createMessagesInAGroup,
}