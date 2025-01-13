import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://shaidabmansoori:8755587919@food-del-cluster.puuld.mongodb.net/food-del"
    )
    .then(() => console.log("DB Connected"));
};
