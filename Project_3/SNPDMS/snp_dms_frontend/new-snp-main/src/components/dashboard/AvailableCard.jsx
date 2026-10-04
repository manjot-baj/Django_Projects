import React, { useEffect, useState } from "react";
import {

  Typography,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";



const AvailableCard = (props) => {

  const { title } = props;
  const store = useSelector((state) => state);
  const { dashboard, ui } = store;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
// eslint-disable-next-line no-unused-vars
  const [total, setTotal] = useState(0);
  const [count_20, setCount20] = useState(0);
  const [count_40, setCount40] = useState(0);
  const [count_other, setCountOther] = useState(0);
  const [percent20, setPercent20] = useState(0);
  const [percent40, setPercent40] = useState(0);
  const [percentOther, setPercentOther] = useState(0);

  useEffect(() => {
    if (dashboard.dashboardDetails) {
      setTotal(dashboard.dashboardDetails.inventory?.available?.count);
      setCount20(
        dashboard.dashboardDetails.inventory?.available["20_total_count"]
      );
      setCount40(
        dashboard.dashboardDetails.inventory?.available["40_total_count"]
      );
      setCountOther(
        dashboard.dashboardDetails.inventory?.available["other_total_count"]
      );
      setPercent20(
        dashboard.dashboardDetails.inventory?.available["20_total_percent"]
      );
      setPercent40(
        dashboard.dashboardDetails.inventory?.available["40_total_percent"]
      );
      setPercentOther(
        dashboard.dashboardDetails.inventory?.available["other_total_percent"]
      );
    }
  }, [dashboard.dashboardDetails]);
  const chartOptions = {
    labels: ["20", "40", "other"],
    colors: ["#7569EE", "#F7A844", "#E46666"],

    plotOptions: {
      radialBar: {
        //   position:"left",
        offsetX: -20,
        track: {
          show: true,
          startAngle: undefined,
          endAngle: undefined,
          background: "#f2f2f2",
          strokeWidth: "100%",
          opacity: 1,
          margin: 5,

          dropShadow: {
            enabled: false,
            top: 0,
            left: 0,
            blur: 3,
            opacity: 0.5,
          },
        },
        dataLabels: {
          show: true,
          name: {
            show: true,
            fontSize: "32px",
          },
          value: {
            fontSize: "18px",
            fontWeight: 600,
            offsetY: 10,
            formatter: function (val) {
              return val;
            },
          },
          total: {
            show: true,
            label: "Total",
            formatter: function (w) {
              var totalCount = 0;
              for (var i of w.config.series) {
                totalCount = totalCount + parseInt(i); // parseInt because the elements are string so we have to convert into int
              }
              // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
              return totalCount;
            },
          },
        },
      },
    },
    // legend: {
    //     show: true,}
  };

  const chartData = [count_20, count_40, count_other];

  const labels = [
    { name: "20", color: "#7569EE", percent: percent20 },
    { name: "40", color: "#F7A844", percent: percent40 },
    { name: "other", color: "#E46666", percent: percentOther },
  ];

  return (
    <Paper sx={(theme)=>({
      borderRadius: 4,
      padding: theme.spacing(2),
      marginTop: 4,
      flexGrow: 1,
      height: 345,
      overflow: "hidden",     // Add this
      minWidth: 0,            // Prevents overflow issues
    })}>
      <Typography variant="h6" sx={{
          color: "#000",
          fontWeight: 600,
      }}>
        {title}
      </Typography>
      <Grid container spacing={matches ? 2 : 10}>
        <Grid item xs={ui.open ? 5 : 12} lg={5}>
          <Chart
            options={chartOptions}
            series={chartData}
            type="radialBar"
            height={300}
            width={280}
          />
        </Grid>
        <Grid
          item
          xs={ui.open ? 3 : 12}
          lg={7}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: "90%" }}>
            {labels.map((label, index) => {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ backgroundColor: label.color    , height: 12,
                        width: 12,
                        borderRadius: "50%",}}
                  
                    />
                    <Typography style={{ marginLeft: 12 }}>
                      {label.name}
                    </Typography>
                  </div>

                  <Typography style={{ fontWeight: "bold" }}>
                    {label.percent &&
                      `${parseFloat(label.percent).toFixed(2)}%`}
                  </Typography>
                </div>
              );
            })}
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AvailableCard;
