// ----------------------------------------------
// src/App.jsx  –  "Brutal Luxury" Gladiator Studio
// ----------------------------------------------
import React, { 
  Suspense, useState, useEffect, useRef, useMemo, 
  createContext, useContext 
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows, useEnvironment } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger)

// ====================== GLOBAL STYLES ======================
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:100vw; overflow-x:hidden; position:relative; background:#0a0a0a; font-family:'Space Mono', monospace; color:#fff; }
    #root { position:relative; width:100%; }
  `}</style>
)

// ====================== SCROLL CONTEXT ======================
const ScrollContext = createContext(0)
const ScrollProvider = ({ children, lenis }) => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    if (!lenis.current) return
    const update = ({ scroll, limit }) => {
      setProgress(scroll / (limit - window.innerHeight) || 0)
    }
    lenis.current.on('scroll', update)
    return () => lenis.current.off('scroll', update)
  }, [lenis])
  return <ScrollContext.Provider value={progress}>{children}</ScrollContext.Provider>
}
const useScrollProgress = () => useContext(ScrollContext)

// ====================== i18n MANUAL ======================
const translations = {
  en: {
    stylesTitle: "Our Styles",
    realism: { name: "Realism", desc: "Hyper‑realistic portraits & nature." },
    blackwork: { name: "Blackwork", desc: "Geometric patterns & heavy contrast." },
    traditional: { name: "Traditional", desc: "Bold lines & classic sailor motives." },
    mastersTitle: "Masters",
    mapTitle: "Find Us",
    mapAddress: "Rybná 650/1, 110 00 Staré Město, Prague"
  },
  cz: {
    stylesTitle: "Naše Styly",
    realism: { name: "Realismus", desc: "Hyperrealistické portréty a příroda." },
    blackwork: { name: "Blackwork", desc: "Geometrické vzory a silný kontrast." },
    traditional: { name: "Tradiční", desc: "Silné linie a klasické námořnické motivy." },
    mastersTitle: "Mistři",
    mapTitle: "Najdete nás",
    mapAddress: "Rybná 650/1, 110 00 Staré Město, Praha"
  },
  ru: {
    stylesTitle: "Наши Стили",
    realism: { name: "Реализм", desc: "Гиперреалистичные портреты и природа." },
    blackwork: { name: "Блэкворк", desc: "Геометрические узоры и глубокий контраст." },
    traditional: { name: "Традишнл", desc: "Жирные линии и классические морские сюжеты." },
    mastersTitle: "Мастера",
    mapTitle: "Найти нас",
    mapAddress: "Рыбна 650/1, 110 00 Старе Место, Прага"
  }
}

const useLanguage = () => {
  const [lang, setLang] = useState('en')
  const t = (key) => {
    const keys = key.split('.')
    let val = translations[lang]
    keys.forEach(k => val = val?.[k])
    return val || key
  }
  return { lang, setLang, t }
}

// ====================== PRELOADER ======================
const Preloader = ({ onLoaded }) => {
  const container = useRef()
  const text = useRef()

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(container.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 1.2,
          ease: 'power4.inOut',
          onComplete: onLoaded,
        })
      }
    })
    tl.fromTo(text.current,
      { opacity: 0, scale: 1.2, filter: 'blur(20px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power3.out' }
    )
    .to(text.current, {
      keyframes: [
        { textShadow: '-4px 0 red, 4px 0 blue', duration: 0.1 },
        { textShadow: '0 0 transparent', duration: 0.1 },
        { textShadow: '-4px 0 red, 4px 0 blue', duration: 0.1 },
      ],
      duration: 0.4,
    }, '+=0.3')
  }, [])

  return (
    <div ref={container} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      clipPath: 'inset(0% 0% 0% 0%)'
    }}>
      <h1 ref={text} style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(3rem, 12vw, 8rem)',
        letterSpacing: '0.2em', color: '#f0f0f0', textTransform: 'uppercase'
      }}>Gladiator</h1>
    </div>
  )
}

// ====================== NAVBAR ======================
const Navbar = ({ lang, setLang }) => (
  <nav style={{
    position: 'fixed', top: 0, left: 0, width: '100%',
    padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', background: 'rgba(10,10,10,0.8)',
    backdropFilter: 'blur(10px)', zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.05)', pointerEvents: 'auto'
  }}>
    <div style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.4rem', letterSpacing: '0.15em', color: '#fff'
    }}>⚔️ GLADIATOR</div>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {['en', 'cz', 'ru'].map(lng => (
        <button key={lng}
          onClick={() => setLang(lng)}
          style={{
            background: lang === lng ? '#ff2d2d' : 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: lang === lng ? 'white' : '#aaa',
            padding: '0.3rem 0.8rem',
            fontFamily: 'Space Mono, monospace',
            fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >{lng.toUpperCase()}</button>
      ))}
    </div>
  </nav>
)

// ====================== 3D BLUEBERRY ======================
const Blob = () => {
  const meshRef = useRef()
  const envMap = useEnvironment({ preset: 'city' })
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uEnvMap: { value: envMap },
  }), [envMap])

  const vertexShader = /* glsl */`
    uniform float uTime;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    void main() {
      float noise = snoise(position * 2.5 + uTime * 0.5);
      float noise2 = snoise(position * 4.0 - uTime * 0.3);
      vec3 newPos = position + normal * (noise * 0.35 + noise2 * 0.15);
      vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
      vWorldPos = worldPos.xyz;
      vNormal = normalize(normalMatrix * (normal + vec3(noise * 0.6, noise2 * 0.3, 0.0)));
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `
  const fragmentShader = /* glsl */`
    uniform samplerCube uEnvMap;
    varying vec3 vWorldPos;
    varying vec3 vNormal;
    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      vec3 fdx = dFdx(vWorldPos);
      vec3 fdy = dFdy(vWorldPos);
      vec3 normal = normalize(cross(fdx, fdy));
      vec3 reflectDir = reflect(-viewDir, normal);
      vec4 envColor = textureCube(uEnvMap, reflectDir);
      gl_FragColor = vec4(envColor.rgb * 1.1, 1.0);
    }
  `

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.8, 128, 128]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

const Needles = () => {
  const Needle = ({ position, rotation, scale }) => {
    const group = useRef()
    useFrame((state) => {
      group.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.002
      group.current.rotation.z += 0.005
    })
    return (
      <group ref={group} position={position} rotation={rotation} scale={scale}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <coneGeometry args={[0.03, 0.2, 8]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0, -0.2, 0.1]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#111" metalness={0.3} roughness={0.4} emissive="#110000" emissiveIntensity={0.5} />
        </mesh>
      </group>
    )
  }

  const needles = useMemo(() => {
    const arr = []
    for (let i = 0; i < 35; i++) {
      const angle = (i / 35) * Math.PI * 2
      const radius = 2.8 + Math.random() * 1.5
      arr.push({
        position: [Math.cos(angle) * radius, (Math.random() - 0.5) * 3.5, Math.sin(angle) * radius - 1.5],
        rotation: [0, 0, Math.random() * Math.PI],
        scale: 0.4 + Math.random() * 0.6,
        key: i
      })
    }
    return arr
  }, [])

  return (
    <group>
      {needles.map(n => <Needle key={n.key} {...n} />)}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh key={`ink-${i}`} position={[(Math.random()-0.5)*6, (Math.random()-0.5)*6, (Math.random()-0.5)*4-2]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1a0000" emissive="#330000" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

const Particles = () => {
  const count = 2500
  const meshRef = useRef()

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 5 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.asin((Math.random() * 2) - 1)
      pos[i*3] = Math.cos(theta) * Math.cos(phi) * radius
      pos[i*3+1] = Math.sin(phi) * radius * 0.8
      pos[i*3+2] = Math.sin(theta) * Math.cos(phi) * radius
      col[i*3] = 0.05
      col[i*3+1] = 0.01
      col[i*3+2] = 0.02
    }
    return [pos, col]
  }, [])

  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.03
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
  })

  return (
    <>
      <pointLight position={[0, -2, -6]} intensity={3} color="#ff1a1a" distance={20} />
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.025} vertexColors blending={THREE.AdditiveBlending}
          depthWrite={false} transparent opacity={0.9} />
      </points>
    </>
  )
}

const Experience = () => {
  const progress = useScrollProgress()
  const { camera } = useThree()

  const cameraPath = useMemo(() => ({
    start: { pos: [0, 0.2, 8], look: [0, 0, 0] },
    end:   { pos: [0, -3, 2.5], look: [0, -0.5, 0] }
  }), [])

  useFrame(() => {
    gsap.to(camera.position, {
      x: cameraPath.start.pos[0] * (1 - progress) + cameraPath.end.pos[0] * progress,
      y: cameraPath.start.pos[1] * (1 - progress) + cameraPath.end.pos[1] * progress,
      z: cameraPath.start.pos[2] * (1 - progress) + cameraPath.end.pos[2] * progress,
      duration: 0.5, overwrite: true,
    })
    camera.lookAt(
      cameraPath.start.look[0] * (1 - progress) + cameraPath.end.look[0] * progress,
      cameraPath.start.look[1] * (1 - progress) + cameraPath.end.look[1] * progress,
      cameraPath.start.look[2] * (1 - progress) + cameraPath.end.look[2] * progress,
    )
  })

  return (
    <>
      <Blob />
      <Needles />
      <Particles />
    </>
  )
}

// ====================== CONTENT SECTIONS ======================
const Masters = ({ t }) => {
  const works = [
    { src: '/img/realism-1.jpg', artist: 'Viktor Valkov' },
    { src: '/img/blackwork-1.jpg', artist: 'Anna Šeredová' },
    { src: '/img/traditional-1.jpg', artist: 'Oldřich Hladík' },
  ]
  const containerRef = useRef()

  useEffect(() => {
    const cards = containerRef.current.querySelectorAll('.master-card')
    cards.forEach(card => {
      gsap.fromTo(card,
        { scale: 0.85, filter: 'brightness(0.6)' },
        { scale: 1, filter: 'brightness(1)', scrollTrigger: { trigger: card, start: 'top 80%', end: 'top 20%', scrub: 1.2 } }
      )
    })
  }, [])

  return (
    <section ref={containerRef} style={{ padding: '10vh 5vw', pointerEvents: 'auto' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '2rem', letterSpacing: '0.1em' }}>{t('mastersTitle')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {works.map((w, i) => (
          <div key={i} className="master-card"
            style={{
              height: '400px', backgroundImage: `url(${w.src})`, backgroundSize: 'cover', backgroundPosition: 'center',
              borderRadius: '8px', position: 'relative', overflow: 'hidden'
            }}>
            <div style={{
              position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000, transparent)',
              display: 'flex', alignItems: 'flex-end', padding: '1.5rem', fontSize: '1.3rem'
            }}>
              <span>{w.artist}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const MapSection = ({ t }) => {
  const markerRef = useRef()
  useFrame(({ clock }) => {
    if (markerRef.current)
      markerRef.current.style.transform = `translate(-50%, -50%) scale(${1 + Math.sin(clock.elapsedTime * 3) * 0.08})`
  })

  return (
    <section style={{ padding: '10vh 5vw', pointerEvents: 'auto' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '2rem', letterSpacing: '0.1em' }}>{t('mapTitle')}</h2>
      <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
        <img src="/map-prague.png" alt="map" style={{ width: '100%', opacity: 0.4 }} />
        <div ref={markerRef} style={{
          position: 'absolute', top: '52%', left: '48%', width: 24, height: 24,
          background: '#ff2d2d', borderRadius: '50%', boxShadow: '0 0 20px #ff2d2d',
        }} />
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>{t('mapAddress')}</p>
      </div>
    </section>
  )
}

const Footer = () => (
  <footer style={{ padding: '5vh 5vw', textAlign: 'center', opacity: 0.6, pointerEvents: 'auto' }}>
    <p>© 2026 Gladiator Tattoo Studio. Rybná 650/1, Prague 1.</p>
  </footer>
)

const Sections = ({ t }) => (
  <main style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
    {/* hero space */}
    <section style={{ height: '100vh' }} />
    
    {/* styles */}
    <section style={{ padding: '10vh 5vw', pointerEvents: 'auto' }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 6vw, 4rem)', marginBottom: '2rem', letterSpacing: '0.1em' }}>{t('stylesTitle')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        {['realism', 'blackwork', 'traditional'].map(style => (
          <div key={style} style={{
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem',
            transition: 'transform 0.4s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03) translateY(-5px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <h3>{t(`${style}.name`)}</h3>
            <p style={{ opacity: 0.8 }}>{t(`${style}.desc`)}</p>
          </div>
        ))}
      </div>
    </section>

    <Masters t={t} />
    <MapSection t={t} />
    <Footer />
  </main>
)

// ====================== APP ======================
export default function App() {
  const [loading, setLoading] = useState(true)
  const lenisRef = useRef()
  const { lang, setLang, t } = useLanguage()

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis
    function raf(time) {
      lenis.raf(time)
      ScrollTrigger.update()
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  return (
    <>
      <GlobalStyles />
      <ScrollProvider lenis={lenisRef}>
        {loading && <Preloader onLoaded={() => setLoading(false)} />}
        <Navbar lang={lang} setLang={setLang} />
        <Sections t={t} />
        <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
          <Canvas
            camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 50 }}
            dpr={[1, 2]}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 10, 40]} />
            <ambientLight intensity={0.5} />
            <spotLight position={[5, 8, 10]} angle={0.3} intensity={2} color="#ff2d2d" castShadow />
            <spotLight position={[-5, 2, -5]} angle={0.4} intensity={1.5} color="#aaaaff" />
            <Environment preset="city" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={10} blur={3} far={10} />
            {!loading && <Experience />}
          </Canvas>
        </div>
      </ScrollProvider>
    </>
  )
}
