import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthForm } from "./Components/AuthForm";
import { AvailableManga } from "./Components/Autocomplete";
import { ChapterNumber, ChaptersList } from "./Components/ChaptersList";
import CustomImageGallery from "./Components/custom-image-gallery/image-gallery";
import { AddMangaModal } from "./Components/Modals/AddManga.Modal";
import { ReadMangaModal } from "./Components/Modals/ReadManga.Modal";
import { MangaCard, Posters } from "./Components/Posters";
import { TopBar } from "./Components/TopBar";
import plusManga from "./plusmanga.png";
axios.defaults.withCredentials = true;

let BACKENDHOST = "https://reallyfluffy.dev/api";
//let BACKENDHOST = "http://localhost:5000"

export interface MangaChapters {
  [mangaName: string]: {
    original: string;
  }[];
};

export interface CurrentPage {
  [mangaName: string]: number
};

function App() {

  const addMangaChaptersRef = useRef<HTMLInputElement | null>(null);

  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const pagePreviousRef = useRef({});
  const scrollPreviousRef = useRef({});

  const [chapter, setChapter] = useState<MangaChapters>({});
  const [chapterNumber, setCurrentChapterNumber] = useState<ChapterNumber>({});
  const [mangas, addManga] = useState<MangaCard[]>([]);
  const [mangaChapterList, setMangaChapterList] = useState<string[]>([]);
  const [currentManga, setCurrentManga] = useState("");
  const [currentPage, setCurrentPage] = useState<CurrentPage>({});
  const [isOpenAddManga, setOpenAddManga] = useState(false);
  const [isOpenReadManga, setOpenReadManga] = useState(false);
  const [visible, setVisible] = useState(false);
  const [lastPage, setlastPage] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableMangas, setAvailableMangas] = useState<AvailableManga[]>([]);
  const [loading, setLoading] = useState(false);
  const [fillScreen, setFillScreen] = useState(false);
  const [currentlyFetching, setCurrentlyFetching] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"horizontal" | "vertical">("horizontal");
  const [authenticated, setAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    saveState(chapter, currentManga, currentPage);
  }, [
    currentPage,
    chapter,
    currentManga,
  ]);

  useEffect(() => {
    initPage();
  }, []);

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

  function saveState(chapters: MangaChapters, currentManga: string, currentPage: CurrentPage, force: boolean = false, passNewChapterNumber?: { [mangaLabel: string]: number }) {
    if (
      JSON.stringify(currentPage) !== JSON.stringify(pagePreviousRef.current) || force
    ) {
      console.trace(`Saving from here`);
      axiosInstance.post(`/save`, {
        name: currentManga,
        chapterNumber: passNewChapterNumber || chapterNumber,
        chapter: chapters,
        page: currentPage,
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
        saveToken(response.data.token);
        initPage();
        setCurrentUser(response.data.username);
      });
  }

  function saveToken(token: string) {
    localStorage.setItem("jwt", token);
  }

  async function signin(username: string, password: string) {

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
        initPage();
        setCurrentUser(response.data.username);
      });
  }

  async function logout() {
    return axiosInstance.post(`/logout`, {}).then(() => {
      localStorage.removeItem("jwt");
      setCurrentUser("");
      initPage();
    });
  }

  async function initPage() {
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
          scrollPreviousRef.current = response.data.state.currentScrollOffset;
        }
        setCurrentUser(response.data.username);
        setAuthenticated(true)
        setAvailableMangas(response.data.availableMangas);
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
        setAuthenticated(false);
      })
      .finally(() => setAuthLoading(false));
  }

  async function addNewManga() {
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
      setLoading(false);
      return;
    }

    if (id === "") {
      toast("Make sure the name is in the list", { type: "error" });
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
          setChapter({ ...chapter, [mangaName]: response.data.links });
          setCurrentPage({ ...currentPage, [mangaName]: 0 });
          setCurrentChapterNumber({
            ...chapterNumber,
            [mangaName]: response.data.chapter,
          });
          saveState({ ...chapter, [mangaName]: response.data.links }, currentManga, { ...currentPage, [mangaName]: 0 }, true, {
            ...chapterNumber,
            [mangaName]: response.data.chapter
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
    document.documentElement.style.overflowY = "scroll";
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
      document.documentElement.style.overflowY = "hidden";
    }
  }

  function updatePageOrOffset(index: number) {
    setCurrentPage({ ...currentPage, [currentManga]: index });
  }

  const handleScrollDirectionChange = () => {
    if (scrollDirection === "horizontal") {
      setScrollDirection("vertical");
      updateDefaultValues("vertical");
    } else {
      setScrollDirection("horizontal");
      updateDefaultValues("horizontal");
    }
  };

  return <>
    {!authenticated && !authLoading &&
      < AuthForm
        signup={signup}
        signin={signin}
      />
    }
    {authenticated && (
      <>
        <TopBar
          currentUser={currentUser}
          scrollDirection={scrollDirection}
          handleScrollDirectionChange={handleScrollDirectionChange}
          logout={logout}
        />
        <Posters
          mangas={mangas}
          openReadManga={openReadManga}
          deleteManga={deleteManga}
        />
        <AddMangaModal
          addManga={addNewManga}
          open={isOpenAddManga}
          onClose={() => setOpenAddManga(false)}
          loading={loading}
          setSearchTerm={setSearchTerm}
          availableMangas={availableMangas}
          addMangaChaptersRef={addMangaChaptersRef}
        />
        <ReadMangaModal
          open={isOpenReadManga}
          onClose={() => onCloseModal()}
          setVisible={() => {
            setVisible(!visible);
          }}
          showZoomed={isOpenReadManga && fillScreen}
          onZoomClicked={() => { setFillScreen(false) }}
        >
          <ChaptersList
            currentManga={currentManga}
            mangaChapterList={mangaChapterList}
            chapterNumber={chapterNumber}
            getChapter={getChapter}
            loading={loading}
            lastPage={lastPage}
            addChapters={addChapters}
            visible={visible}
          />
          <CustomImageGallery
            startingIndex={currentPage[currentManga]}
            updatePage={updatePageOrOffset}
            fillScreen={fillScreen}
            images={chapter[currentManga]}
            scrollDirection={scrollDirection}
            onFillScreen={setFillScreen}
            getNextChapter={() => getChapter(currentManga, `${parseInt(chapterNumber[currentManga]) + 1}`)}
            getPrevChapter={() => getChapter(currentManga, `${parseInt(chapterNumber[currentManga]) - 1}`)}
          ></CustomImageGallery>
        </ReadMangaModal>
      </>
    )}
    <ToastContainer position="top-right" theme="dark" autoClose={5000} />
  </>
}

export default App;
