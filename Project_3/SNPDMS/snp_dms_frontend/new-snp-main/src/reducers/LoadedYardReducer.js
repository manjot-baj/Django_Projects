import {
  CONTAINER_SEARCHYARD,
} from "../actions/LoadedYardActions";

const initialState = {
  yardListing: [],
  container_list: [],
  containerSearchResult: "",
  container_no: "",
  size: "",
  port: "",
  process_type: "",
  liner: "",
  inward_rake: "",
  outward_rake: "",
  in_date: "",
  out_date: "",
  iit_date: "",
  iit_time: "",
  iit_move_code: "",
  dvan_date: "",
  dvan_time: "",
  dvan_move_code: "",
  mit_current_location: "",
  mtin_date: "",
  mtin_time: "",
  mtin_move_code: "",
  van_date: "",
  van_time: "",
  van_move_code: "",
  mir_date: "",
  mir_time: "",
  mir_move_code: "",
  mot_date: "",
  mot_time: "",
  mot_move_code: "",
  mit_date: "",
  mit_time: "",
  mit_move_code: "",
  mor_date: "",
  mor_time: "",
  mor_move_code: "",
  mor_current_location: "",
  mor_to_location: "",
  mor_booking_no: "",
  expin_date: "",
  expin_time: "",
  expin_move_code: "",
  eot_date: "",
  eot_time: "",
  mot_to_location: "",
  mot_booking_no: "",
  mot_truck_no: "",
  mot_to_depot_code: "",
  mor_truck_no: "",
  mor_to_depot_code: "",
  mot_transporter: "",
  mor_transporter: "",
  eot_move_code: "",
  booking_no: "",
  seal_no: "",
  report: "",
  eot_to_depot_code:'',
  eot_to_location:'',
  eot_transporter:'',
  mot_current_location: "",
  remarks: "",
  location: localStorage.getItem("location")
    ? localStorage.getItem("location")
    : null,
  site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
  extractStockData: [],
  history: "False",
  next_page: "someLink",
  prev_page: "someLink",
  total_pages: "",
  make_available: false,
  pk: "",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "LOADED_YARD_STOCK_SEARCH_RESULT":
      return { ...state, yardListing: action.payload };
    case CONTAINER_SEARCHYARD:
      return { ...state, containerSearchResult: action.payload };
    case "EXTRACT_STOCK_DATA":
      return { ...state, extractStockData: action.payload };
    case 'SET_ID':
      return { ...state, pk: action.payload };
    case "LOADEDYARD_CONTAINER_NUMBER":
      return { ...state, container_no: action.payload };
    case "LOADEDYARD_SIZE":
      return { ...state, size: action.payload };
    case "LOADEDYARD_MOT_TO_LOCATION":
      return { ...state, mot_to_location: action.payload }
    case "LOADEDYARD_PORT":
      return { ...state, port: action.payload };
    case "LOADEDYARD_PROCESSTYPE":
      return { ...state, process_type: action.payload };
    case "LOADEDYARD_MOT_BOOKING_NO":
      return { ...state, mot_booking_no: action.payload };
    case "LOADEDYARD_MOT_TRUCK_NO":
      return { ...state, mot_truck_no: action.payload };
    case "LOADEDYARD_MOT_TO_DEPOT_CODE":
      return { ...state, mot_to_depot_code: action.payload };
    case "LOADEDYARD_MOR_TRUCK_NO":
      return { ...state, mor_truck_no: action.payload };
    case "LOADEDYARD_MOR_TO_DEPOT_CODE":
      return { ...state, mor_to_depot_code: action.payload };
    case "LOADEDYARD_LINER":
      return { ...state, liner: action.payload };
    case "LOADEDYARD_INWARD_RAKE":
      return { ...state, inward_rake: action.payload };
    case "LOADEDYARD_MOT_TRANSPORTER":
      return { ...state, mot_transporter: action.payload }
    case "LOADEDYARD_OUTWARD_RAKE":
      return { ...state, outward_rake: action.payload };
    case "LOADEDYARD_MOR_CURRENT_LOCATION":
      return { ...state, mor_current_location: action.payload }
    case "LOADEDYARD_MOR_TRANSPORTER":
      return { ...state, mor_transporter: action.payload }
    case "LOADEDYARD_MOR_TO_LOCATION":
      return { ...state, mor_to_location: action.payload }
    case "LOADEDYARD_MOR_BOOKING_NO":
      return { ...state, mor_booking_no: action.payload }
    case "LOADEDYARD_IN_DATE":
      return { ...state, in_date: action.payload };

    case "LOADEDYARD_OUT_DATE":
      return { ...state, out_date: action.payload };

    case "LOADEDYARD_IIT_DATE":
      return { ...state, iit_date: action.payload };

    case "LOADEDYARD_IIT_TIME":
      return { ...state, iit_time: action.payload };

    case "LOADEDYARD_IIT_MOVE_CODE":
      return { ...state, iit_move_code: action.payload };

    case "LOADEDYARD_DVAN_DATE":
      return { ...state, dvan_date: action.payload };

    case "LOADEDYARD_DVAN_TIME":
      return { ...state, dvan_time: action.payload };
    case "LOADEDYARD_MIT_CURRENT_LOCATION":
      return { ...state, mit_current_location: action.payload }
    case "LOADEDYARD_DVAN_MOVE_CODE":
      return { ...state, dvan_move_code: action.payload };

    case "LOADEDYARD_MTIN_DATE":
      return { ...state, mtin_date: action.payload };

    case "LOADEDYARD_MTIN_TIME":
      return { ...state, mtin_time: action.payload };

    case "LOADEDYARD_MTIN_MOVE_CODE":
      return { ...state, mtin_move_code: action.payload };

    case "LOADEDYARD_VAN_DATE":
      return { ...state, van_date: action.payload };

    case "LOADEDYARD_VAN_TIME":
      return { ...state, van_time: action.payload };

    case "LOADEDYARD_VAN_MOVE_CODE":
      return { ...state, van_move_code: action.payload };

    case "LOADEDYARD_MIR_DATE":
      return { ...state, mir_date: action.payload };

    case "LOADEDYARD_MIR_TIME":
      return { ...state, mir_time: action.payload };

    case "LOADEDYARD_MIR_MOVE_CODE":
      return { ...state, mir_move_code: action.payload };

    case "LOADEDYARD_MOT_DATE":
      return { ...state, mot_date: action.payload };

    case "LOADEDYARD_MOT_TIME":
      return { ...state, mot_time: action.payload };

    case "LOADEDYARD_MOT_MOVE_CODE":
      return { ...state, mot_move_code: action.payload };

    case "LOADEDYARD_MIT_DATE":
      return { ...state, mit_date: action.payload };

    case "LOADEDYARD_MIT_TIME":
      return { ...state, mit_time: action.payload };

    case "LOADEDYARD_MIT_MOVE_CODE":
      return { ...state, mit_move_code: action.payload };

    case "LOADEDYARD_MOR_DATE":
      return { ...state, mor_date: action.payload };

    case "LOADEDYARD_MOR_TIME":
      return { ...state, mor_time: action.payload };

    case "LOADEDYARD_MOR_MOVE_CODE":
      return { ...state, mor_move_code: action.payload };
    case "LOADEDYARD_EOT_TRANSPORTER":
      return { ...state, eot_transporter: action.payload };
    case "LOADEDYARD_EOT_TO_LOCATION":
      return { ...state, eot_to_location: action.payload };
    case "LOADEDYARD_EOT_TO_DEPOT_CODE":
      return { ...state, eot_to_depot_code: action.payload };
    case "LOADEDYARD_EXPIN_DATE":
      return { ...state, expin_date: action.payload };

    case "LOADEDYARD_EXPIN_TIME":
      return { ...state, expin_time: action.payload };

    case "LOADEDYARD_EXPIN_MOVE_CODE":
      return { ...state, expin_move_code: action.payload };

    case "LOADEDYARD_EOT_DATE":
      return { ...state, eot_date: action.payload };

    case "LOADEDYARD_EOT_TIME":
      return { ...state, eot_time: action.payload };

    case "LOADEDYARD_EOT_MOVE_CODE":
      return { ...state, eot_move_code: action.payload };

    case "LOADEDYARD_BOOKING_NUMBER":
      return { ...state, booking_no: action.payload };

    case "LOADEDYARD_SEAL_NUMBER":
      return { ...state, seal_no: action.payload };

    case "LOADEDYARD_REPORT":
      return { ...state, report: action.payload };

    case "LOADEDYARD_REMARKS":
      return { ...state, remarks: action.payload };

    case "LOADEDYARD_HISTORY":
      return { ...state, history: action.payload };

    case "STOCK_YARD_NEXT_PAGE_LINK":
      return { ...state, next_page: action.payload };

    case "STOCK_YARD_PREV_PAGE_LINK":
      return { ...state, prev_page: action.payload };

    case "STOCK_YARD_TOTAL_PAGE_LINK":
      return { ...state, total_pages: action.payload };
    case "LOADEDYARD_MOT_CURRENT_LOCATION":
      return { ...state, mot_current_location: action.payload }
    case "SET_MAKE_AVAILABLE":
      return { ...state, make_available: action.payload };
    case "LOADED_ADD_SELECTED_CONTAINER":
      return {
        ...state,
        container_list: [...state.container_list, action.payload],
      };
    case "LOADED_REMOVE_SELECTED_CONTAINER":
      var remCont = [...state.container_list].filter(
        (obj) => obj.pk !== action.payload
      );
      return { ...state, container_list: remCont };
    case "LOADED_CLEAR_CONTAINER_LIST":
      return {
        ...state,
        container_list: [],
      };

    case "LOADED_CHIP_SELECT_UNSELECT":
      var chipContainer = [...state.container_list];

      chipContainer.forEach((e) => {
        if (e["pk"] === action.payload) {
          e["enabled"] = !e["enabled"];
        }
      });

      return { ...state, container_list: chipContainer };
    case "LOADED_CHIP_RESET_SELECTION":
      var selectedChipContainer = [...state.container_list];

      selectedChipContainer.forEach((e) => {
        e["enabled"] = true;
      });

      return { ...state, container_list: selectedChipContainer };

    case "CLEAR_GATE_IN_REDUCER_YARD":
      return initialState;
    default:
      return { ...state };
  }
};
