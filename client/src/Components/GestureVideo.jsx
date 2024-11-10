import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { debounce } from "lodash";

function GestureVideo({ onGesture }) {
  const [lastDetected, setLastDetected] = useState(0);
  const videoRef = useRef(null);

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
      modelComplexity: 0, // Lower complexity for mobile optimization
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(handleResults);

    const videoElement = videoRef.current;

    // Set up camera with a lower resolution for mobile optimization
    if (videoElement) {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: 320,  // Reduced resolution
        height: 240,
      });
      camera.start();
    }

    function handleResults(results) {
      if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
          detectGesture(landmarks);
        }
      }
    }

    function detectGesture(landmarks) {
      const now = Date.now();
      if (now - lastDetected > 300) {
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
    <div style={{ display: "none" }}>
      <video ref={videoRef} style={{ display: "none" }} />
    </div>
  );
}

export default GestureVideo;
