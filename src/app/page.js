'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Playfair_Display, Inter } from 'next/font/google';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial, RoundedBox, Center, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], style: ['normal', 'italic'] });
const inter = Inter({ subsets: ['latin'] });

// --- 3D Components ---

function HeroCore() {
  const meshRef = useRef(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, 0, -5]} intensity={5} color="#f97316" />
      <pointLight position={[5, -5, 5]} intensity={3} color="#7c3aed" />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.8, 0]} />
          <meshPhysicalMaterial 
            color="#050505"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#1a0b02"
            envMapIntensity={2}
          />
        </mesh>
        
        {/* Orbiting rings */}
        <mesh rotation={[Math.PI/4, Math.PI/4, 0]}>
          <torusGeometry args={[2.5, 0.02, 16, 100]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[-Math.PI/4, Math.PI/4, 0]}>
          <torusGeometry args={[3, 0.01, 16, 100]} />
          <meshBasicMaterial color="#7c3aed" transparent opacity={0.4} />
        </mesh>
      </Float>
      <Environment preset="city" />
      <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#f97316" />
    </>
  );
}

function FeatureAsset({ type }) {
  const meshRef = useRef(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      if (type !== 'globe') {
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
    }
  });

  const materialProps = {
    color: "#0a0a0a",
    metalness: 0.8,
    roughness: 0.2,
    clearcoat: 1,
    envMapIntensity: 2,
    emissive: type === 'diamond' ? '#f97316' : type === 'globe' ? '#7c3aed' : '#f97316',
    emissiveIntensity: 0.15,
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={2} color={type === 'globe' ? '#7c3aed' : '#f97316'} />
      <pointLight position={[-2, -2, -2]} intensity={1} color="#ffffff" />
      
      <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
        <Center>
          <mesh ref={meshRef}>
            {type === 'diamond' && <octahedronGeometry args={[1.2, 0]} />}
            {type === 'globe' && <sphereGeometry args={[1.1, 64, 64]} />}
            {type === 'pyramid' && <coneGeometry args={[1.2, 1.8, 4]} />}
            
            {type === 'globe' ? (
              <MeshDistortMaterial {...materialProps} distort={0.2} speed={2} />
            ) : (
              <meshPhysicalMaterial {...materialProps} />
            )}
          </mesh>
        </Center>
      </Float>
      <Environment preset="city" />
    </>
  );
}

function MembershipEmblem() {
  const meshRef = useRef(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} intensity={2} color="#7c3aed" />
      <pointLight position={[-2, -2, -2]} intensity={2} color="#f97316" />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Center>
          <mesh ref={meshRef}>
            <torusKnotGeometry args={[1.2, 0.3, 128, 32]} />
            <meshPhysicalMaterial 
              color="#000000"
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
              emissive="#7c3aed"
              emissiveIntensity={0.4}
              envMapIntensity={2}
            />
          </mesh>
        </Center>
      </Float>
      <Environment preset="city" />
    </>
  );
}

function FloatingBackground() {
  const group = useRef(null);
  const { scrollY } = useScroll();

  useFrame((state) => {
    if (group.current) {
      // Gentle constant rotation
      group.current.rotation.y = state.clock.elapsedTime * 0.05;
      // Parallax effect based on scroll
      group.current.position.y = scrollY.get() * 0.005;
    }
  });

  const [objects, setObjects] = useState([]);

  React.useEffect(() => {
    const generatedObjects = Array.from({ length: 120 }).map((_, i) => {
      const type = ['pyramid', 'diamond', 'globe'][Math.floor(Math.random() * 3)];
      const color = Math.random() > 0.5 ? '#f97316' : '#7c3aed';
      
      // Spread objects widely across the scene
      const position = [
        (Math.random() - 0.5) * 40, 
        (Math.random() - 0.5) * 60, 
        (Math.random() - 0.5) * 30 - 15
      ];
      
      const rotation = [Math.random() * Math.PI, Math.random() * Math.PI, 0];
      const scale = Math.random() * 0.5 + 0.2;
      const speed = 1 + Math.random();

      return { id: i, type, color, position, rotation, scale, speed };
    });
    setObjects(generatedObjects);
  }, []);

  return (
    <group ref={group}>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {objects.map((obj) => (
        <Float key={obj.id} speed={obj.speed} rotationIntensity={1} floatIntensity={2} position={obj.position}>
          <mesh rotation={obj.rotation} scale={obj.scale}>
            {obj.type === 'diamond' && <octahedronGeometry args={[1, 0]} />}
            {obj.type === 'globe' && <sphereGeometry args={[1, 32, 32]} />}
            {obj.type === 'pyramid' && <coneGeometry args={[1, 1.5, 4]} />}
            
            <meshPhysicalMaterial 
              color="#000000"
              metalness={0.9}
              roughness={0.2}
              clearcoat={1}
              emissive={obj.color}
              emissiveIntensity={0.2}
              envMapIntensity={2}
            />
          </mesh>
        </Float>
      ))}
      <Environment preset="city" />
    </group>
  );
}

// --- Main Layout ---

export default function PremiumLanding() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className={inter.className} style={{ 
      minHeight: '100vh', 
      background: '#030303', // Deep dark backdrop
      color: '#ffffff',
      overflow: 'hidden',
      selection: { background: '#f97316', color: 'white' }
    }}>
      
      {/* Background Glows and Fullscreen 3D Canvas */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, background: '#030303' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '80vw', height: '60vh', background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vh', background: 'radial-gradient(circle, rgba(124,58,237,0.06) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
        
        {/* The global background 3D scene */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.6, pointerEvents: 'none' }}>
          <Canvas camera={{ position: [0, 0, 15], fov: 60 }} gl={{ alpha: true, antialias: false }}>
             <FloatingBackground />
          </Canvas>
        </div>
      </div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(3, 3, 3, 0.6)', backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 32px',
          height: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #f97316, #ea580c)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(249,115,22,0.4)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className={playfair.className} style={{ fontWeight: 700, fontSize: 24, letterSpacing: '0.02em', color: '#fff' }}>Klyst</span>
          </div>
          
          <div style={{ display: 'flex', gap: 40, fontSize: 13, fontWeight: 500, color: '#a1a1aa', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <a href="#platform" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#a1a1aa'}>Platform</a>
            <a href="#performance" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#a1a1aa'}>Insights</a>
            <a href="#membership" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#fff'} onMouseOut={e => e.target.style.color = '#a1a1aa'}>Pricing</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/auth/login" style={{
              fontSize: 14, fontWeight: 500, color: '#e4e4e7', textDecoration: 'none', transition: 'color 0.2s',
            }}>
              Login
            </Link>
            <Link href="/auth/signup" style={{
              padding: '10px 24px', borderRadius: 100, fontWeight: 600, fontSize: 13,
              background: 'rgba(255,255,255,0.05)', color: '#fff', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
              transition: 'all 0.3s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#f97316'; e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.boxShadow = '0 0 20px rgba(249,115,22,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}>
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ====== HERO ====== */}
      <section style={{ position: 'relative', paddingTop: 180, paddingBottom: 100, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        
        {/* Trusted Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 100, marginBottom: 40,
            background: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)',
            fontSize: 11, fontWeight: 600, color: '#f97316', letterSpacing: '0.1em', textTransform: 'uppercase'
          }}>
          ✦ Elite performance marketers&apos; AI
        </motion.div>

        <motion.h1 style={{ opacity, scale }} className={playfair.className}>
          <div style={{
            fontSize: 'clamp(56px, 8vw, 96px)', fontWeight: 500,
            lineHeight: 1.05, color: '#ffffff', textAlign: 'center',
            letterSpacing: '-0.02em', maxWidth: 1000, margin: '0 auto',
          }}>
            Master the Science of <br/>
            <span style={{ color: '#f97316', fontStyle: 'italic' }}>Ad Creatives.</span>
          </div>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
          style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: '#a1a1aa',
            lineHeight: 1.6, maxWidth: 600, margin: '32px auto 48px', textAlign: 'center', fontWeight: 300
          }}>
          The AI-powered workspace where marketers chat to create, iterate on, and analyze their best-performing ads. Stop guessing, start scaling.
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/auth/signup" style={{
            padding: '16px 36px', borderRadius: 100, fontWeight: 600, fontSize: 15,
            background: '#fff', color: '#030303', textDecoration: 'none',
            boxShadow: '0 0 40px rgba(255,255,255,0.1)', transition: 'all 0.3s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            Start Free Trial
          </Link>
          <a href="#platform" style={{
            display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, fontWeight: 500,
            color: '#e4e4e7', textDecoration: 'none', transition: 'opacity 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
          onMouseOut={e => e.currentTarget.style.opacity = '1'}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </div>
            Explore the Platform
          </a>
        </motion.div>

        {/* 3D Dashboard Abstract Representation */}
        <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.8 }}
          style={{
            marginTop: 100, width: '100%', maxWidth: 1000, height: 500,
            position: 'relative', perspective: 1000
          }}>
          
          {/* Real 3D Canvas bridging the hero */}
          <div style={{ position: 'absolute', top: -150, left: 0, right: 0, height: 800, zIndex: -1, pointerEvents: 'none', opacity: 0.8 }}>
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
              <HeroCore />
            </Canvas>
          </div>

          {/* Glass Mockup Wrapper */}
          <div style={{
            background: 'rgba(20, 20, 20, 0.4)', backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24,
            height: '100%', width: '100%', overflow: 'hidden',
            boxShadow: '0 30px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Window controls */}
            <div style={{ height: 40, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }}/>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }}/>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }}/>
            </div>
            
            <div style={{ padding: 40, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, height: '100%' }}>
              {/* Fake Chart */}
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)', padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: '#a1a1aa', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>ROAS Optimization</div>
                <div style={{ fontSize: 48, fontWeight: 300, color: '#fff', marginBottom: 40 }}>3.4x <span style={{ fontSize: 16, color: '#f97316' }}>↗ +18% vs last week</span></div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
                  {[40, 60, 45, 80, 50, 90, 65].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(180deg, rgba(249,115,22,0.6) 0%, rgba(249,115,22,0) 100%)', borderRadius: '8px 8px 0 0' }} />
                  ))}
                </div>
              </div>
              
              {/* Fake Stats */}
              <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 24 }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)', padding: 32 }}>
                  <div style={{ color: '#a1a1aa', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Click-Through Rate (CTR)</div>
                  <div style={{ fontSize: 36, fontWeight: 300, color: '#fff', marginBottom: 16 }}>2.8%</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{ width: '68%', height: '100%', background: '#7c3aed', borderRadius: 2, boxShadow: '0 0 10px #7c3aed' }} />
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)', padding: 32 }}>
                   <div style={{ color: '#a1a1aa', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Conversion Rate</div>
                  <div style={{ fontSize: 36, fontWeight: 300, color: '#fff', marginBottom: 16 }}>6.5%</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{ width: '34%', height: '100%', background: '#f97316', borderRadius: 2, boxShadow: '0 0 10px #f97316' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </section>

      <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0) 100%)', width: '100%' }} />

      {/* ====== THE CRAFT (3D Cards) ====== */}
      <section id="platform" style={{ padding: '160px 32px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 100 }}>
            <h2 className={playfair.className} style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 500, color: '#fff', marginBottom: 24, lineHeight: 1.1 }}>
              The Platform
            </h2>
            <p style={{ fontSize: 18, color: '#a1a1aa', maxWidth: 600, margin: '0 auto', fontWeight: 300, lineHeight: 1.6 }}>
              Our engine decodes historical campaign data, synthesizes high-converting ad variants, and optimizes for ROAS.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { id: 'diamond', title: 'Data Ingestion', desc: 'Sync securely with Meta, Google, and TikTok to identify precisely which historical hooks and headlines drove the best ROAS.' },
              { id: 'globe', title: 'Conversational Generation', desc: 'Chat with your AI ad strategist to generate variations of ad copy, UGC scripts, and briefs tailored to your audience.' },
              { id: 'pyramid', title: 'Continuous Optimization', desc: 'The feedback loop tracks which generated variants excel once live, constantly learning your unique brand formula over time.' }
            ].map((feature, i) => (
              <div key={i} style={{
                background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)',
                borderRadius: 24, border: '1px solid rgba(255,255,255,0.03)',
                padding: '40px 32px', position: 'relative', overflow: 'hidden',
                transition: 'transform 0.4s, background 0.4s', cursor: 'default'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.background = 'rgba(20, 20, 20, 0.6)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(15, 15, 15, 0.4)'; }}>
                
                {/* 3D Canvas Container */}
                <div style={{ height: 200, width: '100%', marginBottom: 32, position: 'relative', zIndex: 1, background: 'radial-gradient(circle, rgba(249,115,22,0.03) 0%, rgba(0,0,0,0) 70%)', borderRadius: 16 }}>
                  <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <FeatureAsset type={feature.id} />
                  </Canvas>
                </div>

                <h3 className={playfair.className} style={{ fontSize: 28, color: '#fff', marginBottom: 16, fontWeight: 500 }}>{feature.title}</h3>
                <p style={{ fontSize: 15, color: '#a1a1aa', lineHeight: 1.6, fontWeight: 300 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== PERFORMANCE ====== */}
      <section id="performance" style={{ position: 'relative', zIndex: 1, padding: '160px 32px', background: '#080808', borderTop: '1px solid rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, alignItems: 'center' }}>
          
          <div>
            <h2 className={playfair.className} style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 500, color: '#fff', marginBottom: 24, lineHeight: 1.1 }}>
              Creative Strategy Meets <br/>
              <span style={{ color: '#7c3aed', fontStyle: 'italic' }}>Data.</span>
            </h2>
            <p style={{ fontSize: 18, color: '#a1a1aa', maxWidth: 500, fontWeight: 300, lineHeight: 1.6, marginBottom: 48 }}>
              Experience the future of media buying with an AI that plans, writes, and analyzes at human-level strategic depth.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {[
                { title: 'Conversational Ad Creation', desc: 'Direct your AI sidekick to draft campaigns, test angles, and prepare final creative briefs through simple chat.' },
                { title: 'Instant Data Insights', desc: 'Ask natural-language questions about your current live campaigns and see instant charts, recommendations, and anomaly alerts.' },
                { title: 'Seamless Integrations', desc: 'One-click connections to Meta, TikTok Ads, Google Ads, and Shopify for a single source of truth.' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 20 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0, marginTop: 4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 8 }}>{item.title}</h4>
                    <p style={{ fontSize: 15, color: '#a1a1aa', lineHeight: 1.6 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: 'relative', height: 600, width: '100%', borderRadius: 24, background: 'linear-gradient(135deg, rgba(20,20,20,0.8), rgba(5,5,5,1))', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
             {/* 3D Abstract Architecture */}
             <Canvas camera={{ position: [5, 5, 5], fov: 40 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-5, 0, -5]} intensity={2} color="#f97316" />
                <pointLight position={[0, -5, 5]} intensity={2} color="#7c3aed" />
                
                <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                  <Center>
                    <group>
                      {[...Array(20)].map((_, i) => (
                        <mesh key={i} position={[Math.sin(i)*3, (i*0.3)-3, Math.cos(i)*3]} rotation={[0, i*0.5, 0]}>
                          <boxGeometry args={[2, 0.1, 0.5]} />
                          <meshPhysicalMaterial color="#111" metalness={1} roughness={0.1} clearcoat={1} emissive={i%3===0 ? '#f97316' : '#111'} emissiveIntensity={0.5} />
                        </mesh>
                      ))}
                    </group>
                  </Center>
                </Float>
                <Environment preset="city" />
             </Canvas>
          </div>

        </div>
      </section>

      {/* ====== TESTIMONIAL ====== */}
      <section style={{ position: 'relative', zIndex: 1, padding: '120px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ color: '#7c3aed', fontSize: 48, fontFamily: 'serif', lineHeight: 0.5, marginBottom: 24 }}>&ldquo;</div>
          <h3 className={playfair.className} style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 500, color: '#fff', fontStyle: 'italic', lineHeight: 1.4, marginBottom: 40 }}>
            Instead of spending hours in Figma and Ad Managers, I just chat with Klyst. Our team launched 10 variations in minutes, and our CPA dropped by 30%.
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 20, marginBottom: 16 }}>
              JW
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Jessica Wade</div>
            <div style={{ fontSize: 13, color: '#a1a1aa' }}>Head of Growth, Lumina Skincare</div>
          </div>
        </div>
      </section>

      {/* ====== MEMBERSHIP ====== */}
      <section id="membership" style={{ position: 'relative', zIndex: 1, padding: '100px 32px 160px' }}>
        
        {/* Glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(124,58,237,0.03) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 80, position: 'relative' }}>
            
            {/* 3D Premium Emblem */}
            <div style={{ position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, zIndex: -1, opacity: 0.8, pointerEvents: 'none' }}>
              <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <MembershipEmblem />
              </Canvas>
            </div>

            <h2 className={playfair.className} style={{ fontSize: 'clamp(40px, 5vw, 56px)', fontWeight: 500, color: '#fff', marginBottom: 16, lineHeight: 1.1 }}>
              Workspace Plans
            </h2>
            <p style={{ fontSize: 16, color: '#a1a1aa', fontWeight: 300 }}>Select the level of intelligence for your brand.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(340px, 1.2fr)', gap: 32, alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Initiate Tier */}
            <div style={{
              background: 'rgba(15, 15, 15, 0.4)', backdropFilter: 'blur(20px)',
              borderRadius: 24, border: '1px solid rgba(255,255,255,0.03)',
              padding: 48, display: 'flex', flexDirection: 'column'
            }}>
              <h3 className={playfair.className} style={{ fontSize: 28, color: '#fff', marginBottom: 8, fontWeight: 500 }}>Growth</h3>
              <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 32 }}>Single brand workspace ideal for boutique eCommerce owners.</p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 40 }}>
                <span style={{ fontSize: 48, fontWeight: 300, color: '#fff' }}>$199</span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>/ month</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48, flex: 1 }}>
                {['Single Brand Workspace', 'Meta & Google Sync', 'Standard Generative Queries', '2 User Seats'].map((f,i) => (
                   <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                     <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a1a1aa' }} />
                     <span style={{ fontSize: 14, color: '#d4d4d8' }}>{f}</span>
                   </div>
                ))}
              </div>

              <Link href="/auth/signup" style={{
                width: '100%', padding: '16px 0', borderRadius: 12, textAlign: 'center',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'all 0.2s'
              }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                Start Free Trial
              </Link>
            </div>

            {/* Sovereign Tier */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.8), rgba(10, 10, 10, 0.9))', backdropFilter: 'blur(20px)',
              borderRadius: 24, border: '1px solid rgba(124, 58, 237, 0.3)',
              boxShadow: '0 0 40px rgba(124, 58, 237, 0.1), inset 0 0 20px rgba(124, 58, 237, 0.05)',
              padding: 56, display: 'flex', flexDirection: 'column', position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: -1, left: '20%', right: '20%', height: 1, background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <h3 className={playfair.className} style={{ fontSize: 36, color: '#fff', fontWeight: 500 }}>Sovereignty</h3>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#7c3aed"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"/></svg>
              </div>
              <p style={{ fontSize: 14, color: '#7c3aed', marginBottom: 32, fontWeight: 500 }}>Agency and enterprise suite.</p>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 40 }}>
                <span style={{ fontSize: 56, fontWeight: 300, color: '#fff', lineHeight: 1 }}>$599</span>
                <span style={{ fontSize: 14, color: '#6b7280' }}>/ month</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48, flex: 1 }}>
                {['Unlimited Workspaces', 'Multi-Platform Ingestion', 'Unlimited Generative Intelligence', 'Custom AI Voice Training'].map((f,i) => (
                   <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                     <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 10px #7c3aed' }} />
                     <span style={{ fontSize: 15, color: '#fff' }}>{f}</span>
                   </div>
                ))}
              </div>

              <Link href="/auth/signup" style={{
                width: '100%', padding: '18px 0', borderRadius: 12, textAlign: 'center',
                background: '#7c3aed', border: 'none',
                color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)'
              }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                Start Free Trial
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '64px 32px', borderTop: '1px solid rgba(255,255,255,0.05)',
        background: '#030303'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'linear-gradient(135deg, #f97316, #ea580c)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className={playfair.className} style={{ fontWeight: 700, fontSize: 18, color: '#fff' }}>Klyst</span>
          </div>

          <div style={{ display: 'flex', gap: 32, fontSize: 13, color: '#6b7280' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Support</a>
          </div>

          <p style={{ fontSize: 13, color: '#6b7280' }}>
            © {new Date().getFullYear()} Klyst. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
