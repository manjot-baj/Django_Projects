

const initialState = {
  data:null,
  history:null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "WEB_SOCKET_CONNECTION_DATA":
      return {
        ...state,
        data: action.payload,
      };
    case "WEB_SOCKET_CONNECTION_DATA_HISTORY":
      return {
        ...state,
        history: action.payload,
      };
    case "RESET_WEBSOCKET_CONNECTION_DATA":
      return initialState;
    default:
      return { ...state };
  }
};
