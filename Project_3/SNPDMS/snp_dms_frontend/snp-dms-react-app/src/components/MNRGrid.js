import React, { useEffect, useState } from "react";
import { Grid, Button, useMediaQuery, Tooltip } from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";
import UploadIcon from "@material-ui/icons/CloudUpload";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import MNRGridFilter from "./MNRGridFilter";
import MNRListing from "../components/MNRListing";

const MNRGrid = () => {
  const [isEqual, setIsEqual] = useState(null);
  const store = useSelector((state) => state);
  const history = useHistory();
  const { user, MNRGridSearch, MNR } = store;
  const dispatch = useDispatch();
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const matchesIpad = useMediaQuery("(max-width:1050px)");

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

  const openStockUpload = () => {
    history.push("/stocks-upload");
  };

  const handleDirectPush = () => {
    history.push("/mnrprocess");
  };

  return (
    <Grid
      container
      xs={12}
      style={{ paddingBottom: matchesIphone ? "240px" : "120px" }}
    >
      <Grid
        style={{
          display: "flex",
          width: matchesIpad ? (matchesIphone ? "100%" : "65%") : "100%",
          justifyContent:
            user.type === "NON DEPOT" ? "space-between" : "flex-end",
          alignItems: "center",
        }}
      >
        {user.type === "NON DEPOT" && (
          <Button
            variant="contained"
            style={{
              backgroundColor: "#2A5FA5",
              color: "#FE5E37",
            }}
            onClick={openStockUpload}
            endIcon={<UploadIcon />}
          >
            Stock Upload
          </Button>
        )}
        {(user?.mnr_team === true || user?.mnr_team === "True") &&
        user.role !== "Admin" ? null : (
          <Tooltip title="Navigate to MNR page">
            <Button
              variant="contained"
              style={{
                backgroundColor: "#FE5E37",
                color: "#2A5FA5",
                border: "1.5px solid #2A5FA5",
                marginTop: matchesIphone ? "12px" : "4px",
              }}
              onClick={handleDirectPush}
              endIcon={<SendIcon />}
            >
              MNR Process
            </Button>
          </Tooltip>
        )}
      </Grid>
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
