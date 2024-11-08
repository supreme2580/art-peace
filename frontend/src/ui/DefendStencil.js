import React, { useState } from 'react';
import { devnetMode } from '../utils/Consts';

export default function DefendStencil({
  template,
  templateImage,
  canvasRef,
  width,
  height,
  colorPixel,
  _lastPlacedTime,
  basePixelUp,
  placePixelCall,
  setLastPlacedTime
}) {
  const [isDefending, setIsDefending] = useState(false);

  const defendStencil = async () => {
    if (!basePixelUp || !canvasRef?.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Ensure width and height are integers
    const canvasWidth = Math.floor(width);
    const canvasHeight = Math.floor(height);

    try {
      const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      if (!imageData) return;

      const templatePosY = Math.floor(template.position / canvasWidth);
      const templatePosX = template.position % canvasWidth;

      let pixelToPlace = null;
      let colorToPlace = null;

      for (let y = 0; y < template.height; y++) {
        for (let x = 0; x < template.width; x++) {
          const canvasX = templatePosX + x;
          const canvasY = templatePosY + y;

          // Ensure we don't go out of bounds
          if (canvasX >= canvasWidth || canvasY >= canvasHeight) continue;

          const position = canvasY * canvasWidth + canvasX;
          const idx = position * 4;

          const currentR = imageData.data[idx];
          const currentG = imageData.data[idx + 1];
          const currentB = imageData.data[idx + 2];
          const currentHex = `${currentR.toString(16).padStart(2, '0')}${currentG.toString(16).padStart(2, '0')}${currentB.toString(16).padStart(2, '0')}`;

          const templateColorId = templateImage[x + y * template.width];

          if (currentHex !== templateColorId) {
            pixelToPlace = position;
            colorToPlace = templateColorId;
            break;
          }
        }
        if (pixelToPlace !== null) break;
      }

      if (pixelToPlace !== null) {
        const timestamp = Math.floor(Date.now() / 1000);

        if (!devnetMode) {
          await placePixelCall(pixelToPlace, colorToPlace, timestamp);
        } else {
          await fetch(`place-pixel-devnet`, {
            mode: 'cors',
            method: 'POST',
            body: JSON.stringify({
              position: pixelToPlace.toString(),
              color: colorToPlace.toString(),
              timestamp: timestamp.toString()
            })
          });
        }

        colorPixel(pixelToPlace, colorToPlace);
        setLastPlacedTime(timestamp * 1000);
      }
    } catch (error) {
      console.error('Error in defendStencil:', error);
    }
  };

  React.useEffect(() => {
    if (!isDefending || !canvasRef?.current) return;

    const checkAndDefend = async () => {
      if (basePixelUp) {
        await defendStencil();
      }
    };

    const interval = setInterval(checkAndDefend, 1000);
    return () => clearInterval(interval);
  }, [isDefending, basePixelUp, canvasRef]);

  return (
    <button
      className='Button__primary Text__large'
      onClick={() => setIsDefending(!isDefending)}
    >
      {isDefending ? 'Stop Defending' : 'Defend'}
    </button>
  );
}
