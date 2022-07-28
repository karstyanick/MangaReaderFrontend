import React from 'react'
import ReactDOM from 'react-dom'

const MODAL_STYLES_1 = {
    position: "fixed",
    top: "10px",
    padding: "50px",
    zIndex: 1000
}

const MODAL_STYLES_2 = {
    position: "fixed",
    zIndex: 1000,
    top: "50%",
    transform: "translate(0,-50%)",
    display: "flex",
    "justify-content": "center",
    "flex-direction": "row-reverse",
    width: "100%",
    right: "0px",
    "max-height": "100%",
    "align-content": "center"
}

const OVERLAY_STYLES = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0, .7)",
    zIndex: 1000
}



export function AddMangaModal({addManga, open, children, onClose}) {

    if(!open) return null

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}/>
            <div style={MODAL_STYLES_1}>
                <button onClick={onClose}>Close Modal</button>
                {children}
                <button onClick={addManga}>Confirm</button>
            </div>
        </>,
        document.getElementById("portal")
    )
}

export function ReadMangaModal({children, open, onClose, setVisible}){
    if(!open) return null

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}/>
            <div style={MODAL_STYLES_2}>
                {children}
            </div>
            <button class = "button-31 hiddenbutton" onClick={setVisible}>=</button>
            <button class={"button-31"} style={{position: "fixed", zIndex: 1000, right: "0%", top:"0%", width: "0px", "minHeight": "0px", "minWidth": "0px", height:"38px", "fontSize": "small", display: "flex", "justifyContent": "center"}} onClick={onClose} >X</button>
        </>,
        document.getElementById("portal")
    )
}
