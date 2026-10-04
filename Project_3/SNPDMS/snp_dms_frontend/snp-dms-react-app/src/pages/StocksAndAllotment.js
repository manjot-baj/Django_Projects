import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

// StocksAndAllotmentSearchSection component section
import StocksAndAllotmentSearchSection from "../components/StocksAndAllotmentSearch";

// StocksAndAllotmentListing component section
import  StocksAndAllotmentListing from "../components/StocksAndAllotmentListing";
import { dropDownDispatch } from "../actions/GateInActions";
import { useSnackbar } from "notistack";

const StocksAndAllotment = () => {
  const [isEqual, setIsEqual] = useState(null);
  const store = useSelector((state) => state);
  const { stocksAndAllotment } = store;
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;

  useEffect(() => {
    let reqArray = [];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch({ type: "CLEANUP_STOCKS_ALLOTMENT_BOOKING_DETAILS" });
  }, []);

  const hasEqualValues = () => {
    var equalValue = stocksAndAllotment.selectedContainersListType.every(
      (val, i, arr) => val === arr[0]
    );
    return equalValue;
  };
  return (
    <Grid>
        <StocksAndAllotmentSearchSection />
        <StocksAndAllotmentListing
          isEqual={isEqual}
          setIsEqual={setIsEqual}
          hasEqualValues={hasEqualValues}
        />
    </Grid>
  );
};

export default StocksAndAllotment;
