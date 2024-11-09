import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { debounce } from "lodash";


function GestureVideo({ onGesture }) {
    const [lastDetected, setLastDetected] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

// Debounced function to handle the gesture detection
const handleGesture = debounce((gesture) => {
    onGesture(gesture);
  }, 500); // 500ms delay

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(handleResults);

    const videoElement = videoRef.current;

    // Set up camera
    if (videoElement) {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    function handleResults(results) {
      if (canvasRef.current) {
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d");
        // Clear only when drawing new content
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Draw the landmarks on the canvas
        if (results.multiHandLandmarks) {
          for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, {
              color: "#00FF00",
              lineWidth: 2,
            });
            drawLandmarks(canvasCtx, landmarks, {
              color: "#FF0000",
              lineWidth: 1,
            });

            detectGesture(landmarks);
          }
        }
      }
    }

    function detectGesture(landmarks) {
      const now = Date.now();
      if (now - lastDetected > 500) {
        const thumbTip = landmarks[4];
        const indexFingerTip = landmarks[8];
    
        if (thumbTip.y < indexFingerTip.y) {
          onGesture("👍🏻");
        } else {
          onGesture(null); // Reset gesture if not detected
        }
        setLastDetected(now);
      }
    }
    

    return () => {
      hands.close();
    };
  }, [onGesture]);

  return (
    <div style={{ position: "relative", width: "640px", height: "480px", display: "none" }}>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{ position: "absolute", top: 0, left: 0, visibility: "hidden" }}
      />
    </div>
  );
}

export default GestureVideo;
