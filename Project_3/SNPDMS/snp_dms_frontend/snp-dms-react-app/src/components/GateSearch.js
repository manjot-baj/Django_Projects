import React, { useEffect } from "react";

import {
  makeStyles,
  InputBase,
  Typography,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ClickAwayListener,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
} from "@material-ui/core";
import { theme } from "../App";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { useDispatch, useSelector } from "react-redux";
import {
  ContainerPreGateInGetAction,
  ContainerSurveyGetAction,
  containerSearchDispatch,
  getContainerByDateDispatch,
} from "../actions/GateInActions";
import {
  gateOutContainerSearchDispatch,
  getGateOutContainerByDateDispatch,
  getGateOutContainerByPreGateInDispatch,
} from "../actions/GateOutActions";
import { useSnackbar } from "notistack";
import { Autocomplete } from "@mui/material";

const useStyles = makeStyles((theme) => ({
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  iconButton: {
    padding: 6,
  },
  paperContainer: {
    padding: theme.spacing(2.5),
    // width: "100%",
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      width: "98%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  searchPaper: {
    padding: "1px 4px",
    display: "flex",
    alignItems: "center",
    height: 40,
    backgroundColor: "#DFE6EC",
    borderRadius: "0.5rem",
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      height: 35,
    },
  },
  searchButton: {
    backgroundColor: "#FE5E37",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",
    "&:hover": {
      backgroundColor: "#FE5E37",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      paddingRight: 3,
      height: 35,
    },
  },
  searchResultContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    width: "100%",
    zIndex: 10,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
  noResultText: {
    padding: theme.spacing(1.5),
    textAlign: "center",
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  mainGrid: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
  autocomplete: {
    width: "170px",
    marginRight: "8px",
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
      paddingTop: "-32px",
    },
  },
  textField: {
    backgroundColor: "white",
    "& .MuiFormLabel-root": {
      color: "rgb(150,161,170)",
      fontSize: "14px",
      marginTop: "-10px",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "rgb(150,161,170)",
      },
    },
  },
}));

const GateSearch = (props) => {
  const classes = useStyles();
  const { searchType } = props;
  const [searchText, setSearch] = React.useState("");
  const [showDropdown, setDropdown] = React.useState(false);
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { gateIn, gateOut, AdvanceFinanceReducer, user } = store;
  const notify = useSnackbar().enqueueSnackbar;

  const handleChange = (event) => {
    if (event.target.value === "") {
      setDropdown(false);
    }
    setSearch(event.target.value);
  };

  const handleClickAway = () => {
    setDropdown(false);
  };

  const handleContainerDateSelect = (body) => {
    if (searchType === "GateIn") {
      dispatch(getContainerByDateDispatch(body, setDropdown));
    } else {
      dispatch(getGateOutContainerByDateDispatch(body, setDropdown, notify));
    }
  };

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_GATE_IN_UPDATE_FORM" });
    };
  }, []);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_GATE_OUT_CONTAINER_DETAILS" });
      dispatch({ type: "RESET_GATE_OUT_UPDATE_FORM" });
    };
  }, []);

  return (
    <Paper className={classes.paperContainer} elevation={0}>
      <Grid container spacing={3} className={classes.mainGrid}>
        {searchType === "GateOut" && (
          <Grid
            item
            xs={12}
            sm={6}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography
              variant="subtitle1"
              className={classes.LabelTypography}
              style={{ marginTop: 5 }}
            >
              Container Available List
            </Typography>

            <Select
              id="client-master-state"
              // value={clientName}
              fullWidth
              inputProps={{ className: classes.input }}
              style={{
                top: -15,
              }}
              onChange={(e) => {
                setSearch(e.target.value);
              }}

              // MenuProps={MenuProps}
            >
              {gateIn.allDropDown &&
                gateIn.allDropDown.current_available_container_list &&
                gateIn.allDropDown.current_available_container_list.map(
                  (option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  )
                )}
            </Select>
          </Grid>
        )}

        <Grid
          item
          sm={12}
          md={searchType === "GateIn" ? 9 : 8}
          style={{ position: "relative" }}
        >
          {/* <div > */}
          <Paper
            component="form"
            className={classes.searchPaper}
            elevation={0}

            // style={{ position: "relative" }}
          >
            {props.searchType !== "GateOut" && (
              <Autocomplete
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={
                  gateIn.container_list &&
                  gateIn.container_list?.map((option) => option.container_no)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Survey Containers"
                    className={classes.textField}
                    onBlur={(e) => {
                      if (e.target.value.length === 0) {
                        return
                      }
                      let selectedContainerSurvey = e.target.value;
                      let selectedListSurvey = gateIn.container_list?.find(
                        (val, index) =>
                          val.container_no === selectedContainerSurvey
                      );
                      if (selectedListSurvey?.pk) {
                        dispatch(
                          ContainerSurveyGetAction(
                            selectedListSurvey.pk,
                            notify
                          )
                        );
                      } else {
                        return;
                      }
                    }}
                    fullWidth
                  />
                )}
              />
            )}

            {(user.lolo_finance === "True" || user.lolo_finance === true) && (
              <Autocomplete
                style={{ padding: 0 }}
                className={classes.autocomplete}
                options={AdvanceFinanceReducer?.[
                  props.searchType !== "GateOut"
                    ? "preGateIntable"
                    : "preGateOutTable"
                ]?.[
                  props.searchType !== "GateOut"
                    ? "preGateInDropdown"
                    : "preGateOutDropdown"
                ]?.[
                  props.searchType !== "GateOut"
                    ? "lf_pregatein_list"
                    : "lf_pregateout_list"
                ]?.map((val, index) => val) || []}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label={
                      props.searchType !== "GateOut"
                        ? "Pre Gate In"
                        : "Pre Gate Out "
                    }
                    className={classes.textField}
                    onBlur={(e) => {
                      if (e.target.value.length > 1) {
                       
                        props.searchType !== "GateOut"
                          ? dispatch(
                              ContainerPreGateInGetAction(
                                e.target.value,
                                notify
                              )
                            )
                          : dispatch(
                              getGateOutContainerByPreGateInDispatch(
                                e.target.value,
                                notify
                              )
                            );
                      }else {
                        return 
                      }
                    }}
                    fullWidth
                  />
                )}
              />
            )}
            <IconButton
              type="submit"
              className={classes.iconButton}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
            <InputBase
              id="container-search"
              name="searchText"
              className={classes.input}
              placeholder="Search for a Container"
              inputProps={{ "aria-label": "search" }}
              value={searchText}
              onChange={(e) => handleChange(e)}
              autoComplete="off"
            />
          </Paper>
          <ClickAwayListener onClickAway={handleClickAway}>
            <Paper className={classes.searchResultContainer} elevation={1}>
              {showDropdown ? (
                searchType === "GateIn" ? (
                  gateIn.containerSearchResult.container_no ? (
                    <List aria-label="search results">
                      {gateIn.containerSearchResult.dates.map(
                        (containerDate, index) => {
                          return (
                            <ListItem
                              button
                              key={index}
                              style={
                                gateIn.containerSearchResult.dates.length > 1 &&
                                index === 0
                                  ? {
                                      backgroundColor: "#FDBD2E",
                                    }
                                  : {
                                      backgroundColor: null,
                                    }
                              }
                              onClick={() =>
                                handleContainerDateSelect({
                                  container_no:
                                    gateIn.containerSearchResult.container_no,
                                  date: containerDate,
                                })
                              }
                            >
                              <ListItemText
                                primary={`${containerDate}    |    ${gateIn.containerSearchResult.container_no}`}
                              />
                            </ListItem>
                          );
                        }
                      )}
                    </List>
                  ) : (
                    <Typography className={classes.noResultText}>
                      No result found for {`"${searchText}"`}
                    </Typography>
                  )
                ) : gateOut.gateOutContainerSearchResult.container_no ? (
                  <List aria-label="search results">
                    {gateOut.gateOutContainerSearchResult.flag === "OUT EDIT" &&
                      gateOut.gateOutContainerSearchResult.dates.map(
                        (containerDate, index) => {
                          return (
                            <ListItem
                              button
                              key={index}
                              onClick={() =>
                                handleContainerDateSelect({
                                  container_no:
                                    gateOut.gateOutContainerSearchResult
                                      .container_no,
                                  date: containerDate,
                                })
                              }
                            >
                              <ListItemText
                                primary={`${containerDate}    |    ${gateOut.gateOutContainerSearchResult.container_no}`}
                              />
                            </ListItem>
                          );
                        }
                      )}
                  </List>
                ) : (
                  <Typography className={classes.noResultText}>
                    {gateOut.gateOutContainerSearchResult.errorMsg &&
                    gateOut.gateOutContainerSearchResult.errorMsg.includes(
                      "Invalid credentials"
                    )
                      ? `No result found for "${searchText}"`
                      : gateOut.gateOutContainerSearchResult.errorMsg}
                  </Typography>
                )
              ) : null}
            </Paper>
          </ClickAwayListener>
          {/* </div> */}
        </Grid>
        <Grid item sm={12} md={3}>
          <Button
            className={classes.searchButton}
          
            onClick={() => {
              dispatch({ type: "RESET_SEARCHED_CHEQUE" });
              if (searchType === "GateIn") {
                dispatch(
                  containerSearchDispatch(
                    { container_no: searchText },
                    setDropdown
                  )
                );
              } else {
                dispatch(
                  gateOutContainerSearchDispatch(
                    { container_no: searchText },
                    setDropdown,
                    notify
                  )
                );
                dispatch({ type: "SET_GATE_OUT_DATE_TIME" });
              }
            }}
          >
            Search
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GateSearch;
