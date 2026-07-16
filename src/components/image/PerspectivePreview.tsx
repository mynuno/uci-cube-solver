import { useEffect, useRef, useState } from "react";
import type { FacePhoto } from "../../image/types";
import { createPerspectiveCorrectedCanvas } from "../../image/perspective";

interface PerspectivePreviewProps {
  photo: FacePhoto;
}

interface PreviewError {
  key: string;
  message: string;
}

function createPreviewKey(photo: FacePhoto): string {
  return [
    photo.previewUrl,
    ...photo.corners.flatMap((point) => [point.x, point.y]),
  ].join(":");
}

export function PerspectivePreview({
  photo,
}: PerspectivePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewError, setPreviewError] =
    useState<PreviewError | null>(null);

  const hasFourCorners = photo.corners.length === 4;
  const previewKey = createPreviewKey(photo);

  useEffect(() => {
    const outputCanvas = canvasRef.current;

    if (!outputCanvas) {
      return;
    }

    const outputContext = outputCanvas.getContext("2d");

    if (!outputContext) {
      return;
    }

    outputContext.clearRect(
      0,
      0,
      outputCanvas.width,
      outputCanvas.height,
    );

    if (photo.corners.length !== 4) {
      return;
    }

    let cancelled = false;
    const image = new Image();

    image.onload = () => {
      if (cancelled) {
        return;
      }

      try {
        const correctedCanvas = createPerspectiveCorrectedCanvas(
          image,
          photo.corners,
          360,
        );

        if (cancelled) {
          return;
        }

        outputCanvas.width = correctedCanvas.width;
        outputCanvas.height = correctedCanvas.height;

        const context = outputCanvas.getContext("2d");

        if (!context) {
          throw new Error(
            "미리보기 Canvas를 생성하지 못했습니다.",
          );
        }

        context.clearRect(
          0,
          0,
          outputCanvas.width,
          outputCanvas.height,
        );

        context.drawImage(correctedCanvas, 0, 0);

        setPreviewError((currentError) =>
          currentError?.key === previewKey ? null : currentError,
        );
      } catch (caughtError) {
        console.error(
          "Perspective correction failed:",
          caughtError,
        );

        setPreviewError({
          key: previewKey,
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "원근 보정 미리보기를 만들지 못했습니다.",
        });
      }
    };

    image.onerror = () => {
      if (cancelled) {
        return;
      }

      setPreviewError({
        key: previewKey,
        message: "사진을 불러오지 못했습니다.",
      });
    };

    image.src = photo.previewUrl;

    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [photo.corners, photo.previewUrl, previewKey]);

  const currentError =
    previewError?.key === previewKey
      ? previewError.message
      : null;

  return (
    <section className="perspective-preview">
      <h3>정사각형 보정 미리보기</h3>

      <div className="perspective-preview-container">
        {!hasFourCorners && (
          <p>꼭짓점 네 개를 지정하면 결과가 표시됩니다.</p>
        )}

        <canvas
          ref={canvasRef}
          className="perspective-preview-canvas"
          hidden={!hasFourCorners || Boolean(currentError)}
          width={360}
          height={360}
        />

        {hasFourCorners && currentError && (
          <p className="perspective-preview-error">
            {currentError}
          </p>
        )}
      </div>
    </section>
  );
}