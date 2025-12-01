import authService from "../services/login.js";

export default async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Call login service → returns { token, user }
    const { token, user } = await authService(email, password);
    
    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    // Customize the error response for better UX
    if (error.message.includes("not found")) {
      res.status(404).json({ message: "User not found, please sign up" });
    } else if (error.message.includes("Invalid password")) {
      res.status(401).json({ message: "Invalid password" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
