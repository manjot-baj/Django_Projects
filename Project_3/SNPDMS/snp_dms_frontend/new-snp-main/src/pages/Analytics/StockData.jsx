import React, { useEffect, useState } from "react";
import {jwtDecode} from "jwt-decode";
import {

  Typography,
  Box,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
  TextField,
  MenuItem,
  Tooltip,
  Button,
} from "@mui/material";
import { useHistory } from "react-router-dom";

import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
// movement
import MovementCard from "../../components/analytics/StockMovementCard";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/analytics/Loader";
import { useSnackbar } from "notistack";
import { dropDownDispatch } from "../../actions/GateInActions";

import { getStockDataListings } from "../../actions/AnalyticsActions";
import RenderOnViewportEntry from "../../utils/RenderOnViewPort";
import { cacheCleanService } from "../../utils/WeekNumbre";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { Stack } from "@mui/material";
import { customLabelTypography } from "../../utils/CustomClasses";

const CardContainer = React.lazy(() =>
  import("../../components/analytics/StockCardContainer")
);

const drawerWidth = 220;

function loaded(obj) {
  for (let i in obj) {
    if (obj[i] == null) {
      return false;
    }
  }
  return true;
}


const StockData = () => {

  const dispatch = useDispatch();
  const store = useSelector((state) => state);

  const { analytics, gateIn } = store;
  const history = useHistory();
  const notify = useSnackbar().enqueueSnackbar;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  const [cacheLoader, setCacheLoader] = useState(false);
  const [refCode, setRefCode] = useState("");

  // Check if the token is expired if yes then push to login
  useEffect(() => {
    var token = localStorage.getItem("accessToken");
    if (token) {
      var decode = jwtDecode(token);
      if (decode.exp < new Date().getTime() / 1000) {
        history.push("/login");
      } else {
        let reqArray = ["client_ref_codes"];
        dispatch(dropDownDispatch(reqArray, notify));
      }
    } else {
      history.push("/login");
    }
  }, []);

  useEffect(() => {
    dispatch(getStockDataListings(refCode));
  }, [refCode]);

  const handleCleanCache = () => {
    cacheCleanService(setCacheLoader, notify, dispatch);
  };

  return !(
    analytics.allStockDataListings && loaded(analytics.allStockDataListings)
  ) ? (
    <Loader />
  ) : (
    <LayoutContainer footer={false}>
      <Box   sx={(theme) => ({
          marginLeft: 3,
          marginRight: 3,
          [theme.breakpoints.down("sm")]: {
            marginLeft: 0,
            marginRight: 0,
          },
        })}>
        <Grid
          container
          spacing={2}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Grid item size={{xs:12,lg:7}}>
            <Typography variant="h5">Stock Data</Typography>
          </Grid>
          {gateIn.allDropDown && gateIn.allDropDown.client_ref_codes && (
            <Grid
              item
              size={{xs:12,sm:4}}
             
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                justifyContent: "flex-end",
               
              }}
            >
            
              <Stack direction={"column"} width={"150px"}>
                <Typography
                  variant="subtitle1"
                  sx={customLabelTypography}
                >
                  Ref Code
                </Typography>
                <TextField
                  id="stocks-allot-ref-code"
                  select
                  value={refCode}
                  variant="outlined"
                  fullWidth
                  size="small"
                  
                  sx={{
                     
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "#243545",
                      },
                    },
                    "& .MuiPaper-rounded": {
                      "& ul": {
                        position: "relative",
                        top: "300px",
                      },
                    },
                  }}
                  onChange={(e) => {
                    setRefCode(e.target.value);
                  }}
                >
                  {gateIn.allDropDown &&
                    gateIn.allDropDown.client_ref_codes.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                </TextField>
              </Stack>
             { analytics.allStockDataListings?.cache && <Tooltip
                title={
                  analytics.allStockDataListings?.cache
                    ? "Clean Analytics  Data "
                    : "Cleaned Analytics Data"
                }
                placement="bottom"
              >
                <Button
                  disabled={!analytics.allStockDataListings?.cache}
                  onClick={handleCleanCache}
                  style={{
                    border: analytics.allStockDataListings?.cache
                      ? "1px solid #243647"
                      : "none",
                      marginLeft:"20px"
                  }}
                >
                  <CleaningServicesIcon
                    style={{ fill: "#243647" }}
                    fontSize="small"
                  />
                  <Typography
                    variant="subtitle2"
                    style={{
                      color: "#243647",
                      fontWeight: "bold",
                      marginRight: "8px",
                    }}
                  >
                    {analytics.allStockDataListings?.cache
                      ? " Clean Cache"
                      : "Cleaned"}{" "}
                  </Typography>
                </Button>
              </Tooltip>}
            </Grid>
          )}
        </Grid>

        {/* Total Stock */}
        <RenderOnViewportEntry
          threshold={0.25}
          style={{ height: "fit-content", minHeight: "240px" }}
        >
          <CardContainer title={"Total Data"} process={"stock"} cache={analytics.allStockDataListings?.cache}>
            {analytics.allStockDataListings &&
            analytics.allStockDataListings.stock_data != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{xs:12,md:12,lg:4}} >
                  <MovementCard
                    title={"Total Data"}
                    data={analytics.allStockDataListings.stock_data.total_data}
                  />
                </Grid>

                <Grid item size={{xs:12,md:12,lg:4}}>
                  <MovementCard
                    title={"20 Total Data"}
                    data={
                      analytics.allStockDataListings.stock_data["20_total_data"]
                    }
                  />
                </Grid>

                <Grid item size={{xs:12,md:12,lg:4}}>
                  <MovementCard
                    title={"40 Total Data"}
                    data={
                      analytics.allStockDataListings.stock_data["40_total_data"]
                    }
                  />
                </Grid>
              </Grid>
            ) : (
              
              <Box
                            sx={{
                              minHeight: 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f9f9f9',  
                              borderRadius: 2,             
                            }}
                            >
                            <CircularProgress color="inherit" size={32} />
                            </Box>
            )}
          </CardContainer>
        </RenderOnViewportEntry>

        {/* Weekly Stock */}
        <RenderOnViewportEntry threshold={0.25} style={{ minHeight: "240px" }}>
          <CardContainer title={"On Date"} process={"stock"} cache={analytics.allStockDataListings?.cache}>
            {analytics.allStockDataListings &&
            analytics.allStockDataListings.stock_data != null ? (
              <Grid container spacing={matches ? 0 : 2}>
                <Grid item size={{xs:12,md:12,lg:12}} >
                  <MovementCard
                    title={"Stock"}
                    data={
                      analytics.allStockDataListings.stock_data.type_wise_data
                    }
                  />
                </Grid>

                <Grid item size={{xs:12,sm:6}} >
                  <MovementCard
                    title={"20 Stock"}
                    data={
                      analytics.allStockDataListings.stock_data[
                        "20_type_wise_data"
                      ]
                    }
                  />
                </Grid>

                <Grid item size={{xs:12,sm:6}}>
                  <MovementCard
                    title={"40 Stock"}
                    data={
                      analytics.allStockDataListings.stock_data[
                        "40_type_wise_data"
                      ]
                    }
                  />
                </Grid>
              </Grid>
            ) : (
              
              <Box
                            sx={{
                              minHeight: 400,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#f9f9f9',  
                              borderRadius: 2,              
                            }}
                            >
                            <CircularProgress color="inherit" size={32} />
                            </Box>
            )}
          </CardContainer>
        </RenderOnViewportEntry>
      </Box>
    </LayoutContainer>
  );
};

export default StockData;
