const initialState = {
  allCountryListing: [],
  countryDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_COUNTRIES":
      return { ...state, allCountryListing: action.payload };
    case "GET_SINGLE_COUNTRY_DETAIL": {
      return { ...state, countryDetails: action.payload };
    }
    case "CLEAN_COUNTRY_MASTER":
      return { ...state, countryDetails: initialState.countryDetails };
    default:
      return { ...state };
  }
};
