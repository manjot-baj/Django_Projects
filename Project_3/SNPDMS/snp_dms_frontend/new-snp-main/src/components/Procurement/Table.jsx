import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import "./Table.css";
import {
  IconButton,
  Typography,
  Checkbox,
  useMediaQuery,
  Box,
} from "@mui/material";

import { useDispatch, useSelector } from "react-redux";
import { getProAllTools } from "../../actions/Procurement/procurementAction";
import { useSnackbar } from "notistack";
import {
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableHeading,
} from "../TableComponent/TableComponent";


const Table = ({
  data,
  selectedData,
  handleEditModel,
  handleDeleteModel,
  setSelectedData,
  loading,
  handleSingleDelete,
  handleAllChecked,
  prevStockPage,
  nextStockPage,
  radioType,
}) => {
  const { user } = useSelector((state) => state);
  const proState = useSelector((state) => state.Procurement);
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const findSelected = () => {
    let result = false;

    for (let index = 0; index < proState.allTools.data.length; index++) {
      const element = proState.allTools.data[index];
      let select = selectedData.some((val, ind) => element.pk === val.pk);
      if (select) {
        result = true;
      } else {
        result = false;
        break;
      }
    }
    return result;
  };

  const handleInitialPage = () => {
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getProAllTools(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: 1,
        set_on_page_data: value,
      },
    });
    dispatch(getProAllTools(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: "GET_ALL_TOOLS",
      payload: {
        pg_no: val,
      },
    });
    dispatch(getProAllTools(notify));
  };

  return (
    <>
      <TableCustomAdvanceReactTable
        data={data}
        className="procuremenTable"
        loading={loading}
        noDataText="No Tool found"
        style={{
          height: proState.allTools.no_of_data === 0 ? "350px" : "500px",
          marginTop: matchesIphone ? "10px" : "20px",
        }}
        columns={[
          {
            id: "checkbox",
            Header: ({ original }) => {
              return (
                <Checkbox
                  checked={
                    selectedData.length === 0 || !findSelected() ? false : true
                  }
                  onClick={handleAllChecked}
                />
              );
            },

            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
            maxWidth: matchesIphone ? 50 : 100,
            accessor: "",
            sortable: false,
            Cell: ({ original }) => {
              return (
                <Checkbox
                  type="checkbox"
                  checked={selectedData.some((val) => val.pk === original.pk)}
                  sx={{color:"black"}}
                  onChange={() => {
                    if (
                      selectedData.find((value) => value.pk === original.pk)
                    ) {
                      setSelectedData((prev) =>
                        prev.filter((value) => value.pk !== original.pk)
                      );
                    } else {
                      setSelectedData((prev) => [...prev, original]);
                    }
                  }}
                />
              );
            },
          },

          {
            Header: <TableHeading filter>Category</TableHeading>,
            accessor: "category",

            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: <TableHeading filter>Item</TableHeading>,
            accessor: "name",

            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: <TableHeading filter>SKU code</TableHeading>,
            accessor: "sku_code",

            show:
              user.procurement_admin === true ||
              user.procurement_admin === "True",
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return <TableHeading filter>Rate</TableHeading>;
            },
            accessor: "rate",

            show:
              user.procurement_admin === true ||
              user.procurement_admin === "True",
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return <TableHeading filter>Unit</TableHeading>;
            },
            accessor: "unit",

            show:
              user.procurement_admin === true ||
              user.procurement_admin === "True",
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: () => <TableHeading filter>In Stock</TableHeading>,
            accessor: "in_stock",
            Cell: ({ original }) => {
              return (
                <Typography variant="subtitle1">
                  {original.in_stock >= 1 ? original.in_stock : 0}
                </Typography>
              );
            },

            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return <TableHeading filter> Quantity Purchased</TableHeading>;
            },
            show: radioType === "Req",
            accessor: "quantity_purchased",

            Cell: ({ original }) => (
              <Typography
                variant="subtitle1"
                style={{
                  color: "#33b1e8",
                  border: "2px solid rgba(0,0,0,0.09)",
                  borderRadius: "16px",
                }}
              >
                {original.quantity_purchased}
              </Typography>
            ),
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return <TableHeading filter> Purchase Amount</TableHeading>;
            },
            show: radioType === "Req",
            accessor: "purchased_amount",

            Cell: ({ original }) => (
              <Typography variant="subtitle1" style={{ color: "#2bb983" }}>
                {original.purchased_amount}
              </Typography>
            ),
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return <TableHeading filter> Quantity Consumed </TableHeading>;
            },
            show: radioType === "Con",
            accessor: "quantity_consumed",

            Cell: ({ original }) => (
              <Typography
                variant="subtitle1"
                style={{
                  color: "#33b1e8",
                  border: "2px solid rgba(0,0,0,0.09)",
                  borderRadius: "16px",
                }}
              >
                {original.quantity_consumed}
              </Typography>
            ),
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            id: "edit",
            show:
              user.procurement_admin === "True" ||
              user.procurement_admin === true,
            Header: ({ original }) => {
              if (selectedData.length === 0) {
                return <TableHeading filter> Edit </TableHeading>;
              } else {
                return (
                  <DeleteIcon
                    style={{ fill: "rgba(247, 0, 0, 1)" }}
                    onClick={handleDeleteModel}
                  />
                );
              }
            },
            accessor: "",

            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
            Cell: ({ original }) => {
              return (
                <>
                  <IconButton onClick={() => handleEditModel(original)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleSingleDelete(original)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              );
            },
          },
        ]}
        minRows={proState.allTools.set_on_page_data}
        collapseOnDataChange={false}
        showPagination={false}
        defaultPageSize={proState.allTools.set_on_page_data}
        pageSize={Number(proState.allTools.set_on_page_data)}
      />
      <TableCustomPaginationReactTable
        total_pages={proState.allTools.total_pages}
        pg_no={proState.allTools.pg_no}
        handlePaginationOnChange={handlePaginationOnChange}
        next_page={proState.allTools.next_page}
        on_page_data={proState.allTools.on_page_data}
        handleInitialPage={handleInitialPage}
        handleOnPageDataChange={handleOnPageDataChange}
      />
      <Box mb={12}/>
    </>
  );
};

export default Table;
