import  { useState } from "react";

import {
  Grid,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { useDispatch } from "react-redux";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { uploadDownloadMNREDI } from "../actions/MNREDIActions";
import { useSnackbar } from "notistack";
import { customLabelTypography } from "../utils/CustomClasses";



export default function MNREDIUpload(props) {
  const dispatch = useDispatch();
  const [icon, setIcon] = useState("");
  const notify = useSnackbar().enqueueSnackbar;

  return (
    <LayoutContainer footer={false}>
      <Grid container>
        <Grid item size={{xs:12}}>
          <div>
            <Typography
              variant="subtitle2"
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                backgroundColor: "#243545",
                color: "#FFF",
                marginTop: 20,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
              }}
            >
              <Box fontWeight="fontWeightBold" m={1}>
                Upload MNR EDI
              </Box>
            </Typography>
            <Paper
              sx={(theme) => ({
                padding: theme.spacing(4, 3),
              })}
              elevation={0}
            >
              <Grid
                container
                spacing={1}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Grid
                  item
                  size={{xs:12,sm:6}}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="subtitle1" sx={customLabelTypography}>
                    Upload Document
                  </Typography>
                  <Grid>
                    <Button
                      sx={{
                        fontSize: 12.5,
                        borderRadius: 6,
                        border: "1.5px solid #2A5FA5",
                        boxShadow: "0px 3px 6px #9199A14D",
                        backgroundColor: "#2A5FA5",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#2A5FA5",
                        },
                      }}
                      id="mnr-edi-upload"
                      component="label"
                    >
                      Choose File
                      <input
                        type="file"
                        style={{ display: "none" }}
                        id="mnr-edi-upload"
                        onChange={(e) => {
                          var file = e.target.files[0];

                          if (
                            file.type ===
                              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                            file.type === "text/plain" ||
                            file.type === ""
                          ) {
                            setIcon(file);
                            let bodyFormData = new FormData();
                            bodyFormData.append("file", file);
                            dispatch(
                              uploadDownloadMNREDI(
                                bodyFormData,
                                file.type,
                                notify
                              )
                            );
                          } else {
                            notify("Only Excel or EDI can be uploaded", {
                              variant: "warning",
                            });
                          }
                        }}
                      />
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </div>
        </Grid>
      </Grid>
    </LayoutContainer>
  );
}
