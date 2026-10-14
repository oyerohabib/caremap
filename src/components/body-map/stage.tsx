"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/** Studio lighting from procedural light cards: no HDR download, baked once. */
export function Stage() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[1.5, 3, 2.5]} intensity={0.9} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[2, 2.5, 3]} scale={[3, 3, 1]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={1.1} position={[-3, 1.5, 1]} scale={[2, 4, 1]} target={[0, 1, 0]} />
        <Lightformer form="ring" intensity={1.6} position={[0, 3, -3]} scale={2.5} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={0.5} position={[0, -1.5, 1.5]} scale={[4, 1, 1]} target={[0, 1, 0]} />
      </Environment>
      <ContactShadows
        position={[0, 0, 0]}
        frames={1}
        scale={2.2}
        blur={2.6}
        far={1.4}
        opacity={0.35}
        resolution={256}
      />
    </>
  );
}
