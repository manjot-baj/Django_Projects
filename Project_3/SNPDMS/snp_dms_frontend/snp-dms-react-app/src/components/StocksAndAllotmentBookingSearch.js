import React from "react";

import {
  makeStyles,
  InputBase,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import { useDispatch, useSelector } from "react-redux";
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
    height: 34,
    backgroundColor: "#DFE6EC",
    borderRadius: "0.5rem",
  },

  searchResultContainer: {
    position: "absolute",
    top: 34,
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
const StocksAndAllotmentBookingSearch = (props) => {
  // replace gatein.loloPaymentSearchResult to a prop variable -> paymentSearchResult
  const {
    paymentSearchResult,
    getSearchResultType,
    setSelectedPaymentType,
    updatePaymentType,
    searchAction,
    setEdit,
    setBookingNumber
  } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const { stocksAllotment } = store;
  const notify = useSnackbar().enqueueSnackbar;
  const [searchText, setSearch] = React.useState("");
  const [showDropdown, setShowDropDown] = React.useState(false);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    if (event.target.value === "") {
      setShowDropDown(false);
    }
  };

  const setSelectedSearchValue = () => {
    //  paymentSearchResult

    if (paymentSearchResult) {
      //[abc,[ghj,klm]]
      // setSelectedPaymentType
      var bookingContainersList = [...paymentSearchResult.container_list];
      if (stocksAllotment.container_list.length > 0) {
        stocksAllotment.container_list.map((bk) => {
          if (!bookingContainersList.includes(bk))
            bookingContainersList.push(bk);
      
        });
      }
      dispatch({
        type: setSelectedPaymentType,
        payload: paymentSearchResult,
      });
      //   updatePaymentType
      dispatch({
        type: updatePaymentType,
        payload: {
          pk: paymentSearchResult.pk,
          booking_date: paymentSearchResult.booking_date,
          validity_date: paymentSearchResult.validity_date,
          booking_no: paymentSearchResult.booking_no,
          booking_party: paymentSearchResult.booking_party,
          quantity: paymentSearchResult.quantity,
          remaining: paymentSearchResult.remaining,
          container_list: bookingContainersList,
          remarks: paymentSearchResult.remarks,
        },
      });
      //   getSearchResultType
      dispatch({ type: getSearchResultType, payload: null });
      setSearch("");
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={9} md={6} lg={4}>
        <div style={{ position: "relative" }}>
          <Paper
            component="form"
            className={classes.searchPaper}
            elevation={0}
            // style={{ position: "relative" }}
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
          {/* <ClickAwayListener onClickAway={handleClickAway}> */}
          <Paper className={classes.searchResultContainer} elevation={1}>
            {showDropdown && paymentSearchResult && paymentSearchResult && (
              <List aria-label="search results">
                {!paymentSearchResult.booking_no ? (
                  <ListItem>
                    <ListItemText
                      // paymentSearchResult
                      primary={"No Result found"}
                    />
                  </ListItem>
                ) : (
                  <ListItem button onClick={setSelectedSearchValue}>
                    <ListItemText
                      // paymentSearchResult
                      primary={
                        paymentSearchResult.booking_no
                          ? paymentSearchResult.booking_no
                          : ""
                      }
                    />
                  </ListItem>
                )}
              </List>
            )}
          </Paper>
          {/* </ClickAwayListener> */}
        </div>
      </Grid>
      <Grid item xs={2}>
        <Button
          className={classes.searchButton}
          onClick={() => {
            dispatch(searchAction({ booking_no: searchText },notify,setEdit,setBookingNumber));
            setShowDropDown(true);
          }}
        >
          Search
        </Button>
      </Grid>
    </Grid>
  );
};

export default StocksAndAllotmentBookingSearch;
