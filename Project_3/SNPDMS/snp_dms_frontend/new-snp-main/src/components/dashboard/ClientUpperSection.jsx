import React from "react";
import Roll from "react-reveal/Roll";

import {

  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { useSelector } from "react-redux";

import Chart from "react-apexcharts";



const ClientUpperSection = (props) => {

  const { labels } = props;
  const store = useSelector((state) => state);
  const { dashboard } = store;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));

  const ChartOptions = {
    labels: labels,
    colors: ["#7569EE", "#F7A844", "#E46666", "#26C76E", "#243545"],
    dataLabels: {
      enabled: true, // true will display the valu in percent inside each pie
    },
    plotOptions: {
      pie: {
        customScale: 1,
        donut: {
          size: "45%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              fontSize: "16px",
              fontFamily: "Poppins, sans-serif",
            },
          },
        },
      },
    },
    legend: {
      show: matches ? true : false,
    },
  };
  // const ChartOptionsWithLegend = {
  //   labels: labels,
  //   colors: ["#7569EE", "#F7A844", "#E46666", "#26C76E", "#243545"],
  //   dataLabels: {
  //     enabled: true, // true will display the valu in percent inside each pie
  //   },

  //   plotOptions: {
  //     pie: {
  //       customScale: 1,
  //       donut: {
  //         size: "45%",
  //         labels: {
  //           show: true,
  //           total: {
  //             show: true,
  //             showAlways: true,
  //             fontSize: "16px",
  //             fontFamily: "Poppins, sans-serif",
  //           },
  //         },
  //       },
  //     },
  //   },
  //   legend: {
  //     show: true,
  //     position: "right",
  //   },
  // };

  // const totalRevenueData = [234, 216, 108, 89, 156];

  return (
    <Grid container spacing={2}>
      <Grid item size={{xs:12,sm:6,lg:3}}  sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
      }}>
        <Typography sx={(theme)=>({
            fontWeight: "bold",
            [theme.breakpoints.down("xs")]: {
              // textAlign: 'center',
              textAlign: "left",
            },
        })}>Total Revenue</Typography>
        <Roll left>
          <Chart
            options={ChartOptions}
            series={
              dashboard.dashboardDetails
                ? dashboard.dashboardDetails.top_client_revenue_data.total_revenue.map(
                    (numb) => parseInt(numb)
                  )
                : []
            }
            type="donut"
       
            width={"90%"}
            height={"100%"}
            style={{marginRight:"100px"}}
          />
        </Roll>
      </Grid>
      <Grid item size={{xs:12,sm:6,lg:3}}  sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
      }}>
        <Typography sx={(theme)=>({
            fontWeight: "bold",
            [theme.breakpoints.down("xs")]: {
              // textAlign: 'center',
              textAlign: "left",
            },
        })}>Containers In</Typography>
        <Roll left>
          <Chart
            options={ChartOptions}
            // series={totalRevenueData}
            series={
              dashboard.dashboardDetails
                ? dashboard.dashboardDetails.inward_top_client_revenue_data.total_revenue.map(
                    (numb) => parseInt(numb)
                  )
                : []
            }
            type="donut"
            width={"90%"}
            height={"100%"}
            style={{marginRight:"100px"}}
          />
        </Roll>
      </Grid>
      <Grid
        item
        xs={12}
        sm={6}
        lg={6}
        style={{
          display: "flex",
          flexDirection: "column",
          // alignItems: "center",
        }}
      >
        <Typography sx={(theme)=>({
             width: "55%",
             textAlign: "center",
             fontWeight: "bold",
             [theme.breakpoints.down("xs")]: {
               width: "100%",
               // textAlign: 'left',
             },
        })}>
          Containers Out
        </Typography>
        <Roll right>
          <Chart
            // options={ pieChartOptionsWithLegend}
            // options={ChartOptionsWithLegend}
            options={ChartOptions}
            // series={totalRevenueData}
            series={
              dashboard.dashboardDetails
                ? dashboard.dashboardDetails.outward_top_client_revenue_data.total_revenue.map(
                    (numb) => parseInt(numb)
                  )
                : []
            }
            type="donut"
            // width={matches ? 360 : 410}
            width={"90%"}
            height={"100%"}
            style={{marginRight:"100px"}}
          />
        </Roll>
      </Grid>
    </Grid>
  );
};

export default ClientUpperSection;
