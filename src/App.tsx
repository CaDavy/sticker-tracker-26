import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

/**
 * 🌍 DATA
 */
const COUNTRIES = [
  "MEX","RSA","KOR","CZE","CAN","BIH","QAT","SUI","BRA","MAR",
  "HAI","SCO","USA","PAR","AUS","TUR","GER","CUW","CIV","ECU",
  "NED","JPN","SWE","TUN","BEL","EGY","IRN","NZL","ESP","CPV",
  "KSA","URU","FRA","SEN","IRQ","NOR","ARG","ALG","AUT","JOR",
  "POR","COD","UZB","COL","ENG","CRO","GHA","PAN"
];

const SPECIALS = Array.from({ length: 20 }, (_, i) => i);

const STORAGE_KEY = "sticker-tracker-26";

type State = {
  specials: Record<number, number>;
  countries: Record<string, Record<number, number>>;
  lock: boolean;
};

export default function App() {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : { specials: {}, countries: {}, lock: false };
  });

  const [tab, setTab] = useState("SPECIALS");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function add(country: string, id: number) {
    if (state.lock) return;

    setState((prev) => {
      if (country === "SPECIALS") {
        const current = prev.specials[id] || 0;
        return {
          ...prev,
          specials: { ...prev.specials, [id]: current + 1 },
        };
      }

      const current = prev.countries[country]?.[id] || 0;

      return {
        ...prev,
        countries: {
          ...prev.countries,
          [country]: {
            ...(prev.countries[country] || {}),
            [id]: current + 1,
          },
        },
      };
    });
  }

  function remove(country: string, id: number) {
    setState((prev) => {
      if (country === "SPECIALS") {
        const current = prev.specials[id] || 0;
        return {
          ...prev,
          specials: {
            ...prev.specials,
            [id]: Math.max(0, current - 1),
          },
        };
      }

      const current = prev.countries[country]?.[id] || 0;

      return {
        ...prev,
        countries: {
          ...prev.countries,
          [country]: {
            ...(prev.countries[country] || {}),
            [id]: Math.max(0, current - 1),
          },
        },
      };
    });
  }

  function toggleLock() {
    setState((p) => ({ ...p, lock: !p.lock }));
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      alert("Camera niet toegestaan");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function openScanner() {
    setScannerOpen(true);
    setTimeout(startCamera, 300);
  }

  function closeScanner() {
    stopCamera();
    setScannerOpen(false);
  }

  async function scanFromCamera() {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");

    const result = await Tesseract.recognize(image, "eng");
    const text = result.data.text.toUpperCase();

    console.log("OCR:", text);

    const cleaned = text.replace(/[^A-Z0-9\s]/g, " ");
    const parts = cleaned.split(" ");

    let country = "";
    let num = 0;

    for (const p of parts) {
      if (COUNTRIES.includes(p)) country = p;
      if (/^\d{1,3}$/.test(p)) num = Number(p);
    }

    if (country && num) {
      add(country, num);
      closeScanner();
    } else {
      alert("Niet herkend: " + text);
    }
  }

  function Card({ id, label, count, color, onTap, onHold }: any) {
    let timer: any;

    return (
      <div
        className={`${color} text-white p-3 rounded-xl`}
        onClick={onTap}
        onMouseDown={() => (timer = setTimeout(onHold, 400))}
        onMouseUp={() => clearTimeout(timer)}
        onTouchStart={() => (timer = setTimeout(onHold, 400))}
        onTouchEnd={() => clearTimeout(timer)}
      >
        <div className="flex justify-between">
          <div>{label}</div>
          <div>#{id}</div>
        </div>
        <div>x{count}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-pink-500 to-yellow-400">

      <div className="p-2 flex gap-2 overflow-x-auto">
        <button onClick={() => setTab("SPECIALS")}>SPECIALS</button>
        {COUNTRIES.map((c) => (
          <button key={c} onClick={() => { setTab(c); setSelectedCountry(c); }}>
            {c}
          </button>
        ))}
      </div>

      {tab === "SPECIALS" && (
        <div className="grid grid-cols-2 gap-2 p-2">
          {SPECIALS.map((id) => (
            <Card
              key={id}
              id={id}
              label="⭐"
              color="bg-black"
              count={state.specials[id] || 0}
              onTap={() => add("SPECIALS", id)}
              onHold={() => remove("SPECIALS", id)}
            />
          ))}
        </div>
      )}

      {selectedCountry && tab !== "SPECIALS" && (
        <div className="grid grid-cols-2 gap-2 p-2">
          {Array.from({ length: 20 }, (_, i) => (
            <Card
              key={i}
              id={i + 1}
              label="🏳️"
              color="bg-blue-600"
              count={state.countries?.[selectedCountry]?.[i + 1] || 0}
              onTap={() => add(selectedCountry, i + 1)}
              onHold={() => remove(selectedCountry, i + 1)}
            />
          ))}
        </div>
      )}

      <button
        onClick={openScanner}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full"
      >
        📷
      </button>

      <button
        onClick={toggleLock}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-full"
      >
        {state.lock ? "🔒" : "🔓"}
      </button>

      {scannerOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-sm" />

          <button
            onClick={scanFromCamera}
            className="mt-4 bg-green-500 text-white px-6 py-3 rounded"
          >
            SCAN
          </button>

          <button onClick={closeScanner} className="text-white mt-3">
            sluiten
          </button>
        </div>
      )}
    </div>
  );
}