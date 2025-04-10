import { app } from "./src/app.js";
import dotenv from "dotenv";
import connectDB from "./src/db/connectDb.js";

// config environment files
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is running at :${port}`);
    });
  })
  .catch((err) => {
    console.log(`mongo db connection failed !! ${err}`);
  });
