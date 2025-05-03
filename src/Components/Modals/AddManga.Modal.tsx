import React, { Ref } from "react";
import ReactDOM from "react-dom";
import { Autocomplete, AvailableManga } from "../Autocomplete";
import { CloseButton } from "../Buttons/CloseButton";
import { MangaCard } from "../Posters";

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
  onClose: () => void,
  loading: boolean
  setSearchTerm: (searchTerm: string) => void;
  availableMangas: AvailableManga[];
  addMangaChaptersRef: Ref<HTMLInputElement>;
}

export const AddMangaModal: React.FC<AddMangaModalProps> = ({ addManga, open, onClose, loading, setSearchTerm, availableMangas, addMangaChaptersRef }) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <div className="modalWrapper" />
      <CloseButton onClose={onClose} />
      <div style={MODAL_STYLES_1}>
        <Autocomplete
          items={availableMangas}
          onSelect={(item) => {
            setSearchTerm(item?.label || "");
          }}
        ></Autocomplete>
        <input
          ref={addMangaChaptersRef}
          placeholder={"Chapters (a-b, Latest, First)"}
        ></input>
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
              className={"buttonBasic"}
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

