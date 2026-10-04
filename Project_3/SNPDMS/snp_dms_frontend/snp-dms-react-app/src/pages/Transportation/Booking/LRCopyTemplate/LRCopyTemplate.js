import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getLRTemplateData } from "../../../../actions/transportation/LRCopyAction";
import './LRCopyTemplate.css';
import moment from "moment";

const ReportTemplate = () => {
  const styles = {
    body: {
      margin: "60px 0px",
    },
    span: {
      fontWeight: "900",
      fontSize: "18px",
    },
    copysec: {
      padding: "30px 4px !important",
      borderBottom: "0px !important",
      fontFamily: '"Josefin Sans", sans-serif',
      fontSize: "20px",
      fontWeight: "900",
      textTransform: "uppercase",
    },
    templateWrapper: {
      width: "80%",
      alignItems: "center",
      textAlign: "center",
      border: "3px solid #000",
      margin: "0 10%",
    },
    headerWrapper: {
      display: "flex",
      justifyContent: "space-between",
      border: "2px solid #000",
    },
    conditionWrapper: {
      display: "flex",
      justifyContent: "space-between",
      border: "2px solid #000",
    },
    header_section1: {
      width: "80%",
      borderRight: "3px solid #000",
      paddingTop:"20px"
    },
    header_section2: {
      width: "20%",
      paddingTop:"20px"
    },
    driverWrapper: {
      marginTop: "20px",
    },
    truckDetails: {
      display: "flex",
      justifyContent: "space-evenly",
      border: "1px solid #000",
      padding: "10px 0px 10px 0px",
    },
    conContent: {
      padding: "8px 8px 100px",
      textAlign: "left",
    },
    noContent: {
      padding: "10px 10px",
    },
    detContent: {
      padding: "25px 25px",
    },
    detContent1: {
      padding: "36px 20px",
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
    companyWrapper: {
      display: "flex",
      justifyContent: "space-between",
    },
    section1: {
      width: "50%",
    },
    section2: {
      width: "50%",
    },
    condiSection1: {
      textAlign: "left",
      padding: "0px 4px",
    },
    title: {
      fontSize: "18px",
      fontWeight: "900",
    },
    gstWraper: {
      fontSize: "25px",
      height: "250px",
      padding: "60px 10px 0px 40px",
      fontFamily: '"Josefin Sans", sans-serif',
      fontWeight: "900",
      textTransform: "capitalize",
    },
    companyBlock: {
      height: "150px",
      border: "4px solid #000",
      fontWeight: "900",
      borderRight: "0",
      borderBottom: "0",
      padding: "8px 0px",
    },
    headerTitle: {
      fontFamily: 'Josefin Sans", sans-serif',
      fontSize: "30px",
    },
    pill1: {
      height: "0px",
      borderRadius: "2px",
      color: "#000",
      border: "2px solid currentColor",
      width: "100%",
      marginTop: "4px",
    },
    pill2: {
      height: "0px",
      borderRadius: "2px",
      color: "#000",
      border: "2px solid currentColor",
      width: "100%",
      marginTop: "4px",
    },
  
  };
  const dispatch = useDispatch();
const [Data, setData] = useState({});
const lRCopyDetails = useSelector((state) => state.lRMaster.lrTemplateData);

useEffect(() => {
  let url = window.location.pathname.split("/");
  if (url[url?.length - 1] !== undefined) {
    let reqBody = { copy: localStorage.getItem("code") };
    dispatch(getLRTemplateData(url[url?.length - 1], reqBody));
  }
}, []);

useEffect(() => {
  if (lRCopyDetails) {
    setData(lRCopyDetails);
  }
}, [lRCopyDetails]);

var now = new Date();

return (
  <div style={styles.templateWrapper}>
    <div style={styles.headerWrapper} >
      <div style={styles.header_section1} >
        <p style={styles.headerTitle}>{Data.comapny_name}</p>
        <p>{Data.company_address}</p>
        <p>E-mail: prakash.rewani@goldenhorncontainers.com</p>
        <a href="http://www.goldenhorncontainers.com/">http://www.goldenhorncontainers.com/</a>
        <p>Contact Details: Mr. Prakash Rewani (Mo. 9833291060)</p>
      </div>

      <div style={styles.header_section2}>
        <p>
          Consignment Note No : <span> 119</span>
        </p>
        <p>
          Loading Date : <span> {Data.l_date}</span>
        </p>
        <p>
          Stuffing Date : <span>{Data.s_date}</span>
        </p>
        <p style={styles.copysec}>{Data.copy}</p>
      </div>
    </div>
    <div style={styles.driverWrapper}>
      <div style={styles.truckDetails}>
        <p>
          Truck/Trailor No : <span> {Data.truck_no}</span>
        </p>
        <p>
          Driver Name : <span>{Data.driver_name}</span>
        </p>
        <p>
          Licence No : <span>{Data.license_no}</span>
        </p>
        <p>
          Mobile No: <span>{Data.mobile_no}</span>
        </p>
      </div>
      <div style={styles.truckDetails}>
        <p>
          Container Status : <span>{Data.status}</span>
        </p>
        <p>
          Container No. : <span>{Data.container_no}</span>
        </p>
        <p>
          Size : <span>{Data.container_size}</span>
        </p>
        <p>
          Type: <span>{Data.container_type}</span>
        </p>
        <p>
          Seal NO.: <span>{Data.seal_no}</span>
        </p>
      </div>
      <div style={styles.truckDetails}>
        <p>
          From: <span>{Data.from_dest}</span>
        </p>
        <p>
          To: <span>{Data.to_dest}</span>
        </p>
      </div>
      <div style={styles.truckDetails}>
        <p>
          Shipping Line: <span>{Data.shipping_line}</span>
        </p>
        <p>
          POD: <span>{Data.pod}</span>
        </p>
      </div>
      <div style={styles.truckDetails}>
        <p>
          Booking No: <span>{Data.booking_no}</span>
        </p>
        <p>
          Port: <span>{Data.port}</span>
        </p>
      </div>
    </div>
    <div style={styles.tableWrapper}>
      <table  style={{ width: "100%" }}>
        <tr>
          <th style={styles.conContent} >
            Consignor: <span>{Data.consignor}</span>
          </th>
          <th style={styles.conContent}>
            Consgineee: <span>{Data.consignee}</span>
          </th>
        </tr>
        <tr>
          <td>
            <table style={{ width: "100%" }}>
              <tr>
                <th style={styles.noContent} >No Of Plallets</th>
                <th style={styles.noContent}>
                  Nature of Goods (Said to contain/weight)
                </th>
              </tr>

              <tr>
                <td style={styles.detContent1}>{Data.no_of_pallets}</td>
                <td style={styles.detContent1}>{Data.particulars}</td>
              </tr>
            </table>
          </td>
          <td>
            <table style={{ width: "100%" }}>
              <tr>
                <th style={styles.noContent}  colspan="2">
                  WEIGHT
                </th>
                <th style={styles.noContent} colspan="2">
                  FRIGHT
                </th>
              </tr>
              <tr>
                <td>ACTUAL</td>
                <td>CHARED</td>
                <td>PAID</td>
                <td>TO PAY</td>
              </tr>
              <tr>
                <td style={styles.detContent} >{Data.actual_weight}</td>
                <td style={styles.detContent} >{Data.charge_weight}</td>
                <td style={styles.detContent}  colspan="2">
                  <span>To Be Filled At Mundra</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
    <div style={styles.companyWrapper} >
      <div style={styles.section1} >
        <div style={styles.truckDetails}>
          <p>
            Value Rs:-<span></span>
          </p>
          <p>
            Service: <span>{Data.services}</span>
          </p>
          <p>
            SAC CODE: <span>{Data.sac_code}</span>
          </p>
        </div>
        <div style={styles.truckDetails}>
          <p>Reached at factory:</p>
          <p>
            Date :<span> {Data.l_date}</span>
          </p>
          <p>
            Time : <span>{(moment(now).format('hh:mm A'))}</span>
          </p>
        </div>
      </div>
      <div style={styles.section2}>
        <div style={styles.truckDetails}>
          <p>
            <span>BOOK GOODS AT OWNER'S RISK</span>
          </p>
        </div>
        <div style={styles.truckDetails}>
          <p>Left at factory:</p>
          <p>
            Date : <span> {Data.s_date}</span>
          </p>
          <p>
            Time : <span>{(moment(now).format('hh:mm A'))}</span>
          </p>
        </div>
      </div>
    </div>
    <div style={styles.truckDetails}>
      <p>
        OUR COMPANY'S GSTIN: <span>1234TFS4567YGDS</span>
      </p>
      <p>
        PAN NO: <span>AASCG4443CG</span>
      </p>
      <p>
        STATE : <span>GUJRAT </span>
      </p>
      <p>
        STATE CODE : <span>24</span>
      </p>
    </div>
    <div style={styles.conditionWrapper}>
      <div style={styles.condiSection1} >
        <p style={styles.title}>TERAMS & CONDITIONS</p>
        <p>
          1. The company does not take any responsibility for leakage, shortage
          , breakage or damage by rain , fire or wheather and sender in
          responsible for proper packaging
        </p>
        <p>
          2. The company will goods at earliest in one lot or in parts according
          to conveince
        </p>
        <p>
          3. The goods will be delivered to the consignee or his agent against
          payment of all charges .
        </p>
        <p>
          4. The goods will be delivered in company's goodown only on
          consignee's office required.
        </p>
        <p>
          5. Each package must have a unique shipment number. One container may
          have multiple packages with different shipment numbers. This shipment
          number is important for end-to-end tracking.
        </p>
        <p>
          6. Insufficient or incorrectly applied lashings or the use of lashing
          equipment of the wrong type or of inadequate strength with respect to
          mass and centre of gravity of the cargo unit and the weather
          conditions likely to be encountered during the voyage.
        </p>
        <p>
          7. As a general rule-of-thumb, if doubt about determining the MSL,
          portable equipment should not be subject to loads exceeding what have
          been customary usage in the past.
        </p>
        <p>
          8. Regular inspections and maintenance are carried out under the
          responsibility of the Master.
        </p>
        <p>
          9. Periodic examinations/re-testing as required by the Administration.
          When required, the cargo securing devices concerned should be
          subjected to inspections by DNV.
        </p>
        <p>
          10. Sufficient reserve securing devices should be carried to deal with
          unexpected circumstances.
        </p>

        <p>
          11. Entries of all examinations and adjustments to lashings should be
          made in the ship’s record book.
        </p>
        <p>
          12. The total of the MSL values of the securing devices on each side
          of a unit of cargo (port as well as starboard) should equal the weight
          of the unit. (The weight of the unit should be taken in kN).
        </p>
        <p>
          13. One extra lashing in port side direction is needed, or chang angle
          to be similar as for starboard side
        </p>
      </div>
    </div>
  </div>
)};
export default ReportTemplate;
