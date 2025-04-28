import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Sign } from "crypto";
import React from "react";
import ReactDOM from "react-dom";

const MODAL_STYLES_1: React.CSSProperties = {
  position: "fixed",
  zIndex: 1000,
  display: "flex",
  flexDirection: "column",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
};

const CLOSE_STYLES: React.CSSProperties = {
  position: "fixed",
  right: "10px",
  top: "10px",
  width: "100px",
  zIndex: "1000",
};

const OVERLAY_STYLES: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0, .7)",
  zIndex: 1000,
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
      <div style={OVERLAY_STYLES} />
      <button className={"button-31"} style={CLOSE_STYLES} onClick={onClose}>
        Close
      </button>
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

export interface ReadMangaModalProps {
  open: boolean,
  children: any,
  onClose: () => void,
  setVisible: () => void,
  zoomed: boolean,
  setScrollDirection: () => void
}

export const ReadMangaModal: React.FC<ReadMangaModalProps> = ({
  children,
  open,
  onClose,
  setVisible,
  zoomed,
  setScrollDirection,
}) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <div style={OVERLAY_STYLES} />
      <div className={"openMangaWrapper"}>{children}</div>
      <button
        className="button-31 hiddenbutton"
        onClick={setVisible}
        style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, height: "40px" }}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      {/* <button class="button-31" style={{position: "fixed", zIndex: 1000, right: "50%", top:"0%", transform:"translate(50%, 0)", width: "0px", "minHeight": "0px", "minWidth": "0px", height:"35px", "fontSize": "small", display: "flex", "justifyContent": "center", alignItems:"center", borderTopLeftRadius: 0, borderTopRightRadius:0}} onClick={setScrollDirection}>
            <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
            </button> */}
      <button
        className={"button-31"}
        style={{
          position: "fixed",
          zIndex: 1000,
          right: "0%",
          top: "0%",
          width: "0px",
          minHeight: "0px",
          minWidth: "0px",
          height: "40px",
          fontSize: "small",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
        onClick={onClose}
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>
    </>,
    document.getElementById("portal") as HTMLElement
  );
}

export interface SignupModalProps {
  signin: () => void,
  signup: () => void,
  children: any,
  onClose: () => void,
  open: boolean
}

export const SignupModal: React.FC<SignupModalProps> = ({ signup, signin, children, open, onClose }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <div style={OVERLAY_STYLES} />
      <button className={"button-31"} style={CLOSE_STYLES} onClick={onClose}>
        Close
      </button>
      <div style={MODAL_STYLES_1}>
        {children}
        <button className={"button-31"} onClick={signup}>
          Signup
        </button>
        <button className={"button-31"} onClick={signin}>
          Singin
        </button>
      </div>
    </>,
    document.getElementById("portal") as HTMLElement
  );
}
