
import React from "react";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CloseButtonProps {
  onClose: () => void
}

export const CloseButton: React.FC<CloseButtonProps> = ({ onClose }) => {

  return (
    <button
      className={"topBarButton closeButton"}
      onClick={onClose}
    >
      <FontAwesomeIcon icon={faTimes} size="lg" />
    </button>
  );
}
