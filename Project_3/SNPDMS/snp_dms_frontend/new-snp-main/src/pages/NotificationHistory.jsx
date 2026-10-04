import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  styled,
  FormControlLabel,
  Radio,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { Stack } from "@mui/material";
import { useHistory } from "react-router-dom";
import { theme } from "../App";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { useDispatch, useSelector } from "react-redux";
import { webNotificationModule } from "../actions/WebSocketNotificationAction";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import { customLabelTypography } from "../utils/CustomClasses";



const StyledTableCell = styled(TableCell)(({ theme }) => ({
  // Styles for header cells
  '&.MuiTableCell-head': {
    fontWeight: 600,
    backgroundColor: '#243545',
    color: 'white',
    fontSize: '12px',
    textTransform: 'uppercase',
  },

  // Styles for all cells
  '&.MuiTableCell-root': {
    borderBottom: 'none',
    borderColor: 'transparent',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: 20,
  transition: 'box-shadow 0.2s ease-in-out',

  '&:hover': {
    boxShadow: '0px 3px 6px #9199A14D',
    // cursor: 'pointer', // uncomment if needed
  },
}));

const StyledTableDataCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: '#243545',
  fontSize: 12.5,
  borderBottom: 'none',
  padding: '10px',
  borderColor: 'transparent',
  textTransform: 'uppercase',
}));

const NotificationHistory = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [FromDate, setFromDate] = useState("");
  const [ToDate, setToDate] = useState("");
  const [NotificationType, setNotificationType] = useState("ALL");
  const [SeenType, setSeenType] = useState("ALL");

  const { WebSocketNotification } = useSelector((store) => store);

  const handleGoBack = () => {
    history.goBack();
  };

  const handleFromChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setFromDate(selectedDateFormat);
  };

  const handleToChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setToDate(selectedDateFormat);
  };

  const handleAdvanceSearch = () => {
    dispatch(
      webNotificationModule({
        from_date: FromDate,
        to_date: ToDate,
        seen: SeenType,
        notification_type: NotificationType,
      })
    );
  };

  useEffect(() => {
    dispatch(
      webNotificationModule({
        from_date: "",
        to_date: "",
        seen: "ALL",
        notification_type: "ALL",
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LayoutContainer footer={false}>
      <Stack
        flexDirection={"row"}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
        spacing={4}
      >
        <CustomBackButton handleGoBack={handleGoBack} />
        <Typography variant="h5" style={{ fontWeight: "bold" }}>
          Notification
        </Typography>
      </Stack>

      <Paper
        sx={(theme) => ({
          padding: theme.spacing(4, 3),
          marginTop: "40px",
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
          <Grid
            item
            size={{xs:12,sm:6,lg:3}}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              From Date
            </Typography>
            <DatePickerField
              dateId="invoice-from-date"
              dateValue={FromDate}
              dateChange={handleFromChange}
            />
          </Grid>
          <Grid
            item
           size={{xs:12,sm:6,lg:3}}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              To Date
            </Typography>

            <DatePickerField
              dateId="invoice-to-date"
              dateValue={ToDate}
              dateChange={handleToChange}
            />
          </Grid>
          <Grid
            item
            size={{xs:12,sm:6,lg:3}}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" sx={customLabelTypography}>
              Notification Type
            </Typography>

            <TextField
              select
              id="container-number"
              value={NotificationType}
              variant="outlined"
              fullWidth
              size="small"
              onChange={(e) => {
                setNotificationType(e.target.value);
              }}
            >
              {["ALL", "SUCCESS", "WARNING", "FAILURE", "OTHER"].map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                )
              )}
            </TextField>
          </Grid>
          <Grid
            item
           size={{xs:12,sm:6,lg:3}}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Button
              fullWidth
              sx={{
                fontSize: 12.5,
                borderRadius: 2,
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 4,
                width: "100%",
                border: "1.5px solid #FDBD2E",
                boxShadow: "0px 3px 6px #9199A14D",
                backgroundColor: "#FDBD2E",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#FDBD2E",
                },
              }}
              onClick={handleAdvanceSearch}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Stack
        flexDirection={"row"}
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
        marginTop={5}
        spacing={4}
      >
        <FormControlLabel
          value={"ALL"}
          control={
            <Radio
              style={{ color: "#2A5FA5" }}
              checked={SeenType === "ALL"}
              onClick={() => {
                dispatch(
                  webNotificationModule({
                    from_date: FromDate,
                    to_date: ToDate,
                    seen: "ALL",
                    notification_type: NotificationType,
                  })
                );
                setSeenType("ALL");
              }}
            />
          }
          label="All"
        />
        <FormControlLabel
          value={true}
          control={
            <Radio
              style={{ color: "#2A5FA5" }}
              checked={SeenType === true}
              onClick={() => {
                dispatch(
                  webNotificationModule({
                    from_date: FromDate,
                    to_date: ToDate,
                    seen: true,
                    notification_type: NotificationType,
                  })
                );
                setSeenType(true);
              }}
            />
          }
          label="Seen"
        />
        <FormControlLabel
          value={false}
          control={
            <Radio
              style={{ color: "#2A5FA5" }}
              checked={SeenType === false}
              onClick={() => {
                dispatch(
                  webNotificationModule({
                    from_date: FromDate,
                    to_date: ToDate,
                    seen: false,
                    notification_type: NotificationType,
                  })
                );
                setSeenType(false);
              }}
            />
          }
          label="Unseen"
        />
      </Stack>

      {WebSocketNotification?.history?.length > 0 ? (
        <TableContainer component={Paper}>
          <Table
            sx={{
              minWidth: 650,
              borderCollapse: "separate",
              borderSpacing: "0px 10px",
              borderColor: "transparent",
              backgroundColor: "#EAF0F5",
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <StyledTableCell>No</StyledTableCell>
                <StyledTableCell align="left">Notification</StyledTableCell>
                <StyledTableCell align="left">Date</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {WebSocketNotification.history?.map((row) => (
                <StyledTableRow key={row.pk}>
                  <StyledTableDataCell component="th" scope="row" align="left">
                    {row.pk}
                  </StyledTableDataCell>
                  <StyledTableDataCell component="th" scope="row" align="left">
                    {row.text}
                  </StyledTableDataCell>

                  <StyledTableDataCell component="th" scope="row" align="left">
                    {row.created_at.slice(0, 16).replace("T", " ")}
                  </StyledTableDataCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="h6" align="center">
          Notification Data Not Found
        </Typography>
      )}
    </LayoutContainer>
  );
};

export default NotificationHistory;
