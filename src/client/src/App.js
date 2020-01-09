import React from "react";
import Users from "./Components/Users/Users";
import MotivatorData from "./Components/MotivatorData/MotivatorData";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import store from "./Store/reducer";
import "./App.css";

function App() {
	return (
		<Provider store={store}>
			<div className="wrapper">
				<div>
					<Users />
				</div>
				<div className="mx-3">
					<MotivatorData />
				</div>
				<span className="deciLogo">
					Powered by <a href="https://decidigital.com/"> Deci Digital</a>
				</span>
			</div>
		</Provider>
	);
}
export default App;
