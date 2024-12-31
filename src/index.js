import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
    app.on("error", () => {
      console.log("Not Able to connect Express server");
      throw error;
    });
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log(`server is running at ${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection Failed: " + error);
  });



  
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
