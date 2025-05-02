import React from "react";
import ReactDOM from "react-dom";
import {
  faBars,
  faMagnifyingGlassPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CloseButton } from "../Buttons/CloseButton";

export interface ReadMangaModalProps {
  open: boolean,
  children: any,
  onClose: () => void,
  setVisible: () => void,
  showZoomed: boolean;
  onZoomClicked: () => void,
}

export const ReadMangaModal: React.FC<ReadMangaModalProps> = ({
  children,
  open,
  onClose,
  setVisible,
  showZoomed,
  onZoomClicked
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
      {showZoomed && (
        <button onClick={onZoomClicked} className="topBarButton zoomIcon">
          <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
        </button>
      )}
      <CloseButton onClose={onClose} />
    </div>,
    document.getElementById("portal") as HTMLElement
  );
}
