import { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

type Props = {
  onClose: () => void;
  onScan: (code: string, num: number) => void;
};

export default function Scanner({ onClose, onScan }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState("");

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
      },
      audio: false,
    });

    streamRef.current = stream;

    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      await new Promise((r) => {
        videoRef.current!.onloadedmetadata = () => r(null);
      });

      await videoRef.current.play();
    }

    setRunning(true);
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    startCamera();

    return () => stopCamera();
  }, []);

  async function scan() {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL("image/png");

    const res = await Tesseract.recognize(img, "eng");

    const text = res.data.text.toUpperCase();

    console.log("OCR:", text);

    const cleaned = text.replace(/[^A-Z0-9\s]/g, " ");
    const parts = cleaned.split(/\s+/);

    let code = "";
    let num = 0;

    for (const p of parts) {
      if (p.length >= 2 && p.length <= 3 && /^[A-Z]+$/.test(p)) {
        code = p;
      }
      if (/^\d{1,3}$/.test(p)) {
        num = Number(p);
      }
    }

    if (code && num) {
      setResult(`${code} ${num}`);
      onScan(code, num);

      // auto close after success
      setTimeout(() => {
        stopCamera();
        onClose();
      }, 500);
    } else {
      setResult("Niet herkend");
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      
      <video
        ref={videoRef}
        className="w-full max-w-sm rounded-xl"
        autoPlay
        playsInline
        muted
      />

      <button
        onClick={scan}
        className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-full"
      >
        Scan
      </button>

      <p className="text-white mt-2">{result}</p>

      <button
        onClick={() => {
          stopCamera();
          onClose();
        }}
        className="text-white mt-3 underline"
      >
        sluiten
      </button>
    </div>
  );
}