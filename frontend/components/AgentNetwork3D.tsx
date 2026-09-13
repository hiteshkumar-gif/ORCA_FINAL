'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Cpu, Zap, Activity, CheckCircle2, RefreshCw } from 'lucide-react';

interface AgentNodeData {
  id: string;
  name: string;
  category: string;
  status: 'ACTIVE' | 'PROCESSING' | 'READY';
  durationMs: number;
}

const AGENTS_LIST: AgentNodeData[] = [
  { id: '1', name: 'Orchestrator Agent', category: 'Core', status: 'ACTIVE', durationMs: 12.4 },
  { id: '2', name: 'Intent & Language Agent', category: 'NLP', status: 'ACTIVE', durationMs: 18.2 },
  { id: '3', name: 'Marine Data Agent', category: 'Telemetry', status: 'ACTIVE', durationMs: 45.1 },
  { id: '4', name: 'Weather Agent', category: 'Telemetry', status: 'ACTIVE', durationMs: 38.6 },
  { id: '5', name: 'Satellite / EO Agent', category: 'Remote Sensing', status: 'ACTIVE', durationMs: 52.0 },
  { id: '6', name: 'Fishing Opportunity Agent', category: 'Analytics', status: 'ACTIVE', durationMs: 28.4 },
  { id: '7', name: 'Geospatial Agent', category: 'GIS', status: 'ACTIVE', durationMs: 31.0 },
  { id: '8', name: 'Safety Agent', category: 'Rule Engine', status: 'ACTIVE', durationMs: 14.2 },
  { id: '9', name: 'Route Optimization Agent', category: 'GIS', status: 'ACTIVE', durationMs: 22.8 },
  { id: '10', name: 'Decision Agent', category: 'Synthesis', status: 'ACTIVE', durationMs: 16.5 },
  { id: '11', name: 'Monitoring Agent', category: 'Background', status: 'ACTIVE', durationMs: 25.1 },
  { id: '12', name: 'Feedback Agent', category: 'Learning', status: 'ACTIVE', durationMs: 11.0 }
];

export default function AgentNetwork3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentNodeData>(AGENTS_LIST[0]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Central Core Node
    const coreGeo = new THREE.IcosahedronGeometry(0.5, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x00f0ff,
      emissive: 0x0284c7,
      wireframe: true
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // 12 Outer Agent Nodes in radial layout
    const radius = 2.5;
    const nodesGroup = new THREE.Group();
    group.add(nodesGroup);

    const nodeMeshes: THREE.Mesh[] = [];

    AGENTS_LIST.forEach((agent, i) => {
      const angle = (i / AGENTS_LIST.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.sin(i * 1.5) * 0.4);

      // Node Mesh
      const nodeGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const nodeMat = new THREE.MeshPhongMaterial({
        color: i % 2 === 0 ? 0x00f0ff : 0x10b981,
        emissive: i % 2 === 0 ? 0x082f49 : 0x064e3b
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, y, z);
      nodesGroup.add(nodeMesh);
      nodeMeshes.push(nodeMesh);

      // Connecting line to core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.35
      });
      const line = new THREE.Line(lineGeo, lineMat);
      nodesGroup.add(line);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      group.rotation.y = elapsed * 0.15;
      coreMesh.rotation.x = elapsed * 0.3;
      coreMesh.rotation.z = elapsed * 0.2;

      renderer.render(scene, camera);
    };

    animate();

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
  }, []);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
            3D WebGL Multi-Agent Network Topology
          </span>
          <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            12 Collaborative AI Agents Observatory
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
          12 / 12 Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Canvas View (7 cols) */}
        <div className="lg:col-span-7 h-[360px] relative rounded-2xl overflow-hidden bg-slate-950/80 border border-slate-800">
          <div ref={containerRef} className="w-full h-full" />
          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            Click agent below to inspect telemetry
          </div>
        </div>

        {/* Selected Agent Inspector Card (5 cols) */}
        <div className="lg:col-span-5 space-y-3 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold uppercase text-[10px]">Inspector</span>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {selectedAgent.status}
              </span>
            </div>
            <h4 className="text-base font-extrabold text-slate-100">{selectedAgent.name}</h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Specialized marine intelligence node processing parallel tasks.
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
              <div>
                <span className="text-[9px] uppercase text-slate-500 block">Category</span>
                <span className="text-cyan-300 font-bold">{selectedAgent.category}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-500 block">Avg Latency</span>
                <span className="text-slate-200">{selectedAgent.durationMs} ms</span>
              </div>
            </div>
          </div>

          {/* Quick Select Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {AGENTS_LIST.map((ag) => (
              <button
                key={ag.id}
                onClick={() => setSelectedAgent(ag)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                  selectedAgent.id === ag.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {ag.name.replace(' Agent', '')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
