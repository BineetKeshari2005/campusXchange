import jwt from "jsonwebtoken"
import secretKey from "../configuration/jwtConfig.js"


export default function verifyToken(token){
    return jwt.verify(token,secretKey);
}