const initialState = {
  allAnalyticsListing: [],
  allHandlingVolumeRevenueListing: [],
  allSTVolumeRevenueListing: [],
  allStockDataListings: [],
  allMNRDataListings: [],
  allMNRTotalData:[],
  allMNRMaterialListings: [],
  allMNRMaterialFromDate: "",
  allMNRMaterialToDate: "",
  allMNRData:"",
  allRepoDataListing:[],
  repoMovement:"Arrived"
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SET_ANALYTICS_REPO_MOVEMENT":
      return {...state,repoMovement:action.payload};
    case "GET_ALL_ANALYTICS":
      return { ...state, allAnalyticsListing: action.payload };
    case "SET_QUARTERLY_LOLO_IN_VOLUME_REVENUE":
      let loloInVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        lolo_in_volume_revenue_data: action.payload,
      };
      return { ...state, allAnalyticsListing: loloInVolumeRevenueDetails };
    case "SET_QUARTERLY_LOLO_OUT_VOLUME_REVENUE":
      let loloOutVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        lolo_out_volume_revenue_data: action.payload,
      };
      return { ...state, allAnalyticsListing: loloOutVolumeRevenueDetails };
    case "SET_QUARTERLY_ST_IN_VOLUME_REVENUE":
      let stInVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        st_in_volume_revenue_data: action.payload,
      };
      return { ...state, allAnalyticsListing: stInVolumeRevenueDetails };
    case "SET_QUARTERLY_ST_OUT_VOLUME_REVENUE":
      let stOutVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        st_out_volume_revenue_data: action.payload,
      };
      return { ...state, allAnalyticsListing: stOutVolumeRevenueDetails };
    case "SET_QUARTERLY_MNR_VOLUME_REVENUE":
      let mnrVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        mnr_volume_revenue_data: action.payload,
      };
      return { ...state, allAnalyticsListing: mnrVolumeRevenueDetails };
    case "SET_WEEKLY_LOLO_IN_VOLUME_REVENUE":
      let weeklyLoloInVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        lolo_in_weekly_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allAnalyticsListing: weeklyLoloInVolumeRevenueDetails,
      };
    case "SET_WEEKLY_LOLO_OUT_VOLUME_REVENUE":
      let weeklyLoloOutVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        lolo_out_weekly_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allAnalyticsListing: weeklyLoloOutVolumeRevenueDetails,
      };
    case "SET_WEEKLY_ST_IN_VOLUME_REVENUE":
      let weeklyStInVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        st_in_weekly_volume_revenue_data: action.payload,
      };
      return { ...state, allAnalyticsListing: weeklyStInVolumeRevenueDetails };
    case "SET_WEEKLY_ST_OUT_VOLUME_REVENUE":
      let weeklyStOutVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        st_out_weekly_volume_revenue_data: action.payload,
      };
      return { ...state, allAnalyticsListing: weeklyStOutVolumeRevenueDetails };
    case "SET_WEEKLY_MNR_VOLUME_REVENUE":
      let weeklyMNRVolumeRevenueDetails = {
        ...state.allAnalyticsListing,
        mnr_weekly_volume_revenue_data: action.payload,
      };
      return { ...state, allAnalyticsListing: weeklyMNRVolumeRevenueDetails };

    case "GET_ALL_HANDLING_VOLUME_REVENUE":
      return { ...state, allHandlingVolumeRevenueListing: action.payload };
    case "SET_WEEKLY_IN_HANDLING_VOLUME_REVENUE":
      let weeklyInHandlingVolumeRevenueDetails = {
        ...state.allHandlingVolumeRevenueListing,
        lolo_in_weekly_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allHandlingVolumeRevenueListing: weeklyInHandlingVolumeRevenueDetails,
      };
    case "SET_WEEKLY_IN_HANDLING_VOLUME_REVENUE_OUT":
    let weeklyInHandlingVolumeRevenueDetailsOut = {
      ...state.allHandlingVolumeRevenueListing,
      lolo_in_weekly_volume_revenue_data_out: action.payload,
    };
      return {
        ...state,
        allHandlingVolumeRevenueListing: weeklyInHandlingVolumeRevenueDetailsOut,
      };

    case "SET_QUARTERLY_HANDLING_VOLUME_REVENUE":
      let quarterlyHandlingVolumeRevenueDetails = {
        ...state.allHandlingVolumeRevenueListing,
        lolo_in_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allHandlingVolumeRevenueListing: quarterlyHandlingVolumeRevenueDetails,
      };
    case "SET_REPO_CLIENT_DATA":
     
      return {
        ...state,
        allRepoDataListing: action.payload,}
    case "SET_QUARTERLY_HANDLING_VOLUME_REVENUE_OUT":
      let quarterlyHandlingVolumeRevenueDetailsOut = {
        ...state.allHandlingVolumeRevenueListing,
        lolo_in_volume_revenue_data_out: action.payload,
      };
      return {
        ...state,
        allHandlingVolumeRevenueListing: quarterlyHandlingVolumeRevenueDetailsOut,
      };
    case "SET_TOP_5_HANDLING_VOLUME_REVENUE":
      let top5HandlingVolumeRevenueDetails = {
        ...state.allHandlingVolumeRevenueListing,
        lolo_in_top_client_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allHandlingVolumeRevenueListing: top5HandlingVolumeRevenueDetails,
      };
    case "SET_TOP_5_HANDLING_VOLUME_REVENUE_OUT":
    let top5HandlingVolumeRevenueDetailsOut = {
      ...state.allHandlingVolumeRevenueListing,
      lolo_in_top_client_volume_revenue_data_out: action.payload,
    };
      return {
        ...state,
        allHandlingVolumeRevenueListing: top5HandlingVolumeRevenueDetailsOut,
      };
    case "SET_TOP_5_CONSIGNEE_DATA":
      let top5ConsigneeData ={
        ...state.allHandlingVolumeRevenueListing,
        top_5_Consignee_Data:action.payload
      };
      return {
        ...state,allHandlingVolumeRevenueListing:top5ConsigneeData
      }
    case "SET_TOP_5_TRANSPORTER_DATA":
      let top5transporterData ={
        ...state.allHandlingVolumeRevenueListing,
        top_5_Transporter_Data:action.payload
      };
      return {
        ...state,allHandlingVolumeRevenueListing:top5transporterData
      }
    case "SET_TOP_5_TRANSPORTER_DATA_OUT":
      let top5transporterDataOut ={
        ...state.allHandlingVolumeRevenueListing,
        top_5_Transporter_Data_Out:action.payload
      };
      return {
        ...state,allHandlingVolumeRevenueListing:top5transporterDataOut
      }
    case "SET_TOP_5_CARGO_DATA":
      let top5CargoData ={
        ...state.allHandlingVolumeRevenueListing,
        top_5_Cargo_Data_Out:action.payload
      };
      return {
        ...state,allHandlingVolumeRevenueListing:top5CargoData
      }
    case "GET_ALL_ST_VOLUME_REVENUE":
      return { ...state, allSTVolumeRevenueListing: action.payload };
    case "SET_WEEKLY_IN_ST_VOLUME_REVENUE":
      let weeklyInSTVolumeRevenueDetails = {
        ...state.allSTVolumeRevenueListing,
        st_in_weekly_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allSTVolumeRevenueListing: weeklyInSTVolumeRevenueDetails,
      };
    case "SET_WEEKLY_OUT_ST_VOLUME_REVENUE":
      let weeklyOutSTVolumeRevenueDetails = {
        ...state.allSTVolumeRevenueListing,
        st_out_weekly_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allSTVolumeRevenueListing: weeklyOutSTVolumeRevenueDetails,
      };

    case "SET_QUARTERLY_ST_VOLUME_REVENUE":
      let quarterlySTVolumeRevenueDetails = {
        ...state.allSTVolumeRevenueListing,
        st_in_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allSTVolumeRevenueListing: quarterlySTVolumeRevenueDetails,
      };

    case "SET_TOP_5_ST_VOLUME_REVENUE":
      let top5STVolumeRevenueDetails = {
        ...state.allSTVolumeRevenueListing,
        st_in_top_client_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allSTVolumeRevenueListing: top5STVolumeRevenueDetails,
      };

    case "GET_ALL_STOCK_DATA":
      return { ...state, allStockDataListings: action.payload };

    case "GET_ALL_MNR_DATA":
      return { ...state, allMNRTotalData: action.payload };

    case "SET_ANALYTICS_QUARTERLY_MNR_VOLUME_REVENUE":
      let quarterlyMNRVolumeRevenueDetails = {
        ...state.allMNRDataListings,
        quaterly_mnr_volume_revenue: action.payload,
      };
      return {
        ...state,
        allMNRDataListings: quarterlyMNRVolumeRevenueDetails,
      };

    case "SET_WEEKLY_IN_MNR_VOLUME_REVENUE":
      let weeklyInMNRVolumeRevenueDetails = {
        ...state.allMNRDataListings,
        weekly_mnr_volume_revenue: action.payload,
      };
      return {
        ...state,
        allMNRDataListings: weeklyInMNRVolumeRevenueDetails,
      };
      case "SET_ALL_MNR_DATA":
      return {
        ...state,
        allMNRData: action.payload,
      };


    case "SET_TOP_5_MNR_VOLUME_REVENUE":
      let top5MNRVolumeRevenueDetails = {
        ...state.allMNRDataListings,
        mnr_top_client_volume_revenue_data: action.payload,
      };
      return {
        ...state,
        allMNRDataListings: top5MNRVolumeRevenueDetails,
      };

    case "SET_TOP_5_MNR_PARTIALLY_APPROVED":
      let topPartiallyApprovedMNR = {
        ...state.allMNRDataListings,
        mnr_partially_approved_client: action.payload,
      };
      return {
        ...state,
        allMNRDataListings: topPartiallyApprovedMNR,
      };

    case "GET_ALL_MNR_MATERIAL":
      return { ...state, allMNRMaterialListings: action.payload };

    case "SET_MNR_MATERIAL_FROM_DATE":
      return { ...state, allMNRMaterialFromDate: action.payload };

    case "SET_MNR_MATERIAL_TO_DATE":
      return { ...state, allMNRMaterialToDate: action.payload };
    default:
      return { ...state };
  }
};
