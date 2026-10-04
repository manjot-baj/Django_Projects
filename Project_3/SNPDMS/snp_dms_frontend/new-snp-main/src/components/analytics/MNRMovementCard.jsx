import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {

  Typography,
  Paper,
  useMediaQuery,
  Grid,
  Box,
} from "@mui/material";
import { theme } from "../../App";
import { Image } from "semantic-ui-react";
import NoPieDataImage from '../../assets/images/pie_no_data.svg'

const colorsChart = [
  "#a53253",
  "#4e44b3",
  "#9a6fb0",
  "#e0ac2b",
  "#e85252",
  "#6689c6",

  "#69b3a2",
  "#23a74e",
  "#1b6162",
  "#f6eb38",
  "#fa5201",
  "#371f04",
  "#000000",
];



const setBg = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + randomColor;
};

export default function MNRMovementCard(props) {

  const { title, data, fromDate, toDate, value } = props;
  const matchesIpad = useMediaQuery(theme.breakpoints.down("md"));

  const mappedData =
    title === "Top Client Volume" || title === "Top Client Revenue"
      ? data && Object.keys(data).map((key) => [key, data[key]])
      : title === "Weekly Volume"
      ? data.volume_data
      : title === "Weekly Revenue"
      ? data.revenue_data
      : data;

  const from_date =
    title === "Weekly Volume" || title === "Weekly Revenue"
      ? data.from_date
      : fromDate;
  const to_date =
    title === "Weekly Volume" || title === "Weekly Revenue"
      ? data.to_date
      : toDate;

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <Paper sx={{
      borderRadius: 2,
      padding: theme.spacing(2),
      marginTop: 4,
      [theme.breakpoints.down("sm")]: {
        overflowX: "scroll",
        borderRadius: 5,
        padding: theme.spacing(1),
        "&::-webkit-scrollbar": {
          width: 8,
          height: 5,
        },
      },
    }}>
      <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
      }}>
        <div
          style={{
            display: "flex",
            flexDirection: props.displayTitle === false ? "row" : "column",
            alignItems: props.displayTitle === false ? "center" : "flex-start",
            justifyContent: "space-between",
            width: props.displayTitle === false ? "100%" : "40%",
          }}
        >
          <Typography style={{ color: "#9199A1" }}>{title} </Typography>
          {props.displayTitle === false && (
            <Typography>{data?.count}</Typography>
          )}
        </div>
        {title !== "Total Data" &&
          title !== "20 Total Data" &&
          title !== "40 Total Data" &&
          title !== "Stock" &&
          title !== "20 Stock" &&
          title !== "40 Stock" && (
            <div
              style={{
                display: props.displayTitle === false ? "none" : "flex",
                flexDirection: "column",
              }}
            >
              <Typography style={{ color: "#9199A1" }}>
                ({from_date} - {to_date})
              </Typography>
            </div>
          )}
      </Box>

      {title === "Overall" ? (
        <ResponsiveContainer width={"100%"} height={350}>
          <BarChart
            data={mappedData}
            margin={{
              top: 5,
              right: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: 7 }} />
            <YAxis yAxisId="left" orientation="left" stroke="#7569EE" />
            <YAxis yAxisId="right" orientation="right" stroke="#F7A844" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="volume"
              barSize={20}
              fill="#7569EE"
              name="volume"
            />
            <Bar
              yAxisId="right"
              dataKey="revenue_damage"
              name="revenue_damage(₹)"
              barSize={20}
              fill="#F7A844"
              stackId="a"
            />
            <Bar
              yAxisId="right"
              dataKey="revenue_cleaning"
              name="revenue_cleaning(₹)"
              barSize={20}
              fill="#82ca9d"
              stackId="a"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : title === "Material Overall" ? (
        <ResponsiveContainer width={"100%"} height={350}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="size" style={{ fontSize: 7 }} />
            <YAxis stroke="#7569EE" />
            <Tooltip />
            <Legend />
            {value === "Area" ? (
              <>
                <Bar
                  dataKey="area_of_plywood_used"
                  stackId="a"
                  fill="#7569EE"
                />
                <Bar
                  dataKey="area_of_waste_plywood"
                  stackId="a"
                  fill="#82ca9d"
                />
              </>
            ) : (
              <>
                <Bar dataKey="no_of_plywood_used" stackId="a" fill="#7569EE" />
                <Bar dataKey="no_of_waste_plywood" stackId="a" fill="#82ca9d" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      ) : title === "Stock" || title === "20 Stock" || title === "40 Stock" ? (
        <ResponsiveContainer width={"100%"} height={350}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: 8 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            {data.map((option, key) => {
              return (
                Object.keys(option)[key + 1] !== undefined && (
                  <Line
                    type="monotone"
                    dataKey={Object.keys(option)[key + 1]}
                    stroke={setBg()}
                  />
                )
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      ) : title === "Top Client Volume" || title === "Top Client Revenue" ? (
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
      }}>
          {mappedData?.map((option) => {
            return (
              <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                marginLeft:"-40px"
              }}>
                {option[1]?.length === 0 ? (
                  <Box sx={{
                    width: "450px",
                  }}>
                    <Image
                      src={NoPieDataImage}
                      style={{
                        width:"100%",
                        height: "280px",
                        objectFit: "contain",
                      }}
                      // onClick={handleGoBack}
                    />
                  </Box>
                ) : (
                  <PieChart
                    width={option[1]?.length === 0 ? 200 : 450}
                    height={220}
                    style={{ zIndex: 50 }}
                  >
                    <Pie
                      dataKey="value"
                      nameKey="name"
                      label={renderCustomizedLabel}
                      data={option[1]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      labelLine={false}
                    >
                      {option[1]?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            props.secondColor
                              ? colorsChart[index + 1]
                              : colorsChart[index]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip wrapperStyle={{ zIndex: 100 }} />
                  </PieChart>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    style={{
                      color: "#9199A1",
                      marginTop: option[1]?.length === 0 ? "-40px" : "2px",
                    }}
                  >
                    {option[0]}
                  </Typography>
                  <Grid
                    container
                    spacing={1}
                    alignItems="flex-start"
                    style={{
                      width: "80%",
                      height: "200px",
                      position: "absolute",
                      top: "60px",
                      right: "-250px",
                      justifyContent: "flex-start",
                      zIndex: "1",
                    }}
                    sx={{
                      overflow: "scroll",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    }}
                    alignContent="flex-start"
                  >
                    {option[1]?.map((element, index) => (
                      <Grid
                        key={element.name}
                        alignItems="flex-start"
                        item
                        xs={12}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Box
                          style={{
                            height: "10px",
                            width: "10px",
                            backgroundColor: props.secondColor
                              ? colorsChart[index + 1]
                              : colorsChart[index],
                            borderRadius: "100px",
                            marginRight: "4px",
                          }}
                        ></Box>

                        <Typography variant="caption">
                          {props.repo
                            ? `${element.name} (${element.value})`
                            : ` ${element.name?.slice(0, 7)}... (${
                                element.value
                              })`}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </div>
              </Box>
            );
          })}
        </Box>
      ) : title === "Weekly Volume" || title === "Weekly Revenue" ? (
        <ResponsiveContainer width={"100%"} height={350}>
          <LineChart
            data={mappedData}
            margin={{
              top: 5,
              right: 30,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: 8 }} />
            <YAxis />
            <Tooltip />
            <Legend />
         
            {mappedData?.map((option, key) => {
              return (
                Object.keys(option)[key + 1] !== undefined && (
                  <Line
                    type="monotone"
                    dataKey={Object.keys(option)[key + 1]}
                    stroke={setBg()}
                  />
                )
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
      }}>
          <Box sx={{
               display: "flex",
               flexDirection: "column",
               alignItems: "center",
               justifyContent: "center",
               position: "relative",
          }} style={{ width: "100%" }}>
            <Typography
              variant="h5"
              style={{
                height: "70px",
                width: "100%",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "green",
               
              }}
            >
              {data?.revenue}
              <span
                style={{
                  color: "gray",
                  fontSize: "9px",
                  marginLeft: "3px",
                  marginTop: "10px",
                }}
              >
                revenue
              </span>
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
