"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * MoonFluxx liquid shader — same DNA as the landing page hero.
 * Layered simplex noise flowing in the brand palette
 * (void → violet → electric → ice) with soft mouse attraction.
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
    float T = uTime * 0.05;

    vec2 m = uMouse * asp;
    float md = length(p - m);
    float mforce = exp(-md * 2.4) * 0.8;

    float n1 = snoise(p * 1.4 + vec2(T * 0.7, -T * 0.4));
    float n2 = snoise(p * 2.8 - vec2(T * 0.5, T * 0.8) + n1 * 0.6);
    float n3 = snoise(p * 0.7 + vec2(-T * 0.3, T * 0.55) + n2 * 0.35 + mforce);
    float flow = n1 * 0.5 + n2 * 0.3 + n3 * 0.6 + mforce * 1.2;

    /* tighten the bands into thin liquid veins */
    float vein = sin(flow * 3.1416 + T * 2.0) * 0.5 + 0.5;
    float band = smoothstep(0.42, 0.92, vein);
    float filament = pow(smoothstep(0.72, 0.98, vein), 2.4); /* razor-thin molten highlights */

    /* obsidian & liquid gold — warm black void, molten veins, whisper of violet */
    vec3 voidC    = vec3(0.006, 0.005, 0.004);
    vec3 goldDeep = vec3(0.28, 0.17, 0.03);
    vec3 gold     = vec3(0.62, 0.42, 0.10);
    vec3 champagne= vec3(0.92, 0.80, 0.52);
    vec3 violet   = vec3(0.14, 0.06, 0.24); /* secondary whisper only */

    vec3 col = voidC;
    col = mix(col, violet, smoothstep(0.3, 1.0, n1) * band * 0.16);
    col = mix(col, goldDeep, band * 0.55);
    col = mix(col, gold, smoothstep(0.45, 1.0, n2) * band * 0.5);
    col = mix(col, champagne, filament * 0.85);
    col += vec3(0.85, 0.66, 0.30) * mforce * 0.45; /* cursor warms into gold */

    /* vignette — keep edges pure black so UI panels pop */
    float vg = smoothstep(1.35, 0.25, length(vUv - 0.5) * 1.7);
    col *= vg;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function LiquidPlane() {
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
    smooth.current.lerp(mouse.current, 0.035);
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

/** Sparse drifting star-dust on top of the liquid */
function StarDust({ count = 240 }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = -2 - Math.random() * 6;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.z = state.clock.elapsedTime * 0.008;
    const m = points.current.material as THREE.PointsMaterial;
    m.opacity = 0.35 + Math.sin(state.clock.elapsedTime * 0.6) * 0.12;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="#f5e6c8" transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

export default function FluidBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-mf-bg-primary">
      <Canvas
        camera={{ fov: 60, position: [0, 0, 5] }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <LiquidPlane />
        <StarDust />
      </Canvas>
      {/* gilded star-flare accent, upper right — brand mark echo */}
      <div className="absolute top-[12%] right-[14%] w-[1px] h-40 opacity-50 pointer-events-none hidden lg:block" style={{ background: "linear-gradient(180deg, transparent, #e8b84b, #fffef6, #e8b84b, transparent)", boxShadow: "0 0 14px 2px rgba(232,184,75,0.7)" }} />
      <div className="absolute top-[12%] right-[14%] translate-y-20 -translate-x-14 w-28 h-[1px] opacity-50 pointer-events-none hidden lg:block" style={{ background: "linear-gradient(90deg, transparent, #e8b84b, #fffef6, #e8b84b, transparent)", boxShadow: "0 0 14px 2px rgba(232,184,75,0.7)" }} />
    </div>
  );
}
