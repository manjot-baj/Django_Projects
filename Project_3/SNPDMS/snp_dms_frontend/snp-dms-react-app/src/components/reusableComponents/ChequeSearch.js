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
import { useDispatch } from "react-redux";

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

const ChequeSearch = (props) => {
  // replace gatein.loloPaymentSearchResult to a prop variable -> paymentSearchResult
  const {
    paymentSearchResult,
    getSearchResultType,
    setSelectedPaymentType,
    updatePaymentType,
    searchAction,
  } = props;
  const classes = useStyles();
  const dispatch = useDispatch();

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
      // setSelectedPaymentType
      dispatch({
        type: setSelectedPaymentType,
        payload: paymentSearchResult,
      });
      //   updatePaymentType
      dispatch({
        type: updatePaymentType,
        payload: {
          date: paymentSearchResult.date,
          bank_name: paymentSearchResult.bank_name,
          account_name: paymentSearchResult.account_name,
          account_no: paymentSearchResult.account_no,
          cheque_no: paymentSearchResult.cheque_no,
          utr_no: paymentSearchResult.utr_no,
          quantity: paymentSearchResult.quantity.toString(),
          amount: paymentSearchResult.amount.toString(),
        },
      });
      //   getSearchResultType
      dispatch({ type: getSearchResultType, payload: null });
      setSearch("");
    }
  };
  return (
    <Grid container spacing={3}>
      <Grid item xs={4}>
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
              id="container-search"
              name="searchText"
              className={classes.input}
              placeholder="Search Cheque number"
              inputProps={{ "aria-label": "search" }}
              value={searchText}
              onChange={(e) => handleSearch(e)}
              autoComplete="off"
            />
          </Paper>
          {/* <ClickAwayListener onClickAway={handleClickAway}> */}
          <Paper className={classes.searchResultContainer} elevation={1}>
            {/* paymentSearchResult */}
            {showDropdown && paymentSearchResult && (
              <List aria-label="search results">
                {!paymentSearchResult.cheque_no &&
                !paymentSearchResult.utr_no ? (
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
                        paymentSearchResult.cheque_no
                          ? paymentSearchResult.cheque_no
                          : paymentSearchResult.utr_no
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
            dispatch(searchAction({ number: searchText }));
            setShowDropDown(true);
          }}
        >
          Search
        </Button>
      </Grid>
    </Grid>
  );
};

export default ChequeSearch;
