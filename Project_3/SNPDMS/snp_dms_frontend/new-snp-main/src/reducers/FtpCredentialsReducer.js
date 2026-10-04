export const EDI_FTP_CRED_CONST = {
  LIST_EDI_FTP_CRED: "LIST_EDI_FTP_CRED",
  LIST_EDI_FTP_ENABLED_SITES: "LIST_EDI_FTP_ENABLED_SITES",
  SINGLE_EDI_FTP_CRED:"SINGLE_EDI_FTP_CRED"
};

const initialState = {
  ediFtpCredListing: null,
  ftpEnabledsiteList: null,
  ediFtpSingleCred:null,

};

export default (state = initialState, action) => {
  switch (action.type) {
    case EDI_FTP_CRED_CONST.SINGLE_EDI_FTP_CRED:
      return {...state,ediFtpSingleCred:action.payload}
    case EDI_FTP_CRED_CONST.LIST_EDI_FTP_ENABLED_SITES:
      return {
        ...state,
        ftpEnabledsiteList: action.payload,
      };
    case EDI_FTP_CRED_CONST.LIST_EDI_FTP_CRED:
      return {
        ...state,
        ediFtpCredListing: action.payload,
      };
    default:
      return { ...state };
  }
};
