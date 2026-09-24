import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';
import { useConfigStore } from '../../store/configStore';
import type { FinishColor } from '../../types/window';
import type { TradeCategory } from '../../types/trades';
import { FINISH_PALETTES } from '../../utils/finishSpecifications';

export type WindowModelType = 'sliding' | 'tilt_and_turn' | 'french_casement' | 'curtain_wall';

interface Hero3DWorkpieceProps {
  trade: TradeCategory;
  finishColor: FinishColor;
  scrollProgress: number; // 0.0 to 1.0
  isExploded?: boolean;
  isOpen?: boolean;
  windowModel?: WindowModelType;
  clippingPlane?: THREE.Plane | null;
  isLight?: boolean;
}

export const Hero3DWorkpiece: React.FC<Hero3DWorkpieceProps> = ({
  trade,
  finishColor,
  scrollProgress,
  isExploded = false,
  isOpen = false,
  windowModel = 'sliding',
  clippingPlane = null,
  isLight,
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const leftSashRef = useRef<THREE.Group>(null);
  const rightSashRef = useRef<THREE.Group>(null);
  const leftDoorRef = useRef<THREE.Group>(null);
  const rightDoorRef = useRef<THREE.Group>(null);

  const { theme } = useConfigStore();
  const isLightMode = isLight !== undefined ? isLight : theme === 'light';

  const palette = FINISH_PALETTES[finishColor] || FINISH_PALETTES.ral_7016;

  // Architectural CAD Vector drafting line colors
  const cadEdgeColor = useMemo(() => {
    return isLightMode ? '#334155' : '#D4AF37';
  }, [isLightMode]);

  const cadAccentEdgeColor = useMemo(() => {
    return isLightMode ? '#0284C7' : '#38BDF8';
  }, [isLightMode]);

  const glassCadEdgeColor = useMemo(() => {
    return isLightMode ? '#0EA5E9' : '#38BDF8';
  }, [isLightMode]);

  const thermalBreakEdgeColor = useMemo(() => {
    return isLightMode ? '#0F172A' : '#F59E0B';
  }, [isLightMode]);

  // Materials with clipping support & architectural clearcoat
  const frameMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: palette.color,
      roughness: palette.roughness,
      metalness: palette.metalness,
      clearcoat: 0.35,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [palette, clippingPlane]);

  // Monobloc roller shutter caisson (dynamic: Deep Sleek Black in dark mode, Pure Architectural White in light mode)
  const shutterMaterial = useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: isLightMode ? '#FFFFFF' : '#0B0F19',
      roughness: isLightMode ? 0.25 : 0.45,
      metalness: isLightMode ? 0.08 : 0.65,
      clearcoat: 0.3,
      clearcoatRoughness: 0.15,
      envMapIntensity: isLightMode ? 1.2 : 1.6,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [isLightMode, clippingPlane]);

  const hardwareSteelMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#94A3B8',
      roughness: 0.25,
      metalness: 0.85,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [clippingPlane]);

  const goldAccentMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#D4AF37',
      roughness: 0.22,
      metalness: 0.88,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [clippingPlane]);

  const thermalBreakMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: '#0B0F19',
      roughness: 0.9,
      metalness: 0.05,
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
      color: '#DCEDEB',
      roughness: 0.04,
      transmission: 0.92,
      thickness: 0.03,
      transparent: true,
      opacity: 0.58,
      ior: 1.52,
      reflectivity: 0.88,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [clippingPlane]);

  const woodMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: finishColor === 'faux_bois' ? '#784622' : finishColor === 'ral_9016' ? '#E2E8F0' : '#2D241E',
      roughness: 0.65,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    if (clippingPlane) {
      mat.clippingPlanes = [clippingPlane];
      mat.clipShadows = true;
    }
    return mat;
  }, [finishColor, clippingPlane]);

  // Interpolation calculations based on scrollProgress
  // Stage 1 (0.00 to 0.30): Genesis overview & entrance scale 0.92 -> 1.0
  // Stage 2 (0.30 to 0.68): Technical reveal & macro scale zoom 1.0 -> 1.28
  // Stage 3 (0.68 to 1.00): Exploded isometric view settling to 1.05
  const openProgress = Math.min(1, Math.max(0, (scrollProgress - 0.30) / 0.32));
  const effectiveOpen = isOpen ? 1 : openProgress;
  const explodeFactor = isExploded ? 1 : Math.min(1, Math.max(0, (scrollProgress - 0.60) / 0.30));

  const explodeZ = explodeFactor * 0.32;
  const explodeGlassZ = explodeFactor * 0.58;
  const explodeDilation = explodeFactor * 0.1;

  useFrame((state, delta) => {
    if (!rootRef.current) return;

    // Dynamic Scale & Orientation calculation
    let targetScale = 1.0;
    let targetRotY = 0;
    let targetRotX = 0.04;

    if (scrollProgress < 0.30) {
      // Stage 1: Subtle breathing & smooth genesis scaling 0.92 to 1.0
      targetScale = THREE.MathUtils.lerp(0.92, 1.0, scrollProgress / 0.30);
      const breathing = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
      targetRotY = breathing;
      targetRotX = 0.04;
    } else if (scrollProgress >= 0.30 && scrollProgress < 0.68) {
      // Stage 2: Technical zoom into profile miter & thermal break (Dynamic Scale 1.28x)
      const t = (scrollProgress - 0.30) / 0.38;
      targetScale = THREE.MathUtils.lerp(1.0, 1.28, t);
      targetRotY = THREE.MathUtils.lerp(0, 0.44, t);
      targetRotX = THREE.MathUtils.lerp(0.04, 0.12, t);
    } else {
      // Stage 3: Exploded overview settling to 1.05x with part separation
      const t = (scrollProgress - 0.68) / 0.32;
      targetScale = THREE.MathUtils.lerp(1.28, 1.05, t);
      targetRotY = THREE.MathUtils.lerp(0.44, 0.22, t);
      targetRotX = THREE.MathUtils.lerp(0.12, 0.06, t);
    }

    // Smooth lerp for scale
    const currentScale = rootRef.current.scale.x || 1.0;
    const smoothScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 4);
    rootRef.current.scale.set(smoothScale, smoothScale, smoothScale);

    // Smooth lerp for rotation
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetRotY, delta * 4);
    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetRotX, delta * 4);

    // Aluminum kinematics based on window model
    if (trade === 'aluminum') {
      if (windowModel === 'sliding') {
        if (leftSashRef.current) {
          leftSashRef.current.position.x = -effectiveOpen * 0.44;
          leftSashRef.current.rotation.y = 0;
          leftSashRef.current.rotation.x = 0;
        }
        if (rightSashRef.current) {
          rightSashRef.current.rotation.y = 0;
        }
      } else if (windowModel === 'tilt_and_turn') {
        if (leftSashRef.current) {
          leftSashRef.current.position.x = 0;
          // German Oscillo-Battant tilt inwards from top pivot (hinged at bottom)
          leftSashRef.current.rotation.x = -effectiveOpen * 0.24;
          leftSashRef.current.rotation.y = 0;
        }
      } else if (windowModel === 'french_casement') {
        if (leftSashRef.current) {
          leftSashRef.current.position.x = 0;
          leftSashRef.current.rotation.x = 0;
          // Swings open on left hinge
          leftSashRef.current.rotation.y = effectiveOpen * (Math.PI / 2.3);
        }
        if (rightSashRef.current) {
          // Swings open on right hinge
          rightSashRef.current.rotation.y = -effectiveOpen * (Math.PI / 2.3);
        }
      }
    }

    // Wood cabinet door swing
    if (leftDoorRef.current) {
      leftDoorRef.current.rotation.y = -effectiveOpen * (Math.PI / 2.2);
    }
    if (rightDoorRef.current) {
      rightDoorRef.current.rotation.y = effectiveOpen * (Math.PI / 2.2);
    }
  });

  return (
    <group ref={rootRef} position={[0, 0, 0]}>
      {/* ============================================================ */}
      {/* TRADE 1: MENUISERIE ALUMINIUM & PVC RPT (MODÈLES MULTIPLES)   */}
      {/* ============================================================ */}
      {trade === 'aluminum' && (
        <group>
          {/* Top Roller Shutter Caisson Monobloc (clean elevation to eliminate contact z-fighting) */}
          <mesh
            position={[0, 0.865 + explodeDilation, 0]}
            material={shutterMaterial}
          >
            <boxGeometry args={[1.44 + explodeDilation * 2, 0.19, 0.12]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>

          {/* Outer Frame (Dormant Bi-Rail 45/52 RPT avec profondeur 110mm) */}
          <group position={[0, 0, 0]}>
            {/* Top Dormant Track */}
            <mesh position={[0, 0.72 + explodeDilation, 0]} material={frameMaterial}>
              <boxGeometry args={[1.44 + explodeDilation * 2, 0.08, 0.11]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
            {/* Bottom Dormant Track */}
            <mesh position={[0, -0.72 - explodeDilation, 0]} material={frameMaterial}>
              <boxGeometry args={[1.44 + explodeDilation * 2, 0.08, 0.11]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
            {/* Left Upright Jamb */}
            <mesh position={[-0.68 - explodeDilation, 0, 0]} material={frameMaterial}>
              <boxGeometry args={[0.08, 1.36, 0.11]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
            {/* Right Upright Jamb */}
            <mesh position={[0.68 + explodeDilation, 0, 0]} material={frameMaterial}>
              <boxGeometry args={[0.08, 1.36, 0.11]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>

            {/* Polyamide Thermal Break Bars (clearance-isolated during technical clipping) */}
            {(clippingPlane || isExploded) && (
              <>
                <mesh position={[0, 0.72 + explodeDilation, 0]} material={thermalBreakMaterial} renderOrder={2}>
                  <boxGeometry args={[1.4, 0.02, 0.025]} />
                  <Edges threshold={15} color={thermalBreakEdgeColor} />
                </mesh>
                <mesh position={[0, -0.72 - explodeDilation, 0]} material={thermalBreakMaterial} renderOrder={2}>
                  <boxGeometry args={[1.4, 0.02, 0.025]} />
                  <Edges threshold={15} color={thermalBreakEdgeColor} />
                </mesh>
              </>
            )}
          </group>

          {/* ========================================================================= */}
          {/* WINDOW MODEL: SLIDING (COULISSANT 2 VANTAUX AVEC RAILS SÉPARÉS SANS Z-FIGHT) */}
          {/* ========================================================================= */}
          {windowModel === 'sliding' && (
            <>
              {/* Left Movable Sash (Front Track: Z = +0.034, bounds: [+0.012, +0.056]) */}
              <group ref={leftSashRef} position={[-0.32, 0, 0.034 + explodeZ]}>
                <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.72, 0.075, 0.044]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.72, 0.075, 0.044]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                <mesh position={[-0.32, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.075, 1.18, 0.044]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                {/* Meeting Stile (Chicane avant) */}
                <mesh position={[0.32, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.07, 1.18, 0.044]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                {/* Interlocking Labyrinth Weatherstrip Hook */}
                <mesh position={[0.35, 0, -0.012]} material={hardwareSteelMaterial}>
                  <boxGeometry args={[0.012, 1.18, 0.014]} />
                  <Edges threshold={15} color={cadEdgeColor} />
                </mesh>
                {/* Double Glazing Panel */}
                <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                  <boxGeometry args={[0.58, 1.18, 0.018]} />
                  <Edges threshold={15} color={glassCadEdgeColor} />
                </mesh>
                {/* Modern Cremone Grip */}
                <mesh position={[0.26, 0, 0.032]} material={goldAccentMaterial}>
                  <boxGeometry args={[0.026, 0.16, 0.022]} />
                  <Edges threshold={15} color="#F59E0B" />
                </mesh>
              </group>

              {/* Right Fixed Sash (Rear Track: Z = -0.034, bounds: [-0.056, -0.012]) */}
              <group position={[0.32, 0, -0.034 + explodeZ]}>
                <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.72, 0.075, 0.044]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.72, 0.075, 0.044]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                {/* Meeting Stile (Chicane arrière) */}
                <mesh position={[-0.32, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.07, 1.18, 0.044]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                {/* Interlocking Counter Labyrinth Hook */}
                <mesh position={[-0.35, 0, 0.012]} material={hardwareSteelMaterial}>
                  <boxGeometry args={[0.012, 1.18, 0.014]} />
                  <Edges threshold={15} color={cadEdgeColor} />
                </mesh>
                <mesh position={[0.32, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.075, 1.18, 0.044]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                {/* Double Glazing Panel */}
                <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                  <boxGeometry args={[0.58, 1.18, 0.018]} />
                  <Edges threshold={15} color={glassCadEdgeColor} />
                </mesh>
              </group>
            </>
          )}

          {/* ==================================================== */}
          {/* WINDOW MODEL: OSCILLO-BATTANT (GERMAN TILT & TURN)   */}
          {/* ==================================================== */}
          {windowModel === 'tilt_and_turn' && (
            <group position={[0, 0, 0.02 + explodeZ]}>
              {/* Central Mullion / Fixed Partition Divider */}
              <mesh position={[0, 0, 0]} material={frameMaterial}>
                <boxGeometry args={[0.07, 1.36, 0.08]} />
                <Edges threshold={15} color={cadEdgeColor} />
              </mesh>

              {/* Left Tilt-and-Turn Sash (Pivoting from bottom) */}
              <group position={[-0.35, -0.63, 0]}>
                <group ref={leftSashRef}>
                  <group position={[0, 0.63, 0]}>
                    <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[-0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                      <boxGeometry args={[0.5, 1.18, 0.02]} />
                      <Edges threshold={15} color={glassCadEdgeColor} />
                    </mesh>
                    {/* Modern Ergonomic German Handle */}
                    <mesh position={[0.23, 0, 0.05]} material={goldAccentMaterial}>
                      <boxGeometry args={[0.025, 0.15, 0.03]} />
                      <Edges threshold={15} color="#F59E0B" />
                    </mesh>
                    {/* Top Scissor Arm Hardware */}
                    <mesh position={[0.1, 0.65, -0.015]} rotation={[0, 0, 0.3]} material={hardwareSteelMaterial}>
                      <boxGeometry args={[0.3, 0.012, 0.012]} />
                    </mesh>
                  </group>
                </group>
              </group>

              {/* Right Fixed / Casement Sash */}
              <group position={[0.35, 0, 0]}>
                <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.64, 0.075, 0.065]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.64, 0.075, 0.065]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                <mesh position={[-0.28, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.075, 1.18, 0.065]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                <mesh position={[0.28, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.075, 1.18, 0.065]} />
                  <Edges threshold={15} color={cadAccentEdgeColor} />
                </mesh>
                <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                  <boxGeometry args={[0.5, 1.18, 0.02]} />
                  <Edges threshold={15} color={glassCadEdgeColor} />
                </mesh>
              </group>
            </group>
          )}

          {/* ==================================================== */}
          {/* WINDOW MODEL: BATTANT FRANÇAIS (DOUBLE CASEMENT)    */}
          {/* ==================================================== */}
          {windowModel === 'french_casement' && (
            <group position={[0, 0, 0.02 + explodeZ]}>
              {/* Left French Sash (Hinged at left border) */}
              <group position={[-0.64, 0, 0]}>
                <group ref={leftSashRef}>
                  <group position={[0.32, 0, 0]}>
                    <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[-0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                      <boxGeometry args={[0.5, 1.18, 0.02]} />
                      <Edges threshold={15} color={glassCadEdgeColor} />
                    </mesh>
                    {/* Espagnolette Cremone Handle */}
                    <mesh position={[0.26, 0, 0.05]} material={goldAccentMaterial}>
                      <boxGeometry args={[0.025, 0.16, 0.03]} />
                      <Edges threshold={15} color="#F59E0B" />
                    </mesh>
                    {/* Stainless Steel Hinges */}
                    <mesh position={[-0.31, 0.45, -0.02]} material={hardwareSteelMaterial}>
                      <cylinderGeometry args={[0.012, 0.012, 0.08, 16]} />
                    </mesh>
                    <mesh position={[-0.31, -0.45, -0.02]} material={hardwareSteelMaterial}>
                      <cylinderGeometry args={[0.012, 0.012, 0.08, 16]} />
                    </mesh>
                  </group>
                </group>
              </group>

              {/* Right French Sash (Hinged at right border) */}
              <group position={[0.64, 0, 0]}>
                <group ref={rightSashRef}>
                  <group position={[-0.32, 0, 0]}>
                    <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[-0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                      <boxGeometry args={[0.5, 1.18, 0.02]} />
                      <Edges threshold={15} color={glassCadEdgeColor} />
                    </mesh>
                    {/* Central Overlap Beating Strip (Batteuse) */}
                    <mesh position={[-0.31, 0, 0.025]} material={frameMaterial}>
                      <boxGeometry args={[0.03, 1.22, 0.02]} />
                      <Edges threshold={15} color={cadAccentEdgeColor} />
                    </mesh>
                    {/* Stainless Steel Hinges */}
                    <mesh position={[0.31, 0.45, -0.02]} material={hardwareSteelMaterial}>
                      <cylinderGeometry args={[0.012, 0.012, 0.08, 16]} />
                    </mesh>
                    <mesh position={[0.31, -0.45, -0.02]} material={hardwareSteelMaterial}>
                      <cylinderGeometry args={[0.012, 0.012, 0.08, 16]} />
                    </mesh>
                  </group>
                </group>
              </group>
            </group>
          )}
 
          {/* ==================================================== */}
          {/* WINDOW MODEL: MUR RIDEAU / FAÇADE VITRÉE (CURTAIN)  */}
          {/* ==================================================== */}
          {windowModel === 'curtain_wall' && (
            <group position={[0, 0, 0.02 + explodeZ]}>
              {/* Vertical Structural Mullions (Montants 50x120mm) */}
              {[-0.48, 0, 0.48].map((mx, idx) => (
                <group key={`mullion-${idx}`} position={[mx, 0, 0]}>
                  <mesh material={frameMaterial}>
                    <boxGeometry args={[0.06, 1.48, 0.12]} />
                    <Edges threshold={15} color={cadEdgeColor} />
                  </mesh>
                  {/* Exterior Architectural Pressure Cap (Capot serre-joint) */}
                  <mesh position={[0, 0, 0.065]} material={goldAccentMaterial}>
                    <boxGeometry args={[0.05, 1.48, 0.015]} />
                    <Edges threshold={15} color="#F59E0B" />
                  </mesh>
                </group>
              ))}

              {/* Horizontal Structural Transoms (Traverses 50x80mm) */}
              {[-0.38, 0.38].map((ty, idx) => (
                <group key={`transom-${idx}`} position={[0, ty, 0]}>
                  <mesh material={frameMaterial}>
                    <boxGeometry args={[1.44, 0.05, 0.08]} />
                    <Edges threshold={15} color={cadEdgeColor} />
                  </mesh>
                  <mesh position={[0, 0, 0.045]} material={goldAccentMaterial}>
                    <boxGeometry args={[1.44, 0.04, 0.015]} />
                    <Edges threshold={15} color="#F59E0B" />
                  </mesh>
                </group>
              ))}

              {/* 4 Large Structural Double Glazing Stop-Sol Panes */}
              {[
                { x: -0.24, y: 0.38 },
                { x: 0.24, y: 0.38 },
                { x: -0.24, y: -0.38 },
                { x: 0.24, y: -0.38 },
              ].map((pos, idx) => (
                <mesh
                  key={`curtain-glass-${idx}`}
                  position={[pos.x, pos.y, 0.02 + explodeGlassZ]}
                  material={glassMaterial}
                >
                  <boxGeometry args={[0.44, 0.72, 0.024]} />
                  <Edges threshold={15} color={glassCadEdgeColor} />
                </mesh>
              ))}
            </group>
          )}
        </group>
      )}

      {/* ============================================================ */}
      {/* TRADE 2: ÉBÉNISTERIE & CUISINE MEUBLE SUR MESURE             */}
      {/* ============================================================ */}
      {trade === 'woodworking' && (
        <group>
          {/* Main Carcass Body */}
          <group position={[0, 0, 0]}>
            {/* Top Board */}
            <mesh position={[0, 0.74, 0]} material={woodMaterial}>
              <boxGeometry args={[1.3, 0.03, 0.6]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
            {/* Bottom Board */}
            <mesh position={[0, -0.74, 0]} material={woodMaterial}>
              <boxGeometry args={[1.3, 0.03, 0.6]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
            {/* Left Side Panel */}
            <mesh position={[-0.635, 0, 0]} material={woodMaterial}>
              <boxGeometry args={[0.03, 1.45, 0.6]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
            {/* Right Side Panel */}
            <mesh position={[0.635, 0, 0]} material={woodMaterial}>
              <boxGeometry args={[0.03, 1.45, 0.6]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
            {/* Middle Shelf */}
            <mesh position={[0, 0, 0]} material={woodMaterial}>
              <boxGeometry args={[1.24, 0.03, 0.56]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
            {/* Back Panel */}
            <mesh position={[0, 0, -0.29]} material={woodMaterial}>
              <boxGeometry args={[1.24, 1.45, 0.015]} />
              <Edges threshold={15} color={cadEdgeColor} />
            </mesh>
          </group>

          {/* Upper Drawer Front */}
          <group position={[0, 0.54, 0.31 + explodeZ]}>
            <mesh material={frameMaterial}>
              <boxGeometry args={[1.22, 0.28, 0.03]} />
              <Edges threshold={15} color={cadAccentEdgeColor} />
            </mesh>
            {/* Drawer Pull Bar */}
            <mesh position={[0, 0, 0.025]} material={goldAccentMaterial}>
              <boxGeometry args={[0.28, 0.02, 0.02]} />
            </mesh>
          </group>

          {/* Left Swinging Door */}
          <group position={[-0.61, -0.16, 0.31 + explodeZ]}>
            <group ref={leftDoorRef}>
              <mesh position={[0.3, 0, 0]} material={frameMaterial}>
                <boxGeometry args={[0.6, 0.98, 0.025]} />
                <Edges threshold={15} color={cadAccentEdgeColor} />
              </mesh>
              {/* Gold Handle */}
              <mesh position={[0.54, 0, 0.025]} material={goldAccentMaterial}>
                <cylinderGeometry args={[0.012, 0.012, 0.16, 16]} />
              </mesh>
            </group>
          </group>

          {/* Right Swinging Door */}
          <group position={[0.61, -0.16, 0.31 + explodeZ]}>
            <group ref={rightDoorRef}>
              <mesh position={[-0.3, 0, 0]} material={frameMaterial}>
                <boxGeometry args={[0.6, 0.98, 0.025]} />
                <Edges threshold={15} color={cadAccentEdgeColor} />
              </mesh>
              {/* Gold Handle */}
              <mesh position={[-0.54, 0, 0.025]} material={goldAccentMaterial}>
                <cylinderGeometry args={[0.012, 0.012, 0.16, 16]} />
              </mesh>
            </group>
          </group>
        </group>
      )}

      {/* ============================================================ */}
      {/* TRADE 3: FERRONNERIE D'ART & GRILLE DE SÉCURITÉ ARCHITECTURALE */}
      {/* ============================================================ */}
      {trade === 'metalwork' && (
        <group>
          {/* Outer Heavy Steel Tube 40x40 Frame */}
          <mesh position={[0, 0.78, 0]} material={frameMaterial}>
            <boxGeometry args={[1.4, 0.06, 0.06]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>
          <mesh position={[0, -0.78, 0]} material={frameMaterial}>
            <boxGeometry args={[1.4, 0.06, 0.06]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>
          <mesh position={[-0.67, 0, 0]} material={frameMaterial}>
            <boxGeometry args={[0.06, 1.5, 0.06]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>
          <mesh position={[0.67, 0, 0]} material={frameMaterial}>
            <boxGeometry args={[0.06, 1.5, 0.06]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>

          {/* Horizontal Reinforcement Rails */}
          <mesh position={[0, 0.15, 0]} material={frameMaterial}>
            <boxGeometry args={[1.28, 0.04, 0.04]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>
          <mesh position={[0, -0.4, 0]} material={frameMaterial}>
            <boxGeometry args={[1.28, 0.04, 0.04]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>

          {/* Vertical Square 14mm Iron Bars with Forged Spearheads */}
          {[-0.55, -0.44, -0.33, -0.22, -0.11, 0, 0.11, 0.22, 0.33, 0.44, 0.55].map((bx, idx) => (
            <group key={idx} position={[bx, 0, 0]}>
              {/* Main Bar */}
              <mesh material={frameMaterial}>
                <boxGeometry args={[0.022, 1.5, 0.022]} />
                <Edges threshold={15} color={cadAccentEdgeColor} />
              </mesh>
              {/* Golden Spearhead ornament on top */}
              <mesh position={[0, 0.88, 0]} material={goldAccentMaterial}>
                <coneGeometry args={[0.035, 0.14, 4]} />
                <Edges threshold={15} color="#F59E0B" />
              </mesh>
              {/* Decorative center ring */}
              <mesh position={[0, 0.15, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={goldAccentMaterial}>
                <torusGeometry args={[0.03, 0.008, 12, 24]} />
              </mesh>
            </group>
          ))}

          {/* Wrought Iron Volutes (Volutes forgées centrales) */}
          {[-0.38, -0.16, 0.16, 0.38].map((vx, vidx) => (
            <mesh key={`volute-${vidx}`} position={[vx, -0.12, 0.015]} material={goldAccentMaterial}>
              <torusGeometry args={[0.08, 0.009, 12, 32, Math.PI * 1.6]} />
            </mesh>
          ))}
        </group>
      )}

      {/* ============================================================ */}
      {/* TRADE 4: FERMETURES & VOLET ROULANT MOTORISÉ ARCHITECTURAL    */}
      {/* ============================================================ */}
      {trade === 'tapestry' && (
        <group>
          {/* Top Extruded Aluminum Caisson Box 180x180mm */}
          <mesh position={[0, 0.84, 0]} material={shutterMaterial}>
            <boxGeometry args={[1.5, 0.2, 0.16]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>
          {/* Motorized Cable Gland / End Caps */}
          <mesh position={[-0.76, 0.84, 0]} material={goldAccentMaterial}>
            <boxGeometry args={[0.025, 0.18, 0.14]} />
            <Edges threshold={15} color="#F59E0B" />
          </mesh>
          <mesh position={[0.76, 0.84, 0]} material={goldAccentMaterial}>
            <boxGeometry args={[0.025, 0.18, 0.14]} />
            <Edges threshold={15} color="#F59E0B" />
          </mesh>

          {/* Lateral Guide Rails (Coulisses avec brosses) */}
          <mesh position={[-0.72, -0.02, 0]} material={frameMaterial}>
            <boxGeometry args={[0.06, 1.54, 0.06]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>
          <mesh position={[0.72, -0.02, 0]} material={frameMaterial}>
            <boxGeometry args={[0.06, 1.54, 0.06]} />
            <Edges threshold={15} color={cadEdgeColor} />
          </mesh>

          {/* Articulated Roller Curtain Slats (Tablier de lames aluminium) */}
          <group position={[0, 0, 0]}>
            {Array.from({ length: 16 }).map((_, idx) => {
              // Calculate vertical offset and motorized roll-up on scroll
              const slatBaseY = 0.68 - idx * 0.085;
              const rollupThreshold = 1 - (idx / 16);
              const isRetracted = effectiveOpen > rollupThreshold;
              const slatY = isRetracted ? THREE.MathUtils.lerp(slatBaseY, 0.82, (effectiveOpen - rollupThreshold) * 4) : slatBaseY;
              const slatScaleZ = isRetracted ? 0.3 : 1;

              return (
                <group key={`slat-${idx}`} position={[0, Math.min(0.84, slatY), 0]} scale={[1, 1, slatScaleZ]}>
                  {/* Extruded Thermal Aluminum Slat */}
                  <mesh material={frameMaterial}>
                    <boxGeometry args={[1.38, 0.076, 0.022]} />
                    <Edges threshold={15} color={cadAccentEdgeColor} />
                  </mesh>
                  {/* Subtle Beveled Joint Line */}
                  <mesh position={[0, -0.038, 0.012]} material={goldAccentMaterial}>
                    <boxGeometry args={[1.36, 0.004, 0.003]} />
                  </mesh>
                </group>
              );
            })}

            {/* Heavy Extruded Final Slat with Weatherstrip (Lame finale renforcée) */}
            <mesh
              position={[0, Math.min(0.82, 0.68 - 16 * 0.085 + (effectiveOpen * 0.9)), 0.005]}
              material={goldAccentMaterial}
            >
              <boxGeometry args={[1.4, 0.06, 0.028]} />
              <Edges threshold={15} color="#F59E0B" />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
};
