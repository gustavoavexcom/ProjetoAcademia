import { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Button } from './Button';
import './ui.css';

interface QrScannerProps {
  /** Chamado quando um QR code é lido. O mesmo código não dispara em sequência. */
  onScan: (texto: string) => void;
  /** Pausa a leitura (ex.: enquanto processa o check-in anterior). */
  paused?: boolean;
}

/**
 * Leitor de QR code via webcam (catraca). Lê os frames com jsQR num laço de
 * requestAnimationFrame. Funciona em notebook enquanto a catraca não tem câmera.
 */
export function QrScanner({ onScan, paused = false }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();
  const ultimoRef = useRef<{ texto: string; em: number }>({ texto: '', em: 0 });
  const pausedRef = useRef(paused);
  const [ativa, setAtiva] = useState(false);
  const [erro, setErro] = useState<string>();

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const parar = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setAtiva(false);
  }, []);

  useEffect(() => parar, [parar]);

  const ler = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && !pausedRef.current) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
        if (code?.data) {
          const agora = Date.now();
          const repetido =
            code.data === ultimoRef.current.texto && agora - ultimoRef.current.em < 3000;
          if (!repetido) {
            ultimoRef.current = { texto: code.data, em: agora };
            onScan(code.data);
          }
        }
      }
    }
    rafRef.current = requestAnimationFrame(ler);
  }, [onScan]);

  async function abrir() {
    setErro(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setAtiva(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
          rafRef.current = requestAnimationFrame(ler);
        }
      });
    } catch {
      setErro('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  }

  return (
    <div className="camera">
      {erro && <div className="alert alert--error">{erro}</div>}

      {ativa ? (
        <div className="camera__preview camera__preview--scan">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} className="camera__video" playsInline muted />
          <div className="camera__reticle" aria-hidden />
        </div>
      ) : (
        <div className="camera__placeholder">
          Câmera desligada. Abra para ler o QR code do aluno.
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="crud__actions">
        {ativa ? (
          <Button type="button" variant="ghost" size="sm" onClick={parar}>
            Desligar câmera
          </Button>
        ) : (
          <Button type="button" onClick={abrir}>
            Abrir câmera (catraca)
          </Button>
        )}
      </div>
    </div>
  );
}
