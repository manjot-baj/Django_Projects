import React, { useEffect } from "react";
import {
  Grid,
  Typography,
  Paper,
  InputBase,
  ClickAwayListener,
  List,
  ListItem,
  ListItemText,
  Button,
  useMediaQuery,
  TextField,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SurveyDemo from "./Survey";
import { EstimateDemo } from "./Estimate";
import { Approval } from "./Approval";
import { Repair } from "./Repair";
import { Header } from "./Header";
import SearchIcon from "@mui/icons-material/Search";
import { nonDepotContainerSearchDispatch } from "../actions/MNRGridActions";
import { containerSearchDispatch } from "../actions/GateInActions";
import {
  getMNRProcessBySearch,
  getMNRProcessUnlock,
} from "../actions/MNRProcessActions";
import { useHistory } from "react-router-dom";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { custombackDropStyle } from "@/utils/CustomClasses";

export default function MNRProcess() {
  const [expanded, setExpanded] = React.useState();
  const store = useSelector((state) => state);
  const { MNRProcess, gateIn, user } = store;
  const { isloading } = useSelector((state) => state.ui);
  const dispatch = useDispatch();
  const [searchText, setSearch] = React.useState("");
  const [showDropdown, setDropdown] = React.useState(false);
  const [unlockReason, setUnlockReason] = React.useState("");
  const [showOtherReason, setShowOtherReason] = React.useState(false);
  const [otherReason, setOtherReason] = React.useState("");
  const history = useHistory();
  const matchesIphone = useMediaQuery("(max-width:500px)");

  useEffect(() => {
    if (
      (MNRProcess?.mnrProcessData?.container_data?.stage === "Repair" ||
        MNRProcess?.mnrProcessData?.container_data?.stage === "Available") ===
      true
    ) {
      setExpanded("repair");
    } else if (
      (MNRProcess?.mnrProcessData?.container_data?.stage === "Approval") ===
      true
    ) {
      setExpanded("approval");
    } else if (
      (MNRProcess?.mnrProcessData?.container_data?.stage === "Estimate") ===
      true
    ) {
      setExpanded("estimate");
    } else {
      setExpanded("survey");
    }
  }, [MNRProcess.mnrProcessData]);

  useEffect(() => {
    return () => {
      dispatch({ type: "RESET_GATE_IN_UPDATE_FORM" });
    };
  }, []);

  const handleChangeEvent = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

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
    dispatch(getMNRProcessBySearch(body, setDropdown));
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleUnlockReasonChange = (e) => {
    const selectedReason = e.target.value;
    setUnlockReason(selectedReason);
    if (selectedReason === "Others") {
      setShowOtherReason(true);
    } else {
      setShowOtherReason(false);
    }
  };

  const handleOtherReasonChange = (e) => {
    const newOtherReason = e.target.value;
    setOtherReason(newOtherReason);
  };

  let demoVal =
    user.type === "NON DEPOT"
      ? gateIn.nonDepotContainerSearchResult
      : gateIn.containerSearchResult;

  return (
    <LayoutContainer footer={false}>
      <CustomBackButton handleGoBack={handleGoBack} />
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(2, 2),
          marginBottom: 20,
        })}
        elevation={0}
      >
        <Paper
          sx={(theme) => ({
            padding: theme.spacing(2.5),
            // borderRadius: 10,
            [theme.breakpoints.down("sm")]: {
              padding: theme.spacing(1),
              width: "100%",
              marginLeft: "auto",
              marginRight: "auto",
            },
          })}
          elevation={0}
          style={{ display: "flex" }}
        >
          <Grid
            container
            size={{ xs: 12 }}
            spacing={matchesIphone ? 1 : 3}
            style={{ width: "100%" }}
          >
            <Grid item size={{ xs: 6 }} style={{ position: "relative" }}>
              <Paper
                component="form"
                sx={(theme) => ({
                  padding: "1px 4px",
                  marginY: 5,
                  display: "flex",
                  alignItems: "center",
                  height: 40,
                  backgroundColor: "#DFE6EC",
                  borderRadius: "0.5rem",
                  [theme.breakpoints.down("xs")]: {
                    padding: "1px 0px",
                    margin: 0,
                    height: 35,
                  },
                })}
                elevation={0}
              >
                <IconButton type="submit" aria-label="search">
                  <SearchIcon />
                </IconButton>

                <InputBase
                  id="container-search"
                  name="searchText"
                  sx={(theme) => ({
                    [theme.breakpoints.down("xs")]: {
                      fontSize: "0.6rem",
                      marginLeft: "-10px",
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
                    demoVal.container_no ? (
                      <List aria-label="search results">
                        {demoVal.dates.map((containerDate, index) => {
                          return (
                            <ListItem
                              button
                              key={index}
                              style={
                                demoVal.dates.length > 1 && index === 0
                                  ? {
                                      backgroundColor: "#FDBD2E",
                                    }
                                  : {
                                      backgroundColor: null,
                                    }
                              }
                              onClick={() => {
                                handleContainerDateSelect({
                                  container_no: demoVal.container_no,
                                  date: containerDate,
                                });
                              }}
                            >
                              <ListItemText
                                primary={`${containerDate}    |    ${demoVal.container_no}`}
                              />
                            </ListItem>
                          );
                        })}
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
                  ) : null}
                </Paper>
              </ClickAwayListener>
            </Grid>
            <Grid item size={{ xs: 4, sm: 2 }}>
              <Button
                variant="contained"
                color="warning"
                sx={(theme) => ({
                  marginY: 5,

                  borderRadius: "0.5rem",
                  padding: "1px 4px",
                  height: 40,
                  width: "100%",

                  [theme.breakpoints.down("xs")]: {
                    paddingRight: 3,
                    height: 35,
                    margin: 0,
                  },
                })}
                onClick={() => {
                  user.type === "NON DEPOT"
                    ? dispatch(
                        nonDepotContainerSearchDispatch(
                          { container_no: searchText },
                          setDropdown,
                        ),
                      )
                    : dispatch(
                        containerSearchDispatch(
                          { container_no: searchText },
                          setDropdown,
                        ),
                      );
                }}
              >
                Search
              </Button>
            </Grid>
            <Grid item size={{ xs: 1, sm: 2 }}>
              {
                <Button
                  variant="contained"
                  color="primary"
                  sx={(theme) => ({
                    marginY: 5,

                    borderRadius: "0.5rem",
                    padding: "1px 4px",
                    height: 40,
                    width: "100%",

                    [theme.breakpoints.down("xs")]: {
                      paddingRight: 3,
                      marginLeft: "50px",
                      height: 35,
                      marginTop: "0px",
                    },
                  })}
                  onClick={() => {
                    let req = {
                      stock_id:
                        MNRProcess?.mnrProcessData?.container_data?.stock_id,
                      reason_to_unlock:
                        otherReason === "" ? unlockReason : otherReason,
                    };
                    dispatch(getMNRProcessUnlock(req, history));
                  }}
                  readOnlyP={true}
                  disabled={
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                      "Approval" ||
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                      "Estimate" ||
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                      "Survey" ||
                    MNRProcess?.mnrProcessData.length === 0
                  }
                >
                  Unlock
                </Button>
              }
            </Grid>
            <Grid container size={{ xs: 12, sm: 2 }}>
              {MNRProcess?.mnrProcessData?.container_data?.stage ===
                "Approval" ||
              MNRProcess?.mnrProcessData?.container_data?.stage ===
                "Estimate" ||
              MNRProcess?.mnrProcessData?.container_data?.stage === "Survey" ? (
                ""
              ) : (
                <Grid item size={{ xs: 12 }}>
                  <Grid item size={{ xs: 12 }}>
                    <span>Unlock Reason?</span>
                    <TextField
                      id="unlock-reason"
                      select
                      variant="standard"
                      value={unlockReason}
                      fullWidth
                      inputProps={{ "aria-label": "search" }}
                      onChange={handleUnlockReasonChange}
                    >
                      <MenuItem
                        key={"Added A Wrong Statements"}
                        value={"Added A Wrong Statements"}
                      >
                        Added A Wrong Statements
                      </MenuItem>
                      <MenuItem
                        key={"Added An Extra Lines "}
                        value={"Added An Extra Lines "}
                      >
                        Added An Extra Lines
                      </MenuItem>
                      <MenuItem
                        key={" Added A False Reason"}
                        value={" Added A False Reason"}
                      >
                        Added A False Reason
                      </MenuItem>
                      <MenuItem key={"Others"} value={"Others"}>
                        Others
                      </MenuItem>
                    </TextField>
                  </Grid>
                  <Grid className="otherSection">
                    {showOtherReason && (
                      <>
                        <TextField
                          id="other-reason"
                          fullWidth
                          label="Fill the reason"
                          value={otherReason}
                          onChange={handleOtherReasonChange}
                          sx={{
                            "& .MuiFormLabel-root.Mui-focused": {
                              color: "red",
                              fontSize: "20px",
                              fontWeight: "900",
                            },
                          }}
                        />
                      </>
                    )}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper
          sx={(theme) => ({
            padding: theme.spacing(3, 2),
            marginBottom: 4,
          })}
          elevation={2}
        >
          <Header />
        </Paper>
        <Grid container spacing={3}>
          <Grid item size={{ xs: 12 }}>
            <div>
              <Accordion
                sx={{
                  boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",
                }}
                expanded={expanded === "survey"}
                onChange={(e, isExpanded) => {
                  handleChangeEvent("survey")(e, isExpanded);
                }}
                style={{
                  marginBottom: 14,
                  borderRadius: 5,
                  boxShadow: 3,
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        fontSize: 35,
                        fontWeight: 900,
                        color: "#000000",
                      }}
                    />
                  }
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: "#000000",
                    }}
                  >
                    Survey
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <SurveyDemo />
                </AccordionDetails>
              </Accordion>

              <Accordion
                sx={{
                  boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",
                }}
                expanded={expanded === "estimate"}
                onChange={(e, isExpanded) => {
                  if (
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                    "Survey"
                  ) {
                    return;
                  }
                  handleChangeEvent("estimate")(e, isExpanded);
                }}
                style={{
                  marginBottom: 20,
                  borderRadius: 5,
                  boxShadow: 3,
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        fontSize: 35,
                        fontWeight: 900,
                        color: "#000000",
                      }}
                    />
                  }
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: "#000000",
                    }}
                  >
                    Estimate
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <EstimateDemo />
                </AccordionDetails>
              </Accordion>

              <Accordion
                sx={{
                  boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",
                }}
                expanded={expanded === "approval"}
                onChange={(e, isExpanded) => {
                  if (
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                      "Estimate" ||
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                      "Survey"
                  ) {
                    return;
                  }
                  handleChangeEvent("approval")(e, isExpanded);
                }}
                style={{
                  marginBottom: 20,
                  borderRadius: 5,
                  boxShadow: 3,
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        fontSize: 35,
                        fontWeight: 900,
                        color: "#000000",
                      }}
                    />
                  }
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: "#000000",
                    }}
                  >
                    Approval
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Approval />
                </AccordionDetails>
              </Accordion>

              <Accordion
                expanded={expanded === "repair"}
                onChange={(e, isExpanded) => {
                  if (
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                      "Estimate" ||
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                      "Survey" ||
                    MNRProcess?.mnrProcessData?.container_data?.stage ===
                      "Approval"
                  ) {
                    return;
                  }
                  handleChangeEvent("repair")(e, isExpanded);
                }}
                style={{
                  marginBottom: 20,
                  borderRadius: 5,
                  boxShadow: 3,
                }}
                sx={{
                  boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon
                      sx={{
                        fontSize: 35,
                        fontWeight: 900,
                        color: "#000000",
                      }}
                    />
                  }
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: "#000000",
                    }}
                  >
                    Repair
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Repair />
                </AccordionDetails>
              </Accordion>
            </div>
          </Grid>
        </Grid>
      </Paper>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
}
