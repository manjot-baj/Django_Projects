import React from "react";

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
  useMediaQuery,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import {
  containerSearchDispatch,
  containerSearchDispatchOut,
  getGateContainerByClientSearch,
  getGateInContainerByDateDispatch,
} from "../../actions/LoadedYardActions";
import { useSnackbar } from "notistack";

const LoadedYardSearch = (props) => {
  const { searchType } = props;
  const [searchText, setSearch] = React.useState("");
  const [showDropdown, setDropdown] = React.useState(false);
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { loadedYard } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");
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
    if (searchType === "GateInYard") {
      dispatch(getGateInContainerByDateDispatch(body, setDropdown, notify));
    } else {
      dispatch(getGateInContainerByDateDispatch(body, setDropdown, notify));
    }
  };
  return (
    <Paper
      sx={(theme) => ({
        padding: theme.spacing(2.5),
        borderRadius: 4,
        [theme.breakpoints.down("sm")]: {
          padding: theme.spacing(1),
          width: "98%",
          marginLeft: "auto",
          marginRight: "auto",
        },
      })}
      elevation={0}
    >
      <Grid
        container
        spacing={3}
        sx={(theme) => ({
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",

        })}
        style={{ display: matchesIphone ? "block" : "flex" }}
      >
        <Grid
          item
          xs={
            searchType === "GateInYard" || searchType === "GateOutYard" ? 9 : 6
          }
          style={{ position: "relative" ,width:"70%"}}
        >
          <Paper
            component="form"
            sx={(theme) => ({
              padding: "1px 4px",
              display: "flex",
              alignItems: "center",
              height: 40,
              width: "100%",
              backgroundColor: "#DFE6EC",
              borderRadius: "0.5rem",
              [theme.breakpoints.down("xs")]: {
                height: 35,
                width: "100%",
              },
              [theme.breakpoints.down("md")]: {
                height: 35,
                width: "100%",
              },
            })}
            elevation={0}
          >
            <IconButton
              type="submit"
              sx={(theme) => ({
                padding: 6,
                [theme.breakpoints.down("md")]: {
                  paddingX: 2,
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
                [theme.breakpoints.down("md")]: {
                  paddingX: 0,
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
              sx={(theme) => ({
                position: "absolute",
                top: 50,
                left: 0,
                width: "100%",
                zIndex: 10,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
              })}
              elevation={1}
            >
              {showDropdown ? (
                searchType === "GateInYard" ? (
                  loadedYard?.containerSearchResult?.container_no ? (
                    <List aria-label="search results">
                      {loadedYard?.containerSearchResult?.dates?.map(
                        (containerDate, index) => {
                          return (
                            <ListItem
                              button
                              key={index}
                              style={
                                loadedYard?.containerSearchResult?.dates
                                  ?.length > 1 && index === 0
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
                                    loadedYard?.containerSearchResult
                                      ?.container_no,
                                  date: containerDate,
                                  process_type:
                                    loadedYard?.containerSearchResult
                                      ?.process_type,
                                })
                              }
                            >
                              <ListItemText
                                primary={`${containerDate}    |    ${loadedYard.containerSearchResult.container_no} | ${loadedYard.containerSearchResult.process_type}`}
                              />
                            </ListItem>
                          );
                        }
                      )}
                    </List>
                  ) : loadedYard?.containerSearchResult?.data ? (
                    loadedYard?.containerSearchResult?.data.length === 0 ? (
                      <Typography
                        sx={(theme) => ({
                          padding: theme.spacing(1.5),
                          textAlign: "center",
                        })}
                      >
                        No result found for {`"${searchText}"`}
                      </Typography>
                    ) : (
                      <List aria-label="search results">
                        {loadedYard?.containerSearchResult?.data?.map(
                          (container, index) => {
                            return (
                              <ListItem
                                button
                                key={index}
                                onClick={() =>
                                  dispatch(
                                    getGateContainerByClientSearch(
                                      container.pk,
                                      setDropdown,
                                      notify
                                    )
                                  )
                                }
                              >
                                <ListItemText
                                  primary={`${
                                    container?.container_no
                                  }    |    ${container?.move_codes.join(
                                    ","
                                  )} | ${
                                    loadedYard.containerSearchResult
                                      ?.process_type
                                  }`}
                                />
                              </ListItem>
                            );
                          }
                        )}
                      </List>
                    )
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
                ) : loadedYard?.containerSearchResult?.container_no ? (
                  <List aria-label="search results">
                    {loadedYard?.containerSearchResult?.dates?.map(
                      (containerDate, index) => {
                        return (
                          <ListItem
                            button
                            key={index}
                            onClick={() =>
                              handleContainerDateSelect({
                                container_no:
                                  loadedYard?.containerSearchResult
                                    ?.container_no,
                                date: containerDate,
                                process_type:
                                  loadedYard?.containerSearchResult
                                    ?.process_type,
                              })
                            }
                          >
                            <ListItemText
                              primary={`${containerDate}    |    ${loadedYard?.containerSearchResult?.container_no} |  ${loadedYard.containerSearchResult.process_type}`}
                            />
                          </ListItem>
                        );
                      }
                    )}
                  </List>
                ) : loadedYard?.containerSearchResult?.data ? (
                  loadedYard?.containerSearchResult?.data.length === 0 ? (
                    <Typography
                      sx={(theme) => ({
                        padding: theme.spacing(1.5),
                        textAlign: "center",
                      })}
                    >
                      No result found for {`"${searchText}"`}
                    </Typography>
                  ) : (
                    <List aria-label="search results">
                      {loadedYard?.containerSearchResult?.data?.map(
                        (container, index) => {
                          return (
                            <ListItem
                              button
                              sx={{cursor:'pointer'}}
                              key={index}
                              onClick={() =>
                                dispatch(
                                  getGateContainerByClientSearch(
                                    container.pk,
                                    setDropdown,
                                    notify
                                  )
                                )
                              }
                            >
                              <ListItemText
                                primary={`${
                                  container?.container_no
                                }    |    ${container?.move_codes.join(
                                  ","
                                )} | ${
                                  loadedYard.containerSearchResult?.process_type
                                }`}
                              />
                            </ListItem>
                          );
                        }
                      )}
                    </List>
                  )
                ) : (
                  <Typography
                    sx={(theme) => ({
                      padding: theme.spacing(1.5),
                      textAlign: "center",
                    })}
                  >
                    {loadedYard?.containerSearchResult?.errorMsg &&
                    loadedYard?.containerSearchResult?.errorMsg.includes(
                      "Invalid credentials"
                    )
                      ? `No result found for "${searchText}"`
                      : loadedYard?.containerSearchResult?.errorMsg}
                  </Typography>
                )
              ) : null}
            </Paper>
          </ClickAwayListener>
        </Grid>
        <Grid item size={{ xs: 12, sm: 3 }}>
          <Button
            variant="contained"
            color="warning"
            sx={{width:240}}
            onClick={() => {
              if (searchType === "GateInYard") {
                dispatch(
                  containerSearchDispatch(
                    { container_no: searchText },
                    setDropdown,
                    notify
                  )
                );
              } else {
                dispatch(
                  containerSearchDispatchOut(
                    { container_no: searchText },
                    setDropdown,
                    notify
                  )
                );
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

export default LoadedYardSearch;
