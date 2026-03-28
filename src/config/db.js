import mongoose from "mongoose";
const connectedToDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected successfully 🚀");
    } catch (error) {
        console.log("Database not connected");
        process.exit(1);
    }
}

export default connectedToDb;