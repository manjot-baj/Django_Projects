import React, { useEffect } from "react";
import {
  Grid,
  makeStyles,
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
} from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import LayoutContainer from "../components/reusableComponents/LayoutContainer";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SurveyDemo from "./Survey";
import { EstimateDemo } from "./Estimate";
import { Approval } from "./Approval";
import { Repair } from "./Repair";
import { Header } from "./Header";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { nonDepotContainerSearchDispatch } from "../actions/MNRGridActions";
import { containerSearchDispatch } from "../actions/GateInActions";
import {
  getMNRProcessBySearch,
  getMNRProcessUnlock,
} from "../actions/MNRProcessActions";
import { Image } from "semantic-ui-react";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  paperContainerMNR: {
    padding: theme.spacing(2.5),
    borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  accordion: {
    boxShadow: "0px 0px 5px 0.1px rgba(0, 0, 0, 0.5)",
    "&::before": {
      top: 0,
      height: 1,
      content: "",
      opacity: 1,
      position: "absolute",
      right: "initial",
    },
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

  iconbtn: {
    fontSize: 35,
    fontWeight: 900,
    color: "#000000",
  },
  heading: {
    fontSize: 17,
    fontWeight: 900,
    color: "#000000",
  },
  paperContainer: {
    padding: theme.spacing(4, 3),
    marginBottom: 20,
  },
  searchMNR: {
    padding: theme.spacing(2.5),
    // borderRadius: 10,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1),
      width: "100%",
      marginLeft: "auto",
      marginRight: "auto",
    },
  },
  searchMNRButton: {
    margin: 5,
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
      paddingRight: 3,
      height: 35,
      margin: 0,
    },
  },
  searchMNRButtonMobile: {
    margin: 5,
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "100%",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      paddingRight: 3,
      marginLeft: "50px",
      height: 35,
      marginTop: "0px",
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
  searchPaper: {
    padding: "1px 4px",
    margin: 5,
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
  },
  input: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.6rem",
      marginLeft: "-10px",
    },
  },
    rootLabel:{
      "& .MuiFormLabel-root.Mui-focused": {
        color: "red",
        fontSize:"20px",
        fontWeight:'900',
      }
    },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
}));

export default function MNRProcess() {
  const [expanded, setExpanded] = React.useState();
  const classes = useStyles();
  const store = useSelector((state) => state);
  const { MNRProcess, gateIn, user } = store;
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
      <Image
        src={require("../assets/images/back-arrow.png")}
        className={classes.backImage}
        onClick={handleGoBack}
      />
      <Paper className={classes.paperContainer} elevation={0}>
        <Paper
          className={classes.searchMNR}
          elevation={0}
          style={{ display: "flex" }}
        >
          <Grid container xs={12} spacing={matchesIphone ? 1 : 3}>
            <Grid item xs={6} style={{ position: "relative" }}>
              <Paper
                component="form"
                className={classes.searchPaper}
                elevation={0}
              >
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
                      <Typography className={classes.noResultText}>
                        No result found for {`"${searchText}"`}
                      </Typography>
                    )
                  ) : null}
                </Paper>
              </ClickAwayListener>
            </Grid>
            <Grid item xs={1} sm={2}>
              <Button
                className={classes.searchMNRButton}
                onClick={() => {
                  user.type === "NON DEPOT"
                    ? dispatch(
                        nonDepotContainerSearchDispatch(
                          { container_no: searchText },
                          setDropdown
                        )
                      )
                    : dispatch(
                        containerSearchDispatch(
                          { container_no: searchText },
                          setDropdown
                        )
                      );
                }}
              >
                Search
              </Button>
            </Grid>
            <Grid item xs={1} sm={2}>
            {

              <Button
              className={classes.searchMNRButtonMobile}
              style={{ backgroundColor: "#2A5FA5" }}
              onClick={() => {
                let req = {
                  stock_id:
                    MNRProcess?.mnrProcessData?.container_data?.stock_id,
                    reason_to_unlock: otherReason === "" ? unlockReason : otherReason
                };
                dispatch(getMNRProcessUnlock(req, history));
              }}
              readOnlyP={true}
              disabled={
                MNRProcess?.mnrProcessData?.container_data?.stage ===
                  "Approval" ||
                MNRProcess?.mnrProcessData?.container_data?.stage ===
                  "Estimate" ||
                MNRProcess?.mnrProcessData?.container_data?.stage === "Survey" ||
                MNRProcess?.mnrProcessData.length===0
              }
            >
              Unlock
            </Button>
            }
             
            </Grid>
            <Grid container sm={12} style={{ paddingLeft:matchesIphone ? "120px":"0",marginBottom:matchesIphone? "32px":0}} md={2}>
              {MNRProcess?.mnrProcessData?.container_data?.stage ===
                "Approval" ||
              MNRProcess?.mnrProcessData?.container_data?.stage ===
                "Estimate" ||
              MNRProcess?.mnrProcessData?.container_data?.stage === "Survey" ? (
                ""
              ) : (
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <span>Unlock Reason?</span>
                    <TextField
                      id="unlock-reason"
                      select
                      value={unlockReason}
                      fullWidth
                      inputProps={{ "aria-label": "search" }}
                      onChange={handleUnlockReasonChange}
                    >
                      <MenuItem key={"Added A Wrong Statements"} value={"Added A Wrong Statements"}>
                        Added A Wrong Statements
                      </MenuItem>
                      <MenuItem key={"Added An Extra Lines "} value={"Added An Extra Lines "}>
                       Added An Extra Lines 
                      </MenuItem>
                      <MenuItem key={" Added A False Reason"} value={" Added A False Reason"}>
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
                        inputProps={{ className: classes.otherInput }}
                        className={classes.rootLabel}
                      />
                      </>
                    
                    )}
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper className={classes.paperContainer} elevation={2}>
          <Header />
        </Paper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <div>
              <Accordion
                expanded={expanded === "survey"}
                onChange={(e, isExpanded) => {
                  handleChangeEvent("survey")(e, isExpanded);
                }}
                style={{
                  marginBottom: 20,
                  borderRadius: 5,
                  boxShadow: 3,
                }}
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className={classes.iconbtn} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>Survey</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <SurveyDemo />
                </AccordionDetails>
              </Accordion>

              <Accordion
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
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className={classes.iconbtn} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>Estimate</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <EstimateDemo />
                </AccordionDetails>
              </Accordion>

              <Accordion
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
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className={classes.iconbtn} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>Approval</Typography>
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
                className={classes.accordion}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon className={classes.iconbtn} />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>Repair</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Repair />
                </AccordionDetails>
              </Accordion>
            </div>
          </Grid>
        </Grid>
      </Paper>
    </LayoutContainer>
  );
}
