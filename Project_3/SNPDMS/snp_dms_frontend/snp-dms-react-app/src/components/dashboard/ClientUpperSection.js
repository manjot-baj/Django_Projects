import React from "react";
import Roll from "react-reveal/Roll";

import {
  makeStyles,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
} from "@material-ui/core";

import { useSelector } from "react-redux";

import Chart from "react-apexcharts";

const useStyles = makeStyles((theme) => ({
  PaperCardContainer: {
    borderRadius: 10,
    padding: theme.spacing(2),
    // width: "50%",
    marginTop: 10,
  },
  // chart:{
  //   [theme.breakpoints.up('md')]: {
  //     backgroundColor: 'red',
  //   },
  // },
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
    [theme.breakpoints.down("xs")]: {
      // textAlign: 'center',
      textAlign: "left",
    },
  },
  headerWithLegend: {
    width: "55%",
    textAlign: "center",
    fontWeight: "bold",
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      // textAlign: 'left',
    },
  },
}));

const ClientUpperSection = (props) => {
  const classes = useStyles();
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
      <Grid item xs={12} sm={6} lg={3} className={classes.graphGridItem}>
        <Typography className={classes.headerText}>Total Revenue</Typography>
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
            className={classes.chart}
            width={"90%"}
            height={"100%"}
            style={{marginRight:"100px"}}
          />
        </Roll>
      </Grid>
      <Grid item xs={12} sm={6} lg={3} className={classes.graphGridItem}>
        <Typography className={classes.headerText}>Containers In</Typography>
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
        <Typography className={classes.headerWithLegend}>
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
