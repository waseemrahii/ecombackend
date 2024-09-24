import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Please provide title."],
		},
		description: {
			type: String,
			required: [true, "Please provide description."],
		},
		image: {
			type: String,
		},
		status: {
			type: String,
			enum: ["active", "inactive"],
			default: "inactive",
		},
		count: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
