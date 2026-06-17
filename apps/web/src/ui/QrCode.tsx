import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeProps {
  /** Conteúdo codificado (token do aluno). */
  value: string;
  /** Lado do QR em pixels. */
  size?: number;
  alt?: string;
}

/** Renderiza um QR code como imagem a partir de um texto. */
export function QrCode({ value, size = 160, alt = 'QR code' }: QrCodeProps) {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (ativo) setSrc(url);
      })
      .catch(() => {
        if (ativo) setSrc(undefined);
      });
    return () => {
      ativo = false;
    };
  }, [value, size]);

  if (!src) return null;
  return <img src={src} width={size} height={size} alt={alt} className="qr-code__img" />;
}
