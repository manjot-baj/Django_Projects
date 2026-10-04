import React, { useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { useSnackbar } from "notistack";
import {
  Button,
  CircularProgress,
  ClickAwayListener,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { Stack } from "@mui/material";
import { useDispatch } from "react-redux";
import {
  downloadAutomationContainerAction,
  downloadAutomationGatePassAction,
  getSearchListContainers,
} from "../../actions/AutomationActions";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CustomHeading from "../../components/CustomHeading";

const useStyles = makeStyles((theme) => ({
  searchPaper: {
    padding: "40px 20px",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 10,
    color: theme.palette.text.primary,
    position: "relative",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  inputProcess: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: "0 10px",
    [theme.breakpoints.down("xs")]: {
      padding: 1,
      fontSize: "0.8rem",
    },
  },
  iconButton: {
    padding: 6,
  },
  searchResultContainer: {
    position: "absolute",
    top: 90,
    left: 0,
    width: "80%",
    marginLeft: "30px",
    zIndex: 10,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
  },
  downloadButton: {
    backgroundColor: "green",
    color: "white",
    "&:hover": {
      backgroundColor: "green",
    },
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    width: "200px",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
    [theme.breakpoints.down("xs")]: {
      // padding: "1px 4px",
      paddingRight: 3,
      height: 35,
    },
  },
}));

const AutomationReciept = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [searchText, setSearchText] = useState("");
  const [showDropdown, setDropdown] = React.useState(false);
  const [containerData, setContainerData] = useState(null);
  const [process, setProcess] = useState("IN");
  const [loading, setLoading] = useState(false);
  const [Type, setType] = useState("Lolo Reciept");
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const handleClickAway = () => {
    setDropdown(false);
  };

  const handleSearchButton = () => {
    if (searchText.length == 0) {
      notify("Please enter container to search", { variant: "warning" });
    } else {
      let body = { process: process, container_no: searchText };
      dispatch(
        getSearchListContainers(
          body,
          setDropdown,
          setContainerData,
          setLoading,
          notify
        )
      );
    }
  };

  const handleDownload = (pk, process) => {
    dispatch(downloadAutomationContainerAction({ pk, process }, notify));
  };

  const handleGatePassDownload = (pk, process) => {
    dispatch(downloadAutomationGatePassAction(pk, process, notify));
  };

  return (
    <LayoutContainer>
      <CustomHeading
        variant="h5"
        style={{ fontWeight: "bold", marginLeft: "20px" }}
        customClass={"pageTitle"}
      >
        Automation Receipt
      </CustomHeading>

      <ClickAwayListener onClickAway={handleClickAway}>
        <Paper component="form" className={classes.searchPaper} elevation={0}>
          <Stack
            direction={matchesIphone ? "column" : "row"}
            alignItems={"center"}
            justifyContent={"center"}
            flexDirection={matchesIphone ? "column" : "row"}
            style={{ backgroundColor: "#dfe6ec", borderRadius: "5px" }}
            spacing={matchesIphone ? 4 : 0}
            padding={matchesIphone ? "24px 12px" : "4px"}
          >
            <FormControl
              variant="standard"
              style={{ marginTop:matchesIphone ?"12px": "-15px", marginLeft: "10px" }}
            >
              <InputLabel
                id="container_list_select_label"
                style={{
                  color: "grey",
                  zIndex: 10,
                  fontSize: "15px",
                  textAlign: "center",
                  padding: "0 10px",
                  marginTop: "-10px",
                }}
              >
                Reciept Type
              </InputLabel>
              <Select
                id="=container_list_select"
                value={Type}
                labelId="container_list_select_label"
                name="client"
                label="  Reciept Type"
                variant="standard"
                onChange={(e) => setType(e.target.value)}
                className={classes.inputProcess}
                inputProps={{
                  style: {
                    padding: "0px 10px",
                    marginTop: "-10px",
                  },
                }}
                style={{
                  width: "200px",
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              >
                <MenuItem key={"Lolo Reciept"} value="Lolo Reciept">
                  Lolo Reciept
                </MenuItem>
                <MenuItem key={"Gate Pass"} value="Gate Pass">
                  Gate Pass
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl
              variant="standard"
              style={{ marginTop: matchesIphone?"24px": "-15px", marginLeft: "10px" }}
            >
              <InputLabel
                id="container_list_select_label"
                style={{
                  color: "grey",
                  zIndex: 10,
                  fontSize: "15px",
                  textAlign: "center",
                  padding: "0 10px",
                  marginTop: "-10px",
                }}
              >
                Process
              </InputLabel>
              <Select
                id="=container_list_select"
                value={process}
                labelId="container_list_select_label"
                name="client"
                label="Process"
                variant="standard"
                onChange={(e) => setProcess(e.target.value)}
                className={classes.inputProcess}
                inputProps={{
                  style: {
                    padding: "0px 10px",
                    marginTop: "-10px",
                  },
                }}
                style={{
                  width: "200px",
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              >
                <MenuItem key={"IN"} value="IN">
                  IN
                </MenuItem>
                <MenuItem key={"OUT"} value="OUT">
                  OUT
                </MenuItem>
              </Select>
            </FormControl>
            {matchesIphone ? (
              <Stack direction={"row"}>
                {" "}
                <InputBase
                  id="container-search"
                  name="searchText"
                  className={classes.input}
                  placeholder="Search for a Container"
                  inputProps={{ "aria-label": "search" }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  autoComplete="off"
                />
                {loading ? (
                  <CircularProgress
                    size={30}
                    style={{ marginRight: "10px" }}
                  ></CircularProgress>
                ) : (
                  <IconButton onClick={() => setSearchText("")}>
                    <CloseIcon />
                  </IconButton>
                )}
              </Stack>
            ) : (
              <>
                <InputBase
                  id="container-search"
                  name="searchText"
                  className={classes.input}
                  placeholder="Search for a Container"
                  inputProps={{ "aria-label": "search" }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  autoComplete="off"
                />
                {loading ? (
                  <CircularProgress
                    size={30}
                    style={{ marginRight: "10px" }}
                  ></CircularProgress>
                ) : (
                  <IconButton onClick={() => setSearchText("")}>
                    <CloseIcon />
                  </IconButton>
                )}
              </>
            )}

            <Button
              className={classes.searchButton}
              onClick={handleSearchButton}
            >
              Search
            </Button>
          </Stack>

          <Paper className={classes.searchResultContainer} elevation={1}>
            {showDropdown ? (
              containerData?.length > 0 ? (
                <List aria-label="search results">
                  {containerData.map((containerDate, index) => {
                    return (
                      <ListItem button key={index}>
                        <ListItemText
                          primary={`${containerDate.container_no} | ${containerDate.date} | ${containerDate.process}  `}
                        />
                        <Button
                          variant="contained"
                          className={classes.downloadButton}
                          endIcon={<PictureAsPdfIcon />}
                          onClick={() => {
                            if (Type === "Gate Pass") {
                              handleGatePassDownload(
                                containerDate.pk,
                                containerDate.process
                              );
                            } else {
                              handleDownload(
                                containerDate.pk,
                                containerDate.process
                              );
                            }
                          }}
                        >
                          Download PDF
                        </Button>
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
        </Paper>
      </ClickAwayListener>
    </LayoutContainer>
  );
};

export default AutomationReciept;
