import React, { useState } from "react";
import {
  makeStyles,
  Paper,
  MenuItem,
  Grid,
  Box,
  Button,
  InputBase,
  Select,
  Modal,
  useMediaQuery
} from "@material-ui/core";

import { useDispatch } from "react-redux";
import { getSealManagementListings } from "../../../actions/Master/SealManagementMasterActions";
import UploadIcon from "@material-ui/icons/CloudUpload";
import { useHistory } from "react-router-dom";
import IconButton from "@material-ui/core/IconButton";
import ClearIcon from "@material-ui/icons/Clear";
import SearchIcon from "@material-ui/icons/Search";
import SealManagementSearchModal from "./SealManagementSearchModal";

const useStyles = makeStyles((theme) => ({
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
  },
  modalPopUp: {
    top: "20%",
    position: "absolute",
    background: "#FFF",
    width: "85%",
    height: "max-content",
    margin: "auto",
    left: "10%",
    padding: "15px 25px",
    pointerEvents: "painted",
  },
  clearIcon: {
    float: "right",
    cursor: "pointer",
  },
  iconButton: {
     marginLeft:"24px"
  },
  searchPaperMenu: {
    padding: "1px 4px",
    margin: 5,
    display: "flex",
    alignItems: "center",
    height: 45,
    borderRadius: "40px",
    width: "400px",
    "& .MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded":
      {
        marginTop: "123px !important",
      },
    [theme.breakpoints.down("xs")]: {
      height: 35,
    },
  },
  searchButton: {
    backgroundColor: "#FDBD2E",
    color: "#fff",
    borderRadius: "0.5rem",
    padding: "1px 4px",
    height: 40,
    fontSize: 16,
    marginLeft: "auto",
    marginRight: "auto",
    width: "350px",
    [theme.breakpoints.down("xs")]: {
     marginTop:"20px"
    },
    boxShadow: "0px 3px 6px #9199A14D",
    "&:hover": {
      backgroundColor: "#FDBD2E",
      color: "#fff",
    },
  },
  [theme.breakpoints.down("xs")]: {
    "& .MuiInputBase-input": {
      width: "200px",
      fontSize: "0.8rem",
      padding: 1,
    },
  }
}));

export default function SealManagementSearch() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const [name, setName] = useState("Seal No.");
  const [filterType, setFilterType] = useState("");
  const handleClose = () => setOpen(false);
  const history = useHistory();
  const matchesIphone = useMediaQuery("(max-width:500px)");

  const updateName = (event) => {
    setFilterType("");
    dispatch({ type: "RESET_SEAL_DATA" });
    setName(event.target.value);
  };

  const getData = () => {
    let data = {
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      line: name === "Seal Line" ? filterType : "",
      number: name === "Seal No." ? filterType : "",
      container_no: name === "Container No." ? filterType : "",
      is_available: true,
      is_damaged: false,
      is_cut: false,
      is_first_allotment: true,
      is_history: false,
      in_date: { from: "", to: "" },
      out_date: { from: "", to: "" },
      in_use_date: { from: "", to: "" },
      pg_no: 1,
      on_page_data: 5,
    };
    dispatch(getSealManagementListings(data));
  };
  const setDispatchType = (e) => {
    setFilterType(e.target.value);
  };
  const openSealUpload = () => {
    history.push("/seal-upload");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      let data = {
        location: localStorage.getItem("location")
          ? localStorage.getItem("location")
          : null,
        site: localStorage.getItem("site")
          ? localStorage.getItem("site")
          : null,
        line: name === "Seal Line" ? filterType : "",
        number: name === "Seal No." ? filterType : "",
        container_no: name === "Container No." ? filterType : "",
        is_available: true,
        is_damaged: false,
        is_cut: false,
        is_first_allotment: true,
        is_history: false,
        in_date: { from: "", to: "" },
        out_date: { from: "", to: "" },
        in_use_date: { from: "", to: "" },
        pg_no: 1,
        on_page_data: 5,
      };
      dispatch(getSealManagementListings(data));
    }
  };
  return (
    <div>
      <Grid
        style={{
          display: matchesIphone ? "block" : "flex",
          width: matchesIphone ? "0%" : "100%" ,
          justifyContent: "space-between",
          alignItems:"center",
          marginTop:matchesIphone? 24:16
        }}
      >
        <Grid className={classes.searchPaperWrapper}>
          <Paper
            component="form"
            className={classes.searchPaperMenu}
            elevation={0}
            style={{width: matchesIphone ? "340px" : "400px"}}
          >
            <Select
              id="seal-number"
              value={name}
              fullWidth
              className={classes.searchMenuItemPaper}
              onChange={updateName}
            >
              <MenuItem value={"Seal No."}>
                &nbsp; &nbsp;&nbsp;Seal Number
              </MenuItem>
              <MenuItem value={"Seal Line"}>
                &nbsp; &nbsp;&nbsp;Seal Line
              </MenuItem>
              <MenuItem value={"Container No."}>
                &nbsp; &nbsp;&nbsp; Container Number
              </MenuItem>
            </Select>
            <InputBase
              className={classes.input}
              placeholder={`Search ${name}`}
              inputProps={{ "aria-label": "search" }}
              value={filterType}
              onChange={setDispatchType}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <IconButton
              type="button"
              className={classes.iconButton}
              aria-label="search"
              onClick={() => {
                getData();
              }}
            >
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
        <Grid>
          <Button className={classes.searchButton} onClick={handleOpen}>
            <SearchIcon />
            &nbsp; &nbsp; Advanced Search
          </Button>
        </Grid>
        <Grid>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#2A5FA5",
            color: "#FFF",
            marginLeft: "10px",
            width:'175px',
            marginTop:matchesIphone ?"12px":"0"
          }}
          onClick={openSealUpload}
          endIcon={<UploadIcon />}
        >
          Seal Upload
        </Button>
      </Grid>
      </Grid>
      <Modal open={open} onClose={handleClose}>
        <Box className={classes.modalPopUp}>
          <Grid className={classes.clearIcon}>
            <ClearIcon onClick={handleClose} />
          </Grid>
          <SealManagementSearchModal handleClose={handleClose} />
        </Box>
      </Modal>

      
    </div>
  );
}