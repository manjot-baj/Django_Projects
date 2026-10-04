import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";
import { useSnackbar } from "notistack";
import { Backdrop, CircularProgress, Stack } from "@mui/material";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { Autocomplete } from "@mui/material";
import CustomTextfield from "@components/reusablecomponents/GateInTextField";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  TextField,
  Typography,
  IconButton,
  Paper,
  Box,
  Button,
  Grid,
} from "@mui/material";

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
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useHistory } from "react-router-dom";
import CustomBackButton from "@components/reusablecomponents/CustomBackButton";
import {
  TableCustomAdvanceReactTable,
  TableFootercontainer,
  TableHeading,
} from "../TableComponent/TableComponent";
import { custombackDropStyle } from "@/utils/CustomClasses";

const ConsumeEdit = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    createRequestConsume,
    editFieldConsume,
    mode,
    toolByCategory,
    consumeOrderNo,
  } = useSelector((state) => state.ProcurementConsume);
  const { isloading } = useSelector((state) => state.ui);
  const notify = useSnackbar().enqueueSnackbar;
  const [IITDate, setIITDate] = useState("");
  const [currentConsume, setCurrentConsume] = useState(null);
  const proState = useSelector((state) => state.Procurement);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (e.target.value > editFieldConsume?.in_stock) {
      notify("Consumption quantity cannot be greater than In Stock", { variant: "warning" });
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
        (val) => val.name === editFieldConsume.name,
      )
    ) {
      notify("Tool already added", { variant: "warning" });
      return;
    }
    if (Number(editFieldConsume?.quantity) === 0) {
      notify("Please enter a valid Consumption quantity greater then 0. ", {
        variant: "warning",
      });
      return;
    }
    dispatch(
      handleChangeEditConsumerAction({
        amount: editFieldConsume.rate * editFieldConsume.quantity,
      }),
    );
    dispatch(addFieldConsumeAction());
    dispatch(
      handleChangeEditConsumerAction({
        category: "",
        quantity: 1,
        name: "",
        rate: "",
        sku_code: "",
        in_stock: 0,
        amountAll: function () {
          return `${this.quantity * this.rate}`;
        },
        remarks: "",
      }),
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
        history,
      ),
    );
  };

  const updateConsumption = () => {
    dispatch(
      updateConsumptionAction(
        props.history.location.state.original.pk,
        notify,
        history,
        setCurrentConsume,
      ),
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
          quantity: 1,
          name: "",
          rate: "",
          sku_code: "",
          in_stock: 0,
          remarks: "",
        }),
      );
  }, []);

  useEffect(() => {
    if (props.history.location.state?.original) {
      dispatch(
        getConsumprionByPk(
          props.history.location.state.original.pk,
          notify,
          setCurrentConsume,
        ),
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
          ["get_tool_data_by_id"],
          editFieldConsume.tool_pk,
        ),
      );
    }
    dispatch(handleChangeEditConsumerAction({ quantity: 1 }));
  }, [editFieldConsume.name]);

  useEffect(() => {
    dispatch(toolGetNameByCategoryConsume(editFieldConsume.category_pk));
  }, [editFieldConsume.category, editFieldConsume.category_pk]);

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
      Header: <TableHeading>Category</TableHeading>,

      accessor: "category",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Item</TableHeading>,
      sortable: false,

      accessor: "name",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Rate</TableHeading>,
      sortable: false,

      accessor: "rate",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Sku code</TableHeading>,

      sortable: false,
      accessor: "sku_code",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>In Stock</TableHeading>,

      sortable: false,
      accessor: "in_stock",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <TableHeading>Consumed Quantity</TableHeading>,
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
            slotProps={{
              htmlInput: {
                min: 1,
                max: original.in_stock,
                onKeyDown: (e) => {
                  if (["-", "+", "e", "E"].includes(e.key)) {
                    e.preventDefault();
                  }
                },
                // Disable copy
                onCopy: (e) => e.preventDefault(),

                // Disable paste
                onPaste: (e) => e.preventDefault(),

                // Disable cut
                onCut: (e) => e.preventDefault(),

                // Optional: disable drag/drop text
                onDrop: (e) => e.preventDefault(),
              },
            }}
            onChange={(e) => {
              let value = e.target.value;

              // If empty after backspace, restore to 1
              if (value === "") {
                value = 1;
              }
              value = Math.max(1, Number(e.target.value));
              if (currentConsume) {
                if (
                  value >
                  original.in_stock +
                    currentConsume?.consumption_line[index]?.consumed_quantity
                )
                  return;
                dispatch({
                  type: REQ_REDUCER_CONSUME.REQ_EDIT_CONSUME_LINE_QUANTITY,
                  payload: {
                    index,
                    quantity: value,
                  },
                });
              } else {
                if (value > original.in_stock) return;
                dispatch({
                  type: REQ_REDUCER_CONSUME.REQ_EDIT_CONSUME_LINE_QUANTITY,
                  payload: {
                    index,
                    quantity: value,
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
      Header: <TableHeading>Action</TableHeading>,
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
      Header: <TableHeading>Delete</TableHeading>,
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
                    index,
                  ),
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
      <CustomBackButton handleGoBack={handleGoBack} />

      <Typography
        variant="subtitle2"
        sx={(theme) => ({
          paddingTop: 2,
          paddingBottom: 2,
          backgroundColor: theme.palette.secondary.main,
          color: "#FFF",
          marginTop: 2,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        })}
      >
        <Box fontWeight="fontWeightBold" m={1}>
          Consumption Details
        </Box>
      </Typography>
      <Paper
        sx={(theme) => ({
          padding: theme.spacing(4, 3),
        })}
        elevation={0}
      >
        <Grid container spacing={1}>
          <Grid item size={{ xs: 12, sm: 3, lg: 3 }}>
            <Typography variant="subtitle1">Consumption No.</Typography>
          </Grid>

          <Grid item size={{ xs: 12, sm: 3, lg: 3 }}>
            <TextField
              id="Order_No"
              size="small"
              label=""
              variant="outlined"
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
          <Grid item size={{ xs: 12, sm: 3, lg: 3 }}>
            <Typography variant="subtitle1">Consumption Date</Typography>
          </Grid>
          <Grid item size={{ xs: 12, sm: 3, lg: 3 }}>
            <DatePickerField
              dateId="date"
              isDisableFuture={true}
              dateValue={mode.create ? IITDate : createRequestConsume.date}
              dateChange={handleIITDateChange}
              dispatchType={REQ_REDUCER_CONSUME.REQ_REDUCER_CONSUME_REQ_EDIT}
            />
          </Grid>
        </Grid>
        <div style={{ width: "100%", marginTop: 24 }}>
          <Paper elevation={0}>
            <TableCustomAdvanceReactTable
              data={
                (createRequestConsume.consumption_line &&
                  createRequestConsume.consumption_line) ||
                []
              }
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
        <Paper
          sx={{
            padding: "10px",
            marginBottom: 4,
            overflow: "hidden",
            width: "100%",
          }}
          elevation={2}
        >
          <form
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Grid container spacing={1}>
              <Grid
                item
                size={{ xs: 4, sm: 2 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#243545",
                    paddingBottom: 1,
                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  Category
                </Typography>

                <Autocomplete
                  value={editFieldConsume?.category}
                  // onChange={handleChange}
                  options={
                    proState?.getAllToolsCategory?.category_list?.map(
                      (val) => ({
                        label: val.name,
                        ...val,
                      }),
                    ) || []
                  }
                  style={{
                    maxWidth: "300px",
                  }}
                  onChange={(prev, newvalue) =>
                    dispatch(
                      handleChangeEditConsumerAction({
                        category_pk: newvalue.pk,
                      }),
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      sx={{
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
                      }}
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
              <Grid
                item
                size={{ xs: 4, sm: 2 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#243545",
                    paddingBottom: 1,
                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  Item
                </Typography>

                <Autocomplete
                  value={editFieldConsume?.name}
                  // onChange={handleChange}
                  style={{
                    maxWidth: "300px",
                  }}
                  options={
                    toolByCategory?.map((val) => ({
                      label: val.name,
                      ...val,
                    })) || []
                  }
                  onChange={(prev, newvalue) =>
                    dispatch(
                      handleChangeEditConsumerAction({
                        tool_pk: newvalue.pk,
                      }),
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      sx={{
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
                      }}
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
              <Grid
                item
                size={{ xs: 4, sm: 1 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#243545",
                    paddingBottom: 1,
                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  Sku code
                </Typography>

                <CustomTextfield
                  id="stocks-allot-container-number"
                  value={editFieldConsume.sku_code}
                  readOnlyP
                />
              </Grid>
              <Grid
                item
                size={{ xs: 4, sm: 1 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#243545",
                    paddingBottom: 1,
                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  Rate
                </Typography>

                <CustomTextfield
                  id="stocks-allot-container-number"
                  value={editFieldConsume.rate}
                  readOnlyP
                />
              </Grid>
              <Grid
                item
                size={{ xs: 4, sm: 1 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#243545",
                    paddingBottom: 1,
                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
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
              <Grid
                item
                size={{ xs: 4, sm: 1 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#243545",
                    paddingBottom: 1,
                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  Amount
                </Typography>

                <CustomTextfield
                  id="stocks-allot-container-number"
                  value={Number(
                    editFieldConsume.quantity * editFieldConsume.rate,
                  )?.toFixed(2)}
                  readOnlyP
                />
              </Grid>

              <Grid
                item
                size={{ xs: 4, sm: 2 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#243545",
                    paddingBottom: 1,
                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  Consumption Qty
                </Typography>

                <TextField
                  value={editFieldConsume.quantity}
                  variant="outlined"
                  size="small"
                  type="number"
                  name="quantity"
                  sx={{
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
                  }}
                  slotProps={{
                    htmlInput: {
                      min: 0.1,
                      max: editFieldConsume.in_stock,
                      onKeyDown: (e) => {
                        if (["-", "+", "e", "E"].includes(e.key)) {
                          e.preventDefault();
                        }
                      },
                      // Disable copy
                      onCopy: (e) => e.preventDefault(),

                      // Disable paste
                      onPaste: (e) => e.preventDefault(),

                      // Disable cut
                      onCut: (e) => e.preventDefault(),

                      // Optional: disable drag/drop text
                      onDrop: (e) => e.preventDefault(),
                    },
                  }}
                  onChange={(e) => {
                    let value = e.target.value;

                    // If empty after backspace, restore to 1
                    if (value === "") {
                      value = 0;
                    }
                    value = Math.max(0, Number(e.target.value));
                    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
                      return;
                    }

                    handleChange({
                      target: {
                        name: e.target.name,
                        value,
                      },
                    });
                  }}
                />
              </Grid>
              <Grid
                item
                size={{ xs: 4, sm: 1 }}
                style={{ alignSelf: "flex-end" }}
              >
                <Typography
                  sx={(theme) => ({
                    fontSize: 10,
                    fontWeight: 400,
                    color: "#243545",
                    paddingBottom: 4,
                    [theme.breakpoints.down("sm")]: {
                      paddingBottom: 1,
                    },
                  })}
                >
                  Remarks
                </Typography>

                <TextField
                  value={editFieldConsume.remarks}
                  variant="outlined"
                  size="small"
                  name="remarks"
                  sx={{
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
                  }}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                item
                size={{ xs: 4, sm: 1 }}
                style={{ alignSelf: "flex-end" }}
              >
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
      <Box mt={12}></Box>
      <TableFootercontainer>
        {mode.approve === true ? (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            style={{ width: "100%" }}
          >
            <Button
              variant="contained"
              color="error"
              sx={(theme) => ({
                fontSize: 12.5,
                borderRadius: 2,
                width: 260,
                margin: 2,
                [theme.breakpoints.down("sm")]: {
                  minWidth: 160,
                  margin: 0,
                  ml: 10,
                },
              })}
              onClick={deleteConsumption}
            >
              Delete Consumption
            </Button>
            <Button
              variant="contained"
              sx={(theme) => ({
                fontSize: 12.5,
                borderRadius: 2,
                width: 240,
                margin: 2,
                [theme.breakpoints.down("sm")]: {
                  minWidth: 160,
                  margin: 0,
                  ml: 1,
                },
              })}
              onClick={updateConsumption}
            >
              Update Consumption
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            sx={(theme) => ({
              fontSize: 12.5,
              borderRadius: 2,
              width: 240,
              margin: 2,

              [theme.breakpoints.down("sm")]: {
                width: 240,
                fontSize: "0.7rem",
              },
            })}
            onClick={handlePurchase}
          >
            Create Consumption
          </Button>
        )}
      </TableFootercontainer>
      <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default ConsumeEdit;
