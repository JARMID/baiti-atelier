import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConfigStore } from '../../store/configStore';
import type { FinishColor } from '../../types/window';
import type { TradeCategory } from '../../types/trades';
import { FINISH_PALETTES } from '../../utils/finishSpecifications';

export type WindowModelType = 'sliding' | 'tilt_and_turn' | 'french_casement';

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

  // Materials with clipping support
  const frameMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: palette.color,
      roughness: palette.roughness,
      metalness: palette.metalness,
      envMapIntensity: 1.4,
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
    const mat = new THREE.MeshStandardMaterial({
      color: isLightMode ? '#FFFFFF' : '#0B0F19',
      roughness: isLightMode ? 0.25 : 0.45,
      metalness: isLightMode ? 0.08 : 0.65,
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
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.02,
      transparent: true,
      opacity: 0.55,
      ior: 1.52,
      reflectivity: 0.82,
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

  const fabricMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color: finishColor === 'ral_9016' ? '#F8FAFC' : finishColor === 'ral_7016' ? '#475569' : '#8B5CF6',
      roughness: 0.85,
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
  const openProgress = Math.min(1, Math.max(0, (scrollProgress - 0.35) / 0.3));
  const explodeFactor = isExploded ? 1 : Math.min(1, Math.max(0, (scrollProgress - 0.5) / 0.25));

  const explodeZ = explodeFactor * 0.32;
  const explodeGlassZ = explodeFactor * 0.58;
  const explodeDilation = explodeFactor * 0.1;

  useFrame((state, delta) => {
    if (!rootRef.current) return;

    // Stage 1 breathing rotation
    if (scrollProgress < 0.35) {
      const breathing = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
      rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, breathing, delta * 3);
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, 0.04, delta * 3);
    } else if (scrollProgress >= 0.35 && scrollProgress < 0.7) {
      // Stage 2: Sweeping technical tilt
      const targetY = 0.45;
      const targetX = 0.12;
      rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, targetY, delta * 4);
      rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, targetX, delta * 4);
    }

    // Kinematic motion on scroll
    const effectiveOpen = isOpen ? 1 : openProgress;

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
          {/* Top Roller Shutter Caisson Monobloc (2mm expansion clearance to eliminate seam z-fighting) */}
          <mesh
            position={[0, 0.852 + explodeDilation, 0]}
            material={shutterMaterial}
          >
            <boxGeometry args={[1.44 + explodeDilation * 2, 0.178, 0.11]} />
          </mesh>

          {/* Outer Frame (Dormant 45/52 RPT) */}
          <group position={[0, 0, 0]}>
            {/* Top Dormant */}
            <mesh position={[0, 0.72 + explodeDilation, 0]} material={frameMaterial}>
              <boxGeometry args={[1.44 + explodeDilation * 2, 0.08, 0.09]} />
            </mesh>
            {/* Bottom Dormant */}
            <mesh position={[0, -0.72 - explodeDilation, 0]} material={frameMaterial}>
              <boxGeometry args={[1.44 + explodeDilation * 2, 0.08, 0.09]} />
            </mesh>
            {/* Left Upright */}
            <mesh position={[-0.68 - explodeDilation, 0, 0]} material={frameMaterial}>
              <boxGeometry args={[0.08, 1.36, 0.09]} />
            </mesh>
            {/* Right Upright */}
            <mesh position={[0.68 + explodeDilation, 0, 0]} material={frameMaterial}>
              <boxGeometry args={[0.08, 1.36, 0.09]} />
            </mesh>

            {/* Polyamide Thermal Break Bars (displayed cleanly during technical clipping/explosion without coplanar fighting) */}
            {(clippingPlane || isExploded) && (
              <>
                <mesh position={[0, 0.72 + explodeDilation, 0]} material={thermalBreakMaterial} renderOrder={2}>
                  <boxGeometry args={[1.4, 0.02, 0.025]} />
                </mesh>
                <mesh position={[0, -0.72 - explodeDilation, 0]} material={thermalBreakMaterial} renderOrder={2}>
                  <boxGeometry args={[1.4, 0.02, 0.025]} />
                </mesh>
              </>
            )}
          </group>

          {/* ============================================== */}
          {/* WINDOW MODEL: SLIDING (COULISSANT 2 VANTAUX)  */}
          {/* ============================================== */}
          {windowModel === 'sliding' && (
            <>
              {/* Left Movable Sash */}
              <group ref={leftSashRef} position={[-0.32, 0, 0.02 + explodeZ]}>
                <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.74, 0.08, 0.06]} />
                </mesh>
                <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.74, 0.08, 0.06]} />
                </mesh>
                <mesh position={[-0.33, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.08, 1.18, 0.06]} />
                </mesh>
                <mesh position={[0.33, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.08, 1.18, 0.06]} />
                </mesh>
                <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                  <boxGeometry args={[0.6, 1.18, 0.02]} />
                </mesh>
                {/* Modern Cremone Grip */}
                <mesh position={[0.28, 0, 0.045]} material={goldAccentMaterial}>
                  <boxGeometry args={[0.028, 0.16, 0.025]} />
                </mesh>
              </group>

              {/* Right Fixed Sash */}
              <group position={[0.32, 0, -0.02 + explodeZ]}>
                <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.74, 0.08, 0.06]} />
                </mesh>
                <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.74, 0.08, 0.06]} />
                </mesh>
                <mesh position={[-0.33, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.08, 1.18, 0.06]} />
                </mesh>
                <mesh position={[0.33, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.08, 1.18, 0.06]} />
                </mesh>
                <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                  <boxGeometry args={[0.6, 1.18, 0.02]} />
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
              </mesh>

              {/* Left Tilt-and-Turn Sash (Pivoting from bottom) */}
              <group position={[-0.35, -0.63, 0]}>
                <group ref={leftSashRef}>
                  <group position={[0, 0.63, 0]}>
                    <mesh position={[0, 0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                    </mesh>
                    <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                    </mesh>
                    <mesh position={[-0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                    </mesh>
                    <mesh position={[0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                    </mesh>
                    <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                      <boxGeometry args={[0.5, 1.18, 0.02]} />
                    </mesh>
                    {/* Modern Ergonomic German Handle */}
                    <mesh position={[0.23, 0, 0.05]} material={goldAccentMaterial}>
                      <boxGeometry args={[0.025, 0.15, 0.03]} />
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
                </mesh>
                <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.64, 0.075, 0.065]} />
                </mesh>
                <mesh position={[-0.28, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.075, 1.18, 0.065]} />
                </mesh>
                <mesh position={[0.28, 0, 0]} material={frameMaterial}>
                  <boxGeometry args={[0.075, 1.18, 0.065]} />
                </mesh>
                <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                  <boxGeometry args={[0.5, 1.18, 0.02]} />
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
                    </mesh>
                    <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                    </mesh>
                    <mesh position={[-0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                    </mesh>
                    <mesh position={[0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                    </mesh>
                    <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                      <boxGeometry args={[0.5, 1.18, 0.02]} />
                    </mesh>
                    {/* Espagnolette Cremone Handle */}
                    <mesh position={[0.26, 0, 0.05]} material={goldAccentMaterial}>
                      <boxGeometry args={[0.025, 0.16, 0.03]} />
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
                    </mesh>
                    <mesh position={[0, -0.63, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.64, 0.075, 0.065]} />
                    </mesh>
                    <mesh position={[-0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                    </mesh>
                    <mesh position={[0.28, 0, 0]} material={frameMaterial}>
                      <boxGeometry args={[0.075, 1.18, 0.065]} />
                    </mesh>
                    <mesh position={[0, 0, explodeGlassZ]} material={glassMaterial}>
                      <boxGeometry args={[0.5, 1.18, 0.02]} />
                    </mesh>
                    {/* Central Overlap Beating Strip (Batteuse) */}
                    <mesh position={[-0.31, 0, 0.025]} material={frameMaterial}>
                      <boxGeometry args={[0.03, 1.22, 0.02]} />
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
            </mesh>
            {/* Bottom Board */}
            <mesh position={[0, -0.74, 0]} material={woodMaterial}>
              <boxGeometry args={[1.3, 0.03, 0.6]} />
            </mesh>
            {/* Left Side Panel */}
            <mesh position={[-0.635, 0, 0]} material={woodMaterial}>
              <boxGeometry args={[0.03, 1.45, 0.6]} />
            </mesh>
            {/* Right Side Panel */}
            <mesh position={[0.635, 0, 0]} material={woodMaterial}>
              <boxGeometry args={[0.03, 1.45, 0.6]} />
            </mesh>
            {/* Middle Shelf */}
            <mesh position={[0, 0, 0]} material={woodMaterial}>
              <boxGeometry args={[1.24, 0.03, 0.56]} />
            </mesh>
            {/* Back Panel */}
            <mesh position={[0, 0, -0.29]} material={woodMaterial}>
              <boxGeometry args={[1.24, 1.45, 0.015]} />
            </mesh>
          </group>

          {/* Upper Drawer Front */}
          <group position={[0, 0.54, 0.31 + explodeZ]}>
            <mesh material={frameMaterial}>
              <boxGeometry args={[1.22, 0.28, 0.03]} />
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
      {/* TRADE 3: FERRONNERIE D'ART & SÉCURITÉ MÉTALLIQUE             */}
      {/* ============================================================ */}
      {trade === 'metalwork' && (
        <group>
          {/* Outer Heavy Steel Tube 40x40 Frame */}
          <mesh position={[0, 0.78, 0]} material={frameMaterial}>
            <boxGeometry args={[1.4, 0.06, 0.06]} />
          </mesh>
          <mesh position={[0, -0.78, 0]} material={frameMaterial}>
            <boxGeometry args={[1.4, 0.06, 0.06]} />
          </mesh>
          <mesh position={[-0.67, 0, 0]} material={frameMaterial}>
            <boxGeometry args={[0.06, 1.5, 0.06]} />
          </mesh>
          <mesh position={[0.67, 0, 0]} material={frameMaterial}>
            <boxGeometry args={[0.06, 1.5, 0.06]} />
          </mesh>

          {/* Horizontal Reinforcement Rails */}
          <mesh position={[0, 0.15, 0]} material={frameMaterial}>
            <boxGeometry args={[1.28, 0.04, 0.04]} />
          </mesh>
          <mesh position={[0, -0.4, 0]} material={frameMaterial}>
            <boxGeometry args={[1.28, 0.04, 0.04]} />
          </mesh>

          {/* Vertical Square 14mm Iron Bars with Forged Spearheads */}
          {[-0.55, -0.44, -0.33, -0.22, -0.11, 0, 0.11, 0.22, 0.33, 0.44, 0.55].map((bx, idx) => (
            <group key={idx} position={[bx, 0, 0]}>
              {/* Bar */}
              <mesh material={frameMaterial}>
                <boxGeometry args={[0.022, 1.5, 0.022]} />
              </mesh>
              {/* Golden Spearhead ornament on top */}
              <mesh position={[0, 0.88, 0]} material={goldAccentMaterial}>
                <coneGeometry args={[0.035, 0.14, 4]} />
              </mesh>
              {/* Decorative center ring */}
              <mesh position={[0, 0.15, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={goldAccentMaterial}>
                <torusGeometry args={[0.03, 0.008, 12, 24]} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* ============================================================ */}
      {/* TRADE 4: TAPISSERIE & DRAPERIE ONDE ARCHITECTURALE           */}
      {/* ============================================================ */}
      {trade === 'tapestry' && (
        <group>
          {/* Architectural Ceiling Track Rail */}
          <mesh position={[0, 0.85, 0]} material={frameMaterial}>
            <boxGeometry args={[1.6, 0.04, 0.06]} />
          </mesh>
          {/* Gold Brackets */}
          <mesh position={[-0.72, 0.88, 0]} material={goldAccentMaterial}>
            <boxGeometry args={[0.05, 0.08, 0.08]} />
          </mesh>
          <mesh position={[0.72, 0.88, 0]} material={goldAccentMaterial}>
            <boxGeometry args={[0.05, 0.08, 0.08]} />
          </mesh>

          {/* 3D Wave Folds Fabric Mesh */}
          <group position={[0, 0, 0]}>
            {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((fx, idx) => {
              const isFront = idx % 2 === 0;
              const foldZ = isFront ? 0.08 : -0.08;
              return (
                <group key={idx} position={[fx, 0, foldZ]}>
                  <mesh material={fabricMaterial}>
                    <cylinderGeometry args={[0.09, 0.11, 1.65, 32, 1, true]} />
                  </mesh>
                  {/* Lead weight bar at the bottom */}
                  <mesh position={[0, -0.82, 0]} material={goldAccentMaterial}>
                    <cylinderGeometry args={[0.015, 0.015, 0.18, 16]} />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      )}
    </group>
  );
};
