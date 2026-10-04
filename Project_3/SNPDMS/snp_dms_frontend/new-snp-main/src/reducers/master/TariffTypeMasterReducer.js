const initialState = {
    allTariffListing: [],
    TarrifDetails: [],
};

export default (state = initialState,action) => {
    switch(action.type){
        case "GET_ALL_TARIFF":
            return { ...state, allTariffListing: action.payload };
        case "GET_SINGLE_TARIFF_DETAIL":{
            return { ...state, TarrifDetails:action.payload };
        }
        case "CLEAN_TARIFF_MASTER":
            return{
                ...state,
                TarrifDetails:initialState.TarrifDetails,
            };
            default:
                return{...state};
    }
};