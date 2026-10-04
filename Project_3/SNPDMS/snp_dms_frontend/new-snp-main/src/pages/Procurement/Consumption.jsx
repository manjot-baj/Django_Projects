import React, { useEffect, useState } from "react";
import LayoutContainer from "@components/reusablecomponents/LayoutContainer";

import { Button, Grid, Typography, MenuItem, Box, Chip, Backdrop, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { Stack, useMediaQuery } from "@mui/material";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { getAllConsumeNew } from "../../actions/Procurement/consumptionAction";
import DatePickerField from "@components/reusablecomponents/DatePickerField";
import { REQ_REDUCER_CONSUME } from "../../reducers/procurement/consumptionReducer";
import { useHistory } from "react-router-dom";
import { Image } from "semantic-ui-react";
import CONSUMPTIONIMG from "@/assets/images/Procurement/Export.png";
import {
  TableCustomAdvanceReactTable,
  TableCustomPaginationReactTable,
  TableCustomSearchBar,
  TableFilterComponent,
  TableFootercontainer,
  TableHeading,
  TablePageTitle,
  TableRefreshIcon,
} from "@/components/TableComponent/TableComponent";
import { custombackDropStyle } from "@/utils/CustomClasses";

const Consumption = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { getConsumeAllNew } = useSelector((state) => state.ProcurementConsume);
    const { isloading } = useSelector((state) => state.ui);
  const notify = useSnackbar().enqueueSnackbar;
  const [advance, setAdvance] = useState({
    from_date: "",
    to_date: "",
    is_approved: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [disable, setDisable] = useState(1);
  const [searchSelect, setSearchSelect] = useState("name");
  const matchesIphone = useMediaQuery("(max-width:450px)");

  const handleAdvanceDateFrom = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;

    setAdvance((prev) => ({ ...prev, from_date: selectedDateFormat }));
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        from_date: selectedDateFormat,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  const handleAdvanceDateTo = (date) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    setAdvance((prev) => ({ ...prev, to_date: selectedDateFormat }));
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        to_date: selectedDateFormat,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  useEffect(() => {
    setCurrentPage(1);
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getAllConsumeNew(notify));
  }, []);

  const handleDeleteDateFilter = () => {
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        from_date: "",
        to_date: "",
      },
    });
    setAdvance(prev=>({...prev,from_date:"",to_date:""}))
    dispatch(getAllConsumeNew(notify));
  };

  const onRowClick = (state, rowInfo, column, instance) => {
    return {
      onClick: (e) => {
        history.push({
          pathname: "/procurement/consumption/add",
          state: { original: rowInfo.original },
        });
      },
      style: {
        cursor: "pointer",
      },
    };
  };

  const handleInitialPage = () => {
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        pg_no: 1,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  const handleOnPageDataChange = (value) => {
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        pg_no: 1,
        edit_on_page_data: value,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  const handlePaginationOnChange = (e, val) => {
    dispatch({
      type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
      payload: {
        pg_no: val,
      },
    });
    dispatch(getAllConsumeNew(notify));
  };

  return (
    <LayoutContainer footer={false}>
      <Box padding={matchesIphone ? 1 : 2}>
        <Stack
          direction={"row"}
          alignItems={"center"}
          justifyContent={"flex-start"}
          mb={6}
          spacing={2}
        >
          <Image
            src={CONSUMPTIONIMG}
            style={{
              height: 20,
              width: 20,
            }}
          />
          <TablePageTitle>Tool Consumption</TablePageTitle>
        </Stack>
        <Grid container spacing={2} mb={12}>
          <Grid
            item
            size={{ xs: 10, sm: 6, md: 6, lg: 6, xl: 6 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 2,
            }}
          >
            <TableCustomSearchBar
              maxWidthSearch={"70%"}
              selectName={`Search by ${
                searchSelect === "name"
                  ? "Item"
                  : searchSelect === "consumption_no"
                  ? "Consumption No"
                  : "Category"
              }`}
              updateSelectname={(e) => setSearchSelect(e.target.value)}
              searchText={getConsumeAllNew?.[searchSelect]}
              setSearchText={(e) => {
                dispatch({
                  type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
                  payload: {
                    [searchSelect]: e.target.value,
                  },
                });
              }}
              closeClick={() =>
                dispatch({
                  type: REQ_REDUCER_CONSUME.REQ_GET_CONSUMER_ALL_NEW,
                  payload: {
                    [searchSelect]: "",
                  },
                })
              }
              searchClick={() => dispatch(getAllConsumeNew(notify))}
            >
              <MenuItem value={"category"}>Category</MenuItem>
              <MenuItem value={"name"}>Item </MenuItem>
              <MenuItem value={"consumption_no"}>Consumption No</MenuItem>
            </TableCustomSearchBar>
            <TableFilterComponent
              title={`Date Filter  `}
              style={{ width: "fit-content" }}
              activeFilter={advance.from_date !== "" && advance.to_date !== ""}
            >
              <Stack
                direction={"row"}
                justifyContent={"center"}
                flexDirection={"row"}
                alignItems={"center"}
                marginBottom={"-20px"}
                marginTop={matchesIphone ? "24px" : "0"}
                
                spacing={4}
                mb={4}
              >
                <Stack direction={"column"} justifyContent={"flex-start"}>
                  <Typography variant="caption" style={{ fontWeight: "bold" }}>
                    From Date
                  </Typography>
                  <DatePickerField
                    dateId="iit-date"
                    dateValue={advance.from_date}
                    dateChange={handleAdvanceDateFrom}
                    // dispatchType={"LOADEDYARD_IIT_DATE"}
                  />
                </Stack>
                <Stack direction={"column"} justifyContent={"flex-start"}>
                  <Typography variant="caption" style={{ fontWeight: "bold" }}>
                    To Date
                  </Typography>
                  <DatePickerField
                    dateId="iit-date"
                    dateValue={advance.to_date}
                    dateChange={handleAdvanceDateTo}
                  />
                </Stack>
              </Stack>
            </TableFilterComponent>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {advance.from_date !== "" && advance.to_date !== "" && (
              <Chip
                variant="outlined"
                color="primary"
                size="small"
                onDelete={handleDeleteDateFilter}
                label={
                  advance.from_date !== "" && advance.to_date !== ""
                    ? ` ${advance.from_date}/${advance.to_date}`
                    : ""
                }
              />
            )}
            <TableRefreshIcon onClick={() => window.location.reload()} />
          </Grid>
          <Grid item size={{ xs: 12 }}>
            <TableCustomAdvanceReactTable
              data={getConsumeAllNew.data}
              minRows={Number(getConsumeAllNew.edit_on_page_data)}
              pageSize={Number(getConsumeAllNew.edit_on_page_data)}
              defaultPageSize={Number(getConsumeAllNew.edit_on_page_data)}
              getTrProps={onRowClick}
              columns={[
                {
                  Header: <TableHeading>Consumption No</TableHeading>,
                  accessor: "consumption_no",

                  style: {
                    textAlign: "center",
                    fontSize: "0.9rem",
                  },
                },
                {
                  Header: <TableHeading>Consumption Date</TableHeading>,
                  accessor: "date",

                  style: {
                    textAlign: "center",
                    fontSize: "0.9rem",
                  },
                },
              ]}
            />
            <TableCustomPaginationReactTable
              total_pages={getConsumeAllNew.total_pages}
              pg_no={getConsumeAllNew.pg_no}
              handlePaginationOnChange={handlePaginationOnChange}
              next_page={getConsumeAllNew.next_page}
              on_page_data={getConsumeAllNew.edit_on_page_data}
              handleInitialPage={handleInitialPage}
              handleOnPageDataChange={handleOnPageDataChange}
            />
          </Grid>
        </Grid>
        <TableFootercontainer>
          <Link
            to="/procurement/consumption/add"
            state={{ original: null }}
            style={{ flex: 0.5, marginTop: "10px" }}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="small"
              startIcon={<AddShoppingCartIcon />}
              sx={{ width: 240 }}
            >
              Consume
            </Button>
          </Link>
        </TableFootercontainer>
      </Box>
         <Backdrop sx={custombackDropStyle} open={isloading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </LayoutContainer>
  );
};

export default Consumption;
