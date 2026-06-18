import { useEffect, useRef, useState } from "react";

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

  /**
   * 💾 SAVE
   */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /**
   * ➕ ADD
   */
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

  /**
   * ➖ REMOVE
   */
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

  /**
   * 📷 CAMERA (iPHONE SAFE)
   */
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
    } catch {
      alert("Camera niet toegestaan of niet beschikbaar");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function openScanner() {
    setScannerOpen(true);
    setTimeout(startCamera, 200);
  }

  function closeScanner() {
    stopCamera();
    setScannerOpen(false);
  }

  function scanManual() {
    const input = prompt("Sticker (bv USA-12)");
    if (!input) return;

    const [country, num] = input.split("-");
    add(country, Number(num));

    closeScanner();
  }

  /**
   * 🎴 CARD
   */
  function Card({ id, label, count, color, onTap, onHold }: any) {
    let timer: any;

    return (
      <div
        className={`${color} text-white p-3 rounded-2xl shadow-lg`}
        onClick={onTap}
        onMouseDown={() => (timer = setTimeout(onHold, 500))}
        onMouseUp={() => clearTimeout(timer)}
        onTouchStart={() => (timer = setTimeout(onHold, 500))}
        onTouchEnd={() => clearTimeout(timer)}
      >
        <div className="flex justify-between">
          <div>{label}</div>
          <div>#{id}</div>
        </div>

        <div className="mt-2 text-sm opacity-80">
          {count === 0 ? "niet verzameld" : count === 1 ? "verzameld" : "dubbel"}
        </div>

        <div className="text-xl font-bold">x{count}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-pink-500 to-yellow-400">

      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 p-2">
        <button onClick={() => { setTab("SPECIALS"); setSelectedCountry(null); }} className="bg-black text-white px-3 py-1 rounded-full">
          SPECIALS
        </button>

        {COUNTRIES.map((c) => (
          <button
            key={c}
            onClick={() => { setTab(c); setSelectedCountry(c); }}
            className="bg-white/30 text-white px-3 py-1 rounded-full"
          >
            {c}
          </button>
        ))}
      </div>

      {/* SPECIALS */}
      {tab === "SPECIALS" && (
        <div className="grid grid-cols-2 gap-3 p-3">
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

      {/* COUNTRIES */}
      {tab !== "SPECIALS" && selectedCountry && (
        <div className="grid grid-cols-2 gap-3 p-3">
          {Array.from({ length: 20 }, (_, i) => (
            <Card
              key={i}
              id={i + 1}
              label="🏳️"
              color="bg-blue-500"
              count={state.countries?.[selectedCountry]?.[i + 1] || 0}
              onTap={() => add(selectedCountry, i + 1)}
              onHold={() => remove(selectedCountry, i + 1)}
            />
          ))}
        </div>
      )}

      {/* CAMERA BUTTON */}
      <button
        onClick={openScanner}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-4 rounded-full"
      >
        📷
      </button>

      {/* LOCK */}
      <button
        onClick={toggleLock}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-full"
      >
        {state.lock ? "🔒" : "🔓"}
      </button>

      {/* SCANNER */}
      {scannerOpen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-sm rounded-xl"
          />

          <button
            onClick={scanManual}
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-full"
          >
            📸 Scan sticker
          </button>

          <button onClick={closeScanner} className="text-white mt-3 underline">
            sluiten
          </button>
        </div>
      )}

    </div>
  );
}