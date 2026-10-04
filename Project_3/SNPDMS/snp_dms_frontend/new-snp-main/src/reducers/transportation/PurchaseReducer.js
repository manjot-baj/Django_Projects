const initialState = {
    allPurchaseListing: [],
    purchaseLRData:[],
    deletePurchase: false,
    purchaseDetails: null,
    purchaseAdded: false,
    purchaseUpdated: false,
    cancelPurchaseEffect: null,
    check: [],
  };
  
  export default (state = initialState, action) => {
    switch (action.type) {
      case "GET_ALL_PURCHASE":
        return { ...state, allPurchaseListing: action.payload };
        case "GET_PURCHASE_LR":
          return { ...state, purchaseLRData: action.payload };
      case "DELETE_PURCHASE":
        return { ...state, deletePurchase: action.payload ? true : false };
        case "DELETE_PURCHASE_RESET":
          return { ...state, purchaseLRData:[] };
      case "GET_PURCHASE":
        return { ...state, purchaseDetails: action.payload };
      case "CLEAR_PURCHASE_DATA":
        return { ...state, purchaseDetails: null };
      case "ADD_PURCHASE":
        return { ...state, purchaseAdded: action.payload ? true : false };
      case "UPDATE_PURCHASE":
        return { ...state, purchaseUpdated: action.payload ? true : false };
        case "CANCEL_PURCHASE_EFFECT":
          return { ...state, cancelPurchaseEffect: action.payload };
  
      default:
        return { ...state };
    }
  };