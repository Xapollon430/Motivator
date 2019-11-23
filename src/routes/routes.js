const express = require("express");
const Router = express.Router();
const Controller = require("../controllers/controller.js");
const auth = require("../controllers/auth");

Router.get("/designer", auth, Controller.getDesigner);
Router.get("/nation", auth, Controller.getNation);
Router.get("/users", auth, Controller.getUsers);
Router.get("/company", auth, Controller.getCompany);
Router.post("/login", Controller.Login);
// Router.post("/cacheSales", controller.cacheSales);

module.exports = Router;
