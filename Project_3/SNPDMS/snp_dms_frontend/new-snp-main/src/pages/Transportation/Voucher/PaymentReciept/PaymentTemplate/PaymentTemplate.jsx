import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentTemplate } from "../../../../../actions/transportation/PaymentTemplateAction";
import "./PaymentTemplate.css";
const PaymentTemplate = () => {
  const styles = {
    body: { margin: "10px 0px" },
    span: { fontWeight: 900, fontSize: "18px" },
    templateWrapper: {
      width: "75%",
      alignItems: "center",
      textAlign: "center",
      border: "3px solid #000",
      margin: "0 10%",
    },
    headersection1: { width: "100%", padding: "20px 20px 0px" },
    driverWrapper: { marginTop: "20px" },
    truckDetails: {
      display: "flex",
      justifyContent: "space-between",
      borderTop: "2px solid #000",
      padding: "6px 6px",
      textAlign: "left",
    },
    truckDetailsTitle: {
      display: "flex",
      justifyContent: "space-between",
      borderTop: "2px solid #000",
      padding: "6px 6px",
      textAlign: "left",
    },
    tableWrapper: { borderTop: "2px solid #000", display: "flex" },
    narration: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 10px",
    },
    amount: { borderLeft: "2px solid #000", width: "20%" },
    total: {
      borderTop: "2px solid #000",
      borderBottom: "2px solid #000",
      padding: "6px 6px",
      display: "flex",
      justifyContent: "space-around",
    },
    totalamt: {
      width: "75%",
      justifyContent: "end",
      alignItems: "end",
      textAlign: "end",
    },
    totalnum: { width: "12%" },
    lastsec: {
      display: "flex",
      justifyContent: "space-around",
      padding: "10px 10px",
    },
    block: { border: "2px solid #000", height: "100px" },
    headerTitle: {
      fontFamily: '"Josefin Sans", sans-serif',
      fontSize: "25px",
    },
  };

  const dispatch = useDispatch();
  const [paymentPrintData, setPaymentPrintData] = useState("");
  const store = useSelector((state) => state);
  // eslint-disable-next-line no-unused-vars
  const { gateIn } = store;
  const paymentTemplate = useSelector(
    (state) => state.paymentTemplate.paymentTemplateData
  );

  useEffect(() => {
    let url = window.location.pathname.split("/");
    if (url[url?.length - 1] !== undefined) {
      let reqBody = { copy: localStorage.getItem("code") };
      dispatch(getPaymentTemplate(url[url?.length - 1], reqBody));
    }
 
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paymentTemplate) {
      setPaymentPrintData(paymentTemplate);
    }
  }, [paymentTemplate]);
  return (
    <div style={styles.templateWrapper}>
      <div style={styles.headerWrapper}>
        <div style={styles.headersection1}>
          <p style={styles.headerTitle}>{paymentPrintData.comapny_name}</p>
          <p>{paymentPrintData.company_address}</p>

          <p> Mr. Prakash Rewani (Mo. 9833291060)</p>
        </div>
      </div>
      <div style={styles.driverWrapper}>
        <div style={styles.truckDetailsTitle}>
          <p style={{ margin: "auto" }}>
            <strong>PAYMENT VOUCHER</strong>
          </p>
        </div>
        <div style={styles.truckDetails}>
          <div>
            <p>
              NAME : <span>{paymentPrintData.name}</span>
            </p>
            <br />
            <p>
              Truck No. : <span>{paymentPrintData.truck_no}</span>
            </p>
          </div>
          <div>
            <p>
              Voucher No : <span>{paymentPrintData.voucher_no}</span>
            </p>
            <br />
            <p>
              Date: <span>{paymentPrintData.date}</span>
            </p>
          </div>
        </div>
      </div>
      <div style={styles.tableWrapper}>
        <div style={{ width: "80%" }}>
          <p
            style={{
              borderBottom: "2px solid #000",
              padding: "10px",
              margin: "auto",
            }}
          >
            <strong>DESCRIPTION</strong>
          </p>
          <div style={styles.narration}>
            <div>
              <p>
                Narration: <span>{paymentPrintData.narration}</span>
              </p>
              <br />
              <br />
              <p>
                Extra Charges: <span>{paymentPrintData.extra_charges}</span>
              </p>
            </div>
            <br />
            <div>
              <p>Rec. Amt :</p>
              <p>KASAR :</p>
              <p>TDS :</p>
            </div>
          </div>
        </div>
        <div style={styles.amount}>
          <p style={{ borderBottom: "2px solid #000", padding: "10px" }}>
            <strong>AMOUNT : </strong>
          </p>
          <div>
            <p>{paymentPrintData.receipt_amount}</p>
            <p>{paymentPrintData.kasar}</p>
            <p>{paymentPrintData.tds}</p>
          </div>
        </div>
      </div>
      <div style={styles.total}>
        <p style={styles.totalamt}>
          <strong>TOTAL : </strong>
        </p>
        <p style={styles.totalnum}>{paymentPrintData.total_amount}</p>
      </div>

      <div style={styles.lastsec}>
        <p style={{ marginTop: "100px" }}>Prepared by</p>
        <p style={{ marginTop: "100px" }}>Passed by</p>
        <div>
          <p style={styles.block}></p>
          <p>Receiver's Sign</p>
        </div>
      </div>
    </div>
  );
};
export default PaymentTemplate;
