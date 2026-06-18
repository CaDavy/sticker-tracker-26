import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

const COUNTRIES = [
  "MEX","RSA","KOR","CZE","CAN","BIH","QAT","SUI","BRA","MAR",
  "HAI","SCO","USA","PAR","AUS","TUR","GER","CUW","CIV","ECU",
  "NED","JPN","SWE","TUN","BEL","EGY","IRN","NZL","ESP","CPV",
  "KSA","URU","FRA","SEN","IRQ","NOR","ARG","ALG","AUT","JOR",
  "POR","COD","UZB","COL","ENG","CRO","GHA","PAN"
];

const STORAGE_KEY = "sticker-tracker-26";

type State = {
  specials: Record<number, number>;
  countries: Record<string, Record<number, number>>;
  lock: boolean;
};

export default function App() {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { specials: {}, countries: {}, lock: false };
  });

  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function add(country: string, id: number) {
    if (state.lock) return;

    setState((prev) => {
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

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
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

  async function scan() {
    if (!videoRef.current) return;

    setLoading(true);

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/png");

    const result = await Tesseract.recognize(img, "eng");
    const text = result.data.text.toUpperCase();

    console.log("OCR:", text);

    const match = text.match(/([A-Z]{2,3})\D*(\d{1,3})/);

    if (match) {
      const country = match[1];
      const number = Number(match[2]);

      if (COUNTRIES.includes(country)) {
        add(country, number);
        closeScanner();
      } else {
        alert("Onbekend land: " + country);
      }
    } else {
      alert("Sticker niet herkend. Probeer dichterbij.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">

      <button
        onClick={openScanner}
        className="bg-blue-600 px-4 py-2 rounded"
      >
        Open scanner
      </button>

      {scannerOpen && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-sm rounded"
          />

          <button
            onClick={scan}
            disabled={loading}
            className="mt-4 bg-green-600 px-6 py-3 rounded"
          >
            {loading ? "Scannen..." : "Scan sticker"}
          </button>

          <button onClick={closeScanner} className="mt-2 underline">
            sluiten
          </button>
        </div>
      )}
    </div>
  );
}