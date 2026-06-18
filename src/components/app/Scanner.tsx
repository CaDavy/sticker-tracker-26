import { useState, useRef, useCallback, useEffect } from 'react';
import { getTeamCodeFromText, parseStickerNumber, allTeams } from '../../data/teams';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Camera, X, Scan, Check, AlertCircle } from 'lucide-react';
import { ScannerResult } from '../../types';

interface ScannerProps {
  onClose: () => void;
  onScanResult: (result: ScannerResult) => void;
}

export function Scanner({ onClose, onScanResult }: ScannerProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [manualText, setManualText] = useState('');
  const [lastResult, setLastResult] = useState<ScannerResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanInterval = useRef<number | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (e) {
      setError('Camera niet beschikbaar. Gebruik handmatige invoer.');
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
    setCameraActive(false);
  }, []);

  const performOCR = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Simple OCR via text recognition if available
    if ('TextDetector' in window) {
      // @ts-expect-error - TextDetector API
      const detector = new TextDetector();
      detector.detect(canvas).then((texts: Array<{ rawValue: string }>) => {
        const allText = texts.map((t: { rawValue: string }) => t.rawValue).join(' ');
        processDetectedText(allText);
      }).catch(() => {
        // Fallback: analyze canvas pixels for text-like patterns
      });
    }
  }, []);

  const processDetectedText = useCallback((text: string) => {
    const teamCode = getTeamCodeFromText(text);
    const number = parseStickerNumber(text);
    if (teamCode && number !== null) {
      const team = allTeams.find(t => t.id === teamCode);
      if (team && number >= 0 && number < team.stickers.length) {
        const result = { teamCode, number };
        setLastResult(result);
        onScanResult(result);
        return true;
      }
    }
    return false;
  }, [onScanResult]);

  const handleManualSubmit = () => {
    setError(null);
    const ok = processDetectedText(manualText);
    if (ok) {
      setManualText('');
    } else {
      setError('Geen geldige sticker gevonden. Voer code en nummer in (bijv. NED 5 of SPC 3).');
    }
  };

  useEffect(() => {
    if (cameraActive) {
      scanInterval.current = window.setInterval(performOCR, 2000);
    }
    return () => {
      if (scanInterval.current) clearInterval(scanInterval.current);
    };
  }, [cameraActive, performOCR]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">Sticker Scanner</h2>
        </div>
        <button onClick={() => { stopCamera(); onClose(); }} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-muted" aria-label="Sluit scanner">
          <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Camera View */}
        <Card className="overflow-hidden relative bg-black">
          <div className="relative aspect-[4/3] bg-black flex items-center justify-center">
            {cameraActive ? (
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
            ) : (
              <div className="text-center p-8">
                <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" aria-hidden="true" />
                <p className="text-muted-foreground text-sm">Camera is uitgeschakeld</p>
              </div>
            )}
            {cameraActive && (
              <div className="absolute inset-0 border-4 border-primary/30 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-20 border-2 border-primary/60 rounded" />
              </div>
            )}
          </div>
          <div className="p-3 flex gap-2">
            <Button onClick={cameraActive ? stopCamera : startCamera} className="flex-1 min-h-[44px]" variant={cameraActive ? 'destructive' : 'default'}>
              {cameraActive ? 'Stop Camera' : 'Start Camera'}
            </Button>
            {cameraActive && (
              <Button onClick={performOCR} variant="outline" className="min-h-[44px] min-w-[44px]">
                <Scan className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </Card>

        {/* Manual Entry */}
        <Card className="p-4">
          <h3 className="font-bold text-foreground mb-3">Handmatig invoeren</h3>
          <div className="flex gap-2">
            <label htmlFor="manual-input" className="sr-only">Sticker code en nummer</label>
            <input
              id="manual-input"
              type="text"
              placeholder="bijv. NED 5 of SPC 3"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-base"
            />
            <Button onClick={handleManualSubmit} className="min-h-[44px] min-w-[44px]">
              <Check className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        {/* Last Result */}
        {lastResult && (
          <Card className="p-4 border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <Check className="w-6 h-6 text-green-600" aria-hidden="true" />
              <div>
                <p className="font-bold text-green-800">Sticker gevonden!</p>
                <p className="text-green-700">{lastResult.teamCode} {lastResult.number}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Tip:</p>
          <p>Typ de landcode gevolgd door het nummer, bijvoorbeeld:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>NED 5</li>
            <li>SPC 12</li>
            <li>BRA 20</li>
          </ul>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}