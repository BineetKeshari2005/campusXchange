import jwt from "jsonwebtoken"
import secretKey from "../configuration/jwtConfig.js"

function generateToken(user){
    const payload ={
        id : user._id,
        email : user.email,
        name: user.name,
        role : user.role || "student",
    };
    return jwt.sign(payload,secretKey,{expiresIn:"7d"})
}

export default generateToken;