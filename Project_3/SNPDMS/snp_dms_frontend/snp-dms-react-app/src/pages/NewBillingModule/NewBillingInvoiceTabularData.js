import React, { useEffect, useState } from "react";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import { makeStyles, Paper, TextField } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { NEWBILLING_REDUCER } from "../../reducers/NewBillingReducer";

const useStyles = makeStyles((theme) => ({
  input: {
    padding: 7,
    borderColor: "black",
  },
  selectTextField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#243545",
      },
    },
  },
  inputText: {
    color: "rgba(0,0,0,0.87)",
    fontSize: "16px",
    letterSpacing: "0.5px",
    lineHeight: "28px",
    textAlign: "center",
  },
  discountTextField: {
    "&.MuiTextField-root": {
      color: "red",
    },
    "& .MuiInputBase-input": {
      color: "black",
      fontWeight: "bold",
      padding: "4px 2px",
    },
  },
  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
}));

const EditableTextField = (props) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { disabled, dropDId, row, dropKey, editableColumnName, count, mapper } =
    props;
  const [fieldValue, setFieldValue] = useState("0");

  useEffect(() => {
    if (count || row.original) {
      editableColumnName === "rec_amount" &&
        setFieldValue(row.original.rec_amount);
    }
  }, [count, editableColumnName, row]);

  return (
    <TextField
      id={dropDId}
      key={dropKey}
      value={fieldValue}
      disabled={disabled}
      variant="outlined"
      fullWidth
      inputProps={{ className: classes.input }}
      style={disabled && { backgroundColor: "lightgray" }}
      onChange={(e) => {
        const updatedMapper = [...mapper];
        updatedMapper[row.index].rec_amount = e.target.value;
        const tempBillingAmt = updatedMapper.reduce(
          (sum, entry) => sum + parseFloat(entry.rec_amount),
          0
        );
        dispatch({
          type: "UPDATE_BILLING_AMOUNT",
          payload: tempBillingAmt,
        });
        setFieldValue(e.target.value);
      }}
      onBlur={(e) => {
        row.original[editableColumnName] = e.target.value;
      }}
    />
  );
};

const NewBillingInvoiceTabularData = (props) => {
  const { newBilling } = useSelector((state) => state);
  const { bill_type, invoice_lines } = newBilling.allCollectedInvoiceNew;
  const [count, setCount] = useState(0);
  const dispatch = useDispatch();
  const classes = useStyles();
  const { bill_type: mnr_bill_type } = newBilling.invoiceHistoryByIDNew;

  const Columns = [
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          {bill_type === "Repair" || mnr_bill_type === "Repair" || bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
            ? "Process"
            : "Container No."}
        </b>
      ),
      accessor:
        bill_type === "Repair" || mnr_bill_type === "Repair"|| bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
          ? "process"
          : "container_no",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          {bill_type === "Repair" || mnr_bill_type === "Repair"|| bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
            ? "Size"
            : "Client"}
        </b>
      ),
      accessor:
        bill_type === "Repair" || mnr_bill_type === "Repair"|| bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
          ? "size"
          : "client",
      style: {
        textAlign: "center",
      },
    },
    bill_type === "Repair" || mnr_bill_type === "Repair"|| bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
      ? {
          Header: <b style={{ color: "#2A5FA5" }}>Bill Count</b>,
          accessor: "bill_count",
          style: {
            textAlign: "center",
          },
        }
      : {
          style: { display: "none" },
          isVisible: false,
          show: false,
        },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          {bill_type === "Repair" || mnr_bill_type === "Repair" || bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
            ? "Total amount"
            : "Original Amount"}
        </b>
      ),
      accessor:
        bill_type === "Repair" || mnr_bill_type === "Repair"|| bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
          ? "total_amount"
          : "original_amount",
      style: {
        textAlign: "center",
      },
    },
    bill_type === "Repair" || mnr_bill_type === "Repair"|| bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
      ? {
          Header: <b style={{ color: "#2A5FA5" }}>Discount %</b>,
          accessor: "discount",
          style: {
            textAlign: "center",
          },
          Cell: ({ original, index }) => {
            return (
            
                <TextField
                  defaultValue={0}
                  variant="outlined"
                  value={
                    mnr_bill_type === "Repair" || mnr_bill_type ==="Washing/Cleaning"
                      ? newBilling.invoiceHistoryByIDNew.invoice_lines[index]
                          .discount
                      : invoice_lines[index].discount
                  }
                  className={classes.discountTextField}
                  inputProps={{
                    type: "number",
                    min: 0,
                    max: 100,
                    style: {
                      textAlign: "right",
                    },
                  }}
                  InputProps={classes.inputText}
                  onChange={(e) => {
                    if (mnr_bill_type === "Repair" || mnr_bill_type ==="Washing/Cleaning") {
                      dispatch({
                        type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION_BY_ID,
                        payload: {
                          index: index,
                          discount: e.target.value,
                        },
                      });
                      dispatch({
                        type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT_BY_ID,
                      });
                    } else {
                      dispatch({
                        type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION,
                        payload: {
                          index: index,
                          discount: e.target.value,
                        },
                      });
                      dispatch({
                        type: NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT,
                      });
                    }
                  }}
                />
            
         
            );
          },
        }
      : {
          show: false,
        },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          {bill_type === "Repair" || mnr_bill_type === "Repair" || bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
            ? "Total Amount after Discount"
            : "Remaining Amount"}
        </b>
      ),
      accessor:
        bill_type === "Repair" || mnr_bill_type === "Repair" || bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning"
          ? "total_amount_after_discount"
          : "remaining_amount",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Payment Type</b>,
      accessor: "payment_type",
      style: {
        textAlign: "center",
      },
      show: bill_type === "Repair" || mnr_bill_type === "Repair" || bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning" ? false : true,
    },
    {
      Header: (
        <b style={{ color: "#2A5FA5" }}>
          Receive Amount <span style={{ color: "red" }}>*</span>
        </b>
      ),
      sortable: false,
      accessor: "rec_amount",
      show: bill_type === "Repair" || mnr_bill_type === "Repair" || bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning" ? false : true,
      Cell: (row) => (
        <EditableTextField
          dropDId={`disc-edit-${row.index}`}
          dropKey={`disc-key-${row.index}`}
          editableColumnName="rec_amount"
          row={row}
          setCount={setCount}
          count={count}
          mapper={props.mapper}
        />
      ),
      style: {
        textAlign: "center",
      },
    },
  ];

  useEffect(() => {
    if (bill_type === "Repair" || mnr_bill_type === "Repair" || bill_type ==="Washing/Cleaning"||mnr_bill_type==="Washing/Cleaning") {
      dispatch({
        type:
          mnr_bill_type === "Repair" || mnr_bill_type ==="Washing/Cleaning"
            ? NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT_BY_ID
            : NEWBILLING_REDUCER.EDIT_REPAIR_NEW_BILLING_COLLECTION_TOTAL_AMOUNT,
      });
    }
  
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <Paper elevation={0}>
        <ReactTable
          data={
            bill_type === "Repair"|| bill_type==="Washing/Cleaning"
              ? invoice_lines
              : mnr_bill_type === "Repair"||mnr_bill_type==="Washing/Cleaning"
              ? newBilling.invoiceHistoryByIDNew.invoice_lines
              : props && props.mapper
          }
          defaultPageSize={5}
          columns={[...Columns]}
          collapseOnDataChange={false}
          style={{
            height: "400px", // This will force the table body to overflow and scroll, since there is not enough room
            paddingBottom: 30,
          }}
        />
      </Paper>
    </div>
  );
};

export default NewBillingInvoiceTabularData;
