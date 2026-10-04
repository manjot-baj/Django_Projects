import React, { useEffect, useState } from "react";
import { Grid,  useMediaQuery,  Stack } from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import MNRGridFilter from "./MNRGridFilter";
import MNRListing from "../components/MNRListing";
import { TablePageTitle } from "./TableComponent/TableComponent";

const MNRGrid = () => {
  const [isEqual, setIsEqual] = useState(null);
  const store = useSelector((state) => state);
  const { user, MNRGridSearch, MNR } = store;
  const dispatch = useDispatch();
  const matchesIphone = useMediaQuery("(max-width:500px)");

  useEffect(() => {
    dispatch({ type: "RESET_MNR_PROCESS_DATA" });
  }, [MNRGridSearch.out_history]);

  useEffect(() => {
    dispatch({ type: "CLEANUP_STOCKS_ALLOTMENT_BOOKING_DETAILS" });
  }, []);

  const hasEqualValues = () => {
    var equalValue = MNR.selectedContainersListType.every(
      (val, arr) => val === arr[0]
    );
    return equalValue;
  };



  return (
    <Grid
      container
      style={{ paddingBottom: matchesIphone ? "240px" : "120px" }}
     
    >
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <TablePageTitle>MNR</TablePageTitle>
      </Stack>
      <MNRGridFilter />
      <MNRListing
        isEqual={isEqual}
        setIsEqual={setIsEqual}
        hasEqualValues={hasEqualValues}
      />
    </Grid>
  );
};

export default MNRGrid;
