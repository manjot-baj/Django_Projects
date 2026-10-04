import React, { useEffect, useRef } from "react";

import {
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
  TextField,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { theme } from "../App";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import {
  ContainerPreGateInGetAction,
  ContainerSurveyGetAction,
  containerSearchDispatch,
  dropDownContainerAction,
  dropDownPreGateInDispatch,
  getContainerByDateDispatch,
} from "../actions/GateInActions";
import {
  gateOutContainerSearchDispatch,
  getGateOutContainerByDateDispatch,
  getGateOutContainerByPreGateInDispatch,
} from "../actions/GateOutActions";
import { useSnackbar } from "notistack";
import { Autocomplete } from "@mui/material";
import { customLabelTypography } from "../utils/CustomClasses";

const GateSearch = (props) => {
  const matchesIphone = useMediaQuery("(max-width:500px)");
  const { searchType } = props;
  const [searchText, setSearch] = React.useState("");
  const [showDropdown, setDropdown] = React.useState(false);
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const surveyContainerApiCalled = useRef(false);
  const preGateINContainerApiCalled = useRef(false);
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
    <Paper
      sx={(theme) => ({
        padding: theme.spacing(2.5),
        // width: "100%",
        borderRadius: 2,
        [theme.breakpoints.down("sm")]: {
          padding: theme.spacing(1),
          width: "98%",
          marginLeft: "auto",
          marginRight: "auto",
        },
      })}
      elevation={0}
    >
      {matchesIphone && (
        <Stack
          direction={"row"}
          alignItems={"cennter"}
          justifyContent={"flex-start"}
          mb={2}
        >
          {props.searchType !== "GateOut" && matchesIphone && (
            <Autocomplete
              style={{ padding: 0 }}
              sx={(theme) => ({
                width: "170px",
                marginRight: "8px",
                "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                  {
                    padding: 0,
                    paddingTop: "-32px",
                  },
              })}
              options={
                gateIn.container_list &&
                gateIn.container_list?.map((option) => option.container_no)
              }
              onOpen={() => {
                if (!surveyContainerApiCalled.current) {
                  surveyContainerApiCalled.current = true;

                  dispatch(dropDownContainerAction());
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Survey Containers"
                  sx={(theme) => ({
                    backgroundColor: "white",
                    "& .MuiFormLabel-root": {
                      color: "rgb(150,161,170)",
                      fontSize: "14px",
                      marginTop: "-8px",
                    },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "rgb(150,161,170)",
                      },
                    },
                  })}
                  onBlur={(e) => {
                    if (e.target.value.length === 0) {
                      return;
                    }
                    let selectedContainerSurvey = e.target.value;
                    let selectedListSurvey = gateIn.container_list?.find(
                      (val, index) =>
                        val.container_no === selectedContainerSurvey,
                    );
                    if (selectedListSurvey?.pk) {
                      dispatch(
                        ContainerSurveyGetAction(selectedListSurvey.pk, notify),
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
          {(user.lolo_finance === "True" || user.lolo_finance === true) &&
            matchesIphone && (
              <Autocomplete
                style={{ padding: 0 }}
                sx={(theme) => ({
                  width: "170px",
                  marginRight: "8px",
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                      paddingTop: "-32px",
                    },
                })}
                onOpen={() => {
                  if (!preGateINContainerApiCalled.current) {
                    preGateINContainerApiCalled.current = true;
                    if (props.searchType !== "GateOut") {
                      dispatch(
                        dropDownPreGateInDispatch(
                          [
                            "lf_pregatein_list",
                            "current_pregate_out_available_container_list",
                          ],
                          notify,
                        ),
                      );
                    } else {
                      dispatch(
                        dropDownPreGateInDispatch(
                          ["lf_pregateout_list"],
                          notify,
                        ),
                      );
                    }
                  }
                }}
                options={
                  AdvanceFinanceReducer?.[
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
                  ]?.map((val, index) => val) || []
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label={
                      props.searchType !== "GateOut"
                        ? "Pre Gate In"
                        : "Pre Gate Out "
                    }
                    sx={(theme) => ({
                      backgroundColor: "white",
                      "& .MuiFormLabel-root": {
                        color: "rgb(150,161,170)",
                        fontSize: "14px",
                        marginTop: "-8px",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgb(150,161,170)",
                        },
                      },
                    })}
                    onBlur={(e) => {
                      if (e.target.value.length > 1) {
                        props.searchType !== "GateOut"
                          ? dispatch(
                              ContainerPreGateInGetAction(
                                e.target.value,
                                notify,
                              ),
                            )
                          : dispatch(
                              getGateOutContainerByPreGateInDispatch(
                                e.target.value,
                                notify,
                              ),
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
        </Stack>
      )}

      <Grid
        container
        spacing={3}
        sx={(theme) => ({
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        })}
      >
        {searchType === "GateOut" && (
          <Grid
            item
            size={{ xs: 12, sm: 6, lg: 3 }}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Container Available List
            </Typography>

            <Select
              id="client-master-state"
              // value={clientName}
              fullWidth
              size="small"
              variant="standard"
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
                  ),
                )}
            </Select>
          </Grid>
        )}

        <Grid
          item
          size={{ sm: 10, md: 9 }}
          md={searchType === "GateIn" ? 9 : 8}
          style={{ position: "relative" }}
        >
          {/* <div > */}
          <Paper
            component="form"
            sx={(theme) => ({
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
            })}
            elevation={0}

            // style={{ position: "relative" }}
          >
            {props.searchType !== "GateOut" && !matchesIphone && (
              <Autocomplete
                style={{ padding: 0 }}
                sx={(theme) => ({
                  width: "170px",
                  marginRight: "8px",
                  "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                    {
                      padding: 0,
                      paddingTop: "-32px",
                    },
                })}
                options={
                  gateIn.container_list &&
                  gateIn.container_list?.map((option) => option.container_no)
                }
                onOpen={() => {
                  if (!surveyContainerApiCalled.current) {
                    surveyContainerApiCalled.current = true;

                    dispatch(dropDownContainerAction());
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Survey Containers"
                    sx={(theme) => ({
                      backgroundColor: "white",
                      "& .MuiFormLabel-root": {
                        color: "rgb(150,161,170)",
                        fontSize: "14px",
                        marginTop: "-8px",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgb(150,161,170)",
                        },
                      },
                    })}
                    onBlur={(e) => {
                      if (e.target.value.length === 0) {
                        return;
                      }
                      let selectedContainerSurvey = e.target.value;
                      let selectedListSurvey = gateIn.container_list?.find(
                        (val, index) =>
                          val.container_no === selectedContainerSurvey,
                      );
                      if (selectedListSurvey?.pk) {
                        dispatch(
                          ContainerSurveyGetAction(
                            selectedListSurvey.pk,
                            notify,
                          ),
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

            {(user.lolo_finance === "True" || user.lolo_finance === true) &&
              !matchesIphone && (
                <Autocomplete
                  style={{ padding: 0 }}
                  sx={(theme) => ({
                    width: "170px",
                    marginRight: "8px",
                    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']":
                      {
                        padding: 0,
                        paddingTop: "-32px",
                      },
                  })}
                       onOpen={() => {
                  if (!preGateINContainerApiCalled.current) {
                    preGateINContainerApiCalled.current = true;
                    if (props.searchType !== "GateOut") {
                      dispatch(
                        dropDownPreGateInDispatch(
                          [
                            "lf_pregatein_list",
                            "current_pregate_out_available_container_list",
                          ],
                          notify,
                        ),
                      );
                    } else {
                      dispatch(
                        dropDownPreGateInDispatch(
                          ["lf_pregateout_list"],
                          notify,
                        ),
                      );
                    }
                  }
                }}
                  options={
                    AdvanceFinanceReducer?.[
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
                    ]?.map((val, index) => val) || []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={
                        props.searchType !== "GateOut"
                          ? "Pre Gate In"
                          : "Pre Gate Out "
                      }
                      sx={(theme) => ({
                        backgroundColor: "white",
                        "& .MuiFormLabel-root": {
                          color: "rgb(150,161,170)",
                          fontSize: "14px",
                          marginTop: "-8px",
                        },
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "rgb(150,161,170)",
                          },
                        },
                      })}
                      onBlur={(e) => {
                        if (e.target.value.length > 1) {
                          props.searchType !== "GateOut"
                            ? dispatch(
                                ContainerPreGateInGetAction(
                                  e.target.value,
                                  notify,
                                ),
                              )
                            : dispatch(
                                getGateOutContainerByPreGateInDispatch(
                                  e.target.value,
                                  notify,
                                ),
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
            <IconButton
              disabled
              sx={(theme) => ({
                paddingX: 3,
                [theme.breakpoints.down("sm")]: {
                  padding: 1,
                },
              })}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
            <InputBase
              id="container-search"
              name="searchText"
              sx={(theme) => ({
                marginLeft: theme.spacing(1),
                flex: 1,
                padding: 7,
                [theme.breakpoints.down("sm")]: {
                  padding: 0,
                  fontSize: "0.8rem",
                },
              })}
              placeholder="Search for a Container"
              inputProps={{ "aria-label": "search" }}
              value={searchText}
              onChange={(e) => handleChange(e)}
              autoComplete="off"
            />
          </Paper>
          <ClickAwayListener onClickAway={handleClickAway}>
            <Paper
              sx={{
                position: "absolute",
                top: 50,
                left: 0,
                width: "100%",
                zIndex: 10,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
              }}
              elevation={1}
            >
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
                              sx={{ cursor: "pointer" }}
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
                        },
                      )}
                    </List>
                  ) : (
                    <Typography
                      sx={(theme) => ({
                        padding: theme.spacing(1.5),
                        textAlign: "center",
                      })}
                    >
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
                              sx={{
                                cursor: "pointer",
                              }}
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
                        },
                      )}
                  </List>
                ) : (
                  <Typography
                    sx={(theme) => ({
                      padding: theme.spacing(1.5),
                      textAlign: "center",
                    })}
                  >
                    {gateOut.gateOutContainerSearchResult.errorMsg &&
                    gateOut.gateOutContainerSearchResult.errorMsg.includes(
                      "Invalid credentials",
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
        <Grid item size={{ sm: 2, md: 2 }}>
          <Button
            variant="contained"
            color="warning"
            sx={(theme) => ({
              borderRadius: "0.5rem",
              padding: "1px 4px",
              height: 40,
              width: "100%",
              [theme.breakpoints.down("xs")]: {
                // padding: "1px 4px",
                paddingRight: 3,
                height: 35,
              },
            })}
            onClick={() => {
              dispatch({ type: "RESET_SEARCHED_CHEQUE" });
              if (searchType === "GateIn") {
                dispatch(
                  containerSearchDispatch(
                    { container_no: searchText },
                    setDropdown,
                  ),
                );
              } else {
                dispatch(
                  gateOutContainerSearchDispatch(
                    { container_no: searchText },
                    setDropdown,
                    notify,
                  ),
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
