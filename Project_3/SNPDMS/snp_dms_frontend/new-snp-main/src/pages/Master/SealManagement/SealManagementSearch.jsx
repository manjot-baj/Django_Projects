import React, { useState } from "react";
import {
  MenuItem,
  Grid,
  Box,
  Button,
  Modal,
  useMediaQuery,
} from "@mui/material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";

import { useDispatch } from "react-redux";
import { getSealManagementListings } from "../../../actions/master/SealManagementMasterActions";
import { useHistory } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";
import SealManagementSearchModal from "./SealManagementSearchModal";
import { TableCustomSearchBar } from "@/components/TableComponent/TableComponent";

export default function SealManagementSearch() {
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
      seal_box_number:name ==="Seal Box No."?filterType:'',
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
  const handleCloseClick = () => {
    setFilterType("");
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
          width: matchesIphone ? "0%" : "100%",
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: 2,
          gap: 24,
        }}
      >
        <Grid>
          <TableCustomSearchBar
            searchText={filterType}
            updateSelectname={updateName}
            setSearchText={setDispatchType}
            searchClick={getData}
            selectName={name}
            closeClick={handleCloseClick}
            maxWidthSearch={"90%"}
          >
            {" "}
            <MenuItem value={"Seal No."}>
              &nbsp; &nbsp;&nbsp;Seal Number
            </MenuItem>
            <MenuItem value={"Seal Line"}>
              &nbsp; &nbsp;&nbsp;Seal Line
            </MenuItem>
            <MenuItem value={"Container No."}>
              &nbsp; &nbsp;&nbsp;Container Number
            </MenuItem>
               <MenuItem value={"Seal Box No."}>
              &nbsp; &nbsp;&nbsp;Seal Box Number
            </MenuItem>
          </TableCustomSearchBar>
        </Grid>
        <Grid>
          <Button variant="text" color="primary" onClick={handleOpen}>
            <FilterAltOutlinedIcon />
            &nbsp; &nbsp; Advanced Search
          </Button>
        </Grid>

      </Grid>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={(theme) => ({
            top: "5%",
            position: "absolute",
            background: "#FFF",
            width: "85%",
            height: "max-content",
            margin: "auto",
            left: "10%",

            padding: "15px 25px",
            pointerEvents: "painted",
            [theme.breakpoints.down("sm")]: {
              height: "90vh",
              overflowY: "scroll",
              width: "95%",
              left: "2%",
              top: "2%",
            },
          })}
        >
          <Grid
            sx={{
              float: "right",
              cursor: "pointer",
            }}
          >
            <ClearIcon onClick={handleClose} />
          </Grid>
          <SealManagementSearchModal handleClose={handleClose} />
        </Box>
      </Modal>
    </div>
  );
}
