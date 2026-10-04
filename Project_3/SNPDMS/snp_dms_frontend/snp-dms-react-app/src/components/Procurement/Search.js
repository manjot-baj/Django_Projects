import {
  Button,
  InputBase,
  Paper,
  IconButton,
  ButtonGroup,
  Select,
  MenuItem,
  makeStyles,
  useMediaQuery,
} from "@material-ui/core";
import { styled } from "@material-ui/styles";
import React from "react";
import ReplayIcon from "@mui/icons-material/Replay";
import Add from "@mui/icons-material/Add";
import UploadIcon from "@mui/icons-material/Upload";
import { Link } from "react-router-dom";
import { Stack } from "@mui/material";
import "./Table.css";
import SearchIcon from '@mui/icons-material/Search';

const useStyles = makeStyles((theme) => ({
  input: {
    padding: 7,
    borderColor: "black",
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.7rem",
      padding: "2px",
    },
  },
  searchMenuItemPaper: {
    width: "20px",
    marginRight: "20px",
    marginLeft: "20px",
    border: "none",
    paddingRight: "12px",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    "&:before": {
      borderBottom: "none",
    },
    "&:focus": {
      borderBottom: "none",
    },
    "&:hover": {
      borderBottom: "none",
    },
    "&:.MuiSelect-selectMenu": {
      textOverflow: "0px !important",
    },
    "& .MuiSelect-select.MuiSelect-select": {
      fontSize: "0px",
    },
    [theme.breakpoints.down("xs")]: {
      marginRight: "2px",
      marginLeft: "5px",
    },
  },
  searchButton: {
    [theme.breakpoints.down("md")]: {
      fontSize: "0.7rem",
      height:"30px",
  
    },
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.5rem",
      height:"30px",
  
    },
  },
}));

const Search = ({
  inputText,
  handleChange,
  handleRefresh,
  onClickSearch,
  addToolModel,
  selectedData,
  handleAllRequest,
  handleAllConsume,
  searchSelect,
  setSearchSelect,
}) => {
  const classes = useStyles();
  const matchesIphone = useMediaQuery("(max-width:450px)");

  console.log(selectedData)

  return (
    <>
      <Container>
        <Paper
          component="form"
          sx={{
            p: "2px 5px",
            display: "flex",
            alignItems: "center",
          }}
          style={{
            padding: "1px 10px 1px 10px",
            margin: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: matchesIphone ? 40 : 45,
            borderRadius: "40px",
            flex: 3,
          }}
        >
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={searchSelect}
            className={classes.searchMenuItemPaper}
            onChange={(e) => setSearchSelect(e.target.value)}
          >
            <MenuItem value={"category"}>Category</MenuItem>
            <MenuItem value={"name"}>Item </MenuItem>
            <MenuItem value={"sku_code"}>SKU code</MenuItem>
          </Select>
          <InputBase
            sx={{ ml: 1, flex: 1, p: matchesIphone ? "1px 2px" : "2px 10px" }}
            placeholder={`Search by ${searchSelect==="name"?"Item":searchSelect}`}
            value={inputText}
            onChange={handleChange}
            inputProps={{
              "aria-label": "search google maps",
              style: { fontSize: matchesIphone ? "0.8rem" : "1rem" },
            }}
          />
          <IconButton
            variant="contained"
            color="secondary"
            onClick={onClickSearch}
          >
             <SearchIcon/>
          </IconButton>
        </Paper>

        {!matchesIphone && (
          <Button
            variant="contained"
            color="secondary"
            style={{
              borderRadius: "40px",
              flex: 2,
              backgroundColor: "#2a5fa5",
            }}
            // onClick={onClickAdvance}
            onClick={addToolModel}
            startIcon={<Add />}
          >
            Add Tool
          </Button>
        )}
        {!matchesIphone && (
          <Link
            to="/procurement/upload"
            style={{
              margin: "auto 20px",
              display: "flex",
              border: "none",
              padding: "7px 20px ",
              backgroundColor: "#2a5fa5",
              borderRadius: "50px",
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
            }}
          >
            <UploadIcon fontSize="small" /> Bulk Upload
          </Link>
        )}

        <IconButton
          variant="contained"
          color="secondary"
          style={{ borderRadius: "40px", flex: 0.5 }}
          onClick={handleRefresh}
        >
          <ReplayIcon color="#FDBD2Eed" />
        </IconButton>
      </Container>
      <Stack
        style={{ height: "10px", marginTop: "40px" }}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-end"}
        className="procuremenTable"
        spacing={2}
      >
        {matchesIphone && (
          <Button
            variant="contained"
            color="secondary"
            style={{
              borderRadius: "40px",
              flex: 2,
              backgroundColor: "#2a5fa5",
              fontSize:"0.6rem",
              maxWidth:"100px"
            }}
            // onClick={onClickAdvance}
            onClick={addToolModel}
            startIcon={<Add />}
          >
            Add Tool
          </Button>
        )}
        {matchesIphone && (
          <Link
            to="/procurement/upload"
            style={{
            
              display: "flex",
              border: "none",
              padding: "7px 20px ",
              backgroundColor: "#2a5fa5",
              borderRadius: "50px",
              textDecoration: "none",
              color: "white",
              fontWeight: "bold",
              fontSize:"0.5rem",
              alignItems:"center"
            }}
          >
            <UploadIcon fontSize="small" /> Bulk Upload
          </Link>
        )}
      </Stack>

      <Stack
        style={{ height: "10px", marginTop:matchesIphone ?"40px": "20px" }}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-end"}
        className="procuremenTable"
      >
        {selectedData.length !== 0 && (
          <ButtonGroup
            disableElevation
            variant="contained"
            aria-label="Disabled elevation buttons"
          >
            <Link to="/procurement/addrequesition">
              <Button
                onClick={handleAllRequest}
                aria-label="request"
                className="action_request"
              >
                Request
              </Button>
            </Link>
            <Link to="/procurement/addconsumption">
              <Button
                aria-label="consume"
                className="action_request"
                onClick={handleAllConsume}
              >
                Consume
              </Button>
            </Link>
          </ButtonGroup>
        )}
      </Stack>
    </>
  );
};

const Container = styled("div")({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
});

export default Search;
