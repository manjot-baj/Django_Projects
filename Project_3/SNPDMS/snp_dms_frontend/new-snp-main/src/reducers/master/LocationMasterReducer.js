const initialState = {
  allLocationListing: [],
  locationDetails: [],
  countryData :[],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_LOCATIONS":
      return { ...state, allLocationListing: action.payload };
    case "GET_SINGLE_LOCATION_DETAIL": {
      return { ...state, locationDetails: action.payload };
    }
    case "GET_COUNTRY_DATA": {
      return { ...state, countryData: action.payload };
    }
    case "CLEAN_LOCATION_MASTER":
      return { ...state, locationDetails: initialState.locationDetails };
    default:
      return { ...state };
  }
};
