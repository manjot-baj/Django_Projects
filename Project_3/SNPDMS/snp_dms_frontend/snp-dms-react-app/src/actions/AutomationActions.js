import { axiosInstance } from "../Axios";
import { notify } from "./NotiActions";
export const newAutomationBookingNumber = (body, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `automation/new_booking_no_entry/`,
      body
    );
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    console.log(err);
  }
};

export const bookingNumberSearchDispatchAutomation =
  (body, alert, bkNum) => async (dispatch, getState) => {
    const containers = await getState().AutomationAllotment.container_list;
    try {
      const res = await axiosInstance.post(
        `/automation/check_booking_no/`,
        body
      );
      if (res.data.successMsg) {
        dispatch({
          type: "GET_AUTOMATION_BOOKING_SEARCH_RESULTS",
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
        }
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      console.log(err);
    }
  };

export const existingAutomationBookingNumber =
  (body, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/automation/container_allotment/`,
        body
      );
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      console.log(err);
    }
  };

export const getSearchListContainers =
  (body, setDropdown, setData, setLoading, alert) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    setLoading(true);
    try {
      const res = await axiosInstance.post(
        `/automation/get_container_details/`,
        {
          location,
          site,
          ...body,
        }
      );
      if (res.data?.data.length > 0) {
        setDropdown(true);
        setLoading(false);
        setData(res.data.data);
      } else {
        setLoading(false);
        alert("No Container Found ", { variant: "warning" });
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

export const downloadAutomationContainerAction =
  (body, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/automation/download_lolo_receipt/`,
        body,
        { responseType: "blob" }
      );
      const a = document.createElement("a");
      a.href = window.URL.createObjectURL(res.data);
      a.download = `LOLO Reciept.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      alert("File downloaded succesfully ", { variant: "success" });
    } catch (err) {
      alert("Unable to download File, try again ", { variant: "error" });
      console.log(err);
    }
  };

export const downloadAutomationGatePassAction =
  (body, process, alert) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    if (process === "IN") {
     
      try {
        const res = await axiosInstance.post(
          `/depot/gate_in_pass/${body}/`,
          { location, site },
          { responseType: "blob" }
        );

        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(res?.data);
        a.download = `Gate Pass.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("File downloaded succesfully ", { variant: "success" });
      } catch (err) {
        alert("Unable to download File, try again ", { variant: "error" });
        console.log(err);
      }
    } else {
      try {
        const res = await axiosInstance.post(
          `/depot/gate_out_pass/${body}/`,
          { location, site },
          { responseType: "blob" }
        );

        const a = document.createElement("a");
        a.href = window.URL.createObjectURL(res?.data);
        a.download = `Gate Pass.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("File downloaded succesfully ", { variant: "success" });
      } catch (err) {
        alert("Unable to download File, try again ", { variant: "error" });
        console.log(err);
      }
    }
  };

export const masterAutomation = (body, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `/automation/master_dependency_check/`,
      body
    );
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    console.log(err);
  }
};

export const automationContainerDetails = (body, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `/automation/corrupted_in_out_container_delete/`,
      body
    );
    if (res.data.successMsg) {
      alert(res.data.successMsg, { variant: "success" });
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "warning" });
    }
  } catch (err) {
    console.log(err);
  }
};

export const automationNonDepotContainerDetails =
  (body, alert) => async (dispatch) => {
    try {
      const res = await axiosInstance.post(
        `/automation/non_depot_container_delete/`,
        body
      );
      if (res.data.successMsg) {
        alert(res.data.successMsg, { variant: "success" });
      } else if (res.data.errorMsg) {
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      console.log(err);
    }
  };
  

  export const automationInfoAction = (body, setLoading,setData, alert) => async (dispatch) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post(
        `/automation/container_info/`,
        body
      );
      if (res.data) {
        setData(res.data)
        setLoading(false);
        alert(res.data.length >0 ?"Container Data loaded succesfully":"No Cotainer Found", { variant:res.data.length >0  ? "success" :"warning"});
      } else if (res.data.errorMsg) {
        setLoading(false);
        alert(res.data.errorMsg, { variant: "warning" });
      }
    } catch (err) {
      console.log(err);
    }
  };
  
