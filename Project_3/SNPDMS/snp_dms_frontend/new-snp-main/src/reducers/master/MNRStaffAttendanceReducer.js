export const MASTER_MNR_STAFF_ATTENDENCE = {
  GET_STAFF_ATTENDANCE_LIST: "GET_STAFF_ATTENDANCE_LIST",
  GET_STAFF_ATTENDANCE_LIST_RESET_SEARCH:
    "GET_STAFF_ATTENDANCE_LIST_RESET_SEARCH",
  GET_STAFF_ATTENDANCE_LIST_INIT: "GET_STAFF_ATTENDANCE_LIST_INIT",
  GET_SINGLE_STAFF_ATTENDANCE: "GET_SINGLE_STAFF_ATTENDANCE",
  GET_SINGLE_STAFF_ATTENDANCE_INIT: "GET_SINGLE_STAFF_ATTENDANCE_INIT",
  GET_STAFF_ATTENDANCE_DROPDOWN: "GET_STAFF_ATTENDANCE_DROPDOWN",
};

const initialState = {
  get_all_attendance_list: {
    pg_no: 1,
    on_page_data_client: 10,
    location: "West Bengal",
    site: "INGHK",
    from_date: "",
    to_date: "",
    role: "",
    firstName: "",
    lastName: "",
    data: [],
  },
  get_single_attendance: null,
  staff_attendance_dropdown: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST_RESET_SEARCH:
      return {
        ...state,
        get_all_attendance_list: {
          ...state.get_all_attendance_list,
          firstName: "",
          lastName: "",
          role: "",
          from_date: "",
          to_date: "",
        },
      };
    case MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_DROPDOWN:
      return {
        ...state,
        staff_attendance_dropdown: action.payload,
      };
    case MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST:
      return {
        ...state,
        get_all_attendance_list: {
          ...state.get_all_attendance_list,
          ...action.payload,
        },
      };
    case MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST_INIT: {
      return {
        ...state,
        refcodeDetget_all_attendance_listails:
          initialState.get_all_attendance_list,
      };
    }
    case MASTER_MNR_STAFF_ATTENDENCE.GET_SINGLE_STAFF_ATTENDANCE:
      return {
        ...state,
        get_single_attendance: action.payload,
      };
    case MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST_INIT: {
      return {
        ...state,
        get_single_attendance: initialState.get_single_attendance,
      };
    }
    default:
      return { ...state };
  }
};
