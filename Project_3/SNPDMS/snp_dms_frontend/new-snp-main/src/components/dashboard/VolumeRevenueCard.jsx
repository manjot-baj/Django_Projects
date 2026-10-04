import React from "react";
import { Typography, Paper, Box } from "@mui/material";
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";

export default function VolumeRevenueCard(props) {
  const { title, seriesData, labels } = props;
  const {drawerOpen} = useSelector(state=>state.ui)

  const chartOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#7569EE", "#F7A844", "#E46666"],
    stroke: {
      width: 3,
      curve: "smooth",
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: labels,
      tickPlacement: "between",
      labels: {
        rotate: -45,
        style: {
          fontSize: "12px",
        },
      },
    },
    legend: {
      tooltipHoverFormatter: function (val, opts) {
        return (
          val +
          " - " +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex]
        );
      },
      markers: {
        width: 10,
        height: 10,
        radius: 5,
      },
      itemMargin: {
        horizontal: 12,
        vertical: 4,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val;
        },
      },
    },
    grid: {
      borderColor: "#f1f1f1",
      padding: {
        bottom: 10,
      },
    },
  };



  return (
    <Paper
      sx={(theme) => ({
        borderRadius: 4,
        padding: theme.spacing(2),
        height: 340,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      })}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#000",
          fontWeight: 600,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Box sx={{width:"100%"}}>
        <Chart
          options={chartOptions}
          series={seriesData}
          type="line"
          height={250}
          width={drawerOpen?"80%":"100%"}
        />
      </Box>
    </Paper>
  );
}
