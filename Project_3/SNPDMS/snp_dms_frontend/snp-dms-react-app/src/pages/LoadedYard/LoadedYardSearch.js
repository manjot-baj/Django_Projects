import React from "react";

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
  useMediaQuery,
  Divider,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { useDispatch, useSelector } from "react-redux";
import {
  containerSearchDispatch,
  containerSearchDispatchOut,
  getGateContainerByClientSearch,
  getGateInContainerByDateDispatch
} from "../../actions/LoadedYardActions";
import { useSnackbar } from "notistack";

const useStyles = makeStyles((theme) => ({
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    padding: 7,
  },
  iconButton: {
    padding: 6,
  },
  paperContainer: {
    padding: theme.spacing(2.5),
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
    width: "800px",
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
  },
  searchButton: {
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
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const LoadedYardSearch = (props) => {
  const classes = useStyles();
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
    <Paper className={classes.paperContainer} elevation={0}>
      <Grid
        container
        spacing={3}
        className={classes.mainGrid}
        style={{ display: matchesIphone ? "block" : "flex" }}
      >
        <Grid
          item
          xs={
            searchType === "GateInYard" || searchType === "GateOutYard" ? 9 : 6
          }
          style={{ position: "relative" }}
        >
          <Paper component="form" className={classes.searchPaper} elevation={0}>
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
                  ) :  loadedYard?.containerSearchResult?.data ? 
                  
                  ( loadedYard?.containerSearchResult?.data.length===0?<Typography className={classes.noResultText}>
                    No result found for {`"${searchText}"`}
                  </Typography> : <List aria-label="search results">
                  {loadedYard?.containerSearchResult?.data?.map(
                    (container, index) => {
                      return (
                        <ListItem
                          button
                          key={index}
                        
                          onClick={() =>dispatch(getGateContainerByClientSearch(container.pk,setDropdown,notify))  }
                        >
                          <ListItemText
                            primary={`${container?.container_no}    |    ${container?.move_codes.join(',')} | ${loadedYard.containerSearchResult?.process_type}`}
                          />
                        
                        </ListItem>
                      );
                    }
                  )}
                </List>)
                  : (
                    <Typography className={classes.noResultText}>
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
                ) : loadedYard?.containerSearchResult?.data ? 
                  
               (  loadedYard?.containerSearchResult?.data.length===0?<Typography className={classes.noResultText}>
                No result found for {`"${searchText}"`}
              </Typography> : <List aria-label="search results">
                {loadedYard?.containerSearchResult?.data?.map(
                  (container, index) => {
                    return (
                      <ListItem
                        button
                        key={index}
                      
                        onClick={() =>dispatch(getGateContainerByClientSearch(container.pk,setDropdown,notify))  }
                      >
                        <ListItemText
                          primary={`${container?.container_no}    |    ${container?.move_codes.join(',')} | ${loadedYard.containerSearchResult?.process_type}`}
                        />
                      
                      </ListItem>
                    );
                  }
                )}
              </List>)
                : (
                  <Typography className={classes.noResultText}>
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
        <Grid item xs={3} sm={3}>
          <Button
            className={classes.searchButton}
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
