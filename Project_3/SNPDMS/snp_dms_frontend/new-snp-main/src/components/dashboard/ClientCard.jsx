import React from "react";
import {  Typography, Paper, Grid, Divider, Box } from "@mui/material";
import Chart from "react-apexcharts";
import Fade from "react-reveal/Fade";

import ClientUpperSection from "./ClientUpperSection";
import { useSelector } from "react-redux";

const graphGridItemStyle = (theme) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});



export default function ClientCard(props) {
  
  const { title, labels } = props;
  const store = useSelector((state) => state);
  const { dashboard } = store;
  const { user } = store;

  // BAR GRAPH
  var barChartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    // defines the colors of each individual bar
    colors: ["#7569EE", "#F7A844", "#E46666", "#26C76E", "#243545"],

    plotOptions: {
      bar: {
        horizontal: false,

        columnWidth: "25%",
        endingShape: "rounded",
        distributed: true,
      },
    },
    // yaxis: {
    //   title: {
    //     text: "Revenue per client in lacs",
    //   },
    // },

    dataLabels: {
      enabled: false,
      // offsetX: -6,
      style: {
        fontSize: "12px",
        colors: ["#7569EE", "#F7A844", "#E46666", "#26C76E", "#243545"],
      },
    },
    stroke: {
      show: true,
      width: 1,
    },
    xaxis: {
      categories: labels,
      labels: {
        style: {
          colors: ["#7569EE", "#F7A844", "#E46666", "#26C76E", "#243545"],
          fontSize: "12px",
        },
      },
      // title: {
      //   text: "Handling In",
      //   style: {
      //     fontSize: "16px",
      //   },
      // },
    },
    tooltip: {
      y: [
        {
          title: {
            formatter: function (val) {
              return val;
            },
          },
        },
        {
          title: {
            formatter: function (val) {
              return val;
            },
          },
        },
        {
          title: {
            formatter: function (val) {
              return val;
            },
          },
        },
      ],
    },
    legend: {
      show: false,
    },
  };

  const barChartData = [
    {
      data: [21, 32, 18, 54, 67],
    },
  ];

  let actualBarChartInwardData = [
    {
      data: dashboard.dashboardDetails.inward_handling_top_client_revenue_data
        .total_revenue,
    },
  ];

  let actualBarChartOutwardData = [
    {
      data: dashboard.dashboardDetails.outward_handling_top_client_revenue_data
        .total_revenue,
    },
  ];

  let actualBarChartTransportationData = [
    {
      data: dashboard.dashboardDetails.transportation_top_client_revenue_data
        .total_revenue,
    },
  ];

  return (
    // <Paper
    //   sx={(theme) => ({
    //     borderRadius: 4,
    //     padding: theme.spacing(2),
    //     // width: "50%",
    //     marginTop: 1,
    //   })}
    // >

      <Paper
        sx={(theme) => ({
          borderRadius: 4,
          // padding: theme.spacing(2, 2, 1.5, 2),
          padding: theme.spacing(2),
          marginTop: 4,
        })}
      >

      <Typography
        variant="h6"
        sx={{
          color: "#000",
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>

      <ClientUpperSection labels={labels} />

      <Box sx={(theme)=>({
         display: "flex",
         alignItems: "center",
         marginTop: 1,
         [theme.breakpoints.down("sm")]: {
           flexDirection: "column",
           alignItems: "flex-start",
           marginTop: 2,
         },
      })}>
        <Typography variant="h6">Revenue per client</Typography>
        <Divider
          variant="middle"
          style={{ width: "70%", margin: "0px 8px", height: 3 }}
        />
      </Box>
      <Grid container spacing={2}>
        <Grid item size={{ xs: 12, sm: 6, lg: 4 }} sx={graphGridItemStyle}>
         
            <Chart
              options={barChartOptions}
              series={
                user.role === "Depot User"
                  ? barChartData
                  : dashboard.dashboardDetails
                  ? actualBarChartInwardData.map((numb) => numb)
                  : []
              }
             
              type="bar"
              height={300}
            />
         
          <Typography
            sx={{
              fontWeight: "bold",
            }}
          >
            Handling In
          </Typography>
        </Grid>
        <Grid item size={{ xs: 12, sm: 6, lg: 4 }} sx={graphGridItemStyle}>
        
            <Chart
              options={barChartOptions}
              // series={barChartData}
              series={
                dashboard.dashboardDetails
                  ? actualBarChartOutwardData.map((numb) => numb)
                  : []
              }
              type="bar"
              height={300}
              // width={280}
            />
      
          <Typography  sx={{
              fontWeight: "bold",
            }}>Handling Out</Typography>
        </Grid>
        <Grid item size={{ xs: 12, sm: 6, lg: 4 }} sx={graphGridItemStyle}>
       
            <Chart
              options={barChartOptions}
              // series={barChartData}
              series={
                dashboard.dashboardDetails
                  ? actualBarChartTransportationData.map((numb) => numb)
                  : []
              }
              type="bar"
              height={300}
              // width={280}
            />
        
          <Typography  sx={{
              fontWeight: "bold",
            }}>Transportation</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
