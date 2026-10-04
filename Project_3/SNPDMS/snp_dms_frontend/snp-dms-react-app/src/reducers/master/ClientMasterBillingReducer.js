const initialState = {
  allClientListingNew: [],
  bill_to_party_address: "",
  bill_to_party_client: "",
  bill_to_party_client_pk: "",
  bill_to_party_gst_no: null,
  bill_to_party_state: null,
  bill_to_party_state_code: "",
  bill_to_party_zip_code: " ",
  main_client: "",
  state_codes: [],
  invoice_no: "",
  bill_type: "",
  location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
  client_child_company_list: [
    {
      pk: "",
      parent_company: "",
      name: "",
      address: "",
      state: "",
      gst_no: "",
      state_code: "",
      zip_code: " ",
    },
  ],
  invoice_lines: [
    {
      pk: 4,
      container_no: "",
      client: "",
      payment_type: "",
      original_amount: "",
      remaining_amount: "",
      rec_amount: 0,
      bill_id: "",
    },
  ],
  ship_to_party_client_pk: "",
  ship_to_party_client: "",
  ship_to_party_address: "",
  ship_to_party_gst_no: "",
  ship_to_party_state: "",
  ship_to_party_state_code: "",
  ship_to_party_zip_code: "",
  remark: "",
  checkNew: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_CLIENTS_NEW":
      return { ...state, allClientListingNew: action.payload };

    case "ADD_CHECKBOX_NEW":
      var newArray = [...state.checkNew];
      if (newArray.indexOf(action.payload) === -1) {
        newArray.push(action.payload);
      }
      return { ...state, checkNew: newArray };
    case "REMOVE_CHECKBOX_NEW":
      var newArray1 = [...state.checkNew];
      const index = newArray1.indexOf(action.payload);
      if (index > -1) {
        newArray1.splice(index, 1);
      }
      return { ...state, checkNew: newArray1 };
    case "CLEAR_CHECKBOX_NEW":
      return { ...state, checkNew: [] };
    default:
      return { ...state };
  }
};
