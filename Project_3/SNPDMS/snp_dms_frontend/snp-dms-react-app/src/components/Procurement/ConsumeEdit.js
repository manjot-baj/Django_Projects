import React, { useEffect, useState } from "react";
import LayoutContainer from "../../components/reusableComponents/LayoutContainer";
import { useSnackbar } from "notistack";
import { Stack } from "@mui/material";
import DatePickerField from "../reusableComponents/DatePickerField";
import { Autocomplete } from "@mui/material";
import { theme } from "../../App";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import CustomTextfield from ".././reusableComponents/GateInTextField";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  TextField,
  Typography,
  makeStyles,
  IconButton,
  Paper,
  Box,
  Button,
  Grid,
} from "@material-ui/core";

import { useDispatch, useSelector } from "react-redux";
import {
  addFieldConsumeAction,
  createConsumeAction,
  deleteConsumptionAction,
  deleteCreateFieldConsumeAction,
  editCreateReqConsumeAction,
  editRequisitionButtonConsumeAction,
  getConsumprionByPk,
  getOrderNoConsumeAction,
  getToolDataConsumeAction,
  handleChangeEditConsumerAction,
  toolGetNameByCategoryConsume,
  updateConsumptionAction,
  updateConsumptionToolAction,
} from "../../actions/Procurement/consumptionAction";
import { toolGetAllCategory } from "../../actions/Procurement/procurementAction";
import { REQ_REDUCER_CONSUME } from "../../reducers/procurement/consumptionReducer";
import { Image } from "semantic-ui-react";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  button: {
    fontSize: 12.5,
    borderRadius: 6,
    width: "15%",
    margin: 15,
    border: "1.5px solid #2A5FA5",
    boxShadow: "0px 3px 6px #9199A14D",
    backgroundColor: "#2A5FA5",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#2A5FA5",
    },
    [theme.breakpoints.down("xs")]: {
      width: "100%",
      fontSize: "0.7rem",
    },
  },
  discountTextField: {
    "&.MuiTextField-root": {
      color: "red",
    },
    "& .MuiInputBase-input": {
      padding: "4px 2px",
      height: "20px",
    },
    "& .MuiAutocomplete-inputRoot": {
      padding: "0px !important",
      height: "30.5px",
    },
  },
  discountTextFieldQty: {
    "&.MuiTextField-root": {
      width: "100%",
      color: "red",
    },
    "& .MuiInputBase-input": {
      padding: "4px 2px",
      height: "23px",
    },
    "& .MuiAutocomplete-inputRoot": {
      padding: "0px !important",
      height: "30.5px",
    },
  },
  backImage: {
    height: 40,
    width: 40,
    marginBottom: 15,
    cursor: "pointer",
  },
  paperContainer: {
    padding: theme.spacing(4, 3),
  },
  input: {
    padding: 7,
  },
  paperContainer1: {
    padding: "10px",
    marginBottom: 20,
    overflow: "hidden",
    width: "100%",
  },
  choiceSelectContainer: {
    border: "1px solid #243545",
    marginTop: "0rem",
    display: "flex",
    borderRadius: 6,
  },
  choice: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 1,
  },
  selectedChoice: {
    borderRadius: 5,
    color: "#fff",
    backgroundColor: "#2F6FB7",
    width: "100%",
    padding: 1,
    "&:hover": {
      backgroundColor: "#2F6FB7",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  tableStyle: {
    "&  ::-webkit-scrollbar": {
      height: "5px",
    },
  },
  LabelTypography1: {
    fontSize: 10,
    fontWeight: 400,
    color: "#243545",
    paddingBottom: 4,
    [theme.breakpoints.down("sm")]: {
      paddingBottom: 1,
    },
  },
  autocomplete: {
    "& .MuiAutocomplete-inputRoot[class*='MuiOutlinedInput-root']": {
      padding: 0,
    },
  },
  fab: {
    cursor: "pointer",
    margin: 5,
  },
  fabFlex: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  mainFlexButton: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
  },
}));

const ConsumeEdit = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    createRequestConsume,
    editFieldConsume,
    mode,
    toolByCategory,
    consumeOrderNo,
  } = useSelector((state) => state.ProcurementConsume);
  const notify = useSnackbar().enqueueSnackbar;
  const [IITDate, setIITDate] = useState("");
  const [currentConsume, setCurrentConsume] = useState(null);
  const proState = useSelector((state) => state.Procurement);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (e.target.value > editFieldConsume?.in_stock) {
      return;
    }
    dispatch(handleChangeEditConsumerAction({ [name]: value }));
  };

  const handleDelete = (index) => {
    dispatch(deleteCreateFieldConsumeAction(index));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (editFieldConsume.category.length <= 1 || editFieldConsume.name <= 1) {
      notify("Please Enter name and Category Fields", { variant: "error" });
      return;
    }
    if (
      createRequestConsume?.consumption_line.some(
        (val) => val.name === editFieldConsume.name
      )
    ) {
      notify("Tool already added", { variant: "warning" });
      return;
    }
    dispatch(
      handleChangeEditConsumerAction({
        amount: editFieldConsume.rate * editFieldConsume.quantity,
      })
    );
    dispatch(addFieldConsumeAction());
    dispatch(
      handleChangeEditConsumerAction({
        category: "",
        quantity: 0,
        name: "",
        rate: "",
        sku_code: "",
        in_stock: 0,
        amountAll: function () {
          return `${this.quantity * this.rate}`;
        },
        remarks: "",
      })
    );
  };

  const handleIITDateChange = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setIITDate(selectedDateFormat);
    return selectedDateFormat;
  };

  const handlePurchase = () => {
    if (
      createRequestConsume.order_no === "" ||
      createRequestConsume.date === "" ||
      createRequestConsume.consumption_line.length <= 0
    ) {
      notify("Please Enter Date , Order No and Consumption line", {
        variant: "error",
      });
      return;
    }

    if (mode.edit === true) {
      editRequisitionButtonConsumeAction(createRequestConsume.data, notify);
      return;
    }
    dispatch(createConsumeAction(createRequestConsume, notify, history));
  };

  const deleteConsumption = () => {
    dispatch(
      deleteConsumptionAction(
        props.history.location.state.original.pk,
        notify,
        history
      )
    );
  };

  const updateConsumption = () => {
    dispatch(
      updateConsumptionAction(
        props.history.location.state.original.pk,
        notify,
        history,
        setCurrentConsume
      )
    );
  };

  const handleGoBack = () => {
    window.history.back();
  };

  useEffect(() => {
    dispatch(editCreateReqConsumeAction());
    dispatch(toolGetAllCategory());
    return () =>
      dispatch(
        handleChangeEditConsumerAction({
          category: "",
          quantity: "0",
          name: "",
          rate: "",
          sku_code: "",
          in_stock: 0,
          remarks: "",
        })
      );
  }, []);

  useEffect(() => {
    if (props.history.location.state?.original) {
      dispatch(
        getConsumprionByPk(
          props.history.location.state.original.pk,
          notify,
          setCurrentConsume
        )
      );
      dispatch({
        type: REQ_REDUCER_CONSUME.REQ_REDUCER_CHANGE_MODE,
        payload: {
          edit: false,
          create: false,
          approve: true,
        },
      });
    }
    return () => {
      dispatch({
        type: REQ_REDUCER_CONSUME.REQ_REDUCER_CHANGE_MODE,
        payload: {
          edit: false,
          create: true,
          approve: false,
        },
      });
      dispatch({
        type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT,
        payload: {
          consumption_line: [],
          pk: "",
          location: "",
          site: "",
          consumption_no: "",
        },
      });
    };
  }, []);

  useEffect(() => {
    if (editFieldConsume.category !== "") {
      dispatch(
        getToolDataConsumeAction(
          ["get_tool_data_by_id" ],
          editFieldConsume.tool_pk
        )
      );
    }
    dispatch(handleChangeEditConsumerAction({ quantity: 0 }));
  }, [editFieldConsume.name]);

  useEffect(() => {
    dispatch(toolGetNameByCategoryConsume(editFieldConsume.category_pk));
  }, [editFieldConsume.category,editFieldConsume.category_pk]);

  useEffect(() => {
    if (mode.create) {
      const currentDate = new Date();
      const nowDate = handleIITDateChange(currentDate);

      dispatch({
        type: REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT,
        payload: { date: nowDate },
      });
      dispatch(getOrderNoConsumeAction());
    }
  }, []);

  const Columns = [
    {
      Header: <b style={{ color: "#2A5FA5" }}>Category</b>,

      accessor: "category",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Item</b>,
      sortable: false,

      accessor: "name",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Rate</b>,
      sortable: false,

      accessor: "rate",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Sku code</b>,

      sortable: false,
      accessor: "sku_code",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>In Stock</b>,

      sortable: false,
      accessor: "in_stock",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Consumed Quantity</b>,
      sortable: false,
      accessor: "consumed_quantity",
      style: {
        textAlign: "center",
      },
      Cell: ({ original, index }) => {
        return mode.approve || mode.create ? (
          <TextField
            value={
              original.consumed_quantity && mode.approve
                ? original.consumed_quantity
                : original.quantity
            }
            variant="outlined"
            size="small"
            type="number"
            step="any"
            error={
              currentConsume
                ? original.consumed_quantity >
                  original.in_stock +
                    currentConsume?.consumption_line[index]?.consumed_quantity
                : original.consumed_quantity > original.in_stock
            }
            helperText={
              (currentConsume
                ? original.consumed_quantity >
                  original.in_stock +
                    currentConsume?.consumption_line[index]?.consumed_quantity
                : original.consumed_quantity > original.in_stock) &&
              "Not enough in stock"
            }
            InputProps={{ inputProps: { min: 0, max: original.in_stock } }}
            inputProps={{ className: classes.input }}
            onChange={(e) => {
              if (currentConsume) {
                if (
                  e.target.value >
                  original.in_stock +
                    currentConsume?.consumption_line[index]?.consumed_quantity
                )
                  return;
                dispatch({
                  type: REQ_REDUCER_CONSUME.REQ_EDIT_CONSUME_LINE_QUANTITY,
                  payload: {
                    index,
                    quantity: e.target.value,
                  },
                });
              } else {
                if (e.target.value > original.in_stock) return;
                dispatch({
                  type: REQ_REDUCER_CONSUME.REQ_EDIT_CONSUME_LINE_QUANTITY,
                  payload: {
                    index,
                    quantity: e.target.value,
                  },
                });
              }
            }}
          />
        ) : (
          <Typography variant="subtitle2">
            {original.consumed_quantity}
          </Typography>
        );
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Action</b>,
      show: mode.approve === true ? false : true,
      sortable: false,
      Cell: ({ original, index }) => {
        return (
          <IconButton onClick={() => handleDelete(index)}>
            <DeleteIcon fontSize="small" style={{ fill: "red" }} />
          </IconButton>
        );
      },
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Delete</b>,
      show: mode.approve === true ? true : false,
      sortable: false,
      Cell: ({ original, index }) => {
        return (
          <IconButton
            onClick={() => {
              if (createRequestConsume?.consumption_line.length <= 1) {
                notify("Cannot Delete all the tools in Consumption", {
                  variant: "warning",
                });
              } else {
                dispatch(
                  updateConsumptionToolAction(
                    props.history.location.state.original.pk,
                    notify,
                    history,
                    original,
                    index
                  )
                );
              }
            }}
          >
            <DeleteIcon fontSize="small" style={{ fill: "red" }} />
          </IconButton>
        );
      },
      style: {
        textAlign: "center",
      },
    },
  ];

  return (
    <LayoutContainer footer={false}>
      <Image
        src={require("../../assets/images/back-arrow.png")}
        className={classes.backImage}
        onClick={handleGoBack}
      />

      <Typography
        variant="subtitle2"
        style={{
          paddingTop: 14,
          paddingBottom: 14,
          backgroundColor: "#243545",
          color: "#FFF",
          marginTop: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Consumption Details
        </Box>
      </Typography>
      <Paper className={classes.paperContainer} elevation={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={3} lg={3}>
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Consumption No.
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <TextField
              id="Order_No"
              size="small"
              label=""
              variant="outlined"
              className={classes.root}
              disabled={mode.approve ? true : false}
              value={
                mode.approve === true
                  ? createRequestConsume.consumption_no
                  : consumeOrderNo
              }
              contentEditable={false}
              InputLabelProps={{
                sx: {
                  textAlign: "center",
                },
              }}
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <Typography variant="subtitle1" className={classes.LabelTypography}>
              Consumption Date
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={3}
            lg={3}
            style={theme.breakpoints.down("sm") && { padding: 7 }}
          >
            <DatePickerField
              dateId="date"
              dateValue={mode.create ? IITDate : createRequestConsume.date}
              dateChange={handleIITDateChange}
              dispatchType={REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT}
            />
          </Grid>
        </Grid>
        <div style={{ width: "100%" }}>
          <Paper elevation={0}>
            <ReactTable
              data={
                (createRequestConsume.consumption_line &&
                  createRequestConsume.consumption_line) ||
                []
              }
              className={classes.tableStyle}
              showPagination={false}
              defaultPageSize={5}
              columns={[...Columns]}
              NoDataComponent={() => (
                <Stack direction={"row"} justifyContent={"center"}>
                  <Typography>No Data Found</Typography>
                </Stack>
              )}
              collapseOnDataChange={false}
              pageSize={createRequestConsume?.consumption_line.length + 1}
              style={{
                marginTop: 50,
                marginBottom: 20,
              }}
            />
          </Paper>
        </div>
      </Paper>

      {!mode.approve && (
        <Paper className={classes.paperContainer1} elevation={2}>
          <form
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Grid container spacing={1}>
              <Grid item xs={4} sm={2} style={{ alignSelf: "flex-end" }}>
                <Typography className={classes.LabelTypography1}>
                  Category
                </Typography>

                <Autocomplete
                  value={editFieldConsume?.category}
                  // onChange={handleChange}
                  options={
                    proState?.getAllToolsCategory?.category_list?.map((val) => ({
                      label: val.name,
                      ...val,
                    })) || []
                  }
                  style={{
                    maxWidth: "300px",
                  }}
                  InputProps={classes.inputText}
                  onChange={(prev, newvalue) =>
                    dispatch(
                      handleChangeEditConsumerAction({
                        category_pk: newvalue.pk,
                      })
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      className={classes.discountTextField}
                      id="select_category"
                      {...params}
                      variant="outlined"
                      name="category"
                      onBlur={handleChange}
                      size="small"
                      required
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4} sm={2} style={{ alignSelf: "flex-end" }}>
                <Typography className={classes.LabelTypography1}>
                  Item
                </Typography>

                <Autocomplete
                  value={editFieldConsume?.name}
                  // onChange={handleChange}
                  style={{
                    maxWidth: "300px",
                  }}
                  options={toolByCategory?.map(val=>({label:val.name,...val})) || []}
                  onChange={(prev, newvalue) =>
                    dispatch(
                      handleChangeEditConsumerAction({
                        tool_pk: newvalue.pk,
                      })
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      className={classes.discountTextField}
                      variant="outlined"
                      label=""
                      id="select_name"
                      name="name"
                      onBlur={handleChange}
                      required
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                <Typography className={classes.LabelTypography1}>
                  Sku code
                </Typography>

                <CustomTextfield
                  id="stocks-allot-container-number"
                  value={editFieldConsume.sku_code}
                  readOnlyP
                />
              </Grid>
              <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                <Typography className={classes.LabelTypography1}>
                  Rate
                </Typography>

                <CustomTextfield
                  id="stocks-allot-container-number"
                  value={editFieldConsume.rate}
                  readOnlyP
                />
              </Grid>
              <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                <Typography className={classes.LabelTypography1}>
                  In Stock
                </Typography>

                <CustomTextfield
                  value={
                    editFieldConsume.in_stock === 0
                      ? "0"
                      : editFieldConsume.in_stock
                  }
                  readOnlyP
                />
              </Grid>
              <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                <Typography className={classes.LabelTypography1}>
                  Amount
                </Typography>

                <CustomTextfield
                  id="stocks-allot-container-number"
                  value={editFieldConsume.quantity * editFieldConsume.rate}
                  readOnlyP
                />
              </Grid>

              <Grid item xs={4} sm={2} style={{ alignSelf: "flex-end" }}>
                <Typography className={classes.LabelTypography1}>
                  Consumption Qty
                </Typography>

                <TextField
                  value={editFieldConsume.quantity}
                  variant="outlined"
                  defaultValue={0}
                  size="small"
                  type="number"
                  name="quantity"
                  className={classes.discountTextFieldQty}
                  InputProps={{
                    inputProps: { min: 0, max: editFieldConsume.in_stock },
                  }}
                  error={
                    editFieldConsume?.quantity > editFieldConsume?.in_stock
                  }
                  inputProps={{ className: classes.input }}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                <Typography className={classes.LabelTypography1}>
                  Remarks
                </Typography>

                <TextField
                  value={editFieldConsume.remarks}
                  variant="outlined"
                  size="small"
                  name="remarks"
                  className={classes.discountTextFieldQty}
                  inputProps={{ className: classes.input }}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={4} sm={1} style={{ alignSelf: "flex-end" }}>
                <IconButton
                  type="submit"
                  onClick={handleAdd}
                  disabled={editFieldConsume.in_stock === 0}
                >
                  <AddBoxIcon
                    style={{ fill: "#08ff08", marginBottom: "-10px" }}
                  />
                </IconButton>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
      <Grid
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          width: "100%",
          marginTop: 16,
          marginBottom: 16,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {mode.approve === true ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            style={{ width: "100%" }}
          >
            <Button
              className={classes.button}
              onClick={deleteConsumption}
              style={{ backgroundColor: "#f73f3f", color: "white" }}
            >
              Delete Consumption
            </Button>
            <Button
              className={classes.button}
              onClick={updateConsumption}
              style={{ backgroundColor: "#2a5fa5", color: "white" }}
            >
              Update Consumption
            </Button>
          </Stack>
        ) : (
          <Button
            className={classes.button}
            onClick={handlePurchase}
            style={{ backgroundColor: "#2a5fa5", color: "white" }}
          >
            Create Consumption
          </Button>
        )}
      </Grid>
    </LayoutContainer>
  );
};

export default ConsumeEdit;
