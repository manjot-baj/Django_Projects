import { TableCustomSearchBar } from "@/components/TableComponent/TableComponent";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import { getMNRStaffAttendanceListingAction } from "@/actions/master/MNRStaffAttendenceAction";
import { useSnackbar } from "notistack";
import { MASTER_MNR_STAFF_ATTENDENCE } from "@/reducers/master/MNRStaffAttendanceReducer";
import ClearIcon from "@mui/icons-material/Clear";
import DatePickerField from "@/components/reusablecomponents/DatePickerField";
import { customLabelTypography } from "@/utils/CustomClasses";

const StaffAttendanceSearch = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const notify = useSnackbar().enqueueSnackbar;
  const [name, setName] = useState("firstName");
  const [filterType, setFilterType] = useState("");
  const [fromInDate, setFromInDate] = useState("");
  const [toInDate, setToInDate] = useState("");

  const updateName = (event) => {
    setFilterType("");
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST_RESET_SEARCH,
    });
    setName(event.target.value);
  };

  const getData = () => {
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
      payload: {
        [name]: filterType,
      },
    });
    dispatch(getMNRStaffAttendanceListingAction(notify));
  };

  const handleSearch = () => {
    if (fromInDate !== "" && toInDate !== "") {
      dispatch({
        type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
        payload: {
          from_date: fromInDate,
          to_date: toInDate,
        },
      });
    } else {
      notify("Please fill From Date and To Date ", { variant: "warning" });
    }
    dispatch(getMNRStaffAttendanceListingAction(notify));
    handleClose();
  };

  const handleCloseClick = () => {
    setFilterType("");
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST_RESET_SEARCH,
    });
    dispatch(getMNRStaffAttendanceListingAction(notify));
  };
  const setDispatchType = (e) => {
    setFilterType(e.target.value);
  };

  const handleFromInDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setFromInDate(selectedDateFormat);
  };

  const handleToInDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setToInDate(selectedDateFormat);
  };

  return (
    <div>
      <Grid
        style={{
          display: "flex",
          width: "100%",
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
            <MenuItem value={"firstName"}>
              &nbsp; &nbsp;&nbsp;First Name
            </MenuItem>
            <MenuItem value={"lastName"}>&nbsp; &nbsp;&nbsp;Last name</MenuItem>
            <MenuItem value={"role"}>&nbsp; &nbsp;&nbsp; Role</MenuItem>
          </TableCustomSearchBar>
        </Grid>
        <Grid>
          <Button variant="text" color="primary" onClick={handleOpen}>
            <FilterAltOutlinedIcon />
            &nbsp; &nbsp; Advanced Search
          </Button>
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
            <div>
              <Typography variant="subtitle2">
                <Box fontWeight="fontWeightBold" m={1}>
                  Advance Search
                </Box>
              </Typography>

              <Paper
                sx={(theme) => ({
                  padding: theme.spacing(4, 3),
                })}
                elevation={0}
              >
                <Grid container spacing={4}>
                  <Grid item size={{ xs: 12, sm: 6, lg: 6 }}>
                    <Typography variant="subtitle1" sx={customLabelTypography}>
                      From date
                    </Typography>

                    <DatePickerField
                      dateId="seal-from-in-date"
                      dateValue={fromInDate}
                      fullWidth
                      dateChange={handleFromInDateChange}
                      sx={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid item size={{ xs: 12, sm: 6, lg: 6 }}>
                    <Typography variant="subtitle1" sx={customLabelTypography}>
                      To date
                    </Typography>

                    <DatePickerField
                      fullWidth
                      dateId="seal-to-in-date"
                      dateValue={toInDate}
                      dateChange={handleToInDateChange}
                    />
                  </Grid>
                </Grid>

                <Grid
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 6,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    sx={(theme) => ({
                      fontSize: 12.5,
                      borderRadius: 2,
                      marginLeft: "auto",
                      marginRight: "auto",
                      marginTop: 4,
                      width: "35%",
                    })}
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={(theme) => ({
                      fontSize: 12.5,
                      borderRadius: 2,
                      marginLeft: "auto",
                      marginRight: "auto",
                      marginTop: 4,
                      width: "35%",
                    })}
                    onClick={() => {
                      setFromInDate("");
                      setToInDate("");
                      dispatch({
                        type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST_RESET_SEARCH,
                      });
                      dispatch(getMNRStaffAttendanceListingAction(notify));
                    }}
                  >
                    Reset
                  </Button>
                </Grid>
              </Paper>
            </div>
          </Box>
        </Modal>
      </Grid>
    </div>
  );
};

export default StaffAttendanceSearch;
