import React from "react";

import {
  InputBase,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";

const StocksAndAllotmentBookingSearch = (props) => {
  // replace gatein.loloPaymentSearchResult to a prop variable -> paymentSearchResult
  const {
    paymentSearchResult,
    getSearchResultType,
    setSelectedPaymentType,
    updatePaymentType,
    searchAction,
    setEdit,
    setBookingNumber,
  } = props;
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
    <Grid container spacing={3} style={{width:"100%"}}>
      <Grid item size={{xs:9,md:6,lg:6}} >
        <div style={{ position: "relative" }}>
          <Paper
            component="form"
            sx={{
              padding: "1px 4px",
              display: "flex",
              alignItems: "center",
              height: 34,
              backgroundColor: "#DFE6EC",
              borderRadius: "0.5rem",
            }}
            elevation={0}
            // style={{ position: "relative" }}
          >
            <IconButton
              type="submit"
              sx={{
                padding: 3,
              }}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
            <InputBase
              id="booking-search"
              name="searchText"
              sx={(theme) => ({
                marginLeft: theme.spacing(1),
                flex: 1,
              })}
              placeholder="Search booking number"
              inputProps={{ "aria-label": "search" }}
              value={searchText}
              onChange={(e) => handleSearch(e)}
              autoComplete="off"
            />
          </Paper>
          {/* <ClickAwayListener onClickAway={handleClickAway}> */}
          <Paper
            sx={{
              position: "absolute",
              top: 34,
              left: 0,
              width: "100%",
              zIndex: 10,
              borderTopRightRadius: 0,
              borderTopLeftRadius: 0,
            }}
            elevation={1}
          >
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
      <Grid item size={{xs:2,md:4,lg:4}}>
        <Button
         fullWidth
         variant="contained"
         color="warning"
          onClick={() => {
            dispatch(
              searchAction(
                { booking_no: searchText },
                notify,
                setEdit,
                setBookingNumber
              )
            );
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
