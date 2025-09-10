import {
  faArrowsLeftRight,
  faArrowsUpDown,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface TopBarProps {
  scrollDirection: "horizontal" | "vertical";
  currentUser: string;
  handleScrollDirectionChange: () => void;
  logout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  scrollDirection,
  currentUser,
  handleScrollDirectionChange,
  logout,
}) => {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,

          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",

          height: "calc(40px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",

          backgroundColor: "cornflowerblue",
          borderBottomLeftRadius: 5,
          borderBottomRightRadius: 5,
        }}
      >
        <button
          className="topBarButton scrollDirButton"
          style={{ position: "relative" }} // ensure no fixed/absolute
          onClick={handleScrollDirectionChange}
        >
          {scrollDirection === "horizontal" ? (
            <FontAwesomeIcon icon={faArrowsLeftRight} />
          ) : (
            <FontAwesomeIcon icon={faArrowsUpDown} />
          )}
        </button>

        <span
          style={{
            fontSize: 30,
            color: "white",
            margin: "0 12px",
          }}
        >
          {currentUser}
        </span>

        <button
          className="topBarButton logoutButton"
          style={{ position: "relative" }}
          onClick={logout}
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
        </button>
      </div>

      {/* Spacer so page content isn't hidden behind the fixed bar */}
      <div style={{ height: "calc(40px + env(safe-area-inset-top))" }} />
    </>
  );
};
