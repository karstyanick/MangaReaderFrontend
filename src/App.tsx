import {
  faArrowLeft,
  faArrowRight,
  faArrowsLeftRight,
  faArrowsUpDown,
  faRightFromBracket,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLongPress } from "use-long-press";
import { Autocomplete } from "./Autocomplete";
import CustomImageGallery from "./custom-image-gallery/image-gallery";
import { AddMangaModal, ReadMangaModal, SignupModal } from "./Modal";
import plusManga from "./plusmanga.png";

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

const authButtonStyles: React.CSSProperties = {
  width: "100px",
  minHeight: "40px",
  padding: "0",
  cursor: "pointer",
  borderRadius: "0px"
};

const navChaptersRight: React.CSSProperties = {
  height: "40px",
  width: "40px",
  display: "flex",
  justifyContent: "center",
  top: "50%",
  transform: "translate(0, -50%)",
  zIndex: "1200",
  position: "absolute",
  right: 0,
  cursor: "pointer",
};

const navChaptersLeft: React.CSSProperties = {
  height: "40px",
  width: "40px",
  display: "flex",
  justifyContent: "center",
  top: "50%",
  transform: "translate(0, -50%)",
  zIndex: "1200",
  position: "absolute",
  left: 0,
  cursor: "pointer",
};

export interface MangaChapters {
  [mangaName: string]: {
    original: string;
  }[];
};

export interface ChapterNumber {
  [mangaName: string]: string
};

export interface CurrentPage {
  [mangaName: string]: number
};

export interface CurrentOffset {
  [mangaName: string]: number
};

export interface MangaCard {
  id: string,
  label: string,
  poster: string
};

export interface AvailableManga {
  id: string,
  label: string
};

function App() {
  let clickTimeout: NodeJS.Timeout | null = null;
  let clickTimeout2: NodeJS.Timeout | null = null;

  const addMangaChaptersRef = useRef<HTMLInputElement | null>(null);

  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const scrollRef = useRef<HTMLButtonElement | null>(null);

  const pagePreviousRef = useRef({});
  const scrollPreviousRef = useRef({});
  const firstPageLoadRef = useRef(true);

  const [chapter, setChapter] = useState<MangaChapters>({});
  const [chapterNumber, setCurrentChapterNumber] = useState<ChapterNumber>({});
  const [mangas, addManga] = useState<MangaCard[]>([]);
  const [mangaChapterList, setMangaChapterList] = useState<string[]>([]);
  const [currentManga, setCurrentManga] = useState("");
  const [currentPage, setCurrentPage] = useState<CurrentPage>({});
  const [currentOffset, setCurrentOffset] = useState<CurrentOffset>({});
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
  const [done, setDone] = useState(false);
  const [availableMangas, setAvailableMangas] = useState<AvailableManga[]>([]);
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

  function slideToChapter(visible: boolean, isOpenReadManga: boolean) {
    if (visible && scrollRef?.current) {
      scrollRef.current.scrollIntoView();
      return;
    }
    if (isOpenReadManga && window.innerWidth > 828 && scrollRef?.current) {
      scrollRef.current.scrollIntoView();
      return;
    }
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

  function saveState(chapters: MangaChapters, currentManga: string, currentPage: CurrentPage, currentScrollOffset: CurrentOffset) {
    if (
      JSON.stringify(currentPage) !== JSON.stringify(pagePreviousRef.current) ||
      JSON.stringify(currentScrollOffset) !==
      JSON.stringify(scrollPreviousRef.current)
    ) {
      axiosInstance.post(`/save`, {
        name: currentManga,
        chapterNumber: chapterNumber,
        chapter: chapters,
        page: currentPage,
        scrollOffset: currentScrollOffset,
      });

      pagePreviousRef.current = currentPage;
    }
  }

  function updateDefaultValues(scrollDirection: "horizontal" | "vertical") {
    axiosInstance.post("/saveDefaultValues", {
      scrollPreference: scrollDirection,
    });
  }

  async function signup() {
    const username = usernameRef?.current?.value
    const password = passwordRef?.current?.value

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

  function saveToken(token: string) {
    localStorage.setItem("jwt", token);
  }

  async function signin() {
    const username = usernameRef?.current?.value;
    const password = passwordRef?.current?.value;

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
    return axiosInstance.post(`/logout`, {}).then(() => {
      localStorage.removeItem("jwt");
      firstPageLoadRef.current = true;
      setCurrentUser("");
      initPage();
    });
  }

  async function initPage() {
    if (firstPageLoadRef.current === true) {
      firstPageLoadRef.current = false;
      return axiosInstance
        .get(`/`, {})
        .then((response) => {
          addManga([
            ...response.data.posters,
            { id: "addManga", label: "addManga", poster: plusManga },
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
          setMangaChapterList([]);
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
    console.log(currentManga);
    const { id, label } = availableMangas.find(manga => manga.label === searchTerm) || { id: "", label: "" };
    setLoading(true);
    if (!id) {
      toast("Make sure the name is in the list", { type: "error" });
      setLoading(false);
      return;
    }
    const addMangaChapters = addMangaChaptersRef?.current?.value.toLowerCase();

    if (
      !addMangaChapters?.includes("-") &&
      addMangaChapters !== "latest" &&
      addMangaChapters !== "first"
    ) {
      toast("Incorrect input format", { type: "error" });
      console.log("Incorrect input format");
      setLoading(false);
      return;
    }

    if (id === "") {
      toast("Make sure the name is in the list", { type: "error" });
      console.log("empty manga name in add manga");
      setLoading(false);
      return;
    }

    setCurrentlyFetching(true);

    return axiosInstance
      .post(`/addManga`, {
        id,
        label,
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
    const { id, label } = availableMangas.find(manga => manga.label === currentManga) || { id: "", label: "" };
    const newChapters = `${mangaChapterList.at(-1)}-${parseInt(mangaChapterList.at(-1) || "0") + 10}`;
    setLoading(true);

    setCurrentlyFetching(true);

    return axiosInstance
      .post(`/addManga`, {
        id,
        label,
        chapters: newChapters,
      })
      .then((response) => {
        setCurrentlyFetching(false);

        if (mangaChapterList.length === response.data.chapters.length) {
          toast("No new chapters released", { type: "info" });
        } else {
          toast("Chapters added", { type: "success" });
        }

        setLoading(false);
        setMangaChapterList(response.data.chapters);
      });
  }

  async function getManga(mangaName: string) {
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

  async function deleteManga(mangaName: string) {
    return axiosInstance
      .post(`/deleteManga`, {
        name: mangaName,
      })
      .then(() => {
        firstPageLoadRef.current = true;
        initPage();
      });
  }

  async function getChapter(mangaName: string, chapterToGet: string) {
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
  }

  async function openReadManga(name: string) {
    if (currentlyFetching) {
      toast("Please wait until new manga is added", { type: "info" });
      return;
    }

    if (name === "addManga") {
      setOpenAddManga(true);
    } else {
      setCurrentManga(name);
      if (!chapter[name]) {
        setChapter({ ...chapter, [name]: [] });
      }

      await navigator.wakeLock.request();

      const manga = await getManga(name);
      setMangaChapterList(manga);
      setOpenReadManga(true);

      document.documentElement.style.overflow = "hidden";
    }
  }

  function checkFirstOrLastPage(index: number, offset: number, fullHeight: number) {
    if (index !== undefined) {
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

    if (offset !== undefined) {
      if (offset === fullHeight) {
        setlastPage(true);
        setFirstPage(false);
      } else if (offset === 0) {
        setFirstPage(true);
        setlastPage(false);
      } else {
        setlastPage(false);
        setFirstPage(false);
      }
    }
  }

  function updatePageOrOffset(page: number, offset: number) {
    setCurrentPage({ ...currentPage, [currentManga]: page });
    setCurrentOffset({ ...currentOffset, [currentManga]: offset });
  }

  function handleClicks() {
    if (clickTimeout !== null && clickTimeout2 !== null) {

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
        clearTimeout(clickTimeout2 as NodeJS.Timeout);
        clickTimeout2 = null;
        navigator.wakeLock.request();
      }, 250);
    } else {
      console.log("single click");
      clickTimeout = setTimeout(() => {
        console.log("first click executes ");
        navigator.wakeLock.request();
        toggleShowIndex(!showIndex);
        clearTimeout(clickTimeout as NodeJS.Timeout);
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
            alignItems: "center",
            backgroundColor: "cornflowerblue",
            position: "fixed",
            borderBottomLeftRadius: "5px",
            borderBottomRightRadius: "5px",
            height: "40px"
          }}
        >
          <button
            className="button-31"
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
              className="button-31"
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
        <div className="posters">
          {mangas.map((manga) => (
            <div style={{ display: "flex" }}>
              <img
                style={imgStyles}
                onClick={() => openReadManga(manga.label)}
                {...bind()}
                alt={""}
                key={manga.id}
                src={manga.poster}
              />
              {longpressed && manga !== mangas[mangas.length - 1] && (
                <button
                  style={{
                    height: "30px",
                    width: "45px",
                    marginTop: "10px",
                    marginLeft: "-45px",
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                  onClick={() => deleteManga(manga.label)}
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
          className="button-31"
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
              className="button-31"
              style={navChaptersRight}
              onClick={() =>
                getChapter(
                  currentManga,
                  `${parseInt(chapterNumber[currentManga]) - 1}`
                )
              }
            >
              <FontAwesomeIcon
                icon={faArrowRight}
                style={{
                  left: "50%",
                  top: "50%",
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                }}
              />
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
          checkFirstOrLastPage={checkFirstOrLastPage}
        ></CustomImageGallery>

        <div className="chaptersWrapper">
          <span style={{ color: "white", width: "100%", fontSize: "25px", marginBottom: "5px" }}>
            {currentManga}
          </span>
          <div className="chapters">
            {mangaChapterList.map((chapter) => {
              const color =
                chapter === chapterNumber[currentManga] ? "#ffa07a" : "";
              const ref =
                chapter === chapterNumber[currentManga] ? scrollRef : null;
              return (
                <button
                  ref={ref}
                  style={{ backgroundColor: color, cursor: "pointer" }}
                  className="button-31"
                  key={chapter}
                  onClick={() => getChapter(currentManga, chapter)}
                >
                  {chapter}
                </button>
              );
            })}
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
                  className="button-31"
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
              className="button-31"
              style={navChaptersLeft}
              onClick={() =>
                getChapter(
                  currentManga,
                  `${parseInt(chapterNumber[currentManga]) + 1}`
                )
              }
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                style={{
                  left: "50%",
                  top: "50%",
                  position: "absolute",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </button>
          </>
        )}

        {visible && (
          <>
            <div className="chaptersWrapperSmallScreen">
              <span style={{ color: "white", marginRight: "50px" }}>
                {currentManga}
              </span>
              <div className="chapters">
                {mangaChapterList.map((chapter) => {
                  const color =
                    chapter === chapterNumber[currentManga] ? "#ffa07a" : "";
                  const ref =
                    chapter === chapterNumber[currentManga] ? scrollRef : null;
                  return (
                    <button
                      ref={ref}
                      style={{ backgroundColor: color, cursor: "pointer" }}
                      className="button-31"
                      key={chapter}
                      onClick={() => getChapter(currentManga, chapter)}
                    >
                      {chapter}
                    </button>
                  );
                })}
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
                      className="button-31"
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

      {/* <div */}
      {/*   style={{ */}
      {/*     display: "flex", */}
      {/*     flexDirection: "row", */}
      {/*     width: "100%", */}
      {/*     justifyContent: "center", */}
      {/*     alignItems: "center", */}
      {/*     backgroundColor: "cornflowerblue", */}
      {/*     position: "fixed", */}
      {/*     bottom: "0", */}
      {/*     borderBottomLeftRadius: "5px", */}
      {/*     borderBottomRightRadius: "5px", */}
      {/*     height: "40px" */}
      {/*   }} */}
      {/* > */}
      {/* </div> */}
      <ToastContainer position="top-right" theme="dark" autoClose={5000} />
    </>
  );
}

export default App;
