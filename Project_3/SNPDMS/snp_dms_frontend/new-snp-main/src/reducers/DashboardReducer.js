const initialState = {
  dashboardDetails: null,
  ediSummary: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_MAIN_DASHBOARD_DETAILS":
      return { ...state, dashboardDetails: action.payload };
    case "SET_DASHBOARD_MOVEMENT_SUMMARY":
      let movementSummary = {
        ...state.dashboardDetails,
        movement_summary: action.payload,
      };
      return { ...state, dashboardDetails: movementSummary };
    case "SET_DASHBOARD_INVENTORY":
      let inventoryDetails = {
        ...state.dashboardDetails,
        inventory: action.payload,
      };
      return { ...state, dashboardDetails: inventoryDetails };
    case "SET_DASHBOARD_VOLUME_REVENUE":
      let volumeRevenueDetails = {
        ...state.dashboardDetails,
        volume_revenue_data: action.payload,
      };
      return { ...state, dashboardDetails: volumeRevenueDetails };
    case "SET_DASHBOARD_REVENUE":
      let revenueDetails = {
        ...state.dashboardDetails,
        revenue_data: action.payload,
      };
      return { ...state, dashboardDetails: revenueDetails };
    case "SET_DASHBOARD_TOP_CLIENT_REVENUE":
      let topClientRevenueDetails = {
        ...state.dashboardDetails,
        top_client_revenue_data: action.payload,
      };
      return { ...state, dashboardDetails: topClientRevenueDetails };
    case "SET_DASHBOARD_INWARD_TOP_CLIENT_REVENUE":
      let topInwardClientRevenueDetails = {
        ...state.dashboardDetails,
        inward_top_client_revenue_data: action.payload,
      };
      return { ...state, dashboardDetails: topInwardClientRevenueDetails };
    case "SET_DASHBOARD_OUTWARD_TOP_CLIENT_REVENUE":
      let topOutwardClientRevenueDetails = {
        ...state.dashboardDetails,
        outward_top_client_revenue_data: action.payload,
      };
      return { ...state, dashboardDetails: topOutwardClientRevenueDetails };
    case "SET_DASHBOARD_INWARD_HANDLING_TOP_CLIENT_REVENUE":
      let topInwardHandlingClientRevenueDetails = {
        ...state.dashboardDetails,
        inward_handling_top_client_revenue_data: action.payload,
      };
      return {
        ...state,
        dashboardDetails: topInwardHandlingClientRevenueDetails,
      };
    case "SET_DASHBOARD_OUTWARD_HANDLING_TOP_CLIENT_REVENUE":
      let topOutwardHandlingClientRevenueDetails = {
        ...state.dashboardDetails,
        outward_handling_top_client_revenue_data: action.payload,
      };
      return {
        ...state,
        dashboardDetails: topOutwardHandlingClientRevenueDetails,
      };
    case "SET_EDI_SUMMARY":
      return {
        ...state,
        ediSummary: action.payload,
      };

    case "SET_DASHBOARD_TRANSPORTATION_TOP_CLIENT_REVENUE":
      let topTransportationClientRevenueDetails = {
        ...state.dashboardDetails,
        transportation_top_client_revenue_data: action.payload,
      };
      return {
        ...state,
        dashboardDetails: topTransportationClientRevenueDetails,
      };
    default:
      return { ...state };
  }
};
