const ENQUEUE_SNACKBAR = "ENQUEUE_SNACKBAR";
const CLOSE_SNACKBAR = "CLOSE_SNACKBAR";
const REMOVE_SNACKBAR = "REMOVE_SNACKBAR";

const enqueueSnackbar = (notification) => {
  const { key } = notification.options;

  return {
    type: ENQUEUE_SNACKBAR,
    notification: {
      ...notification,
      key: key || new Date().getTime() + Math.random(),
    },
  };
};

const closeSnackbar = (key) => ({
  type: CLOSE_SNACKBAR,
  dismissAll: !key,
  key,
});

const removeSnackbar = (key) => ({
  type: REMOVE_SNACKBAR,
  key,
});

const notify = (msg, variant, action) =>
  enqueueSnackbar({
    message: msg,
    options: {
      key: new Date().getTime() + Math.random(),
      variant,
      action,
    },
  });

export {
  ENQUEUE_SNACKBAR,
  CLOSE_SNACKBAR,
  REMOVE_SNACKBAR,
  enqueueSnackbar,
  closeSnackbar,
  removeSnackbar,
  notify,
};
