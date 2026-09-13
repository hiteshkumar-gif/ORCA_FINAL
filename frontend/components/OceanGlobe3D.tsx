'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Maximize2, Minimize2, RotateCcw, Zap, Eye, Globe } from 'lucide-react';
import { useLocationLanguage } from '@/context/LocationLanguageContext';

interface OceanGlobe3DProps {
  interactive?: boolean;
  height?: string;
  showAgents?: boolean;
  className?: string;
}

export default function OceanGlobe3D({
  interactive = true,
  height = '460px',
  showAgents = true,
  className = ''
}: OceanGlobe3DProps) {
  const { location } = useLocationLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Group | null>(null);
  const markerRef = useRef<THREE.Group | null>(null);
  const arcsGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [isRotating, setIsRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Convert lat/lng to 3D Cartesian coordinates on sphere of radius R
  const latLngToVector3 = (lat: number, lng: number, radius: number = 2): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    const width = containerRef.current.clientWidth || 600;
    const heightPx = containerRef.current.clientHeight || 460;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 0, 5.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, heightPx);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Clear previous canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // Main Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeRef.current = globeGroup;

    // 1. Outer Atmosphere Glow Sphere
    const atmosphereGeo = new THREE.SphereGeometry(2.15, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphere);

    // 2. Base Dark Ocean Sphere
    const oceanGeo = new THREE.SphereGeometry(2, 64, 64);
    const oceanMat = new THREE.MeshPhongMaterial({
      color: 0x030712, // Dark Navy
      emissive: 0x082f49,
      specular: 0x00f0ff,
      shininess: 30,
      wireframe: false
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    globeGroup.add(ocean);

    // 3. Grid Lines (Latitude / Longitude Graticule)
    const gridGeo = new THREE.SphereGeometry(2.01, 24, 24);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    globeGroup.add(gridMesh);

    // 4. Floating Marine Telemetry Particle Points
    const particleCount = 200;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.05 + Math.random() * 0.15;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.03,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // 5. Selected Location Marker Group
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);
    markerRef.current = markerGroup;

    // Glowing Pin Ring
    const ringGeo = new THREE.RingGeometry(0.04, 0.08, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    markerGroup.add(ringMesh);

    // Vertical Beacon Line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.3, 0)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
    const beaconLine = new THREE.Line(lineGeo, lineMat);
    markerGroup.add(beaconLine);

    // Beacon Top Glowing Orb
    const orbGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    orbMesh.position.set(0, 0.3, 0);
    markerGroup.add(orbMesh);

    // 6. Multi-Agent Arcs Group
    const arcsGroup = new THREE.Group();
    globeGroup.add(arcsGroup);
    arcsGroupRef.current = arcsGroup;

    if (showAgents) {
      // Create 12 Agent Data Arcs radiating from target location
      const agentCoords = [
        { lat: 13.0827, lng: 80.2707 },
        { lat: 18.9220, lng: 72.8347 },
        { lat: 9.9312, lng: 76.2673 },
        { lat: 17.6868, lng: 83.2185 },
        { lat: 15.4989, lng: 73.8278 },
        { lat: 12.9141, lng: 74.8560 },
        { lat: 11.9416, lng: 79.8083 },
        { lat: 21.6417, lng: 69.6293 },
        { lat: 20.3164, lng: 86.6114 },
        { lat: 22.0667, lng: 88.0667 },
        { lat: 8.7642, lng: 78.1348 },
        { lat: 11.6233, lng: 92.7265 }
      ];

      const startVec = latLngToVector3(location.latitude, location.longitude, 2.02);

      agentCoords.forEach((dest, idx) => {
        const destVec = latLngToVector3(dest.lat, dest.lng, 2.02);
        const midVec = new THREE.Vector3().addVectors(startVec, destVec).multiplyScalar(0.5);
        midVec.setLength(2.4 + (idx % 3) * 0.1); // Arc curve height

        const curve = new THREE.QuadraticBezierCurve3(startVec, midVec, destVec);
        const points = curve.getPoints(30);
        const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
        const arcMat = new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0x00f0ff : 0x10b981,
          transparent: true,
          opacity: 0.45
        });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        arcsGroup.add(arcLine);
      });
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const bluePointLight = new THREE.PointLight(0x0284c7, 2, 10);
    bluePointLight.position.set(-5, -5, -2);
    scene.add(bluePointLight);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (globeGroup && isRotating) {
        globeGroup.rotation.y += delta * 0.15;
      }

      if (particles) {
        particles.rotation.y -= delta * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [isRotating, showAgents]);

  // Position Selected Location Marker dynamically on globe
  useEffect(() => {
    if (!markerRef.current) return;
    const pos = latLngToVector3(location.latitude, location.longitude, 2.03);
    markerRef.current.position.copy(pos);
    markerRef.current.lookAt(new THREE.Vector3(0, 0, 0));
    markerRef.current.rotateX(Math.PI / 2);
  }, [location.latitude, location.longitude]);

  if (!webglSupported) {
    return (
      <div className={`w-full h-[${height}] rounded-3xl glass-panel border border-cyan-500/30 flex flex-col items-center justify-center p-6 text-center text-cyan-400 font-mono space-y-3 ${className}`}>
        <Globe className="w-12 h-12 animate-pulse text-cyan-400" />
        <h4 className="font-bold text-sm text-slate-200">ORCA Geospatial Ocean Sphere</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Active target sector: <span className="text-cyan-300 font-bold">{location.city}, {location.country}</span> ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-3xl glass-panel border border-cyan-500/30 shadow-2xl overflow-hidden backdrop-blur-2xl ${className}`} style={{ height }}>
      {/* Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Telemetry Overlay */}
      <div className="absolute top-4 left-4 z-10 glass-panel px-3.5 py-2 rounded-xl border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-none">
        <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
        <span className="font-bold">{location.city}</span>
        <span className="text-[10px] text-slate-400 font-mono">({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)</span>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className={`p-2 rounded-xl border transition-all text-xs font-mono font-bold flex items-center gap-1.5 ${
            isRotating
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900/80 text-slate-400 border-slate-800'
          }`}
          title="Toggle Auto Rotation"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRotating ? 'Rotating' : 'Paused'}</span>
        </button>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none text-[10px] font-mono">
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>12 AI Agent Telemetry Streams Active</span>
        </div>

        <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400 font-bold hidden sm:block">
          WebGL 3D Engine Active
        </div>
      </div>
    </div>
  );
}
