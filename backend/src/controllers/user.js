// controllers/user.js
import User from "../models/user.js";
import Listing from "../models/listing.js"; // *** NEW: Import Listing model for data cleanup ***
import getUsers from "../services/user.js" // Assuming your service is correctly implemented

// Existing getUser (Controller function needs to be asynchronous)
async function getUser(req,res) {
    try{
        // NOTE: The name 'getUsers' suggests it fetches all users, which might be restricted
        const users = await getUsers(); 
        res.json(users)
    }catch(error){
        res.status(500).json({message:error.message}) // Use error.message for better response
    }
}

// --- NEW: Controller function for DELETION ---
async function deleteUser(req, res) {
  // `req.user.id` is set by the `authenticateToken` middleware from the JWT payload
  const userId = req.user.id; 

  try {
    // 1. CRITICAL: Delete associated listings (Cleanup/Data Integrity)
    // Assuming your Listing model has an 'owner' field referencing the User model
    await Listing.deleteMany({ owner: userId });
    
    // 2. Delete the user account
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // 3. Success response (204 No Content is standard for successful DELETE)
    res.status(204).send(); 

  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    res.status(500).json({ message: 'Server error during account deletion.' });
  }
}

export { getUser, deleteUser }; // Export both functions