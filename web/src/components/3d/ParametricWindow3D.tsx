import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { GlassType, WindowConfig } from '../../types/window';
import { FINISH_PALETTES } from '../../utils/finishSpecifications';

interface Props {
  config: WindowConfig;
  clippingPlane?: THREE.Plane | null;
  showAnnotations?: boolean;
}

const GLASS_PALETTES: Record<GlassType, { color: string; roughness: number; transmission: number; opacity: number; ior: number }> = {
  simple_clear: { color: '#EAF5F4', roughness: 0.05, transmission: 0.92, opacity: 0.35, ior: 1.52 },
  double_clear: { color: '#DCEDEB', roughness: 0.06, transmission: 0.88, opacity: 0.45, ior: 1.52 },
  stop_sol: { color: '#253B47', roughness: 0.12, transmission: 0.52, opacity: 0.72, ior: 1.65 },
  sable: { color: '#E2E8F0', roughness: 0.78, transmission: 0.62, opacity: 0.88, ior: 1.45 },
  double_argon_warmedge: { color: '#D5EDEA', roughness: 0.05, transmission: 0.89, opacity: 0.42, ior: 1.52 },
  phonique_stadip: { color: '#CFE6EC', roughness: 0.08, transmission: 0.85, opacity: 0.50, ior: 1.53 },
  securit_tempered: { color: '#E8F2F4', roughness: 0.04, transmission: 0.94, opacity: 0.32, ior: 1.51 },
};

export const ParametricWindow3D: React.FC<Props> = ({
  config,
  clippingPlane = null,
  showAnnotations = true,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const slidingSashRef = useRef<THREE.Group>(null);
  const leftCasementRef = useRef<THREE.Group>(null);
  const rightCasementRef = useRef<THREE.Group>(null);
  const shutterCurtainRef = useRef<THREE.Group>(null);

  const w = config.width / 1000;
  const h = config.height / 1000;

  const frameDepth = 0.07;
  const frameFace = 0.055;
  const sashDepth = 0.045;
  const sashFace = 0.065;
  const glassThick = 0.016;

  const explodeZ = config.explodedView ? 0.22 : 0;
  const explodeGlassZ = config.explodedView ? 0.42 : 0;
  const explodeFrameDilation = config.explodedView ? 0.08 : 0;

  const frameMatProps = FINISH_PALETTES[config.finishColor] || FINISH_PALETTES.ral_7016;
  const glassMatProps = GLASS_PALETTES[config.glassType] || GLASS_PALETTES.double_clear;

  // Materials with local clipping support
  const frameMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: frameMatProps.color,
      roughness: frameMatProps.roughness,
      metalness: frameMatProps.metalness,
      envMapIntensity: 1.2,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [frameMatProps, clippingPlane]);

  const handleMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#D1D5DB',
      roughness: 0.2,
      metalness: 0.85,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [clippingPlane]);

  const glassMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: glassMatProps.color,
      roughness: glassMatProps.roughness,
      transmission: glassMatProps.transmission,
      thickness: glassThick,
      transparent: true,
      opacity: glassMatProps.opacity,
      ior: glassMatProps.ior,
      reflectivity: 0.9,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [glassMatProps, glassThick, clippingPlane]);

  // Polyamide RPT thermal break strip material (Matte Charcoal PA66 GF25)
  const thermalBreakMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#111317',
      roughness: 0.95,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [clippingPlane]);

  // EPDM Gasket Material (Synthetic rubber black)
  const epdmGasketMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#0A0B0E',
      roughness: 0.8,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [clippingPlane]);

  // Glazing Spacer Bar (Anodized silver warm-edge)
  const spacerMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#A0AEC0',
      roughness: 0.3,
      metalness: 0.8,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [clippingPlane]);

  useFrame((_, delta) => {
    const targetPercent = config.isOpen ? config.openPercent / 100 : 0;
    const lerpFactor = Math.min(1, delta * 7);

    if (slidingSashRef.current && (config.openingType === 'sliding_2' || config.openingType === 'sliding_3')) {
      const maxSlide = (w / 2) - 0.08;
      const targetX = -targetPercent * maxSlide;
      slidingSashRef.current.position.x = THREE.MathUtils.lerp(
        slidingSashRef.current.position.x,
        targetX,
        lerpFactor
      );
    }

    if (leftCasementRef.current && (config.openingType === 'casement_1' || config.openingType === 'casement_2')) {
      const targetAngle = -targetPercent * (Math.PI / 2.3);
      leftCasementRef.current.rotation.y = THREE.MathUtils.lerp(
        leftCasementRef.current.rotation.y,
        targetAngle,
        lerpFactor
      );
    }

    if (rightCasementRef.current && config.openingType === 'casement_2') {
      const targetAngle = targetPercent * (Math.PI / 2.3);
      rightCasementRef.current.rotation.y = THREE.MathUtils.lerp(
        rightCasementRef.current.rotation.y,
        targetAngle,
        lerpFactor
      );
    }

    if (leftCasementRef.current && config.openingType === 'tilt_turn') {
      const targetTilt = -targetPercent * 0.25;
      leftCasementRef.current.rotation.x = THREE.MathUtils.lerp(
        leftCasementRef.current.rotation.x,
        targetTilt,
        lerpFactor
      );
    }

    if (shutterCurtainRef.current && config.shutterType !== 'none') {
      const targetCurtain = (config.shutterPosition ?? (config.isOpen ? 0 : 45)) / 100;
      shutterCurtainRef.current.scale.y = THREE.MathUtils.lerp(
        shutterCurtainRef.current.scale.y,
        Math.max(0.001, targetCurtain),
        lerpFactor
      );
    }
  });

  const innerW = Math.max(0.1, w - 2 * frameFace);
  const innerH = Math.max(0.1, h - 2 * frameFace);

  return (
    <group ref={rootGroupRef} position={[0, 0, 0]}>
      {/* 1. OUTER FRAME (DORMANT AVEC RPT & JOINTS) */}
      <group position={[0, 0, 0]}>
        {/* Top Dormant */}
        <mesh position={[0, -h / 2 + frameFace / 2 - explodeFrameDilation, 0]} material={frameMaterial} castShadow receiveShadow>
          <boxGeometry args={[w + explodeFrameDilation * 2, frameFace, frameDepth]} />
        </mesh>
        {/* Bottom Dormant */}
        <mesh position={[0, h / 2 - frameFace / 2 + explodeFrameDilation, 0]} material={frameMaterial} castShadow receiveShadow>
          <boxGeometry args={[w + explodeFrameDilation * 2, frameFace, frameDepth]} />
        </mesh>
        {/* Left Jamb */}
        <mesh position={[-w / 2 + frameFace / 2 - explodeFrameDilation, 0, 0]} material={frameMaterial} castShadow receiveShadow>
          <boxGeometry args={[frameFace, innerH, frameDepth]} />
        </mesh>
        {/* Right Jamb */}
        <mesh position={[w / 2 - frameFace / 2 + explodeFrameDilation, 0, 0]} material={frameMaterial} castShadow receiveShadow>
          <boxGeometry args={[frameFace, innerH, frameDepth]} />
        </mesh>

        {/* Polyamide Thermal Break Bars (Embedded inside outer frame extrusions) */}
        <mesh position={[0, -h / 2 + frameFace / 2 - explodeFrameDilation, 0]} material={thermalBreakMaterial}>
          <boxGeometry args={[w - 0.02, 0.016, 0.024]} />
        </mesh>
        <mesh position={[0, h / 2 - frameFace / 2 + explodeFrameDilation, 0]} material={thermalBreakMaterial}>
          <boxGeometry args={[w - 0.02, 0.016, 0.024]} />
        </mesh>
        <mesh position={[-w / 2 + frameFace / 2 - explodeFrameDilation, 0, 0]} material={thermalBreakMaterial}>
          <boxGeometry args={[0.016, innerH, 0.024]} />
        </mesh>
        <mesh position={[w / 2 - frameFace / 2 + explodeFrameDilation, 0, 0]} material={thermalBreakMaterial}>
          <boxGeometry args={[0.016, innerH, 0.024]} />
        </mesh>

        {/* Central EPDM Weatherstripping Gasket Ring */}
        <mesh position={[0, -h / 2 + frameFace - 0.002, 0.008]} material={epdmGasketMaterial}>
          <boxGeometry args={[innerW, 0.004, 0.008]} />
        </mesh>
        <mesh position={[0, h / 2 - frameFace + 0.002, 0.008]} material={epdmGasketMaterial}>
          <boxGeometry args={[innerW, 0.004, 0.008]} />
        </mesh>
        <mesh position={[-w / 2 + frameFace - 0.002, 0, 0.008]} material={epdmGasketMaterial}>
          <boxGeometry args={[0.004, innerH, 0.008]} />
        </mesh>
        <mesh position={[w / 2 - frameFace + 0.002, 0, 0.008]} material={epdmGasketMaterial}>
          <boxGeometry args={[0.004, innerH, 0.008]} />
        </mesh>
      </group>

      {/* 2. ROLLER SHUTTER BOX & SLAT CURTAIN */}
      {config.shutterType !== 'none' && (
        <group position={[0, h / 2 + 0.12 + explodeFrameDilation, 0.02]}>
          {/* Main Caisson Box */}
          <mesh material={frameMaterial} castShadow>
            <boxGeometry args={[w + 0.04, 0.24, frameDepth + 0.08]} />
          </mesh>
          <mesh position={[0, -0.05, (frameDepth + 0.08) / 2 + 0.002]}>
            <planeGeometry args={[w + 0.02, 0.004]} />
            <meshBasicMaterial color="#111827" side={THREE.DoubleSide} />
          </mesh>

          {/* Vertical Guides Running Down the Jambs */}
          <mesh position={[-w / 2 + 0.015, -h / 2 - 0.12, 0.01]} material={frameMaterial}>
            <boxGeometry args={[0.03, h, 0.025]} />
          </mesh>
          <mesh position={[w / 2 - 0.015, -h / 2 - 0.12, 0.01]} material={frameMaterial}>
            <boxGeometry args={[0.03, h, 0.025]} />
          </mesh>

          {/* Slat Curtain Rolling Downwards */}
          <group
            ref={shutterCurtainRef}
            position={[0, -0.12, (frameDepth + 0.08) / 2 - 0.02]}
            scale={[1, Math.max(0.001, (config.shutterPosition ?? (config.isOpen ? 0 : 45)) / 100), 1]}
          >
            {/* Slat Face Mesh */}
            <mesh position={[0, -innerH / 2, 0]} material={frameMaterial} castShadow>
              <boxGeometry args={[innerW + 0.02, innerH, 0.012]} />
            </mesh>
            {/* Bottom Heavy Extrusion Slat with Rubber Gasket */}
            <mesh position={[0, -innerH + 0.025, 0.002]} material={frameMaterial}>
              <boxGeometry args={[innerW + 0.025, 0.05, 0.018]} />
            </mesh>
            <mesh position={[0, -innerH - 0.005, 0.002]}>
              <boxGeometry args={[innerW + 0.025, 0.01, 0.012]} />
              <meshBasicMaterial color="#0A0A0A" side={THREE.DoubleSide} />
            </mesh>
          </group>
        </group>
      )}

      {/* 3. SASHES & GLASS (OUVRANTS AVEC VITRAGE ET INTERCALAIRE) */}
      {config.openingType === 'sliding_2' && (() => {
        const sashW = (innerW / 2) + 0.025;
        const sashH = innerH - 0.01;
        const glassW = Math.max(0.05, sashW - 2 * sashFace);
        const glassH = Math.max(0.05, sashH - 2 * sashFace);

        return (
          <>
            <group position={[-innerW / 4, 0, -sashDepth / 2 + explodeZ]}>
              <SashProfileRect
                width={sashW}
                height={sashH}
                depth={sashDepth}
                face={sashFace}
                material={frameMaterial}
                thermalBreakMaterial={thermalBreakMaterial}
                epdmMaterial={epdmGasketMaterial}
              />
              <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial} castShadow>
                <boxGeometry args={[glassW, glassH, glassThick]} />
              </mesh>
              {/* Spacer bar visible in cross-section */}
              <mesh position={[0, 0, explodeGlassZ]} material={spacerMaterial}>
                <boxGeometry args={[glassW - 0.01, glassH - 0.01, 0.012]} />
              </mesh>
            </group>
            <group ref={slidingSashRef} position={[innerW / 4, 0, sashDepth / 2 + explodeZ]}>
              <SashProfileRect
                width={sashW}
                height={sashH}
                depth={sashDepth}
                face={sashFace}
                material={frameMaterial}
                thermalBreakMaterial={thermalBreakMaterial}
                epdmMaterial={epdmGasketMaterial}
              />
              <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial} castShadow>
                <boxGeometry args={[glassW, glassH, glassThick]} />
              </mesh>
              <mesh position={[0, 0, explodeGlassZ]} material={spacerMaterial}>
                <boxGeometry args={[glassW - 0.01, glassH - 0.01, 0.012]} />
              </mesh>
              <WindowHandle position={[-sashW / 2 + 0.025, 0, sashDepth / 2 + 0.015]} material={handleMaterial} />
            </group>
          </>
        );
      })()}

      {config.openingType === 'sliding_3' && (() => {
        const sashW = (innerW / 3) + 0.03;
        const sashH = innerH - 0.01;
        const glassW = Math.max(0.05, sashW - 2 * sashFace);
        const glassH = Math.max(0.05, sashH - 2 * sashFace);

        return (
          <>
            <group position={[-innerW / 3, 0, -sashDepth + explodeZ]}>
              <SashProfileRect width={sashW} height={sashH} depth={sashDepth} face={sashFace} material={frameMaterial} thermalBreakMaterial={thermalBreakMaterial} epdmMaterial={epdmGasketMaterial} />
              <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                <boxGeometry args={[glassW, glassH, glassThick]} />
              </mesh>
            </group>
            <group position={[0, 0, explodeZ]}>
              <SashProfileRect width={sashW} height={sashH} depth={sashDepth} face={sashFace} material={frameMaterial} thermalBreakMaterial={thermalBreakMaterial} epdmMaterial={epdmGasketMaterial} />
              <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                <boxGeometry args={[glassW, glassH, glassThick]} />
              </mesh>
            </group>
            <group ref={slidingSashRef} position={[innerW / 3, 0, sashDepth + explodeZ]}>
              <SashProfileRect width={sashW} height={sashH} depth={sashDepth} face={sashFace} material={frameMaterial} thermalBreakMaterial={thermalBreakMaterial} epdmMaterial={epdmGasketMaterial} />
              <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                <boxGeometry args={[glassW, glassH, glassThick]} />
              </mesh>
              <WindowHandle position={[-sashW / 2 + 0.025, 0, sashDepth / 2 + 0.015]} material={handleMaterial} />
            </group>
          </>
        );
      })()}

      {(config.openingType === 'casement_1' || config.openingType === 'tilt_turn') && (() => {
        const sashW = innerW - 0.01;
        const sashH = innerH - 0.01;
        const glassW = Math.max(0.05, sashW - 2 * sashFace);
        const glassH = Math.max(0.05, sashH - 2 * sashFace);

        return (
          <group ref={leftCasementRef} position={[-innerW / 2, 0, explodeZ]}>
            <group position={[sashW / 2, 0, 0]}>
              <SashProfileRect width={sashW} height={sashH} depth={sashDepth} face={sashFace} material={frameMaterial} thermalBreakMaterial={thermalBreakMaterial} epdmMaterial={epdmGasketMaterial} />
              <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial} castShadow>
                <boxGeometry args={[glassW, glassH, glassThick]} />
              </mesh>
              <WindowHandle position={[sashW / 2 - 0.03, 0, sashDepth / 2 + 0.015]} material={handleMaterial} />
            </group>
          </group>
        );
      })()}

      {config.openingType === 'casement_2' && (() => {
        const sashW = (innerW / 2) - 0.01;
        const sashH = innerH - 0.01;
        const glassW = Math.max(0.05, sashW - 2 * sashFace);
        const glassH = Math.max(0.05, sashH - 2 * sashFace);

        return (
          <>
            <group ref={leftCasementRef} position={[-innerW / 2, 0, explodeZ]}>
              <group position={[sashW / 2, 0, 0]}>
                <SashProfileRect width={sashW} height={sashH} depth={sashDepth} face={sashFace} material={frameMaterial} thermalBreakMaterial={thermalBreakMaterial} epdmMaterial={epdmGasketMaterial} />
                <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                  <boxGeometry args={[glassW, glassH, glassThick]} />
                </mesh>
              </group>
            </group>
            <group ref={rightCasementRef} position={[innerW / 2, 0, explodeZ]}>
              <group position={[-sashW / 2, 0, 0]}>
                <SashProfileRect width={sashW} height={sashH} depth={sashDepth} face={sashFace} material={frameMaterial} thermalBreakMaterial={thermalBreakMaterial} epdmMaterial={epdmGasketMaterial} />
                <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                  <boxGeometry args={[glassW, glassH, glassThick]} />
                </mesh>
                <WindowHandle position={[-sashW / 2 + 0.025, 0, sashDepth / 2 + 0.015]} material={handleMaterial} />
              </group>
            </group>
          </>
        );
      })()}

      {config.openingType === 'fixed' && (() => {
        const glassW = innerW;
        const glassH = innerH;

        return (
          <group position={[0, 0, explodeGlassZ]}>
            <mesh material={glassMaterial} castShadow>
              <boxGeometry args={[glassW, glassH, glassThick]} />
            </mesh>
            <group position={[0, 0, glassThick / 2 + 0.005]}>
              <mesh position={[0, -glassH / 2 + 0.01, 0]} material={frameMaterial}>
                <boxGeometry args={[glassW, 0.02, 0.015]} />
              </mesh>
              <mesh position={[0, glassH / 2 - 0.01, 0]} material={frameMaterial}>
                <boxGeometry args={[glassW, 0.02, 0.015]} />
              </mesh>
              <mesh position={[-glassW / 2 + 0.01, 0, 0]} material={frameMaterial}>
                <boxGeometry args={[0.02, glassH, 0.015]} />
              </mesh>
              <mesh position={[glassW / 2 - 0.01, 0, 0]} material={frameMaterial}>
                <boxGeometry args={[0.02, glassH, 0.015]} />
              </mesh>
            </group>
          </group>
        );
      })()}

      {/* 4. RULERS & DIMENSION LINES */}
      <group position={[0, -h / 2 - 0.09, 0]}>
        <mesh>
          <boxGeometry args={[w, 0.003, 0.003]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
        <mesh position={[-w / 2, 0.01, 0]}>
          <boxGeometry args={[0.003, 0.025, 0.003]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
        <mesh position={[w / 2, 0.01, 0]}>
          <boxGeometry args={[0.003, 0.025, 0.003]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
      </group>

      <group position={[-w / 2 - 0.09, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.003, h, 0.003]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
        <mesh position={[0.01, -h / 2, 0]}>
          <boxGeometry args={[0.025, 0.003, 0.003]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
        <mesh position={[0.01, h / 2, 0]}>
          <boxGeometry args={[0.025, 0.003, 0.003]} />
          <meshBasicMaterial color="#D4AF37" />
        </mesh>
      </group>

      {/* 5. 3D HOLOGRAPHIC ANNOTATIONS WHEN CLIPPING ACTIVE */}
      {clippingPlane && showAnnotations && (
        <group position={[0, 0, 0.08]}>
          <Html position={[0, h * 0.28, 0]} center distanceFactor={4}>
            <div className="px-2 py-0.5 rounded bg-black/80 border border-cyan-400/60 text-cyan-300 text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none">
              Barrette Polyamide PA66 GF25
            </div>
          </Html>
          <Html position={[0, 0, 0.04]} center distanceFactor={4}>
            <div className="px-2 py-0.5 rounded bg-black/80 border border-[#D4AF37]/60 text-[#D4AF37] text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none">
              Double Vitrage 4/16/4
            </div>
          </Html>
          <Html position={[0, -h * 0.28, 0]} center distanceFactor={4}>
            <div className="px-2 py-0.5 rounded bg-black/80 border border-emerald-400/60 text-emerald-300 text-[10px] font-mono whitespace-nowrap shadow-md pointer-events-none">
              Joint Central EPDM
            </div>
          </Html>
        </group>
      )}
    </group>
  );
};

interface SashRectProps {
  width: number;
  height: number;
  depth: number;
  face: number;
  material: THREE.Material;
  thermalBreakMaterial?: THREE.Material;
  epdmMaterial?: THREE.Material;
}

const SashProfileRect: React.FC<SashRectProps> = ({
  width,
  height,
  depth,
  face,
  material,
  thermalBreakMaterial,
  epdmMaterial,
}) => {
  return (
    <group>
      <mesh position={[0, height / 2 - face / 2, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={[width, face, depth]} />
      </mesh>
      <mesh position={[0, -height / 2 + face / 2, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={[width, face, depth]} />
      </mesh>
      <mesh position={[-width / 2 + face / 2, 0, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={[face, height - 2 * face, depth]} />
      </mesh>
      <mesh position={[width / 2 - face / 2, 0, 0]} material={material} castShadow receiveShadow>
        <boxGeometry args={[face, height - 2 * face, depth]} />
      </mesh>

      {/* Embedded Polyamide Thermal Break in Sash */}
      {thermalBreakMaterial && (
        <>
          <mesh position={[0, height / 2 - face / 2, 0]} material={thermalBreakMaterial}>
            <boxGeometry args={[width - 0.02, 0.012, 0.016]} />
          </mesh>
          <mesh position={[0, -height / 2 + face / 2, 0]} material={thermalBreakMaterial}>
            <boxGeometry args={[width - 0.02, 0.012, 0.016]} />
          </mesh>
          <mesh position={[-width / 2 + face / 2, 0, 0]} material={thermalBreakMaterial}>
            <boxGeometry args={[0.012, height - 2 * face, 0.016]} />
          </mesh>
          <mesh position={[width / 2 - face / 2, 0, 0]} material={thermalBreakMaterial}>
            <boxGeometry args={[0.012, height - 2 * face, 0.016]} />
          </mesh>
        </>
      )}

      {/* Internal Glazing Bead & Gasket Lip */}
      {epdmMaterial && (
        <mesh position={[0, 0, depth / 2 - 0.004]} material={epdmMaterial}>
          <boxGeometry args={[width - 2 * face + 0.01, height - 2 * face + 0.01, 0.003]} />
        </mesh>
      )}
    </group>
  );
};

interface HandleProps {
  position: [number, number, number];
  material: THREE.Material;
}

const WindowHandle: React.FC<HandleProps> = ({ position, material }) => {
  return (
    <group position={position}>
      <mesh material={material} castShadow>
        <boxGeometry args={[0.025, 0.12, 0.008]} />
      </mesh>
      <mesh position={[0, 0, 0.02]} material={material} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.035, 12]} />
      </mesh>
      <mesh position={[0, -0.05, 0.035]} rotation={[0, 0, 0]} material={material} castShadow>
        <boxGeometry args={[0.016, 0.11, 0.014]} />
      </mesh>
    </group>
  );
};
