import React from "react";
import {
  InputBase,
  Paper,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch } from "react-redux";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { useSnackbar } from "notistack";

const ChequeSearch = (props) => {
  // replace gatein.loloPaymentSearchResult to a prop variable -> paymentSearchResult
  const {
    paymentSearchResult,
    getSearchResultType,
    setSelectedPaymentType,
    updatePaymentType,
    searchAction,
  } = props;
  const dispatch = useDispatch();
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
      <Grid item size={{ xs: 6 }}>
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
              id="container-search"
              name="searchText"
              sx={(theme) => ({
                marginLeft: theme.spacing(1),
                flex: 1,
              })}
              placeholder="Search Cheque number"
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
      <Grid item size={{ xs: 2 }}>
        <Button
          sx={{
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
          }}
          onClick={() => {
            dispatch(
              searchAction({ number: searchText }, props.paymentType, notify)
            );
            setShowDropDown(true);
          }}
        >
          Search
        </Button>
      </Grid>
      {props.enableCloseButton && (
        <Grid item size={{ xs: 4 }} textAlign={"end"}>
          <IconButton onClick={props.handleRemoveCurrentData}>
            <CloseOutlinedIcon />
          </IconButton>
        </Grid>
      )}
    </Grid>
  );
};

export default ChequeSearch;
