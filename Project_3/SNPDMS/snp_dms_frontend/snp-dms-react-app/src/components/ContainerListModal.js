import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
    width: "100%",
    border: "none",
    borderRadius: "20px",
  },
  input: {
    padding: 7,
    borderColor: "black",
  },
  selectTextField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
    "& .MuiPaper-rounded": {
      "& ul": {
        position: "relative",
        top: "300px",
      },
    },
  },

  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 12.5,
    marginLeft: "auto",
    marginRight: "auto",
    width: "35%",
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
  },
  searchButtonwrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: "40px",
    marginLeft: "280px",
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  searchButton2: {
    backgroundColor: "#2A5FA5",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 12.5,
    marginLeft: "auto",
    marginRight: "auto",
    width: "35%",
    border: "1.5px solid #FDBD2E",
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#2A5FA5",
      color: "#fff",
    },
  },
  containerList: {
    color: "green",
    border: "1px solid green",
    margin: "5px",
    background: "lightgreen",
    width: "150px",
    borderRadius: "20px",
    alignItems: "center",
    textAlign: "center",
    display: "flex",
  },
  selectedBtn: {
    background: "lightgreen",
    border: "1px solid green",
    color: "green",
    "&:hover": {
      cursor: "pointer",
      background: "lightgreen",
      border: "1px solid green",
      color: "green",
    },
    margin: 5,
  },
  notSelectedBtn: {
    background: "#FFCCCB",
    border: "1px solid red",
    color: "red",
    "&:hover": {
      cursor: "pointer",
      background: "#FFCCCB",
      border: "1px solid red",
      color: "red",
    },
    margin: 5,
  },
}));

const ContainerListModal = (props) => {
  const classes = useStyles();
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
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container xs={12} spacing={3}>
          <Grid item xs={12} sm={12}>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
              <Typography
                variant="subtitle1"
                className={classes.LabelTypography}
              >
                Container Number lists
              </Typography>
              <IconButton onClick={props.handleClose}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Grid className={classes.chipRoot} style={{ paddingBottom: 50 }}>
              {(stocksAndAllotmentSearch.itemListing?.length !== 0 ||
                MNRGridSearch.itemListing?.length !== 0) &&
                selectedStockList?.map((option) => (
                  <Chip
                    label={option.container_no}
                    clickable
                    className={
                      option.enabled === true
                        ? classes.selectedBtn
                        : classes.notSelectedBtn
                    }
                    onClick={() => {
                      handleChip(option.container_no);
                    }}
                  />
                ))}
            </Grid>
            <Typography className={classes.chipRoot}>
              Total Containers Selected: {totalSelectedContainers()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default ContainerListModal;
