import React, { useState, useRef, useEffect  } from "react";
import axios from "axios";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css"
import {AddMangaModal, ReadMangaModal} from "./Modal"

let BACKENDHOST = "http://95.179.132.168" // "http://localhost:5000";

const imgStyles = {
  height:"300px",
  margin:"10px",
  "borderRadius": "10px"
};

const navChaptersRight = {
  height:"40px",
  width: "100px",
  display: "flex",
  "justifyContent": "center",
  top: "50%",
  transform: "translate(0, -50%)",
  "z-index": "1200",
  position: "absolute",
  right: 0
}

const navChaptersLeft = {
  height:"40px",
  width: "100px",
  display: "flex",
  "justifyContent": "center",
  top: "50%",
  transform: "translate(0, -50%)",
  "z-index": "1200",
  position: "absolute",
  left: 0
}

function App() {
  let imageGallery;

  const addMangaRef = useRef()
  const addMangaChaptersRef = useRef()

  const pagePreviousRef = useRef({});
  const isOpenReadMangaPreviousRef = useRef(false)
  const firstPageLoadRef = useRef(true)

  const [chapter, setChapter] = useState({})
  const [chapterNumber, setCurrentChapterNumber] = useState(0)
  const [mangas, addManga] = useState([])
  const [manga, setManga] = useState([])
  const [currentManga, setCurrentManga] = useState("")
  const [currentPage, setCurrentPage] = useState({})
  const [isOpenAddManga, setOpenAddManga] = useState(false)
  const [isOpenReadManga, setOpenReadManga] = useState(false)
  const [visible, setVisible] = useState(false);
  const [lastPage, setlastPage] = useState(false)
  const [showIndex, toggleShowIndex] = useState(false)

  useEffect(() => {
    initPage()
    saveState(currentPage, chapter, currentManga)
    slideToPage(isOpenReadManga, imageGallery, currentPage, currentManga)
  }, [currentPage, chapter, currentManga, isOpenReadManga, imageGallery])

  function slideToPage(isOpenReadManga, imageGallery, currentPage, currentManga){
    if(isOpenReadManga !== isOpenReadMangaPreviousRef.current){
      if(imageGallery){
        imageGallery.slideToIndex(currentPage[currentManga])
      }
      isOpenReadMangaPreviousRef.current = isOpenReadManga;
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

  async function initPage(){
    if(firstPageLoadRef.current === true){
      firstPageLoadRef.current = false
      return axios.get(`${BACKENDHOST}/`, {
      }).then(response => {
        console.log(JSON.stringify(response.data))
        addManga(response.data.posters)
        if(response.data.state.currentChapter){
          setChapter(response.data.state.currentChapter)
          setCurrentChapterNumber(response.data.state.currentChapterNumber)
        }
        if(response.data.state.currentPage){
          setCurrentPage(response.data.state.currentPage)
          pagePreviousRef.current = response.data.state.currentPage
        }
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
        addManga([...mangas, response.data.metaD])
      }
      console.log(mangas)
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

  async function getChapter(mangaName, chapter){
    if (chapter === "")return
    return axios.get(`${BACKENDHOST}/getChapter`, {
      params:{
        "name": mangaName,
        "chapter": chapter
      }
    }).then(response => {
      console.log(response.data)
      setChapter({[mangaName]: response.data.links})
      setCurrentChapterNumber(response.data.chapter)
      setlastPage(false)
    })
  }

  async function onCloseModal(){
    setOpenReadManga(false)
    setCurrentPage({[currentManga]: imageGallery.getCurrentIndex()})
  }

  async function openReadManga(name){
    setCurrentManga(name)
    if(!chapter[name]){
      await setChapter({...chapter, [name]: []})
    }
    const manga = await getManga(name)
    setManga(manga)
    setOpenReadManga(true)
  }

  function checkLastPage(index){
    if(index===chapter[currentManga].length-1){
      setlastPage(true)
      console.log(chapter)
    }else{
      setlastPage(false)
    }
  }

  return (
    <>

    <button style = {{float:"right", margin:"10px"}} onClick={() => setOpenAddManga(true)}>Add Manga</button>
    <div>{mangas.map(manga => <img style = {imgStyles} onClick={() => openReadManga(manga.name)} alt={""} key={manga.id} name={manga.name} src={manga.poster}/>)}</div>

    <AddMangaModal addManga={addNewManga} open={isOpenAddManga} onClose={() => setOpenAddManga(false)}>
      Add Manga
      <input ref={addMangaRef}></input>
      Chapters
      <input ref={addMangaChaptersRef}></input>
    </AddMangaModal>

    <ReadMangaModal open={isOpenReadManga} onClose={() => onCloseModal()}>
      {lastPage &&<>
        <button class="button-31" style={navChaptersRight} onClick={() => getChapter(currentManga, parseInt(chapterNumber)-1)}>previous</button>
        </>
      }
      <div style = {{"margin-top": "40px"}}>
      <ImageGallery  ref={i => imageGallery = i} showIndex={showIndex} onClick={()=> toggleShowIndex(!showIndex)} onSlide={index => checkLastPage(index)} items={chapter[currentManga]} isRTL={true} showThumbnails={false} showFullscreenButton={false} showPlayButton={false} showNav={false}></ImageGallery>
      </div>
      <div class = "chaptersWrapper">
      <span style = {{color:"white", "margin-right": "50px"}}>{currentManga}</span>
      <div class = "chapters">
      {manga.map(chapter => {
        const color = (chapter === chapterNumber) ? "#ffa07a" : ""
        return <button style={{backgroundColor:color}}class="button-31" key={chapter} onClick={() => getChapter(currentManga, chapter)}>{chapter}</button>      
      })}
      <button class="button-31" key={"addChapters"} onClick={() => addChapters()}>Add 10 Chapters </button>
      </div>
      </div>
      {lastPage &&<>
        <button class="button-31" style={navChaptersLeft} onClick={() => getChapter(currentManga, parseInt(chapterNumber)+1)}>next</button>
        </>
      }

      <button class = "button-31 hiddenbutton" onClick={() => setVisible(!visible)}>=</button>

      {visible && <>
          <div class = "chaptersWrapperSmallScreen">
          <span style = {{color:"white", "margin-right": "50px"}}>{currentManga}</span>
          <div class = "chapters">
          {manga.map(chapter => <button class="button-31" key={chapter} onClick={() => getChapter(currentManga, chapter)}>{chapter}</button>)}
          </div>
          </div>
      </>}
    </ReadMangaModal>
    
    </>
  )
}

export default App;
