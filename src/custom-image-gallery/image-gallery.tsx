import React, { useEffect, useRef, useState } from "react";
import "./image-gallery.css";
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
// import Swiper styles
import 'swiper/css';
import { Keyboard } from "swiper/modules";
import Swiper from "swiper";

export interface ImageGalleryProps {
  images: { original: string }[]
  scrollDirection: "horizontal" | "vertical"
  fillScreen: boolean
  onClick: () => void
  updatePageOrOffset: (index: number, offset: number) => void
  startingIndex: number
  startingOffset: number
  checkFirstOrLastPage: (index: number | undefined, offset: number | undefined, fullHeight: number | undefined) => void
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  scrollDirection,
  fillScreen,
  onClick,
  updatePageOrOffset,
  startingIndex,
  startingOffset,
  checkFirstOrLastPage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkFirstLastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return

    if (wrapper && scrollDirection === "horizontal") {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      wrapper.removeEventListener("scroll", handleScroll);

      if (checkFirstLastTimeoutRef.current) {
        clearTimeout(checkFirstLastTimeoutRef.current);
        checkFirstLastTimeoutRef.current = null;
      }

      wrapper.removeEventListener("scroll", handleScroll);

      return;
    }

    wrapper.addEventListener("scroll", handleScroll);

    return () => {
      wrapper.removeEventListener("scroll", handleScroll);
    };
  }, [scrollDirection, currentIndex]);

  useEffect(() => {
    setCurrentIndex(startingIndex);
    setScrollPosition(startingOffset);
  }, []);

  useEffect(() => {
    console.log("fillScreen", fillScreen);
  }, [fillScreen]);

  const handleChangeIndex = (swiper: Swiper) => {
    const index = swiper.realIndex;
    setCurrentIndex(index);

    updatePageOrOffset(index, scrollPosition);
    checkFirstOrLastPage(index, undefined, undefined);
  };

  const onload = (index: number) => {
    if (!wrapperRef?.current) return
    if (index === images.length - 1) {
      wrapperRef.current.scrollTop = scrollPosition;
    }
  };

  const handleScroll = () => {
    if (scrollDirection === "horizontal") {
      return;
    }

    if (!saveTimeoutRef.current) {
      saveTimeoutRef.current = setTimeout(() => {
        if (!wrapperRef?.current) return
        const scrollTop = Math.ceil(wrapperRef.current.scrollTop);
        setScrollPosition(scrollTop);
        updatePageOrOffset(currentIndex, scrollTop);
        clearTimeout(saveTimeoutRef.current as NodeJS.Timeout);
        saveTimeoutRef.current = null;
      }, 5000);
    }

    if (!checkFirstLastTimeoutRef.current) {
      checkFirstLastTimeoutRef.current = setTimeout(() => {
        if (!wrapperRef?.current) return
        const scrollTop = Math.ceil(wrapperRef.current.scrollTop);
        checkFirstOrLastPage(
          undefined,
          scrollTop,
          wrapperRef.current.scrollHeight - wrapperRef.current.offsetHeight
        );
        clearTimeout(checkFirstLastTimeoutRef.current as NodeJS.Timeout);
        checkFirstLastTimeoutRef.current = null;
      }, 200);
    }
  };

  useEffect(() => {
    console.log("zoomed", zoomed);
  }, [zoomed]);

  const onDoubleClick = () => {
    setZoomed(!zoomed);
  };

  return (
    <div
      ref={wrapperRef}
      className={`image-gallery ${scrollDirection}`}
    >
      {scrollDirection === "horizontal" ? (
        <SwiperComponent
          dir={"rtl"}
          modules={[Keyboard]}
          initialSlide={startingIndex || 0}
          keyboard={{ enabled: true }}
          longSwipes={false}
          onSlideChange={handleChangeIndex}
          centeredSlides={true}
          autoHeight={true}
        >
          {images.map((image: { original: string }, index: number) => (
            <SwiperSlide
              style={{ display: "flex", justifyContent: "center" }}
            >
              <img
                style={{ maxHeight: "calc(100vh - 80px)" }}
                ref={(el) => {
                  imageRefs.current[index] = el as HTMLImageElement;
                }}
                key={index}
                src={image.original}
                alt={""}
                onLoad={() => onload(index)}
              />
            </SwiperSlide>
          ))}
        </SwiperComponent>
      ) : (
        images.map((image: { original: string }, index: number) => (
          <img
            ref={(el) => {
              imageRefs.current[index] = el as HTMLImageElement;
            }}
            key={index}
            src={image.original}
            alt={""}
            onLoad={() => onload(index)}
          />
        ))
      )
      }
    </div >
  );
};

export default ImageGallery;
