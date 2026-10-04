export const monthArray =["January","February","March","April","May","June","July","August","September","October","November","December"]

Date.shortMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"]

// Define a JavaScript function called short_months with parameter dt (date)
export  function short_months(dt)
{ 
  // Return the short month name corresponding to the month of the provided date
  return Date.shortMonths[dt.getMonth()]; 
}

function validateContainerNumber(containerNumber) {
  var re = /^[A-Z]{4}\d{7}$/;
  return re.test(containerNumber);
}

const numberExpression = /^\d+$/;


export const handleContainerNumberChangeUtils = (event,containerNumber,dispatch,dispatchType,name,notify) => {
  if (containerNumber === "" && !validateContainerNumber(containerNumber))
    notify(
      "Please Enter 4 Uppercase and 7 digit combination for Container Number.",
      {
        variant: "warning",
      }
    );
  if (event.target.value.length > 11) {
    notify(
      "Please enter the valid 11 digit combination(4 Uppercase & 7 Number)",
      { variant: "warning" }
    );
    return;
  }
  if (numberExpression.test(event?.target?.value[4])) {
    dispatch({type:dispatchType,payload:{[name]:event?.target?.value}})
    // setContainerNumber(event?.target?.value);
  } else {
    if (event?.target?.value?.length < 5) {
      dispatch({type:dispatchType,payload:{[name]:event?.target?.value}})
      // setContainerNumber(event?.target?.value);
    } else {
      notify(
        "Please enter the valid 11 digit combination(4 Uppercase & 7 Number)",
        { variant: "warning" }
      );
    }
  }
};

export const handleContainerNumberChangeByUseStateUtils = (event,containerNumber,setContainerNumber,notify) => {
  if (containerNumber === "" && !validateContainerNumber(containerNumber))
    notify(
      "Please Enter 4 Uppercase and 7 digit combination for Container Number.",
      {
        variant: "warning",
      }
    );
  if (event.target.value.length > 11) {
    notify(
      "Please enter the valid 11 digit combination(4 Uppercase & 7 Number)",
      { variant: "warning" }
    );
    return;
  }
  if (numberExpression.test(event?.target?.value[4])) {
   
    setContainerNumber(event?.target?.value);
  } else {
    if (event?.target?.value?.length < 5) {
     
      setContainerNumber(event?.target?.value);
    } else {
      notify(
        "Please enter the valid 11 digit combination(4 Uppercase & 7 Number)",
        { variant: "warning" }
      );
    }
  }
};

export const handleContainerNumberOnBlurUtils = (event,notify,dispatch,dispatchType,name) => {
  let first = event.target.value.slice(0, 4);
  let second = event.target.value.slice(4, 11);
  if (/^[A-Z]+$/.test(first) === false) {
    notify("First 4 alphabets should be uppercase.", {
      variant: "warning",
    });
    dispatch({type:dispatchType,payload:{[name]:""}})
    // setContainerNumber("");
    return;
  }
  if (/^\d+$/.test(second) === false) {
    notify("Select 7 combination of digits.", {
      variant: "warning",
    });
    dispatch({type:dispatchType,payload:{[name]:""}})
    // setContainerNumber("");
    return;
  }
  dispatch({type:dispatchType,payload:{[name]:event?.target?.value}})
  // dispatch(
  //   containerValidatorDispatch(
  //     {
  //       container_no: event.target.value,
  //       location: localStorage.getItem("location")
  //         ? localStorage.getItem("location")
  //         : "",
  //     },
  //     gateInEdit.selectedContainer.container_data.container_no,
  //     notify
  //   )
  // );
  // dispatch({ type: "SET_GATE_IN_DATE_TIME" });
};
export const downloadFileReusable = (arrayBuffer, FileName,type) => {
  let blob = new Blob([arrayBuffer], { type: type });
  let link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = FileName;
  link.click();
};
