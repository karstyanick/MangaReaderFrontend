import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Sign } from "crypto";
import React from "react";
import ReactDOM from "react-dom";
import { CloseButton } from "../Buttons/CloseButton";

export const MODAL_STYLES_1: React.CSSProperties = {
  position: "fixed",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
};

export interface AddMangaModalProps {
  addManga: () => void,
  open: boolean,
  children: any,
  onClose: () => void,
  loading: boolean
}

export const AddMangaModal: React.FC<AddMangaModalProps> = ({ addManga, open, children, onClose, loading }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <div className="modalWrapper" />
      <CloseButton onClose={onClose} />
      <div style={MODAL_STYLES_1}>
        {children}
        {loading && (
          <>
            <div className="loadingBox">
              <div className="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </>
        )}
        {!loading && (
          <>
            <button
              className={"button-31"}
              style={{ marginTop: "5px" }}
              onClick={addManga}
            >
              Confirm
            </button>
          </>
        )}
      </div>
    </>,
    document.getElementById("portal") as HTMLElement
  );
}

