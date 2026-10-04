import React, { useState } from "react";
import { Modal, ModalBody } from "reactstrap";

const ConfirmModal = (props) => {
  const [isConfirmModal, setIsConfirmModal] = useState(
    props.isOpenConfirmModal ? props.isOpenConfirmModal : false
  );
  const [dialogMassage, setDialogMassage] = useState(
    props.message ? props.message : ""
  );

  return (
    <div className="modal-dialog-box-container">
      <Modal
        isOpen={isConfirmModal}
        style={{ maxWidth: "500px", marginTop: "100px" }}
        className="upload-file-modal"
      >
        <ModalBody>
          <div
            className="file-process-container"
            style={{ textAlign: "center", padding: "20px" }}
          >
            <div className="confirmation-process-message">
              <h6>{dialogMassage}</h6>
            </div>
            <div className="btn-container">
              <button
                type="button"
                color="primary"
                className="btn btn-primary mr-3"
                style={{ marginRight: "15px" }}
                onClick={() => props.actionProcess(props.type)}
              >
                <i className="fa fa-save mr-1"></i>Yes
              </button>
              <button
                className="btn btn-danger"
                color="secondary"
                onClick={() => props.closeModal()}
              >
                <i className="fa fa-times mr-1"></i> No
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ConfirmModal;
