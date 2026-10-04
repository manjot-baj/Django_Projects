import React from "react";
import {
  InputBase,
  Paper,
  Button,
  Grid,
  IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";

const AutomationBookingSearch = (props) => {
  const {
    searchAction,
  } = props;
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [searchText, setSearch] = React.useState("");

  const handleSearch = (event) => {
    setSearch(event.target.value);
    if (event.target.value === "") {
    }
  };


  return (
    <Grid container spacing={3} sx={{width:"100%"}}>
      <Grid item size={{xs:12,md:6}}  >
        <div style={{ position: "relative" }}>
          <Paper
            component="form"
            sx={{
              padding: "1px 4px",
              display: "flex",
              width:"100%",
              alignItems: "center",
              height: 44,
              backgroundColor: "#DFE6EC",
              borderRadius: "0.5rem",
            }}
            elevation={0}
          >
            <IconButton
              type="submit"
              sx={{padding:3}}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
            <InputBase
              id="booking-search"
              name="searchText"
              sx={(theme)=>({
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
        </div>
      </Grid>
      <Grid item size={{xs:12,md:2}}  >
        <Button
          fullWidth
          variant="contained"
          color="warning"
          sx={{borderRadius:2}}
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
