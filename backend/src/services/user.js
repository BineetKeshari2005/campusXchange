import User from "../models/user.js"

async function getUsers() {
    const users = await User.find({})
    return users;
}

export default getUsers;