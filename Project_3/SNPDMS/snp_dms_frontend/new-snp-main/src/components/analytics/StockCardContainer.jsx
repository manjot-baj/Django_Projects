import React, { useState } from "react";

import { Box, Button, Tooltip, Typography } from "@mui/material";
import { Stack } from "@mui/material";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { cacheCleanService } from "../../utils/WeekNumbre";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";



export default function CardContainer(props) {

  const { title } = props;
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [cacheLoader, setCacheLoader] = useState(false);

  const getFormattedDate = () => {
   
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;

    return dd + "/" + mm + "/" + yyyy;
  };

  const handleCleanCache = () => {
    cacheCleanService(setCacheLoader,notify,dispatch)
  };

  return (
    <Box sx={(theme)=>({
      borderRadius: 4,
      backgroundColor: "#DAE2E8",
      padding: theme.spacing(2),
      width: "100%",
      marginTop: 4,
      [theme.breakpoints.down("xs")]: {
        backgroundColor: "unset",
        padding: 0,
      },
    })}>
      <Box sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
      }}>
        <Typography variant="subtitle2" sx={{
           color: "#9199A1",
           fontWeight: 600,
        }}>
          {title}
        </Typography>
        <Typography variant="subtitle2" sx={{
 color: "#9199A1",
 fontWeight: 600,
        }}>
          {getFormattedDate()}
        </Typography>
      </Box>
      <div>{props.children}</div>
      {props?.cache && <Stack direction={"row"} justifyContent={"flex-end"} marginTop={1} >
        <Tooltip
          title={props?.cache ? "Clean Analytics  Data " : "Cleaned Analytics Data"}
          placement="bottom"
        >
          <Button
            disabled={true}
            onClick={handleCleanCache}
          
          >
            <CleaningServicesIcon
              style={{ fill: "#a4a2a7" }}
              fontSize="small"
            />
            <Typography
              variant="subtitle2"
              style={{
                color: "#a4a2a7",
                fontWeight: "bold",
                marginRight: "8px",
              }}
            >
              {props?.cache ? "Cache Data" : "Cleaned"}{" "}
            </Typography>
          </Button>
        </Tooltip>
      </Stack>}
    </Box>
  );
}
