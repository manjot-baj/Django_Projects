import React from "react";
import { makeStyles, Typography, Paper } from "@material-ui/core";
import Chart from "react-apexcharts";

const useStyles = makeStyles((theme) => ({
  PaperCardContainer: {
    borderRadius: 10,
    padding: theme.spacing(2),
    // width: "50%",
    // marginTop: 10,
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
}));

export default function VolumeRevenueCard(props) {
  const classes = useStyles();
  const { title } = props;
  const chartOptions = {
    chart: {
      width: "100%",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
        autoScaleYaxis: false,
      },
    },
    colors: ["#7569EE", "#F7A844", "#E46666"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [5, 5, 5],
      curve: "smooth",
      //   dashArray: [0, 8, 5],
    },
    // title: {
    //   text: "Page Statistics",
    //   align: "left",
    // },
    legend: {
      tooltipHoverFormatter: function (val, opts) {
        return (
          val +
          " - " +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
          ""
        );
      },
      markers: {
        width: 22,
        height: 8,
      },
    },
    markers: {
      size: 0,

      hover: {
        sizeOffset: 6,
      },
    },
    xaxis: {
      //
      categories: props.labels,
      tickPlacement: "between",
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
    grid: {
      borderColor: "#f1f1f1",
    },
  };

  // const chartSeries =
  // dashboard.dashboardDetails
  //   ? dashboard.dashboardDetails.volume_revenue_data.volume
  //   : [];
  // [
  //   {
  //     name: "20",
  //     data: dashboard.dashboardDetails
  //       ? dashboard.dashboardDetails.volume_revenue_data.volume["1"].data
  //       : [],
  //   },
  //   {
  //     name: "40",
  //     data: dashboard.dashboardDetails
  //       ? dashboard.dashboardDetails.volume_revenue_data.volume["2"].data
  //       : [],
  //   },
  //   {
  //     name: "Other",
  //     data: dashboard.dashboardDetails
  //       ? dashboard.dashboardDetails.volume_revenue_data.volume["3"].data
  //       : [],
  //   },
  // ];

  return (
    <Paper className={classes.PaperCardContainer}>
      <Typography variant="h6" className={classes.titleTypography}>
        {title}
      </Typography>
      <Chart
        options={chartOptions}
        series={props.seriesData}
        type="line"
        // width={"100%"}
        // height={350}
      />
    </Paper>
  );
}
