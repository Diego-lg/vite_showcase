"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Plane, OrbitControls, Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";

function FluidPlane({ position, rotation }) {
  const meshRef = useRef();
  const { viewport } = useThree();

  const texture = useTexture("/xamples/za.jpg");

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTexture: { value: texture },
    }),
    [texture]
  );

  useFrame(({ clock }) => {
    if (meshRef.current && meshRef.current.material) {
      meshRef.current.material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    //	Simplex 3D Noise 
    //	by Ian McEwan, Ashima Arts
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    
    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
      // First corner
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
    
      // Other corners
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
    
      //  x0 = x0 - 0. + 0.0 * C 
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    
      // Permutations
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    
      // Gradients
      // ( N*N points uniformly over a square, mapped onto an octahedron.)
      float n_ = 1.0/7.0; // N=7
      vec3  ns = n_ * D.wyz - D.xzx;
    
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)
    
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
    
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
    
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
    
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
    
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
    
      // Normalise gradients
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
    
      // Mix final noise value
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      float noiseFreq = 1.5;
      float noiseAmp = 0.2;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
      pos.z += snoise(noisePos) * noiseAmp;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform sampler2D uTexture;
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      vec4 texture = texture2D(uTexture, uv);
      float gray = dot(texture.rgb, vec3(0.299, 0.587, 0.114));
      float noise = fract(sin(dot(uv, vec2(12.9898, 78.233) * uTime)) * 43758.5453);
      float finalGray = gray + noise * 0.6;
      gl_FragColor = vec4(vec3(finalGray), 0.7);  // Pure black and white with transparency
    }
  `;

  return (
    <Plane
      ref={meshRef}
      args={[viewport.width, viewport.height, 64, 64]}
      position={position}
      rotation={rotation}
    >
      <shaderMaterial
        attach="material"
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
      />
    </Plane>
  );
}

function Scene() {
  return (
    <>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
      <FluidPlane position={[0, 0, 0]} rotation={[0, 0, 0]} />
    </>
  );
}

export default function FluidArtHero() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas camera={{ position: [0, 0, 2] }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4 z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-wide leading-tight drop-shadow-lg text-white">
            Monochrome Mastery
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-lg mx-auto drop-shadow-md text-gray-300">
            Explore the power of contrast in our black and white art collection.
          </p>
          <Button
            variant="outline"
            size="lg"
            className="bg-white text-black hover:bg-gray-200 hover:text-gray-800 transition-colors duration-300 transform hover:scale-105 shadow-lg"
          >
            Discover Now
          </Button>
        </div>
      </div>
    </div>
  );
}
