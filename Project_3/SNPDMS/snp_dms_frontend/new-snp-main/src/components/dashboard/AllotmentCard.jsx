import React, { useEffect, useState } from "react";
import { Typography, Paper, Box } from "@mui/material";
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";

export default function AllotmentCard(props) {
  const { title } = props;
  const store = useSelector((state) => state);
  const { dashboard } = store;

  const [total, setTotal] = useState(0);
  const [count_20, setCount20] = useState(0);
  const [count_40, setCount40] = useState(0);
  const [count_other, setCountOther] = useState(0);
  const [percent20, setPercent20] = useState(0);
  const [percent40, setPercent40] = useState(0);
  const [percentOther, setPercentOther] = useState(0);

  useEffect(() => {
    if (dashboard.dashboardDetails) {
      const allotment = dashboard.dashboardDetails.inventory?.allotment || {};
      setTotal(allotment.count || 0);
      setCount20(allotment["20_total_count"] || 0);
      setCount40(allotment["40_total_count"] || 0);
      setCountOther(allotment["other_total_count"] || 0);
      setPercent20(allotment["20_total_percent"] || 0);
      setPercent40(allotment["40_total_percent"] || 0);
      setPercentOther(allotment["other_total_percent"] || 0);
    }
  }, [dashboard.dashboardDetails]);

  const chartOptions = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: false },
    },
    colors: ["#7569EE", "#F7A844", "#E46666"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "25%",
        endingShape: "rounded",
        distributed: true,
      },
    },
    yaxis: {
      title: { text: "Total Allotment" },
    },
    dataLabels: {
      enabled: false,
      style: {
        fontSize: "12px",
        colors: ["#7569EE", "#F7A844", "#E46666"],
      },
    },
    stroke: {
      show: true,
      width: 1,
    },
    xaxis: {
      categories: ["20", "40", "other"],
      labels: {
        style: {
          colors: ["#7569EE", "#F7A844", "#E46666"],
          fontSize: "12px",
        },
      },
    },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      itemMargin: {
        horizontal: 20,
        vertical: 6,
      },
      markers: {
        radius: 6,
        width: 10,
        height: 10,


         
        strokeWidth: 0,
        strokeColor: "#fff",
        fillColors: undefined,
        
        customHTML: undefined,
        onClick: undefined,
        offsetX: 0,
        offsetY: 0,
      },
    },
    grid: {
      padding: {
        bottom: 20, // ensure padding for legend
      },
    },
  };

  const chartData = [
    {
      data: [count_20, count_40, count_other],
    },
  ];

  return (
    <Paper
      sx={(theme) => ({
        borderRadius: 4,
        padding: theme.spacing(2),
        marginTop: 4,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        // height: "100%", // let parent control actual height
        height: 340, // ✅ Fix this value equally in both cards
      })}
    >
      <Typography
        variant="h6"
        sx={{
          color: "#000",
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
        <Chart
          options={chartOptions}
          series={chartData}
          type="bar"
          height={280} // adjusted to fit without overflow
        />
      </Box>
    </Paper>
  );
}
