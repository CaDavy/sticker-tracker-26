import { useEffect, useState } from "react";
import Scanner from "./components/app/Scanner";

const STORAGE_KEY = "sticker-tracker-26";

type State = {
  stickers: Record<string, Record<number, number>>;
};

export default function App() {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { stickers: {} };
  });

  const [scannerOpen, setScannerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  function add(code: string, num: number) {
    setState((prev) => {
      const current = prev.stickers[code]?.[num] || 0;

      return {
        ...prev,
        stickers: {
          ...prev.stickers,
          [code]: {
            ...(prev.stickers[code] || {}),
            [num]: current + 1,
          },
        },
      };
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-pink-500 to-yellow-400 p-4">

      <h1 className="text-2xl font-bold text-white mb-4">
        Sticker Tracker
      </h1>

      <button
        onClick={() => setScannerOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        📷 Open Scanner
      </button>

      {/* RESULT VIEW (debug) */}
      <pre className="mt-4 text-white text-xs">
        {JSON.stringify(state, null, 2)}
      </pre>

      {/* SCANNER */}
      {scannerOpen && (
        <Scanner
          onClose={() => setScannerOpen(false)}
          onScan={(code, num) => {
            console.log("SCAN:", code, num);
            add(code, num);
          }}
        />
      )}
    </div>
  );
}