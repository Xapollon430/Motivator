import { createStore } from "redux";

const initialState = {
	designers: "",
	nations: "",
	salesData: "",
	currentSelected: "",
	loading: false,
	loggedIn: false,
	loginFail: false,
	weeklyProductAndCustomerSource: ""
};

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case "UPDATE_DESIGNERS":
			return { ...state, designers: action.payload };
		case "UPDATE_NATIONS":
			return { ...state, nations: action.payload };
		case "UPDATE_SALES_DATA":
			return { ...state, salesData: action.payload };
		case "UPDATE_CURRENT_SELECTED":
			return { ...state, currentSelected: action.payload };
		case "UPDATE_LOADING":
			return { ...state, loading: action.payload };
		case "UPDATE_LOGGEDIN":
			return { ...state, loggedIn: action.payload };
		case "UPDATE_LOGIN_FAIL":
			return { ...state, loginFail: action.payload };
		case "UPDATE_WEEKLY_PRODUCT_AND_CUSTOMER_SOURCE":
			return { ...state, weeklyProductAndCustomerSource: action.payload };
		default:
			return { ...state };
	}
};

const store = createStore(reducer);

export default store;
