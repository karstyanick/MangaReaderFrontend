import React from "react";
import ReactDOM from "react-dom";
import { CloseButton } from "../Buttons/CloseButton";
import { MODAL_STYLES_1 } from "./AddManga.Modal";

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
      <div className="modal" />
      <CloseButton onClose={onClose} />
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
