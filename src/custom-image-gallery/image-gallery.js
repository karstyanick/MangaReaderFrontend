import React, { useEffect, useState, useRef } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { bindKeyboard } from 'react-swipeable-views-utils';
import './image-gallery.css';
import { isNumber } from 'lodash-es';

const BindKeyboardSwipeableViews = bindKeyboard(SwipeableViews);
const ImageGallery = ({ images, scrollDirection, fillScreen, onClick, updatePageOrOffset, startingIndex, startingOffset }) => {
    const [currentImageWidth, setCurrentImageWidth] = useState(0);
    const [showLoading, setShowLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [zoomed, setZoomed] = useState(false);
    const imageRefs = useRef([]);
    const wrapperRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;

        if (wrapper && scrollDirection === 'horizontal') {

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            clearTimeout(timeoutRef.current);
            wrapper.removeEventListener('scroll', handleScroll);
            return;
        }

        wrapper.addEventListener('scroll', handleScroll);

        return () => {
            wrapper.removeEventListener('scroll', handleScroll);
        };
    }, [scrollDirection, currentIndex]);
    
    useEffect(() => {
        setCurrentIndex(startingIndex);
        setScrollPosition(startingOffset);
    }, [startingIndex, startingOffset]);
    
    useEffect(() => {
        console.log("fillScreen", fillScreen);
    }, [fillScreen]);

    const handleChangeIndex = (index) => {
        console.log("handleChangeIndex", index);
        console.log('startingIndex', startingIndex);
        setCurrentIndex(index);
    
        updatePageOrOffset(index, scrollPosition);
        
        if (imageRefs.current[index]) {
            const imageHtmlElement = imageRefs.current[index];

            const ratio = imageHtmlElement.naturalWidth / imageHtmlElement.naturalHeight;
            let newWidth = (window.innerHeight) * ratio;

            if(window.innerWidth > 828){
                newWidth = (window.innerHeight - 80) * ratio;
            }

            if (isNumber(newWidth) && newWidth > 0) {
                setCurrentImageWidth(newWidth);
            }
        }
    };

    const onload = (index) => {
        if (currentImageWidth === 0 && currentIndex === index) {
            setShowLoading(false);

            const ratio = imageRefs.current[index].naturalWidth / imageRefs.current[index].naturalHeight;
            let newWidth = (window.innerHeight) * ratio;

            if(window.innerWidth > 828){
                newWidth = (window.innerHeight - 80) * ratio;
            }
            
            if (isNumber(newWidth) && newWidth > 0) {
                setCurrentImageWidth(newWidth);
            }
        }

        if (index === images.length - 1) {
            console.log("scrollPosition blahh", scrollPosition);
            wrapperRef.current.scrollTop = scrollPosition;
        }
    };

    const handleScroll = () => {

        if (scrollDirection === 'horizontal' || timeoutRef.current) {
            return;
        }

        timeoutRef.current = setTimeout(() => {
            const scrollTop = wrapperRef.current.scrollTop;
            setScrollPosition(scrollTop);
            updatePageOrOffset(currentIndex, scrollTop);
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }, 10000);
    };

    useEffect(() => {
        console.log("zoomed", zoomed);
    }, [zoomed]);

    const onDoubleClick = () => {
        setZoomed(!zoomed);
    }

    return (
        <div ref={wrapperRef} className={`image-gallery ${scrollDirection}`} style={{width: currentImageWidth}} >
        {showLoading && <div>Loading...</div>}
        {scrollDirection === 'horizontal' ? (
            <BindKeyboardSwipeableViews index={currentIndex} hysteresis={fillScreen ? 1.1 : 0.6} containerStyle={{height: "100%"}} style={{height: "100%"}} slideStyle={zoomed? {width:"auto", display: "flex"} : {display: 'flex'}} axis='x-reverse' enableMouseEvents={true} onChangeIndex={handleChangeIndex}>
            {images.map((image, index) => (
                <div key={index} style={{ textAlign: 'center', width: 'fit-content', margin: 'auto'}}>
                    <img style={zoomed? {height: "100vh"}: {maxHeight:"100vh"}} onDoubleClick={onDoubleClick} ref={el => imageRefs.current[index] = el} key={index} src={image.original} alt={""} onLoad={() => onload(index)}/>
                </div>
            ))}
            </BindKeyboardSwipeableViews>
        ) : (
            images.map((image, index) => (
            <img ref={el => imageRefs.current[index] = el} key={index} src={image.original} alt={""} onLoad={() => onload(index)}/>
            ))
        )}
        </div>
    );
};

export default ImageGallery;

