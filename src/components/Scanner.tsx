import { useRef, useState } from "react";
import Webcam from "react-webcam";

type Props = {
  onClose: () => void;
  onScan: (data: { country: string; number: number }) => void;
};

export function Scanner({ onClose, onScan }: Props) {
  const webcamRef = useRef<Webcam>(null);
  const [result, setResult] = useState("");

  /**
   * 📸 neem foto (basis scan)
   */
  const capture = () => {
    const image = webcamRef.current?.getScreenshot();
    if (!image) return;

    /**
     * 🔥 SIMPELE VERSIE:
     * gebruiker typt wat sticker is
     * (later vervangen door AI OCR)
     */
    const input = prompt(
      "Sticker invoeren (voorbeeld: USA-12 of NED-5)"
    );

    if (!input) return;

    const parts = input.split("-");

    if (parts.length !== 2) return;

    const country = parts[0];
    const number = Number(parts[1]);

    if (!country || !number) return;

    onScan({ country, number });
    setResult(`${country}-${number}`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50">

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full max-w-sm rounded-xl"
        videoConstraints={{ facingMode: "environment" }}
      />

      <button
        onClick={capture}
        className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-full"
      >
        📸 Scan sticker
      </button>

      <button
        onClick={onClose}
        className="mt-2 text-white underline"
      >
        sluiten
      </button>

      {result && (
        <div className="text-white mt-3">
          Laatste: {result}
        </div>
      )}

    </div>
  );
}