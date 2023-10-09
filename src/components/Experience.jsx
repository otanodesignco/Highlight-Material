import { OrbitControls } from "@react-three/drei";
import Torus from "./Torus.jsx";

export const Experience = () => {
  return (
    <>
      <OrbitControls makeDefault />
      <ambientLight intensity={1} />
      <Torus />
    </>
  );
};
