import {
  // CONTAINER
  EDIT_GATE_OUT_LEASED_BOX,
  // EIR
  EDIT_GATE_OUT_REMOVE_EIR_LINE,
  EDIT_GATE_OUT_ADD_EIR_LINE,
  EDIT_GATE_OUT_EIR_DAMAGE_CODE,
  EDIT_GATE_OUT_EIR_LINE_DESCRIPTION,
  EDIT_GATE_OUT_EIR_DATE,
  EDIT_GATE_OUT_EIR_TIME,
  EDIT_GATE_OUT_EIR_AMOUNT,
  EDIT_GATE_OUT_OFFLOAD_DATE,
  EDIT_GATE_OUT_OFFLOAD_TIME,
  EDIT_GATE_OUT_REPAIR_AMOUNT,

  //   // GATE OUT DETAILS
  EDIT_GATE_OUT_DATE,
  EDIT_GATE_OUT_TIME,
  EDIT_GATE_CONDITION,
  EDIT_GATE_OUT_GRADE,
  EDIT_GATE_OUT_CONSIGNOR,
  EDIT_GATE_OUT_SHIPPER,
  EDIT_GATE_OUT_DEPARTED,
  EDIT_GATE_OUT_DESTINATION,
  EDIT_GATE_OUT_DELIVERY,
  EDIT_GATE_OUT_TO_LOCATION_CODE,
  EDIT_TO_PORT_CODE,
  EDIT_GATE_OUT_VESSEL_NAME,
  EDIT_GATE_OUT_VOYAGE_NUMBER,
  EDIT_GATE_OUT_RO_REF,
  EDIT_GATE_OUT_EXPORT_CARGO,
  EDIT_GATE_OUT_TRANSPORTER_NAME,
  EDIT_GATE_OUT_VEHICLE_NUMBER,
  EDIT_GATE_OUT_DRIVER_NAME,
  EDIT_GATE_OUT_DRIVER_MOBILE,
  EDIT_GATE_OUT_DRIVER_LICENSE_NUMBER,
  EDIT_GATE_OUT_CARRIER_CODE,
  EDIT_GATE_OUT_LOCATION,
  EDIT_GATE_OUT_PORT_OF_LOADING,
  EDIT_GATE_OUT_PORT_OF_DISCHARGE,
  EDIT_GATE_OUT_SEAL_NUMBER,
  EDIT_GATE_OUT_REMARK,
  EDIT_GATE_OUT_LICENSE_IMAGE,

  //   // LOLO DETAILS
  EDIT_GATE_OUT_LOLO_CUSTOMER_NAME,
  EDIT_GATE_OUT_LOLO_INVOICE_DATE,
  EDIT_GATE_OUT_LOLO_RECEIPT_DATE,
  EDIT_GATE_OUT_LOLO_PAYMENT_TYPE,
  EDIT_GATE_OUT_LOLO_TYPE,
  EDIT_GATE_OUT_LOLO_AMOUNT,
  EDIT_GATE_OUT_LOLO_REMARK,
  EDIT_GATE_OUT_LOLO_CHEQUE_NUMBER,
  EDIT_GATE_OUT_LOLO_QUANTITY,
  EDIT_GATE_OUT_LOLO_UTR_NUMBER,
  EDIT_GATE_OUT_LOLO_CHEQUE_AMOUNT,
  EDIT_GATE_OUT_LOLO_BANK_NAME,
  EDIT_GATE_OUT_LOLO_CHEQUE_DATE,
  EDIT_GATE_OUT_LOLO_ACCOUNT_NAME,
  EDIT_GATE_OUT_LOLO_ORIGINAL_QUANTITY,
  EDIT_GATE_OUT_LOLO_ORIGINAL_AMOUNT,

  //   // SELF TRANSPORT
  EDIT_GATE_OUT_SELF_TRANSPORT_UTR_NO,
  EDIT_GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME,
  EDIT_GATE_OUT_SELF_TRANSPORT_RECEIPT_DATE,
  EDIT_GATE_OUT_SELF_TRANSPORT_PAYMENT_TYPE,
  EDIT_GATE_OUT_SELF_TRANSPORT_TRANSPORTER,
  EDIT_GATE_OUT_SELF_TRANSPORT_ORIGIN,
  EDIT_GATE_OUT_SELF_TRANSPORT_PRICE,
  EDIT_GATE_OUT_SELF_TRANSPORT_REMARK,
  EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_NUMBER,
  EDIT_GATE_OUT_SELF_TRANSPORT_QUANTITY,
  EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_AMOUNT,
  EDIT_GATE_OUT_SELF_TRANSPORT_BANK_NAME,
  EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_DATE,
  EDIT_GATE_OUT_SELF_TRANSPORT_ACCOUNT_NAME,
  EDIT_GATE_OUT_SELF_TRANSPORT_ORIGINAL_QUANTITY,
  EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_ORIGINAL_AMOUNT,
  EDIT_GATE_OUT_NIGHT_CHARGE,
  EDIT_GATE_OUT_TO_DEPOT_CODE,
  EDIT_GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE,
} from "../../actions/types";

const initialState = {
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
    gate_out_data: {
      pk: "",
      gate_pass_no: "",
      container: "",
      out_date: "",
      out_time: "",
      condition: "",
      to_depot_code: "",
      road_rail_to_location_code: "",
      grade: "",
      departed: "",
      destination: "",
      consignee: "",
      shipper: "",
      delivery: "",
      to_location_code: "",
      to_port_code: "",
      vessel_name: "",
      voyage_no: "",
      ro_ref: "",
      export_cargo: "",
      transporter_name: "",
      vehicle_no: "",
      driver_name: "",
      driver_license: "",
      driver_mobile_no: "",
      carrier_code: "",
      location: "",
      port_of_loading: "",
      port_of_discharge: "",
      booking_no: "",
      booking_date: "",
      booking_party: "",
      seal_no: "",
      remarks: "",
      image_url: "",
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
      is_night_charges_applied: false,
      is_amt_editable: true,
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
      remark: "",
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
    case "GET_GATE_OUT_CONTAINER_BY_DATE":
      return { ...state, selectedContainer: action.payload };

    case EDIT_GATE_OUT_LEASED_BOX:
      var leasedBox = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          leased_box: action.payload,
        },
      };
      return { ...state, selectedContainer: leasedBox };

    case "EDIT_GATE_OUT_DO_NOT_LIFT_REMARKS":
      var gateOutDoNotLiftRemarks = {
        ...state.selectedContainer,
        container_data: {
          ...state.selectedContainer.container_data,
          do_not_lift_remarks: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutDoNotLiftRemarks };
    // EIR DETAILS
    case EDIT_GATE_OUT_ADD_EIR_LINE:
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

    case EDIT_GATE_OUT_REMOVE_EIR_LINE:
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
    case EDIT_GATE_OUT_EIR_DAMAGE_CODE:
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

    case EDIT_GATE_OUT_EIR_LINE_DESCRIPTION:
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

    case EDIT_GATE_OUT_EIR_DATE:
      var eirDate = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_date: action.payload,
        },
      };
      return { ...state, selectedContainer: eirDate };
    case EDIT_GATE_OUT_EIR_TIME:
      var eirTime = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_time: action.payload,
        },
      };
      return { ...state, selectedContainer: eirTime };
    case EDIT_GATE_OUT_EIR_AMOUNT:
      var eirAmount = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          eir_amount: action.payload,
        },
      };
      return { ...state, selectedContainer: eirAmount };
    case EDIT_GATE_OUT_OFFLOAD_DATE:
      var offloadDate = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          offload_date: action.payload,
        },
      };
      return { ...state, selectedContainer: offloadDate };
    case EDIT_GATE_OUT_OFFLOAD_TIME:
      var offloadTime = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          offload_time: action.payload,
        },
      };
      return { ...state, selectedContainer: offloadTime };
    case EDIT_GATE_OUT_REPAIR_AMOUNT:
      var eirRepairAmount = {
        ...state.selectedContainer,
        eir_data: {
          ...state.selectedContainer.eir_data,
          repair_amount: action.payload,
        },
      };
      return { ...state, selectedContainer: eirRepairAmount };

    // GATE OUT DETAILS
    case EDIT_GATE_OUT_TO_DEPOT_CODE:
      var toDepotCode = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          to_depot_code: action.payload,
        },
      };
      return { ...state, selectedContainer: toDepotCode };
    case EDIT_GATE_OUT_ROAD_RAIL_TO_LOCATION_CODE:
      var roadRailCode = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          road_rail_to_location_code :action.payload,
        },
      };
      return {...state,selectedContainer:roadRailCode}
    case EDIT_GATE_OUT_DATE:
      var gateOutDate = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          out_date: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutDate };
    case EDIT_GATE_OUT_TIME:
      var gateOutTime = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          out_time: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutTime };
    case EDIT_GATE_CONDITION:
      var gateOutCondition = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          condition: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutCondition };
    case EDIT_GATE_OUT_GRADE:
      var gateOutGrade = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          grade: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutGrade };
    case EDIT_GATE_OUT_CONSIGNOR:
      var gateOutConsignor = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          consignee: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutConsignor };

    case EDIT_GATE_OUT_SHIPPER:
      var gateOutShipper = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          shipper: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutShipper };
    case EDIT_GATE_OUT_DEPARTED:
      var gateOutSource = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          departed: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutSource };
    case EDIT_GATE_OUT_DESTINATION:
      var gateOutSourceEdit = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          destination: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutSourceEdit };
    case EDIT_GATE_OUT_DELIVERY:
      var gateOutDelivery = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          delivery: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutDelivery };
    case EDIT_GATE_OUT_TO_LOCATION_CODE:
      var gateOutToLocationCode = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          to_location_code: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutToLocationCode };
    case EDIT_TO_PORT_CODE:
      var gateOutToPortCode = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          to_port_code: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutToPortCode };
    case EDIT_GATE_OUT_VESSEL_NAME:
      var gateOutVesselName = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          vessel_name: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutVesselName };
    case EDIT_GATE_OUT_VOYAGE_NUMBER:
      var gateOutVoyageNumber = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          voyage_no: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutVoyageNumber };
    case EDIT_GATE_OUT_RO_REF:
      var gateOutRORef = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          ro_ref: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutRORef };
    case EDIT_GATE_OUT_EXPORT_CARGO:
      var gateOutExportCargo = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          export_cargo: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutExportCargo };
    case EDIT_GATE_OUT_TRANSPORTER_NAME:
      var gateOutTransporterName = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          transporter_name: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutTransporterName };
    case EDIT_GATE_OUT_VEHICLE_NUMBER:
      var gateOutVehicleNumber = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          vehicle_no: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutVehicleNumber };
    case EDIT_GATE_OUT_LICENSE_IMAGE:
      var gateOutLicenseImage = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          image_url: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutLicenseImage };
    case EDIT_GATE_OUT_DRIVER_NAME:
      var gateOutDriverName = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          driver_name: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutDriverName };
    case EDIT_GATE_OUT_DRIVER_MOBILE:
      var gateOutDriverMobile = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          driver_mobile_no: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutDriverMobile };
    case EDIT_GATE_OUT_DRIVER_LICENSE_NUMBER:
      var gateOutDriverLicenseNumber = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          driver_license: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutDriverLicenseNumber };
    case EDIT_GATE_OUT_CARRIER_CODE:
      var gateOutCarrierCode = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          carrier_code: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutCarrierCode };
    case EDIT_GATE_OUT_LOCATION:
      var gateOutLocation = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          location: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutLocation };
    case EDIT_GATE_OUT_PORT_OF_LOADING:
      var gateOutPortOfLoading = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          port_of_loading: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutPortOfLoading };
    case EDIT_GATE_OUT_PORT_OF_DISCHARGE:
      var gateOutPortOfDischarge = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          port_of_discharge: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutPortOfDischarge };

    case EDIT_GATE_OUT_SEAL_NUMBER:
      var gateOutSealNumber = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          seal_no: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutSealNumber };

    case EDIT_GATE_OUT_REMARK:
      var gateOutRemark = {
        ...state.selectedContainer,
        gate_out_data: {
          ...state.selectedContainer.gate_out_data,
          remarks: action.payload,
        },
      };
      return { ...state, selectedContainer: gateOutRemark };

    // lOLO
    case EDIT_GATE_OUT_LOLO_CUSTOMER_NAME:
      var loloCustomerName = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          customer_name: action.payload,
        },
      };
      return { ...state, selectedContainer: loloCustomerName };

    case "EDIT_GATE_OUT_LOLO_APPLY_CHARGES":
      var editLoLoApplyCharges = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          apply_charges: action.payload,
        },
      };
      return { ...state, selectedContainer: editLoLoApplyCharges };

    case "GATE_OUT_NIGHT_CHARGE":
      var editNightChargesCharges = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          is_night_charges_applied: action.payload,
        },
      };
      return { ...state, selectedContainer: editNightChargesCharges };

    case EDIT_GATE_OUT_NIGHT_CHARGE:
      var editNightChargesChargess = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          is_night_charges_applied: action.payload,
        },
      };
      return { ...state, selectedContainer: editNightChargesChargess };

    case EDIT_GATE_OUT_LOLO_INVOICE_DATE:
      var loloInvoiceDate = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          invoice_date: action.payload,
        },
      };
      return { ...state, selectedContainer: loloInvoiceDate };
    case EDIT_GATE_OUT_LOLO_RECEIPT_DATE:
      var loloReceiptDate = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          receipt_date: action.payload,
        },
      };
      return { ...state, selectedContainer: loloReceiptDate };
    case EDIT_GATE_OUT_LOLO_PAYMENT_TYPE:
      var loloPaymentType = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          payment_type: action.payload,
        },
      };
      return { ...state, selectedContainer: loloPaymentType };
    case EDIT_GATE_OUT_LOLO_TYPE:
      var loloType = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_type: action.payload,
        },
      };
      return { ...state, selectedContainer: loloType };
    case EDIT_GATE_OUT_LOLO_AMOUNT:
      var loloAmount = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_amount: action.payload,
        },
      };
      return { ...state, selectedContainer: loloAmount };
    case EDIT_GATE_OUT_LOLO_REMARK:
      var loloRemark = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_amount: action.payload,
        },
      };
      return { ...state, selectedContainer: loloRemark };
    case EDIT_GATE_OUT_LOLO_CHEQUE_NUMBER:
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

    case EDIT_GATE_OUT_LOLO_QUANTITY:
      var editLoloQuantity = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            remaining: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloQuantity };
    case EDIT_GATE_OUT_LOLO_UTR_NUMBER:
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
    case EDIT_GATE_OUT_LOLO_ORIGINAL_QUANTITY:
      var editLoloOriginalQuantity = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: {
            ...state.selectedContainer.lolo_data.lolo_payment,
            quantity: action.payload,
          },
        },
      };
      return { ...state, selectedContainer: editLoloOriginalQuantity };

    case EDIT_GATE_OUT_LOLO_CHEQUE_AMOUNT:
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
    case EDIT_GATE_OUT_LOLO_ORIGINAL_AMOUNT:
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
    case EDIT_GATE_OUT_LOLO_BANK_NAME:
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
    case EDIT_GATE_OUT_LOLO_CHEQUE_DATE:
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
    case EDIT_GATE_OUT_LOLO_ACCOUNT_NAME:
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
    case "EDIT_GATE_OUT_LOLO_PAYMENT_ACCOUNT_NUMBER":
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

    case "UPDATE_OUT_EDIT_CHEQUE_DETAILS":
      var updateChequeOut = {
        ...state.selectedContainer,
        lolo_data: {
          ...state.selectedContainer.lolo_data,
          lolo_payment: action.payload,
        },
      };
      return { ...state, selectedContainer: updateChequeOut };

    case EDIT_GATE_OUT_SELF_TRANSPORT_UTR_NO:
      var editSelfTransportUTRNumber = {
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
      return { ...state, selectedContainer: editSelfTransportUTRNumber };

    case "UPDATE_GATE_OUT_EDIT_CHEQUE_DETAILS_SELF_TRANSPORTATION":
      var updateOutChequeSelfTransport = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          self_transportation_payment: action.payload,
        },
      };
      return { ...state, selectedContainer: updateOutChequeSelfTransport };

    // SELF TRANSPORT
    case "EDIT_GATE_OUT_SELF_TRANSPORT_APPLY_CHARGES":
      var editSelfTransportApplyCharges = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          apply_charges: action.payload,
        },
      };
      return { ...state, selectedContainer: editSelfTransportApplyCharges };

    case EDIT_GATE_OUT_SELF_TRANSPORT_CUSTOMER_NAME:
      var selftransportCustomerName = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          customer_name: action.payload,
        },
      };
      return { ...state, selectedContainer: selftransportCustomerName };
    case EDIT_GATE_OUT_SELF_TRANSPORT_RECEIPT_DATE:
      var selfTransportReceiptDate = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          receipt_date: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportReceiptDate };
    case EDIT_GATE_OUT_SELF_TRANSPORT_PAYMENT_TYPE:
      var selfTransportPaymentType = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          payment_type: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportPaymentType };
    case EDIT_GATE_OUT_SELF_TRANSPORT_TRANSPORTER:
      var selfTransportTransporter = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          transporter: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportTransporter };
    case EDIT_GATE_OUT_SELF_TRANSPORT_ORIGIN:
      var selfTransportOrigin = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          origin: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportOrigin };
    case EDIT_GATE_OUT_SELF_TRANSPORT_PRICE:
      var selfTransportPrice = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          price: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportPrice };

    case EDIT_GATE_OUT_SELF_TRANSPORT_REMARK:
      var selfTransportRemark = {
        ...state.selectedContainer,
        self_transportation_data: {
          ...state.selectedContainer.self_transportation_data,
          remark: action.payload,
        },
      };
      return { ...state, selectedContainer: selfTransportRemark };
    case EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_NUMBER:
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

    case EDIT_GATE_OUT_SELF_TRANSPORT_QUANTITY:
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
    case EDIT_GATE_OUT_SELF_TRANSPORT_ORIGINAL_QUANTITY:
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
    case EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_AMOUNT:
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
    case EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_ORIGINAL_AMOUNT:
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
    case EDIT_GATE_OUT_SELF_TRANSPORT_BANK_NAME:
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
    case EDIT_GATE_OUT_SELF_TRANSPORT_CHEQUE_DATE:
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
    case EDIT_GATE_OUT_SELF_TRANSPORT_ACCOUNT_NAME:
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
    case "EDIT_GATE_OUT_SELF_TRANSPORT_PAYMENT_ACCOUNT_NUMBER":
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

    case "RESET_GATE_OUT_UPDATE_FORM":
      return initialState;

    default:
      return { ...state };
  }
};
