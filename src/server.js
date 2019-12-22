const express = require("express");
const app = express();
const Router = require("./routes/routes");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const DB = require("./db/database");

DB.getSales();
dotenv.config();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(Router);

if (process.env.NODE_ENV === "production") {
	app.use(express.static("./src/client/build"));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "src", "client", "build", "index.html"));
	});
}
app.listen(PORT, () => {
	console.log("server started");
});
