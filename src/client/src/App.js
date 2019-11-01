import React, { useState, useEffect } from "react";
import Users from "./Components/Users/Users";
import MotivatorData from "./Components/MotivatorData/MotivatorData";

import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "./images/logo.png";
import "./App.css";

function App() {
	let [designers, updateDesigners] = useState(null);
	let [nations, updateNations] = useState(null);
	let [salesData, updateSalesData] = useState(null);
	let [currentSelected, updateCurrentSelected] = useState("");

	return (
		<div className="wrapper">
			<div>
				<Users
					designers={designers}
					currentSelected={currentSelected}
					updateCurrentSelected={updateCurrentSelected}
					updateDesigners={updateDesigners}
					updateNations={updateNations}
				/>
			</div>
			<div className="mx-3">
				<img src={Logo} alt="Image"></img>
				<MotivatorData
					salesData={salesData}
					currentSelected={currentSelected}
					updateSalesData={updateSalesData}
					nations={nations}
				/>
			</div>
		</div>
	);
}

export default App;
