const initialState = {
    allServiceListing: [],
    deleteService: false,
    serviceDetails: null,
    serviceAdded: false,
    serviceUpdated: false,
    check: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case "GET_ALL_SERVICES":
            return { ...state, allServiceListing: action.payload };
        case "DELETE_SERVICE":
            return { ...state, deleteService: action.payload ? true : false };
        case "DELETE_SERVICE_RESET":
                return { ...state, deleteService: false };
        case "GET_SERVICE":
            return { ...state, serviceDetails: action.payload };
        case "CLEAR_SERVICE_DATA":
            return { ...state, serviceDetails: null };
        case "ADD_SERVICE":
            return { ...state, serviceAdded: action.payload ? true : false };
        case "UPDATE_SERVICE":
            return { ...state, serviceUpdated: action.payload ? true : false };

        default:
            return { ...state };
    }
};