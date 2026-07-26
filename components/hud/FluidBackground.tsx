"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * MoonFluxx Galaxy Background — Pitch-black OLED void
 * with flowing indigo/violet nebula clouds and star particles.
 * Mouse-reactive: nebula warps gently toward cursor.
 */
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uRes;

  vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
  vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
  vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
    vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
    vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
    vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
    m=m*m;m=m*m;
    vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
    m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
    vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
    return 130.*dot(m,g);
  }

  void main() {
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    vec2 p = vUv * asp;
    float T = uTime * 0.03;

    vec2 m = uMouse * asp;
    float md = length(p - m);
    float mforce = exp(-md * 2.0) * 0.5;

    float n1 = snoise(p * 1.2 + vec2(T * 0.5, -T * 0.3));
    float n2 = snoise(p * 2.4 - vec2(T * 0.4, T * 0.6) + n1 * 0.5);
    float n3 = snoise(p * 0.6 + vec2(-T * 0.2, T * 0.4) + n2 * 0.3 + mforce);
    float flow = n1 * 0.4 + n2 * 0.3 + n3 * 0.5 + mforce * 0.8;

    /* soft nebula bands — much subtler than liquid veins */
    float nebula = sin(flow * 2.0 + T * 1.5) * 0.5 + 0.5;
    float band = smoothstep(0.35, 0.85, nebula);
    float bright = pow(smoothstep(0.7, 0.95, nebula), 3.0);

    /* Galaxy palette: pitch black void → deep indigo → violet → teal whispers */
    vec3 voidC   = vec3(0.0, 0.0, 0.0);           /* true OLED black */
    vec3 deepInk = vec3(0.02, 0.02, 0.08);        /* barely-there blue */
    vec3 indigo  = vec3(0.15, 0.12, 0.40);         /* #261F66 — nebula core */
    vec3 violet  = vec3(0.28, 0.20, 0.55);         /* #472E8C — nebula bright */
    vec3 teal    = vec3(0.05, 0.18, 0.20);          /* cosmic teal accent */

    vec3 col = voidC;
    col = mix(col, deepInk, smoothstep(0.2, 0.8, n1) * band * 0.6);
    col = mix(col, indigo, band * 0.25);
    col = mix(col, teal, smoothstep(0.5, 1.0, n2) * band * 0.12);
    col = mix(col, violet, bright * 0.35);
    col += vec3(0.10, 0.08, 0.25) * mforce * 0.4; /* cursor warps indigo */

    /* heavy vignette — edges are pure black, nebula only in center */
    float vg = smoothstep(1.5, 0.2, length(vUv - 0.5) * 1.9);
    col *= vg;

    /* keep overall brightness very low — this is a background, not a lightshow */
    col *= 0.65;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function NebulaPlane() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const smooth = useRef(new THREE.Vector2(0.5, 0.5));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((state) => {
    if (!mat.current) return;
    mouse.current.set(state.pointer.x * 0.5 + 0.5, state.pointer.y * 0.5 + 0.5);
    smooth.current.lerp(mouse.current, 0.025);
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uMouse.value.copy(smooth.current);
    mat.current.uniforms.uRes.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
}

/** 3000 drifting star particles across the galaxy void */
function GalaxyStars({ count = 3000 }) {
  const points = useRef<THREE.Points>(null);
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = -1 - Math.random() * 10;
      sz[i] = 0.015 + Math.random() * 0.04;
    }
    return { positions: pos, sizes: sz };
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.z = state.clock.elapsedTime * 0.005;
    const m = points.current.material as THREE.PointsMaterial;
    m.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#FAFBFF" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/** Accent stars — fewer, brighter, indigo-tinted */
function AccentStars({ count = 80 }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 2] = -0.5 - Math.random() * 5;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.z = -state.clock.elapsedTime * 0.003;
    const m = points.current.material as THREE.PointsMaterial;
    m.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 0.8 + 1.5) * 0.2;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#818CF8" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function FluidBackground() {
  return (
    <div className="fixed inset-0 z-[-1]" style={{ background: '#000000' }}>
      <Canvas
        camera={{ fov: 60, position: [0, 0, 5] }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <NebulaPlane />
        <GalaxyStars />
        <AccentStars />
      </Canvas>
    </div>
  );
}
