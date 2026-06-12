import mongoose from "mongoose";

export const connectToDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_DB_URL;

  if (!mongoUri) {
    throw new Error("MONGO_DB_URL is not defined in .env");
  }

  try {
    await mongoose.connect(mongoUri);

    mongoose.connection.on("disconnected", () => {
      console.warn(" MongoDB disconnected");
    });
  } catch (error) {
    console.error(`MongoDB connection failed`, error);
  }

  console.log(`connected to  MongoDB`);
};
