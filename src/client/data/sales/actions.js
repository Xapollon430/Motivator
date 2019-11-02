import { useState, useEffect } from 'react'
import { store } from "../store";

export const getSalesByNation = (name) => {
	return fetch(`http://localhost:5000/nation?name=${name}`)
		.then(res => res.data)
}

export const getSalesByDesigner = (name) => {
	return fetch(`http://localhost:5000/designer?name=${name}`)
		.then(res => res.data)
}

export const updateSales = (sales) => {
	store.dispatch({
		type: 'SALES_UPDATE',
		payload: sales
	})
}

export const useSales = () => {
	const [sales, setSales] = useState(
		store.getState().sales
	)

	useEffect(() => {
		const unsubscribe = store.subscribe(() => {
            const newSales = store.getState().sales
            if (newSales === sales) return
            setData(newSales)
        })
        return () => unsubscribe()
	})
}
