const initialState = {
  pkOfSavedInContainer: "",
  pkOfSavedOutContainer: "",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "SAVE_GATE_IN_PK":
      return { ...state, pkOfSavedInContainer: action.payload };
    case "SAVE_GATE_OUT_PK":
      return { ...state, pkOfSavedOutContainer: action.payload };
    default:
      return { ...state };
  }
};
