import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import router from "./src/routes/userRoutes.js";
import fs from "node:fs";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
));

//routes
const routeFiles = fs.readdirSync("./src/routes");

routeFiles.forEach((file)=> {
    //use dynamic import
    import(`./src/routes/${file}`).then((route) => {
        app.use("/api/v1", route.default);
    }).catch((err) => {
        console.log(`There was an error...${err.message}`);
    })
})

const server = async () =>{
    try {
        await connect();

        app.listen(port, () =>{
            console.log(`Server is running on port...${port}`);
        })
    } catch (error) {
        console.log('Failed to start server...', error.message);
        process.exit(1);
    }
}

server();