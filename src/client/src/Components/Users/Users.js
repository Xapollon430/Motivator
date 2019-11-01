import React, { useEffect } from "react";

const Users = ({ designers, currentSelected, updateDesigners, updateCurrentSelected, updateNations }) => {
	useEffect(() => {
		const getUsers = async () => {
			let usersResponse = await fetch("http://localhost:5000/users");
			let users = await usersResponse.json();
			updateNations(users.nationsEndPoint);
			updateDesigners(users);
		};
		getUsers();
	}, []);

	let navDesigners = null;

	if (designers) {
		let allUsers = [];
		allUsers.push(...designers.nationsEndPoint);
		allUsers.push(...designers.usersEndPoint);
		navDesigners = allUsers.map((designer, index) => {
			return designer === currentSelected ? (
				<div key={index} className="designerName currentDesigner">
					{designer}
				</div>
			) : (
				<div key={index} className="designerName">
					{designer}
				</div>
			);
		});
	}
	return (
		<div className="sideNav" onClick={event => updateCurrentSelected(event.target.innerHTML)}>
			{navDesigners}
		</div>
	);
};

export default Users;
