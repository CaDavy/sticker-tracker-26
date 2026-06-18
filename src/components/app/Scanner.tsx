import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

interface Props {
  onClose: () => void;
  onScan: (code: string, num: number) => void;
}

export default function Scanner({ onClose, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

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
    } catch (e) {
      setError("Camera niet beschikbaar");
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  async function scan() {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");

    const result = await Tesseract.recognize(image, "eng");
    const text = result.data.text.toUpperCase();

    console.log("OCR:", text);

    const cleaned = text.replace(/[^A-Z0-9\s]/g, " ");
    const parts = cleaned.split(/\s+/);

    let code = "";
    let num = 0;

    for (const p of parts) {
      if (p.match(/^[A-Z]{2,3}$/)) code = p;
      if (p.match(/^\d{1,3}$/)) num = Number(p);
    }

    if (code && num) {
      onScan(code, num);
      onClose();
    } else {
      setError("Niet herkend");
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">

      <video
        ref={videoRef}
        className="w-full max-w-sm rounded"
        playsInline
        muted
      />

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={scan}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        SCAN
      </button>

      <button onClick={onClose} className="mt-2 text-white underline">
        sluiten
      </button>

    </div>
  );
}