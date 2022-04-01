import React from 'react'
import ReactDOM from 'react-dom'

const MODAL_STYLES = {
    position: "fixed",
    top: "10px",
    padding: "50px",
    zIndex: 1000
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
            <div style={MODAL_STYLES}>
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
            <div style={MODAL_STYLES}>
                <button style={{float:"right", marginLeft:"20px"}} onClick={onClose}>Close Modal</button>
                {children}
            </div>
        </>,
        document.getElementById("portal")
    )
}
