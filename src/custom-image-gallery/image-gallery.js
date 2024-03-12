import React, { useEffect, useState, useRef } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import './image-gallery.css';

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);
const ImageGallery = ({ images, scrollDirection, fillScreen, onClick }) => {
    const [currentImageWidth, setCurrentImageWidth] = useState(0);
    const [showLoading, setShowLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const imageRefs = useRef([]);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setCurrentIndex(0);
        if (imageRefs.current[currentIndex]) {
            setCurrentImageWidth(imageRefs.current[0].naturalWidth);
        }
    }, [scrollDirection]);
    
    useEffect(() => {
        console.log("fillScreen", fillScreen);
    }, [fillScreen]);

    const handleChangeIndex = (index) => {
        setCurrentIndex(index);
        if (imageRefs.current[index]) {
            const imageHtmlElement = imageRefs.current[index];

            const ratio = imageHtmlElement.naturalWidth / imageHtmlElement.naturalHeight;
            const newWidth = (window.innerHeight - 80) * ratio;

            if (imageHtmlElement.naturalWidth > 0) {
                setCurrentImageWidth(newWidth);
            }
        }
    };

    const onload = (event) => {
        if (currentImageWidth === 0) {
            setShowLoading(false);

            const ratio = imageRefs.current[0].naturalWidth / imageRefs.current[0].naturalHeight;
            const newWidth = (window.innerHeight - 80) * ratio;
            
            setCurrentImageWidth(newWidth);
        }
    };

    return (
        <div ref={wrapperRef} className={`image-gallery ${scrollDirection}`} style={{width: currentImageWidth , height: '100%'}} >
        {showLoading && <div>Loading...</div>}
        {scrollDirection === 'horizontal' ? (
            <BindKeyboardSwipeableViews hysteresis={fillScreen ? 1.1 : 0.6} containerStyle={{height: "100%"}} style={{height: "100%"}} slideStyle={{display: 'flex'}} axis='x-reverse' enableMouseEvents={true} onChangeIndex={handleChangeIndex}>
            {images.map((image, index) => (
                <div key={index} style={{ textAlign: 'center', width: 'fit-content', margin: 'auto'}}>
                    <img onClick={onClick} ref={el => imageRefs.current[index] = el} key={index} src={image.original} alt={""} onLoad={onload}/>
                </div>
            ))}
            </BindKeyboardSwipeableViews>
        ) : (
            images.map((image, index) => (
            <img ref={el => imageRefs.current[index] = el} key={index} src={image.original} alt={""} onLoad={onload}/>
            ))
        )}
        </div>
    );
};

export default ImageGallery;

