
import {
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { LongPressCallback, useLongPress } from "use-long-press";
import { ConfirmButton } from "./Buttons/ConfirmButton";

export interface MangaCard {
  id: string,
  label: string,
  poster: string
};

interface PostersProps {
  mangas: MangaCard[]
  openReadManga: (mangaLabel: string) => void
  deleteManga: (mangaLabel: string) => void
}

const imgStyles = {
  height: "225px",
  width: "150px",
  borderRadius: "10px",
  cursor: "pointer",
};

export const Posters: React.FC<PostersProps> = ({ mangas, openReadManga, deleteManga }) => {
  const [longpressed, setLongPressed] = useState(false);
  const justLongPressed = useRef(false);

  const callback = React.useCallback((event: any) => {
    justLongPressed.current = true;
    setLongPressed(!longpressed);
  }, [longpressed]);

  const bind = useLongPress(callback, {
    threshold: 550,
    cancelOnMovement: true,
  });

  return (
    <div className="posters">
      {mangas.map((manga) => (
        <div style={{ display: "flex" }}>
          <img
            style={imgStyles}
            onClick={() => {
              if (justLongPressed.current) {
                justLongPressed.current = false;
                return;
              }
              openReadManga(manga.label)
            }}
            {...bind()}
            alt={""}
            key={manga.id}
            src={manga.poster}
          />
          {longpressed && manga !== mangas[mangas.length - 1] && (
            <ConfirmButton
              onConfirm={() => deleteManga(manga.label)}
              buttonClassName="deleteButton"
              message={`Delete ${manga.label}`}
            >
              <FontAwesomeIcon icon={faTrash} size="xl" />
            </ConfirmButton>
          )}
        </div>
      ))
      }
    </div >
  )
}
