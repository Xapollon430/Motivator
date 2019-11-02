import React, { useState, useEffect } from "react";
import Users from "./Components/Users/Users";
import MotivatorData from "./Components/MotivatorData/MotivatorData";

import "bootstrap/dist/css/bootstrap.min.css";
import Logo from "./public/logo.png";
import "./App.css";

function App() {
	let [designers, updateDesigners] = useState(null);
	let [nations, updateNations] = useState(null);
	let [salesData, updateSalesData] = useState(null);
	let [currentSelected, updateCurrentSelected] = useState("");
	let [loading, updateLoading] = useState(false);

	return (
		<div className="wrapper">
			<div>
				<Users
					designers={designers}
					currentSelected={currentSelected}
					updateCurrentSelected={updateCurrentSelected}
					updateDesigners={updateDesigners}
					updateNations={updateNations}
					updateLoading={updateLoading}
				/>
			</div>
			<div className="mx-3">
				<img src={Logo} alt="Image"></img>
				<MotivatorData
					loading={loading}
					salesData={salesData}
					currentSelected={currentSelected}
					updateSalesData={updateSalesData}
					nations={nations}
					updateLoading={updateLoading}
				/>
			</div>
			<span class="deciLogo">
				Powered by <a href="https://decidigital.com/"> Deci Digital</a>
			</span>
		</div>
	);
}

export default App;
