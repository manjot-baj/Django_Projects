import axiosInstance from "@/AxiosExtend"
import { downloadFileReusable } from "../utils/Utils";
import { startLoading, stopLoading } from "./UIActions";
let json = {};

export const searchStocksDispatch = () => async (dispatch,getState) => {
  const location = await getState().user.location;
  const site = await getState().user.site;
  const body = await getState().stocksAndAllotmentSearch;
  dispatch(startLoading())

  dispatch({
    type: "RESET_STOCK_ALLOTMENT_SEARCH_RESULT",
  });
  dispatch({ type: "START_LOADING" });
  return axiosInstance
    .post(`/depot/stock/`, {...body,location,site})
    .then((res) => {
      if (res.data.errorMsg) {
        alert(res.data.errorMsg);
      } else {
        dispatch({ type: "STOP_LOADING" });
        dispatch({
          type: "STOCK_ALLOTMENT_SEARCH_RESULT",
          payload: res.data.data,
        });
        dispatch({
          type: "STOCK_ALLOTMENT_NEXT_PAGE_LINK",
          payload: res.data.next_page,
        });
        dispatch({
          type: "STOCK_ALLOTMENT_PREV_PAGE_LINK",
          payload: res.data.prev_page,
        });
        dispatch({
          type: "STOCK_ALLOTMENT_TOTAL_PAGE_LINK",
          payload: res.data.total_pages,
        });

        // clearing the booking section details if any in the reducer
        if (res.data.data.length < 1) {
          dispatch({ type: "CLEANUP_STOCKS_ALLOTMENT_BOOKING_DETAILS" });
        }
      }
    })
    .catch((err) => {
      dispatch({ type: "STOP_LOADING" });
      console.log("error is", err);
    }).finally(()=>{
      dispatch(stopLoading())
    })
};

export const editStocksRowValues =
  (pk, body, allotmentSearchBody, alert,handleSealNumberChangeCloseModal) => async (dispatch) => {
    dispatch(startLoading())
    try {
      const res = await axiosInstance.put(`/depot/stock/${pk}/`, body);
     
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      }

      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
      if (handleSealNumberChangeCloseModal) {
        handleSealNumberChangeCloseModal()
      }
      dispatch(searchStocksDispatch(allotmentSearchBody));
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }finally{
      dispatch(stopLoading())
    }
  };

export const getSealNoListForStock = (pk) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `/master/get_available_seal_no_list/${pk}/`
    );

    if (res.data) {
      dispatch({
        type: "SET_ALLOTMENT_SEAL_NUMBER_LISTING",
        payload: res.data,
      });
    }
    if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const allotStocksDispatch =
  (body, alert, history,setDisableSave) => async (dispatch) => {
    if (setDisableSave) {
      setDisableSave(true)
    }
    try {
      const res = await axiosInstance.post(`/depot/allotment/`, body);
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        history.push("/depot");
        window.close();
        if (window.opener && !window.opener.closed) {
          window.opener.location.reload();
        }
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      console.log(err);
    }finally{
      if (setDisableSave) {
      setDisableSave(false)
    }
    }
  };


  export const allotStocksUpdateDispatch =
  (pk,body, alert, history,setDisableSave) => async (dispatch) => {
    if (setDisableSave) {
      setDisableSave(true)
    }
    try {
      const res = await axiosInstance.post(`/depot/update_allotment/${pk}/`, {...body,pk:pk});
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        history.push("/depot");
        window.close();
        if (window.opener && !window.opener.closed) {
          window.opener.location.reload();
        }
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      console.log(err);
    }finally{
       if (setDisableSave) {
      setDisableSave(false)
    }
    }
  };

export const bookingNumberSearchDispatch =
  (body, notify,setEdit,setBookingNumber,bkNum) => async (dispatch, getState) => {
    const containers = await getState().stocksAllotment.container_list;
    return axiosInstance
      .post(`/depot/search_booking_no/`, body)
      .then((res) => {
        if (!res.data.errorMsg) {
          setEdit(true)
          dispatch({
            type: "GET_STOCKS_ALLOTMENT_BOOKING_NUMBER",
            payload: res.data,
          });

          if (bkNum) {
            var bookingContainersList = [...res.data.container_list];
            if (containers.length > 0) {
              containers.map((bk) => {
                if (!bookingContainersList.includes(bk))
                  bookingContainersList.push(bk);
              });
            }
            dispatch({
              type: "SET_SELECTED_BOOKING_NUMBER",
              payload: res.data,
            });
            dispatch({
              type: "UPDATE_ALLOTMENT_BOOKING_DETAILS",
              payload: {
                pk: res.data.pk,
                booking_date: res.data.booking_date,
                validity_date: res.data.validity_date,
                booking_no: res.data.booking_no,
                booking_party: res.data.booking_party,
                quantity: res.data.quantity,
                remaining: res.data.remaining,
                container_list: bookingContainersList,
                remarks: res.data.remarks,
                containersList:res.data.container_list
              },
            });
            dispatch({ type: "REMOVE_STOCKS_SELECTED_BK_NUMBER", payload: "" });
          }
        }else{
            setEdit(false)
            if (setBookingNumber) {
              setBookingNumber(body.booking_no)
              dispatch({type:"SET_ALLOTMENT_BOOKING_NUMBER",payload:body.booking_no})
            }
           
            notify("No Booking number found. Please create new Booking",{variant:"info"})
           
        }
      })
      .catch((err) => {
        alert(err, {
          variant: "error",
        });
      });
  };


  export const bookingNumberFetchDispatch =
  (body, notify,setBookingParty,setAllotQuantity,setValidityDate,setRemarks,setContainers,setBalance,setPk) => async (dispatch, getState) => {
   
    return axiosInstance
      .post(`/depot/search_booking_no/`, body)
      .then((res) => {
        if (!res.data.errorMsg) {
          setBookingParty(res.data.booking_party)
          setAllotQuantity(res.data.quantity)
          setValidityDate(res.data.validity_date)
          setRemarks(res.data.remarks)
          setContainers(res.data.container_list)
          setBalance(res.data.remaining)
          setPk(res.data.pk)
        }
      })
      .catch((err) => {
        alert(err, {
          variant: "error",
        });
      });
  };

export const removeAllotmentDispatch = (body, alert) => async (dispatch,getState) => {
  const stocksAndAllotmentSearch =await getState().stocksAndAllotmentSearch
  try {
    const res = await axiosInstance.post("/depot/remove_allotment/", body);
    if (res.data.successMsg) {
      alert("Container removed from allotment", { variant: "success" });
      dispatch(searchStocksDispatch(stocksAndAllotmentSearch));
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};

export const editStocksBookingDetailsDispatch =
  (pk, body, alert, history,setDisableSave) => async () => {
    if (setDisableSave) {
      setDisableSave(true)
    }
    try {
      const res = await axiosInstance.post(
        `/depot/update_allotment/${pk}/`,
        body
      );
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
        history.push("/depot");
        window.close();
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }
    } catch (err) {
      console.log(err);
    }finally{
      if (setDisableSave) {
        setDisableSave(false)
      }
    }
  };

export const addRemoveContainerQueue = (body, alert) => async () => {
  try {
    const res = await axiosInstance.post("/depot/add_remove_from_queue/", body);
    console.log(res);
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
      window.location.reload();
    }
  } catch (err) {
    alert(err, {
      variant: "error",
    });
  }
};


export const getStockStatementExcel =
  (data, alert) => async () => {
    const url = "depot/stock_sheet_download/";
    try {
      const res = await axiosInstance.post(url, data, {
        responseType: "arraybuffer",
      });
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      } else {
        downloadReceiptsExcel(res.data, "stock-sheet");
        alert("Stock Sheet has been downloaded", { variant: "success" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };


  export const getUSAApprovedContainersExcel =
  ( alert) => async (dispatch ,getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const url = "depot/usa_approved_containers/";
    try {
      const res = await axiosInstance.post(url, {location,site}, {
        responseType: "arraybuffer",
      });
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      } else {
        downloadReceiptsExcel(res.data, "USA-approved-containers-sheet");
        alert("USA Approved Containers Sheet has been downloaded", { variant: "success" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };


  export const getZIMRepairEDIAction =
  (pk_list, alert) => async () => {
    const url = "edi/zim_repair_edi/";
    try {
      const res = await axiosInstance.post(url, {pk_list:pk_list}, {
        responseType: "arraybuffer",
      });
      console.log(res.headers)
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      }else if (res.headers?.['content-type']==="application/json"){
         alert("Only Zim line containers are allowed",{variant:"error"});
      } else {
        downloadFileReusable(res.data, "ZIM Repair EDI.txt");
        alert("ZIM Repair has been downloaded", { variant: "success" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }
  };

  export const getMNRStatementExcel =
  (data, alert) => async (dispatch) => {
    dispatch(startLoading())
    const url = "non_depot/stock_sheet_download/";
    try {
      const res = await axiosInstance.post(url, data, {
        responseType: "arraybuffer",
      });
      if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "error" });
      } else {
        downloadReceiptsExcel(res.data, "mnr-sheet");
        alert("MNR Non Depot Stock Sheet has been downloaded", { variant: "success" });
      }
    } catch (err) {
      alert(err, {
        variant: "error",
      });
    }finally{
      dispatch(stopLoading())
    }
};

export const downloadReceiptsExcel = (arrayBuffer, FileName) => {
  let blob = new Blob([arrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
