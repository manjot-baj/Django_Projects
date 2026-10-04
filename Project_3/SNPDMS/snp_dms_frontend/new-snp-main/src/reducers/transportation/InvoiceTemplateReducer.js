const initialState = {
  invoiceTemplateData: {
    comapny_name: "GH",
    company_address: "demo",
    gst_no: "2222222222",
    pan_no: "34242422442",
    state: "Tamilnadu",
    state_code: "33",
    invoice_no: "GHS/22-23/000001",
    date: "2022-12-28",
    total_amount_without_tax: "80000.00",
    total_amount: "94400.00",
    amount_in_words: "NINETY-FOUR THOUSAND, FOUR HUNDRED",
    line: [
      {
        particular:
          "Transportation Service - By Road, LR No : 1, LR Date: 2022-11-23, Truck No: WB-15-Y-4584,From :Kolkata, To:Mumbai Container No: TNSJI4552, Advance: 15000.00",
        sac_code: "996791",
        taxable_amount: "30000.0",
        tax_rate: "18",
        cgst_amount: "0.00",
        sgst_amount: "0.00",
        igst_amount: "5400.00",
        total: "35400.00",
      },
      {
        particular:
          "Other goods transport services, LR No : 1, LR Date: 2022-11-23, Truck No: WB-15-Y-4584,From :Kolkata, To:Mumbai Container No: TNSJI4552, Advance: 15000.00",
        sac_code: "996793",
        taxable_amount: "30000.0",
        tax_rate: "18",
        cgst_amount: "0.00",
        sgst_amount: "0.00",
        igst_amount: "5400.00",
        total: "35400.00",
      },
      {
        particular:
          "Transportation Service - By Road, LR No : 2, LR Date: 2022-12-25, Truck No: WB-15-Y-4584,From :Kolkata, To:Hawrah Container No: TNSJI4556, Advance: 5000.00",
        sac_code: "996791",
        taxable_amount: "10000.0",
        tax_rate: "18",
        cgst_amount: "0.00",
        sgst_amount: "0.00",
        igst_amount: "1800.00",
        total: "11800.00",
      },
      {
        particular:
          "Other goods transport services, LR No : 2, LR Date: 2022-12-25, Truck No: WB-15-Y-4584,From :Kolkata, To:Hawrah Container No: TNSJI4556, Advance: 5000.00",
        sac_code: "996793",
        taxable_amount: "10000.0",
        tax_rate: "18",
        cgst_amount: "0.00",
        sgst_amount: "0.00",
        igst_amount: "1800.00",
        total: "11800.00",
      },
    ],
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_INVOICE_LR_TEMPLATE_DATA":
      return { ...state, invoiceTemplateData: action.payload };

    default:
      return { ...state };
  }
};
