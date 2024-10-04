import mongoose from "mongoose";

const adminWalletSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
    },
    userType: {
      type: String,
    },
    InhouseEarning: {
      type: String,
    },
    commissionEarned: {
      type: String,
    },
    deliveryChargeEarned: {
      type: String,
    },
    totalTaxCollected: {
      type: String,
    },
    pendingAmount: {
      type: String,
    },
  },
  { timestamps: true }
);

const Wallet = mongoose.model("AdminWallet", adminWalletSchema);

export default Wallet;
