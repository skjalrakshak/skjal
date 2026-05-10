(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/skjal-next/src/components/canvas/ParticleSystem.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ParticleSystem",
    ()=>ParticleSystem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/@react-three/fiber/dist/events-b389eeca.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$ScrollControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/@react-three/drei/web/ScrollControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/three/build/three.core.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
// FBO simulation relies on WebGLRenderTarget ping-ponging
// For brevity in this blueprint, we use an optimized InstancedMesh with curl noise in vertex shader
const PARTICLE_COUNT = 150000; // Scaled down for safe mobile rendering (Agent 6 & 7)
const particleVertexShader = `
uniform float uTime;
uniform float uScroll;
attribute vec3 aOffset;
attribute float aSize;

// Curl noise helpers omitted for brevity, assumed injected here

void main() {
    vec3 pos = position;
    
    // Scroll-based expansion
    float expansion = 1.0 + (uScroll * 2.0);
    
    // Apply curl noise displacement
    float time = uTime * 0.2;
    vec3 noisePos = aOffset * 0.1;
    // ... calculate curl noise ...
    vec3 curl = vec3(sin(noisePos.x + time), cos(noisePos.y + time), sin(noisePos.z + time)); // Simplified
    
    vec3 finalPos = aOffset * expansion + curl * 2.0;
    
    // Camera transform
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
}
`;
const particleFragmentShader = `
void main() {
    // Soft circle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    float alpha = smoothstep(0.5, 0.1, dist);
    gl_FragColor = vec4(1.0, 0.4, 0.0, alpha * 0.6); // Brand Orange
}
`;
function ParticleSystem() {
    _s();
    const meshRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const scroll = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$ScrollControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScroll"])();
    const [positions, sizes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ParticleSystem.useMemo": ()=>{
            const p = new Float32Array(PARTICLE_COUNT * 3);
            const s = new Float32Array(PARTICLE_COUNT);
            for(let i = 0; i < PARTICLE_COUNT; i++){
                p[i * 3] = (Math.random() - 0.5) * 40;
                p[i * 3 + 1] = (Math.random() - 0.5) * 40;
                p[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
                s[i] = Math.random() * 2.0 + 0.5;
            }
            return [
                p,
                s
            ];
        }
    }["ParticleSystem.useMemo"], []);
    const uniforms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ParticleSystem.useMemo[uniforms]": ()=>({
                uTime: {
                    value: 0
                },
                uScroll: {
                    value: 0
                }
            })
    }["ParticleSystem.useMemo[uniforms]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "ParticleSystem.useFrame": (state)=>{
            if (meshRef.current) {
                const mat = meshRef.current.material;
                mat.uniforms.uTime.value = state.clock.elapsedTime;
                if (scroll) {
                    mat.uniforms.uScroll.value = scroll.offset;
                }
                // Slow rotation
                meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            }
        }
    }["ParticleSystem.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("points", {
        ref: meshRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferGeometry", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferAttribute", {
                        attach: "attributes-position",
                        count: positions.length / 3,
                        args: [
                            positions,
                            3
                        ]
                    }, void 0, false, {
                        fileName: "[project]/skjal-next/src/components/canvas/ParticleSystem.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferAttribute", {
                        attach: "attributes-aOffset",
                        count: positions.length / 3,
                        args: [
                            positions,
                            3
                        ]
                    }, void 0, false, {
                        fileName: "[project]/skjal-next/src/components/canvas/ParticleSystem.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferAttribute", {
                        attach: "attributes-aSize",
                        count: sizes.length,
                        args: [
                            sizes,
                            1
                        ]
                    }, void 0, false, {
                        fileName: "[project]/skjal-next/src/components/canvas/ParticleSystem.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/skjal-next/src/components/canvas/ParticleSystem.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("shaderMaterial", {
                vertexShader: particleVertexShader,
                fragmentShader: particleFragmentShader,
                uniforms: uniforms,
                transparent: true,
                depthWrite: false,
                blending: __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdditiveBlending"]
            }, void 0, false, {
                fileName: "[project]/skjal-next/src/components/canvas/ParticleSystem.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skjal-next/src/components/canvas/ParticleSystem.tsx",
        lineNumber: 89,
        columnNumber: 5
    }, this);
}
_s(ParticleSystem, "jKFk6zowHwoZ5sJ7WM3IsktSG9k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$ScrollControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useScroll"],
        __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$b389eeca$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = ParticleSystem;
var _c;
__turbopack_context__.k.register(_c, "ParticleSystem");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skjal-next/src/components/canvas/Scene.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Scene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Preload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/@react-three/drei/core/Preload.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$ScrollControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/@react-three/drei/web/ScrollControls.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$src$2f$components$2f$canvas$2f$ParticleSystem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/src/components/canvas/ParticleSystem.tsx [app-client] (ecmascript)");
'use client';
;
;
;
;
function Scene() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
        camera: {
            position: [
                0,
                0,
                10
            ],
            fov: 35
        },
        dpr: [
            1,
            2
        ],
        gl: {
            powerPreference: 'high-performance',
            antialias: false
        },
        className: "fixed inset-0 z-0 pointer-events-none",
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 0
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("color", {
                attach: "background",
                args: [
                    '#0a0a0a'
                ]
            }, void 0, false, {
                fileName: "[project]/skjal-next/src/components/canvas/Scene.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$drei$2f$web$2f$ScrollControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollControls"], {
                pages: 5,
                damping: 0.1,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$src$2f$components$2f$canvas$2f$ParticleSystem$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ParticleSystem"], {}, void 0, false, {
                    fileName: "[project]/skjal-next/src/components/canvas/Scene.tsx",
                    lineNumber: 18,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/skjal-next/src/components/canvas/Scene.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Preload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Preload"], {
                all: true
            }, void 0, false, {
                fileName: "[project]/skjal-next/src/components/canvas/Scene.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/skjal-next/src/components/canvas/Scene.tsx",
        lineNumber: 8,
        columnNumber: 5
    }, this);
}
_c = Scene;
var _c;
__turbopack_context__.k.register(_c, "Scene");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/skjal-next/src/components/transitions/SmoothScroll.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SmoothScroll
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$studio$2d$freight$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/@studio-freight/lenis/dist/lenis.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/skjal-next/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function SmoothScroll({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const lenisRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmoothScroll.useEffect": ()=>{
            const lenis = new __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f40$studio$2d$freight$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
                duration: 1.2,
                easing: {
                    "SmoothScroll.useEffect": (t)=>Math.min(1, 1.001 - Math.pow(2, -10 * t))
                }["SmoothScroll.useEffect"],
                smoothWheel: true,
                wheelMultiplier: 1.1
            });
            lenisRef.current = lenis;
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
            return ({
                "SmoothScroll.useEffect": ()=>{
                    lenis.destroy();
                }
            })["SmoothScroll.useEffect"];
        }
    }["SmoothScroll.useEffect"], []);
    // Reset scroll on navigation
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmoothScroll.useEffect": ()=>{
            if (lenisRef.current) {
                lenisRef.current.scrollTo(0, {
                    immediate: true
                });
            }
        }
    }["SmoothScroll.useEffect"], [
        pathname,
        searchParams
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(SmoothScroll, "/4o+DI0UvKvllfbQc5GitVz3/gg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$skjal$2d$next$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = SmoothScroll;
var _c;
__turbopack_context__.k.register(_c, "SmoothScroll");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=skjal-next_src_components_0~a68ni._.js.map