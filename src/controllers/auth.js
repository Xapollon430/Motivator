let jwt = require("jsonwebtoken");
let Token = require("../db/Token");

const auth = async (req, res, next) => {
	try {
		let token = req.header("Authorization").replace("Bearer ", ""); // splits the Bearer and hash token
		let checkToken = await Token.jwtToken.findOne({ jwtToken: token });
		if (!checkToken) {
			throw new Error();
		}
		next();
	} catch (e) {
		res.status(401).send({ error: "Authorize" });
	}
};

module.exports = auth;
