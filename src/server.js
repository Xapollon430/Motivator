const express = require("express");
const app = express();
const Router = require("./routes/routes");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(Router);

app.listen(PORT, () => {
	console.log("server started");
});
