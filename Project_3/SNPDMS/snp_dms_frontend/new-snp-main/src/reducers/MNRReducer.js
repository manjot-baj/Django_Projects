const initialState = {
  mnrListing: [],
  uploadEstimateDestim: [],
  container_list: [],
  make_available: false,

};

export default (state = initialState, action) => {
  switch (action.type) {
    case "MNR_SEARCH_RESULT":
      return { ...state, mnrListing: action.payload };
    case "UPLOAD_ESTIMATE_DESTIM":
      return { ...state, uploadEstimateDestim: action.payload };
    case "CLEAR_UPLOAD_ESTIMATE_DESTIM":
      return { ...state, uploadEstimateDestim: [] };
    case "MNR_ADD_SELECTED_CONTAINER":
      return {
        ...state,
        container_list: [...state.container_list, action.payload],
      };
    case "MNR_REMOVE_SELECTED_CONTAINER":
      var remCont = [...state.container_list].filter(
        (obj) => obj.pk !== action.payload
      );
      return { ...state, container_list: remCont };

    case "MNR_CHIP_RESET_SELECTION":
      var selectedChipContainer = [...state.container_list];

      selectedChipContainer.forEach((e) => {
        e["enabled"] = true;
      });

      return { ...state, container_list: selectedChipContainer };

    case "MNR_CHIP_SELECT_UNSELECT":
      var chipContainer = [...state.container_list];

      chipContainer.forEach((e) => {
        if (e["pk"] === action.payload) {
          e["enabled"] = !e["enabled"];
        }
      });

      return { ...state, container_list: chipContainer };

    case "SET_MAKE_AVAILABLE":
      return { ...state, make_available: action.payload };
    case "MNR_CLEAR_CONTAINER_LIST":
      return {
        ...state,
        container_list: [],
      };  
    default:
      return { ...state };
  }
};
