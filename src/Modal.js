import React from 'react'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { faArrowsUpDownLeftRight } from '@fortawesome/free-solid-svg-icons'

const MODAL_STYLES_1 = {
    position: "fixed",
    top: "10px",
    zIndex: 1000,
    display: "flex",
    "flex-direction": "column",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
}

const CLOSE_STYLES = {
    position: "fixed", 
    right:"10px", 
    top:"10px", 
    width: "100px", 
    zIndex: "1000"
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



export function AddMangaModal({addManga, open, children, onClose, loading}) {

    if(!open) return null

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}/>
            <button class={"button-31"} style={CLOSE_STYLES} onClick={onClose}>Close</button>
            <div style={MODAL_STYLES_1}>
                {children}
                {loading &&<>
                    <div class= "loadingBox">
                    <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
                    </div>
                    </>
                }
                {!loading &&<>
                    <button class={"button-31"} style={{"margin-top": "5px"}} onClick={addManga}>Confirm</button>
                    </>
                }
            </div>
        </>,
        document.getElementById("portal")
    )
}

export function ReadMangaModal({children, open, onClose, setVisible, zoomed, setScrollDirection}){
    if(!open) return null

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}/>
            <div class={"openMangaWrapper"}>
                {children}
            </div>
            <button class = "button-31 hiddenbutton" onClick={setVisible} style={{borderTopLeftRadius: 0, borderTopRightRadius:0}}>
            <FontAwesomeIcon icon={faBars} />
            </button>
            <button class="button-31" style={{position: "fixed", zIndex: 1000, right: "50%", top:"0%", transform:"translate(50%, 0)", width: "0px", "minHeight": "0px", "minWidth": "0px", height:"35px", "fontSize": "small", display: "flex", "justifyContent": "center", alignItems:"center", borderTopLeftRadius: 0, borderTopRightRadius:0}} onClick={setScrollDirection}>
            <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
            </button>
            <button class={"button-31"} style={{position: "fixed", zIndex: 1000, right: "0%", top:"0%", width: "0px", "minHeight": "0px", "minWidth": "0px", height:"35px", "fontSize": "small", display: "flex", "justifyContent": "center", alignItems:"center", borderTopLeftRadius: 0, borderTopRightRadius:0}} onClick={onClose} >
            <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
        </>,
        document.getElementById("portal")
    )
}

export function SignupModal({signup, signin, children, open, onClose}){
    if(!open) return null

    return ReactDOM.createPortal(
        <>
            <div style={OVERLAY_STYLES}/>
            <button class={"button-31"} style={CLOSE_STYLES} onClick={onClose}>Close</button>
            <div style={MODAL_STYLES_1}>
                {children}
                <button class={"button-31"} onClick={signup}>Signup</button>
                <button class={"button-31"} onClick={signin}>Singin</button>
            </div>
        </>,
        document.getElementById("portal")
    )
}
