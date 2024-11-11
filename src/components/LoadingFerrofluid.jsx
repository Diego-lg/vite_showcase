"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, shaderMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

const FerrofluidMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.0, 0.0, 0.0),
    scale: 1.0,
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float time;
  uniform float scale;
  
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
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;
  
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
  
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
    vNormal = normal;
    vPosition = position;
    
    // Create multiple layers of noise
    float noise1 = snoise(vec3(position.x * 1.5, position.y * 1.5 + time * 0.4, position.z * 1.5));
    float noise2 = snoise(vec3(position.x * 3.0 - time * 0.15, position.y * 3.0, position.z * 3.0 + time * 0.25));
    float noise3 = snoise(vec3(position.x * 6.0 + time * 0.08, position.y * 6.0 - time * 0.15, position.z * 6.0));
    float noise4 = snoise(vec3(position.x * 12.0 - time * 0.1, position.y * 12.0 + time * 0.2, position.z * 12.0 - time * 0.15));
    
    // Combine noise layers
    float combinedNoise = noise1 * 0.5 + noise2 * 0.25 + noise3 * 0.15 + noise4 * 0.1;
    
    // Create dynamic spike effect
    float spikeIntensity = (sin(time * 1.5) * 0.5 + 0.5) * 0.3 + 0.2;
    vec3 spikeDirection = normalize(position) * pow(abs(combinedNoise), 2.0) * spikeIntensity;
    
    // Add wobble effect
    float wobble = sin(time * 2.0 + position.y * 4.0) * 0.03;
    
    // Create ripple effect
    float ripple = sin(length(position.xy) * 10.0 - time * 5.0) * 0.02;
    
    // Apply noise, spike effect, wobble, and ripple to position
    vec3 newPosition = position + normal * (combinedNoise * 0.3 + wobble + ripple) + spikeDirection;
    
    // Smooth out sharp edges (surface tension-like effect)
    newPosition = mix(position, newPosition, smoothstep(0.0, 0.2, length(position)));
    
    // Apply scale
    newPosition *= scale;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform vec3 color;
  uniform float time;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  void main() {
    vec3 light = normalize(vec3(0.5, 0.2, 1.0));
    float diffuse = max(0.0, dot(vNormal, light));
    float specular = pow(max(0.0, dot(reflect(-light, vNormal), vec3(0.0, 0.0, 1.0))), 32.0);
    
    // Create dynamic color variations
    vec3 baseColor = rgb2hsv(color);
    baseColor.x = fract(baseColor.x + time * 0.1); // Rotate hue over time
    baseColor = hsv2rgb(baseColor);
    
    float colorNoise = sin(vPosition.x * 10.0 + vPosition.y * 8.0 + vPosition.z * 6.0 + time * 2.0) * 0.5 + 0.5;
    vec3 tintColor = mix(baseColor, vec3(0.1, 0.1, 0.3), colorNoise * 0.3);
    
    // Add iridescence effect
    float fresnelTerm = pow(1.0 - max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
    vec3 iridescence = vec3(sin(fresnelTerm * 5.0 + time), sin(fresnelTerm * 5.0 + time * 1.1 + 2.0), sin(fresnelTerm * 5.0 + time * 1.2 + 4.0)) * 0.5 + 0.5;
    
    vec3 finalColor = tintColor + diffuse * 0.5 + specular * 0.2 + iridescence * 0.1;
    gl_FragColor = vec4(finalColor, 1.0);
  }
  `
);

function DynamicFerrofluid() {
  const mesh = useRef();
  const [ferrofluidMaterial] = useMemo(() => {
    return [new FerrofluidMaterial()];
  }, []);

  useFrame((state) => {
    const { clock } = state;
    if (mesh.current) {
      mesh.current.material.uniforms.time.value = clock.getElapsedTime();
      mesh.current.rotation.y = clock.getElapsedTime() * 0.1;

      // Update color based on time
      const hue = (Math.sin(clock.getElapsedTime() * 0.1) + 1) / 2;
      mesh.current.material.uniforms.color.value.setHSL(hue, 0.5, 0.5);
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.5, 256, 256]} />
      <primitive
        object={ferrofluidMaterial}
        attach="material"
        color="#000033"
        scale={3}
      />
    </mesh>
  );
}

export default function Component() {
  return <DynamicFerrofluid />;
}
