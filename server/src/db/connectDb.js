// import mongoose from "mongoose";

// const connectDB = async () => {
//   const DbName = 'development'
//   try {
//     const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`)
//     console.log (`\n mongodb connected !! host name : ${connectionInstance.connection.host}`)
//   } catch (error) {
//     console.log("mongodb connection Failed", error);
//     process.exit(1);
//   }
// };

// export default connectDB

import mongoose from "mongoose";

const connectDB = async () => {
  const DbName = 'online-lecture-scheduling'
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DbName}`)
    console.log (`\n mongodb connected !! host name : ${connectionInstance.connection.host}`)
  } catch (error) {
    console.log("mongodb connection Failed", error);
    process.exit(1);
  }
};

export default connectDB