import React, { useState, useRef, useEffect  } from "react";
import axios from "axios";
import ImageGallery from 'react-image-gallery';
import "../node_modules/react-image-gallery/styles/css/image-gallery.css"
import {AddMangaModal, ReadMangaModal, SignupModal} from "./Modal"
import plusmanga from "./plusmanga.png"
import { isLabelWithInternallyDisabledControl } from "@testing-library/user-event/dist/utils";

axios.defaults.withCredentials = true

//let BACKENDHOST = "https://mangareaderbackend.lol"
let BACKENDHOST = "http://localhost:5000"

const imgStyles = {
  height:"300px",
  margin:"10px",
  "borderRadius": "10px",
  cursor: "pointer"
};

const authButtonStyles = {
  width: "100px",
  "min-height": "30px",
  padding: "0",
  cursor: "pointer"
}

const navChaptersRight = {
  height:"40px",
  width: "40px",
  display: "flex",
  "justifyContent": "center",
  top: "50%",
  transform: "translate(0, -50%)",
  "z-index": "1200",
  position: "absolute",
  right: 0,
  cursor: "pointer"
}

const navChaptersLeft = {
  height:"40px",
  width: "40px",
  display: "flex",
  "justifyContent": "center",
  top: "50%",
  transform: "translate(0, -50%)",
  "z-index": "1200",
  position: "absolute",
  left: 0,
  cursor: "pointer"
}

function App() {
  let imageGallery;


  const addMangaRef = useRef()
  const addMangaChaptersRef = useRef()

  const usernameRef = useRef()
  const passwordRef = useRef()

  const scrollRef = useRef()

  const pagePreviousRef = useRef({});
  const isOpenReadMangaPreviousRef = useRef(false)
  const firstPageLoadRef = useRef(true)

  const [chapter, setChapter] = useState({})
  const [chapterNumber, setCurrentChapterNumber] = useState({})
  const [mangas, addManga] = useState([{id: "addManga", name:"addManga", poster: plusmanga}])
  const [manga, setManga] = useState([])
  const [currentManga, setCurrentManga] = useState("")
  const [currentPage, setCurrentPage] = useState({})
  const [isOpenSignup, setOpenSignup] = useState(false)
  const [isOpenAddManga, setOpenAddManga] = useState(false)
  const [isOpenReadManga, setOpenReadManga] = useState(false)
  const [visible, setVisible] = useState(false);
  const [visibleLogin, setVisibleLogin] = useState(false)
  const [visibleLogout, setVisibleLogout] = useState(true)
  const [lastPage, setlastPage] = useState(false)
  const [firstPage, setFirstPage] = useState(false)
  const [showIndex, toggleShowIndex] = useState(false)
  const [currentUser, setCurrentUser] = useState("")

  useEffect(() => {
    initPage()
    saveState(currentPage, chapter, currentManga)
    slideToPage(isOpenReadManga, imageGallery, currentPage, currentManga)
    slideToChapter(visible, isOpenReadManga)
  }, [currentPage, chapter, currentManga, isOpenReadManga, imageGallery, visible])

  function slideToPage(isOpenReadManga, imageGallery, currentPage, currentManga){
    if(isOpenReadManga !== isOpenReadMangaPreviousRef.current){
      if(imageGallery){
        imageGallery.slideToIndex(currentPage[currentManga])
      }
      isOpenReadMangaPreviousRef.current = isOpenReadManga;
    }
  }

  function slideToChapter(visible, isOpenReadManga){


    console.log(`visible: ${visible}, isOpenReadManga:${isOpenReadManga}`)

    if(visible){
      scrollRef.current.scrollIntoView()
      return
    }
    
    console.log(window.innerWidth)

    if(isOpenReadManga && window.innerWidth > "828"){
      scrollRef.current.scrollIntoView()
      return
    }
  }

  function saveState(currentPage, chapter, currentManga) {

    if(JSON.stringify(currentPage) !== JSON.stringify(pagePreviousRef.current)){
      axios.post(`${BACKENDHOST}/save`, {
        "name": currentManga,
        "chapterNumber": chapterNumber,
        "chapter": chapter,
        "page": currentPage
      })

      pagePreviousRef.current = currentPage;
    }
  }

  async function signup(){
    const username = usernameRef.current.value
    const password = passwordRef.current.value

    return axios.post(`${BACKENDHOST}/signup`, {
        "username": username,
        "password": password
    }).then(response => {
        firstPageLoadRef.current = true
        initPage()
        setCurrentUser(response.data)
        setOpenSignup(false)
    })
  }

  async function signin(){
    const username = usernameRef.current.value
    const password = passwordRef.current.value

    return axios.post(`${BACKENDHOST}/login`, {
        "username": username,
        "password": password
    }).then(response => {
        if(response.data !== "Wrong password"){
          firstPageLoadRef.current = true
          initPage()
          setCurrentUser(response.data)
          setOpenSignup(false)
        }
    })
  }

  async function logout(){
    return axios.post(`${BACKENDHOST}/logout`,{
    }).then(response => {
      firstPageLoadRef.current = true
      setCurrentUser("")
      initPage()
    })
  }

  async function initPage(){
    if(firstPageLoadRef.current === true){
      firstPageLoadRef.current = false
      return axios.get(`${BACKENDHOST}/`, {
      })
      .then(response => {
          addManga(response.data.posters.concat(mangas))
          if(response.data.state.currentChapter){
            setChapter(response.data.state.currentChapter)
            setCurrentChapterNumber(response.data.state.currentChapterNumber)
          }
          if(response.data.state.currentPage){
            setCurrentPage(response.data.state.currentPage)
            pagePreviousRef.current = response.data.state.currentPage
          }
          setCurrentUser(response.data.username)
          setVisibleLogin(false)
          setVisibleLogout(true)
      })
      .catch( error => {
          setChapter({})
          setCurrentChapterNumber({})
          addManga([{id: "addManga", name:"addManga", poster: plusmanga}])
          setManga([])
          setCurrentManga("")
          setCurrentPage({})
          setlastPage(false)
          toggleShowIndex(false)
          setVisibleLogin(true)
          setVisibleLogout(false)
      })
    }
  }

  async function addNewManga(){
    const mangaName = addMangaRef.current.value
    const addMangaChapters = addMangaChaptersRef.current.value
    if (mangaName === ""){console.log("empty manga name in add manga"); return}
    return axios.post(`${BACKENDHOST}/addManga`, {
      "name": mangaName,
      "chapters": addMangaChapters
    }).then(response => {
      if(response.data !== "success"){
        mangas.pop()
        addManga([...mangas, response.data.metaData, {id: "addManga", name:"addManga", poster: plusmanga}])
      }
    })
  }

  async function addChapters(){
    const mangaName = currentManga
    const newChapters = `${manga.at(-1)}-${parseInt(manga.at(-1))+10}`
    
    return axios.post(`${BACKENDHOST}/addManga`, {
      "name": mangaName,
      "chapters": newChapters
    }).then(response => {
      setManga(response.data.chapters)
    })
  }

  async function getManga(mangaName){
    if (mangaName === ""){console.log("empty manga name in get manga"); return}
    return axios.get(`${BACKENDHOST}/getManga`, {
      params:{
        "name": mangaName,
      }
    }).then(response => {
      return response.data
    })
  }

  async function getChapter(mangaName, chapterToGet){
    if (chapterToGet === "")return
    return axios.get(`${BACKENDHOST}/getChapter`, {
      params:{
        "name": mangaName,
        "chapter": chapterToGet
      }
    }).then(response => {
      setChapter({...chapter, [mangaName]: response.data.links})
      setCurrentChapterNumber({...chapterNumber, [mangaName]: response.data.chapter})
      setlastPage(false)
    })
  }

  async function onCloseModal(){
    setOpenReadManga(false)
    setVisible(false)
    setCurrentPage({...currentPage, [currentManga]: imageGallery.getCurrentIndex()})
    document.documentElement.style.overflow = 'scroll';
    document.body.scroll = "yes";
  }

  async function openReadManga(name){
    console.log("called")
    if(name === "addManga"){
      setOpenAddManga(true)
    }else{
      setCurrentManga(name)
      if(!chapter[name]){
        await setChapter({...chapter, [name]: []})
      }
      
      await navigator.wakeLock.request();

      const manga = await getManga(name)
      setManga(manga)
      setOpenReadManga(true)

      document.documentElement.style.overflow = 'hidden';
      document.body.scroll = "no";
    }
  }

  function checkLastOrFirstPage(index){
    if(index===chapter[currentManga].length-1){
      setlastPage(true)
      setFirstPage(false)
    }
    else if(index===0){
      setFirstPage(true)
      setlastPage(false)
    }
    else{
      setlastPage(false)
      setFirstPage(false)
    }
  }

  return (
    <>

    <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
      <div style={{display: "flex", flexDirection: "row"}}>
        {visibleLogin && 
          <button class="button-31" style={{...authButtonStyles}} onClick={() => setOpenSignup(true)}>Sing in</button>
        }
        <span style={{ fontSize: "30px", color: "white" }}>{currentUser}</span>
        {visibleLogout &&
          <button class="button-31" style={{...authButtonStyles, right: "10px", position:"absolute"}} onClick={() => logout()}>Log out</button>
        }
      </div>
      <div class="posters">{mangas.map(manga => <img style = {imgStyles} onClick={() => openReadManga(manga.name)} alt={""} key={manga.id} name={manga.name} src={manga.poster}/>)}</div>
    </div>

    

    <AddMangaModal addManga={addNewManga} open={isOpenAddManga} onClose={() => setOpenAddManga(false)}>
      <input ref={addMangaRef} placeholder={"Manga"}></input>
      <input ref={addMangaChaptersRef} placeholder={"ChapterRange (a-b)"}></input>
    </AddMangaModal>

    <SignupModal signup={signup} signin={signin} open={isOpenSignup} onClose={() => setOpenSignup(false)}>
      <input ref={usernameRef} placeholder={"Username"}></input>
      <input ref={passwordRef} placeholder={"Password"}></input>
    </SignupModal>

    <ReadMangaModal open={isOpenReadManga} onClose={() => onCloseModal()} setVisible={()=> {setVisible(!visible)}}>
      {firstPage &&<>
        <button class="button-31" style={navChaptersRight} onClick={() => getChapter(currentManga, parseInt(chapterNumber[currentManga])-1)}>&gt;</button>
        </>
      }
      <div>
      <ImageGallery lazyLoad={true} style={{cursor: "pointer"}} ref={i => imageGallery = i} showIndex={showIndex} onClick={()=> toggleShowIndex(!showIndex)} onSlide={index => checkLastOrFirstPage(index)} items={chapter[currentManga]} isRTL={true} showThumbnails={false} showFullscreenButton={false} showPlayButton={false} showNav={false} slideDuration={300}></ImageGallery>
      </div>
      <div class = "chaptersWrapper">
      <span style = {{color:"white", "margin-right": "50px"}}>{currentManga}</span>
      <div class = "chapters">
      {manga.map(chapter => {
        const color = (chapter === chapterNumber[currentManga]) ? "#ffa07a" : ""
        const ref = (chapter === chapterNumber[currentManga]) ? scrollRef : null
        return <button ref={ref} style={{backgroundColor:color, cursor: "pointer"}}class="button-31" key={chapter} onClick={() => getChapter(currentManga, chapter)}>{chapter}</button>
      })}
      <button class="button-31" key={"addChapters"} style={{cursor: "pointer"}} onClick={() => addChapters()}>Add 10 Chapters </button>
      </div>
      </div>
      {lastPage &&<>
        <button class="button-31" style={navChaptersLeft} onClick={() => getChapter(currentManga, parseInt(chapterNumber[currentManga])+1)}>&lt;</button>
        </>
      }


      {visible && <>
          <div class = "chaptersWrapperSmallScreen">
          <span style = {{color:"white", "margin-right": "50px"}}>{currentManga}</span>
          <div class = "chapters">
          {manga.map(chapter => {
            const color = (chapter === chapterNumber[currentManga]) ? "#ffa07a" : ""
            const ref = (chapter === chapterNumber[currentManga]) ? scrollRef : null
            return <button ref={ref} style={{backgroundColor:color, cursor:"pointer"}}class="button-31" key={chapter} onClick={() => getChapter(currentManga, chapter)}>{chapter}</button>      
          })}
          <button class="button-31" style={{cursor: "pointer"}} key={"addChapters"} onClick={() => addChapters()}>Add 10 Chapters </button>  
          </div>
          </div>
      </>}
    </ReadMangaModal>
    
    </>
  )
}

export default App;
