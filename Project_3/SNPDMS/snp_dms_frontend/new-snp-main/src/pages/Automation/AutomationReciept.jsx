import React, { useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useSnackbar } from "notistack";
import {
  Backdrop,
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
  MenuItem,
  Paper,
  Select,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Stack } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  downloadAutomationContainerAction,
  downloadAutomationGatePassAction,
  getSearchListContainers,
} from "../../actions/AutomationActions";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { custombackDropStyle } from "@/utils/CustomClasses";


const AutomationReciept = () => {
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { isloading } = useSelector((state) => state.ui);
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
      <Typography variant="h5">Automation Receipt</Typography>
      {matchesIphone && (
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          mt={6}
        >
          <FormControl variant="standard">
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
              sx={(theme) => ({
                marginLeft: theme.spacing(1),
                flex: 1,
                padding: "0 14px",
                [theme.breakpoints.down("xs")]: {
                  padding: 1,
                  fontSize: "0.8rem",
                },
              })}
              inputProps={{
                style: {
                  padding: "0px 10px",
                  marginTop: "-10px",
                },
              }}
              style={{
                width: "120px",
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
          <FormControl variant="standard">
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
              sx={(theme) => ({
                marginLeft: theme.spacing(1),
                flex: 1,
                padding: "0 10px",
                [theme.breakpoints.down("xs")]: {
                  padding: 1,
                  fontSize: "0.8rem",
                },
              })}
              inputProps={{
                style: {
                  padding: "0px 10px",
                  marginTop: "-10px",
                },
              }}
              style={{
                width: "120px",
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
        </Stack>
      )}
      <ClickAwayListener onClickAway={handleClickAway}>
        <Paper
          component="form"
          sx={(theme) => ({
            padding: "20px 20px",
            [theme.breakpoints.down("sm")]: {
              padding: 0,
              borderRadius: 2,
              marginLeft: 0,
            },
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
            marginLeft: theme.spacing(2),
            backgroundColor: theme.palette.background.paper,
            borderRadius: 4,
            color: theme.palette.text.primary,
            position: "relative",
          })}
          elevation={0}
        >
          <Stack
            direction={matchesIphone ? "column" : "row"}
            alignItems={matchesIphone ? "flex-start" : "center"}
            justifyContent={"center"}
            flexDirection={matchesIphone ? "column" : "row"}
            style={{ backgroundColor: "#dfe6ec", borderRadius: "5px" }}
            spacing={matchesIphone ? 4 : 0}
            padding={matchesIphone ? "24px 6px" : "4px"}
          >
            {!matchesIphone && (
              <FormControl
                variant="standard"
                style={{
                  marginTop: matchesIphone ? "12px" : "-15px",
                }}
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
                  sx={(theme) => ({
                    marginLeft: theme.spacing(1),
                    flex: 1,
                    padding: "0 14px",
                    [theme.breakpoints.down("xs")]: {
                      padding: 1,
                      fontSize: "0.8rem",
                    },
                  })}
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
            )}
            {!matchesIphone && (
              <FormControl
                variant="standard"
                style={{
                  marginTop: matchesIphone ? "24px" : "-15px",
                }}
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
                  sx={(theme) => ({
                    marginLeft: theme.spacing(1),
                    flex: 1,
                    padding: "0 10px",
                    [theme.breakpoints.down("xs")]: {
                      padding: 1,
                      fontSize: "0.8rem",
                    },
                  })}
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
            )}
            {matchesIphone ? (
              <Stack direction={"row"}>
                {" "}
                <InputBase
                  id="container-search"
                  name="searchText"
                  sx={(theme) => ({
                    marginLeft: theme.spacing(1),
                    flex: 1,
                    padding: 1,

                    backgroundColor: "rgba(0,0,0,0.03)",
                    borderRadius: 2,
                    [theme.breakpoints.down("xs")]: {
                      padding: 1,
                      fontSize: "0.8rem",
                    },
                  })}
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
                  sx={(theme) => ({
                    marginLeft: theme.spacing(1),
                    flex: 1,
                    padding: 1,
                    [theme.breakpoints.down("xs")]: {
                      padding: 1,
                      fontSize: "0.8rem",
                    },
                  })}
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
              variant="contained"
              color="warning"
              sx={{ width: 240, borderRadius: 2 }}
              onClick={handleSearchButton}
            >
              Search
            </Button>
          </Stack>

          <Paper
            sx={(theme) => ({
              position: "absolute",
              top: 90,
              left: 0,
              width: "80%",
              marginLeft: "30px",
              zIndex: 10,
              borderTopRightRadius: 0,
              borderTopLeftRadius: 0,
              [theme.breakpoints.down("sm")]: {
                top: 200,
                width: "100%",
                marginLeft: "0",
              },
            })}
            elevation={1}
          >
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
                          sx={{
                            backgroundColor: "green",
                            color: "white",
                            "&:hover": {
                              backgroundColor: "green",
                            },
                          }}
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
                          {matchesIphone ? "" : "Download PDF"}
                        </Button>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography>No result found for {`"${searchText}"`}</Typography>
              )
            ) : null}
          </Paper>
        </Paper>
      </ClickAwayListener>
         <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default AutomationReciept;
