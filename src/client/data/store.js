import { createStore, combineReducers,  } from 'redux'
import { salesReducer } from './sales/reducer';

const reducers = combineReducers({
    sales: salesReducer
})

export const store = createStore(reducers)