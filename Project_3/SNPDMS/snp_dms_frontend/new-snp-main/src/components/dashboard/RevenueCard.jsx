import React from "react";
import {

  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  Box,
} from "@mui/material";

import truck from "../../assets/images/dashboard-movement-truck.svg";
const phone = window.innerWidth <= 350 || "orientation" in window;


export default function RevenueCard(props) {
  
  const { total, title } = props;
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));
  return (
    // <Paper
    //   sx={(theme) => ({
    //     borderRadius: 4,
    //     padding: theme.spacing(2),
    //     wordWrap: "break-word",
    //     // width: "50%",
    //     //marginTop: 4,
    //     [theme.breakpoints.down("xs")]: {
    //       padding: theme.spacing(1),
    //       fontSize: 20,
    //       height: "max-content",
    //     },
    //   })}
    // >
    <Paper sx={(theme)=>({
          borderRadius: 4,
          padding: theme.spacing(2),
          marginTop: 4,
        })}>

      {phone ? (
        <Box
          sx={(theme) => ({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            [theme.breakpoints.down("xs")]: {
              flexDirection: "column",
            },
          })}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "rows",
              width: matches && "50%",
              wordBreak: "break-all",
            }}
          >
            <Typography
              sx={(theme) => ({
                color: "#243545",
                fontWeight: 600,
                fontSize: 26,
                [theme.breakpoints.down("xs")]: {
                  fontSize: 16,
                },
              })}
            >
              {total}
            </Typography>
            <Box
              sx={(theme) => ({
                height: 50,
                width: 50,
                borderRadius: "50%",
                backgroundColor: "#E9EFF6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                [theme.breakpoints.down("xs")]: {
                  position: "absolute",
                  top: 0,
                  right: 0,
                  height: 20,
                  width: 20,
                  borderRadius: "50%",
                  margin: 10,
                },
              })}
            >
              <img src={truck} alt="Truck" width={"30"} height={"30"} />
            </Box>
          </div>
          <Typography style={{ color: "#9199A1" }}>{title}</Typography>
        </Box>
      ) : (
        <Box
          sx={(theme) => ({
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            [theme.breakpoints.down("xs")]: {
              flexDirection: "column",
            },
          })}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: matches && "50%",
              wordBreak: "break-all",
            }}
          >
            <Typography
              sx={(theme) => ({
                color: "#243545",
                fontWeight: 600,
                fontSize: 26,
                [theme.breakpoints.down("xs")]: {
                  fontSize: 16,
                },
              })}
            >
              {total}
            </Typography>
            <Typography style={{ color: "#9199A1" }}>{title}</Typography>
          </div>
          <Box   sx={(theme) => ({
                height: 50,
                width: 50,
                borderRadius: "50%",
                backgroundColor: "#E9EFF6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                [theme.breakpoints.down("xs")]: {
                  position: "absolute",
                  top: 0,
                  right: 0,
                  height: 20,
                  width: 20,
                  borderRadius: "50%",
                  margin: 10,
                },
              })}>
            <img src={truck} alt="Truck"  width={"35"} height={"35"} />
          </Box>
        </Box>
      )}
    </Paper>
  );
}
