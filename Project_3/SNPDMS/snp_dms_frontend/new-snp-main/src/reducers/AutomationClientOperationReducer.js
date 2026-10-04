export const AUTOMATION_CLIENT_GST_REMOVE_REDUCER = {
  AUTOMATION_CLIENT_GST_REMOVE_EXTRACT_DATA:
    "AUTOMATION_CLIENT_GST_REMOVE_EXTRACT_DATA",
  AUTOMATION_CLIENT_GST_REMOVE_EXTRACT_DATA_INIT:
    "AUTOMATION_CLIENT_GST_REMOVE_EXTRACT_DATA_INIT",
  AUTOMATION_CLIENT_PARTY_DATA_DROPDOWN_DEPENDENCY_TRANSFER:
    "AUTOMATION_CLIENT_PARTY_DATA_DROPDOWN_DEPENDENCY_TRANSFER",
  AUTOMATION_CLIENT_GST_NO_UPDATE_EXTRACT_DATA:
    "AUTOMATION_CLIENT_GST_NO_UPDATE_EXTRACT_DATA",
    AUTOMATION_CLIENT_GST_NO_UPDATE_EXTRACT_DATA_INIT:'AUTOMATION_CLIENT_GST_NO_UPDATE_EXTRACT_DATA_INIT'
};
const initialState = {
  client_gst_extract_data: null,
  client_party_data_dropDown: null,
  client_gst_update_extract_data: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_GST_REMOVE_EXTRACT_DATA:
      return {
        ...state,
        client_gst_extract_data: action.payload,
      };
    case AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_GST_NO_UPDATE_EXTRACT_DATA:
      return {
        ...state,
        client_gst_update_extract_data: action.payload,
      };
    case AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_PARTY_DATA_DROPDOWN_DEPENDENCY_TRANSFER:
      return {
        ...state,
        client_party_data_dropDown: action.payload,
      };
    case AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_GST_REMOVE_EXTRACT_DATA_INIT:
      return {
        ...state,
        client_gst_extract_data: initialState.client_gst_extract_data,
      };
    case AUTOMATION_CLIENT_GST_REMOVE_REDUCER.AUTOMATION_CLIENT_GST_NO_UPDATE_EXTRACT_DATA_INIT:
      return {...state,client_gst_update_extract_data:initialState.client_gst_update_extract_data}
    default:
      return { ...state };
  }
};
