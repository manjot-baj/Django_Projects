import LayoutContainer from "@/components/reusablecomponents/LayoutContainer";
import {
  TableCellText,
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFilterComponent,
  TableFootercontainer,
  TableHeading,
} from "@/components/TableComponent/TableComponent";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Modal,
  Radio,
  Stack,
  styled,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import { Formik } from "formik";
import * as Yup from "yup";
import { custombackDropStyle, customLabelTypography } from "@/utils/CustomClasses";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { useDispatch, useSelector } from "react-redux";
import { dropDownDispatch } from "@/actions/GateInActions";
import { useSnackbar } from "notistack";
import {
  addLOLOFinanceCustomerAccountPaymentAction,
  deleteLOLOFinanceCustomerAccountPaymentAction,
  getLOLOFinanceCustomerAccountListingAction,
  updateLOLOFinanceCustomerAccountAction,
} from "@/actions/LOLOFinance/LOLOFinanceCustomerAction";
import ArrowRightAltOutlinedIcon from "@mui/icons-material/ArrowRightAltOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { ADVANCE_FINANCE_CUSTOMER_ACCOUNT } from "@/reducers/LOLOFinance/LoloFinanceCustomerReducer";

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 35,
  height: 20,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#65C466",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },
    "&.Mui-focusVisible .MuiSwitch-thumb": {
      color: "#33cf4d",
      border: "6px solid #fff",
    },
    "&.Mui-disabled .MuiSwitch-thumb": {
      color: theme.palette.grey[100],
      ...theme.applyStyles("dark", {
        color: theme.palette.grey[600],
      }),
    },
    "&.Mui-disabled + .MuiSwitch-track": {
      opacity: 0.7,
      ...theme.applyStyles("dark", {
        opacity: 0.3,
      }),
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 16,
    height: 16,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
    ...theme.applyStyles("dark", {
      backgroundColor: "#39393D",
    }),
  },
}));

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const LOLOFinanceCustomerComponenet = () => {
  const history = useHistory();
  const { gateIn, LoloFinanceCustomerReducer } = useSelector((state) => state);
    const { isloading } = useSelector((state) => state.ui);
  
  const { lolo_finance_customer_account_list } = LoloFinanceCustomerReducer;
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const [filterType, setFilterType] = useState("");
  const [openCreditModal, setOpenCreditModel] = useState(false);
  const [paymentType, setPaymentType] = useState("Cheque");
  const [paymentData, setPaymentData] = useState({
    bank_name: "",
    account_name: "",
    account_no: "",
    cheque_no: "",
    utr_no: "",
    amount: "",
    client: "",
  });

  const handleCreditModelClose = () => {
    setOpenCreditModel(false);
  };
  const handleCreditModalopen = () => {
    setOpenCreditModel(true);
  };

  const setDispatchType = (e) => {
    dispatch({
      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
      payload: {
        client: e.target.value,
      },
    });
  };

  const getData = () => {
    dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
      payload: { pg_no: val },
    });
    dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
  };

  const handleInitialPage = () => {
    dispatch({
      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
      payload: { pg_no: 1 },
    });
    dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
      payload: { pg_no: 1 },
    });
    dispatch({
      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
      payload: {
        edit_on_page_data: value,
      },
    });
    dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
  };

  const handleCloseClick = () => {
    setFilterType("");
    dispatch({
      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
      payload: {
        client: "",
      },
    });
    dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
  };

  const handleOnChangeSwitch = (e, client) => {
    dispatch(
      updateLOLOFinanceCustomerAccountAction(e.target.checked, client, notify),
    );
  };

  const Columns = [
    {
      Header: <TableHeading filter>Sr No.</TableHeading>,
      accessor: "sr_no",
      maxWidth: 60,
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.sr_no}>
            {row.original.sr_no}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Client</TableHeading>,
      sortable: false,
      accessor: "client",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.client}>
            {row.original.client}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Created At</TableHeading>,
      accessor: "created_at",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.created_at}>
            {row.original.created_at}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Updated At</TableHeading>,
      accessor: "updated_at",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.updated_at}>
            {row.original.updated_at}
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>GST</TableHeading>,
      accessor: "with_gst",
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <TableCellText title={row.original.with_gst}>
            <FormControlLabel
              control={
                <IOSSwitch
                  sx={{ mr: 1 }}
                  checked={row.original.with_gst}
                  onChange={(e) => handleOnChangeSwitch(e, row.original.client)}
                />
              }
              label={
                <Typography variant="body2">
                  {row.original?.with_gst ? "GST Applied" : "GST not Applied"}
                </Typography>
              }
            />
          </TableCellText>
        );
      },
    },
    {
      Header: <TableHeading filter>Action</TableHeading>,
      accessor: "action",
      minWidth: 120,
      style: {
        textAlign: "center",
      },
      Cell: (row) => {
        return (
          <Stack
            direction={"row"}
            flexDirection={"row"}
            spacing={1}
            alignItems={"center"}
            justifyContent={"center"}
            ml={2}
            sx={(theme) => ({
              [theme.breakpoints.down("md")]: {
                paddingX: 220,
              },
            })}
          >
            <Divider orientation="vertical" variant="middle" flexItem />
            <Button
              startIcon={<ArrowRightAltOutlinedIcon />}
              onClick={() =>
                history.push(
                  `/lolo-payment/customer-account/${row.original?.pk}`,
                )
              }
              variant="text"
              size="small"
              color="info"
            >
              View
            </Button>
            <Divider orientation="vertical" variant="middle" flexItem />
            <Button
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={() =>
                dispatch(
                  deleteLOLOFinanceCustomerAccountPaymentAction(
                    row.original?.pk,
                    notify,
                  ),
                )
              }
              variant="text"
              size="small"
              color="error"
            >
              Delete
            </Button>
          </Stack>
        );
      },
    },
  ];

  useEffect(() => {
    let reqArray = ["lf_advance_payment_client_list", "lf_pregatein_list"];
    dispatch(dropDownDispatch(reqArray, notify));
    dispatch({
      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
      payload: {
        client: "",
      },
    });
    dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
  }, []);

  return (
    <LayoutContainer>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
        spacing={4}
      >
        <Typography
          variant="h6"
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
            [theme.breakpoints.down("sm")]: {
              display: "none",
            },
          })}
        >
          <Person2OutlinedIcon /> Lolo Finance Customer Account
        </Typography>
      </Stack>

      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-start"}
        sx={{
          my: 4,
        }}
        spacing={2}
      >
        <TableCustomSearchBar
          searchText={lolo_finance_customer_account_list?.client}
          setSearchText={setDispatchType}
          noSelect={true}
          searchClick={getData}
          selectName={"Client Name"}
          closeClick={handleCloseClick}
          maxWidthSearch={"50%"}
        />
        <TableFilterComponent
          activeFilter={false}
          title={`${
            lolo_finance_customer_account_list.with_gst === true
              ? "GST Applied"
              : "GST Not Applied "
          }`}
          style={{
            width: 200,
          }}
        >
          <Grid item size={{ xs: 12 }}>
            <Typography variant="subtitle2">GST Type</Typography>
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <FormControlLabel
              value="yes"
              control={
                <Radio
                  size="small"
                  sx={(theme) => ({ color: theme.palette.primary.main })}
                  checked={lolo_finance_customer_account_list.with_gst === true}
                  onClick={() => {
                    dispatch({
                      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
                      payload: {
                        with_gst: true,
                        pg_no: 1,
                      },
                    });
                    dispatch(
                      getLOLOFinanceCustomerAccountListingAction(notify),
                    );
                  }}
                />
              }
              label="GST Applied "
            />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <FormControlLabel
              value="no"
              control={
                <Radio
                  size="small"
                  sx={(theme) => ({ color: theme.palette.primary.main })}
                  checked={
                    lolo_finance_customer_account_list.with_gst === false
                  }
                  onClick={() => {
                    dispatch({
                      type: ADVANCE_FINANCE_CUSTOMER_ACCOUNT.ADVANCE_LOLO_FINANCE_CUSTOMER_ACCOUNT_LISTING,
                      payload: {
                        with_gst: false,
                        pg_no: 1,
                      },
                    });
                    dispatch(
                      getLOLOFinanceCustomerAccountListingAction(notify),
                    );
                  }}
                />
              }
              label="GST Not Applied"
            />
          </Grid>
        </TableFilterComponent>
      </Stack>
      <TableCustomAdvanceReactTable
        data={
          lolo_finance_customer_account_list.data &&
          lolo_finance_customer_account_list.data
        }
        columns={[...Columns]}
        minRows={Number(lolo_finance_customer_account_list.data.length)}
        pageSize={Number(lolo_finance_customer_account_list.data.length)}
        defaultPageSize={Number(lolo_finance_customer_account_list.data.length)}
      />
      <TableCustomPaginationReactTable
        handlePaginationOnChange={handlePaginationOnChange}
        total_pages={lolo_finance_customer_account_list.total_pages}
        pg_no={lolo_finance_customer_account_list.pg_no}
        next_page={lolo_finance_customer_account_list.next_page}
        on_page_data={lolo_finance_customer_account_list.edit_on_page_data}
        handleInitialPage={handleInitialPage}
        handleOnPageDataChange={handleOnPageDataChange}
        removeInitialPage={true}
      />
      <Box mb={12}></Box>
      <TableFootercontainer>
        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleCreditModalopen}
          sx={{ mx: 1 }}
          variant="contained"
          color="primary"
          size="large"
        >
          Credit Amount
        </Button>
        <Button
          startIcon={<CloudUploadOutlinedIcon />}
          variant="contained"
          color="success"
          size="large"
          onClick={() =>
            history.push("/lolo-payment/customer-account/bulk-upload")
          }
        >
          Bulk Upload{" "}
        </Button>
      </TableFootercontainer>

      <Modal open={openCreditModal} onClose={handleCreditModelClose}>
        <Box
          style={getModalStyle()}
          sx={(theme) => ({
            position: "absolute",
            width: "70%",
            backgroundColor: "white",
            boxShadow: 5,
            paddingY: 2,
            paddingX: 4,
            outline: "none",
            borderRadius: 2,
            [theme.breakpoints.down("sm")]: {
              width: "90%",
              padding: 2,
            },
          })}
        >
          <Card elevation={0}>
            <CardHeader
              title={
                <Stack
                  direction={"row"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  flexDirection={"row"}
                  spacing={2}
                >
                  <Button
                    variant={paymentType === "Cheque" ? "contained" : "text"}
                    color={paymentType === "Cheque" ? "primary" : "default"}
                    onClick={() => setPaymentType("Cheque")}
                    disabled={paymentData?.pk && paymentType !== "Cheque"}
                  >
                    Cheque
                  </Button>
                  <Button
                    variant={paymentType === "NEFT" ? "contained" : "text"}
                    color={paymentType === "NEFT" ? "primary" : "default"}
                    onClick={() => setPaymentType("NEFT")}
                    disabled={paymentData?.pk && paymentType !== "NEFT"}
                  >
                    NEFT
                  </Button>
                  <Button
                    variant={paymentType === "RTGS" ? "contained" : "text"}
                    color={paymentType === "RTGS" ? "primary" : "default"}
                    onClick={() => setPaymentType("RTGS")}
                    disabled={paymentData?.pk && paymentType !== "RTGS"}
                  >
                    RTGS
                  </Button>
                </Stack>
              }
            />
            <Divider sx={{ width: "98%", margin: "auto", mb: 1 }} />
            <CardContent>
              <Formik
                initialValues={paymentData}
                enableReinitialize={true}
                validationSchema={Yup.object().shape({
                  client: Yup.string().required("Client is Required"),
                  bank_name: Yup.string().required("Bank name is Required"),
                  account_name: Yup.string().required(
                    "Account Name is Required",
                  ),
                  account_no: Yup.string().required("Account No is Required"),
                  cheque_no:
                    paymentType === "Cheque"
                      ? Yup.string().required("Cheque No is Required")
                      : Yup.string().nullable(),
                  utr_no:
                    paymentType === "NEFT" || paymentType === "RTGS"
                      ? Yup.string().nullable().required("UTR No is Required")
                      : Yup.string().nullable(),
                  amount: paymentData?.pk
                    ? Yup.string().nullable()
                    : Yup.string().required("Amount is Required"),
                })}
                onSubmit={async (values) => {
                  if (paymentType === "Cheque") {
                    values.utr_no = null;
                    values.payment_type = "Cheque";
                  } else {
                    values.cheque_no = null;
                    if (paymentType === "NEFT") {
                      values.payment_type = "NEFT";
                    } else {
                      values.payment_type = "RTGS";
                    }
                  }
                  if (paymentData?.pk) {
                    values.container = undefined;
                    values.remaining = undefined;
                    values.amount = undefined;
                    if (props.self_transportation) {
                      dispatch(
                        updateSTPaymentAction(
                          paymentData?.pk,
                          values,
                          handleModalClose,
                          notify,
                        ),
                      );
                    } else {
                      dispatch(
                        updateHandlingPaymentAction(
                          paymentData?.pk,
                          values,
                          handleModalClose,
                          notify,
                        ),
                      );
                    }
                  } else {
                    dispatch(
                      addLOLOFinanceCustomerAccountPaymentAction(
                        values,
                        handleCreditModelClose,
                        notify,
                      ),
                    );
                  }
                }}
              >
                {({
                  errors,
                  handleSubmit,
                  isSubmitting,
                  touched,
                  values,
                  handleBlur,
                  handleChange,
                  setFieldValue,
                }) => (
                  <form onSubmit={handleSubmit}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      <span style={{ fontWeight: "bold" }}>Step 1</span> : Add{" "}
                      {`${paymentType === "Cheque" ? "Cheque" : "UTR"} `}
                      No , Client and Amount
                    </Typography>
                    <Grid container spacing={2} sx={{ marginLeft: 6 }}>
                      {(paymentType === "NEFT" || paymentType === "RTGS") && (
                        <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <Typography
                            variant="subtitle2"
                            sx={customLabelTypography}
                          >
                            Utr No<span style={{ color: "red" }}>*</span>
                          </Typography>
                          <TextField
                            error={Boolean(touched.utr_no && errors.utr_no)}
                            helperText={touched.utr_no && errors.utr_no}
                            margin="none"
                            autoComplete="off"
                            name="utr_no"
                            fullWidth
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type="text"
                            size="small"
                            value={values.utr_no}
                            variant="outlined"
                          />
                        </Grid>
                      )}
                      {paymentType === "Cheque" && (
                        <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                          <Typography
                            variant="subtitle2"
                            sx={customLabelTypography}
                          >
                            Cheque No<span style={{ color: "red" }}>*</span>
                          </Typography>
                          <TextField
                            error={Boolean(
                              touched.cheque_no && errors.cheque_no,
                            )}
                            helperText={touched.cheque_no && errors.cheque_no}
                            margin="none"
                            autoComplete="off"
                            name="cheque_no"
                            fullWidth
                            onChange={handleChange}
                            onBlur={handleBlur}
                            type="text"
                            size="small"
                            value={values.cheque_no}
                            variant="outlined"
                          />
                        </Grid>
                      )}
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Client<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.client && errors.client)}
                          helperText={touched.client && errors.client}
                          margin="none"
                          autoComplete="off"
                          name="client"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          select={true}
                          size="small"
                          value={values.client}
                          variant="outlined"
                        >
                          {gateIn.allDropDown?.lf_advance_payment_client_list?.map(
                            (val, ind) => (
                              <MenuItem key={val} value={val}>
                                {val}
                              </MenuItem>
                            ),
                          )}
                        </TextField>
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Amount<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.amount && errors.amount)}
                          helperText={touched.amount && errors.amount}
                          margin="none"
                          autoComplete="off"
                          name="amount"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="number"
                          size="small"
                          value={values.amount}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>

                    <Typography variant="subtitle2" sx={{ mb: 2, mt: 4 }}>
                      <span style={{ fontWeight: "bold" }}>Step 2</span> : Add
                      Bank Name ,Account Name & Account No
                    </Typography>
                    <Grid container spacing={2} sx={{ marginLeft: 6 }}>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Bank Name<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(touched.bank_name && errors.bank_name)}
                          helperText={touched.bank_name && errors.bank_name}
                          margin="none"
                          autoComplete="off"
                          name="bank_name"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="text"
                          size="small"
                          value={values.bank_name}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Account Name<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(
                            touched.account_name && errors.account_name,
                          )}
                          helperText={
                            touched.account_name && errors.account_name
                          }
                          margin="none"
                          autoComplete="off"
                          name="account_name"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="text"
                          size="small"
                          value={values.account_name}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Typography
                          variant="subtitle2"
                          sx={customLabelTypography}
                        >
                          Account No<span style={{ color: "red" }}>*</span>
                        </Typography>
                        <TextField
                          error={Boolean(
                            touched.account_no && errors.account_no,
                          )}
                          helperText={touched.account_no && errors.account_no}
                          margin="none"
                          autoComplete="off"
                          name="account_no"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          type="text"
                          size="small"
                          value={values.account_no}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>

                    <Box style={{ textAlign: "end" }} ml={1} mt={6}>
                      {paymentData?.pk ? (
                        <Button
                          color="primary"
                          disabled={isSubmitting}
                          size="medium"
                          type="submit"
                          variant="contained"
                          style={{
                            marginRight: "10px",
                            width: 240,
                          }}
                        >
                          Update Payment
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          disabled={isSubmitting}
                          size="medium"
                          type="submit"
                          variant="contained"
                          style={{
                            marginRight: "10px",
                            width: 240,
                          }}
                        >
                          Credit Amount
                        </Button>
                      )}
                      {paymentData?.pk && (
                        <Button
                          sx={{ marginRight: "10px" }}
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            if (props.self_transportation) {
                              dispatch(
                                deleteStPayment(
                                  paymentData?.pk,
                                  notify,
                                  handleModalClose,
                                ),
                              );
                            } else {
                              dispatch(
                                deleteHandlingPayment(
                                  paymentData?.pk,
                                  notify,
                                  handleModalClose,
                                ),
                              );
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        color="secondary"
                        size="medium"
                        type="button"
                        variant="outlined"
                        onClick={handleCreditModelClose}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </Box>
      </Modal>
        <Backdrop sx={custombackDropStyle} open={isloading}>
              <CircularProgress color="inherit" />
            </Backdrop>
    </LayoutContainer>
  );
};

export default LOLOFinanceCustomerComponenet;
