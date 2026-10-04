import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { theme } from "../../App";
import {
  downloadPreGateInRejectedData,
  downloadPreGateInSampleData,
  extractPreGateInData,
  importPreGateInData,
} from "../../actions/AdvanceFinance/AdvanceFinanceAction";
import { useDispatch, useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import Imported from "@mui/icons-material/CloudUpload";
import Rejected from "@mui/icons-material/GetApp";
import { handleDateChangeUTILS, handleDateCurrentUTILS } from "../../utils/WeekNumbre";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import Alert from '@mui/material/Alert';
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";


const AdvanceFinanceBulkUpload = () => {
  const history = useHistory();
  const formData = new FormData();
  const [file, setFile] = React.useState("");
  const [nextDate, setNextDate] = useState(handleDateCurrentUTILS());
  const { extractData } = useSelector((state) => state.AdvanceFinanceReducer);
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const { id } = useParams();

  useEffect(() => {
    if (id === null || id === undefined || id === "") {
      history.push("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleGoBack = () => {
    history.goBack();
  };

  const handleOnClick = () => {
    dispatch(downloadPreGateInSampleData(notify));
  };

  const handleApproved = () => {
    if (nextDate < handleDateCurrentUTILS()) {
      notify("Validity should be more than current date",{variant:"error"})
      return 
    }
    var importData = {
      importable_data: extractData.data.importable_data.map(item=>({do_validity_in_date:nextDate?.split("-")?.reverse()?.join("_"),do_validity_in_time:"23_59",...item})),
      location: localStorage.getItem("location")
        ? localStorage.getItem("location")
        : null,
      site: localStorage.getItem("site") ? localStorage.getItem("site") : null,
      adv_payment_id: id,
    };
  
    dispatch(importPreGateInData(importData, notify, history));
  };

  const handleRejected = () => {
    var rejectData = {
      rejected_data: extractData.data.rejected_data,
      faults: extractData.data.faults,
    };
    dispatch(downloadPreGateInRejectedData(rejectData, notify, history));
  };

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item size={{xs:12}}>
          <CustomBackButton handleGoBack={handleGoBack}
          />

          <div>
            <Typography
              variant="subtitle2"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                backgroundColor: "#243545",
                color: "#FFF",
                marginTop: 4,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Box fontWeight="fontWeightBold" m={1}>
                Download Pre Gate In Sample Data
              </Box>
            </Typography>
            <Paper sx={(theme)=>({
              padding: theme.spacing(4, 3),
            })} elevation={0}>
              <Grid container spacing={3}>
                <Grid
                  item
                  size={{xs:12,sm:6,lg:3}}
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Grid
                    style={{
                      marginLeft: "auto",
                      marginRight: "auto",
                      marginTop: 16,
                      marginBottom: 16,
                    }}
                  >
                    <Button sx={(theme)=>({
                       background: "lightgreen",
                       margin: 2,
                    })} onClick={handleOnClick}>
                      Download
                    </Button>
                  </Grid>
                </Grid>
                <Grid
                  item
                  size={{xs:12}}
                
                  style={theme.breakpoints.down("sm") && { padding: 7 }}
                >
                  <Typography>
                    Download a sample file and compare it to your import file to
                    ensure you have the file perfect for the import.
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </div>
          <div>
            <Typography
              variant="subtitle2"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                backgroundColor: "#243545",
                color: "#FFF",
                marginTop: 20,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Box fontWeight="fontWeightBold" m={1} onClick={()=>console.log(nextDate)}>
                Upload Pre Gate In Data - Payment ID ({id})
              </Box>
            </Typography>
            <Paper sx={(theme)=>({
              padding: theme.spacing(4, 3),
            })} elevation={0}>
              <Grid
                container
                size={{xs:12}}
                spacing={2}
                style={{ display: "flex", alignItems: "center" }}
              >
              { extractData.data?.importable_data &&
                          extractData.data?.importable_data.length !== 0 && <Grid item size={{xs:3,sm:3}}>
                  <Typography variant="subtitle2" style={{ fontWeight: "700" }}>
                    Select Validity Date 
                  </Typography>
                  <DatePickerField dateValue={nextDate}  dateChange={(date)=>handleDateChangeUTILS(date,setNextDate)}/>
                </Grid>}

                <Grid item size={{xs:3,sm:3}}>
                  {file ? <Typography>{file}</Typography> : ""}
                </Grid>

                <Grid item size={{xs:2,sm:2}}>
                  <Button
                    sx={{
                      fontSize: 12.5,
                      borderRadius: 6,
                      border: "1.5px solid #2A5FA5",
                      boxShadow: "0px 3px 6px #9199A14D",
                      backgroundColor: "#2A5FA5",
                      marginTop: "20px",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#2A5FA5",
                      },
                    }}
                    id="upload-pre-gate-in-data"
                    component="label"
                  >
                    Choose File
                    <input
                      type="file"
                      style={{ display: "none" }}
                      id="upload-pre-gate-in-data"
                      onChange={(e) => {
                        const do_file = e.target.files[0];
                        formData.append("file", do_file);
                        formData.append("adv_payment_id", id ? id : null);
                        setFile(do_file?.name);
                        dispatch(extractPreGateInData(formData, notify));
                      }}
                      name="sample_tool_upload"
                    />
                  </Button>
                </Grid>
              </Grid>
              <Grid
                item
                size={{xs:12}}
                style={theme.breakpoints.down("sm") && { padding: 7 }}
              >
                <Typography style={{ paddingTop: 30 }}>
                  Maximum File Size: <strong>5 MB</strong> | File Format:{" "}
                  <strong>CSV or TSV or XLS</strong>
                </Typography>
              </Grid>
              {extractData.length !== 0 && file && (
                <Grid container spacing={2}>
                  <Grid item size={{xs:10}}  style={{ padding: 12, paddingTop: 12 }}>
                    <Grid
                      style={{
                        display: "flex",
                        justifyContent: "space-around",
                      }}
                    >
                      <Grid
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography>
                          {extractData.data?.importable_data_count} Approved
                          Entries
                        </Typography>
                        {extractData.data?.importable_data &&
                          extractData.data?.importable_data.length !== 0 && (
                            <Button
                              variant="contained"
                              sx={(theme)=>({
                                background: "lightgreen",
                                margin: 10,
                             })}
                              startIcon={<Imported />}
                              onClick={handleApproved}
                              disabled={extractData.data?.remarks !== null}
                            >
                              Import Tool Data
                            </Button>
                          )}
                      </Grid>
                      <Grid
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography>
                          {extractData.data?.rejected_data_count} Rejected
                          Entries
                        </Typography>
                        {extractData.data?.rejected_data &&
                          extractData.data?.rejected_data.length !== 0 && (
                            <Button
                              variant="contained"
                              sx={{
                                background: "#FFCCCB",
                                margin: 10,
                              }}
                              startIcon={<Rejected />}
                              onClick={handleRejected}
                            >
                              Download Rejected Tool Data
                            </Button>
                          )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}
              {
               extractData.data?.remarks && <Alert severity="info" style={{marginTop:"12px"}}>
            {extractData.data?.remarks}
              </Alert>
              }
            </Paper>
          </div>
        </Grid>
      </Grid>
    </LayoutContainer>
  );
};

export default AdvanceFinanceBulkUpload;
