const initialState = {
  allExportCargoTypeListing: [],
  exportCargoTypeDetails: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_EXPORT_CARGO_TYPE":
      return { ...state, allExportCargoTypeListing: action.payload };
    case "GET_SINGLE_EXPORT_CARGO_TYPE_DETAIL": {
      return { ...state, exportCargoTypeDetails: action.payload };
    }
    case "CLEAN_EXPORT_CARGO_TYPE_MASTER":
      return {
        ...state,
        exportCargoTypeDetails: initialState.exportCargoTypeDetails,
      };
    default:
      return { ...state };
  }
};
