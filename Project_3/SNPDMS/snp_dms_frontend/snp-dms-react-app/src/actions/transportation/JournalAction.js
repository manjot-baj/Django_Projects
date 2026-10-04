import { axiosInstance } from "../../Axios";
let tempJson = {};

export const getJournalListing = (data, currentPage) => async (dispatch) => {
  try {
    const res = await axiosInstance.post(
      `transportation/get_all_journal_voucher/`,
      data
    );
    dispatch({ type: "GET_ALL_JOURNALS", payload: res.data.data });
  } catch (err) {
    console.log(err);
  }
};
export const addJournal = (data, history, alert) => async (dispatch) => {
  console.log("data", data);
  try {
    const res = await axiosInstance.post(`transportation/add_journal_voucher/`, data);
    if (res.data.successMsg) {
      alert("Journal added successfully", { variant: "success" });
      history.push("/voucher/journalvoucher");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "ADD_JOURNAL", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const updateJournal= (data, history, alert) => async (dispatch) => {
  try {
    const res = await axiosInstance.delete(
      `transportation/get_all_journal_voucher/delete/${data}/`,
      data
    );
    if (res.data.successMsg) {
      alert("Journal Deleted successfully", { variant: "success" });
      history.push("/voucher/journalvoucher");
    } else if (res.data.errorMsg) {
      alert(res.data.errorMsg, { variant: "error" });
    }
    dispatch({ type: "UPDATE_JOURNAL", payload: res.data.successMsg });
  } catch (err) {
    console.log(err);
  }
};
export const getJournalDetailsById = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.get(
      `transportation/get_all_journal_voucher/${id}/`
    );
    dispatch({ type: "GET_JOURNAL", payload: res.data });
  } catch (err) {
    console.log(err);
  }
};
export const clearJournalData = () => async (dispatch) => {
  try {
    dispatch({ type: "CLEAR_JOURNAL_DATA", payload: true });
  } catch (err) {
    console.log(err);
  }
};
