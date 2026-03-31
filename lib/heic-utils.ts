interface HeifImage {
  get_width: () => number;
  get_height: () => number;
  display: (imageData: ImageData, callback: (result: ImageData | null) => void) => void;
}

export const isHeicFile = (file: File): boolean => {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
};

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Try native canvas first — works in Safari 17+ which has built-in HEIC support
  try {
    return await convertHeicNative(file);
  } catch {
    // Safari not available or native HEIC not supported; fall through to libheif
  }

  // libheif-js/wasm-bundle: newer libheif build that supports modern iPhone HEIC profiles.
  // The wasm-bundle variant embeds the .wasm binary inside the JS so no extra network fetches.
  const mod = await import('libheif-js/wasm-bundle');
  const libheif = (mod.default ?? mod) as unknown as {
    HeifDecoder: new () => { decode: (data: Uint8Array) => HeifImage[] };
  };

  const arrayBuffer = await file.arrayBuffer();
  const decoder = new libheif.HeifDecoder();
  const data = decoder.decode(new Uint8Array(arrayBuffer));

  if (!data || data.length === 0) throw new Error('No images found in HEIC file');

  const image = data[0];
  const width = image.get_width();
  const height = image.get_height();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas 2D context');

  const imageData = ctx.createImageData(width, height);

  await new Promise<void>((resolve, reject) => {
    image.display(imageData, (displayData) => {
      if (!displayData) reject(new Error('HEIF processing error'));
      else resolve();
    });
  });

  ctx.putImageData(imageData, 0, 0);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Canvas toBlob returned null'));
    }, 'image/jpeg', 0.92);
  });

  const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
  return new File([blob], newName, { type: 'image/jpeg' });
};

function convertHeicNative(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error('No canvas context')); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
          resolve(new File([blob], newName, { type: 'image/jpeg' }));
        } else {
          reject(new Error('Canvas toBlob returned null'));
        }
      }, 'image/jpeg', 0.92);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Native HEIC load failed')); };
    img.src = url;
  });
}

export const normalizeImageFiles = async (files: File[]): Promise<File[]> => {
  return Promise.all(
    files.map((file) => (isHeicFile(file) ? convertHeicToJpeg(file) : Promise.resolve(file)))
  );
};
