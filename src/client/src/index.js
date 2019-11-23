import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

fetch("https://ucsdashboard.herokuapp.com/cacheSales", {
	method: "POST"
});
console.log(123);

ReactDOM.render(<App />, document.getElementById("root"));
