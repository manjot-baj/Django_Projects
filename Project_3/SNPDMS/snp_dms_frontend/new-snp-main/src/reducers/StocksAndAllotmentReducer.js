const initialState = {
  itemListing: [],
  showAllotmentSection: false,
  containerAllotmentDetails: null,
  selectedContainersList: [],
  selectedContainersListType: [],
  containerPK: [],
  nextPage: "someLink",
  prevPage: "someLink",
  totalPages: "",
  selectDropDownList: ["container_number", "cient", "Client Name", "Size"],
  out_history: "False",
  checkedRow: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "STOCK_ALLOTMENT_SEARCH_RESULT":
      return { ...state, itemListing: action.payload };
    case "STOCK_ALLOTMENT_NEXT_PAGE_LINK":
      return { ...state, nextPage: action.payload };
    case "SET_CHECK_ROW":
      return { ...state, checkedRow: action.payload };
    case "STOCK_ALLOTMENT_PREV_PAGE_LINK":
      return { ...state, prevPage: action.payload };
    case "STOCK_ALLOTMENT_TOTAL_PAGE_LINK":
      return { ...state, totalPages: action.payload };
    case "TOGGLE_SELF_STOCKS_SEARCH_VALUE":
      return { ...state, out_history: action.payload };
    case "RESET_STOCK_ALLOTMENT_NEXT_PAGE_LINK":
      return { ...state, nextPage: "someLink" };
    case "SHOW_ALLOTMENT_SECTION":
      return { ...state, showAllotmentSection: action.payload };
    case "SET_CONTAINER_ALLOTMENT_DETAILS":
      return { ...state, containerAllotmentDetails: action.payload };
    case "SELECTED_CONTAINERS_LIST_TYPE":
      return {
        ...state,
        selectedContainersListType: [
          ...state.selectedContainersListType,
          action.payload,
        ],
      };
    case "REMOVE_CONTAINERS_LIST_TYPE":
      var remContListType = [...state.selectedContainersListType];
      let abcd = remContListType.filter((c) => c.index !== action.payload);
      return { ...state, selectedContainersListType: abcd };

    case "ADD_ALLOTMENT_CONTAINER_PK":
      return {
        ...state,
        containerPK: [...state.containerPK, action.payload],
      };
    case "REMOVE_CONTAINER_PK":
      let stateDup = [...state.containerPK];
      let remCont = stateDup.filter((pk) => pk !== action.payload);
      return { ...state, containerPK: remCont };
    case "RESET_INITIAL_STATE":
      return initialState; // Reset the state to its initial value
    default:
      return { ...state };
  }
};
