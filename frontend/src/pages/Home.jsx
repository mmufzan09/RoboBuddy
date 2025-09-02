import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import aiGif from "../assets/ai.gif";
import userGif from "../assets/user.gif";

function HomePage() {
  const { userData, setUserData, getGeminiResponse } = useContext(UserDataContext);
  const [loading, setLoading] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);
  const [listeningMode, setListeningMode] = useState(true);
  const [isStopped, setIsStopped] = useState(false);
  const [voice, setVoice] = useState(null);
  const [arduinoStatus, setArduinoStatus] = useState("");
  const [conversation, setConversation] = useState(null); // ✅ ek hi conversation (user + ai)

  const voicesRef = useRef([]);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

  // ✅ Arduino command bhejne ka helper
  const sendToArduino = async (cmd) => {
    try {
      await axios.post(`${serverUrl}/api/arduino/send`, { command: cmd });
      setArduinoStatus(`✅ Arduino executed: ${cmd}`);
    } catch (err) {
      setArduinoStatus(`❌ Arduino error: ${err.message}`);
    }
  };

  // Load voices
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return setTimeout(loadVoices, 100);
      voicesRef.current = voices;
      const maleVoice =
        voices.find((v) => v.lang.includes("en") && /male/i.test(v.name)) ||
        voices.find((v) => v.lang.includes("en")) ||
        voices[0];
      setVoice(maleVoice);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userData?.assistantName || !userData?.assistantImage) {
          const res = await axios.get(`${serverUrl}/api/user/current`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            withCredentials: true,
          });
          setUserData(res.data);
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/signin");
  };

  const goToCustomize = () => navigate("/customize2");

  const speak = (text, callback) => {
    if (!voiceActive || !text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1;
    utter.rate = 1.2;
    if (voice) utter.voice = voice;
    utter.lang = /[\u0600-\u06FF]/.test(text) ? "ur-PK" : "en-US";

    if (callback) utter.onend = callback;
    window.speechSynthesis.speak(utter);
  };

  const handleCommand = async ({ userInput, response }) => {
    // ✅ ek hi conversation set karo
    setConversation({
      user: userInput,
      ai: "Thinking...",
    });

    // ✅ Arduino commands
    if (response.toLowerCase().includes("light on")) {
      sendToArduino("led on");
    } else if (response.toLowerCase().includes("light off")) {
      sendToArduino("led off");
    }

    // ✅ Update AI response
    setConversation({
      user: userInput,
      ai: response,
    });

    // ✅ Mic pause while speaking
    recognitionRef.current?.stop();
    recognitionRef.current.running = false;
    speak(response, () => {
      if (!isStopped && listeningMode) {
        try {
          if (!recognitionRef.current.running) {
            recognitionRef.current.start();
            recognitionRef.current.running = true;
          }
        } catch {}
      }
    });
  };

  // ✅ Quick commands
  const handleQuickCommand = (transcript) => {
    if (transcript.includes("open youtube")) {
      speak("Opening YouTube");
      window.open("https://www.youtube.com", "_blank");
    } else if (transcript.includes("search youtube")) {
      const query = transcript.split("search youtube")[1]?.trim();
      if (query) {
        speak(`Searching YouTube for ${query}`);
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          "_blank"
        );
      }
    } else if (transcript.includes("open google")) {
      speak("Opening Google");
      window.open("https://www.google.com", "_blank");
    } else if (transcript.includes("search google")) {
      const query = transcript.split("search google")[1]?.trim();
      if (query) {
        speak(`Searching Google for ${query}`);
        window.open(
          `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          "_blank"
        );
      }
    } else if (transcript.includes("open instagram")) {
      speak("Opening Instagram");
      window.open("https://www.instagram.com", "_blank");
    } else if (transcript.includes("open facebook")) {
      speak("Opening Facebook");
      window.open("https://www.facebook.com", "_blank");
    } else if (transcript.includes("weather")) {
      speak("Opening weather");
      window.open("https://www.google.com/search?q=weather", "_blank");
    } else {
      return false;
    }
    return true;
  };

  // ✅ Speech recognition setup
  useEffect(() => {
    if (!voiceActive) return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.running = false;

      recognition.onresult = async (e) => {
        const transcript = e.results[e.results.length - 1][0].transcript
          .trim()
          .toLowerCase();

        console.log("🎧 Heard:", transcript);

        if (!userData?.assistantName) return;

        if (transcript.includes("sleep")) {
          setListeningMode(false);
          speak("Going to sleep.");
          return;
        }
        if (!listeningMode && transcript.includes(userData.assistantName.toLowerCase())) {
          setListeningMode(true);
          speak("I'm back!");
          return;
        }
        if (transcript.includes("stop")) {
          setIsStopped(true);
          recognition.stop();
          recognition.running = false;
          speak("Stopping.");
          return;
        }

        if (handleQuickCommand(transcript)) return;

        if (transcript.includes(userData.assistantName.toLowerCase())) {
          try {
            const rawData = await getGeminiResponse(transcript);
            const response =
              typeof rawData === "string"
                ? rawData
                : rawData?.response || "I did not understand that.";

            handleCommand({ userInput: transcript, response });
          } catch (err) {
            console.error("AI Response error:", err.message);
          }
        }
      };

      recognition.onerror = () => {
        recognition.running = false;
        if (!isStopped && listeningMode) {
          setTimeout(() => {
            try {
              if (!recognition.running) {
                recognition.start();
                recognition.running = true;
              }
            } catch {}
          }, 500);
        }
      };

      recognition.onend = () => {
        recognition.running = false;
        if (!isStopped && listeningMode) {
          try {
            if (!recognition.running) {
              recognition.start();
              recognition.running = true;
            }
          } catch {}
        }
      };

      recognitionRef.current = recognition;
    }

    if (!isStopped && listeningMode && !recognitionRef.current.running) {
      try {
        recognitionRef.current.start();
        recognitionRef.current.running = true;
      } catch {}
    }

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current.running = false;
    };
  }, [voiceActive, userData, listeningMode, isStopped, voice]);

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

  const imageSrc = userData?.assistantImage?.startsWith("http")
    ? userData.assistantImage
    : userData?.assistantImage;

  // ✅ Chrome activation screen
  if (!voiceActive) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black text-white gap-4">
        <h1 className="text-2xl">Click below to activate assistant voice</h1>
        <button
          onClick={() => {
            setVoiceActive(true);
            speak("Hello, I'm ready!");
          }}
          className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded text-white font-bold"
        >
          Activate Voice
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-hidden bg-gradient-to-t from-black to-blue-950 flex flex-col justify-start items-center p-4 sm:p-6 md:p-8 gap-6 relative">
      <div className="absolute top-4 right-4 flex flex-col gap-2 md:gap-3">
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md text-xs sm:text-sm md:text-base"
        >
          Logout
        </button>
        <button
          onClick={goToCustomize}
          className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-full shadow-md text-xs sm:text-sm md:text-base"
        >
          Customize
        </button>
      </div>

      {imageSrc && (
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 lg:w-72 lg:h-72">
          <img
            src={imageSrc}
            alt="Assistant"
            className="w-full h-full object-cover rounded-2xl border-4 border-cyan-400 shadow-xl transition-transform hover:scale-105 hover:brightness-75"
          />
        </div>
      )}

      <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg mt-4">
        I'm {userData?.assistantName}
      </h1>

      {/* ✅ Latest conversation only */}
      <div className="w-full max-w-2xl mt-6 bg-white/10 p-3 sm:p-4 md:p-6 rounded-2xl shadow-lg flex flex-col gap-4 flex-grow overflow-y-auto">
        {conversation && (
          <>
            <div className="flex items-start gap-3">
              <img
                src={userGif}
                alt="user"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full"
              />
              <p className="bg-blue-900 text-white text-sm md:text-lg px-3 py-2 rounded-2xl shadow">
                {conversation.user}
              </p>
            </div>
            <div className="flex items-start gap-3 self-end">
              <p className="bg-cyan-800 text-white text-sm md:text-lg px-3 py-2 rounded-2xl shadow">
                {conversation.ai}
              </p>
              <img
                src={aiGif}
                alt="ai"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 rounded-full"
              />
            </div>
          </>
        )}

        {/* ✅ Arduino status */}
        {arduinoStatus && (
          <p className="text-green-400 text-xs sm:text-sm mt-2">{arduinoStatus}</p>
        )}
      </div>

      <div className="mt-4">
        {isStopped ? (
          <span className="px-3 py-1 bg-red-600 rounded-full text-sm md:text-base">
            🛑 Stopped
          </span>
        ) : listeningMode ? (
          <span className="px-3 py-1 bg-green-500 rounded-full animate-pulse text-sm md:text-base">
            🎤 Listening...
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-500 rounded-full text-sm md:text-base">
            😴 Sleeping
          </span>
        )}
      </div>
    </div>
  );
}

export default HomePage;
