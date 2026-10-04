import { GET_CONTAINER_BY_DATE } from "../actions/GateInActions";
import {
  // CONTAINER
  EDIT_CLIENT_NAME,
  EDIT_CONTAINER_NUMBER,
  EDIT_CONTAINER_SIZE,
  EDIT_CONTAINER_TYPE,
  EDIT_CONTAINER_PAYLOAD,
  EDIT_GROSS_WEIGHT,
  EDIT_TARE_WEIGHT,
  EDIT_MANUFACTURING_DATE,
  // EIR
  EDIT_REMOVE_EIR_LINE,
  EDIT_ADD_EIR_LINE,
  EDIT_EIR_DAMAGE_CODE,
  EDIT_EIR_LINE_DESCRIPTION,
  EDIT_EIR_DATE,
  EDIT_EIR_TIME,
  EDIT_EIR_AMOUNT,
  EDIT_OFFLOAD_DATE,
  EDIT_OFFLOAD_TIME,
  EDIT_REPAIR_AMOUNT,

  // GATE IN DETAILS
  EDIT_GATE_IN_DATE,
  EDIT_GATE_IN_TIME,
  EDIT_GATE_IN_CONDITION,
  EDIT_GATE_IN_GRADE,
  EDIT_GATE_IN_ARRIVED,
  EDIT_GATE_IN_CONSIGNOR,
  EDIT_GATE_IN_CUSTOMER,
  EDIT_GATE_IN_SHIPPER,
  EDIT_GATE_IN_SOURCE,
  EDIT_FROM_LOCATION_CODE,
  EDIT_FROM_PORT_CODE,
  EDIT_VESSEL_NAME,
  EDIT_VOYAGE_NUMBER,
  EDIT_DO_REF,
  EDIT_IMPORT_CARGO,
  EDIT_EXPORT_CARGO_TYPE,
  EDIT_TRANSPORTER_NAME,
  EDIT_VEHICLE_NUMBER,
  EDIT_BL_NUMBER,
  EDIT_DRIVER_NAME,
  EDIT_DRIVER_MOBILE,
  EDIT_DRIVER_LICENSE_NUMBER,
  EDIT_CARRIER_CODE,
  EDIT_LOCATION,
  EDIT_GATE_IN_REMARK,
  EDIT_DRIVER_LICENSE_IMAGE,

  // LOLO DETAILS
  EDIT_LOLO_INVOICE_DATE,
  EDIT_LOLO_RECEIPT_DATE,
  EDIT_LOLO_PAYMENT_TYPE,
  EDIT_LOLO_TYPE,
  EDIT_LOLO_AMOUNT,
  EDIT_LOLO_REMARK,
  EDIT_LOLO_CHEQUE_NUMBER,
  EDIT_LOLO_QUANTITY,
  EDIT_LOLO_UTR_NUMBER,
  EDIT_LOLO_CHEQUE_AMOUNT,
  EDIT_LOLO_BANK_NAME,
  EDIT_LOLO_CHEQUE_DATE,
  EDIT_LOLO_ACCOUNT_NAME,
  EDIT_LOLO_ORIGINAL_QUANTITY,
  EDIT_LOLO_ORIGINAL_AMOUNT,

  // SELF TRANSPORT
  EDIT_SELF_TRANSPORT_CUSTOMER_NAME,
  EDIT_SELF_TRANSPORT_RECEIPT_DATE,
  EDIT_SELF_TRANSPORT_PAYMENT_TYPE,
  EDIT_SELF_TRANSPORT_TRANSPORTER,
  EDIT_SELF_TRANSPORT_ORIGIN,
  EDIT_SELF_TRANSPORT_PRICE,
  EDIT_SELF_TRANSPORT_REMARK,
  EDIT_SELF_TRANSPORT_CHEQUE_NUMBER,
  EDIT_SELF_TRANSPORT_QUANTITY,
  EDIT_SELF_TRANSPORT_CHEQUE_AMOUNT,
  EDIT_SELF_TRANSPORT_BANK_NAME,
  EDIT_SELF_TRANSPORT_CHEQUE_DATE,
  EDIT_SELF_TRANSPORT_ACCOUNT_NAME,
  EDIT_SELF_TRANSPORT_ORIGINAL_QUANTITY,
  EDIT_SELF_TRANSPORT_CHEQUE_ORIGINAL_AMOUNT,
} from "../actions/types";

// TODAYS DATE
var today = new Date();
var dd = String(today.getDate()).padStart(2, "0");
var mm = String(today.getMonth() + 1).padStart(2, "0"); //
var yyyy = today.getFullYear();
// eslint-disable-next-line no-unused-vars
var todayDate = yyyy + "-" + mm + "-" + dd;

const initialState = {
  fetchedContainer: null,
  selectedContainer: {
    container_data: {
      pk: "",
      client: "",
      type: "",
      size: "",
      container_no: "",
      payload: "",
      gross_wt: "",
      tare_wt: "",
      manufacturing_date: "",
      shipping_line: "",
      leased_box: "",
      do_not_lift: "",
      automatic_mnr_status_change: "",
      do_not_lift_remarks: "",
    },
    eir_data: {
      pk: "",
      container: "",
      eir_no: "",
      done_by: "",
      eir_date: "",
      eir_time: "",
      offload_date: "",
      offload_time: "",
      eir_amount: "",
      repair_amount: "",
      eir_line: [],
    },
    gate_in_data: {
      pk: "",
      gate_pass_no: "",
      container: "",
      in_date: "",
      in_time: "",
      condition: "",
      grade: "",
      arrived: "",
      consignee: "",
      customer: "",
      shipper: "",
      source: "",
      from_location_code: "",
      from_location_name_code: "",
      from_port_code: "",
      vessel_name: "",
      voyage_no: "",
      do_ref: "",
      cargo: "",
      export_cargo_type: "",
      transporter_name: "",
      vehicle_no: "",
      bl_no: "",
      driver_name: "",
      driver_license: "",
      image_url:"",
      driver_mobile_no: "",
      carrier_code: "",
      location: "",
      remarks: "",
    },
    lolo_data: {
      pk: "",
      container: "",
      apply_charges: "",
      customer_name: "",
      invoice_no: "",
      receipt_no: "",
      invoice_date: "",
      receipt_date: "",
      lolo_type: "",
      payment_type: "",
      lolo_amount: "",
      with_gst: false,
      gst: "",
      cgst: "",
      igst: "",
      sgst: "",
      cgst_amount: 0,
      igst_amount: 0,
      sgst_amount: 0,
      net_amount: 0,
      taxable_amount: 0,
      gross_amount: 0,
      night_charges: 0,
      remark: "",
      is_night_charges_applied: false,
      is_amt_editable: true,
      lolo_payment: {
        pk: "",
        date: "",
        bank_name: "",
        account_name: "",
        account_no: "",
        cheque_no: "",
        utr_no: "",
        quantity: "",
        container: [],
        remaining: "",
        amount: "",
        original_amount: "",
      },
    },
    self_transportation_data: {
      pk: "",
      container: "",
      apply_charges: "",
      customer_name: "",
      transporter: "",
      receipt_no: "",
      invoice_no: "",
      origin: "",
      receipt_date: "",
      payment_type: "",
      price: "",
      with_gst: "",
      gst: "",
      cgst: "",
      igst: "",
      sgst: "",
      cgst_amount: 0,
      igst_amount: 0,
      sgst_amount: 0,
      net_amount: 0,
      taxable_amount: 0,
      gross_amount: 0,
      night_charges: 0,
      remark: "",
      is_amt_editable: true,
      self_transportation_payment: {
        pk: "",
        date: "",
        bank_name: "",
        account_name: "",
        account_no: "",
        cheque_no: "",
        utr_no: "",
        quantity: "",
        container: [],
        remaining: "",
        amount: "",
        original_amount: "",
      },
    },
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_CONTAINER_BY_DATE:
      return { ...state, selectedContainer: action.payload };
    case "RESET_GATE_IN_UPDATE_FORM":
      return initialState;
    //   CONTAINER DETAILS
    case EDIT_CLIENT_NAME:
      var clientName = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          client: action.payload,
        },
      };
      return { ...state, selectedContainer: clientName };
    case "EDIT_CONTAINER_SURVEY_DATA":
      return {
        ...state,
        fetchedContainer: action.payload,
      };
    case EDIT_CONTAINER_NUMBER:
      var containerNumber = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          container_no: action.payload,
        },
      };
      return { ...state, selectedContainer: containerNumber };
    case EDIT_CONTAINER_SIZE:
      var containerSize = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          size: action.payload,
        },
      };
      return { ...state, selectedContainer: containerSize };
    case EDIT_CONTAINER_TYPE:
      var containerType = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          type: action.payload,
        },
      };
      return { ...state, selectedContainer: containerType };
    case EDIT_CONTAINER_PAYLOAD:
      var containerPayload = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          payload: action.payload,
        },
      };
      return { ...state, selectedContainer: containerPayload };
    case EDIT_GROSS_WEIGHT:
      var grossWeight = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          gross_wt: action.payload,
        },
      };
      return { ...state, selectedContainer: grossWeight };
    case EDIT_TARE_WEIGHT:
      var tareWeight = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          tare_wt: action.payload,
        },
      };
      return { ...state, selectedContainer: tareWeight };
    case EDIT_MANUFACTURING_DATE:
      var manufacturingDate = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          manufacturing_date: action.payload,
        },
      };
      return { ...state, selectedContainer: manufacturingDate };
    case "EDIT_SHIPPING_LINE":
      var gateInShippingLine = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          shipping_line: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInShippingLine };
    case "EDIT_DO_NOT_LIFT_REMARKS":
      var gateInShippingLineDoNotLiftRemarks = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          do_not_lift_remarks: action.payload,
        },
      };
      return {
        ...state,
        selectedContainer: gateInShippingLineDoNotLiftRemarks,
      };
    case "CLEAR_SHIPPING_LINE_EDIT":
      var gateInClearShippingLine = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          shipping_line: "",
        },
      };
      return { ...state, selectedContainer: gateInClearShippingLine };
    case "SET_EDIT_LEASED_BOX":
      var gateInLeasedBox = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          leased_box: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInLeasedBox };
    case "SET_EDIT_DO_NOT_LIFT":
      var gateInDoNotLift = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          do_not_lift: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInDoNotLift };

    case "SET_EDIT_AUTO_STATUS_CHANGE":
      var gateInAutoStatusChange = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          automatic_mnr_status_change: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInAutoStatusChange };

    // EIR DETAILS
    case EDIT_ADD_EIR_LINE:
      var addEIRLine = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_line: [
            ...state.selectedContainer.eir_data.eir_line,
            action.payload,
          ],
        },
      };

      return { ...state, selectedContainer: addEIRLine };

    case EDIT_REMOVE_EIR_LINE:
      var removeEIRLine = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_line: [...state.selectedContainer.eir_data.eir_line].filter(
            (line) => line.grap_position !== action.payload.areaName
          ),
        },
      };

      return { ...state, selectedContainer: removeEIRLine };
    case EDIT_EIR_DAMAGE_CODE:
      var eirDamageCode = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_line: [...state.selectedContainer.eir_data.eir_line],
        },
      };
      eirDamageCode.eir_data.eir_line[action.payload.index] = {
        ...eirDamageCode.eir_data.eir_line[action.payload.index],
        damage_code: action.payload.damageCode,
      };

      return { ...state, selectedContainer: eirDamageCode };

    case EDIT_EIR_LINE_DESCRIPTION:
      var eirLineDescription = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_line: [...state.selectedContainer.eir_data.eir_line],
        },
      };
      eirLineDescription.eir_data.eir_line[action.payload.index] = {
        ...eirLineDescription.eir_data.eir_line[action.payload.index],
        description: action.payload.desc,
      };

      return { ...state, selectedContainer: eirLineDescription };

    case EDIT_EIR_DATE:
      var eirDate = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_date: action.payload,
        },
      };
      return { ...state, selectedContainer: eirDate };
    case EDIT_EIR_TIME:
      var eirTime = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_time: action.payload,
        },
      };
      return { ...state, selectedContainer: eirTime };
    case EDIT_EIR_AMOUNT:
      var eirAmount = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_amount: action.payload,
        },
      };
      return { ...state, selectedContainer: eirAmount };
    case EDIT_OFFLOAD_DATE:
      var offloadDate = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          offload_date: action.payload,
        },
      };
      return { ...state, selectedContainer: offloadDate };
    case EDIT_OFFLOAD_TIME:
      var offloadTime = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          offload_time: action.payload,
        },
      };
      return { ...state, selectedContainer: offloadTime };
    case EDIT_REPAIR_AMOUNT:
      var eirRepairAmount = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          repair_amount: action.payload,
        },
      };
      return { ...state, selectedContainer: eirRepairAmount };

    case EDIT_GATE_IN_DATE:
      var gateInDate = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          in_date: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInDate };
    case "EDIT_GATE_IN_FROM_LOCATION_NAME_CODE":
      var gateInFromLocationNameCode = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          from_location_name_code: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInFromLocationNameCode };
    case EDIT_GATE_IN_TIME:
      var gateInTime = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          in_time: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInTime };
    case EDIT_GATE_IN_CONDITION:
      var gateInCondition = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          condition: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInCondition };
    case EDIT_GATE_IN_GRADE:
      var gateInGrade = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          grade: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInGrade };
    case EDIT_GATE_IN_ARRIVED:
      var gateInArrived = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          arrived: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInArrived };
    case EDIT_GATE_IN_CONSIGNOR:
      var gateInConsignor = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          consignee: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInConsignor };
    case EDIT_GATE_IN_CUSTOMER:
      var gateInCustomer = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          customer: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInCustomer };
    case EDIT_GATE_IN_SHIPPER:
      var gateInShipper = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          shipper: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInShipper };
    case EDIT_GATE_IN_SOURCE:
      var gateInSource = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          source: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInSource };
    case EDIT_FROM_LOCATION_CODE:
      var gateInFromLocationCode = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          from_location_code: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInFromLocationCode };
    case EDIT_FROM_PORT_CODE:
      var gateInFromPortCode = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          from_port_code: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInFromPortCode };
    case EDIT_VESSEL_NAME:
      var gateInVesselName = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          vessel_name: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInVesselName };
    case EDIT_VOYAGE_NUMBER:
      var gateInVoyageNumber = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          voyage_no: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInVoyageNumber };
    case EDIT_DO_REF:
      var gateInDORef = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          do_ref: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInDORef };
    case EDIT_IMPORT_CARGO:
      var gateInImportCargo = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          cargo: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInImportCargo };
    case EDIT_EXPORT_CARGO_TYPE:
      var gateInExportCargoType = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          export_cargo_type: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInExportCargoType };
    case EDIT_TRANSPORTER_NAME:
      var gateInTransporterName = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          transporter_name: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInTransporterName };
    case EDIT_VEHICLE_NUMBER:
      var gateInVehicleNumber = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          vehicle_no: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInVehicleNumber };

    case EDIT_BL_NUMBER:
      var editGateInVehicleNumber = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          bl_no: action.payload,
        },
      };
      return { ...state, selectedContainer: editGateInVehicleNumber };
    case EDIT_DRIVER_NAME:
      var gateInDriverName = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          driver_name: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInDriverName };
    case EDIT_DRIVER_MOBILE:
      var gateInDriverMobile = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          driver_mobile_no: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInDriverMobile };
    case EDIT_DRIVER_LICENSE_NUMBER:
      var gateInDriverLicenseNumber = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          driver_license: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInDriverLicenseNumber };
    case EDIT_DRIVER_LICENSE_IMAGE:
      var gateInDriverLicenseImage = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          image_url: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInDriverLicenseImage };
    case EDIT_CARRIER_CODE:
      var gateInCarrierCode = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          carrier_code: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInCarrierCode };
    case EDIT_LOCATION:
      var gateInLocation = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          location: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInLocation };
    case EDIT_GATE_IN_REMARK:
      var gateInRemark = {
        ...state.selectedContainer,
        gate_in_data: {
          ...state.selectedContainer.gate_in_data,
          remarks: action.payload,
        },
      };
      return { ...state, selectedContainer: gateInRemark };

    // lOLO
    case EDIT_LOLO_INVOICE_DATE:
      var loloInvoiceDate = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          invoice_date: action.payload,
        },
      };
      return { ...state, selectedContainer: loloInvoiceDate };

    case "EDIT_LOLO_APPLY_CHARGES":
      var editLoloApplyCharges = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          apply_charges: action.payload,
        },
      };
      return { ...state, selectedContainer: editLoloApplyCharges };

    case "EDIT_IS_NIGHT_CHARGE_APPLY":
      var editNightChargesCharges = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          is_night_charges_applied: action.payload,
        },
      };

      return { ...state, selectedContainer: editNightChargesCharges };

    case "EDIT_LOLO_TRANSPORTATION_CHARGES":
      var editTransportationApplyCharges = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          apply_charges: action.payload,
        },
      };
      return { ...state, selectedContainer: editTransportationApplyCharges };

    case "EDIT_LOLO_CUSTOMER_NAME":
      var editLoloCustomerName = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          customer_name: action.payload,
        },
      };
      return { ...state, selectedContainer: editLoloCustomerName };
    case EDIT_LOLO_RECEIPT_DATE:
      var loloReceiptDate = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          receipt_date: action.payload,
        },
      };
      return { ...state, selectedContainer: loloReceiptDate };
    case EDIT_LOLO_PAYMENT_TYPE:
      var loloPaymentType = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          payment_type: action.payload,
        },
      };
      return { ...state, selectedContainer: loloPaymentType };
    case EDIT_LOLO_TYPE:
      var loloType = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_type: action.payload,
        },
      };
      return { ...state, selectedContainer: loloType };
    case EDIT_LOLO_AMOUNT:
      var loloAmount = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_amount: action.payload,
        },
      };
      return { ...state, selectedContainer: loloAmount };
    case EDIT_LOLO_REMARK:
      var loloRemark = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          remark: action.payload,
        },
      };
      return { ...state, selectedContainer: loloRemark };
    case EDIT_LOLO_CHEQUE_NUMBER:
      var loloChequeNumber = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            cheque_no: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: loloChequeNumber };

    case EDIT_LOLO_QUANTITY:
      var editLoloQuantity = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            quantity: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloQuantity };

    case EDIT_LOLO_UTR_NUMBER:
      var editLoloUTRNumber = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            utr_no: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloUTRNumber };
    case EDIT_LOLO_ORIGINAL_QUANTITY:
      var editLoloOriginalQuantity = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            remaining: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloOriginalQuantity };

    case EDIT_LOLO_CHEQUE_AMOUNT:
      var editLoloAmount = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            amount: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloAmount };
    case EDIT_LOLO_ORIGINAL_AMOUNT:
      var editLoloOriginalAmount = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            original_amount: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloOriginalAmount };
    case EDIT_LOLO_BANK_NAME:
      var editLoloBankName = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            bank_name: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloBankName };
    case EDIT_LOLO_CHEQUE_DATE:
      var editLoloChequeDate = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            date: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloChequeDate };
    case EDIT_LOLO_ACCOUNT_NAME:
      var editLoloAccountName = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            account_name: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloAccountName };
    case "EDIT_LOLO_ACCOUNT_NUMBER":
      var editLoloAccountNumber = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            account_no: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloAccountNumber };

    case "UPDATE_EDIT_CHEQUE_DETAILS":
      var updateCheque = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: action.payload,
        },
      };
      return { ...state, selectedContainer: updateCheque };

    case "UPDATE_EDIT_CHEQUE_DETAILS_SELF_TRANSPORTATION":
      var updateChequeSelfTransport = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: action.payload,
        },
      };
      return { ...state, selectedContainer: updateChequeSelfTransport };

    // SELF TRANSPORT
    case EDIT_SELF_TRANSPORT_CUSTOMER_NAME:
      var selftransportCustomerName = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          customer_name: action.payload,
        },
      };
      return { ...state, selectedContainer: selftransportCustomerName };
    case EDIT_SELF_TRANSPORT_RECEIPT_DATE:
      var selfTransportReceiptDate = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          receipt_date: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportReceiptDate };
    case EDIT_SELF_TRANSPORT_PAYMENT_TYPE:
      var selfTransportPaymentType = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          payment_type: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportPaymentType };
    case EDIT_SELF_TRANSPORT_TRANSPORTER:
      var selfTransportTransporter = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          transporter: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportTransporter };
    case EDIT_SELF_TRANSPORT_ORIGIN:
      var selfTransportOrigin = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          origin: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportOrigin };
    case EDIT_SELF_TRANSPORT_PRICE:
      var selfTransportPrice = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          price: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportPrice };

    case EDIT_SELF_TRANSPORT_REMARK:
      var selfTransportRemark = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          remark: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportRemark };
    case EDIT_SELF_TRANSPORT_CHEQUE_NUMBER:
      var selfTransportCheque = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            cheque_no: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportCheque };
    case "EDIT_SELF_TRANSPORT_UTR_NUMBER":
      var selfTransportUTR = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            utr_no: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportUTR };

    case EDIT_SELF_TRANSPORT_QUANTITY:
      var selfTransportChequeQty = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            remaining: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportChequeQty };
    case EDIT_SELF_TRANSPORT_ORIGINAL_QUANTITY:
      var selfTransportChequeOriginalQty = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            quantity: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportChequeOriginalQty };
    case EDIT_SELF_TRANSPORT_CHEQUE_AMOUNT:
      var selfTransportChequeAmount = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            amount: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportChequeAmount };
    case EDIT_SELF_TRANSPORT_CHEQUE_ORIGINAL_AMOUNT:
      var selfTransportChequeOriginalAmount = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            original_amount: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportChequeOriginalAmount };
    case EDIT_SELF_TRANSPORT_BANK_NAME:
      var selfTransportChequeBankName = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            bank_name: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportChequeBankName };
    case EDIT_SELF_TRANSPORT_CHEQUE_DATE:
      var selfTransportChequeDate = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            date: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportChequeDate };
    case EDIT_SELF_TRANSPORT_ACCOUNT_NAME:
      var selfTransportChequeAccountName = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            account_name: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportChequeAccountName };
    case "EDIT_SELF_TRANSPORT_ACCOUNT_NUMBER":
      var selfTransportChequeAccountNumber = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: {
            ...state.selectedContainer.self_transportation_data
              .self_transportation_payment,
            account_no: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: selfTransportChequeAccountNumber };

    default:
      return { ...state };
  }
};
