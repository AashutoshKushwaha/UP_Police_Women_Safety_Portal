import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = ({ onSuccess, onError }) => {
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [scanError, setScanError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!scannerRef.current) return;
    if (html5QrCodeRef.current) return; // prevent double-init

    const config = {
      fps: 10,
      qrbox: 250,
      supportedScanTypes: [Html5Qrcode.SCAN_TYPE_QR],
    };

    const html5QrCode = new Html5Qrcode(scannerRef.current.id);
    html5QrCodeRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          if (onSuccess && !cancelled) onSuccess(decodedText);
          if (html5QrCodeRef.current && isScanning) {
            html5QrCodeRef.current
              .stop()
              .then(() => setIsScanning(false))
              .catch((error) => {
                if (error && error.name !== "AbortError") {
                  // Ignore AbortError, warn on others
                  console.warn("Error stopping scanner:", error);
                }
              });
          }
        },
        () => {}
      )
      .then(() => {
        if (!cancelled) {
          setIsScanning(true);
          setScanError(null);
        }
      })
      .catch((err) => {
        setScanError(err?.message || "Unable to start the QR scanner");
        if (onError) onError(err);
      });

    return () => {
      cancelled = true;
      if (html5QrCodeRef.current && isScanning) {
        // Defensive: stop and clear, but only if defined
        html5QrCodeRef.current
          .stop()
          .then(() => setIsScanning(false))
          .catch((error) => {
            if (error && error.name !== "AbortError") {
              console.warn("Error stopping scanner on cleanup:", error);
            }
          })
          .finally(() => {
            if (html5QrCodeRef.current && typeof html5QrCodeRef.current.clear === "function") {
              try {
                // Some versions: .clear() is not async!
                const result = html5QrCodeRef.current.clear();
                if (result && typeof result.then === "function") {
                  result.catch(() => {});
                }
              } catch (e) {
                // ignore errors
              }
            }
            html5QrCodeRef.current = null;
          });
      } else if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.clear();
        } catch (e) {
          // ignore
        }
        html5QrCodeRef.current = null;
      }
    };
  // Do not restart effect unless mount/unmount
  // eslint-disable-next-line
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <div id="qr-scanner" ref={scannerRef} style={{ width: "100%" }} />
      {scanError && <p style={{ color: "red", marginTop: 10 }}>{scanError}</p>}
    </div>
  );
};

export default QRScanner;
//Aashutosh Kushwaha ,IIT KANPUR