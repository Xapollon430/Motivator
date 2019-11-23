import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

fetch("http://localhost:5000/cacheSales", {
	method: "POST"
});

ReactDOM.render(<App />, document.getElementById("root"));
