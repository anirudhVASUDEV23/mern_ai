import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // this is essential!

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.log("❌ failed to connect with mongo");
    console.error(err);
  }
};

export default connectDB;
