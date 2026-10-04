import React, { useState } from "react";
import {
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { customLabelTypography } from "../utils/CustomClasses";


const ContainerListModal = (props) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { stocksAndAllotmentSearch, MNRGridSearch } = store;
  const [selectedStockList, setSelectedStockList] = useState(
    props?.searchData
      ? props?.searchData?.map((val) => ({
          container_no: val,
          enabled: props.mnr
            ? MNRGridSearch?.container_no?.includes(val)
            : stocksAndAllotmentSearch?.container_no?.includes(val),
        }))
      : []
  );

  const totalSelectedContainers = () => {
    let counts = props.mnr
      ? MNRGridSearch?.container_no?.length
      : stocksAndAllotmentSearch?.container_no?.length;
    return counts;
  };

  const handleChip = (pkToUpdate) => {
    var chipContainer = [...selectedStockList];
    const updatedData = chipContainer.map((item) => {
      if (item.container_no === pkToUpdate) {
        return {
          ...item,
          enabled: !item.enabled,
        };
      }
      return item;
    });

    setSelectedStockList(updatedData);

    if (props.mnr) {
      dispatch({
        type: "SET_MNR_SEARCH_CONTAINER_NUMBER",
        payload: updatedData
          .filter((val) => val.enabled === true)
          .map((val) => val.container_no)
          .join(","),
      });
      return;
    }
    dispatch({
      type: "SET_STOCK_ALLOT_SEARCH_CONTAINER_NUMBER",
      payload: updatedData
        .filter((val) => val.enabled === true)
        .map((val) => val.container_no)
        .join(","),
    });
  };

  return (
    <div>
      <Paper sx={(theme)=>({
            padding: theme.spacing(2, 3),
            width: "100%",
            border: "none",
            borderRadius: "20px",
      })} elevation={0}>
        <Grid container size={{xs:12}}  spacing={3}>
          <Grid item size={{xs:12,sm:12}} >
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
              <Typography
                variant="subtitle1"
                sx={customLabelTypography}
              >
                Container Number lists
              </Typography>
              <IconButton onClick={props.handleClose}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Grid  style={{ paddingBottom: 50 }}>
              {(stocksAndAllotmentSearch.itemListing?.length !== 0 ||
                MNRGridSearch.itemListing?.length !== 0) &&
                selectedStockList?.map((option) => (
                  <Chip
                    label={option.container_no}
                    clickable
                    sx={{
                      background:
                        option.enabled === true ? "lightgreen" : "#FFCCCB",
                      border:
                        option.enabled === true
                          ? "1px solid green"
                          : "1px solid red",
                      color: option.enabled === true ? "green" : "red",
                      "&:hover": {
                        cursor: "pointer",
                        background:
                          option.enabled === true ? "lightgreen" : "#FFCCCB",
                        border:
                          option.enabled === true
                            ? "1px solid green"
                            : "1px solid red",
                        color: option.enabled === true ? "green" : "red",
                      },
                      margin: 5,
                    }}
                    onClick={() => {
                      handleChip(option.container_no);
                    }}
                  />
                ))}
            </Grid>
            <Typography>
              Total Containers Selected: {totalSelectedContainers()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default ContainerListModal;
