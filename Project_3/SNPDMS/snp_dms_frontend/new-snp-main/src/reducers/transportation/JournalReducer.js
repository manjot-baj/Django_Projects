const initialState = {
    allJournalListing: [],
    deleteJournal: false,
    journalDetails: null,
    journalAdded: false,
    journalUpdated: false,
    check: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_JOURNALS":
        return { ...state, allJournalListing: action.payload };
      case "DELETE_JOURNAL":
        return { ...state, deleteJournal: action.payload ? true : false };
        case "DELETE_JOURNAL_RESET":
          return { ...state, deleteJournal: false };
      case "GET_JOURNAL":
        return { ...state, journalDetails: action.payload };
      case "CLEAR_JOURNAL_DATA":
        return { ...state, journalDetails: null };
      case "ADD_JOURNAL":
        return { ...state, journalAdded: action.payload ? true : false };
      case "UPDATE_JOURNAL":
        return { ...state, journalUpdated: action.payload ? true : false };
      default:
        return { ...state };
    }
  };