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
    height: "100%"
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

export function ReadMangaModal({children, open, onClose}){
    if(!open) return null

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}/>
            <div style={MODAL_STYLES_2}>
                {children}
            </div>
            <button class={"button-31"} style={{position: "absolute", zIndex: 1000, right: "1%", top:"1%", width: "100px"}} onClick={onClose} >close</button>
        </>,
        document.getElementById("portal")
    )
}
