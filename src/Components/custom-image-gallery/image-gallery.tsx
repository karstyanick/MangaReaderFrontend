import React, { useEffect, useRef, useState } from "react";
import { Swiper as SwiperComponent, SwiperSlide } from 'swiper/react';
import "./image-gallery.css";
import Swiper from "swiper";
import 'swiper/css';
import { Keyboard, Pagination, Zoom } from "swiper/modules";
import {
  faArrowLeft,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface ImageGalleryProps {
  images: { original: string }[]
  scrollDirection: "horizontal" | "vertical"
  updatePageOrOffset: (index: number) => void
  startingIndex: number
  onFillScreen: (isFilled: boolean) => void;
  fillScreen: boolean
  getNextChapter: () => void;
  getPrevChapter: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  scrollDirection,
  fillScreen,
  updatePageOrOffset,
  startingIndex,
  onFillScreen,
  getPrevChapter,
  getNextChapter
}) => {
  const imageRefs = useRef<HTMLImageElement[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const checkFirstLastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [swiperComponent, setSwiperComponent] = useState<Swiper>(null);
  const [zoomed, setZoomed] = useState<boolean>(false);
  let clickTimeout: NodeJS.Timeout | null = null;
  let lastPageSlideStartX: number | null = null;
  let firstPageSlideStartX: number | null = null;
  let nextButtenRef = useRef<HTMLButtonElement>(null);
  let prevButtonRef = useRef<HTMLButtonElement>(null);

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

    adjustNavButtonStyles(swiper);
  };

  const adjustNavButtonStyles = (swiper: Swiper) => {
    const slidesElement: HTMLDivElement = swiper.slides[swiper.realIndex]
    const imageElement: HTMLImageElement = swiper.slides[swiper.realIndex].querySelector('img')

    if (swiper.realIndex === images.length - 1) {
      if (!imageElement.width) {
        imageElement.onload = () => {
          if (!nextButtenRef.current) return
          nextButtenRef.current.style.left = `${(parseInt(slidesElement.style.width.replace("px", "")) - imageElement.width) / 2}px`
          nextButtenRef.current.style.height = `${imageElement.height}px`;
        }
      } else {
        if (!nextButtenRef.current) return
        nextButtenRef.current.style.left = `${(parseInt(slidesElement.style.width.replace("px", "")) - imageElement.width) / 2}px`
        nextButtenRef.current.style.height = `${imageElement.height}px`;
      }
    }

    if (swiper.realIndex === 0) {
      if (!imageElement.width) {
        imageElement.onload = () => {
          if (!prevButtonRef.current) return
          prevButtonRef.current.style.right = `${(parseInt(slidesElement.style.width.replace("px", "")) - imageElement.width) / 2}px`
          prevButtonRef.current.style.height = `${imageElement.height}px`;
        }
      } else {
        if (!prevButtonRef.current) return
        prevButtonRef.current.style.right = `${(parseInt(slidesElement.style.width.replace("px", "")) - imageElement.width) / 2}px`
        prevButtonRef.current.style.height = `${imageElement.height}px`;
      }
    }
  }

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

  const handleZoom = (swiper: Swiper, scale: number, imageElement: HTMLImageElement) => {
    if (scale > 1.000000000001) return;

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

  const onSwiperInit = (swiper: Swiper) => {
    setSwiperComponent(swiper);// Grab the pagination container element...

    const paginationEl = swiper.pagination.el;
    const hiddenClass = swiper.params.pagination.hiddenClass as string;
    if (paginationEl && hiddenClass) {
      paginationEl.classList.add(hiddenClass);
    }

    adjustNavButtonStyles(swiper);
  }

  const onClickHandler = (swiper: Swiper) => {
    if (clickTimeout !== null) {
      clearTimeout(clickTimeout);
      clickTimeout = null;
    } else {
      clickTimeout = setTimeout(() => {
        onSingleClick(swiper)
        clickTimeout = null;
      }, 200);
    }
  }

  const onSingleClick = (swiper: Swiper) => {
    const paginationEl: HTMLElement = swiper.pagination.el;
    const hiddenClass = swiper.params.pagination.hiddenClass as string;
    if (paginationEl && hiddenClass) {
      if (paginationEl.classList.contains(hiddenClass)) {
        paginationEl.classList.remove(hiddenClass)
      } else {
        paginationEl.classList.add(hiddenClass);
      }
    }
  }

  const onSliderMove = (swiper: Swiper, event: TouchEvent | PointerEvent) => {
    const positionX = (event as TouchEvent).changedTouches?.[0]?.screenX || (event as PointerEvent).screenX;

    if (nextButtenRef?.current && swiper.realIndex === images.length - 1 && positionX) {
      const swipeDistanceNormalized = Math.min(Math.max(positionX - (lastPageSlideStartX || 0), 0), 400) / 500;
      const currentOpacity = nextButtenRef.current?.style?.backgroundColor ? parseFloat(nextButtenRef.current.style.backgroundColor.split("0, 0, 0, ")[1].replace(")", "")) : 0;
      nextButtenRef.current.style.backgroundColor = `rgba(0,0,0,${Math.max(swipeDistanceNormalized, currentOpacity)})`;
    }
    if (prevButtonRef?.current && swiper.realIndex === 0 && positionX) {
      const swipeDistanceNormalized = Math.min(Math.abs(Math.min(positionX - (firstPageSlideStartX || 0), 0)), 400) / 500;
      const currentOpacity = prevButtonRef.current?.style?.backgroundColor ? parseFloat(prevButtonRef.current.style.backgroundColor.split("0, 0, 0, ")[1].replace(")", "")) : 0;
      prevButtonRef.current.style.backgroundColor = `rgba(0,0,0,${Math.max(swipeDistanceNormalized, currentOpacity)})`;
    }
  }

  let hideNextButtonTimeout: NodeJS.Timeout | null = null;
  let hidePrevButtonTimeout: NodeJS.Timeout | null = null;

  const onSliderStartMove = (swiper: Swiper, event: TouchEvent | PointerEvent) => {
    const positionX = (event as TouchEvent).changedTouches?.[0]?.screenX || (event as PointerEvent).screenX;

    if (nextButtenRef?.current && swiper.realIndex === images.length - 1 && positionX) {
      if (lastPageSlideStartX === null) {
        lastPageSlideStartX = positionX
        nextButtenRef.current.style.visibility = "visible";
      }
      clearTimeout(hideNextButtonTimeout as NodeJS.Timeout);
      hideNextButtonTimeout = null;
    }
    if (prevButtonRef?.current && swiper.realIndex === 0 && positionX) {
      if (firstPageSlideStartX === null) {
        firstPageSlideStartX = positionX
        prevButtonRef.current.style.visibility = "visible";
      }
      clearTimeout(hidePrevButtonTimeout as NodeJS.Timeout);
      hidePrevButtonTimeout = null;
    }
  }

  const onSliderStopMove = (swiper: Swiper) => {
    if (swiper.realIndex === images.length - 1) {
      if (hideNextButtonTimeout) return;
      lastPageSlideStartX = null;
      hideNextButtonTimeout = setTimeout(() => {
        if (!nextButtenRef?.current) return;
        nextButtenRef.current.style.backgroundColor = `rgba(0,0,0,0)`
        nextButtenRef.current.style.visibility = "hidden";
        clearTimeout(hideNextButtonTimeout as NodeJS.Timeout);
        hideNextButtonTimeout = null;
      }, 3000)
    }
    if (prevButtonRef?.current && swiper.realIndex === 0) {
      if (hidePrevButtonTimeout) return;
      firstPageSlideStartX = null;
      hidePrevButtonTimeout = setTimeout(() => {
        if (!prevButtonRef?.current) return;
        prevButtonRef.current.style.backgroundColor = `rgba(0,0,0,0)`
        prevButtonRef.current.style.visibility = "hidden";
        clearTimeout(hidePrevButtonTimeout as NodeJS.Timeout);
        hidePrevButtonTimeout = null;
      }, 3000)
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`image-gallery ${scrollDirection} `}
      onClick={() => navigator.wakeLock.request()}
    >
      {scrollDirection === "horizontal" ? (
        <SwiperComponent
          dir={"rtl"}
          modules={[Keyboard, Zoom, Pagination]}
          zoom={{ maxRatio: 1.000000000001 }}
          initialSlide={startingIndex || 0}
          keyboard={{ enabled: true }}
          longSwipes={false}
          onSlideChange={handleChangeIndex}
          onSwiper={onSwiperInit}
          centeredSlides={true}
          autoHeight={true}
          onZoomChange={handleZoom}
          onClick={onClickHandler}
          onSliderMove={onSliderMove}
          onSliderFirstMove={onSliderStartMove}
          onTouchEnd={onSliderStopMove}
          pagination={{
            type: "fraction",
            currentClass: "pageNumbersCurrent",
            totalClass: "pageNumbersTotal",
            hiddenClass: "paginationHidden",
            horizontalClass: "pagination",
            renderFraction:
              function(currentClass: string, totalClass: string) {
                return '<span class="' + currentClass + '"></span>' +
                  '<span style="color: white; font-size: 20px"> / </span>' +
                  '<span class="' + totalClass + '"></span>'
              }
          }}
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
                {index === images.length - 1 && <button ref={nextButtenRef} className="nextChapterButton" onClick={getNextChapter}>
                  <FontAwesomeIcon
                    icon={faArrowLeft}
                    style={{
                      left: "50%",
                      top: "50%",
                      position: "absolute",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </button>}
                {index === 0 && <button ref={prevButtonRef} className="nextChapterButton" onClick={getPrevChapter}>
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    style={{
                      left: "50%",
                      top: "50%",
                      position: "absolute",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </button>}
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
      )
      }
    </div >
  );
};

export default ImageGallery;
