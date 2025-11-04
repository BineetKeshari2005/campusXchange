import refresh from "../services/refreshToken.js";

async function refreshToken(req,res) {
    try{
        const {token} = req.body
        const newToken = await refresh(token);
        res.json({newToken:newToken})
    }catch(error){
        console.log("Error",error.message)
        res.status(401).json("Invalid token")
    }
}

export default refreshToken;