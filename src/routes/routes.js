const express = require("express");
const Router = express.Router();
const Controller = require("../controllers/controller.js");
Router.get("/designer", Controller.getDesigner);
Router.get("/nation", Controller.getNation);
Router.get("/users", Controller.getUsers);

module.exports = Router;
