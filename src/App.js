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

const spanStyles = {
  float:"left"
}

const chapterDivStyles = {
  display: "flex",
  flexDirection: "column",
  float: "left",
  marginRight: "20px"
}

const galleryDivStyles = {
  float: "right"
}

function App() {
  const [img, setChapter] = useState({chapterImgs:[]})
  const [mangas, addManga] = useState([])
  const [manga, setManga] = useState([])
  const [currentManga, setCurrentManga] = useState("")

  const addMangaRef = useRef()

  const [isOpenAddManga, setOpenAddManga] = useState(false)
  const [isOpenReadManga, setOpenReadManga] = useState(false)

  useEffect(() => initPage(), [])

  async function getChapter(mangaName, chapter){
    if (chapter === "")return
    return axios.get("http://localhost:5000/getChapter", {
      params:{
        "name": mangaName,
        "chapter": chapter
      }
    }).then(response => {
      console.log(response.data)
      setChapter({chapterImgs: response.data})
    })
  }

  async function initPage(){
    console.log("test")
    return axios.get("http://localhost:5000/", {
    }).then(response => {
      console.log(response.data)
      addManga(response.data)
    })
  }

  async function getManga(){
    const mangaName = currentManga
    if (mangaName === ""){console.log("empty manga name in get manga"); return}
    return axios.get("http://localhost:5000/getManga", {
      params:{
        "name": mangaName,
      }
    }).then(response => {
      setManga(response.data)
    })
  }

  async function addNewManga(){
    const mangaName = addMangaRef.current.value
    if (mangaName === ""){console.log("empty manga name in add manga"); return}
    return axios.post("http://localhost:5000/addManga", {
      "name": mangaName
    }).then(response => {
      addManga([...mangas, response.data])
      console.log(mangas)
    })
  }

  function onCloseModal(){
    setOpenReadManga(false)
    setChapter({chapterImgs:[]})
  }

  function openReadManga(name){
    setCurrentManga(name)
    getManga()
    setOpenReadManga(true)
  }

  return (
    <>

    <button style = {{float:"right", margin:"10px"}} onClick={() => setOpenAddManga(true)}>Add Manga</button>
    <div>{mangas.map(manga => <img style = {imgStyles} onClick={() => openReadManga(manga.name)} alt={""} key={manga.id} name={manga.name} src={manga.poster}/>)}</div>

    <AddMangaModal addManga={addNewManga} open={isOpenAddManga} onClose={() => setOpenAddManga(false)}>
      Add Manga
      <input ref={addMangaRef}></input>
    </AddMangaModal>

    <ReadMangaModal open={isOpenReadManga} onClose={() => onCloseModal()} onOpen={getManga}>
      
      <div style = {chapterDivStyles}>
      <span style = {{color:"white"}}>{currentManga}</span>
      {manga.map(chapter => <button style={spanStyles} key={chapter} onClick={() => getChapter(currentManga, chapter)}>{chapter}</button>)}
      </div>
      <div style = {galleryDivStyles}>
      <ImageGallery items={img.chapterImgs} isRTL={true}></ImageGallery>
      </div>
    </ReadMangaModal>
    
    </>
  )
}

export default App;
