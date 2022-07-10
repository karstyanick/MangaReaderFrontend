import React, { useState, useRef, useEffect  } from "react";
import axios from "axios";
import ImageGallery from 'react-image-gallery';
import "react-image-gallery/styles/css/image-gallery.css"
import {AddMangaModal, ReadMangaModal} from "./Modal"

const imgStyles = {
  height:"300px",
  margin:"10px",
  "borderRadius": "10px"
};

const chapterDivStyles = {
  display: "flex",
  flexDirection: "column",
  "margin-right": "50px",
  "overflow": "auto"
}

const chatpersWrapper = {
  display: "flex",
  flexDirection: "column",
  "margin-top": "40px",
  "margin-bottom": "40px",
}

function App() {
  let imageGallery;

  const addMangaRef = useRef()
  const addMangaChaptersRef = useRef()

  const pagePreviousRef = useRef({});
  const isOpenReadMangaPreviousRef = useRef(false)
  const firstPageLoadRef = useRef(true)

  const [chapter, setChapter] = useState({})
  const [mangas, addManga] = useState([])
  const [manga, setManga] = useState([])
  const [currentManga, setCurrentManga] = useState("")
  const [currentPage, setCurrentPage] = useState({})
  const [isOpenAddManga, setOpenAddManga] = useState(false)
  const [isOpenReadManga, setOpenReadManga] = useState(false)

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
      axios.post("http://localhost:5000/save", {
        "name": currentManga,
        "chapter": chapter,
        "page": currentPage
      })

      pagePreviousRef.current = currentPage;
    }
  }

  async function initPage(){
    if(firstPageLoadRef.current === true){
      firstPageLoadRef.current = false
      return axios.get("http://localhost:5000/", {
      }).then(response => {
        console.log(JSON.stringify(response.data))
        addManga(response.data.posters)
        if(response.data.state.currentChapter){
          setChapter(response.data.state.currentChapter)
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
    return axios.post("http://localhost:5000/addManga", {
      "name": mangaName,
      "chapters": addMangaChapters
    }).then(response => {
      if(response.data !== "success"){
        addManga([...mangas, response.data])
      }
      console.log(mangas)
    })
  }

  async function getManga(mangaName){
    if (mangaName === ""){console.log("empty manga name in get manga"); return}
    return axios.get("http://localhost:5000/getManga", {
      params:{
        "name": mangaName,
      }
    }).then(response => {
      return response.data
    })
  }

  async function getChapter(mangaName, chapter){
    if (chapter === "")return
    return axios.get("http://localhost:5000/getChapter", {
      params:{
        "name": mangaName,
        "chapter": chapter
      }
    }).then(response => {
      console.log(response.data)
      setChapter({...chapter, [mangaName]: response.data})
    })
  }

  async function onCloseModal(){
    setOpenReadManga(false)
    setCurrentPage({[currentManga]: imageGallery.getCurrentIndex()})
  }

  async function openReadManga(name){
    if(name === currentManga){
      setOpenReadManga(true)
    }else{
      setCurrentManga(name)
      if(!chapter[name]){
        await setChapter({...chapter, [name]: []})
      }
      const manga = await getManga(name)
      setManga(manga)
      setOpenReadManga(true)
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
      <div style = {{"margin-top": "40px"}}>
      <ImageGallery  ref={i => imageGallery = i} items={chapter[currentManga]} isRTL={true} showThumbnails={false} showFullscreenButton={false} showPlayButton={false} showNav={false}></ImageGallery>
      </div>
      <div style = {chatpersWrapper}>
      <span style = {{color:"white", "margin-right": "50px"}}>{currentManga}</span>
      <div style = {chapterDivStyles}>
      {manga.map(chapter => <button class="button-31" key={chapter} onClick={() => getChapter(currentManga, chapter)}>{chapter}</button>)}
      </div>
      </div>
    </ReadMangaModal>
    
    </>
  )
}

export default App;
