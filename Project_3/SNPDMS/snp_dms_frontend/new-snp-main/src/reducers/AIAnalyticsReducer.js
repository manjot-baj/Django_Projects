export const AI_ANALYTICS_CONST = {
  AI_ANALYTICS_DATA: "AI_ANALYTICS_DATA",
  AI_ANALYTICS_SET_FILTER: "AI_ANALYTICS_SET_FILTER",
  AI_ANALYTICS_LISTING: "AI_ANALYTICS_LISTING",
};
const initialState = {
  ai_analytics_data: null,
  ai_analytics_filter: {
    status: "",
    processed: null,
    from_date: "",
    to_date: "",
  },
  ai_analytics_listing: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case AI_ANALYTICS_CONST.AI_ANALYTICS_LISTING:
      return { ...state, ai_analytics_listing: action.payload };
    case AI_ANALYTICS_CONST.AI_ANALYTICS_DATA:
      return { ...state, ai_analytics_data: action.payload };
    case AI_ANALYTICS_CONST.AI_ANALYTICS_SET_FILTER:
      return {
        ...state,
        ai_analytics_filter: {
          ...state.ai_analytics_filter,
          ...action.payload,
        },
      };
    default:
      return { ...state };
  }
};
