import React, { useEffect, useState } from "react";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import { makeStyles, Paper, TextField, MenuItem } from "@material-ui/core";

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

  LabelTypography: {
    fontSize: 14,
    fontWeight: 600,
    color: "#243545",
    paddingBottom: 4,
  },
}));

const DropDownTextField = (props) => {
  const classes = useStyles();

  const {
    dropdownList,
    dropDId,
    row,
    dropKey,
    dropDownColumnName,
    isDisabled,
    valueProp,
    setCount,
    count,
  } = props;
  const [fieldValue, setFieldValue] = useState("");

  useEffect(() => {
    if (row.original.gst !== "") {
      setFieldValue(row.original.gst);
    } else {
      setFieldValue("");
    }
  }, [row]);

  return (
    <TextField
      id={dropDId}
      key={dropKey}
      select
      value={fieldValue}
      variant="outlined"
      fullWidth
      disabled={isDisabled}
      inputProps={{ className: classes.input }}
      onChange={(e) => {
        setFieldValue(e.target.value);
        row.original[dropDownColumnName] = e.target.value;
        valueProp(true);
      }}
    >
      {dropdownList &&
        dropdownList.map((option) => (
          <MenuItem
            key={option.gst}
            value={option.gst_val}
            onClick={() => {
              const gstType = option.gst.split(" ")[0];
              const gstVal = option.gst_val.split(" ")[1];
              if (gstType === "GST") {
                console.log("row.original", row.original);
                row.original["cgst"] = (gstVal / 2).toString();
                row.original["sgst"] = (gstVal / 2).toString();
                row.original["igst"] = "0";

                if (row.original["taxable_amount"] === "") {
                  row.original["disc"] = "0";
                  row.original["taxable_amount"] = row.original["rate"];
                }
                if (row.original["taxable_amount"] !== "0.0") {
                  row.original["cgst_amount"] = (
                    ((row.original["taxable_amount"]) * gstVal) /
                    2
                  ).toString();
                  row.original["sgst_amount"] = (
                    ((row.original["taxable_amount"]) * gstVal) /
                    2
                  ).toString();
                  row.original["total_amount"] = 
                  row.original["total_amount"] = 
                    ((((row.original["taxable_amount"]) * gstVal) + (parseFloat(row.original["taxable_amount"]))))
                  row.original["igst_amount"] = "0.00";
                } else {
                  row.original["cgst_amount"] = "0.00";
                  row.original["sgst_amount"] = "0.00";
                }
              } else {
                row.original["cgst"] = "0";
                row.original["sgst"] = "0";
                row.original["igst"] = gstVal.toString();

                if (row.original["taxable_amount"] !== "0.0") {
                  row.original["igst_amount"] = (
                    parseInt(row.original["taxable_amount"]) * gstVal
                  ).toString();
                  row.original["total_amount"] = 
                  ((((row.original["taxable_amount"]) * gstVal) + (parseFloat(row.original["taxable_amount"]))))
                  row.original["cgst_amount"] = "0.00";
                  row.original["sgst_amount"] = "0.00";
                } else {
                  row.original["igst_amount"] = "0.00";
                }
              }
              setCount(count + 1);
            }}
          >
            {option.gst}
          </MenuItem>
        ))}
    </TextField>
  );
};

const EditableTextField = (props) => {
  const classes = useStyles();

  const {
    disabled,
    dropDId,
    row,
    dropKey,
    editableColumnName,
    count,
    setCount,
  } = props;
  const [fieldValue, setFieldValue] = useState("0");

  useEffect(() => {
    if (count || row.original) {
      editableColumnName === "disc" && setFieldValue(row.original.disc);
      editableColumnName === "cgst" && setFieldValue(row.original.cgst);
      editableColumnName === "sgst" && setFieldValue(row.original.sgst);
      editableColumnName === "igst" && setFieldValue(row.original.igst);
      editableColumnName === "cgst_amount" &&
        setFieldValue(Number(row.original.cgst_amount).toFixed(2));
      editableColumnName === "sgst_amount" &&
        setFieldValue(Number(row.original.sgst_amount).toFixed(2));
      editableColumnName === "igst_amount" &&
        setFieldValue(Number(row.original.igst_amount).toFixed(2));
      if (editableColumnName === "taxable_amount") {
        setFieldValue(Number(row.original.taxable_amount).toFixed(2));
      }
      editableColumnName === "total_amount" &&
      setFieldValue(Math.round(row.original.total_amount));
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
        setFieldValue(e.target.value);
      }}
      onBlur={(e) => {
        row.original[editableColumnName] = e.target.value;
        if (editableColumnName === "disc") {
          setFieldValue(e.target.value);
          row.original["disc"] = e.target.value;
          row.original["taxable_amount"] = (
            row.original["amount"] -
            row.original["amount"] * (e.target.value / 100)
          ).toString();
          row.original["gst"] = "";
          row.original["cgst"] = "";
          row.original["cgst_amount"] = "";
          row.original["sgst"] = "";
          row.original["sgst_amount"] = "";
          row.original["igst"] = "";
          row.original["igst_amount"] = "";
          row.original["total_amount"] = "";
          setCount(count + 1);
        }
      }}
    />
  );
};

const BillingInvoiceTabularData = (props) => {
  const [change, setChange] = useState(false);
  const [count, setCount] = useState(0);

  const gst_tpe = [
    { gst: "GST 0%", gst_val: "GST 0" },
    { gst: "GST 5%", gst_val: "GST 0.05" },
    { gst: "GST 12%", gst_val: "GST 0.12" },
    { gst: "GST 18%", gst_val: "GST 0.18" },
    { gst: "GST 28%", gst_val: "GST 0.28" },
    { gst: "IGST 0%", gst_val: "IGST 0" },
    { gst: "IGST 5%", gst_val: "IGST 0.05" },
    { gst: "IGST 12%", gst_val: "IGST 0.12" },
    { gst: "IGST 18%", gst_val: "IGST 0.18" },
    { gst: "IGST 28%", gst_val: "IGST 0.28" },
  ];

  const Columns = [
    {
      Header: <b style={{ color: "#2A5FA5" }}>UOM</b>,
      width: 60,
      accessor: "uom",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Qty</b>,
      sortable: false,
      width: 60,
      accessor: "qty",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Rate</b>,
      sortable: false,
      width: 60,
      accessor: "rate",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Amt</b>,
      width: 60,
      sortable: false,
      accessor: "amount",
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Disc %</b>,
      width: 70,
      sortable: false,
      accessor: "disc",
      Cell: (row) => (
        <EditableTextField
          dropDId={`disc-edit-${row.index}`}
          dropKey={`disc-key-${row.index}`}
          editableColumnName="disc"
          row={row}
          setCount={setCount}
          count={count}
        />
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Taxable Amt</b>,
      accessor: "amount",
      Cell: (row) => (
        <EditableTextField
          dropDId={`taxable-amt-edit-${row.index}`}
          dropKey={`taxable-amt-key-${row.index}`}
          editableColumnName="taxable_amount"
          row={row}
          disabled
          count={count}
        />
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>GST %</b>,
      accessor: "gst",
      style: {
        textAlign: "center",
      },
      Cell: (row) => (
        <DropDownTextField
          dropdownList={gst_tpe}
          dropDownColumnName="gst"
          dropDId={`gst-drop-${row.index}`}
          dropKey={`gst-key-${row.index}`}
          row={row}
          isDisabled={false}
          valueProp={setChange}
          setCount={setCount}
          count={count}
        />
      ),
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>CGST %</b>,
      width: 70,
      sortable: false,
      accessor: "cgst",
      style: {
        textAlign: "center",
      },
      Cell: (row) => (
        <EditableTextField
          dropDId={`cgst-percent-edit-${row.index}`}
          dropKey={`cgst-percent-key-${row.index}`}
          editableColumnName="cgst"
          row={row}
          valueProp={change}
          count={count}
          disabled
        />
      ),
    },

    {
      Header: <b style={{ color: "#2A5FA5" }}>CGST Amt</b>,
      accessor: "cgst_amt",
      style: {
        textAlign: "center",
      },
      Cell: (row) => (
        <EditableTextField
          dropDId={`stock-seal-edit-${row.index}`}
          dropKey={`stock-seal-key-${row.index}`}
          editableColumnName="cgst_amount"
          row={row}
          disabled
          count={count}
        />
      ),
    },

    {
      Header: <b style={{ color: "#2A5FA5" }}>SGST %</b>,
      sortable: false,
      width: 70,
      accessor: "sgst",
      style: {
        textAlign: "center",
      },
      Cell: (row) => (
        <EditableTextField
          dropDId={`stock-seal-edit-${row.index}`}
          dropKey={`stock-seal-key-${row.index}`}
          editableColumnName="sgst"
          row={row}
          valueProp={change}
          count={count}
          disabled
        />
      ),
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>SGST Amt</b>,
      sortable: false,
      accessor: "sgst_amount",
      Cell: (row) => (
        <EditableTextField
          dropDId={`stock-seal-edit-${row.index}`}
          dropKey={`stock-seal-key-${row.index}`}
          editableColumnName="sgst_amount"
          row={row}
          disabled
          count={count}
        />
      ),
      style: {
        textAlign: "center",
      },
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>IGST %</b>,
      width: 70,
      sortable: false,
      accessor: "igst",
      style: {
        textAlign: "center",
      },
      Cell: (row) => (
        <EditableTextField
          dropDId={`stock-seal-edit-${row.index}`}
          dropKey={`stock-seal-key-${row.index}`}
          editableColumnName="igst"
          row={row}
          count={count}
          disabled
        />
      ),
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>IGST Amt</b>,
      sortable: false,
      accessor: "igst_amount",
      style: {
        textAlign: "center",
      },
      Cell: (row) => (
        <EditableTextField
          dropDId={`stock-seal-edit-${row.index}`}
          dropKey={`stock-seal-key-${row.index}`}
          editableColumnName="igst_amount"
          row={row}
          disabled
          count={count}
        />
      ),
    },
    {
      Header: <b style={{ color: "#2A5FA5" }}>Total Amt</b>,
      sortable: false,
      accessor: "total_amount",
      style: {
        textAlign: "center",
      },
      Cell: (row) => (
        <EditableTextField
          dropDId={`stock-seal-edit-${row.index}`}
          dropKey={`stock-seal-key-${row.index}`}
          editableColumnName="total_amount"
          row={row}
          disabled
          count={count}
        />
      ),
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <Paper elevation={0}>
        <ReactTable
          data={props && props.mapper}
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

export default BillingInvoiceTabularData;