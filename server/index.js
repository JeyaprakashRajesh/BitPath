require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./utils/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
	res.status(200).json({ message: "BitPath backend is running" });
});

app.use("/api/auth", authRoutes);

app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
	try {
		await connectDB();
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error.message);
		process.exit(1);
	}
};

startServer();
