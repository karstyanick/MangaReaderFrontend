import React, { useEffect, useRef } from "react";

export interface ChapterNumber {
  [mangaName: string]: string
};

interface ChaptersListProps {
  currentManga: string
  mangaChapterList: string[]
  chapterNumber: ChapterNumber
  getChapter: (currentManga: string, chapter: string) => void
  loading: boolean
  lastPage: boolean
  addChapters: () => void
  visible: boolean
}

export const ChaptersList: React.FC<ChaptersListProps> = ({ currentManga, mangaChapterList, chapterNumber, getChapter, loading, addChapters, visible }) => {

  const scrollRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!scrollRef?.current) return
    scrollRef.current.scrollIntoView({ block: "center" });
  }, [scrollRef, visible]);

  function decodeHtml(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent ?? "";
  }

  return (
    <>
      <div className="chaptersWrapper">
        <span style={{ color: "white", backgroundColor: "cornflowerblue", borderTopLeftRadius: "10px", borderTopRightRadius: "10px", fontSize: "25px", padding: "10px", textAlign: "center" }}>
          {decodeHtml(currentManga)}
        </span>
        <div className="chapters">
          {mangaChapterList.map((chapter) => {
            const color =
              chapter === chapterNumber[currentManga] ? "cornflowerblue" : "";
            const ref =
              chapter === chapterNumber[currentManga] ? scrollRef : null;
            return (
              <button
                ref={ref}
                style={{ backgroundColor: color, cursor: "pointer" }}
                className="buttonBasic"
                key={chapter}
                onClick={() => getChapter(currentManga, chapter)}
              >
                {chapter}
              </button>
            );
          })}
          {loading && (
            <>
              <div className="loadingBox">
                <div className="lds-ring">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            </>
          )}
          {!loading && (
            <>
              <button
                className="buttonBasic"
                style={{ cursor: "pointer" }}
                key={"addChapters"}
                onClick={() => addChapters()}
              >
                Add Chapters{" "}
              </button>
            </>
          )}
        </div>
      </div>
      {visible && (
        <>
          <div className="chaptersWrapperSmallScreen">
            <div className="chapters">
              {mangaChapterList.map((chapter) => {
                const color =
                  chapter === chapterNumber[currentManga] ? "cornflowerblue" : "";
                const ref =
                  chapter === chapterNumber[currentManga] ? scrollRef : null;
                return (
                  <button
                    ref={ref}
                    style={{ backgroundColor: color, cursor: "pointer" }}
                    className="buttonBasic"
                    key={chapter}
                    onClick={() => getChapter(currentManga, chapter)}
                  >
                    {chapter}
                  </button>
                );
              })}
              {loading && (
                <>
                  <div className="loadingBox">
                    <div className="lds-ring">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </>
              )}
              {!loading && (
                <>
                  <button
                    className="buttonBasic"
                    style={{ cursor: "pointer" }}
                    key={"addChapters"}
                    onClick={() => addChapters()}
                  >
                    Add Chapters{" "}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
