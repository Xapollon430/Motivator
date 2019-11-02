

export const salesReducer = (state = [], action) => {
    switch (action.type) {
        case 'SALES_UPDATE':
            return action.payload;
        default:
            return state;
    }
}