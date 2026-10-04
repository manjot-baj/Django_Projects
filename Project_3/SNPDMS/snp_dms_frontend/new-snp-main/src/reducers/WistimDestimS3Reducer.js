const initialState = {
  allWestimDestimS3Listing: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_S3_DATA":
      return { ...state, allWestimDestimS3Listing: action.payload };
    default:
      return { ...state };
  }
};
