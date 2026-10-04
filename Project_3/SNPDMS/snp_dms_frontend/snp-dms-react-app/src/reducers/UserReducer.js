export const USER_INFO = {
  PROCUREMENT_MODULE: "PROCUREMENT_MODULE",
  LOLO_FINANCE_MODULE: "LOLO_FINANCE_MODULE",
  EN_BLOCK_MOVEMENT_MODULE: "EN_BLOCK_MOVEMENT_MODULE",
  EN_BLOCK_MOVEMENT_VERSION_2: "EN_BLOCK_MOVEMENT_VERSION_2",
  MNR_TEAM: "MNR_TEAM",
  IS_PAID: "IS_PAID",
  TRUCK_TRACKING:"TRUCK_TRACKING"
};

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
  location_id: localStorage.getItem("location_id")
    ? localStorage.getItem("location_id")
    : null,
  site_id: localStorage.getItem("site_id")
    ? localStorage.getItem("site_id")
    : null,
  type: localStorage.getItem("type") ? localStorage.getItem("type") : null,
  mnr_module: localStorage.getItem("mnr_module")
    ? localStorage.getItem("mnr_module") === "true"
      ? "True"
      : "False"
    : null,
  transportation_module: localStorage.getItem("transportation_module")
    ? localStorage.getItem("transportation_module") === "true"
      ? "True"
      : "False"
    : null,
  new_billing_module: localStorage.getItem("new_billing_module")
    ? localStorage.getItem("new_billing_module") === "true"
      ? "True"
      : "False"
    : null,
  loaded_yard_module: localStorage.getItem("loaded_yard_module")
    ? localStorage.getItem("loaded_yard_module") === "true"
      ? "True"
      : "False"
    : null,
  procurement_module: localStorage.getItem("procurement_module")
    ? localStorage.getItem("procurement_module") === "true"
      ? "True"
      : "False"
    : null,
  mnr_ftp_upload: localStorage.getItem("mnr_ftp_upload")
    ? localStorage.getItem("mnr_ftp_upload") === true
      ? true
      : false
    : null,
  automatic_mnr_status_change: localStorage.getItem(
    "automatic_mnr_status_change"
  )
    ? localStorage.getItem("automatic_mnr_status_change") === "true"
      ? "True"
      : "False"
    : null,
  lolo_finance: localStorage.getItem("lolo_finance")
    ? localStorage.getItem("lolo_finance") === "true"
      ? "True"
      : "False"
    : null,
  en_block_movement: localStorage.getItem("en_block_movement")
    ? localStorage.getItem("en_block_movement") === "true" ||
      localStorage.getItem("en_block_movement") === true ||
      localStorage.getItem("en_block_movement") === "True"
      ? "True"
      : "False"
    : null,
  en_block_movement_v2: localStorage.getItem("en_block_movement_v2")
    ? localStorage.getItem("en_block_movement_v2") === true ||
      localStorage.getItem("en_block_movement_v2") === "True" ||
      localStorage.getItem("en_block_movement_v2") === "true"
      ? "True"
      : "False"
    : null,
  role: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")).role
    : null,
  procurement_admin: localStorage.getItem("procurement_admin")
    ? localStorage.getItem("procurement_admin") === "true"
      ? "True"
      : "False"
    : null,
  mnr_team: localStorage.getItem("mnr_team")
    ? localStorage.getItem("mnr_team") === true ||
      localStorage.getItem("mnr_team") === "True" ||
      localStorage.getItem("mnr_team") === "true"
      ? "True"
      : "False"
    : null,
    truck_tracking: localStorage.getItem("truck_tracking")
    ? localStorage.getItem("truck_tracking") === true ||
      localStorage.getItem("truck_tracking") === "True" ||
      localStorage.getItem("truck_tracking") === "true"
      ? "True"
      : "False"
    : null,
    payment_due_date: localStorage.getItem("payment_due_date")
    ? localStorage.getItem("payment_due_date") 
    : null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_USER_INFO":
      return { ...state, userInfo: action.payload };
    case "SET_LOCATION":
      return { ...state, location: action.payload };
    case "SET_LOCATION_ID":
      return { ...state, location_id: action.payload };
    case "SET_SITE":
      return { ...state, site: action.payload };
    case "SET_SITE_ID":
      return { ...state, site_id: action.payload };
    case "SET_TYPE":
      return { ...state, type: action.payload };
    case "SET_MNR_MODULE":
      return { ...state, mnr_module: action.payload };
    case "SET_TRANSPORTATION_MODULE":
      return { ...state, transportation_module: action.payload };
    case "SET_LOADED_EMPTY_YARD_MODULE":
      return { ...state, loaded_yard_module: action.payload };
    case "SET_PROCUREMENT_ADMIN":
      return { ...state, procurement_admin: action.payload };
    case USER_INFO.PROCUREMENT_MODULE:
      return { ...state, procurement_module: action.payload };
    case USER_INFO.LOLO_FINANCE_MODULE:
      return { ...state, lolo_finance: action.payload };
    case USER_INFO.EN_BLOCK_MOVEMENT_MODULE:
      return { ...state, en_block_movement: action.payload };
    case USER_INFO.EN_BLOCK_MOVEMENT_VERSION_2:
      return {...state,en_block_movement_v2 :action.payload}
    case USER_INFO.MNR_TEAM:
      return { ...state, mnr_team: action.payload };
    case USER_INFO.TRUCK_TRACKING:
      return {...state,truck_tracking:action.payload}
    case USER_INFO.IS_PAID:
      return {...state, payment_due_date: action.payload };
    case "SET_NEW_BILLING_MODULE":
      return { ...state, new_billing_module: action.payload };
    case "SET_AUTO_STATUS_CHANGE":
      return { ...state, automatic_mnr_status_change: action.payload };
    case "SET_MNR_FTP_UPLOAD":
      return { ...state, mnr_ftp_upload: action.payload };
    case "SET_ROLE":
      return { ...state, role: action.payload };
    default:
      return { ...state };
  }
};
