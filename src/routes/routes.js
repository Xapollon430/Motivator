const express = require("express");
const Router = express.Router();
const Controller = require("../controllers/controller.js");
const auth = require("../controllers/auth");

Router.get("/designer", Controller.getDesigner);
Router.get("/nation", Controller.getNation);
Router.get("/users", Controller.getUsers);
Router.post("/login", Controller.Login);

module.exports = Router;
