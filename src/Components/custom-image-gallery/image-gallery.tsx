import React, { useEffect, useRef, useState } from "react";
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import "./image-gallery.css";
// import Swiper styles
import Swiper from "swiper";
import 'swiper/css';
import { Keyboard, Zoom } from "swiper/modules";

export interface ImageGalleryProps {
  images: { original: string }[]
  scrollDirection: "horizontal" | "vertical"
  onClick: () => void
  updatePageOrOffset: (index: number) => void
  startingIndex: number
  checkFirstOrLastPage: (index: number | undefined, offset: number | undefined, fullHeight: number | undefined) => void
  onFillScreen: (isFilled: boolean) => void;
  fillScreen: boolean
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  scrollDirection,
  fillScreen,
  updatePageOrOffset,
  startingIndex,
  checkFirstOrLastPage,
  onFillScreen,
}) => {
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkFirstLastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [swiperComponent, setSwiperComponent] = useState<Swiper>(null);
  const [zoomed, setZoomed] = useState<boolean>(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return
    wrapper.addEventListener("scroll", handleScroll);
    return () => {
      wrapper.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (scrollDirection !== "vertical" || !wrapperRef.current) return;
      const targetImg = imageRefs.current[startingIndex];
      if (!targetImg) return;
      imageRefs.current[startingIndex].scrollIntoView();
    }, 10)
  }, []);

  useEffect(() => {
    if (scrollDirection === "horizontal" && swiperComponent) {
      swiperComponent.slideTo(0);
    }
    else if (scrollDirection === "vertical" && wrapperRef?.current) {
      wrapperRef.current.scrollTop = 0;
    }
  }, [images]);

  const handleChangeIndex = (swiper: Swiper) => {
    if (!saveTimeoutRef.current) {
      saveTimeoutRef.current = setTimeout(() => {
        updatePageOrOffset(swiper.realIndex);
        clearTimeout(saveTimeoutRef.current as NodeJS.Timeout);
        saveTimeoutRef.current = null;
      }, 2000);
    }

    checkFirstOrLastPage(swiper.realIndex, undefined, undefined);
  };

  const handleScroll = () => {
    if (scrollDirection === "horizontal") {
      return;
    }

    if (!saveTimeoutRef.current) {
      saveTimeoutRef.current = setTimeout(() => {
        if (!wrapperRef?.current) return
        const centeredIndex = getMostCenteredImageIndex();
        updatePageOrOffset(centeredIndex || 0);
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

  const getMostCenteredImageIndex = (): number | null => {
    if (!wrapperRef.current || imageRefs.current.length === 0) return null;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const wrapperCenter = wrapperRect.top + wrapperRect.height / 2;

    let closestIndex = null;
    let minDistance = Infinity;

    imageRefs.current.forEach((img, index) => {
      if (!img) return;
      const imgRect = img.getBoundingClientRect();
      const imgCenter = imgRect.top + imgRect.height / 2;
      const distance = Math.abs(wrapperCenter - imgCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  useEffect(() => {
    if (scrollDirection !== "vertical" || !wrapperRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          const img = entry.target as HTMLImageElement;
          const realSrc = img.dataset.src;
          if (realSrc) {
            img.src = realSrc;
            observer.unobserve(img);
          }
        });
      },
      {
        root: wrapperRef.current,
        rootMargin: "200px",
        threshold: 0.01,
      }
    );

    imageRefs.current.forEach(img => {
      if (img && img.dataset.src) observer.observe(img);
    });

    return () => {
      observer.disconnect();
    };
  }, [images]);

  const handleZoom = (swiper: Swiper, _: number, imageElement: HTMLImageElement) => {
    if (!zoomed) {
      imageElement.style.maxWidth = "none";
      imageElement.style.height = "calc(100vh - 80px)";
      swiper.allowTouchMove = false;
      swiper.updateAutoHeight(300);
      setZoomed(true);
      onFillScreen(true);
    } else {
      imageElement.style.maxWidth = "";
      imageElement.style.height = "";
      swiper.allowTouchMove = true;
      swiper.updateAutoHeight(300);
      setZoomed(false);
      onFillScreen(false);
    }
  }

  useEffect(() => {
    if (!fillScreen && zoomed) {
      swiperComponent.zoom.out();
    }
  }, [fillScreen])

  return (
    <div
      ref={wrapperRef}
      className={`image-gallery ${scrollDirection}`}
    >
      {scrollDirection === "horizontal" ? (
        <SwiperComponent
          dir={"rtl"}
          modules={[Keyboard, Zoom]}
          zoom={{ maxRatio: 1.0000001 }}
          initialSlide={startingIndex || 0}
          keyboard={{ enabled: true }}
          longSwipes={false}
          onSlideChange={handleChangeIndex}
          onSwiper={setSwiperComponent}
          centeredSlides={true}
          autoHeight={true}
          onZoomChange={handleZoom}
        >
          {images.map((image: { original: string }, index: number) => (
            <SwiperSlide
              style={{ display: "flex", justifyContent: "center" }}
            >
              <div className="swiper-zoom-container">
                <img
                  loading="lazy"
                  style={{ maxHeight: "calc(100vh - 80px)" }}
                  ref={(el) => {
                    imageRefs.current[index] = el as HTMLImageElement;
                  }}
                  key={index}
                  src={image.original}
                  alt={""}
                />
              </div>
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
            data-src={image.original}
            src={"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="}
            alt={""}
          />
        ))
      )}
    </div >
  );
};

export default ImageGallery;
