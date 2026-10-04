import React from "react";
import {
 
  Typography,
  Paper,
  Grid,
  Divider,
  Box,
} from "@mui/material";
import { titleTypography } from "../../utils/CustomClasses";
import DashboardTruckImage from '../../assets/images/dashboard-movement-truck.svg'
import { theme } from "@/App";


export default function MovementCard(props) {
 
  const { total, party, line, title, party_20, party_40, line_20, line_40 } =
    props;

  return (
    <Paper
      sx={(theme) => ({
        borderRadius: 4,
        padding: theme.spacing(2),
        // width: "50%",
        marginTop: 4,
      })}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h4" sx={titleTypography}>
            {total}
          </Typography>
          <Typography style={{ color: "#9199A1" }}>{title}</Typography>
        </div>
        <div
          style={{
            height: 50,
            width: 50,
            borderRadius: "50%",
            backgroundColor: "#E9EFF6",
            // opacity: 0.1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={DashboardTruckImage}
            alt="Main Project Gist"
            width={"30"}
            height={"30"}
        
          />
        </div>
      </Box>

      <Box
        sx={(theme) => ({
          display: "flex",
          marginTop: 4,
          backgroundColor: "#EAF0F5",

          padding: theme.spacing(0.75, 1),
          borderRadius: 4,
          width: "100%",
        })}
      >
        <Box
          sx={(theme)=>({
            backgroundColor: theme.palette.primary.main,
            textAlign: "center",
            borderRadius: 2,
            // height: 20,
            padding: 1,
            marginRight: 2,
            color: "#fff",
          })}
          style={{ width: `calc(${party}/${total}*100%)` }}
        >
          <Typography variant="h6">
            {party === "0" && line !== "0" ? "" : party}
          </Typography>
        </Box>
        <Box
          sx={(theme)=>({
            backgroundColor:theme.palette.warning.main,
            textAlign: "center",
            borderRadius: 2,
            // height: 20,
            padding: 1,
            marginRight: 2,
            color: "#fff",
          })}
          style={{ width: `calc(${line}/${total}*100%)` }}
        >
          <Typography variant="h6">
            {line === "0" && party !== "0" ? "" : line}
          </Typography>
        </Box>
      </Box>
      <Grid container spacing={3} style={{ marginTop: 12 }}>
        <Grid item size={{xs:5}}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              
              style={{
                backgroundColor: theme.palette.primary.main,
                width: "20%",
                height: 8,
                borderRadius: 4,
                boxShadow: "0px 3px 6px #7569EE4D",
              }}
            ></span>
            <Typography style={{ paddingLeft: 12 }}>Party</Typography>
          </div>
          <div style={{ marginTop: 6 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{
                  color: "#9199A1",
              }}>20'</Typography>
              <Typography sx={{
                 color: "#243545",
                 fontWeight: 600,
              }}>
                {party_20}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{
                  color: "#9199A1",
              }}>40'</Typography>
              <Typography sx={{
                 color: "#243545",
                 fontWeight: 600,
              }}>
                {party_40}
              </Typography>
            </Box>
          </div>
        </Grid>
        <Grid item size={{xs:1}}>
          <Divider
            // variant="middle"
            orientation="vertical"
            flexItem
            style={{ height: "100%", margin: "0px 2px" }}
          />
        </Grid>

        <Grid item size={{xs:5}}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
             
              style={{
                backgroundColor: theme.palette.warning.main,
                width: "20%",
                height: 8,
                borderRadius: 4,
                boxShadow: "0px 3px 6px #7569EE4D",
              }}
            ></span>
            <Typography style={{ paddingLeft: 12 }}>Line</Typography>
          </div>

          <div style={{ marginTop: 6 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{
                  color: "#9199A1",
              }}>20'</Typography>
              <Typography sx={{
                 color: "#243545",
                 fontWeight: 600,
              }}>
                {line_20}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography sx={{
                  color: "#9199A1",
              }}>40'</Typography>
              <Typography sx={{
                 color: "#243545",
                 fontWeight: 600,
              }}>
                {line_40}
              </Typography>
            </Box>
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
}
