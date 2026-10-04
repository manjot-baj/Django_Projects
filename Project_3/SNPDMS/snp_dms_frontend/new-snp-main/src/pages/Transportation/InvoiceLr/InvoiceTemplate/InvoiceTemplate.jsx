import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getInvoiceTemplate } from "../../../../actions/transportation/InvoiceTemplateAction";
import "./InvoiceTemplate.css";
const InvoiceLrTemplate = () => {
  const styles = {
    body: {
      margin: "60px 0px",
    },
    span: {
      fontWeight: "900",
      fontSize: "18px",
    },
    header_section1: {
      padding: "20px 20px 0px",
    },
    templateWrapper: {
      width: "80%",
      alignItems: "center",
      textAlign: "center",
      border: "3px solid #000",
      margin: "0 10%",
    },
    table: {
      border: "1px solid black",
      borderCollapse: "collapse",
      textTransform: "uppercase",
    },
    th: {
      border: "1px solid black",
      borderCollapse: "collapse",
      textTransform: "uppercase",
    },
    td: {
      border: "1px solid black",
      borderCollapse: "collapse",
      textTransform: "uppercase",
    },
    companyDetails: {
      display: "flex",
      justifyContent: "space-around",
    },
    stateDetails: {
      width: "50%",
      border: "1px solid #000",
    },
    invoiceDetails: {
      width: "50%",
      border: "1px solid #000",
    },
    com1: {
      width: "50%",
    },
    stateText: {
      borderBottom: "1px solid #000",
      borderLeft: "1px solid #000",
      height: "40px",
      marginTop: "-15px",
    },
  };
  const dispatch = useDispatch();
  const [invoicePrintData, setInvoicePrintData] = useState(null);
  const store = useSelector((state) => state);
  // eslint-disable-next-line no-unused-vars
  const { gateIn } = store;
  const invoiceTemplate = useSelector(
    (state) => state.invoiceTemplate.invoiceTemplateData
  );

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== undefined) {
      let reqBody = { copy: localStorage.getItem("code") };
      dispatch(getInvoiceTemplate(url[url?.length - 1], reqBody));
    }
 
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (invoiceTemplate) {
      setInvoicePrintData(invoiceTemplate);
    }
  }, [invoiceTemplate]);
  return (
    <div style={styles.templateWrapper}>
      <div>
        <div style={styles.header_section1}>
          <p style={styles.headerTitle}>{invoicePrintData?.comapny_name}</p>
          <p>{invoicePrintData?.company_address}</p>
          <p>
            E-mail:- <span>prakash.rewani@goldenhorncontainers.com</span>
          </p>
          <p>
            Website :{" "}
            <a href="http://www.goldenhorncontainers.com/">
              http://www.goldenhorncontainers.com/
            </a>
          </p>
          <p>Contact Details: Mr. Prakash Rewani (Mo. 9833291060)</p>
        </div>
        <hr />
        <div style={styles.companyDetails}>
          <p>
            GSTIN : <span>{invoicePrintData?.company_gst_no}</span>
          </p>
          <p>
            PAN No : <span>{invoicePrintData?.company_pan_no}</span>
          </p>
          <p>
            STATE : <span>{invoicePrintData?.company_state}</span>
          </p>
          <p>
            STATE CODE : <span>{invoicePrintData?.company_state_code}</span>
          </p>
        </div>
        <hr />
        <h4>TAX INVOICE
        </h4>
        <hr />
        <div style={{ display: "flex", width: "100%", marginTop: "-16px" }}>
          <div style={styles.stateDetails}>
            <p
              style={{
                borderBottom: "1px solid black",
                padding: "40px",
                margin: "-20px, 0px , 0px 0px",
                textAlign: "left",
              }}
            >
              MS: &nbsp;&nbsp;<span>{invoicePrintData?.bill_party}</span>
            </p>
            <div style={styles.companyDetails}>
              <div style={styles.com1}>
                <p style={{ borderBottom: "1px solid black" }}>
                  State: <span>{invoicePrintData?.invoice_state}</span>
                </p>
                <p style={{ borderBottom: "1px solid black" }}>
                  State Code: <span>{invoicePrintData?.invoice_state_code}</span>
                </p>
              </div>
              <div style={styles.com1}>
                <p style={styles.stateText}>
                  GST IN: <span>{invoicePrintData?.invoice_gst_no}</span>
                </p>
                <p style={styles.stateText}>
                  PAN NO: <span>{invoicePrintData?.invoice_pan_no}</span>
                </p>
              </div>
            </div>
            <p style={{ textAlign: "left", marginLeft: "40px" }}>
             Company Account: &nbsp;<span>{invoicePrintData?.company_account}</span>
            </p>
          </div>
          <div style={styles.invoiceDetails}>
            <p style={{ textAlign: "left", margin: "40px" }}>
              INVOICE NO : <span>{invoicePrintData?.invoice_no}</span>
            </p>
            <p style={{ textAlign: "left", marginLeft: "40px" }}>
              Date : <span>{invoicePrintData?.date}</span>
            </p>
          </div>
        </div>
        <div>
          <table>
            <tr>
              <th>SR No.</th>
              <th>PARTICULASRS</th>
              <th>SAC Code</th>
              <th>TAXABLE AMOUNT</th>
              <th>GST RATE %</th>
              <th>
                {" "}
                CGST
                <tr>
                  <td
                    style={{
                      padding: "0px 12px",
                      borderBottom: "0",
                      borderLeft: "0",
                    }}
                  >
                    Rate%
                  </td>
                  <td
                    style={{
                      padding: "0px 12px",
                      borderBottom: "0",
                      borderRight: "0",
                    }}
                  >
                    Amount
                  </td>
                </tr>
              </th>
              <th>
                SGST{" "}
                <tr>
                  <td
                    style={{
                      padding: "0px 12px",
                      borderBottom: "0",
                      borderLeft: "0",
                    }}
                  >
                    Rate%
                  </td>
                  <td
                    style={{
                      padding: "0px 12px",
                      borderBottom: "0",
                      borderRight: "0",
                    }}
                  >
                    Amount
                  </td>
                </tr>
              </th>
              <th>
                IGST{" "}
                <tr>
                  <td
                    style={{
                      padding: "0px 12px",
                      borderBottom: "0",
                      borderLeft: "0",
                    }}
                  >
                    Rate%
                  </td>
                  <td
                    style={{
                      padding: "0px 12px",
                      borderBottom: "0",
                      borderRight: "0",
                    }}
                  >
                    Amount
                  </td>
                </tr>
              </th>
              <th>TOTAL</th>
            </tr>
            {invoicePrintData?.line.map((invoiceItem, index) => {
              let srNo = index + 1;
              return (
                <tr>
                  <td>{srNo}</td>
                  <td>{invoiceItem?.particular}</td>
                  <td>{invoiceItem?.sac_code}</td>
                  <td>{invoiceItem?.taxable_amount}</td>
                  <td>{invoiceItem?.tax_rate}</td>
                  <td>
                    <tr>
                      <td
                        style={{
                          padding: "25px",
                          borderBottom: "0",
                          borderLeft: "0",
                          borderTop: "0",
                          height:"100px"
                        }}
                      >
                     {invoiceItem?.cgst_rate} &nbsp;&nbsp;&nbsp;
                      </td>
                      <td
                        style={{
                          padding: "25px",
                          borderBottom: "0",
                          borderRight: "0",
                          borderTop: "0",
                        }}
                      >
                        {invoiceItem?.cgst_amount}
                      </td>
                    </tr>
                  </td>
                  <td>
                    <tr>
                      <td
                        style={{
                          padding: "25px",
                          borderBottom: "0",
                          borderLeft: "0",
                          borderTop: "0",
                          height:"100px"
                        }}
                      >
                     {invoiceItem?.sgst_rate} &nbsp;&nbsp;&nbsp;
                       
                      </td>
                      <td
                        style={{
                          padding: "25px",
                          borderBottom: "0",
                          borderRight: "0",
                          borderTop: "0",
                        }}
                      >
                        {invoiceItem?.sgst_amount}
                      </td>
                    </tr>
                  </td>
                  <td>
                    {" "}
                    <tr>
                      <td
                        style={{
                          padding: "25px",
                          borderBottom: "0",
                          borderLeft: "0",
                          borderTop: "0",
                          height:"100px"
                        }}
                      >
                        {invoiceItem?.igst_rate} &nbsp;&nbsp;&nbsp;
                      </td>
                      <td
                        style={{
                          padding: "25px",
                          borderBottom: "0",
                          borderRight: "0",
                          borderTop: "0",
                        }}
                      >
                        {invoiceItem?.igst_amount}
                      </td>
                    </tr>
                  </td>
                  <td>{invoiceItem?.total}</td>
                </tr>
              );
            })}
          </table>
          <div>
            <p>
              A/C Name: GOLDERN HORN CONTAINERS HUB PRIVATE LIMITED , A/C NO:
              920020056480752 , Bank Name : AXIS BANK LTD, Branch :CDB BELAPUR ,
              NAVI MUMBAI , IFSC CODE :UTIB0000861
            </p>
          </div>
          <hr />
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div style={{ textAlign: "left" }}>
              <h5>TERMS AND CONDITIONS : </h5>
              <p>
                1. Kindly issue the cheque in favour of GOLDERN HORN CONTAINERS
                PRIVATE LTD
              </p>
              <p>2. Payment by cross cheque is requsted</p>
              <p>3. The payment of bill due with in 15 days </p>
              <p>Subject to Mumndra Junction Only</p>
            </div>
            <div
              style={{
                borderLeft: "1px solid",
                marginTop: "-15px",
                padding: "10px",
              }}
            >
              <h4>FOR, GOLDEN HORN CONTAINERS PRIVATE LTD</h4>
              <br />
              <br />
              <br />
              <br />
              <br />
              <br />
              <h6>Authorized Sign</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default InvoiceLrTemplate;
