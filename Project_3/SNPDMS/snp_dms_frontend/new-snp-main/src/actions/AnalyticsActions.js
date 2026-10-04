import axiosInstance from "@/AxiosExtend"

// FIRST SCREEN
export const getAnalyticsListings = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get(`analytics/first_screen_dashboard/`);
    console.log("Analytics Response", res.data);
    dispatch({ type: "GET_ALL_ANALYTICS", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};

export const getQuarterlyLoLoSTVolumeRevenueData =
  (body, process, movement, week, from_date, to_date, line) =>
  async (dispatch) => {
    let req = {
      requirement: body,
      process: process,
      movement: movement,
      from_date: from_date,
      to_date: to_date,
      line: line,
    };
    axiosInstance
      .post("analytics/first_screen_quaterly_lolo_st_volume_revenue/", req)
      .then((res) => {
        if (process === "lolo") {
          if (movement === "IN") {
            dispatch({
              type: "SET_QUARTERLY_LOLO_IN_VOLUME_REVENUE",
              payload: res.data,
            });
          } else {
            dispatch({
              type: "SET_QUARTERLY_LOLO_OUT_VOLUME_REVENUE",
              payload: res.data,
            });
          }
        } else {
          if (movement === "IN") {
            dispatch({
              type: "SET_QUARTERLY_ST_IN_VOLUME_REVENUE",
              payload: res.data,
            });
          } else {
            dispatch({
              type: "SET_QUARTERLY_ST_OUT_VOLUME_REVENUE",
              payload: res.data,
            });
          }
        }
      })
      .catch((err) => {
        console.log("Analytics Quarterly Lolo/St Error !", err);
      });
  };

export const getQuarterlyMNRVolumeRevenueData =
  (body, process, movement, week, from_date, to_date, line) =>
  async (dispatch) => {
    let req = {
      requirement: body,
      from_date: from_date,
      to_date: to_date,
      line: line,
    };
    axiosInstance
      .post("analytics/first_screen_quaterly_mnr_volume_revenue/", req)
      .then((res) => {
        dispatch({
          type: "SET_QUARTERLY_MNR_VOLUME_REVENUE",
          payload: res.data,
        });
      })
      .catch((err) => {
        console.log("Analytics Quarterly MNR Error !", err);
      });
  };

export const getWeeklyLoLoSTVolumeRevenueData =
  (year, process, movement, weekNo, from_date, to_date, lineType) =>
  async (dispatch) => {
    let req = {
      year: year,
      week_num: weekNo,
      process: process,
      movement: movement,
      line: lineType,
    };
    axiosInstance
      .post("analytics/first_screen_weekly_lolo_st_volume_revenue/", req)
      .then((res) => {
        if (process === "lolo") {
          if (movement === "IN") {
            dispatch({
              type: "SET_WEEKLY_LOLO_IN_VOLUME_REVENUE",
              payload: res.data,
            });
          } else {
            dispatch({
              type: "SET_WEEKLY_LOLO_OUT_VOLUME_REVENUE",
              payload: res.data,
            });
          }
        } else {
          if (movement === "IN") {
            dispatch({
              type: "SET_WEEKLY_ST_IN_VOLUME_REVENUE",
              payload: res.data,
            });
          } else {
            dispatch({
              type: "SET_WEEKLY_ST_OUT_VOLUME_REVENUE",
              payload: res.data,
            });
          }
        }
      })
      .catch((err) => {
        console.log("Analytics Weekly Lolo/St Error !", err);
      });
  };

export const getWeeklyMNRVolumeRevenueData =
  (year, process, movement, weekNo, from_date, to_date, line) =>
  async (dispatch) => {
    let req = {
      year: year,
      week_num: weekNo,
      line: line,
    };
    axiosInstance
      .post("analytics/first_screen_weekly_mnr_volume_revenue/", req)
      .then((res) => {
        dispatch({
          type: "SET_WEEKLY_MNR_VOLUME_REVENUE",
          payload: res.data,
        });
      })
      .catch((err) => {
        console.log("Analytics Weekly MNR Error !", err);
      });
  };

// SECOND SCREEN
export const handlingVolumeRevenueListings =
  () => async (dispatch, getState) => {
    try {
      const location = await getState().user.location;
      const site = await getState().user.site;
      const res = await axiosInstance.post(
        `analytics/second_screen_dashboard/`,
        {
          location: location,
          site: site,
        }
      );
      console.log("Handling Volume Revenue Response", res.data);
      dispatch({ type: "GET_ALL_HANDLING_VOLUME_REVENUE", payload: res.data });
    } catch (err) {
      console.log(err);
    }
  };

export const getHandlingWeeklyVolumeRevenueData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      year: year,
      week_num: week,
      movement: movement,
      line: lineType,
    };
    axiosInstance
      .post("analytics/second_screen_weekly_lolo_volume_revenue/", req)
      .then((res) => {
        if (movement === "IN") {
          dispatch({
            type: "SET_WEEKLY_IN_HANDLING_VOLUME_REVENUE",
            payload: res.data,
          });
        } else {
          dispatch({
            type: "SET_WEEKLY_IN_HANDLING_VOLUME_REVENUE_OUT",
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        console.log("Analytics Handling Weekly Error !", err);
      });
  };

export const getHandlingQuarterlyVolumeRevenueData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      movement: movement,
      from_date: from_date,
      to_date: to_date,
      line: lineType,
    };
    axiosInstance
      .post("analytics/second_screen_quaterly_lolo_volume_revenue/", req)
      .then((res) => {
        if (movement === "IN") {
          dispatch({
            type: "SET_QUARTERLY_HANDLING_VOLUME_REVENUE",
            payload: res.data,
          });
        } else {
          dispatch({
            type: "SET_QUARTERLY_HANDLING_VOLUME_REVENUE_OUT",
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        console.log("Analytics Handling Weekly Error !", err);
      });
  };

export const getRepoClientData =
  (year, from_date, to_date, lineType) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const { repoMovement } = await getState().analytics;
    let req = {
      location: location,
      site: site,
      requirement: year,
      movement: repoMovement,
      from_date: from_date,
      to_date: to_date,
      line: lineType,
    };
    axiosInstance
      .post("analytics/repo_movement_dashboard/", req)
      .then((res) => {
        dispatch({
          type: "SET_REPO_CLIENT_DATA",
          payload: res.data,
        });
      })
      .catch((err) => {
        console.log("Analytics Handling Weekly Error !", err);
      });
  };
export const getHandlingTop5VolumeRevenueData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      movement: movement,
      from_date: from_date,
      to_date: to_date,
      line: lineType,
    };
    console.log("req", req);
    axiosInstance
      .post("analytics/second_screen_top_client_lolo_volume_revenue/", req)
      .then((res) => {
        if (movement === "IN") {
          dispatch({
            type: "SET_TOP_5_HANDLING_VOLUME_REVENUE",
            payload: {...res.data.data,cache:res.data.cache},
          });
        } else {
          dispatch({
            type: "SET_TOP_5_HANDLING_VOLUME_REVENUE_OUT",
            payload: {...res.data.data,cache:res.data.cache},
          });
        }
      })
      .catch((err) => {
        console.log("Analytics Handling Top 5 Error !", err);
      });
  };

export const getHandlingTop5ConsigneeData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      from_date: from_date,
      to_date: to_date,
      line: lineType,
    };

    axiosInstance
      .post("analytics/movement_top_consignee_shipper/", req)
      .then((res) => {
        dispatch({
          type: "SET_TOP_5_CONSIGNEE_DATA",
          payload:{ ...res.data.data,cache:res.data?.cache},
        });
      })
      .catch((err) => {
        console.log("Analytics Handling Top 5 Error !", err);
      });
  };

export const getHandlingTop5CargoData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      from_date: from_date,
      to_date: to_date,
      line: lineType,
    };

    axiosInstance
      .post("analytics/movement_top_cargo/", req)
      .then((res) => {
        dispatch({
          type: "SET_TOP_5_CARGO_DATA",
          payload: {...res.data.data,cache:res.data?.cache},
        });
      })
      .catch((err) => {
        console.log("Analytics Handling Top 5 Error !", err);
      });
  };

export const getHandlingTop5TransporteeData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      movement: movement,
      from_date: from_date,
      to_date: to_date,
      line: lineType,
    };

    axiosInstance
      .post("analytics/movement_top_transporter/", req)
      .then((res) => {
        if (movement === "IN") {
          dispatch({
            type: "SET_TOP_5_TRANSPORTER_DATA",
            payload: {...res.data.data,cache:res.data?.cache},
          });
        } else {
          dispatch({
            type: "SET_TOP_5_TRANSPORTER_DATA_OUT",
            payload: {...res.data.data,cache:res.data?.cache},
          });
        }
      })
      .catch((err) => {
        console.log("Analytics Handling Top 5 Error !", err);
      });
  };

// THIRD SCREEN
export const selfTransportationVolumeRevenueListings =
  () => async (dispatch, getState) => {
    try {
      const location = await getState().user.location;
      const site = await getState().user.site;
      const res = await axiosInstance.post(
        `analytics/third_screen_dashboard/`,
        {
          location: location,
          site: site,
        }
      );
      console.log("ST Volume Revenue Response", res.data);
      dispatch({ type: "GET_ALL_ST_VOLUME_REVENUE", payload: res.data });
    } catch (err) {
      console.log(err);
    }
  };

export const getSTWeeklyVolumeRevenueData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      year: year,
      week_num: week,
      movement: movement,
      line: lineType,
    };
    axiosInstance
      .post("analytics/third_screen_weekly_st_volume_revenue/", req)
      .then((res) => {
        if (movement === "IN") {
          dispatch({
            type: "SET_WEEKLY_IN_ST_VOLUME_REVENUE",
            payload: res.data,
          });
        } else {
          dispatch({
            type: "SET_WEEKLY_OUT_ST_VOLUME_REVENUE",
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        console.log("Analytics ST Weekly Error !", err);
      });
  };

export const getSTQuarterlyVolumeRevenueData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      movement: movement,
      from_date: from_date,
      to_date: to_date,
      line: lineType,
    };
    axiosInstance
      .post("analytics/third_screen_quaterly_st_volume_revenue/", req)
      .then((res) => {
        dispatch({
          type: "SET_QUARTERLY_ST_VOLUME_REVENUE",
          payload: res.data,
        });
      })
      .catch((err) => {
        console.log("Analytics ST Weekly Error !", err);
      });
  };

export const getSTTop5VolumeRevenueData =
  (year, week, movement, from_date, to_date, lineType) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      movement: movement,
      from_date,
      to_date,
      line: lineType,
    };
    axiosInstance
      .post("analytics/third_screen_top_client_st_volume_revenue/", req)
      .then((res) => {
       
        dispatch({
          type: "SET_TOP_5_ST_VOLUME_REVENUE",
          payload: {...res.data.data,cache:res.data.cache},
        });
      })
      .catch((err) => {
        console.log("Analytics ST Top 5 Error !", err);
      });
  };

// FOURTH SCREEN
export const getStockDataListings = (refCode) => async (dispatch, getState) => {
  try {
    const location = await getState().user.location;
    const site = await getState().user.site;
    const res = await axiosInstance.post(`analytics/fourth_screen_dashboard/`, {
      location: location,
      site: site,
      ref_code: refCode,
    });
    console.log("Stock Data Response", res.data);
    dispatch({ type: "GET_ALL_STOCK_DATA", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};

// FIFTH SCREEN
export const getMNRDataListings =
  (year, week, refCode, from_date, to_date, setLoader, loaderKey) => async (dispatch, getState) => {
    try {
      const location = await getState().user.location;
      const site = await getState().user.site;
      setLoader((prev) => ({ ...prev, [loaderKey]: true }));
      const res = await axiosInstance.post(
        `analytics/fifth_screen_dashboard/`,
        {
          location: location,
          site: site,
          requirement: year,
          from_date: from_date,
          to_date: to_date,
          ref_code: refCode,
        }
      );
      dispatch({ type: "GET_ALL_MNR_DATA", payload: res.data });
      setLoader((prev) => ({ ...prev, [loaderKey]: false }));
    } catch (err) {
      console.log(err);
    }
  };

export const getMNRQuarterlyVolumeRevenueData =
  (year, week, refCode, from_date, to_date, setLoader, loaderKey) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      ref_code: refCode,
      from_date,
      to_date,
    };
    setLoader((prev) => ({ ...prev, [loaderKey]: true }));
    axiosInstance
      .post("analytics/fifth_screen_quaterly_mnr_volume_revenue/", req)
      .then((res) => {
        dispatch({
          type: "SET_ANALYTICS_QUARTERLY_MNR_VOLUME_REVENUE",
          payload: res.data,
        });
        setLoader((prev) => ({ ...prev, [loaderKey]: false }));
      })
      .catch((err) => {
        console.log("Analytics MNR Quarterly Error !", err);
      });
  };

export const getMNRWeeklyVolumeRevenueData =
  (year, week, refCode,from_date,to_date, setLoader, loaderKey) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      year: year,
      week_num: week,
      ref_code: refCode,
    };
    setLoader((prev) => ({ ...prev, [loaderKey]: true }));
    axiosInstance
      .post("analytics/fifth_screen_weekly_mnr_volume_revenue/", req)
      .then((res) => {
        dispatch({
          type: "SET_WEEKLY_IN_MNR_VOLUME_REVENUE",
          payload: res.data,
        });
        setLoader((prev) => ({ ...prev, [loaderKey]: false }));
      })
      .catch((err) => {
        console.log("Analytics ST Weekly Error !", err);
      });
  };

export const getMNRTotalData =
  (year, week, line, from_date, to_date, setLoader, loaderKey) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      from_date: from_date,
      line: line,
      to_date: to_date,
    };
    setLoader((prev) => ({ ...prev, [loaderKey]: true }));
    axiosInstance
      .post("analytics/total_mnr_data/", req)
      .then((res) => {
        dispatch({
          type: "SET_ALL_MNR_DATA",
          payload: res.data,
        });
        setLoader((prev) => ({ ...prev, [loaderKey]: false }));
      })
      .catch((err) => {
        console.log("Analytics ST Weekly Error !", err);
      });
  };

export const getMNRTop5VolumeRevenueData =
  (year, week, refCode, from_date, to_date, setLoader, loaderKey) =>
  async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      ref_code: refCode,
      from_date: from_date,
      to_date: to_date,
    };

    setLoader((prev) => ({ ...prev, [loaderKey]: true }));

    axiosInstance
      .post("analytics/fifth_screen_top_client_mnr_volume_revenue/", req)
      .then((res) => {
        dispatch({
          type: "SET_TOP_5_MNR_VOLUME_REVENUE",
          payload: {...res.data.data,cache:res.data.cache},
        });
        setLoader((prev) => ({ ...prev, [loaderKey]: false }));
      })
      .catch((err) => {
        console.log("Analytics MNR Top 5 Error !", err);
      });
  };

export const getMNRPartiallyApproved =
  (year, week, refCode, from_date, to_date, setLoader, loaderKey) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
      line: refCode,
      from_date: from_date,
      to_date: to_date,
    };
    setLoader((prev) => ({ ...prev, [loaderKey]: true }));
    axiosInstance
      .post("analytics/top_client_partially_approved/", req)
      .then((res) => {
        dispatch({
          type: "SET_TOP_5_MNR_PARTIALLY_APPROVED",
          payload:{ ...res.data.data,cache:res.data.cache},
        });
        setLoader((prev) => ({ ...prev, [loaderKey]: false }));
      })
      .catch((err) => {
        console.log("Analytics MNR Top 5 Error !", err);
      });
  };

export const getMNRMaterial =
  (year, week, movement) => async (dispatch, getState) => {
    const location = await getState().user.location;
    const site = await getState().user.site;
    let req = {
      location: location,
      site: site,
      requirement: year,
    };
    axiosInstance
      .post("analytics/mnr_material_dashboard/", req)
      .then((res) => {
        console.log("res.data", res.data);
        dispatch({
          type: "GET_ALL_MNR_MATERIAL",
          payload: res.data.data,
        });
        dispatch({
          type: "SET_MNR_MATERIAL_FROM_DATE",
          payload: res.data.from_date,
        });
        dispatch({
          type: "SET_MNR_MATERIAL_TO_DATE",
          payload: res.data.to_date,
        });
      })
      .catch((err) => {
        console.log("Analytics MNR Material Error !", err);
      });
  };
