import { getMNRStaffAttendanceListingAction } from "@/actions/master/MNRStaffAttendenceAction";
import MasterListings from "@/components/reusablecomponents/MasterListings";
import { TableCustomPaginationReactTable } from "@/components/TableComponent/TableComponent";
import { MASTER_MNR_STAFF_ATTENDENCE } from "@/reducers/master/MNRStaffAttendanceReducer";
import { Grid } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const tableRow = [
  { id: 1, name: "Sr No." },
  { id: 2, name: "Employee" },
  { id: 3, name: "Role" },
  { id: 4, name: "Qualification" },
  { id: 5, name: "Email Id" },
  { id: 6, name: "Mobile No" },

  { id: 7, name: "Date" },
  { id: 8, name: "Status" },
  { id: 9, name: "In Time" },
  { id: 10, name: "Out Time " },
  { id: 1, name: "Remarks " },
];

const MNRStaffAttendence = () => {
  const { MNRStaffAttendanceReducer } = useSelector((state) => state);
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(1);

  const handleButtonClick = () => {
    history.push("/master/mnr-staff-attendance/add");
  };

  const deleteSelected = () => {
    console.log("delete");
  };

  const handleOnRowsChange = (e) => {
    setCurrentPage(1);
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
      payload: {
        pg_no: 1,
      },
    });
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
      payload: {
        pg_no: e.target.value,
      },
    });
  };

  const handleOnPageDataChange = (value) => {
    setCurrentPage(1);
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
      payload: {
        pg_no: 1,
      },
    });
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
      payload: {
        on_page_data_client: value,
      },
    });
  };

  const handleInitialPage = () => {
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
      payload: {
        pg_no: 1,
      },
    });
    setCurrentPage(1);
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: MASTER_MNR_STAFF_ATTENDENCE.GET_STAFF_ATTENDANCE_LIST,
      payload: {
        pg_no: val,
      },
    });
    setCurrentPage(val);
  };

  useEffect(() => {
    dispatch(getMNRStaffAttendanceListingAction(notify));
  }, [
    MNRStaffAttendanceReducer.get_all_attendance_list.pg_no,
    MNRStaffAttendanceReducer.get_all_attendance_list.on_page_data_client,
  ]);

  return (
    <Grid>
      <MasterListings
        rowArray={tableRow}
        masterArray={MNRStaffAttendanceReducer.get_all_attendance_list.data}
        buttonName="Staff Attendance"
        buttonClick={handleButtonClick}
        deleteSelected={deleteSelected}


        handleCustomPagination={<TableCustomPaginationReactTable
          total_pages={MNRStaffAttendanceReducer.get_all_attendance_list.total_pages}
          pg_no={MNRStaffAttendanceReducer.get_all_attendance_list.pg_no}
          handleInitialPage={handleInitialPage}
          handleOnPageDataChange={handleOnPageDataChange}
          handlePaginationOnChange={handlePaginationOnChange}

          next_page={MNRStaffAttendanceReducer.get_all_attendance_list.next_page}
          on_page_data={MNRStaffAttendanceReducer.get_all_attendance_list.on_page_data_client}
        />}
      />
    </Grid>
  );
};

export default MNRStaffAttendence;
