import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./configuration/dbConfig.js";
import signupRoute from "./routes/signup.js";
import loginRoute from "./routes/login.js";
import bodyparser from "body-parser"
import userRoute from "./routes/user.js"


dotenv.config();
connectDB();


const app = express();
app.use(bodyparser.json());
app.use(express.json());
app.use(cors());

app.use("/user",signupRoute)
app.use("/auth",loginRoute)
app.use("/api",userRoute)
app.get("/", (req, res) => {
  res.send("CampusXchange API is running 🚀");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
