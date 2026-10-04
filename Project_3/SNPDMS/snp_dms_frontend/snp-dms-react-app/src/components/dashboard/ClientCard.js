import React from "react";
import {
  makeStyles,
  Typography,
  Paper,
  Grid,
  Divider,
} from "@material-ui/core";
import Chart from "react-apexcharts";
import Fade from "react-reveal/Fade";

import ClientUpperSection from "./ClientUpperSection";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  PaperCardContainer: {
    borderRadius: 10,
    padding: theme.spacing(2),
    // width: "50%",
    marginTop: 10,
  },
  titleTypography: {
    color: "#000",
    fontWeight: 600,
  },
  labelCircle: {
    height: 12,
    width: 12,
    borderRadius: "50%",
  },
  graphGridItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
  },
  revenueDivider: {
    display: "flex",
    alignItems: "center",
    marginTop: 10,
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
      marginTop: 20,
    },
  },
}));

export default function ClientCard(props) {
  const classes = useStyles();
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
    // legend: {
    //   horizontalAlign: "center",
    //   markers: {
    // width: 12,
    // height: 12,
    //     strokeWidth: 0,
    //     strokeColor: "#fff",
    //     fillColors: undefined,
    //     radius: 10,
    //     customHTML: undefined,
    //     onClick: undefined,
    //     offsetX: 0,
    //     offsetY: 0,
    //   },
    //   itemMargin: {
    //     horizontal: 25,
    //     vertical: 0,
    //   },
    // },
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
    <Paper className={classes.PaperCardContainer}>
      <Typography variant="h6" className={classes.titleTypography}>
        {title}
      </Typography>

      <ClientUpperSection labels={labels} />

      <div className={classes.revenueDivider}>
        <Typography variant="h6">Revenue per client</Typography>
        <Divider
          variant="middle"
          style={{ width: "70%", margin: "0px 8px", height: 3 }}
        />
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={4} className={classes.graphGridItem}>
          <Fade bottom>
            <Chart
              options={barChartOptions}
              series={
                user.role === "Depot User"
                  ? barChartData
                  : dashboard.dashboardDetails
                  ? actualBarChartInwardData.map((numb) => numb)
                  : []
              }
              // series={
              //   dashboard.dashboardDetails
              //     ? actualBarChartInwardData.map((numb) => numb)
              //     : []
              // }
              type="bar"
              height={300}
            />
          </Fade>
          <Typography className={classes.headerText}>Handling In</Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4} className={classes.graphGridItem}>
          <Fade bottom>
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
          </Fade>
          <Typography className={classes.headerText}>Handling Out</Typography>
        </Grid>
        <Grid item xs={12} sm={6} lg={4} className={classes.graphGridItem}>
          <Fade bottom>
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
          </Fade>
          <Typography className={classes.headerText}>Transportation</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
