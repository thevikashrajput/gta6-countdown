// app/page.js
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image"; // Used for the static GTA VI Logo

// Helper function to play sounds
const playSound = (src, volume = 0.7) => {
  try {
    const sound = new Audio(src);
    sound.volume = volume;
    sound
      .play()
      .catch((e) => console.warn(`Sound play failed for ${src}: ${e.message}`));
  } catch (e) {
    console.warn(`Could not create/play audio ${src}: ${e.message}`);
  }
};

// UI Sound Effects
const UIEffects = {
  click: "/assets/sounds/ui-click.mp3",
  confirm: "/assets/sounds/ui-confirm.mp3",
  error: "/assets/sounds/ui-error.mp3",
  newMessage: "/assets/sounds/message-new.mp3",
};

// Helper function to shuffle an array (Fisher-Yates)
function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

// Duration for images to be displayed (in milliseconds)
const IMAGE_DISPLAY_DURATION = 7000; // 7 seconds

// --- Define your video entries that should play FIRST ---
// --- Ensure these video files exist in public/assets/videos/ ---
const leadingVideoEntries = [
  { type: "video", src: "/assets/videos/gta-background-loop-1.mp4" },
  // Example: { type: "video", src: "/assets/videos/gta-background-loop-2.mp4" }, // If you have a second one
];
// --- End of leading video entries ---

// --- COMPONENT START ---
export default function HomePage() {
  // --- DYNAMICALLY CREATE AND PREPARE BACKGROUND MEDIA ON MOUNT ---
  const initialBackgroundMedia = useMemo(() => {
    const imageEntries = [];
    // Generate image entries from 1.jpg to 167.jpg
    // Ensure these images (1.jpg, 2.jpg, ..., 167.jpg) exist in public/assets/images/
    for (let i = 1; i <= 167; i++) {
      imageEntries.push({ type: "image", src: `/assets/images/${i}.jpg` });
    }

    const shuffledImageEntries = shuffleArray([...imageEntries]); // Shuffle a copy of image entries
    // Combine leading videos (played first, in order) with the shuffled image entries
    const finalMediaPlaylist = [
      ...leadingVideoEntries,
      ...shuffledImageEntries,
    ];

    // console.log("Final media playlist count:", finalMediaPlaylist.length, "First item:", finalMediaPlaylist[0]?.src);
    return finalMediaPlaylist;
  }, []); // Empty dependency array ensures this runs once on component mount

  const [backgroundMedia, setBackgroundMedia] = useState(
    initialBackgroundMedia
  );
  // --- END OF DYNAMIC BACKGROUND MEDIA SETUP ---

  // --- Component States ---
  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [secondsToDisplay, setSecondsToDisplay] = useState("00");
  const [secondsAnimationKey, setSecondsAnimationKey] = useState(0);
  const [isReleased, setIsReleased] = useState(false);

  const [currentDecisecond, setCurrentDecisecond] = useState("0");
  const [currentCentisecond, setCurrentCentisecond] = useState("00");
  const [currentMillisecond, setCurrentMillisecond] = useState("000");

  const [rumor, setRumor] = useState(
    'Hit "GENERATE" for the latest Leonida street talk.'
  );
  const [isRumorLoading, setIsRumorLoading] = useState(false);
  const [rumorError, setRumorError] = useState(null);
  const [rumorKey, setRumorKey] = useState(0);

  const [speculativeReleaseText, setSpeculativeReleaseText] = useState(
    "Accessing Leonida Network for intel..."
  );
  const [isSpeculativeLoading, setIsSpeculativeLoading] = useState(true);
  const [speculativeKey, setSpeculativeKey] = useState(0);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("default");

  const [isMusicMuted, setIsMusicMuted] = useState(true);
  const audioRef = useRef(null);

  const [newsFlashes, setNewsFlashes] = useState([]);
  const [isNewsLoading, setIsNewsLoading] = useState(true);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [visiblePlayerSlot, setVisiblePlayerSlot] = useState(0);
  const mediaPlayersRefs = [
    { video: useRef(null), imageTimeoutId: useRef(null) },
    { video: useRef(null), imageTimeoutId: useRef(null) },
  ];

  // --- API Fetching & Logic (Callbacks) ---
  const fetchReleaseDayMessage = useCallback(async () => {
    try {
      const response = await fetch("/api/generate-release-message");
      if (!response.ok)
        throw new Error(
          (await response.json()).error || `Error: ${response.status}`
        );
      const data = await response.json();
      setPopupMessage(data.message || "Leonida Awaits! The Time Has Come!");
    } catch (err) {
      console.error("Failed to fetch release day message:", err);
      setPopupMessage("WELCOME TO LEONIDA! 🎉 (Speculatively, of course!)");
    } finally {
      setPopupType("success");
      setShowPopup(true);
      playSound(UIEffects.confirm, 0.8);
    }
  }, []);

  const fetchSpeculativeInfo = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsSpeculativeLoading(true);
    try {
      const response = await fetch("/api/speculative-release");
      if (!response.ok)
        throw new Error(
          (await response.json()).error || `Error: ${response.status}`
        );
      const data = await response.json();
      setSpeculativeReleaseText(
        data.speculativeText || "Leonida network unstable. Try again."
      );
      setSpeculativeKey((prev) => prev + 1);
      if (isRefresh) playSound(UIEffects.confirm, 0.5);
    } catch (err) {
      console.error("Failed to fetch speculative release info:", err);
      setSpeculativeReleaseText(
        "Intel corrupted. This is a fan-made countdown."
      );
      if (isRefresh) playSound(UIEffects.error, 0.5);
    } finally {
      if (!isRefresh) setIsSpeculativeLoading(false);
    }
  }, []);

  const handleGenerateRumor = useCallback(async () => {
    playSound(UIEffects.click);
    setIsRumorLoading(true);
    setRumorError(null);
    setRumor("");
    try {
      const response = await fetch("/api/generate-rumor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok)
        throw new Error(
          (await response.json()).error || `Error: ${response.status}`
        );
      const data = await response.json();
      setRumor(data.rumor || "Static on the line... try again.");
      setRumorKey((prev) => prev + 1);
      playSound(UIEffects.newMessage, 0.6);
    } catch (err) {
      console.error("Failed to fetch rumor:", err);
      setRumorError(err.message || "Signal lost. Couldn't get the scoop.");
      playSound(UIEffects.error, 0.5);
    } finally {
      setIsRumorLoading(false);
    }
  }, []);

  const fetchNewsFlashes = useCallback(async () => {
    setIsNewsLoading(true);
    try {
      const response = await fetch("/api/generate-news-flash");
      if (!response.ok)
        throw new Error(
          (await response.json()).error || `Error: ${response.status}`
        );
      const data = await response.json();
      setNewsFlashes(
        data.flashes || ["Weazel News Offline. Check back later."]
      );
    } catch (err) {
      console.error("Failed to fetch news flashes:", err);
      setNewsFlashes(["Technical difficulties at Weazel News."]);
    } finally {
      setIsNewsLoading(false);
    }
  }, []);

  const toggleMusic = useCallback(() => {
    playSound(UIEffects.click);
    const audioEl = audioRef.current;
    if (!audioEl) return;
    if (audioEl.muted) {
      audioEl.muted = false;
      setIsMusicMuted(false);
      if (audioEl.paused)
        audioEl
          .play()
          .catch((e) => console.error("Error playing music on unmute:", e));
    } else {
      audioEl.muted = true;
      setIsMusicMuted(true);
    }
  }, []);

  // --- useEffect Hooks ---
  useEffect(() => {
    // Main Countdown
    const targetDate = new Date("2026-05-25T18:30:00Z").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance >= 0) {
        setDays(
          String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0")
        );
        setHours(
          String(
            Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          ).padStart(2, "0")
        );
        setMinutes(
          String(
            Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          ).padStart(2, "0")
        );
        const newSecondsVal = String(
          Math.floor((distance % (1000 * 60)) / 1000)
        ).padStart(2, "0");
        setSecondsToDisplay((prevSeconds) => {
          if (prevSeconds !== newSecondsVal)
            setSecondsAnimationKey((key) => key + 1);
          return newSecondsVal;
        });
      } else {
        clearInterval(interval);
        setIsReleased(true);
        fetchReleaseDayMessage();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isReleased, fetchReleaseDayMessage]);

  useEffect(() => {
    // Sub-second Countdown
    if (isReleased) {
      setCurrentDecisecond("0");
      setCurrentCentisecond("00");
      setCurrentMillisecond("000");
      return;
    }
    const subSecondInterval = setInterval(() => {
      const now = new Date();
      const ms = now.getMilliseconds();
      setCurrentDecisecond(String(Math.floor(ms / 100))); // 0-9
      setCurrentCentisecond(String(Math.floor(ms / 10)).padStart(2, "0")); // 00-99
      setCurrentMillisecond(String(ms).padStart(3, "0")); // 000-999
    }, 50);
    return () => clearInterval(subSecondInterval);
  }, [isReleased]);

  useEffect(() => {
    fetchSpeculativeInfo();
  }, [fetchSpeculativeInfo]);

  useEffect(() => {
    // News Flashes
    fetchNewsFlashes();
    const newsInterval = setInterval(fetchNewsFlashes, 60000);
    return () => clearInterval(newsInterval);
  }, [fetchNewsFlashes]);

  useEffect(() => {
    // Background Music
    const audioEl = audioRef.current;
    if (audioEl) {
      audioEl.volume = 0.3;
      const playMusic = async () => {
        try {
          await audioEl.play();
          setIsMusicMuted(false);
        } catch (error) {
          audioEl.muted = true;
          setIsMusicMuted(true);
          try {
            await audioEl.play();
          } catch (mutedError) {
            console.error(
              "Muted music fallback also failed.",
              mutedError.message
            );
          }
        }
      };
      playMusic();
    }
  }, []);

  // EFFECT TO MANAGE CROSSFADING BACKGROUND (MIXED MEDIA)
  useEffect(() => {
    if (backgroundMedia.length === 0) return;

    const activeSlotIdx = visiblePlayerSlot;
    const inactiveSlotIdx = 1 - visiblePlayerSlot;
    const activePlayerManager = mediaPlayersRefs[activeSlotIdx];
    const inactivePlayerManager = mediaPlayersRefs[inactiveSlotIdx];
    const activeVideoEl = activePlayerManager.video.current;
    const inactiveVideoEl = inactivePlayerManager.video.current;

    const performTransition = () => {
      setActiveMediaIndex((prevIdx) => (prevIdx + 1) % backgroundMedia.length);
      setVisiblePlayerSlot((prevSlot) => 1 - prevSlot);
    };

    const currentMediaItem =
      backgroundMedia[activeMediaIndex % backgroundMedia.length];
    if (!currentMediaItem) return;

    if (currentMediaItem.type === "video") {
      if (activeVideoEl) {
        const targetSrc = window.location.origin + currentMediaItem.src;
        if (activeVideoEl.src !== targetSrc) {
          activeVideoEl.src = currentMediaItem.src;
          activeVideoEl.load();
        }
        activeVideoEl.onended = performTransition;
        activeVideoEl
          .play()
          .catch((e) =>
            console.warn(
              `Play failed for active video ${activeVideoEl.src}: ${e.message}`
            )
          );
      }
    } else if (currentMediaItem.type === "image") {
      if (activeVideoEl) activeVideoEl.pause(); // Pause video if this slot was playing one
      if (activePlayerManager.imageTimeoutId.current)
        clearTimeout(activePlayerManager.imageTimeoutId.current);
      activePlayerManager.imageTimeoutId.current = setTimeout(
        performTransition,
        IMAGE_DISPLAY_DURATION
      );
    }

    const nextMediaItemToPreload =
      backgroundMedia[(activeMediaIndex + 1) % backgroundMedia.length];
    if (!nextMediaItemToPreload) return;

    if (nextMediaItemToPreload.type === "video") {
      if (inactiveVideoEl) {
        const targetSrc = window.location.origin + nextMediaItemToPreload.src;
        if (inactiveVideoEl.src !== targetSrc) {
          inactiveVideoEl.src = nextMediaItemToPreload.src;
          inactiveVideoEl.load();
        }
        inactiveVideoEl.pause();
      }
    } else if (nextMediaItemToPreload.type === "image") {
      if (inactiveVideoEl) inactiveVideoEl.pause(); // Ensure video in inactive slot is paused if next is image
    }

    return () => {
      if (activePlayerManager.imageTimeoutId.current) {
        clearTimeout(activePlayerManager.imageTimeoutId.current);
        activePlayerManager.imageTimeoutId.current = null;
      }
      if (activeVideoEl) activeVideoEl.onended = null;
    };
  }, [activeMediaIndex, visiblePlayerSlot, backgroundMedia]);

  // --- Render Helpers ---
  const renderStaticCountdownValue = (value) =>
    value.split("").map((digit, index) => (
      <span key={index} className="inline-block min-w-[0.6ch]">
        {digit}
      </span>
    ));

  const countdownItems = [
    { value: days, label: "Days", id: "days" },
    { value: hours, label: "Hours", id: "hours" },
    { value: minutes, label: "Minutes", id: "minutes" },
    { value: secondsToDisplay, label: "Seconds", id: "seconds" },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-gta-pink selection:text-white relative font-sans">
      {/* DYNAMIC BACKGROUND (MIXED MEDIA) START */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden bg-black">
        {" "}
        {/* bg-black for fallback or brief transitions */}
        {[0, 1].map((slotIndex) => {
          if (backgroundMedia.length === 0) return null;
          const mediaForThisSlot =
            slotIndex === visiblePlayerSlot
              ? backgroundMedia[activeMediaIndex % backgroundMedia.length]
              : backgroundMedia[
                  (activeMediaIndex + 1) % backgroundMedia.length
                ];
          if (!mediaForThisSlot) {
            return (
              <div
                key={`player-slot-${slotIndex}`}
                className={`absolute top-0 left-0 w-full h-full opacity-0`}
              />
            );
          }
          return (
            <div
              key={`player-slot-${slotIndex}`}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                visiblePlayerSlot === slotIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              {mediaForThisSlot.type === "video" && (
                <video
                  ref={mediaPlayersRefs[slotIndex].video}
                  muted
                  playsInline
                  preload="auto"
                  className="absolute top-0 left-0 w-full h-full object-cover" // Video: fill screen, crop if needed
                >
                  Your browser does not support the video tag.
                </video>
              )}
              {mediaForThisSlot.type === "image" && (
                <div
                  className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat" // Image: fill screen, crop if needed
                  style={{ backgroundImage: `url(${mediaForThisSlot.src})` }}
                  aria-label="Dynamic background image"
                />
              )}
            </div>
          );
        })}
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-30 sm:opacity-50"></div>{" "}
        {/* Darkening overlay */}
      </div>
      {/* DYNAMIC BACKGROUND END */}

      {/* Music Toggle Button */}
      <div className="absolute top-4 left-4 z-30">
        <button
          onClick={toggleMusic}
          aria-label={isMusicMuted ? "Turn Sound On" : "Turn Sound Off"}
          className="btn-gta font-sans text-xs sm:text-sm py-2 px-3 sm:px-4 bg-black/50 backdrop-blur-sm border-gta-pink hover:bg-gta-pink hover:text-black hover:shadow-neon-pink"
        >
          {isMusicMuted ? "SOUND ON" : "SOUND OFF"}
        </button>
      </div>

      {/* News Ticker */}
      {!isNewsLoading && newsFlashes.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-2 z-20 overflow-hidden whitespace-nowrap border-t-2 border-gta-pink">
          <div className="animate-marquee flex">
            <span className="font-pricedown text-gta-cyan text-lg md:text-xl mx-4">
              WEAZEL NEWS:
            </span>
            {newsFlashes.map((flash, index) => (
              <span
                key={index}
                className="text-white text-sm md:text-base mr-12"
              >
                {flash}
              </span>
            ))}
            <span className="font-pricedown text-gta-cyan text-lg md:text-xl mx-4">
              WEAZEL NEWS:
            </span>
            {newsFlashes.map((flash, index) => (
              <span
                key={`dup-${index}`}
                className="text-white text-sm md:text-base mr-12"
              >
                {flash}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full max-w-5xl mx-auto text-center pt-16 pb-24 relative z-10">
        <header className="mb-8 md:mb-10 p-5 rounded-lg glass-effect animate-fadeIn flex flex-col items-center">
          <div className="relative w-72 h-24 sm:w-80 sm:h-28 md:w-[28rem] md:h-36 mx-auto mb-3">
            <Image
              src="/assets/gta6-logo.png" // CHECK THIS PATH: e.g., public/assets/gta6-logo.png or public/assets/images/gta6-logo.png
              alt="GTA VI Logo"
              fill
              style={{ objectFit: "contain" }}
              className="neon-text-effect"
              priority
            />
          </div>
          <p className="font-myfont text-3xl md:text-4xl lg:text-5xl">
            Countdown to Leonida
          </p>
        </header>

        {!isReleased ? (
          <div
            id="countdown-timer"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-5 mb-8 md:mb-10 animate-slideUp"
            style={{ animationDelay: "0.2s" }}
          >
            {countdownItems.map((item) => (
              <div
                key={item.id}
                className="glass-effect p-3 py-5 rounded-lg flex flex-col items-center justify-center hover:border-glass-border-hover hover:shadow-card-hover transition-all duration-300"
              >
                <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums countdown-timer-text">
                  {item.id === "seconds"
                    ? secondsToDisplay.split("").map((digit, index) => (
                        <span
                          key={`${secondsAnimationKey}-${index}`}
                          className="inline-block min-w-[0.6ch] animate-flash"
                        >
                          {digit}
                        </span>
                      ))
                    : renderStaticCountdownValue(item.value)}
                </span>
                <span className="mt-1.5 uppercase tracking-wider text-xs countdown-label-text">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-8 md:mb-10 p-6 rounded-lg glass-effect min-h-[80px] animate-fadeIn">
            <h2 className="text-3xl md:text-4xl font-bold neon-text-effect">
              THE WAIT IS OVER!
            </h2>
            <p className="mt-2 text-xl md:text-2xl opacity-90">
              Welcome to Leonida!
            </p>
          </div>
        )}

        <div
          id="release-message-area-speculative"
          className="mb-8 md:mb-10 p-4 rounded-lg glass-effect min-h-[90px] flex flex-col items-center justify-center cursor-pointer hover:border-glass-border-hover transition-colors"
          onClick={() => {
            playSound(UIEffects.click, 0.4);
            fetchSpeculativeInfo(true);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              playSound(UIEffects.click, 0.4);
              fetchSpeculativeInfo(true);
            }
          }}
        >
          {isSpeculativeLoading ? (
            <div className="spinner"></div>
          ) : (
            <div key={speculativeKey} className="animate-glitch w-full">
              <p className="text-md md:text-lg lg:text-xl opacity-95 font-sans text-center">
                {speculativeReleaseText}
              </p>
              <p className="text-xs opacity-70 mt-1.5">
                (Tap or press Enter for new intel | Fan countdown to May 26,
                2026, 00:00 IST)
              </p>
            </div>
          )}
        </div>

        <div
          className="mb-8 md:mb-10 animate-slideUp"
          style={{ animationDelay: "0.4s" }}
        >
          <button
            id="generateRumorButton"
            onClick={handleGenerateRumor}
            disabled={isRumorLoading}
            className={`btn-gta btn-gta-primary ${
              isRumorLoading ? "" : "animate-pulseGlow"
            }`}
          >
            {isRumorLoading ? "SCANNING AIRWAVES..." : "GET LEONIDA SCOOP"}
          </button>
          <div
            className="mt-5 p-1.5 rounded-xl bg-neutral-800/60 shadow-xl max-w-md mx-auto glass-effect"
            style={{ border: "4px solid #333", borderRadius: "20px" }}
          >
            <div className="bg-neutral-900/80 rounded-lg p-4 min-h-[120px] flex flex-col items-center justify-center text-left w-full">
              {isRumorLoading && <div className="spinner"></div>}
              {!isRumorLoading && (rumorError || rumor) && (
                <div key={rumorKey} className="animate-glitch w-full">
                  <p className="font-sans text-sm sm:text-base text-neutral-200 whitespace-pre-wrap">
                    <span className="text-gta-cyan font-bold">
                      Unknown Sender:{" "}
                    </span>
                    {rumorError ? (
                      <span className="text-gta-red">{rumorError}</span>
                    ) : (
                      rumor
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <audio id="bg-music" ref={audioRef} loop playsInline preload="auto">
          <source src="/assets/gta-vc-style.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        <footer
          className="w-full mt-8 mb-4 p-5 rounded-lg glass-effect text-center animate-fadeIn"
          style={{ animationDelay: "0.6s" }}
        >
          <h3 className="font-myfont text-xl md:text-2xl mb-4">
            Time's Fleeting Fractions
          </h3>
          {!isReleased ? (
            <>
              <div
                id="subsecond-countdown-timer"
                className="grid grid-cols-3 gap-2 sm:gap-4 mb-6"
              >
                {[
                  { value: currentDecisecond, label: "Deciseconds" },
                  { value: currentCentisecond, label: "Centiseconds" },
                  { value: currentMillisecond, label: "Milliseconds" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="glass-effect p-3 py-4 rounded-lg flex flex-col items-center justify-center"
                  >
                    <span className="text-3xl sm:text-4xl font-bold tabular-nums countdown-timer-text">
                      {item.value}
                    </span>
                    <span className="mt-1 uppercase tracking-wider text-[10px] sm:text-xs countdown-label-text">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs opacity-80 leading-relaxed">
                <p>
                  Beyond Milliseconds: Microseconds (µs) → Nanoseconds (ns) →
                  Picoseconds (ps)
                  <br />
                  Further still: Femtoseconds (fs) → Attoseconds (as)
                  <br />
                  Approaching the limit: Zeptoseconds (zs) → Yoctoseconds (ys)
                </p>
                <p className="mt-3">
                  Ultimately reaching the theoretical smallest unit of time:
                  <br />
                  <strong className="text-gta-pink neon-text-effect-subtle">
                    Planck Time (t<sub>P</sub>)
                  </strong>
                  {" ≈ 5.391 × 10"}
                  <sup>-44</sup>
                  {" s"}
                </p>
                <p className="text-[10px] opacity-70 mt-3">
                  (Sub-second display shows the passage of time within each
                  second until the target.)
                </p>
              </div>
            </>
          ) : (
            <p className="text-lg opacity-90">
              Time stands still... or does it? Perhaps it's just begun.
            </p>
          )}
        </footer>
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 bg-dark-overlay backdrop-blur-sm flex items-center justify-center z-[1000]"
          onClick={() => {
            setShowPopup(false);
            playSound(UIEffects.click, 0.4);
          }}
        >
          <div
            className={`message-box animate-fadeIn ${
              popupType === "success"
                ? "border-gta-green"
                : popupType === "error"
                ? "border-gta-red"
                : "border-gta-cyan"
            }`}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="popup-title"
            aria-describedby="popup-message-content"
          >
            <h3
              id="popup-title"
              className={`font-pricedown text-3xl mb-4 ${
                popupType === "success"
                  ? "text-gta-green neon-text-effect-subtle"
                  : popupType === "error"
                  ? "text-gta-red"
                  : "text-gta-cyan neon-text-effect-subtle"
              }`}
            >
              {popupType === "success"
                ? "MISSION PASSED!"
                : popupType === "error"
                ? "WASTED!"
                : "ALERT!"}
            </h3>
            <p
              id="popup-message-content"
              className="text-lg md:text-xl font-sans mb-6"
            >
              {popupMessage}
            </p>
            <button
              onClick={() => {
                setShowPopup(false);
                playSound(UIEffects.click, 0.4);
              }}
              className="btn-gta bg-gta-pink hover:bg-pink-700 text-white font-semibold py-2 px-10 rounded-md"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
