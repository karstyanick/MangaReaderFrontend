
import {
  faArrowsLeftRight,
  faArrowsUpDown,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface TopBarProps {
  scrollDirection: "horizontal" | "vertical"
  currentUser: string
  handleScrollDirectionChange: () => void;
  logout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ scrollDirection, currentUser, handleScrollDirectionChange, logout }) => {

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "cornflowerblue",
          position: "fixed",
          borderBottomLeftRadius: "5px",
          borderBottomRightRadius: "5px",
          height: "40px"
        }}
      >
        <button
          className="topBarButton scrollDirButton"
          onClick={handleScrollDirectionChange}
        >
          {scrollDirection === "horizontal" && (
            <FontAwesomeIcon icon={faArrowsLeftRight} />
          )}
          {scrollDirection === "vertical" && (
            <FontAwesomeIcon icon={faArrowsUpDown} />
          )}
        </button>
        <span style={{ fontSize: "30px", color: "white" }}>
          {currentUser}
        </span>
        <button
          className="topBarButton logoutButton"
          onClick={() => logout()}
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      </div>
    </div>)
}
