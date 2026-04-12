import html2canvas from "html2canvas";

export async function generarCard(elementRef, formato = "1080x1080") {
  if (!elementRef) return null;

  const scale = 2;
  const canvas = await html2canvas(elementRef, {
    backgroundColor: "#0A0A0A",
    scale,
    useCORS: true,
    logging: false,
    width: formato === "story" ? 540 : 1080,
    height: formato === "story" ? 960 : 1080,
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/png");
  });
}

export function descargarCard(blob, filename = "hasta-cuando.png") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function compartirCard(blob, texto) {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], "hasta-cuando.png", { type: "image/png" });
    const shareData = { files: [file], text: texto };

    if (navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return true;
      } catch {
        // User cancelled or share failed
      }
    }
  }

  // Fallback: download
  descargarCard(blob);
  return false;
}
