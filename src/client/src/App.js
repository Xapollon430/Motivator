import React, { useState } from "react";
import Users from "./Components/Users/Users";
import MotivatorData from "./Components/MotivatorData/MotivatorData";
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";

function App() {
	let [designers, updateDesigners] = useState(null);
	let [nations, updateNations] = useState(null);
	let [salesData, updateSalesData] = useState(null);
	let [currentSelected, updateCurrentSelected] = useState("");
	let [loading, updateLoading] = useState(false);
	let [loggedIn, updateLogin] = useState(false);
	let [loginFail, loginFailUpdate] = useState(false);
	let [extraData, updateExtraData] = useState(null);

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
					loggedIn={loggedIn}
				/>
			</div>
			<div className="mx-3">
				<MotivatorData
					loading={loading}
					salesData={salesData}
					currentSelected={currentSelected}
					updateSalesData={updateSalesData}
					nations={nations}
					updateLoading={updateLoading}
					updateLogin={updateLogin}
					loginFail={loginFail}
					loginFailUpdate={loginFailUpdate}
					loggedIn={loggedIn}
					extraData={extraData}
					updateExtraData={updateExtraData}
				/>
			</div>

			<span className="deciLogo">
				Powered by <a href="https://decidigital.com/"> Deci Digital</a>
			</span>
		</div>
	);
}
export default App;
