import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

fetch("https://ucsdashboard.herokuapp.com/cacheSales", {
	method: "POST"
});

ReactDOM.render(<App />, document.getElementById("root"));
