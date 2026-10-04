import React from "react";
import {
  makeStyles,
  InputBase,
  Paper,
  Button,
  Grid
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
const useStyles = makeStyles((theme) => ({
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 3,
  },
  searchPaper: {
    padding: "1px 4px",
    display: "flex",
    alignItems: "center",
    height: 44,
    backgroundColor: "#DFE6EC",
    borderRadius: "0.5rem",
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 34,
    width: "100%",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
  },
}));
const AutomationBookingSearch = (props) => {
  const {
    searchAction,
  } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [searchText, setSearch] = React.useState("");

  const handleSearch = (event) => {
    setSearch(event.target.value);
    if (event.target.value === "") {
    }
  };


  return (
    <Grid container xs={12} spacing={3}>
      <Grid item xs={8}>
        <div style={{ position: "relative" }}>
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
              id="booking-search"
              name="searchText"
              className={classes.input}
              placeholder="Search booking number"
              inputProps={{ "aria-label": "search" }}
              value={searchText}
              onChange={(e) => handleSearch(e)}
              autoComplete="off"
            />
          </Paper>
        </div>
      </Grid>
      <Grid item xs={2}>
        <Button
          className={classes.searchButton}
          onClick={() => {
            dispatch(searchAction({ booking_no: searchText }, notify));
          }}
        >
          Search
        </Button>
      </Grid>
    </Grid>
  );
};

export default AutomationBookingSearch;
