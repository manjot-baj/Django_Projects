import React, { useEffect, useState } from "react";
import { makeStyles, Typography, Paper } from "@material-ui/core";
import Chart from "react-apexcharts";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  PaperCardContainer: {
    borderRadius: 10,
    padding: theme.spacing(2),
    // width: "50%",
    marginTop: 10,
    flexGrow: 1,
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

export default function AllotmentCard(props) {
  const classes = useStyles();
  const { title } = props;
  const store = useSelector((state) => state);
  const { dashboard } = store;
// eslint-disable-next-line no-unused-vars
  const [total, setTotal] = useState(0);
  const [count_20, setCount20] = useState(0);
  const [count_40, setCount40] = useState(0);
  const [count_other, setCountOther] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [percent20, setPercent20] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [percent40, setPercent40] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [percentOther, setPercentOther] = useState(0);
  useEffect(() => {
    if (dashboard.dashboardDetails) {
      setTotal(dashboard.dashboardDetails.inventory.allotment.count);
      setCount20(
        dashboard.dashboardDetails.inventory.allotment["20_total_count"]
      );
      setCount40(
        dashboard.dashboardDetails.inventory.allotment["40_total_count"]
      );
      setCountOther(
        dashboard.dashboardDetails.inventory.allotment["other_total_count"]
      );
      setPercent20(
        dashboard.dashboardDetails.inventory.allotment["20_total_percent"]
      );
      setPercent40(
        dashboard.dashboardDetails.inventory.allotment["40_total_percent"]
      );
      setPercentOther(
        dashboard.dashboardDetails.inventory.allotment["other_total_percent"]
      );
    }
  }, [dashboard.dashboardDetails]);

  var chartOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    // defines the colors of each individual bar
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
      title: {
        text: "Total  Allotment",
      },
    },
    dataLabels: {
      enabled: false,
      offsetX: -6,
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
      horizontalAlign: "center",
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        strokeColor: "#fff",
        fillColors: undefined,
        radius: 10,
        customHTML: undefined,
        onClick: undefined,
        offsetX: 0,
        offsetY: 0,
      },
      itemMargin: {
        horizontal: 25,
        vertical: 0,
      },
    },
  };

  const chartData = [
    {
      data: [count_20, count_40, count_other],
    },
  ];

  return (
    <Paper className={classes.PaperCardContainer}>
      <Typography variant="h6" className={classes.titleTypography}>
        {title}
      </Typography>
      {/* <Grid container spacing={2} > */}
      {/* <Grid item xs={6}> */}
      <Chart
        options={chartOptions}
        series={chartData}
        type="bar"
        height={265}
        // width={280}
      />
      {/* </Grid> */}
      {/* <Grid item xs={6} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}> 
         
              <div style={{width:"90%"}}>
                 {labels.map((label,index)=>{
                     return(
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:12}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{backgroundColor:label.color}} className={classes.labelCircle}/>
                                <Typography style={{marginLeft:12,}}>{label.name}</Typography>
                                </div>
                        
                        <Typography style={{fontWeight:"bold"}}>83%</Typography>
                    </div>
                     )
                 })}
                 
             </div>
          </Grid> */}
      {/* </Grid> */}
    </Paper>
  );
}
