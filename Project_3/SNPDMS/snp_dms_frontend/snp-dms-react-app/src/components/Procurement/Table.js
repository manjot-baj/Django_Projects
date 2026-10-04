import React from "react";
import ReactTable from "react-table-v6";
import "react-table-v6/react-table.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import "./Table.css";
import {
  Grid,
  IconButton,
  Typography,
  makeStyles,
  TextField,
  MenuItem,
  Checkbox,
  useMediaQuery,
  Button,
} from "@material-ui/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PreviousIcon from "@material-ui/icons/ArrowBack";
import NextIcon from "@material-ui/icons/ArrowForward";
import { useDispatch, useSelector } from "react-redux";
import { getProAllTools } from "../../actions/Procurement/procurementAction";
import { useSnackbar } from "notistack";

const customHeaderStyle = {
  background: "white",
  height: "40px",
  color: "#2a5fa5",
  fontSize: "1rem",
  fontWeight: "bold",
  border: "0.3px solid white",
  borderRadius: "5px",
};

const useStyles = makeStyles((theme) => ({
  paperContainer: {
    padding: theme.spacing(2, 3),
  },
  input: {
    padding: 6,
    borderColor: "black",
    width: "100px",
  },
}));

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
  radioType
}) => {
  const {user} = useSelector(state=>state)
  const proState = useSelector((state) => state.Procurement);
  const classes = useStyles();
  const dispatch = useDispatch();
  const notify = useSnackbar().enqueueSnackbar;
  const matchesIphone = useMediaQuery("(max-width:400px)");

  const findSelected = () => {
    let result =false;
  
   for (let index = 0; index < proState.allTools.data.length; index++) {
    const element = proState.allTools.data[index];
     let select= selectedData.some((val,ind)=>element.pk===val.pk)
     if(select){
      result =true
     }else{
      result =false;
      break;
     }
   }
   return result
  };



  return (
    <>
      <ReactTable
        data={data}
        className="procuremenTable"
        loading={loading}
        noDataText="No Tool found"
        style={{
          height: proState.allTools.no_of_data === 0 ? "350px" : "300px",
          marginTop:matchesIphone?"10px":"20px"
        }}
        columns={[
          {
            id: "checkbox",
            Header: ({ original }) => {
              return (
                <Checkbox
                  checked={
                    selectedData.length === 0 || !findSelected()
                  
                      ? false
                      : true
                  }
                  onClick={handleAllChecked}
                />
              );
            },
            headerStyle: customHeaderStyle,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
            maxWidth:matchesIphone ? 50: 100,
            accessor: "",
            sortable: false,
            Cell: ({ original }) => {

              return (
                <input
                  type="checkbox"
                  checked={selectedData.some((val)=>val.pk===original.pk)}
                  className={`checkbox_pro`}
                  
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
            Header: "Category",
            accessor: "category",
            headerStyle: customHeaderStyle,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: "Item",
            accessor: "name",
            headerStyle: customHeaderStyle,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: "SKU code",
            accessor: "sku_code",
            headerStyle: customHeaderStyle,
            show:(user.procurement_admin ===true || user.procurement_admin ==="True"),
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return (
                <div>
                  Rate <FontAwesomeIcon icon={faSort} />
                </div>
              );
            },
            accessor: "rate",
            headerStyle: customHeaderStyle,
            show:(user.procurement_admin ===true || user.procurement_admin ==="True"),
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return (
                <div>
                  Unit <FontAwesomeIcon icon={faSort} />
                </div>
              );
            },
            accessor: "unit",
            headerStyle: customHeaderStyle,
            show:(user.procurement_admin ===true || user.procurement_admin ==="True"),
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: () => (
              <div>
                In Stock <FontAwesomeIcon icon={faSort} />
              </div>
            ),
            accessor: "in_stock",
            Cell: ({ original }) => {
              return (
               <Typography variant="subtitle1">
                {original.in_stock >= 1 ? original.in_stock : 0}
               </Typography>
              );
            },
            headerStyle: customHeaderStyle,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return (
                <div>
                  Quantity Purchased <FontAwesomeIcon icon={faSort} />
                </div>
              );
            },
            show:radioType ==="Req",
            accessor: "quantity_purchased",
            headerStyle: customHeaderStyle,
            Cell:({original})=><Typography variant="subtitle1" style={{color:"#33b1e8",border:"2px solid rgba(0,0,0,0.09)",borderRadius:"16px"}}>{original.quantity_purchased}</Typography>,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return (
                <div>
                   Purchase Amount <FontAwesomeIcon icon={faSort} />
                </div>
              );
            },
            show:radioType ==="Req",
            accessor: "purchased_amount",
            headerStyle: customHeaderStyle,
            Cell:({original})=><Typography variant="subtitle1" style={{color:"#2bb983"}}>{original.purchased_amount}</Typography>,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            Header: ({ original }) => {
              return (
                <div>
                   Quantity Consumed  <FontAwesomeIcon icon={faSort} />
                </div>
              );
            },
            show:radioType ==="Con",
            accessor: "quantity_consumed",
            headerStyle: customHeaderStyle,
            Cell:({original})=><Typography variant="subtitle1" style={{color:"#33b1e8",border:"2px solid rgba(0,0,0,0.09)",borderRadius:"16px"}}>{original.quantity_consumed}</Typography>,
            style: {
              textAlign: "center",
              fontSize: "0.9rem",
            },
          },
          {
            id: "edit",
            show:(user.procurement_admin ==="True" || user.procurement_admin === true),
            Header: ({ original }) => {
              if (selectedData.length === 0) {
                return "Edit";
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
            headerStyle: customHeaderStyle,
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
        minRows={2}
        collapseOnDataChange={false}
        showPagination={false}
        defaultPageSize={proState.allTools.set_on_page_data}
        pageSize={Number(proState.allTools.set_on_page_data)}
      />
      <Grid
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 10,
          border: "1px solid #0000000d",
          marginBottom: 20,
        }}
      >
         <Button
                variant="contained"
                startIcon={<PreviousIcon />}
                color="secondary"
                onClick={prevStockPage}
                disabled={
                  proState.allTools.prev_page ===""
                    ? true
                    : false
                }
              >
                Previous
              </Button>
      
       
        <Grid item xs={4} style={{ display: "flex", alignItems: "center" }}>
       {  !matchesIphone && <Typography variant="subtitle2" style={{ padding: "3px" }}>
            Page
          </Typography> }
          <TextField
            id="basic"
            variant="outlined"
            size="small"
            style={{ width: "50px", padding: "3px" }}
            value={proState.allTools.pg_no}
            onChange={(e) => {
              if (e.target.value > proState.allTools.total_pages) {
                notify("Invalid value entered", {
                  variant: "warning",
                });
              } else {
                 dispatch({
                  type:"GET_ALL_TOOLS",
                  payload:{
                    pg_no:e.target.value
                  }
                 })
              }
            }}
            onBlur={(e) => {
              if (
                e.target.value === "" ||
                e.target.value === "0" ||
                e.target.value > proState.allTools.total_pages
              ) {
                notify("Invalid value entered", {
                  variant: "warning",
                });
                dispatch({
                  type:"GET_ALL_TOOLS",
                  payload:{
                    pg_no:1
                  }
                 })
                 dispatch(getProAllTools(notify));
              } else {
                dispatch({
                  type:"GET_ALL_TOOLS",
                  payload:{
                    pg_no:e.target.value
                  }
                 })
             
             
                dispatch(getProAllTools(notify));
              }
            }}
          />
          <Typography variant="subtitle2" style={{ padding: "3px" }}>
            of
          </Typography>
          <Typography variant="subtitle2" style={{ padding: "3px" }}>
            {proState.allTools.total_pages}
          </Typography>
        </Grid>
        <TextField
          id="client-master-code"
          select
          value={proState.allTools.set_on_page_data}
          variant="outlined"
          inputProps={{ className: classes.input }}
          onChange={(e) => {
            dispatch({
              type:"GET_ALL_TOOLS",
              payload:{
                pg_no:1,
                set_on_page_data:e.target.value
              }
             })
         
            dispatch(getProAllTools(notify));
          }}
        >
          <MenuItem key={"5 rows"} value={"5"}>
            {"5 rows"}
          </MenuItem>
          <MenuItem key={"10 rows"} value={"10"}>
            {"10 rows"}
          </MenuItem>
          <MenuItem key={"20 rows"} value={"20"}>
            {"20 rows"}
          </MenuItem>
          <MenuItem key={"25 rows"} value={"25"}>
            {"25 rows"}
          </MenuItem>
          <MenuItem key={"50 rows"} value={"50"}>
            {"50 rows"}
          </MenuItem>
          <MenuItem key={"100 rows"} value={"100"}>
            {"100 rows"}
          </MenuItem>
        </TextField>
        <Button
          variant="contained"
          endIcon={<NextIcon />}
          color="secondary"
          onClick={nextStockPage}
          disabled={proState.allTools.next_page === "" ? true : false}
        >
          Next
        </Button>
      </Grid>
    </>
  );
};

export default Table;
