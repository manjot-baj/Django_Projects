export const START_LOADING = "START_LOADING";
export const STOP_LOADING = "STOP_LOADING";

export const startLoading = () => (dispatch) => {
  dispatch({ type: START_LOADING });
};
export const stopLoading = () => (dispatch) => {
  dispatch({ type: STOP_LOADING });
};
