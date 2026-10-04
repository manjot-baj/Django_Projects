const initialState = {
  allClientListing: [],
  clientDetails: {
    client_data: {
      name: "",
      code: "",
      alias_name_one: "",
      alias_name_two: "",
      type: "",
      shipping_line: "",
      office_address: "",
      city: "",
      state: "",
      zip: "",
      office_phone_no: "",
      mobile_no: "",
      email_id: "",
      website: "",
      fax: "",
      business_description: "",
      notes: "",
      cst_no: "",
      service_tax_no: "",
      bank_name: "",
      account_name: "",
      vat_no: "",
      ecc_no: "",
      bank_branch: "",
      account_no: "",
      gst_no: "",
      pan_no: "",
      ifsc_code: "",
      swift_code: "",
      edi_service: false,
      sales_term: false,
      ref_code: "",
      operator_code: "",
      current_location_code: "",
      location_code: "",
      edi_code: "",
      edi_to_email_id: "",
      edi_cc_email_id: "",
      reported_by_from: "",
      reported_by_to: "",
      is_sez:"",
      contact_person: "",
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
    },
    client_representative_data: [],
  },
  check: [],
  client_name: "",
  ref_code: "",
  type: "",
  pg_no: 1,
  on_page_data: 10,
  next_page: "",
  prev_page: "",
  total_pages: "",
  location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "CLIENT_MASTER_SET_ON_PAGE_VALUE":
      return {...state,on_page_data:action.payload}
    case "CLIENT_MASTER_SET_PG_NO":
      return {...state,pg_no:action.payload}
    case "CLIENT_MASTER_SET_NEXT_PAGE":
      return { ...state, next_page: action.payload };
    case "CLIENT_MASTER_SET_PREV_PAGE":
      return { ...state, prev_page: action.payload };
    case "CLIENT_MASTER_SET_TOTAL_PAGE":
      return { ...state, total_pages: action.payload };
    case "GET_ALL_CLIENTS":
      return { ...state, allClientListing: action.payload };
    case "CLEAR_GET_ALL_CLIENTS":
      return { ...state, allClientListing: action.payload };
    case "SET_CLIENT_NAME":
      return { ...state, client_name: action.payload };
    case "SET_CLIENT_REF_CODE":
      return { ...state, ref_code: action.payload };
    case "SET_CLIENT_TYPE":
      return { ...state, type: action.payload };
    case "ADD_CHECKBOX":
      var newArray = [...state.check];
      if (newArray.indexOf(action.payload) === -1) {
        newArray.push(action.payload);
      }
      return { ...state, check: newArray };
    case "REMOVE_CHECKBOX":
      var newArray1 = [...state.check];
      const index = newArray1.indexOf(action.payload);
      if (index > -1) {
        newArray1.splice(index, 1);
      }
      return { ...state, check: newArray1 };
    case "CLEAR_CHECKBOX":
      return { ...state, check: [] };
    case "GET_SINGLE_CLIENT_DETAIL": {
      return { ...state, clientDetails: action.payload };
    }
    case "CLEAN_CLIENT_MASTER":
      return { ...state, clientDetails: initialState.clientDetails };
    case "SET_MASTER_CLIENT_CODE":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            code: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_NAME":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            name: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_ALIAS_NAME_ONE":
      return {
        ...state,

        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            alias_name_one: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_ALIAS_NAME_TWO":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            alias_name_two: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_CONTACT_PERSON":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            contact_person: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_TYPE":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            type: action.payload,
          },
        },
      };
    case "SET_MASTER_SHIPPING_LINE":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            shipping_line: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_OFFICE_ADDRESS":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            office_address: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_CITY":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            city: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_STATE":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            state: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_ZIP":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            zip: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_OFFICE_PHONE_NO":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            office_phone_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_MOBILE_NO":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            mobile_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_EMAIL":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            email_id: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_WEBSITE":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            website: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_FAX":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            fax: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_BUSINESS_DESC":
      return {
        ...state,

        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            business_description: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_NOTES":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            notes: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_LOCATION":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            location: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_SITE":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            site: action.payload,
          },
        },
      };
    //  STATUOTORY
    case "SET_MASTER_CLIENT_CST_NO": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            cst_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_SERVICE_TAX_NO": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            service_tax_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_BANK_NAME": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            bank_name: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_ACCOUNT_NAME": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            account_name: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_VAT_NO": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            vat_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_ECC_NO": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            ecc_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_BANK_BRANCH": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            bank_branch: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_ACCOUNT_NUMBER": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            account_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_GST_NO": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            gst_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_PAN_NO": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            pan_no: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_IFSC_CODE": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            ifsc_code: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_SWIFT_CODE": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            swift_code: action.payload,
          },
        },
      };
    case "TOGGLE_CLIENT_MASTER_EDI_SERVICE": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            edi_service: action.payload,
          },
        },
      };
    case "TOGGLE_CLIENT_MASTER_SALES_TERM":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            sales_term: action.payload,
          },
        },
      };
    case "TOGGLE_CLIENT_MASTER_IS_SEZ_CUSTOMER":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            is_sez: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_REF_CODE": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            ref_code: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_OPERATOR_CODE": //
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            operator_code: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_CURRENT_LOCATION_CODE":
      return {
        ...state,

        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            current_location_code: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_LOCATION_CODE":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            location_code: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_EDI_CODE":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            edi_code: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_EDI_FROM_EMAIL_ID":
      return {
        ...state,

        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            edi_to_email_id: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_EDI_CC_EMAIL_ID":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            edi_cc_email_id: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_EDI_REPORTED_BY_FROM":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            reported_by_from: action.payload,
          },
        },
      };
    case "SET_MASTER_CLIENT_EDI_REPORTED_BY_TO":
      return {
        ...state,
        clientDetails: {
          ...state.clientDetails,
          client_data: {
            ...state.clientDetails.client_data,
            reported_by_to: action.payload,
          },
        },
      };

    // ***** ///
    case "SET_ADD_CLIENT_REPRESENTATIVE_DATA":
      let repData = {
        ...state.clientDetails,
        client_representative_data: [
          ...state.clientDetails.client_representative_data,
          action.payload,
        ],
      };

      return { ...state, clientDetails: repData };
    case "SET_REMOVE_CLIENT_REPRESENTATIVE_DATA":
      let removeRepData = {
        ...state.clientDetails,
        client_representative_data: [
          ...state.clientDetails.client_representative_data,
        ],
      };

      removeRepData.client_representative_data.splice(action.payload.index, 1);
      return { ...state, clientDetails: removeRepData };

    case "SET_REPRESENTATIVE_NAME":
      let repName = {
        ...state.clientDetails,
        client_representative_data: [
          ...state.clientDetails.client_representative_data,
        ],
      };

      repName.client_representative_data[action.payload.index] = {
        ...repName.client_representative_data[action.payload.index],
        name: action.payload.desc,
      };
      return { ...state, clientDetails: repName };
    case "SET_REPRESENTATIVE_DESIGNATION":
      let repDesig = {
        ...state.clientDetails,
        client_representative_data: [
          ...state.clientDetails.client_representative_data,
        ],
      };

      repDesig.client_representative_data[action.payload.index] = {
        ...repDesig.client_representative_data[action.payload.index],
        designation: action.payload.desc,
      };
      return { ...state, clientDetails: repDesig };
    case "SET_REPRESENTATIVE_EMAIL":
      let repEmail = {
        ...state.clientDetails,
        client_representative_data: [
          ...state.clientDetails.client_representative_data,
        ],
      };

      repEmail.client_representative_data[action.payload.index] = {
        ...repEmail.client_representative_data[action.payload.index],
        email_id: action.payload.desc,
      };
      return { ...state, clientDetails: repEmail };
    case "SET_REPRESENTATIVE_PHONE":
      let repPhone = {
        ...state.clientDetails,
        client_representative_data: [
          ...state.clientDetails.client_representative_data,
        ],
      };

      repPhone.client_representative_data[action.payload.index] = {
        ...repPhone.client_representative_data[action.payload.index],
        phone_no: action.payload.desc,
      };
      return { ...state, clientDetails: repPhone };
    case "SET_REPRESENTATIVE_MOBILE":
      let repMobile = {
        ...state.clientDetails,
        client_representative_data: [
          ...state.clientDetails.client_representative_data,
        ],
      };

      repMobile.client_representative_data[action.payload.index] = {
        ...repMobile.client_representative_data[action.payload.index],
        mobile_no: action.payload.desc,
      };
      return { ...state, clientDetails: repMobile };

    default:
      return { ...state };
  }
};
