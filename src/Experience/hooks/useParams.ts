import { useMemo } from "react";

export interface Params {
  speed: number;
  cameraPos: {
    x: number;
    y: number;
    z: number;
  };
  isCameraMoving: boolean;
  lightAlpha: number;
  lightIntensity: number;
  envIntensity: number;
  envWeight: number;
  reflectIntensity: number;
  lightOpacity: number;
  floorLerpColor: number;
  carBodyEnvIntensity: number;
  cameraShakeIntensity: number;
  bloomLuminanceSmoothing: number;
  bloomIntensity: number;
  speedUpOpacity: number;
  cameraFov: number;
  furinaLerpColor: number;
  isRushing: boolean;
  disableInteract: boolean;
  isFurina: boolean;
}

export const useParams = (): Params => {
  const params = useMemo<Params>(() => {
    const paramsObject = {
      speed: 0,
      cameraPos: {
        x: 0,
        y: 0.8,
        z: -11,
      },
      isCameraMoving: false,
      lightAlpha: 0,
      lightIntensity: 0,
      envIntensity: 0,
      envWeight: 0,
      reflectIntensity: 0,
      lightOpacity: 1,
      floorLerpColor: 0,
      carBodyEnvIntensity: 1,
      cameraShakeIntensity: 0,
      bloomLuminanceSmoothing: 1.6,
      bloomIntensity: 1,
      speedUpOpacity: 0,
      cameraFov: 33.4,
      furinaLerpColor: 0,
      isRushing: false,
      disableInteract: false,
      isFurina: window.location.hash === "#furina",
    };

    // Make it globally accessible for GSAP animations
    (window as any).params = paramsObject;

    return paramsObject;
  }, []);

  return params;
};
