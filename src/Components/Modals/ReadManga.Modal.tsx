import React from "react";
import ReactDOM from "react-dom";
import {
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CloseButton } from "../Buttons/CloseButton";

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
    <div className="modalWrapper">
      <div className={"openMangaWrapper"}>{children}</div>
      <button
        className="topBarButton chaptersButton"
        onClick={setVisible}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>
      <CloseButton onClose={onClose} />
    </div>,
    document.getElementById("portal") as HTMLElement
  );
}
