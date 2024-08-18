import {
  faArrowsLeftRight,
  faArrowsUpDown,
  faRightFromBracket,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Autocomplete from "react-autocomplete";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLongPress } from "use-long-press";
import "../node_modules/react-image-gallery/styles/css/image-gallery.css";
import CustomImageGallery from "./custom-image-gallery/image-gallery";
import { AddMangaModal, ReadMangaModal, SignupModal } from "./Modal";
import plusmanga from "./plusmanga.png";

axios.defaults.withCredentials = true;

let BACKENDHOST = "https://reallyfluffy.dev/api";
//let BACKENDHOST = "http://localhost:5000"

const imgStyles = {
  height: "225px",
  width: "150px",
  margin: "10px",
  borderRadius: "10px",
  cursor: "pointer",
};

const authButtonStyles = {
  width: "100px",
  "min-height": "35px",
  padding: "0",
  cursor: "pointer",
};

const navChaptersRight = {
  height: "40px",
  width: "40px",
  display: "flex",
  justifyContent: "center",
  transform: "translate(0, -50%)",
  "z-index": "1200",
  position: "absolute",
  right: 0,
  cursor: "pointer",
};

const navChaptersLeft = {
  height: "40px",
  width: "40px",
  display: "flex",
  justifyContent: "center",
  transform: "translate(0, -50%)",
  "z-index": "1200",
  position: "absolute",
  left: 0,
  cursor: "pointer",
};

const dropDownStyle = {
  //borderRadius: '3px',
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
  background: "rgba(255, 255, 255, 0.9)",
  //padding: '2px 0',
  fontSize: "90%",
  overflow: "auto",
  maxHeight: "200px", // TODO: don't cheat, let it flow to the bottom
  maxWidth: "400px",
};

function App() {
  let clickTimeout = null;
  let clickTimeout2 = null;

  const addMangaRef = useRef();
  const addMangaChaptersRef = useRef();

  const usernameRef = useRef();
  const passwordRef = useRef();

  const scrollRef = useRef();

  const pagePreviousRef = useRef({});
  const scrollPreviousRef = useRef({});
  const isOpenReadMangaPreviousRef = useRef(false);
  const firstPageLoadRef = useRef(true);

  const [chapter, setChapter] = useState({});
  const [chapterNumber, setCurrentChapterNumber] = useState({});
  const [mangas, addManga] = useState([]);
  const [manga, setManga] = useState([]);
  const [currentManga, setCurrentManga] = useState("");
  const [currentPage, setCurrentPage] = useState({});
  const [currentOffset, setCurrentOffset] = useState({});
  const [isOpenSignup, setOpenSignup] = useState(false);
  const [isOpenAddManga, setOpenAddManga] = useState(false);
  const [isOpenReadManga, setOpenReadManga] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleLogin, setVisibleLogin] = useState(false);
  const [visibleLogout, setVisibleLogout] = useState(true);
  const [lastPage, setlastPage] = useState(false);
  const [firstPage, setFirstPage] = useState(false);
  const [showIndex, toggleShowIndex] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [queryTerm, setQueryTerm] = useState("");
  const [done, setDone] = useState(false);
  const [availableMangas, setAvailableMangas] = useState([]);
  const [fullScreen, setFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fillScreen, setFillScreen] = useState(false);
  const [longpressed, setLongPressed] = useState(false);
  const [currentlyFetching, setCurrentlyFetching] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("horizontal");

  useEffect(() => {
    initPage();
    saveState(chapter, currentManga, currentPage, currentOffset);
    slideToChapter(visible, isOpenReadManga);
  }, [
    currentPage,
    currentOffset,
    chapter,
    currentManga,
    isOpenReadManga,
    visible,
  ]);

  function slideToChapter(visible, isOpenReadManga) {
    if (visible) {
      scrollRef.current.scrollIntoView();
      return;
    }
    if (isOpenReadManga && window.innerWidth > "828") {
      scrollRef.current.scrollIntoView();
      return;
    }
  }

  async function getQueryFromSearch(term) {
    let queryTerm;
    for (const manga of availableMangas) {
      if (manga.label === term) {
        queryTerm = manga.id;
      }
    }
    return queryTerm;
  }

  const axiosInstance = axios.create({
    baseURL: BACKENDHOST,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      config.headers = {
        Authorization: localStorage.getItem("jwt") || "",
      };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  function saveState(chapter, currentManga, currentPage, currentScrollOffset) {
    if (
      JSON.stringify(currentPage) !== JSON.stringify(pagePreviousRef.current) ||
      JSON.stringify(currentScrollOffset) !==
        JSON.stringify(scrollPreviousRef.current)
    ) {
      axiosInstance.post(`/save`, {
        name: currentManga,
        chapterNumber: chapterNumber,
        chapter: chapter,
        page: currentPage,
        scrollOffset: currentScrollOffset,
      });

      pagePreviousRef.current = currentPage;
    }
  }

  function updateDefaultValues(scrollDirectionPassed) {
    axiosInstance.post("/saveDefaultValues", {
      scrollPreference: scrollDirectionPassed,
    });
  }

  async function signup() {
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    if (!username) {
      toast("Please enter a username", { type: "error" });
    }

    if (!password) {
      toast("Please enter a password", { type: "error" });
    }

    return axiosInstance
      .post(`/signup`, {
        username: username,
        password: password,
      })
      .then(async (response) => {
        firstPageLoadRef.current = true;
        saveToken(response.data.token);
        initPage();
        setCurrentUser(response.data.username);
        setOpenSignup(false);
      });
  }

  function saveToken(token) {
    localStorage.setItem("jwt", token);
  }

  async function signin() {
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;

    if (!username) {
      toast("Please enter a username", { type: "error" });
    }

    if (!password) {
      toast("Please enter a password", { type: "error" });
    }

    return axiosInstance
      .post(`/login`, {
        username: username,
        password: password,
      })
      .then(async (response) => {
        if (response.data === "Wrong password") {
          toast("Username or passowrd incorrect", { type: "error" });
          return;
        }
        saveToken(response.data.token);
        firstPageLoadRef.current = true;
        initPage();
        setCurrentUser(response.data.username);
        setOpenSignup(false);
      });
  }

  async function logout() {
    return axiosInstance.post(`/logout`, {}).then((response) => {
      localStorage.removeItem("jwt");
      firstPageLoadRef.current = true;
      setCurrentUser("");
      initPage();
    });
  }

  async function initPage(key) {
    if (firstPageLoadRef.current === true) {
      firstPageLoadRef.current = false;
      return axiosInstance
        .get(`/`, {})
        .then((response) => {
          addManga([
            ...response.data.posters,
            { id: "addManga", name: "addManga", poster: plusmanga },
          ]);
          if (response.data.state.currentChapter) {
            setChapter(response.data.state.currentChapter);
            setCurrentChapterNumber(response.data.state.currentChapterNumber);
          }
          if (response.data.state.currentPage) {
            setCurrentPage(response.data.state.currentPage);
            pagePreviousRef.current = response.data.state.currentPage;
          }
          if (response.data.state.currentScrollOffset) {
            setCurrentOffset(response.data.state.currentScrollOffset);
            scrollPreviousRef.current = response.data.state.currentScrollOffset;
          }
          setCurrentUser(response.data.username);
          setVisibleLogin(false);
          setVisibleLogout(true);
          setAvailableMangas(response.data.availableMangas);
          setDone(true);
          setScrollDirection(response.data.scrollPreference);
        })
        .catch((error) => {
          if (
            error.message === "Expired token" ||
            error.message === "Forbidden error. Token could not be verified"
          ) {
            localStorage.removeItem("jwt");
          }

          setChapter({});
          setCurrentChapterNumber({});
          addManga([]);
          setManga([]);
          setCurrentManga("");
          setCurrentPage({});
          setlastPage(false);
          toggleShowIndex(false);
          setVisibleLogin(true);
          setVisibleLogout(false);
        });
    }
  }

  async function addNewManga() {
    const mangaName = await getQueryFromSearch(searchTerm);
    setLoading(true);
    if (!mangaName) {
      toast("Make sure the name is in the list", { type: "error" });
      setLoading(false);
      return;
    }
    const addMangaChapters = addMangaChaptersRef.current.value.toLowerCase();

    if (
      !addMangaChapters.includes("-") &&
      addMangaChapters !== "latest" &&
      addMangaChapters !== "first"
    ) {
      toast("Incorrect input format", { type: "error" });
      console.log("Incorrect input format");
      setLoading(false);
      return;
    }

    if (mangaName === "") {
      toast("Make sure the name is in the list", { type: "error" });
      console.log("empty manga name in add manga");
      setLoading(false);
      return;
    }

    setCurrentlyFetching(true);

    return axiosInstance
      .post(`/addManga`, {
        name: mangaName,
        chapters: addMangaChapters,
      })
      .then((response) => {
        if (response.data?.chapters?.lenght === 0) {
          toast("Something went wrong", { type: "error" });
        }

        setCurrentlyFetching(false);

        toast("Manga added", { type: "success" });

        setLoading(false);
        firstPageLoadRef.current = true;
        initPage();
        setOpenAddManga(false);
      });
  }

  async function addChapters() {
    const mangaName = currentManga;
    const newChapters = `${manga.at(-1)}-${parseInt(manga.at(-1)) + 10}`;
    setLoading(true);

    setCurrentlyFetching(true);

    return axiosInstance
      .post(`/addManga`, {
        name: mangaName,
        chapters: newChapters,
      })
      .then((response) => {
        setCurrentlyFetching(false);

        if (manga.length === response.data.chapters.length) {
          toast("No new chapters released", { type: "info" });
        } else {
          toast("Chapters added", { type: "success" });
        }

        setLoading(false);
        setManga(response.data.chapters);
      });
  }

  async function getManga(mangaName) {
    if (mangaName === "") {
      console.log("empty manga name in get manga");
      return;
    }
    return axiosInstance
      .get(`/getManga`, {
        params: {
          name: mangaName,
        },
      })
      .then((response) => {
        return response.data;
      });
  }

  async function deleteManga(mangaName) {
    return axiosInstance
      .post(`/deleteManga`, {
        name: mangaName,
      })
      .then((response) => {
        firstPageLoadRef.current = true;
        initPage();
      });
  }

  async function getChapter(mangaName, chapterToGet) {
    if (currentlyFetching) {
      toast("Please wait until new chapters are retrieved", { type: "info" });
      return;
    }

    if (chapterToGet === "") return;
    return axiosInstance
      .get(`/getChapter`, {
        params: {
          name: mangaName,
          chapter: chapterToGet,
        },
      })
      .then((response) => {
        if (!response?.data?.links) {
          toast("Please retrieve further chapters", { type: "error" });
        } else {
          console.log(response.data.links);
          setChapter({ ...chapter, [mangaName]: response.data.links });
          setCurrentPage({ ...currentPage, [mangaName]: 0 });
          setCurrentChapterNumber({
            ...chapterNumber,
            [mangaName]: response.data.chapter,
          });
          setlastPage(false);
        }
      });
  }

  async function onCloseModal() {
    if (currentlyFetching) {
      toast("Please wait until new chapters are retrieved", { type: "info" });
      return;
    }

    setOpenReadManga(false);
    setVisible(false);
    document.documentElement.style.overflow = "scroll";
    document.body.scroll = "yes";
  }

  async function openReadManga(name) {
    if (currentlyFetching) {
      toast("Please wait until new manga is added", { type: "info" });
      return;
    }

    console.log("called");
    if (name === "addManga") {
      setOpenAddManga(true);
    } else {
      setCurrentManga(name);
      if (!chapter[name]) {
        await setChapter({ ...chapter, [name]: [] });
      }

      await navigator.wakeLock.request();

      const manga = await getManga(name);
      setManga(manga);
      setOpenReadManga(true);

      document.documentElement.style.overflow = "hidden";
      document.body.scroll = "no";
    }
  }

  function checkLastOrFirstPage(index) {
    if (index === chapter[currentManga].length - 1) {
      setlastPage(true);
      setFirstPage(false);
    } else if (index === 0) {
      setFirstPage(true);
      setlastPage(false);
    } else {
      setlastPage(false);
      setFirstPage(false);
    }
  }

  function updatePageOrOffset(page, offset) {
    console.log("updatePageOrOffset", page, offset);
    setCurrentPage({ ...currentPage, [currentManga]: page });
    setCurrentOffset({ ...currentOffset, [currentManga]: offset });
  }

  function handleClicks() {
    if (clickTimeout !== null && clickTimeout2 !== null) {
      console.log("triple click executes");

      setFillScreen(!fillScreen);

      clearTimeout(clickTimeout);
      clearTimeout(clickTimeout2);
      clickTimeout2 = null;
      clickTimeout = null;
      navigator.wakeLock.request();
    } else if (clickTimeout !== null) {
      clickTimeout2 = setTimeout(() => {
        if (!fullScreen) {
          //TODO: implement fullscreen
          setFullScreen(true);
        } else {
          //TODO: implement fullscreen
          setFullScreen(false);
        }
        clearTimeout(clickTimeout2);
        clickTimeout2 = null;
        navigator.wakeLock.request();
      }, 250);
    } else {
      console.log("single click");
      clickTimeout = setTimeout(() => {
        console.log("first click executes ");
        navigator.wakeLock.request();
        toggleShowIndex(!showIndex);
        clearTimeout(clickTimeout);
        clickTimeout = null;
      }, 500);
    }
  }

  const callback = React.useCallback(() => {
    setLongPressed(!longpressed);
  }, [longpressed]);

  const bind = useLongPress(callback, {
    onStart: () => console.log("Press started"),
    onFinish: () => console.log("Long press finished"),
    onCancel: () => console.log("Press cancelled"),
    onMove: () => console.log("Detected mouse or touch movement"),
    threshold: 550,
    cancelOnMovement: true,
  });

  const handleScrollDirectionChange = () => {
    if (scrollDirection === "horizontal") {
      setScrollDirection("vertical");
      updateDefaultValues("vertical");
    } else {
      setScrollDirection("horizontal");
      updateDefaultValues("horizontal");
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "center",
            backgroundColor: "cornflowerblue",
            position: "fixed",
            borderBottomLeftRadius: "5px",
            borderBottomRightRadius: "5px",
          }}
        >
          <button
            class="button-31"
            style={{
              ...authButtonStyles,
              width: "38px",
              left: "0",
              position: "absolute",
              backgroundColor: "#4c88f3",
            }}
            onClick={handleScrollDirectionChange}
          >
            {scrollDirection === "horizontal" && (
              <FontAwesomeIcon
                icon={faArrowsLeftRight}
                style={{
                  left: "50%",
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
            {scrollDirection === "vertical" && (
              <FontAwesomeIcon
                icon={faArrowsUpDown}
                style={{
                  left: "50%",
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}
          </button>
          <span style={{ fontSize: "30px", color: "white" }}>
            {currentUser}
          </span>
          {visibleLogout && (
            <button
              class="button-31"
              style={{
                ...authButtonStyles,
                width: "38px",
                right: "0",
                position: "absolute",
                backgroundColor: "#4c88f3",
              }}
              onClick={() => logout()}
            >
              <FontAwesomeIcon
                icon={faRightFromBracket}
                style={{
                  left: "50%",
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </button>
          )}
        </div>
        <div class="posters">
          {mangas.map((manga) => (
            <div style={{ display: "flex" }}>
              <img
                style={imgStyles}
                onClick={() => openReadManga(manga.name)}
                {...bind()}
                alt={""}
                key={manga.id}
                name={manga.name}
                src={manga.poster}
              />
              {longpressed && manga !== mangas[mangas.length - 1] && (
                <button
                  style={{
                    height: "30px",
                    width: "45px",
                    "margin-top": "10px",
                    "margin-left": "-45px",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                  onClick={() => deleteManga(manga.name)}
                >
                  <FontAwesomeIcon icon={faTrash} size="xl" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {visibleLogin && (
        <button
          class="button-31"
          style={{
            ...authButtonStyles,
            top: "50%",
            transform: "translate(-50%,-50%)",
            position: "absolute",
            left: "50%",
          }}
          onClick={() => setOpenSignup(true)}
        >
          Sign in
        </button>
      )}

      <AddMangaModal
        addManga={addNewManga}
        open={isOpenAddManga}
        onClose={() => setOpenAddManga(false)}
        loading={loading}
      >
        {done && (
          <Autocomplete
            items={availableMangas}
            shouldItemRender={(item, value) =>
              item.label.toLowerCase().indexOf(value.toLowerCase()) > -1 &&
              value.length > 2
            }
            getItemValue={(item) => item.label}
            renderItem={(item, highlighted) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: highlighted ? "#6495ed" : "transparent",
                }}
              >
                {item.label}
              </div>
            )}
            renderInput={function (props) {
              return <input placeholder="MangaName" {...props} />;
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSelect={(value, item) => {
              setSearchTerm(value);
              setQueryTerm(item.id);
            }}
            menuStyle={dropDownStyle}
            sortItems={(a, b, value) => {
              return a.label.length - b.label.length;
            }}
            renderMenu={function (items, value, style) {
              return (
                <div style={{ ...style, ...this.menuStyle }} children={items} />
              );
            }}
          />
        )}
        <input
          ref={addMangaChaptersRef}
          placeholder={"Chapters (a-b, Latest, First)"}
        ></input>
      </AddMangaModal>

      <SignupModal
        signup={signup}
        signin={signin}
        open={isOpenSignup}
        onClose={() => setOpenSignup(false)}
      >
        <input ref={usernameRef} placeholder={"Username"}></input>
        <input
          ref={passwordRef}
          type="password"
          placeholder={"Password"}
        ></input>
      </SignupModal>

      <ReadMangaModal
        open={isOpenReadManga}
        onClose={() => onCloseModal()}
        setVisible={() => {
          setVisible(!visible);
        }}
        zoomed={fillScreen}
        setScrollDirection={handleScrollDirectionChange}
      >
        {firstPage && (
          <>
            <button
              class="button-31"
              style={navChaptersRight}
              onClick={() =>
                getChapter(
                  currentManga,
                  parseInt(chapterNumber[currentManga]) - 1
                )
              }
            >
              &gt;
            </button>
          </>
        )}

        {
          //<ImageGallery flickThreshold={fillScreen? 100: 0.4} zoomed={fillScreen} swipeThreshold={100} additionalClass={fillScreen? "fillScreen": ""} lazyLoad={true} ref={i => imageGallery = i} showIndex={showIndex} onClick={()=> handleClicks()} onSlide={index => checkLastOrFirstPage(index)} items={chapter[currentManga]} isRTL={true} showThumbnails={false} showFullscreenButton={false} showPlayButton={false} showNav={false} slideDuration={300}></ImageGallery>
        }
        <CustomImageGallery
          startingIndex={currentPage[currentManga]}
          startingOffset={currentOffset[currentManga]}
          updatePageOrOffset={updatePageOrOffset}
          onClick={() => handleClicks()}
          fillScreen={fillScreen}
          images={chapter[currentManga]}
          scrollDirection={scrollDirection}
        ></CustomImageGallery>

        <div class="chaptersWrapper">
          <span style={{ color: "white", "margin-right": "50px" }}>
            {currentManga}
          </span>
          <div class="chapters">
            {manga.map((chapter) => {
              const color =
                chapter === chapterNumber[currentManga] ? "#ffa07a" : "";
              const ref =
                chapter === chapterNumber[currentManga] ? scrollRef : null;
              return (
                <button
                  ref={ref}
                  style={{ backgroundColor: color, cursor: "pointer" }}
                  class="button-31"
                  key={chapter}
                  onClick={() => getChapter(currentManga, chapter)}
                >
                  {chapter}
                </button>
              );
            })}
            {loading && (
              <>
                <div class="loadingBox">
                  <div class="lds-ring">
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
                  class="button-31"
                  style={{ cursor: "pointer" }}
                  key={"addChapters"}
                  onClick={() => addChapters()}
                >
                  Add Chapters{" "}
                </button>
              </>
            )}
          </div>
        </div>
        {lastPage && (
          <>
            <button
              class="button-31"
              style={navChaptersLeft}
              onClick={() =>
                getChapter(
                  currentManga,
                  parseInt(chapterNumber[currentManga]) + 1
                )
              }
            >
              &lt;
            </button>
          </>
        )}

        {visible && (
          <>
            <div class="chaptersWrapperSmallScreen">
              <span style={{ color: "white", "margin-right": "50px" }}>
                {currentManga}
              </span>
              <div class="chapters">
                {manga.map((chapter) => {
                  const color =
                    chapter === chapterNumber[currentManga] ? "#ffa07a" : "";
                  const ref =
                    chapter === chapterNumber[currentManga] ? scrollRef : null;
                  return (
                    <button
                      ref={ref}
                      style={{ backgroundColor: color, cursor: "pointer" }}
                      class="button-31"
                      key={chapter}
                      onClick={() => getChapter(currentManga, chapter)}
                    >
                      {chapter}
                    </button>
                  );
                })}
                {loading && (
                  <>
                    <div class="loadingBox">
                      <div class="lds-ring">
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
                      class="button-31"
                      style={{ cursor: "pointer" }}
                      key={"addChapters"}
                      onClick={() => addChapters()}
                    >
                      Add Chapters{" "}
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </ReadMangaModal>

      <ToastContainer position="top-right" theme="dark" autoClose={5000} />
    </>
  );
}

export default App;
