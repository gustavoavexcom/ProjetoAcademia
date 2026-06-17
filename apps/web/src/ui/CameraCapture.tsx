import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './Button';
import './ui.css';

interface CameraCaptureProps {
  /** Foto atual (data URL base64), se já existir. */
  value?: string;
  /** Chamado quando o usuário confirma uma nova foto (data URL base64). */
  onCapture: (dataUrl: string) => void;
  /** Chamado ao remover a foto. */
  onClear?: () => void;
}

/**
 * Captura de foto via webcam (getUserMedia). Usado no cadastro do aluno.
 * A foto resultante (data URL base64) é a base do QR code de identificação.
 */
export function CameraCapture({ value, onCapture, onClear }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ativa, setAtiva] = useState(false);
  const [erro, setErro] = useState<string>();

  const pararCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setAtiva(false);
  }, []);

  // Garante que a câmera é liberada ao desmontar o componente.
  useEffect(() => pararCamera, [pararCamera]);

  async function abrirCamera() {
    setErro(undefined);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      setAtiva(true);
      // O elemento de vídeo só existe após o render com `ativa = true`.
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setErro('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  }

  function tirarFoto() {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(dataUrl);
    pararCamera();
  }

  return (
    <div className="camera">
      {erro && <div className="alert alert--error">{erro}</div>}

      {value && !ativa && (
        <div className="camera__preview">
          <img src={value} alt="Foto do aluno" className="camera__photo" />
        </div>
      )}

      {ativa && (
        <div className="camera__preview">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={videoRef} className="camera__video" playsInline muted />
        </div>
      )}

      {!value && !ativa && (
        <div className="camera__placeholder">Sem foto. Abra a câmera para capturar.</div>
      )}

      <div className="crud__actions">
        {!ativa && (
          <Button type="button" variant="secondary" size="sm" onClick={abrirCamera}>
            {value ? 'Tirar outra foto' : 'Abrir câmera'}
          </Button>
        )}
        {ativa && (
          <>
            <Button type="button" size="sm" onClick={tirarFoto}>
              Capturar foto
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={pararCamera}>
              Cancelar
            </Button>
          </>
        )}
        {value && !ativa && onClear && (
          <Button type="button" variant="danger" size="sm" onClick={onClear}>
            Remover foto
          </Button>
        )}
      </div>
    </div>
  );
}
