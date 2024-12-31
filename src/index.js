import dotenv from "dotenv";
import connectDB from "./db/index.js";
dotenv.config(
    {
        path: './.env'
    }
)
connectDB()




























// import dotenv from 'dotenv'
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express();
// dotenv.config({path:"../.env"})
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//      app.on('error',()=>
//     {
//         console.log("Error: " + error)
//         throw error;
//     })
//     app.listen(process.env.PORT,()=>
//     {
//         console.log("Listening on port " + process.env.PORT);
//     });
//   } catch (error) {
//     console.log("Not able to connect database: " + error.message);
//     throw error;
//   }
// })();
