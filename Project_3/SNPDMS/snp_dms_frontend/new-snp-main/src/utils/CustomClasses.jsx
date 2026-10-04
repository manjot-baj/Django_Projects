export const custombackDropStyle = (theme) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: "#fff",
});

export const titleTypography = (theme) => ({
  color: "#9199A1",
  fontWeight: 600,
});

export const customMonthSelectButton = (theme) => ({
  color: "#9199A1",
  fontWeight: 600,
});

export const customLabelTypography = (theme) => ({
  fontSize: 14,
  fontWeight: 600,
  color: "#243545",
  paddingBottom: 0.2,
  [theme.breakpoints.down("sm")]: {
    paddingBottom: 1,
  },
});

export const basicAPIUtilAction =
  (with_gst, client, notify) => async (dispatch, getState) => {
    const { location, site } = await getState().user;
    try {
      dispatch(startLoading());
      const res = await axiosInstance.put("depot/update_client_fin_account/", {
        with_gst: with_gst,
        client: client,
        location,
        site,
      });
      if (res.data) {
        if (res.data.errorMsg) {
          notify(res.data.errorMsg, { variant: "error" });
        }
        if (res.data.success) {
          notify(res.data.success, { variant: "success" });
          dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
        } else {
          dispatch(getLOLOFinanceCustomerAccountListingAction(notify));
        }
      }
    } catch (error) {
      if (error.response?.data?.errorMsg) {
        notify(error.response?.data?.errorMsg, { variant: "error" });
      }
    } finally {
      dispatch(stopLoading());
    }
  };
