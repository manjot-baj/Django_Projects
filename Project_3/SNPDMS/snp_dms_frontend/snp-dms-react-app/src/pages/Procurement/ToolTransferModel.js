import { Box, Grid, Modal, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography ,Divider, makeStyles, Button} from "@material-ui/core";
import { Stack } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { approveToolRequestAction } from "../../actions/Procurement/toolTransferAction";
import { notify } from "../../actions/NotiActions";


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  bgcolor: "background.paper",
  boxShadow: 24,
  border:"none",
  outline:"none",
  p: 4,
};

const useStyles = makeStyles((theme) => ({
  textField: {},
  inputLabel:{
    fontSize:"10px",
    fontWeight:"700"
  },
  approveButton:{
    backgroundColor:"#10b981",
    color:"white",
    padding:"4px 20px",
    marginLeft:"4px"
  }
}));


const TABLE_CONST = [
    "name",
    "category",
    "amount",
    "quantity",
    "is_approved",
    "approved_by",
  ];
  

const ToolTransferModel = ({ open, handleClose }) => {
    const { toolTransferReducer } = useSelector(
        (state) => state
      );
      const { getTool } = toolTransferReducer;
      const classes =useStyles()
      const dispatch = useDispatch();

   const handleApprove =()=>{
     dispatch(approveToolRequestAction(notify))
   }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Grid container spacing={2}>
          <Grid item sm={12}>
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              Tool Request{" "}
            </Typography>
          </Grid>
          <Grid item sm={12}>
            <Divider/>
          </Grid>
          <Grid item sm={6}>
            <Typography variant="subtitle2" className={classes.inputLabel}>
              Date
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={getTool.date}
              name={"tool_transfer_no"}
              type="text"
            //   className={classes.selectText}
              inputProps={{
                style: { height: "32px", padding: "0 4px" },
              }}
            //   onChange={handleChangeToolRequest}
            />
          </Grid>
          <Grid item sm={6}>
            <Typography variant="subtitle2" className={classes.inputLabel} >
              Tool Transfer No
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={getTool.tool_transfer_no}
              name={"tool_transfer_no"}
              type="text"
            //   className={classes.selectText}
              inputProps={{
                style: { height: "32px", padding: "0 4px" },
              }}
            //   onChange={handleChangeToolRequest}
            />
          </Grid>
          <Grid item sm={6}>
            <Typography variant="subtitle2" className={classes.inputLabel}>
              Site
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={getTool.site}
              name={"tool_transfer_no"}
              type="text"
            //   className={classes.selectText}
              inputProps={{
                style: { height: "32px", padding: "0 4px" },
              }}
            //   onChange={handleChangeToolRequest}
            />
          </Grid>
          <Grid item sm={6}>
            <Typography variant="subtitle2" className={classes.inputLabel}>
              Location
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={getTool.location}
              name={"tool_transfer_no"}
              type="text"
            //   className={classes.selectText}
              inputProps={{
                style: { height: "32px", padding: "0 4px" },
              }}
            //   onChange={handleChangeToolRequest}
            />
          </Grid>
          <Grid item sm={12}>
            <Typography variant="subtitle2" style={{fontWeight:"bold"}}>
              Tool Request Line
            </Typography>
          </Grid>
          <Grid item sm={12}>
          <TableContainer
            component={Paper}
            style={{ maxHeight: 200, backgroundColor: "white" }}
          >
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="simple table"
            >
              <TableHead>
                <TableRow>
                  {TABLE_CONST.map((val) => (
                    <TableCell>
                      <Typography
                        variant="subtitle2"
                        style={{
                          fontWeight: "700",
                          fontSize: "12px",
                          color: "gray",
                          textAlign: "center",
                        }}
                      >
                        {val}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody style={{ maxHeight: "100px" }}>
                {getTool.tool_request_line?.map((row) => (
                  <TableRow
                 
                    key={row.name}
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                  >
                    {TABLE_CONST?.map((val) =>
                      val === "is_approved" ? (
                        <TableCell
                          component="th"
                          scope="row"
                          style={{ fontWeight: "bold", textAlign: "center" }}
                        >
                          {row["is_approved"] === true ? (
                            <Stack
                              direction={"row"}
                              alignItems={"center"}
                              spacing={1}
                              justifyContent={"center"}
                            >
                              {" "}
                              <Box
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "100%",
                                  backgroundColor: "#10b981",
                                  border: "2px solid rgba(16,185,129,0.5)",
                                }}
                              ></Box>{" "}
                              <Typography
                                variant="subtitle2"
                                style={{ fontWeight: "600", color: "#10b981" }}
                              >
                                {" "}
                                Approved{" "}
                              </Typography>
                            </Stack>
                          ) : (
                            <Stack
                              direction={"row"}
                              alignItems={"center"}
                              spacing={1}
                              justifyContent={"center"}
                            >
                              {" "}
                              <Box
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "100%",
                                  backgroundColor: "#f97215",
                                  border: "2px solid rgba(249, 114, 21, 0.5)",
                                }}
                              ></Box>{" "}
                              <Typography
                                variant="subtitle2"
                                style={{ fontWeight: "600", color: "#f97215" }}
                              >
                                {" "}
                                Pending{" "}
                              </Typography>
                            </Stack>
                          )}
                        </TableCell>
                      ) : (
                        <TableCell
                          component="th"
                          scope="row"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            color:
                              val === "amount"
                                ? "#24b983"
                                : val === "quantity"
                                ? "#00a1e5"
                                : "black",
                          }}
                        >
                          {row[val]}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </Grid>
          <Grid item sm={12} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}} spacing={2}>
            <Button variant="contained" onClick={handleClose}>
              Back
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ToolTransferModel;
