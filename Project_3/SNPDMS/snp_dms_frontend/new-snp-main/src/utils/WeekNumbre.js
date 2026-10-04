import { cacheCleanDataDispatch } from "../actions/GateInActions";

export function getDateWeek(date) {
  const currentDate = typeof date === "object" ? date : new Date();
  const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
  const daysToNextMonday =
    januaryFirst.getDay() === 1 ? 0 : (7 - januaryFirst.getDay()) % 7;
  const nextMonday = new Date(
    currentDate.getFullYear(),
    0,
    januaryFirst.getDate() + daysToNextMonday
  );

  return currentDate < nextMonday
    ? 52
    : currentDate > nextMonday
    ? Math.ceil((currentDate - nextMonday) / (24 * 3600 * 1000) / 7)
    : 1;
}

export function cacheCleanService(setCacheLoader, notify, dispatch) {
  dispatch(cacheCleanDataDispatch(setCacheLoader, notify));
}
export const handleDateChangeUTILS = (date, setValue) => {
  var selectedDate = new Date(date);
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
  setValue(selectedDateFormat);
};

export const handleDateCurrentUTILS = () => {
  var selectedDateNew = new Date();
  var selectedDate = new Date(selectedDateNew)
  selectedDate.setDate(selectedDate.getDate() + 1)
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth()+1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
  return selectedDateFormat;
};


export const getCurrentDateUTILS = () => {
  var selectedDateNew = new Date();
  var selectedDate = new Date(selectedDateNew)
  selectedDate.setDate(selectedDate.getDate())
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth()+1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
  return selectedDateFormat;
};

export const handleTimeCurentUTILS = () => {
  let now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  return `${hours}:${minutes}`
};
export const handleDateChangeUTILSFlex = (date, setValue, name) => {
  var selectedDate = new Date(date);
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
  setValue((val) => ({ ...val, [name]: selectedDateFormat }));
};

export const handleDateChangeUTILSDispatch = (
  date,
  dispatch,
  dispatchType,
  name
) => {
  var selectedDate = new Date(date);
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
  dispatch({ type: dispatchType, payload: { [name]: selectedDateFormat } });
};


export const handleGetCurrentDateUtils = () => {
  var selectedDate = new Date();
  var dd = String(selectedDate.getDate()).padStart(2, "0");
  var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
  var yyyy = selectedDate.getFullYear();
  var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
  return selectedDateFormat
};



  export const handleGetCurrentDateCreditNoteUtils = () => {
    var selectedDate = new Date();
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = dd + "/" + mm + "/" + yyyy;
    return selectedDateFormat
  };



  export const handleDateChangeUTILSBillingDispatch = (date, dispatch,dispatchType,name) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = yyyy + "-" + mm + "-" + dd;
    dispatch({type: dispatchType, payload: selectedDateFormat});
  };



  export const handleDateChangeUTILSCreditNoteDispatch = (date, dispatch,dispatchType,name) => {
    var selectedDate = new Date(date);
    var dd = String(selectedDate.getDate()).padStart(2, "0");
    var mm = String(selectedDate.getMonth() + 1).padStart(2, "0"); //
    var yyyy = selectedDate.getFullYear();
    var selectedDateFormat = dd + "/" + mm + "/" + yyyy;
    dispatch({type: dispatchType, payload: selectedDateFormat});
  };
