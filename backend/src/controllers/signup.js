import userService from "../services/signup.js"; // ✅ use import with .js extension

 async function createUser(req, res) {
  try {
    const userData = req.body;
    const {user,token} = await userService.createUser(userData);
    
    res.status(201).json({ token:token,user, message: "User Created Successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
}
export default {createUser}


