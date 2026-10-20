import{A as Pe,B as $e,C as qe,D as J,E as mo,F as ce,G as ke,H as Fe,I as Ae,J as Ge,K as xe,L as we,M as Ye,N as vo,O as At,P as Be,Q as Et,R as go,S as yo,T as De,U as vt,V as ze,W as Ve,X as wo,Y as bo,Z as Ct,_ as $o,a as ve,b as te,c as G,d as Y,e as fe,f as et,g as Yt,h as kt,i as Zt,j as Re,k as Ue,l as Mt,m as dt,n as St,o as Tt,p as _e,q as ut,r as uo,s as n,t as V,u as R,v as Te,w as Le,x as le,y as ho,z as Oe}from"./chunk.3IHXIPVH.js";import{a as Ie,b as Lt}from"./chunk.4OCC54MU.js";import{a as pt,b as tt,c as Ne,d as po,e as ft,f as ht,g as mt,h as fo}from"./chunk.ZRZBQBLH.js";var Qt=new Set,ae={tier:2,fps:60,onBattery:!1,batteryLevel:1,hidden:!1,reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,manual:null,onChange(e){return Qt.add(e),()=>Qt.delete(e)}},Jt=0,Dt=0,ko=0,at=0,st=0;function Mo(e){Jt++,Dt+=e;let t=performance.now();if(t-ko<1e3)return;ko=t,ae.fps=Dt>0?Jt/Dt:60,Jt=0,Dt=0,ae.fps<40?(at++,st=0):ae.fps>55?(st++,at=0):(at=0,st=0);let a=ot();a!==ae.tier&&nt(a)}function Mn(){return typeof matchMedia!="function"?!1:matchMedia("(pointer: coarse)").matches&&matchMedia("(max-width: 820px)").matches}function ot(){if(ae.manual!=null)return ae.manual;if(ae.hidden)return 0;if(ae.reducedMotion)return 1;if(Mn()){let t=1;return at>=3&&(t=Math.max(0,ae.tier-1)),st>=6&&ae.tier<2&&(t=ae.tier+1),Math.max(0,Math.min(2,t))}let e=ae.onBattery?2:3;return ae.onBattery&&ae.batteryLevel<.25&&(e=1),at>=3&&(e=Math.max(0,ae.tier-1)),st>=6&&e>ae.tier&&(e=ae.tier+1),Math.max(0,Math.min(3,e))}function nt(e){ae.tier=e,document.documentElement.dataset.q=String(e),at=0,st=0;for(let t of Qt)t(e)}function So(){document.addEventListener("visibilitychange",()=>{ae.hidden=document.hidden,nt(ot())}),matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{ae.reducedMotion=e.matches,nt(ot())}),navigator.getBattery&&navigator.getBattery().then(e=>{let t=()=>{ae.onBattery=!e.charging,ae.batteryLevel=e.level,nt(ot())};e.addEventListener("chargingchange",t),e.addEventListener("levelchange",t),t()}).catch(()=>{}),nt(ot())}function Xt(e){ae.manual=e,nt(ot())}var Sn=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,Tn=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform int   uQuality;      // 0..3, drives octave counts and effect gating

uniform float uSunAlt;       // radians
uniform float uSunAz;        // radians, 0 = north, increasing eastward
uniform float uMoonAlt;
uniform float uMoonAz;
uniform float uMoonPhase;    // 0 new .. 0.5 full .. 1 new
uniform float uMoonFrac;     // illuminated fraction

uniform float uViewAz;       // bearing the camera faces
uniform float uCloudLow;
uniform float uCloudMid;
uniform float uCloudHigh;
uniform float uPrecip;       // 0..1 intensity
uniform float uSnow;         // 0 = rain, 1 = snow
uniform float uStorm;        // 0..1 convective activity
uniform float uFlash;        // lightning, driven from JS
uniform float uFog;          // 0..1
uniform float uWind;         // mph
uniform float uWindDir;      // radians, direction wind blows TOWARD
uniform float uKp;           // 0..9 planetary K index
uniform float uLat;          // observer latitude, degrees
uniform float uHaze;         // aerosol / low visibility
uniform float uCityGlow;     // light-pollution intensity on the horizon

#define PI 3.14159265359
#define TAU 6.28318530718

/* ------------------------------------------------------------ noise */

float hash21(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, int oct) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8); // decorrelate octaves
  for (int i = 0; i < 7; i++) {
    if (i >= oct) break;
    v += a * vnoise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

/* Ridged noise reads more like real cloud structure than plain fbm. */
float ridged(vec2 p, int oct) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    v += a * (1.0 - abs(vnoise(p) * 2.0 - 1.0));
    p = rot * p * 2.1;
    a *= 0.5;
  }
  return v;
}

/*
 * Skyline height in radians of elevation, for a given azimuth. Four octaves
 * of hashed blocks give a mix of towers and low-rise without any geometry.
 */
float skyline(float az) {
  float h = 0.0;
  for (int i = 0; i < 4; i++) {
    float scale = 16.0 + float(i) * 25.0;
    float cell = floor(az * scale);
    float r = hash21(vec2(cell, float(i) * 31.7));
    float bh = r * r * (0.085 - float(i) * 0.016);
    h = max(h, bh * step(0.28, r));
  }
  return h;
}

/* Great-circle angle between two (azimuth, elevation) pairs. */
float angDist(float az1, float el1, float az2, float el2) {
  float c = sin(el1) * sin(el2) + cos(el1) * cos(el2) * cos(az1 - az2);
  return acos(clamp(c, -1.0, 1.0));
}

/*
 * Project a viewing ray onto a horizontal slab at height h and return the
 * ground-plane coordinate. This is what makes cloud decks converge toward
 * the horizon instead of sliding like a flat texture.
 */
vec2 slab(float az, float el, float h) {
  float s = max(sin(el), 0.012);
  float t = h / s;
  return vec2(sin(az), cos(az)) * t;
}

/* ------------------------------------------------------------ main */

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  // Horizon sits low so the sky dominates the frame.
  float horizonY = -0.30;
  float elev = (uv.y - horizonY) * 0.95;              // ~ +/- radians
  float el   = elev * (PI * 0.42);
  float az   = uViewAz + uv.x * aspect * 0.95;

  int oct = uQuality >= 3 ? 6 : uQuality == 2 ? 5 : uQuality == 1 ? 4 : 3;

  // Needed by both the cloud masks and the ground block below.
  float cityH = skyline(az);

  /*
   * Optical depth of the cloud column. Thick cloud does not merely cover the
   * sky, it blocks the light coming through it, so this dims the palette AND
   * occludes the sun and moon. Without it a 95%-overcast thunderstorm renders
   * as a bright white sheet with a visible solar halo burnt through it.
   */
  float totalCloud = clamp(uCloudLow * 0.62 + uCloudMid * 0.30 + uCloudHigh * 0.08, 0.0, 1.0);
  float gloom = clamp(1.0 - totalCloud * 0.68 - uStorm * 0.34, 0.12, 1.0);
  float seeThrough = 1.0 - totalCloud * 0.92;   // how much of the disc survives

  float sunDeg = uSunAlt * 57.29578;
  float dayAmt   = smoothstep(-6.5, 7.0, sunDeg);
  float nightAmt = 1.0 - smoothstep(-15.0, -1.5, sunDeg);
  float goldAmt  = exp(-pow((sunDeg - 1.5) / 8.0, 2.0));

  /* ---------------------------------------------------- sky gradient */

  float zen = clamp(el / (PI * 0.5), 0.0, 1.0);

  // Palettes are graded toward cyan and magenta rather than natural blue.
  vec3 dayZen  = vec3(0.031, 0.243, 0.478);
  vec3 dayHor  = vec3(0.298, 0.667, 0.808);
  vec3 goldZen = vec3(0.075, 0.153, 0.400);
  vec3 goldHor = vec3(1.000, 0.412, 0.180);
  vec3 nightZen= vec3(0.004, 0.010, 0.035);
  vec3 nightHor= vec3(0.020, 0.055, 0.125);

  vec3 zenC = mix(nightZen, dayZen, dayAmt);
  vec3 horC = mix(nightHor, dayHor, dayAmt);
  zenC = mix(zenC, goldZen, goldAmt * 0.75);
  horC = mix(horC, goldHor, goldAmt * 0.85);

  float grad = pow(1.0 - zen, 2.1);
  vec3 col = mix(zenC, horC, grad);

  // A magenta bloom opposite the sun: the anti-twilight arch, and at night
  // the light dome of a city. Orange County has plenty of both.
  float horizonBand = pow(1.0 - clamp(abs(el) / 0.30, 0.0, 1.0), 2.5);
  float sunSideward = 0.5 + 0.5 * cos(az - uSunAz);
  col += vec3(1.0, 0.18, 0.55) * horizonBand * goldAmt * 0.35 * (1.0 - sunSideward);
  col += vec3(1.0, 0.45, 0.16) * horizonBand * goldAmt * 0.55 * sunSideward;
  col += vec3(1.0, 0.30, 0.62) * horizonBand * nightAmt * uCityGlow * 0.55;
  col += vec3(0.20, 0.85, 1.00) * horizonBand * nightAmt * uCityGlow * 0.22;

  /* ---------------------------------------------------------- stars */

  if (nightAmt > 0.01 && el > cityH) {
    // Cell-based star field in angular space, so stars stay put as the
    // horizon curves rather than stretching.
    vec2 sp = vec2(az * 30.0, el * 30.0);
    vec2 cell = floor(sp);
    vec2 f = fract(sp);
    float starTot = 0.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 o = vec2(float(i), float(j));
        vec2 h = hash22(cell + o);
        if (h.x > 0.55) {                 // star density
          vec2 pos = o + h;
          float d = length(f - pos);
          float mag = hash21(cell + o + 7.1);
          float bright = pow(mag, 3.4) * 2.2 + 0.035;   // few bright, many faint
          // Twinkle harder near the horizon, where the air path is longest.
          float tw = 0.75 + 0.25 * sin(uTime * (1.5 + mag * 5.0) + mag * 30.0)
                     * (1.0 - smoothstep(0.0, 0.6, el));
          starTot += bright * tw * smoothstep(0.075, 0.0, d);
        }
      }
    }
    // Milky Way: a broad band tilted by observer latitude.
    float mwBand = exp(-pow((el - 0.55 + sin(az * 0.8) * 0.28) / 0.30, 2.0));
    float mwTex = fbm(vec2(az * 3.0, el * 3.0) + 11.0, oct);
    vec3 mwCol = mix(vec3(0.35, 0.45, 0.75), vec3(0.75, 0.55, 0.85), mwTex);
    float horizonFade = smoothstep(cityH, cityH + 0.25, el);

    col += vec3(0.85, 0.93, 1.0) * starTot * nightAmt * horizonFade * seeThrough;
    col += mwCol * mwBand * mwTex * 0.16 * nightAmt * horizonFade * seeThrough;
  }

  /* --------------------------------------------------------- aurora */

  if (uKp >= 3.0 && nightAmt > 0.2) {
    // Aurora sits toward the pole: north above the equator, south below.
    float poleAz = uLat >= 0.0 ? 0.0 : PI;
    float toPole = abs(mod(az - poleAz + PI, TAU) - PI);
    float facing = smoothstep(1.5, 0.2, toPole);
    float band = smoothstep(0.02, 0.10, el) * (1.0 - smoothstep(0.22, 0.75, el));
    float curtain = ridged(vec2(az * 2.4 + uTime * 0.045, el * 5.0 - uTime * 0.10), oct);
    float rays = fbm(vec2(az * 22.0, el * 2.0 - uTime * 0.35), 3);
    float strength = smoothstep(3.0, 7.5, uKp) * facing * band;
    vec3 auroraCol = mix(vec3(0.15, 1.0, 0.55), vec3(0.70, 0.25, 1.0), smoothstep(0.3, 0.85, curtain));
    col += auroraCol * pow(curtain, 2.2) * rays * strength * 1.5;
  }

  /* ------------------------------------------------------- sun/moon */

  float sunD = angDist(az, el, uSunAz, uSunAlt);
  float moonD = angDist(az, el, uMoonAz, uMoonAlt);

  // Broad forward-scattering halo, present even when the disc is below us.
  float halo = exp(-sunD * 2.6) * 0.55 + exp(-sunD * 9.0) * 0.6;
  vec3 sunTint = mix(vec3(1.0, 0.42, 0.14), vec3(1.0, 0.95, 0.80), dayAmt);
  col += sunTint * halo * (0.35 + dayAmt * 0.9) * smoothstep(-0.22, 0.02, uSunAlt)
         * mix(0.10, 1.0, seeThrough);

  // The disc itself, ~0.53 deg across, with a touch of bloom.
  float sunDisc = smoothstep(0.0105, 0.0075, sunD);
  if (uSunAlt > -0.06) {
    col = mix(col, vec3(1.0, 0.97, 0.88), sunDisc * 0.97 * seeThrough);
    col += sunTint * exp(-sunD * 60.0) * 1.2 * seeThrough;
  }

  // Moon: a lit disc with a real terminator, plus earthshine on the dark limb.
  if (uMoonAlt > -0.05) {
    float md = smoothstep(0.0125, 0.0095, moonD);
    if (md > 0.001) {
      // Local disc coordinates, so we can carve the phase.
      float dAz = mod(az - uMoonAz + PI, TAU) - PI;
      float dx = dAz * cos(uMoonAlt);
      float dy = el - uMoonAlt;
      float r = 0.0115;
      vec2 p = vec2(dx, dy) / r;
      /*
       * Terminator. The shadow edge is an ellipse whose semi-minor axis is
       * k = 1 - 2f, running +1 at new moon through 0 at quarter to -1 at
       * full. A waxing moon is lit on the right, a waning moon on the left.
       */
      float k = 1.0 - 2.0 * uMoonFrac;
      float term = k * sqrt(max(0.0, 1.0 - p.y * p.y));
      float sd = (uMoonPhase < 0.5) ? (p.x - term) : (-p.x - term);
      float lit = smoothstep(-0.09, 0.09, sd);
      float mare = fbm(p * 1.6 + 3.0, 3);
      vec3 moonSurf = mix(vec3(0.86, 0.90, 0.96), vec3(0.55, 0.60, 0.70), mare * 0.55);
      vec3 moonLit = moonSurf * (0.15 + 0.95 * lit) + vec3(0.06, 0.10, 0.16) * (1.0 - lit);
      float moonVis = (1.0 - dayAmt * 0.55) * seeThrough;
      col = mix(col, moonLit, md * moonVis);
      col += vec3(0.65, 0.80, 1.0) * exp(-moonD * 90.0) * uMoonFrac * moonVis * 0.5;
    }
  }

  /* --------------------------------------------------------- clouds */

  float windRad = uWindDir;
  vec2 drift = vec2(sin(windRad), cos(windRad)) * uTime * (0.004 + uWind * 0.0016);
  float skyMask = smoothstep(cityH - 0.004, cityH + 0.03, el);

  vec3 cloudLitDay   = vec3(1.00, 0.99, 0.98);
  vec3 cloudLitGold  = vec3(1.00, 0.52, 0.30);
  vec3 cloudShadeDay = vec3(0.36, 0.44, 0.56);
  vec3 cloudNight    = vec3(0.045, 0.075, 0.135);

  vec3 cLit   = mix(cloudNight * 2.2, mix(cloudLitDay, cloudLitGold, goldAmt * 0.8), dayAmt) * gloom;
  vec3 cShade = mix(cloudNight, cloudShadeDay, dayAmt) * gloom;

  // Storm cloud is bruised blue-grey, not neutral.
  vec3 stormTint = vec3(0.34, 0.37, 0.50);
  cLit   = mix(cLit,   cLit   * stormTint, uStorm * 0.65);
  cShade = mix(cShade, cShade * stormTint, uStorm * 0.75);

  // The sky between the clouds dims too.
  col *= mix(1.0, gloom, 0.75);
  // Under a city dome, cloud bases pick up magenta from below.
  cShade += vec3(0.55, 0.12, 0.30) * nightAmt * uCityGlow * 0.35;

  // -- high deck: thin cirrus, fast, wispy
  if (uCloudHigh > 0.01) {
    vec2 p = slab(az, el, 7.0) * 0.11 + drift * 2.2;
    float n = ridged(p, oct);
    float cov = smoothstep(1.02 - uCloudHigh * 0.75, 1.25 - uCloudHigh * 0.75, n + uCloudHigh * 0.35);
    cov *= skyMask * smoothstep(0.0, 0.16, el);
    col = mix(col, mix(cShade, cLit, 0.85), cov * 0.55 * uCloudHigh);
  }

  // -- mid deck
  if (uCloudMid > 0.01) {
    vec2 p = slab(az, el, 3.2) * 0.22 + drift * 1.4;
    float n = fbm(p, oct);
    float cov = smoothstep(0.62 - uCloudMid * 0.34, 0.80 - uCloudMid * 0.30, n);
    cov *= skyMask * smoothstep(0.0, 0.10, el);
    float shade = fbm(p + vec2(0.35), oct - 1);
    col = mix(col, mix(cShade, cLit, smoothstep(0.30, 0.72, shade)), cov * 0.72 * uCloudMid);
  }

  // -- low deck: the one you actually feel, thickest and slowest
  if (uCloudLow > 0.01) {
    vec2 p = slab(az, el, 1.35) * 0.40 + drift;
    float n = fbm(p, oct);
    float det = fbm(p * 3.1 - drift * 0.4, oct - 1);
    n = n * 0.78 + det * 0.22;
    float cov = smoothstep(0.58 - uCloudLow * 0.36, 0.76 - uCloudLow * 0.30, n);
    cov *= skyMask * smoothstep(0.0, 0.055, el);
    // Fake self-shadowing: sample slightly toward the sun for the lit side.
    float toward = fbm(p + vec2(sin(uSunAz), cos(uSunAz)) * 0.16, oct - 1);
    float shade = smoothstep(0.34, 0.70, toward);
    vec3 body = mix(cShade, cLit, shade);
    col = mix(col, body, cov * 0.92 * uCloudLow);

    // Lightning lights the deck from inside.
    if (uFlash > 0.001) {
      col += vec3(0.80, 0.88, 1.0) * cov * uFlash * 0.85;
    }
  }

  /* ------------------------------------------------------------ fog */

  if (uFog > 0.01) {
    float fogAmt = uFog * (1.0 - smoothstep(-0.05, 0.35, el));
    vec3 fogCol = mix(vec3(0.06, 0.10, 0.16), vec3(0.62, 0.70, 0.78), dayAmt);
    fogCol += vec3(0.45, 0.10, 0.28) * nightAmt * uCityGlow * 0.5;
    float swirl = fbm(vec2(az * 3.0, el * 6.0) + uTime * 0.02, 4);
    col = mix(col, fogCol, clamp(fogAmt * (0.6 + swirl * 0.5), 0.0, 0.95));
  }

  // General aerosol haze washes out contrast near the horizon.
  col = mix(col, mix(vec3(0.10, 0.13, 0.18), vec3(0.68, 0.72, 0.76), dayAmt),
            uHaze * horizonBand * 0.45);

  /* ------------------------------------------------- ground / city */

  /*
   * The skyline occupies POSITIVE elevation \u2014 buildings stand up from the
   * horizon. Ground (grid floor) is everything below el = 0.
   */
  if (el < cityH) {
    vec3 ground;

    if (el >= 0.0) {
      // --- building face ---
      float up = el / max(cityH, 1e-4);              // 0 at street, 1 at roofline
      vec3 face = vec3(0.012, 0.017, 0.034) * (1.0 - up * 0.45);

      // Window grid. Columns follow azimuth, rows follow elevation.
      vec2 wcell = floor(vec2(az * 520.0, el * 900.0));
      float lit = hash21(wcell);
      float on = step(0.80 - nightAmt * 0.10, lit);
      vec3 winCol = mix(vec3(1.0, 0.76, 0.32), vec3(0.35, 0.95, 1.0), hash21(wcell + 5.7));
      face += winCol * on * (0.45 + nightAmt * 1.05);

      // Occasional neon sign band on a facade.
      float signHash = hash21(vec2(floor(az * 45.0), 3.0));
      if (signHash > 0.88) {
        float band = smoothstep(0.42, 0.46, up) * (1.0 - smoothstep(0.56, 0.60, up));
        vec3 signCol = mix(vec3(1.0, 0.10, 0.55), vec3(0.10, 1.0, 0.85), hash21(vec2(floor(az * 45.0), 9.0)));
        face += signCol * band * (0.6 + nightAmt * 1.4)
                * (0.7 + 0.3 * sin(uTime * 3.0 + signHash * 40.0));
      }

      // Roofline aviation lights.
      float roof = smoothstep(0.965, 1.0, up) * step(0.93, hash21(vec2(floor(az * 90.0), 17.0)));
      face += vec3(1.0, 0.12, 0.12) * roof * (0.5 + 0.5 * sin(uTime * 2.2));

      ground = face;
    } else {
      /*
       * Ground plane grid. Project the ray onto a floor one unit below the
       * eye: distance along the ground is 1/tan(dip), so the grid genuinely
       * converges at the horizon instead of fanning out from screen centre.
       */
      float dip = -el;
      float dist = 1.0 / max(tan(dip), 0.004);
      vec2 fp = vec2(sin(az), cos(az)) * dist;
      fp.y -= uTime * 0.55;                       // drift toward the viewer

      // Derivative-aware line width keeps distant lines from aliasing away.
      vec2 gw = fwidth(fp) * 1.4;
      vec2 gf = abs(fract(fp) - 0.5);
      vec2 gl = smoothstep(gw, vec2(0.0), gf);
      float grid = clamp(max(gl.x, gl.y), 0.0, 1.0);

      float fade = 1.0 / (1.0 + dist * dist * 0.0022);
      vec3 gridCol = mix(vec3(0.55, 0.10, 0.42), vec3(0.0, 0.92, 1.0), clamp(dist / 14.0, 0.0, 1.0));
      ground = vec3(0.004, 0.008, 0.020) + gridCol * grid * fade * 0.42;
      // Wet streets mirror the sky when it is raining.
      ground += horC * uPrecip * 0.16 * fade;   // wet streets mirror the sky
    }

    // Haze stacked on the skyline, and the city's own light dome.
    float distFade = exp(-max(0.0, cityH - el) * 22.0);
    // Skyline haze is lit by the sky above it, so it must dim with the sky.
    ground += mix(horC, vec3(1.0, 0.22, 0.52), nightAmt * 0.65)
              * distFade * (0.22 + uCityGlow * 0.45) * mix(gloom, 1.0, nightAmt * 0.7);

    col = mix(col, ground, smoothstep(cityH + 0.0015, cityH - 0.0015, el));
  }

  // Glow spilling upward off the skyline into the sky.
  {
    float above = el - cityH;
    if (above > 0.0) {
      col += mix(vec3(0.9, 0.45, 0.15), vec3(1.0, 0.25, 0.60), nightAmt)
             * exp(-above * 55.0) * uCityGlow * (0.10 + nightAmt * 0.30)
             * mix(gloom, 1.0, nightAmt * 0.7);
    }
  }

  /* --------------------------------------------------- precipitation */

  if (uPrecip > 0.01 && uQuality >= 1) {
    vec2 sp = vec2(uv.x * aspect, uv.y);
    float acc = 0.0;
    int layers = uQuality >= 3 ? 4 : uQuality == 2 ? 3 : 2;

    if (uSnow < 0.5) {
      // Rain: near-vertical streaks, sheared by wind, faster in the near layers.
      float shear = clamp(uWind / 45.0, 0.0, 0.6) * sign(sin(uWindDir - uViewAz));
      for (int i = 0; i < 4; i++) {
        if (i >= layers) break;
        float fi = float(i);
        float scale = 34.0 + fi * 26.0;
        float speed = 2.6 + fi * 1.9;
        vec2 q = vec2(sp.x * scale + fi * 17.0, sp.y * scale * 0.24 + uTime * speed);
        q.x += q.y * shear;
        vec2 cell = floor(q);
        float h = hash21(cell);
        if (h > 0.972 - uPrecip * 0.045) {
          vec2 f = fract(q) - vec2(hash21(cell + 1.7), 0.5);
          float streak = smoothstep(0.055, 0.0, abs(f.x)) * smoothstep(0.62, 0.0, abs(f.y));
          acc += streak * (0.5 + fi * 0.22);
        }
      }
      // Streaks veil the scene; they must never overwhelm it.
      acc = clamp(acc, 0.0, 1.0);
      col = mix(col, col * 0.82 + vec3(0.30, 0.44, 0.58), acc * uPrecip * 0.42);
    } else {
      // Snow: slow drifting flakes with a lateral sway.
      for (int i = 0; i < 4; i++) {
        if (i >= layers) break;
        float fi = float(i);
        float scale = 18.0 + fi * 15.0;
        float speed = 0.30 + fi * 0.26;
        vec2 q = vec2(sp.x * scale, sp.y * scale + uTime * speed);
        vec2 cell = floor(q);
        float h = hash21(cell);
        if (h > 0.962 - uPrecip * 0.045) {
          vec2 f = fract(q) - 0.5;
          f.x += sin(uTime * (0.7 + h) + h * 20.0) * 0.28;
          float flake = smoothstep(0.14 + fi * 0.02, 0.0, length(f));
          acc += flake * (0.55 + fi * 0.2);
        }
      }
      acc = clamp(acc, 0.0, 1.0);
      col = mix(col, col * 0.85 + vec3(0.62, 0.68, 0.78), acc * uPrecip * 0.55);
    }
  }

  // Precipitation greys out distance; this is most of what "heavy rain" looks like.
  if (uPrecip > 0.01) {
    vec3 veil = mix(vec3(0.06, 0.09, 0.14), vec3(0.42, 0.47, 0.54), dayAmt) * gloom;
    col = mix(col, veil, clamp(uPrecip * 0.45, 0.0, 0.55) * horizonBand);
  }

  // Full-frame lightning wash.
  col += vec3(0.75, 0.85, 1.0) * uFlash * 0.16;

  /* ------------------------------------------------------- grading */

  // Gentle filmic curve, then a cyan-shadow / magenta-highlight push.
  col = max(col, 0.0);
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = mix(col, col * vec3(0.88, 1.02, 1.10), 0.35);            // cool the shadows
  col += vec3(0.030, 0.0, 0.022) * pow(max(col.r, 0.0), 2.0);    // magenta in the highs

  // Vignette (the CSS layer adds another, subtler one on top).
  float vig = 1.0 - 0.28 * pow(length(uv * vec2(aspect, 1.0)) * 0.62, 2.2);
  col *= vig;

  fragColor = vec4(col, 1.0);
}`,To={sunAlt:.4,sunAz:3,moonAlt:-.4,moonAz:1,moonPhase:.25,moonFrac:.5,viewAz:Math.PI,cloudLow:.2,cloudMid:.1,cloudHigh:.1,precip:0,snow:0,storm:0,fog:0,wind:6,windDir:4,kp:2,lat:33.6,haze:.15,cityGlow:.5},An=new Set(["snow","lat"]),It=class{constructor(t){this.canvas=t,this.gl=null,this.params={...To},this.target={...To},this.quality=2,this.running=!1,this.flash=0,this.nextBolt=1/0,this.scale=1,this.ok=!1,this.t0=performance.now()}init(){let t=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)return this.ok=!1,!1;this.gl=t;let a=En(t,Sn,Tn);if(!a)return this.ok=!1,!1;this.prog=a,t.useProgram(a);let s=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,s),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let c=t.getAttribLocation(a,"aPos");t.enableVertexAttribArray(c),t.vertexAttribPointer(c,2,t.FLOAT,!1,0,0),this.u={};for(let w of["uRes","uTime","uQuality","uSunAlt","uSunAz","uMoonAlt","uMoonAz","uMoonPhase","uMoonFrac","uViewAz","uCloudLow","uCloudMid","uCloudHigh","uPrecip","uSnow","uStorm","uFlash","uFog","uWind","uWindDir","uKp","uLat","uHaze","uCityGlow"])this.u[w]=t.getUniformLocation(a,w);return this.resize(),this.ok=!0,!0}set(t){Object.assign(this.target,t)}snap(t){Object.assign(this.target,t),Object.assign(this.params,t)}setQuality(t){this.quality=t,this.scale=t>=3?1:t===2?.85:t===1?.65:.5,this.resize()}resize(){let t=this.gl;if(!t)return;let a=Math.min(window.devicePixelRatio||1,this.quality>=3?2:1.5),s=Math.max(2,Math.floor(this.canvas.clientWidth*a*this.scale)),c=Math.max(2,Math.floor(this.canvas.clientHeight*a*this.scale));this.canvas.width===s&&this.canvas.height===c||(this.canvas.width=s,this.canvas.height=c,t.viewport(0,0,s,c))}render(t,a){if(!this.ok)return;let s=this.gl,c=this.params,w=this.target,A=1-Math.pow(.0016,a);for(let E in w){if(An.has(E)){c[E]=w[E];continue}if(E.endsWith("Az")||E==="windDir"){let M=w[E]-c[E];M=((M+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,c[E]+=M*A}else c[E]+=(w[E]-c[E])*A}c.storm>.12?(this.nextBolt===1/0&&(this.nextBolt=t+Math.random()*3e3),t>this.nextBolt&&(this.flash=.3+Math.random()*.45,this.nextBolt=t+900+Math.random()*9e3*(1.15-c.storm))):this.nextBolt=1/0,this.flash*=Math.pow(8e-5,a),this.flash<.002&&(this.flash=0);let k=this.u;s.uniform2f(k.uRes,this.canvas.width,this.canvas.height),s.uniform1f(k.uTime,(t-this.t0)/1e3),s.uniform1i(k.uQuality,this.quality),s.uniform1f(k.uSunAlt,c.sunAlt),s.uniform1f(k.uSunAz,c.sunAz),s.uniform1f(k.uMoonAlt,c.moonAlt),s.uniform1f(k.uMoonAz,c.moonAz),s.uniform1f(k.uMoonPhase,c.moonPhase),s.uniform1f(k.uMoonFrac,c.moonFrac),s.uniform1f(k.uViewAz,c.viewAz),s.uniform1f(k.uCloudLow,c.cloudLow),s.uniform1f(k.uCloudMid,c.cloudMid),s.uniform1f(k.uCloudHigh,c.cloudHigh),s.uniform1f(k.uPrecip,c.precip),s.uniform1f(k.uSnow,c.snow),s.uniform1f(k.uStorm,c.storm),s.uniform1f(k.uFlash,this.flash),s.uniform1f(k.uFog,c.fog),s.uniform1f(k.uWind,c.wind),s.uniform1f(k.uWindDir,c.windDir),s.uniform1f(k.uKp,c.kp),s.uniform1f(k.uLat,c.lat),s.uniform1f(k.uHaze,c.haze),s.uniform1f(k.uCityGlow,c.cityGlow),s.drawArrays(s.TRIANGLES,0,3)}};function En(e,t,a){let s=Ao(e,e.VERTEX_SHADER,t),c=Ao(e,e.FRAGMENT_SHADER,a);if(!s||!c)return null;let w=e.createProgram();return e.attachShader(w,s),e.attachShader(w,c),e.linkProgram(w),e.getProgramParameter(w,e.LINK_STATUS)?(e.deleteShader(s),e.deleteShader(c),w):(console.error("[sky] link failed:",e.getProgramInfoLog(w)),null)}function Ao(e,t,a){let s=e.createShader(t);if(e.shaderSource(s,a),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){let c=e.getShaderInfoLog(s);console.error(`[sky] ${t===e.VERTEX_SHADER?"vertex":"fragment"} compile failed:
${c}`);let w=/ERROR:\s*\d+:(\d+)/.exec(c||"");if(w){let A=a.split(`
`),k=+w[1];console.error(A.slice(Math.max(0,k-3),k+2).map((E,M)=>`${Math.max(1,k-2)+M}| ${E}`).join(`
`))}return null}return s}var Ze=8,Eo=8,Co=16,Lo=15;function Do(e){e.innerHTML=`
    <div class="tl-controls">
      <button class="tl-btn" data-act="back" title="Back 1 hour  [\u2190]">\u25C0\u25C0</button>
      <button class="tl-btn tl-play" data-act="play" title="Play forecast  [Space]">\u25B6</button>
      <button class="tl-btn" data-act="fwd" title="Forward 1 hour  [\u2192]">\u25B6\u25B6</button>
      <button class="tl-btn tl-now" data-act="now" title="Return to now  [N]">NOW</button>
      <div class="tl-rate">
        <span class="lbl">rate</span>
        <button class="tl-btn sm" data-rate="1">1\xD7</button>
        <button class="tl-btn sm" data-rate="3">3\xD7</button>
        <button class="tl-btn sm" data-rate="12">12\xD7</button>
      </div>
    </div>
    <div class="tl-readout">
      <div class="tl-when"><b>--</b><span>--</span></div>
      <div class="tl-delta">NOW</div>
    </div>
    <canvas class="tl-canvas"></canvas>
  `;let t=e.querySelector(".tl-canvas"),a=e.querySelector(".tl-when b"),s=e.querySelector(".tl-when span"),c=e.querySelector(".tl-delta"),w=e.querySelector(".tl-play"),A=!1,k=ce(t,M,{inspect:!1});function E(r){let{lo:p,hi:o}=n.span,l=r-Ze-Eo;return{lo:p,hi:o,plotW:l,xOf:v=>Ze+(v-p)/(o-p||1)*l,tOf:v=>p+(v-Ze)/l*(o-p||1)}}function M(r,p,o,l){let v=n.hours;if(!v?.length)return;let h=E(p),g=n.fmt,$={x:Ze,y:Co,w:h.plotW,h:o-Co-Lo};r.save(),r.fillStyle="rgba(8,13,22,.4)";for(let N=0;N<n.days.length;N++){let j=n.days[N],oe=n.days[N+1];if(!j.sunset)continue;let Z=G(h.xOf(j.sunset),$.x,$.x+$.w),U=G(oe?.sunrise?h.xOf(oe.sunrise):$.x+$.w,$.x,$.x+$.w);U>Z&&r.fillRect(Z,$.y,U-Z,$.h)}r.restore();let b=v.map(N=>N.temp).filter(N=>N!=null),y=Math.min(...b),L=Math.max(...b),H=N=>$.y+$.h*.92-(N-y)/(L-y||1)*$.h*.72,D=v.filter(N=>N.temp!=null).map(N=>[h.xOf(N.t),H(N.temp)]);r.save(),r.beginPath(),Fe(r,D),r.lineTo(D.at(-1)[0],$.y+$.h),r.lineTo(D[0][0],$.y+$.h),r.closePath();let O=r.createLinearGradient(0,$.y,0,$.y+$.h);O.addColorStop(0,J($e(L),.34)),O.addColorStop(1,J($e(y),.03)),r.fillStyle=O,r.fill(),r.restore();let C=r.createLinearGradient(Ze,0,Ze+h.plotW,0);for(let N=0;N<=12;N++){let j=v[Math.round(N/12*(v.length-1))];C.addColorStop(N/12,$e(j?.temp))}r.save(),r.shadowColor=J(V[0],.8),r.shadowBlur=4,r.beginPath(),Fe(r,D),r.strokeStyle=C,r.lineWidth=1.8,r.lineJoin="round",r.stroke(),r.restore();let f=Math.max(...v.map(N=>N.precip??0),.02);r.save();for(let N of v){let j=N.precip??0;if(j<.001)continue;let oe=h.xOf(N.t),Z=G(j/f,.08,1)*$.h*.3;r.fillStyle=J(V[4],.75),r.fillRect(oe-.7,$.y+$.h-Z,1.6,Z)}r.restore(),r.save(),r.font=Pe,r.letterSpacing="1.2px",r.textBaseline="top";let T=n.days.length>1?Math.abs(h.xOf(n.days[1].t)-h.xOf(n.days[0].t)):$.w,x=34,F=Math.max(1,Math.ceil(x/Math.max(1,T))),W=0;for(let N of n.days){let j=h.xOf(N.t),oe=W++%F===0;j<$.x||j>$.x+$.w||(r.strokeStyle=oe?"rgba(255,255,255,.10)":"rgba(255,255,255,.05)",r.lineWidth=1,r.beginPath(),r.moveTo(Math.round(j)+.5,$.y),r.lineTo(Math.round(j)+.5,$.y+$.h),r.stroke(),!(!oe||j+x>$.x+$.w)&&(r.fillStyle=le,r.textAlign="left",r.fillText(g.weekday(N.t).toUpperCase(),j+3,o-Lo+3)))}r.restore();for(let N of n.alerts){let j=Date.parse(N.effective||N.onset||0),oe=Date.parse(N.expires||N.ends||0);if(!j||!oe)continue;let Z=G(h.xOf(j),$.x,$.x+$.w),U=G(h.xOf(oe),$.x,$.x+$.w);U<=Z||(r.fillStyle=J(R.crit,.55),r.fillRect(Z,$.y-4,U-Z,3))}let P=Date.now(),_=h.xOf(P);if(_>=$.x&&_<=$.x+$.w&&(r.save(),r.strokeStyle=J(R.good,.85),r.lineWidth=1,r.setLineDash([2,3]),r.shadowColor=R.good,r.shadowBlur=4,r.beginPath(),r.moveTo(Math.round(_)+.5,$.y-4),r.lineTo(Math.round(_)+.5,$.y+$.h),r.stroke(),r.restore()),l&&!A&&l.x>$.x&&l.x<$.x+$.w){let N=h.tOf(l.x);r.save(),r.strokeStyle="rgba(255,255,255,.22)",r.lineWidth=1,r.beginPath(),r.moveTo(Math.round(l.x)+.5,$.y),r.lineTo(Math.round(l.x)+.5,$.y+$.h),r.stroke(),r.font=Oe,r.fillStyle=Le,r.textAlign=l.x>p-70?"right":"left",r.textBaseline="top",r.fillText(`${g.weekday(N)} ${g.hm(N)}`,l.x+(l.x>p-70?-5:5),2),r.restore()}let X=h.xOf(n.cursor);r.save(),r.strokeStyle=V[1],r.lineWidth=1.5,r.shadowColor=V[1],r.shadowBlur=7,r.beginPath(),r.moveTo(Math.round(X)+.5,$.y-6),r.lineTo(Math.round(X)+.5,$.y+$.h+3),r.stroke(),r.fillStyle=V[1],r.beginPath(),r.moveTo(X,$.y-10),r.lineTo(X+5,$.y-16),r.lineTo(X-5,$.y-16),r.closePath(),r.fill(),r.restore()}let i=r=>{let p=t.getBoundingClientRect(),o=E(p.width);n.playing=!1,S(),n.scrubTo(o.tOf(G(r-p.left,Ze,p.width-Eo)))};t.addEventListener("pointerdown",r=>{A=!0,t.setPointerCapture(r.pointerId),i(r.clientX)}),t.addEventListener("pointermove",r=>{A&&i(r.clientX)});let d=r=>{if(A){A=!1;try{t.releasePointerCapture(r.pointerId)}catch{}}};t.addEventListener("pointerup",d),t.addEventListener("pointercancel",d),t.style.cursor="ew-resize",e.addEventListener("click",r=>{let p=r.target.closest("button");if(!p)return;if(p.dataset.rate){n.playRate=+p.dataset.rate,e.querySelectorAll("[data-rate]").forEach(l=>l.classList.toggle("on",+l.dataset.rate===n.playRate));return}let o=p.dataset.act;o==="now"?n.toNow():o==="back"?(n.playing=!1,n.scrubTo(n.cursor-36e5)):o==="fwd"?(n.playing=!1,n.scrubTo(n.cursor+36e5)):o==="play"&&(n.playing=!n.playing,n.playing&&n.view!=="radar"&&(n.following=!1),n.playing&&n.cursor>=n.span.hi-6e4&&n.setCursor(Date.now()),n.emit("play",n.playing)),S()});function S(){w.textContent=n.playing?"\u275A\u275A":"\u25B6",w.classList.toggle("on",n.playing),e.querySelector(".tl-now").classList.toggle("on",n.atNow)}function u(){let r=n.fmt,p=n.cursor;a.textContent=r.hm12(p),s.textContent=`${r.weekday(p)} ${r.monthDay(p)}`;let o=p-Date.now(),l=Math.round(Math.abs(o)/6e4);if(l<3)c.textContent="NOW",c.className="tl-delta now";else{let v=Math.floor(l/60),h=l%60,g=v>=24?`${Math.floor(v/24)}d ${v%24}h`:v?`${v}h ${h}m`:`${h}m`;c.textContent=o>0?`+${g}`:`\u2212${g}`,c.className="tl-delta "+(o>0?"fwd":"back")}S()}return n.on("cursor",()=>{u(),k.render()}),n.on("data",()=>{u(),k.render()}),n.on("play",S),e.querySelector('[data-rate="1"]').classList.add("on"),u(),{render:()=>k.render(),tick(r){if(!n.playing||n.view==="radar")return;let p=n.cursor+r*1e3*3600*n.playRate;p>=n.span.hi?(n.setCursor(n.span.hi),n.playing=!1,n.emit("play",!1),S()):n.setCursor(p)}}}function Ot(e,t,a,s,c){let{hours:w,days:A,span:k,cursor:E,now:M,tf:i,panels:d=["temp","pop"],showAxis:S=!0}=c;if(!w?.length)return;let u=4,r=30,p=14,o=S?30:4,l=t-u-r;if(l<30)return;let v=w.filter(f=>f.t>=k.lo-36e5&&f.t<=k.hi+36e5);if(v.length<2)return;let h=f=>u+(f-k.lo)/(k.hi-k.lo)*l,g=f=>k.lo+(f-u)/l*(k.hi-k.lo),$={temp:1,pop:.42,wind:.42,cloud:.3,pressure:.42,uv:.36,cape:.36},b=d.reduce((f,T)=>f+($[T]||.4),0),y=d.length>2?16:9,L=a-p-o-(d.length-1)*y,H=p,D={};for(let f of d){let T=L*($[f]||.4)/b;D[f]={x:u,y:H,w:l,h:T},H+=T+y}let O={x:u,y:p,w:l,h:a-p-o};if(vo(e,O,A||[],h),A?.length){e.save(),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=1,e.font=Pe,e.letterSpacing="1.2px",e.textBaseline="top";for(let f of A){let T=h(f.t);T<u-1||T>u+l||(e.beginPath(),e.moveTo(Math.round(T)+.5,p),e.lineTo(Math.round(T)+.5,p+O.h),e.stroke(),S&&(e.fillStyle=le,e.textAlign="left",e.fillText(i.weekday(f.t).toUpperCase(),T+3,a-o+17)))}e.restore()}let C=[];if(D.temp){let f=D.temp,T=v.map(Z=>Z.temp).filter(Z=>Z!=null),x=v.map(Z=>Z.feels).filter(Z=>Z!=null),F=T.concat(x),W=Math.min(...F)-2,P=Math.max(...F)+2,_=Z=>f.y+f.h-(Z-W)/(P-W)*f.h;if(Ae(e,f,ze(W,P,Be(f.h,3)).map(Z=>({v:Z,y:_(Z)})),Z=>`${Math.round(Z)}\xB0`),x.length>1){e.save(),e.setLineDash([4,3]);let Z=v.filter(U=>U.feels!=null).map(U=>[h(U.t),_(U.feels)]);ke(e,Z,J(V[1],.75),{width:1.5,glow:6}),e.restore()}let X=v.filter(Z=>Z.temp!=null).map(Z=>[h(Z.t),_(Z.temp)]);e.save(),e.beginPath(),Fe(e,X),e.lineTo(X.at(-1)[0],f.y+f.h),e.lineTo(X[0][0],f.y+f.h),e.closePath();let N=e.createLinearGradient(0,f.y,0,f.y+f.h);N.addColorStop(0,J($e(P),.3)),N.addColorStop(1,J($e(W),.02)),e.fillStyle=N,e.fill(),e.restore();let j=e.createLinearGradient(u,0,u+l,0);for(let Z=0;Z<=8;Z++){let U=v[Math.round(Z/8*(v.length-1))];j.addColorStop(Z/8,$e(U?.temp))}e.save(),e.shadowColor=J(V[0],.9),e.shadowBlur=6,e.beginPath(),Fe(e,X),e.strokeStyle=j,e.lineWidth=2.2,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),e.save(),e.font=Oe,e.textAlign="center",e.textBaseline="bottom";let oe=e.measureText("100\xB0").width+6;for(let Z of A||[]){let U=v.filter(se=>i.isoDate(se.t)===i.isoDate(Z.t)&&se.temp!=null);if(U.length<3)continue;let ue=U.reduce((se,me)=>me.temp>se.temp?me:se),Me=U.reduce((se,me)=>me.temp<se.temp?me:se);for(let[se,me,Ce]of[[ue,-6,"bottom"],[Me,13,"top"]]){let m=h(se.t),I=e.measureText(`${Math.round(se.temp)}\xB0`).width;if(m-I/2<u+4||m+I/2>u+l-oe)continue;let q=_(se.temp)+me,B=Ce==="top"?q+9>f.y+f.h:q-9<f.y;e.textBaseline=B?Ce==="top"?"bottom":"top":Ce,e.fillStyle=$e(se.temp),xe(e,`${Math.round(se.temp)}\xB0`,m,B?_(se.temp)-me:q)}}e.restore(),vt(e,f,f.y-11,"temperature \xB0F",[{label:"actual",color:V[0]},{label:"feels like",short:"feels",color:V[1],dash:!0}],{short:"temp \xB0F"}),C.push({key:"temp",box:f,yOf:_})}if(D.pop){let f=D.pop,T=_=>f.y+f.h-G(_,0,100)/100*f.h;Ae(e,f,[50,100].map(_=>({v:_,y:T(_)})),_=>`${_}%`);let x=v.map(_=>[h(_.t),T(_.pop??0)]);e.save(),e.beginPath(),Fe(e,x),e.lineTo(x.at(-1)[0],f.y+f.h),e.lineTo(x[0][0],f.y+f.h),e.closePath();let F=e.createLinearGradient(0,f.y,0,f.y+f.h);F.addColorStop(0,J(V[4],.55)),F.addColorStop(1,J(V[4],.04)),e.fillStyle=F,e.fill(),e.restore(),ke(e,x,V[4],{width:1.6,glow:7}),e.save(),e.font=Oe,e.textAlign="center",e.textBaseline="bottom",e.fillStyle=V[0];let W=-999,P=e.measureText("100%").width+6;for(let _=1;_<v.length-1;_++){let X=v[_];if((X.precip??0)<.02||(X.precip??0)<=(v[_-1].precip??0)||(X.precip??0)<(v[_+1].precip??0))continue;let N=h(X.t),j=e.measureText(`${X.precip.toFixed(2)}"`).width;N-W<46||N-j/2<u+4||N+j/2>u+l-P||(e.fillText(`${X.precip.toFixed(2)}"`,N,T(X.pop??0)-4),W=N)}e.restore(),we(e,f.x+2,f.y-11,"precip probability"),C.push({key:"pop",box:f,yOf:T})}if(D.wind){let f=D.wind,T=Math.max(...v.map(P=>P.gust??P.wind??0),10)*1.12,x=P=>f.y+f.h-G(P,0,T)/T*f.h;Ae(e,f,ze(0,T,Be(f.h,2)).map(P=>({v:P,y:x(P)})),P=>String(Math.round(P)));let F=v.map(P=>[h(P.t),x(P.gust??P.wind??0)]);e.save(),e.beginPath(),Fe(e,F),e.lineTo(F.at(-1)[0],f.y+f.h),e.lineTo(F[0][0],f.y+f.h),e.closePath(),e.fillStyle=J(R.serious,.16),e.fill(),e.restore(),ke(e,F,J(R.serious,.85),{width:1.2,glow:5}),ke(e,v.map(P=>[h(P.t),x(P.wind??0)]),V[3],{width:1.8,glow:8}),e.save(),e.strokeStyle=J(V[3],.55),e.lineWidth=1;let W=Math.max(1,Math.round(v.length/(l/26)));for(let P=0;P<v.length;P+=W){let _=v[P];if(_.windDir==null)continue;let X=h(_.t),N=f.y+f.h-5,j=(_.windDir-90+180)*Math.PI/180;e.save(),e.translate(X,N),e.rotate(j),e.beginPath(),e.moveTo(-4,0),e.lineTo(4,0),e.moveTo(4,0),e.lineTo(1.5,-2),e.moveTo(4,0),e.lineTo(1.5,2),e.stroke(),e.restore()}e.restore(),vt(e,f,f.y-11,"wind mph",[{label:"sustained",short:"wind",color:V[3]},{label:"gusts",color:R.serious}],{short:"wind"}),C.push({key:"wind",box:f,yOf:x})}if(D.cloud){let f=D.cloud,T=v.length,x=Math.max(1,l/T),F=[["cloudHigh",J(V[4],.55)],["cloudMid",J(V[0],.5)],["cloudLow",J(Te,.45)]];v.forEach((W,P)=>{let _=u+P*l/T,X=f.y,N=f.h/3;F.forEach(([j,oe],Z)=>{let U=G((W[j]??0)/100,0,1);e.fillStyle=oe,e.fillRect(_,X+(N-2)*(1-U),Math.max(1,x-.5),(N-2)*U),X+=N})}),e.save(),e.font=Pe,e.textAlign="right",e.textBaseline="middle",["HIGH","MID","LOW"].forEach((W,P)=>{let _=f.y+f.h/3*(P+.5);e.fillStyle="rgba(22,33,47,.75)",e.fillRect(f.x+f.w-30,_-5,30,10),e.fillStyle=le,xe(e,W,f.x+f.w-2,_)}),e.restore(),we(e,f.x+2,f.y-11,"cloud decks %"),C.push({key:"cloud",box:f})}if(D.pressure){let f=D.pressure,T=v.map(P=>P.pressure).filter(P=>P!=null),x=Math.min(...T)-1,F=Math.max(...T)+1,W=P=>f.y+f.h-(P-x)/(F-x)*f.h;Ae(e,f,ze(x,F,Be(f.h,2)).map(P=>({v:P,y:W(P)})),P=>(P*.02953).toFixed(2)),ke(e,v.filter(P=>P.pressure!=null).map(P=>[h(P.t),W(P.pressure)]),V[3],{width:1.8,glow:8}),we(e,f.x+2,f.y-11,"pressure inHg"),C.push({key:"pressure",box:f,yOf:W})}if(D.uv){let f=D.uv,T=W=>f.y+f.h-G(W,0,12)/12*f.h;Ae(e,f,[3,6,8,11].map(W=>({v:W,y:T(W)})),String);let x=v.length,F=Math.max(1,l/x-1);v.forEach((W,P)=>{let _=W.uv??0;if(_<=.05)return;let X=u+P*l/x,N=_<3?R.good:_<6?R.warn:_<8?R.serious:_<11?R.crit:V[3];Ge(e,X,T(_),F,f.y+f.h,J(N,.8))}),we(e,f.x+2,f.y-11,"uv index"),C.push({key:"uv",box:f,yOf:T})}if(D.cape){let f=D.cape,T=Math.max(...v.map(W=>W.cape??0),500)*1.1,x=W=>f.y+f.h-G(W,0,T)/T*f.h;Ae(e,f,ze(0,T,Be(f.h,2)).map(W=>({v:W,y:x(W)})),W=>String(Math.round(W)));let F=v.map(W=>[h(W.t),x(W.cape??0)]);e.save(),e.beginPath(),Fe(e,F),e.lineTo(F.at(-1)[0],f.y+f.h),e.lineTo(F[0][0],f.y+f.h),e.closePath(),e.fillStyle=J(R.crit,.18),e.fill(),e.restore(),ke(e,F,R.crit,{width:1.6,glow:7}),we(e,f.x+2,f.y-11,"CAPE J/kg"),C.push({key:"cape",box:f,yOf:x})}if(S){e.save(),e.font=Oe,e.fillStyle=le,e.textAlign="center",e.textBaseline="top";let f=(k.hi-k.lo)/36e5,T=f>200?24:f>96?12:f>40?6:f>16?3:1,x=e.measureText("00:00").width+8,F=l/Math.max(f,1),W=[1,3,6,12,24,48].filter(P=>P>=T).find(P=>P*F>=x)??48;for(let P of v){let _=i.hourOfDay(P.t);if(Math.abs(_-Math.round(_))>.01||Math.round(_)%W!==0)continue;let X=h(P.t);X<u+10||X>u+l-10||e.fillText(i.hm(P.t),X,a-o+4)}e.restore()}if(M!=null&&M>=k.lo&&M<=k.hi&&At(e,h(M),O,J(R.good,.9),"NOW",{dash:[3,3]}),E!=null&&Math.abs(E-(M??E))>9e4&&E>=k.lo&&E<=k.hi&&At(e,h(E),O,V[1],null),s&&s.x>u&&s.x<u+l){let f=g(s.x),T=Io(v,f);if(T){let x=h(T.t);e.save(),e.strokeStyle="rgba(255,255,255,.35)",e.setLineDash([2,3]),e.lineWidth=1,e.beginPath(),e.moveTo(Math.round(x)+.5,p),e.lineTo(Math.round(x)+.5,p+O.h),e.stroke(),e.restore();for(let W of C){if(!W.yOf)continue;let P=W.key==="temp"?T.temp:W.key==="pop"?T.pop??0:W.key==="wind"?T.wind:W.key==="pressure"?T.pressure:W.key==="uv"?T.uv:W.key==="cape"?T.cape:null;P!=null&&(e.save(),e.fillStyle=Te,e.shadowColor=V[0],e.shadowBlur=5,e.beginPath(),e.arc(x,W.yOf(P),3.5,0,Math.PI*2),e.fill(),e.restore())}let F=[`${i.weekday(T.t)} ${i.hm(T.t)}|`];D.temp&&(F.push(`TEMP|${Y.temp(T.temp)}`),F.push(`FEELS|${Y.temp(T.feels)}`)),D.pop&&(F.push(`RAIN CHANCE|${Y.pct(T.pop)}`),(T.precip??0)>.001&&F.push(`AMOUNT|${Y.inches(T.precip)}"`)),D.wind&&F.push(`WIND|${Y.wind(T.wind)} ${fe(T.windDir)}`),D.pressure&&F.push(`PRESSURE|${Y.pressure(T.pressure)}`),D.uv&&F.push(`UV|${T.uv?.toFixed(1)??"--"}`),D.cape&&F.push(`CAPE|${Math.round(T.cape??0)}`),F.push(`SKY|${kt(Math.round(T.code??0)).label}`),Ye(e,x,s.y,F,t,a,"#3fd0d8",{pin:s.coarse})}}return{xOf:h,tOf:g,boxes:D}}function Io(e,t){let a=null,s=1/0;for(let c of e){let w=Math.abs(c.t-t);w<s&&(s=w,a=c)}return a}function Oo(e,t,a,s,{rows:c,tf:w,now:A}){if(!c?.length)return;let k=4,E=34,M=16,i=20,d={x:k,y:M,w:t-k-E,h:a-M-i};if(d.w<30||d.h<20)return;let S=Math.min(...c.map(b=>b.min)),u=Math.max(...c.map(b=>b.max)),r=S-2,p=u+2,o=b=>d.x+(b-c[0].t)/(c.at(-1).t-c[0].t)*d.w,l=b=>d.y+d.h-(b-r)/(p-r)*d.h;Ae(e,d,ze(r,p,Be(d.h,4)).map(b=>({v:b,y:l(b)})),b=>`${Math.round(b)}\xB0`),e.save(),e.beginPath(),c.forEach((b,y)=>y?e.lineTo(o(b.t),l(b.max)):e.moveTo(o(b.t),l(b.max)));for(let b=c.length-1;b>=0;b--)e.lineTo(o(c[b].t),l(c[b].min));e.closePath();let v=e.createLinearGradient(d.x,0,d.x+d.w,0);v.addColorStop(0,J(V[0],.3)),v.addColorStop(1,J(V[0],.1)),e.fillStyle=v,e.fill(),e.strokeStyle=J(V[0],.35),e.lineWidth=1,e.stroke(),e.restore(),ke(e,c.map(b=>[o(b.t),l(b.mean)]),V[0],{width:2,glow:10}),e.save(),e.strokeStyle=ho,e.font=Oe,e.fillStyle=le,e.textAlign="center",e.textBaseline="top";let h="",g=e.measureText("WED").width+8,$=-1e9;for(let b of c){let y=w.isoDate(b.t);if(y===h)continue;h=y;let L=o(b.t);e.beginPath(),e.moveTo(L+.5,d.y),e.lineTo(L+.5,d.y+d.h),e.stroke(),!(L<d.x+12||L>d.x+d.w-12||L-$<g)&&(e.fillText(w.weekday(b.t).toUpperCase(),L,a-i+5),$=L)}if(e.restore(),A>=c[0].t&&A<=c.at(-1).t&&At(e,o(A),d,J(R.good,.9),"NOW",{dash:[3,3]}),vt(e,d,3,"model agreement \xB0F",[{label:"ensemble mean",short:"mean",color:V[0]},{label:"model range",short:"range",color:J(V[0],.35)}],{short:"model spread \xB0F"}),s&&s.x>d.x&&s.x<d.x+d.w){let b=c[0].t+(s.x-d.x)/d.w*(c.at(-1).t-c[0].t),y=Io(c,b);if(y){let L=o(y.t);e.save(),e.strokeStyle="rgba(255,255,255,.3)",e.setLineDash([2,3]),e.beginPath(),e.moveTo(L+.5,d.y),e.lineTo(L+.5,d.y+d.h),e.stroke(),e.restore();let H=y.spread<2?"HIGH":y.spread<5?"MODERATE":y.spread<9?"LOW":"VERY LOW";Ye(e,L,s.y,[`${w.weekday(y.t)} ${w.hm(y.t)}|`,`MEAN|${Y.tempP(y.mean)}`,`RANGE|${Y.temp(y.min)}\u2013${Y.temp(y.max)}`,`SPREAD|${y.spread.toFixed(1)}\xB0`,`CONFIDENCE|${H}`,y.precipAgree!=null?`MODELS WET|${Math.round(y.precipAgree*100)}%`:null].filter(Boolean),t,a,"#3fd0d8",{pin:s.coarse})}}}function Po(e,t,a,s,{days:c,climate:w,tf:A,doyOf:k}){if(!c?.length||!w?.doy?.length)return;let E=4,M=34,i=16,d=20,S={x:E,y:i,w:t-E-M,h:a-i-d};if(S.w<40||S.h<30)return;let u=c.map(y=>{let L=w.doy[k(y.t)];return L?{...y,c:L}:null}).filter(Boolean);if(!u.length)return;let r=u.flatMap(y=>[y.c.recordHigh,y.c.recordLow,y.tmax,y.tmin]).filter(y=>y!=null),p=Math.min(...r)-3,o=Math.max(...r)+3,l=u.length,v=S.w/l,h=y=>S.x+v*(y+.5),g=y=>S.y+S.h-(y-p)/(o-p)*S.h;Ae(e,S,ze(p,o,Be(S.h,4)).map(y=>({v:y,y:g(y)})),y=>`${Math.round(y)}\xB0`),e.save(),e.beginPath(),u.forEach((y,L)=>L?e.lineTo(h(L),g(y.c.recordHigh)):e.moveTo(h(L),g(y.c.recordHigh)));for(let y=l-1;y>=0;y--)e.lineTo(h(y),g(u[y].c.recordLow));e.closePath(),e.fillStyle="rgba(255,255,255,.045)",e.fill(),e.restore(),e.save(),e.beginPath(),u.forEach((y,L)=>L?e.lineTo(h(L),g(y.c.normalHigh)):e.moveTo(h(L),g(y.c.normalHigh)));for(let y=l-1;y>=0;y--)e.lineTo(h(y),g(u[y].c.normalLow));e.closePath(),e.fillStyle="rgba(141,154,171,.20)",e.fill(),e.strokeStyle="rgba(141,154,171,.45)",e.setLineDash([3,3]),e.lineWidth=1,e.stroke(),e.restore();let $=Math.min(15,v*.42);u.forEach((y,L)=>{if(y.tmax==null||y.tmin==null)return;let H=(y.tmax-y.c.normalHigh+(y.tmin-(y.c.normalLow??y.c.normalHigh)))/2,D=G(Math.abs(H)/15,0,1),O=H>=0?qe("#8d9aab","#f2b45a",D):qe("#8d9aab","#7fb2f0",D),C=h(L)-$/2,f=g(y.tmax),T=g(y.tmin);e.save(),e.shadowColor=O,e.shadowBlur=5,e.fillStyle=O;let x=Math.min(4,$/2);e.beginPath(),e.moveTo(C,T-x),e.lineTo(C,f+x),e.quadraticCurveTo(C,f,C+x,f),e.lineTo(C+$-x,f),e.quadraticCurveTo(C+$,f,C+$,f+x),e.lineTo(C+$,T-x),e.quadraticCurveTo(C+$,T,C+$-x,T),e.lineTo(C+x,T),e.quadraticCurveTo(C,T,C,T-x),e.closePath(),e.fill(),e.restore(),y.tmax>=y.c.recordHigh&&(e.save(),e.fillStyle=R.crit,e.font=Oe,e.textAlign="center",e.textBaseline="bottom",xe(e,"REC",h(L),g(y.tmax)-4),e.restore())}),e.save(),e.font=Oe,e.fillStyle=le,e.textAlign="center",e.textBaseline="top";let b=Et(l,S.w,e.measureText("WED").width,{least:l>12?2:1});if(u.forEach((y,L)=>{L%b||De(e,A.weekday(y.t).toUpperCase(),h(L),a-d+5,0,t)}),e.restore(),vt(e,S,3,"forecast vs climate record \xB0F",[{label:"forecast",color:"#f2b45a"},{label:"normal",color:"rgba(141,154,171,.7)",dash:!0},{label:"record range",short:"record",color:"rgba(255,255,255,.2)"}],{short:"climate record \xB0F"}),s&&s.x>S.x&&s.x<S.x+S.w){let y=G(Math.floor((s.x-S.x)/v),0,l-1),L=u[y],H=L.tmax-L.c.normalHigh;Ye(e,h(y),s.y,[`${A.weekday(L.t)} ${A.monthDay(L.t)}|`,`FORECAST|${Y.temp(L.tmin)} \u2013 ${Y.temp(L.tmax)}`,`NORMAL|${Y.temp(L.c.normalLow)} \u2013 ${Y.temp(L.c.normalHigh)}`,`HIGH vs NORMAL|${Y.signed(H)}\xB0`,`RECORD HIGH|${Y.temp(L.c.recordHigh)} (${L.c.recordHighYear})`,`RECORD LOW|${Y.temp(L.c.recordLow)} (${L.c.recordLowYear})`],t,a,H>=0?"#f2b45a":"#7fb2f0",{pin:s.coarse})}}function xo(e,t,a,s,{rows:c,tf:w,now:A}){if(!c?.length)return;let k=4,E=22,M=14,i=18,d={x:k,y:M,w:t-k-E,h:a-M-i};if(d.w<30)return;let S=c.length,u=Math.max(2,d.w/S-2),r=Math.max(5.6,Math.ceil(Math.max(...c.map(h=>h.kp))+.8)),p=h=>d.y+d.h-G(h,0,r)/r*d.h;Ae(e,d,[3,5,7].filter(h=>h<=r).map(h=>({v:h,y:p(h)})),String),e.save(),e.strokeStyle=J(R.serious,.5),e.setLineDash([4,3]),e.lineWidth=1,e.beginPath(),e.moveTo(d.x,p(5)),e.lineTo(d.x+d.w,p(5)),e.stroke(),e.setLineDash([]),e.font=Pe,e.fillStyle=J(R.serious,.8),e.textAlign="left",e.textBaseline="bottom",xe(e,"STORM",d.x+3,p(5)-2),e.restore(),c.forEach((h,g)=>{let $=h.kp<3?V[0]:h.kp<5?R.good:h.kp<6?R.warn:h.kp<7?R.serious:R.crit,b=d.x+g*d.w/S;Ge(e,b,p(Math.min(h.kp,r)),u,d.y+d.h,J($,h.observed==="observed"?.9:.55))}),e.save(),e.font=Oe,e.fillStyle=le,e.textAlign="center",e.textBaseline="top";let o="",l=e.measureText("WED").width+8,v=-1e9;if(c.forEach((h,g)=>{let $=w.isoDate(h.t);if($===o)return;o=$;let b=d.x+g*d.w/S+u/2;b<d.x+10||b>d.x+d.w-10||b-v<l||(e.fillText(w.weekday(h.t).toUpperCase(),b,a-i+4),v=b)}),e.restore(),we(e,d.x+2,2,"planetary K index"),s&&s.x>d.x&&s.x<d.x+d.w){let h=G(Math.floor((s.x-d.x)/d.w*S),0,S-1),g=c[h];Ye(e,d.x+h*d.w/S+u/2,s.y,[`${w.weekday(g.t)} ${w.hm(g.t)}|`,`Kp|${g.kp.toFixed(2)}`,`STATUS|${(g.observed||"predicted").toUpperCase()}`],t,a,V[3],{pin:s.coarse})}}var Pt=(e,t,a)=>a>=6&&a<22;function ie(e,t,a,s,c){return e==null?.5:e>=a&&e<=s?1:e<a?t>=a?1:G((e-t)/(a-t),0,1):c<=s?1:G((c-e)/(c-s),0,1)}var xt={walk:{label:"WALK",icon:"\u{1F6B6}",color:"#3fd0d8",hours:Pt,score(e){return[["temperature",ie(e.feels??e.temp,30,50,75,95),.3],["dry",1-G((e.pop??0)/100,0,1)*.9,.24],["wind",ie(e.wind,-1,0,12,30),.12],["humidity",ie(e.dew,-20,20,60,76),.1],["UV",ie(e.uv,-1,0,5,11),.07],["air quality",ie(e.air?.aqi,-1,0,50,160),.07],["daylight",e.isDay?1:.5,.1]]}},bike:{label:"BIKE",icon:"\u{1F6B2}",color:"#8fdc6a",hours:Pt,score(e){return[["temperature",ie(e.feels??e.temp,25,58,78,98),.26],["dry",1-G((e.pop??0)/100,0,1),.22],["wind",ie(e.gust??e.wind,-1,0,8,24),.24],["visibility",ie(e.vis,0,8e3,1/0,1/0),.08],["UV",ie(e.uv,-1,0,5,11),.05],["air quality",ie(e.air?.aqi,-1,0,50,150),.05],["daylight",e.isDay?1:.35,.1]]}},grill:{label:"GRILL",icon:"\u{1F525}",color:"#f2b45a",hours:Pt,score(e){return[["dry",1-G((e.pop??0)/100,0,1)*1,.34],["temperature",ie(e.temp,35,62,88,104),.24],["wind",ie(e.wind,-1,0,10,22),.24],["daylight or dusk",e.isDay?1:.55,.1],["humidity",ie(e.dew,-20,20,64,78),.08]]}},stargaze:{label:"STARGAZE",icon:"\u2726",color:"#b39dfa",hours:e=>!e.isDay,score(e,t){return[["darkness",e.isDay?0:1,.26],["clear sky",1-G((e.cloud??0)/100,0,1),.32],["no moon",1-G(t?.moonFraction??.5,0,1)*(t?.moonUp?1:.15),.18],["transparency",ie(e.vis,0,2e4,1/0,1/0),.1],["low humidity",ie(e.rh,-1,0,65,100),.08],["calm",ie(e.wind,-1,0,8,28),.06]]}},photo:{label:"PHOTO",icon:"\u25CE",color:"#f07aa6",hours:(e,t)=>!!e.isDay||t?.sunAltDeg!=null&&t.sunAltDeg>-8,score(e,t){let a=t?.sunAltDeg==null?.4:Math.exp(-Math.pow((t.sunAltDeg-3)/7,2)),s=1-Math.abs((e.cloud??50)/100-.45)*1.6;return[["golden light",G(a,0,1),.4],["sky texture",G(s,0,1),.26],["dry",1-G((e.pop??0)/100,0,1)*.7,.18],["clarity",ie(e.vis,0,15e3,1/0,1/0),.16]]}},swim:{label:"SWIM",icon:"\u{1F3CA}",color:"#7fb2f0",hours:(e,t,a)=>!!e.isDay&&a>=7&&a<20,score(e){let t=[95,96,99].includes(Number(e.code));return[["temperature",ie(e.feels??e.temp,65,80,95,105),.34],["dry",1-G((e.pop??0)/100,0,1),.18],["no thunder",t?0:1,.1],["sunshine",ie(e.cloud,-1,0,40,100),.12],["wind",ie(e.wind,-1,0,10,25),.12],["UV",ie(e.uv,-1,2,7,11),.08],["air quality",ie(e.air?.aqi,-1,0,50,150),.06]]}},openWindows:{label:"OPEN UP",icon:"\u{1FA9F}",color:"#5cd6bc",hours:Pt,score(e){return[["comfortable air",ie(e.temp,40,62,76,90),.34],["dry air",ie(e.dew,-20,25,58,70),.24],["clean air",ie(e.air?.aqi,-1,0,50,130),.22],["no rain",1-G((e.pop??0)/100,0,1),.12],["calm",ie(e.wind,-1,0,14,34),.08]]}}},Ht=Object.keys(xt),Rt=e=>xt[e];function Nt(e,t,a){let s=xt[e];if(!s||!t)return null;let c=s.score(t,a),w=0;for(let[,E,M]of c)w+=G(E,0,1)*M;let A=null,k=0;for(let[E,M,i]of c){let d=(1-G(M,0,1))*i;d>k&&(k=d,A=E)}return{score:Math.round(G(w,0,1)*100),limiter:k>.06?A:null,parts:c.map(([E,M,i])=>({name:E,value:G(M,0,1),weight:i}))}}function Cn(e,t){let a=e.fmt?.hourOfDay?e.fmt.hourOfDay(t):NaN;return Number.isFinite(a)?a:new Date(t).getHours()}function Ho(e,t,a=36){let s=xt[e];if(!s)return[];let c=Date.now(),w=c+a*36e5;return t.hours.filter(A=>A.t>=c-18e5&&A.t<=w).map(A=>{let k=Dn(t,A.t),E=s.hours?!!s.hours(A,k,Cn(t,A.t)):!0;return{t:A.t,eligible:E,...Nt(e,{...A,air:Ln(t,A.t)},k)}})}function Ro(e,t,{hours:a=36,at:s=90}={}){let w=Ho(e,t,a).filter(A=>A.eligible);return{great:w.filter(A=>A.score>=s).length,eligible:w.length}}function Ft(e,t,{hours:a=36,limit:s=3,minScore:c=55}={}){let w=Ho(e,t,a);if(!w.length)return[];for(let M of w)M.eligible||(M.score=-1/0);let A=12,k=new Array(w.length).fill(!1),E=[];for(let M=0;M<s;M++){let i=-1;for(let o=0;o<w.length;o++)k[o]||w[o].score<c||(i<0||w[o].score>w[i].score)&&(i=o);if(i<0)break;let d=w[i].score,S=Math.max(c,d-A),u=i,r=i;for(;u-1>=0&&!k[u-1]&&w[u-1].score>=S;)u--;for(;r+1<w.length&&!k[r+1]&&w[r+1].score>=S;)r++;for(let o=u;o<=r;o++)k[o]=!0;let p=0;for(let o=u;o<=r;o++)p+=w[o].score;E.push({start:w[u].t,end:w[r].t+36e5,peakAt:w[i].t,peak:d,avg:Math.round(p/(r-u+1)),hours:r-u+1,limiter:w[i].limiter,parts:w[i].parts})}return E.sort((M,i)=>i.peak-M.peak||M.start-i.start)}function Ln(e,t){if(!e.air?.length)return null;let a=null,s=1/0;for(let c of e.air){let w=Math.abs(c.t-t);w<s&&(s=w,a=c)}return s<36e5*2?a:null}function Dn(e,t){let a=e.frame(t);return a?{sunAltDeg:a.sun.altDeg,moonFraction:a.moon.fraction,moonUp:a.moon.altDeg>0}:{}}function gt(e){let t=Date.now(),a=t+6*36e5,s=(e.min15?.length?e.min15:e.hours).filter(E=>E.t>=t-9e5&&E.t<=a);if(s.length<2)return null;let c=.002,w=(s[0].precip??0)>=c,A=null;for(let E of s)if((E.precip??0)>=c!==w){A=E;break}let k=s.reduce((E,M)=>(M.precip??0)>(E.precip??0)?M:E,s[0]);return{raining:w,changeAt:A?.t??null,minutes:A?Math.round((A.t-t)/6e4):null,peak:k.precip??0,peakAt:k.t,resolution:e.min15?.length?15:60,series:s.map(E=>({t:E.t,p:E.precip??0}))}}function No(e,t){return e?e.raining?e.minutes!=null?`Rain now \u2014 easing in about ${e.minutes} min`:"Rain now \u2014 no let-up in the next 6 hours":e.minutes!=null&&e.minutes<=240?`${e.peak>.08?"Heavy rain":e.peak>.02?"Rain":"Light rain"} starting in ${e.minutes} min (${t.hm(e.changeAt)})`:null:null}var Bt=e=>e<0?0:e>1?1:e,he=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function Fo(e,t,a={},s={}){if(!t)return null;let c=he(t.temperature_2m),w=String(a.temperature_2m||"").includes("F"),A=he(t.wind_speed_10m),k=/mp\/?h|mph/i.test(String(a.wind_speed_10m||"")),E=he(t.precipitation),M=/inch/i.test(String(a.precipitation||""));return{name:e,tempRaw:c,tempC:c===null?null:w?(c-32)/1.8:c,windKmh:A===null?null:k?A*1.609344:A,precipMm:E===null?null:M?E*25.4:E,cloudPct:he(t.cloud_cover),night:t.is_day===0,...s}}function yt(e){let t=he(e?.tempC);if(t===null)return null;let a=Bt(1-Math.abs(t-21)/18),s=Bt(1-(he(e?.precipMm)??0)/2),c=Bt(1-(he(e?.cloudPct)??0)/100*.6),w=Bt(1-Math.max(0,(he(e?.windKmh)??0)-20)/40);return Math.round(100*(.4*a+.3*s+.2*c+.1*w))}function zt(e){let t=he(e?.precipMm)??0,a=he(e?.cloudPct),s=he(e?.windKmh)??0;return t>=.5?"raining":t>0?"drizzling":s>=20+40/2?"blowing hard":a===null?null:a<=15?"clear":a<=45?"some cloud":a<=80?"cloudy":"overcast"}function In(e,t){let a=yt(e),s=yt(t);if(s===null)return null;let c=he(t.tempC)!==null&&he(e?.tempC)!==null?Math.round(t.tempC-e.tempC):null,w=he(t.tempRaw)!==null&&he(e?.tempRaw)!==null?Math.round(t.tempRaw-e.tempRaw):null;return{name:t.name,score:s,deltaScore:a===null?null:s-a,deltaC:c,deltaShown:w===null?c:w,better:a!==null&&s>a,headline:zt(t),tempC:he(t.tempC),localHour:he(t.localHour),night:t.night===!0}}function Bo(e,t){let a=(Array.isArray(t)?t:[]).map(s=>In(e,s)).filter(Boolean);return a.sort((s,c)=>c.score-s.score||(c.deltaC??0)-(s.deltaC??0)||String(s.name).localeCompare(String(c.name))),a}function eo(e){if(!e)return"";let t=[],a=e.deltaShown??e.deltaC;return a!==null&&a!==0?t.push(`${Math.abs(a)}\xB0 ${a>0?"warmer":"colder"}`):a===0&&t.push("same temperature"),e.headline&&t.push(e.headline),e.night&&e.localHour!==null&&t.push(`${e.localHour}:00 there`),t.join(", ")}function zo(e,t){if(!t.length)return"Nowhere to compare against right now.";let a=t.filter(w=>w.better);if(!a.length)return`Nowhere on the list beats ${e} right now.`;let s=a[0],c=a.length-1;return`${s.name} is better than ${e} right now \u2014 ${eo(s)}.`+(c>0?` So ${c===1?"is one other":`are ${c} others`}.`:"")}var On="../countdown/stats.json",Wo=[{place:"San Francisco, California",lat:37.7749,lon:-122.4194},{place:"Vancouver, Canada",lat:49.2497,lon:-123.1193},{place:"Grants Pass, Oregon",lat:42.4393,lon:-123.3307}],Pn=600*1e3;function Uo(e){e.className="panel elsewhere",e.innerHTML=`
    <div class="hd">ELSEWHERE<span class="rule"></span><span class="val" id="ew-count">\u2014</span></div>
    <div class="body">
      <div class="ew-list" id="ew-list"><div class="ew-empty">Looking\u2026</div></div>
      <p class="ew-say" id="ew-say"></p>
    </div>`;let t=S=>e.querySelector(`#${S}`),a=null,s=0,c=[],w="",A=!1;async function k(){if(a)return a;try{let S=await(await fetch(new URL(On,location.href),{cache:"no-cache"})).json(),u=Array.isArray(S?.trips)?S.trips:[],r=new Date,p=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`,o=v=>typeof v.date!="string"||(v.date.length===7?`${v.date}-01`:v.date)<=p,l=new Set;a=u.filter(v=>v&&typeof v.lat=="number"&&typeof v.lon=="number"&&o(v)&&typeof v.place=="string"&&!l.has(v.place)&&l.add(v.place)),a.length||(console.warn("ELSEWHERE: trip list had no usable coordinates; using the fallback"),a=Wo)}catch(S){console.warn("ELSEWHERE: could not read the trip list, using the fallback \u2014",S.message),a=Wo}return a}async function E(S){try{let r=(await ve.bundle(S.lat,S.lon))?.forecast?.data;if(!r?.current)return null;let p=Number(String(r.current.time||"").slice(11,13));return Fo(S.place,r.current,r.current_units,{localHour:Number.isFinite(p)?p:null})}catch{return null}}async function M(){let S=n.loc;if(!S||A)return;let u=`${S.lat?.toFixed(2)},${S.lon?.toFixed(2)}`;if(!(u===w&&Date.now()-s<Pn)){A=!0;try{let r=await k(),p=await E({place:S.name||"here",lat:S.lat,lon:S.lon});if(!p)return;let o=(await Promise.all(r.map(E))).filter(Boolean);c=Bo(p,o),w=u,s=Date.now(),i(p),d(p)}finally{A=!1}}}function i(S){let u=yt(S),r=c.filter(l=>l.better);if(t("ew-count").textContent=c.length?r.length?`${r.length} better`:"none better":"\u2014",!c.length){t("ew-list").innerHTML='<div class="ew-empty">No places to compare.</div>',t("ew-say").textContent="";return}let p=l=>`
      <div class="ew-row${l.better?" is-better":""}">
        <span class="ew-name">${te(l.name)}</span>
        <span class="ew-what">${te(eo(l))}</span>
      </div>`,o=`
      <div class="ew-here">
        <span class="ew-name">${te(S.name)}</span>
        <span class="ew-what">here \xB7 ${te(zt(S)||"")}${Number.isFinite(u)?` \xB7 ${u}/100`:""}</span>
      </div>`;t("ew-list").innerHTML=r.map(p).join("")+o+c.filter(l=>!l.better).map(p).join(""),t("ew-say").textContent=zo(S.name,c)}async function d(S){try{let u={here:S.name,hereSky:zt(S),hereScore:yt(S),rows:c.map(o=>({name:o.name,delta:o.deltaShown??o.deltaC,sky:o.headline,better:o.better,night:o.night}))},r=btoa(unescape(encodeURIComponent(JSON.stringify(u)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),p=await ve.elsewhere(r);p?.text&&w&&(t("ew-say").textContent=p.text)}catch{}}return{update(){M()},onHide(){}}}function _o(e){e.className="view deck active",e.innerHTML=`
    <div class="panel hero">
      <div class="hd">CURRENT<span class="rule"></span><span class="val" id="d-obs">\u2014</span></div>
      <div class="body">
        <div class="hero-top">
          <div>
            <div class="hero-temp chroma num" id="d-temp">--<sup>\xB0F</sup></div>
            <div class="hero-cond neon" id="d-cond">\u2014</div>
            <div class="hero-feels">feels like <b id="d-feels">--</b> \xB7 dew point <b id="d-dew">--</b></div>
            <div class="hero-obs" id="d-obsline"></div>
          </div>
          <div class="hero-glyph" id="d-glyph">\u25CC</div>
        </div>
        <div class="hero-range">
          <div class="stat"><div class="c">today high</div><div class="v" id="d-hi">--</div></div>
          <div class="stat"><div class="c">today low</div><div class="v" id="d-lo">--</div></div>
          <div class="stat"><div class="c">vs normal</div><div class="v" id="d-anom">--</div></div>
        </div>
        <div class="hero-spark"><canvas class="chart" id="d-spark"></canvas></div>
        <div class="hero-sun">
          <div class="stat"><div class="c">sunrise</div><div class="v" id="d-sunrise" style="font-size:.95rem">--</div></div>
          <div class="stat"><div class="c">sunset</div><div class="v" id="d-sunset" style="font-size:.95rem">--</div></div>
          <div class="stat"><div class="c">daylight</div><div class="v" id="d-daylight" style="font-size:.95rem">--</div></div>
        </div>
      </div>
    </div>

    <div class="panel meteo bare">
      <canvas class="chart fill" id="d-meteo"></canvas>
    </div>

    <div class="side">
      <div class="panel" id="d-alertPanel" style="--ac:var(--rd); display:none">
        <div class="hd">ACTIVE ALERTS<span class="rule"></span><span class="val" id="d-alertN">0</span></div>
        <div class="body" id="d-alerts"></div>
      </div>

      <div class="panel">
        <div class="hd" style="--ac:var(--ice)">NOWCAST<span class="rule"></span><span class="val" id="d-ncres">\u2014</span></div>
        <div class="body nowcast">
          <div class="nowcast-line" id="d-ncline">\u2014</div>
          <div class="nowcast-bars"><canvas class="chart" id="d-nc"></canvas></div>
          <div class="nowcast-scale"><span>NOW</span><span>+2h</span><span>+4h</span><span>+6h</span></div>
        </div>
      </div>

      <!--
        Above SUN & MOON deliberately. The column scrolls, and at 900px only
        three panels are above the fold \u2014 sun and moon are also the whole top
        half of the SKY view, while this is the only place ELSEWHERE appears.
      -->
      <div id="d-elsewhere"></div>

      <div class="panel grow">
        <div class="hd" style="--ac:var(--vi)">SUN &amp; MOON<span class="rule"></span><span class="val" id="d-moonname">\u2014</span></div>
        <div class="body sunmoon-body"><canvas id="d-moondisc"></canvas><div id="d-sunmoon" style="flex:1;min-width:0"></div></div>
      </div>
    </div>

    <div class="panel gauge">
      <div class="hd">INSTRUMENTS<span class="rule"></span><span class="val" id="d-instnote">\u2014</span></div>
      <div class="body">
        <div class="gauge-cell"><canvas class="chart" id="g-wind"></canvas><div class="gauge-note" id="n-wind"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-hum"></canvas><div class="gauge-note" id="n-hum"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-pres"></canvas><div class="gauge-note" id="n-pres"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-uv"></canvas><div class="gauge-note" id="n-uv"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-aqi"></canvas><div class="gauge-note" id="n-aqi"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-vis"></canvas><div class="gauge-note" id="n-vis"></div></div>
      </div>
    </div>

    <div class="panel act">
      <div class="hd" style="--ac:var(--lm)">ACTIVITY WINDOWS<span class="rule"></span><span class="val">NEXT 36H</span></div>
      <div class="body" id="d-act"></div>
    </div>

    <div class="panel tenday">
      <div class="hd" style="--ac:var(--am)">16-DAY OUTLOOK<span class="rule"></span><span class="val" id="d-tdnote">\u2014</span></div>
      <div class="body"><div class="tenday-grid" id="d-tenday"></div></div>
    </div>
  `;let t=o=>e.querySelector("#"+o),a=Uo(t("d-elsewhere")),s=ce(t("d-meteo"),(o,l,v,h)=>{let g=Date.now();Ot(o,l,v,h,{hours:n.hours,days:n.days,tf:n.fmt,span:{lo:n.cursor-12*36e5,hi:n.cursor+36*36e5},cursor:n.cursor,now:g,panels:["temp","pop","wind"]})},{onPick:({x:o,w:l})=>{let v=n.cursor-432e5,h=n.cursor+36*36e5,g=l-34;n.playing=!1,n.scrubTo(v+(o-4)/g*(h-v))}}),c=ce(t("d-spark"),(o,l,v)=>{let h=n.hours.filter($=>$.t>=n.cursor-36e5&&$.t<=n.cursor+864e5);if(h.length<2)return;let g=wo(o,{x:0,y:4,w:l,h:v-14},h.map($=>$.temp),{color:V[0],glow:9});o.save(),o.font="500 11.5px 'JetBrains Mono', monospace",o.fillStyle=le,o.textAlign="center",o.textBaseline="bottom";for(let $=0;$<h.length;$+=6)De(o,n.fmt.hour(h[$].t).replace(/\s/g,""),$/(h.length-1)*l,v,0,l);o.restore(),g?.length&&(o.save(),o.fillStyle=Te,o.shadowColor=V[0],o.shadowBlur=5,o.beginPath(),o.arc(g[1]?.[0]??g[0][0],g[1]?.[1]??g[0][1],3,0,Math.PI*2),o.fill(),o.restore())}),w=ce(t("d-moondisc"),(o,l,v)=>{let h=n.frame();h&&Ct(o,l/2,v/2,Math.max(10,Math.min(l,v)/2-3),h.moon.phase,h.moon.fraction)}),A=ce(t("d-nc"),(o,l,v)=>{let h=gt(n);if(!h?.series?.length)return;let g=Math.max(...h.series.map(y=>y.p),.02),$=h.series.length,b=Math.max(1,l/$-.6);h.series.forEach((y,L)=>{let H=L*l/$,D=y.p>0?Math.max(1.5,y.p/g*v):0;D&&Ge(o,H,v-D,b,v,J(y.p>.08?R.crit:y.p>.02?V[0]:V[4],.9),2)}),o.save(),o.strokeStyle="rgba(255,255,255,.10)",o.beginPath(),o.moveTo(0,v-.5),o.lineTo(l,v-.5),o.stroke(),o.restore()}),k=[["g-wind",(o,l,v)=>{let h=n.frame(),g=Math.min(l,v)/2-16;bo(o,l/2,v/2-4,Math.max(14,g),{dir:h?.windDir,speed:h?.wind,gust:h?.gust,color:V[3]})}],["g-hum",(o,l,v)=>{let h=n.frame(),g=Math.min(l,v)/2-18;Ve(o,l/2,v/2-6,Math.max(14,g),{value:h?.rh,min:0,max:100,color:V[4],label:"humidity",unit:"%",sub:h?_e(h.dew).name:""})}],["g-pres",(o,l,v)=>{let h=n.frame(),g=Math.min(l,v)/2-18,$=h?.pressure?h.pressure*.029529983:null;Ve(o,l/2,v/2-6,Math.max(14,g),{value:$,min:28.5,max:31,color:V[3],label:"pressure",unit:"inHg",decimals:2,sub:E()})}],["g-uv",(o,l,v)=>{let h=n.frame(),g=Math.min(l,v)/2-18;Ve(o,l/2,v/2-6,Math.max(14,g),{value:h?.uv,min:0,max:12,color:Ue(h?.uv).color,label:"uv index",unit:"index",decimals:1,sub:Ue(h?.uv).name,bands:[{from:0,to:3,color:R.good},{from:3,to:6,color:R.warn},{from:6,to:8,color:R.serious},{from:8,to:11,color:R.crit},{from:11,to:12,color:V[3]}]})}],["g-aqi",(o,l,v)=>{let g=n.frame()?.air?.aqi??n.airNow?.aqi,$=Re(g),b=Math.min(l,v)/2-18;Ve(o,l/2,v/2-6,Math.max(14,b),{value:g,min:0,max:200,color:$.color,label:"air quality",unit:"US AQI",sub:$.name.length>12?"SENSITIVE":$.name,bands:[{from:0,to:50,color:R.good},{from:50,to:100,color:R.warn},{from:100,to:150,color:R.serious},{from:150,to:200,color:R.crit}]})}],["g-vis",(o,l,v)=>{let h=n.frame(),g=h?.vis!=null?h.vis/1609.344:null,$=Math.min(l,v)/2-18;Ve(o,l/2,v/2-6,Math.max(14,$),{value:g==null?null:Math.min(g,10),min:0,max:10,color:V[0],label:"visibility",unit:"miles",decimals:1,sub:g==null?"":g>=9?"CLEAR":g>=3?"HAZY":g>=1?"POOR":"FOG"})}]].map(([o,l])=>ce(t(o),l));function E(){let o=n.cursor,l=n.hours.find(g=>g.t>=o-3*36e5),v=n.hours.find(g=>g.t>=o);if(!l?.pressure||!v?.pressure)return"";let h=(v.pressure-l.pressure)*.029529983;return Math.abs(h)<.02?"STEADY":h>0?`RISING ${h.toFixed(2)}`:`FALLING ${Math.abs(h).toFixed(2)}`}function M(){let o=n.frame();if(!o)return;let l=n.fmt;t("d-temp").innerHTML=`${o.temp==null?"--":Math.round(o.temp)}<sup>\xB0F</sup>`,t("d-cond").textContent=o.wx.label,t("d-glyph").textContent=Zt(Math.round(o.code??0),o.isDay>.5),t("d-feels").textContent=Y.temp(o.feels),t("d-dew").textContent=Y.temp(o.dew),t("d-obs").textContent=n.atNow?`LIVE \xB7 ${Yt(n.lastFetch)}`:`PROJECTED \xB7 ${l.hm(n.cursor)}`;let v=n.observed,h=t("d-obsline");if(n.atNow&&v?.tempF!=null){let P=o.temp!=null?o.temp-v.tempF:null;h.innerHTML=`observed <b>${Math.round(v.tempF)}\xB0</b><span> \xB7 ${te(v.name||v.station)} ${v.distanceMi} mi \xB7 ${Yt(Date.parse(v.time))}</span>`+(P!=null&&Math.abs(P)>=1.5?`<em> \xB7 model runs ${Y.signed(P,0)}\xB0</em>`:""),h.style.display=""}else h.style.display="none";let g=o.day;t("d-hi").textContent=Y.temp(g?.tmax),t("d-lo").textContent=Y.temp(g?.tmin);let $=t("d-anom"),b=n.climate?.doy?.[p(n.cursor)];if(b&&g?.tmax!=null){let P=g.tmax-b.normalHigh;$.textContent=`${Y.signed(P,1)}\xB0`,$.style.color=Math.abs(P)<2?Le:P>0?"#f2b45a":"#7fb2f0"}else $.textContent="--",$.style.color="";let y=n.sunTimesFor();t("d-sunrise").textContent=l.hm(y.sunrise),t("d-sunset").textContent=l.hm(y.sunset),t("d-daylight").textContent=g?.daylight?et(g.daylight):"--";let L=n.alerts,H=t("d-alertPanel");H.style.display=L.length?"":"none",t("d-alertN").textContent=String(L.length),t("d-alerts").innerHTML=L.slice(0,4).map(P=>`
      <div class="alert-item" style="--ac:${ut(P.event,P.severity)}">
        <b>${te(P.event||"Alert")}</b>
        <span>until ${l.weekday(P.expires||P.ends)} ${l.hm(P.expires||P.ends)}</span>
      </div>`).join("");let D=gt(n),O=No(D,l),C=t("d-ncline");if(O)C.textContent=O,C.className="nowcast-line wet";else{let P=n.hours.find(_=>_.t>Date.now()&&(_.pop??0)>=40);C.textContent=P?`Dry for 6+ hours. Next real chance ${l.weekday(P.t)} ${l.hm(P.t)} (${Math.round(P.pop)}%).`:"Dry. No meaningful precipitation in the forecast window.",C.className="nowcast-line"}t("d-ncres").textContent=D?`${D.resolution}-MIN`:"\u2014";let f=o.moon,T=n.moonTimesFor();t("d-moonname").textContent=`${Math.round(f.fraction*100)}% LIT`,t("d-sunmoon").innerHTML=`
      <dl style="margin:0">
        ${u("Sun altitude",`${o.sun.altDeg.toFixed(1)}\xB0 ${fe(o.sun.compass)}`)}
        ${u("Golden hour",`${l.hm(y.goldenHour)} \u2013 ${l.hm(y.sunset)}`)}
        ${u("Blue hour",`${l.hm(y.sunset)} \u2013 ${l.hm(y.dusk)}`)}
        ${u("Astro dark",isNaN(+y.night)?"none tonight":l.hm(y.night))}
        ${u("Moon",`${r(f.phase)}`)}
        ${u("Moon alt",`${f.altDeg.toFixed(1)}\xB0 ${fe(f.compass)}`)}
        ${u("Moonrise",T.rise?l.hm(T.rise):"\u2014")}
        ${u("Moonset",T.set?l.hm(T.set):"\u2014")}
      </dl>`;let x=Tt(o.wind);t("n-wind").textContent=`${x.name} \xB7 from ${fe(o.windDir)}`,t("n-hum").textContent=_e(o.dew).note,t("n-pres").textContent=o.pressure?`${Math.round(o.pressure)} hPa`:"";let F=Mt(o.uv,n.settings.skinType);t("n-uv").textContent=F==null?"no burn risk":F>180?"burn risk negligible":`burn in ~${F} min`;let W=o.air?.aqi??n.airNow?.aqi;t("n-aqi").textContent=o.air?.pm25!=null?`PM2.5 ${o.air.pm25.toFixed(1)} \xB5g/m\xB3`:W!=null?"":"no data",t("n-vis").textContent=o.vis!=null?`${(o.vis/1609.344).toFixed(1)} mi`:"",t("d-instnote").textContent=n.atNow?"LIVE":l.hm(n.cursor),d(),S(),w.render();for(let P of k)P.render();s.render(),c.render(),A.render()}let i=null;function d(){let o=n.fmt,l=g=>`${o.weekday(g)} ${o.hour(g)}`,v=(g,$)=>o.isoDate(g)===o.isoDate($)?`${o.weekday(g)} ${o.hour(g)}\u2013${o.hour($)}`:`${l(g)} \u2013 ${l($)}`,h=Ht.map(g=>{let $=Rt(g),b=Ft(g,n,{hours:36,limit:1,minScore:50})[0],y=Ro(g,n,{hours:36,at:90});return{k:g,meta:$,w:b,g:y}}).sort((g,$)=>$.g.great-g.g.great||($.w?.peak??0)-(g.w?.peak??0));t("d-act").innerHTML=h.map(({k:g,meta:$,w:b,g:y})=>{let L=y.great,H=y.eligible?L/y.eligible:0,D=L>0?R.good:(b?.peak??0)>=60?R.warn:R.serious,O=b?`<b class="act-best">Best ${l(b.peakAt)}</b><span class="act-good">Good ${v(b.start,b.end)}</span>`+(L===0?`<span class="act-note">Best hour scores ${b.peak}/100</span>`:"")+(b.limiter?`<span class="act-note">Held back by ${b.limiter}</span>`:""):'<span class="act-note">No good time in the next 36 hours</span>',C=i===g&&b,f=b?b.parts.map(T=>{let x=Math.round((1-T.value)*T.weight*100);return`<span class="act-factor"><span class="act-fname">${T.name}</span><span class="meter act-fbar" style="--ac:${x===0?R.good:T.value>=.6?R.warn:R.serious}"><i style="width:${Math.round(T.value*100)}%"></i></span><span class="act-fpts">${x?"\u2212"+x:"full marks"}</span></span>`}).join(""):"";return`
        <button type="button" class="act-row" data-act="${g}" aria-expanded="${C?"true":"false"}"
                aria-controls="act-why-${g}"${b?"":" disabled"}>
          <span class="act-icon" style="color:${$.color}">${$.icon}</span>
          <span class="act-text">
            <span class="act-name">${$.label}</span>
            <span class="act-when">${O}</span>
            <span class="meter act-bar" style="--ac:${D}"><i style="width:${Math.round(H*100)}%"></i></span>
          </span>
          <span class="act-score" style="color:${D}">${L}<small class="act-unit">great hours</small></span>
        </button>
        <div class="act-why" id="act-why-${g}"${C?"":" hidden"}>
          <span class="act-whyhd">Why the best hour (${b?l(b.peakAt):""}) scores ${b?.peak??0}</span>${f}
        </div>`}).join("")}t("d-act").addEventListener("click",o=>{let l=o.target.closest(".act-row");!l||l.disabled||(i=i===l.dataset.act?null:l.dataset.act,d(),t("d-act").querySelector(`.act-row[data-act="${l.dataset.act}"]`)?.focus())}),t("d-act").addEventListener("keydown",o=>{if(o.key!=="Escape"||!i)return;let l=i;i=null,d(),t("d-act").querySelector(`.act-row[data-act="${l}"]`)?.focus()});function S(){let o=n.fmt,l=o.isoDate(Date.now()),v=n.days.filter(y=>y.tmax!=null&&o.isoDate(y.t)>=l);if(!v.length)return;let h=Math.min(...v.map(y=>y.tmin)),g=Math.max(...v.map(y=>y.tmax)),$=o.isoDate(Date.now()),b=o.isoDate(n.cursor);t("d-tenday").innerHTML=v.map(y=>{let L=o.isoDate(y.t),H=(g-y.tmax)/(g-h||1)*100,D=(y.tmin-h)/(g-h||1)*100,O=`linear-gradient(to top, ${$e(y.tmin)}, ${$e(y.tmax)})`;return`
        <div class="tenday-col ${L===$?"today":""} ${L===b?"cursor":""}" data-t="${y.t}">
          <div class="td-day">${L===$?"TODAY":o.weekday(y.t)}</div>
          <div class="td-date">${o.monthDay(y.t)}</div>
          <div class="td-glyph" title="${kt(Math.round(y.code)).long}">${Zt(Math.round(y.code),!0)}</div>
          <div class="td-hi">${Math.round(y.tmax)}\xB0</div>
          <div class="td-bar"><i style="top:${H}%;bottom:${D}%;background:${O};box-shadow:0 0 8px ${$e(y.tmax)}66"></i></div>
          <div class="td-lo">${Math.round(y.tmin)}\xB0</div>
          <div class="td-pop">${(y.pop??0)>=10?`${Math.round(y.pop)}%`:""}</div>
        </div>`}).join(""),t("d-tdnote").textContent=`${v.length} DAYS AHEAD`,t("d-tenday").querySelectorAll(".tenday-col").forEach(y=>{y.addEventListener("click",()=>{n.playing=!1,n.scrubTo(+y.dataset.t+13*36e5)})})}let u=(o,l)=>`<div class="kv"><dt>${o}</dt><dd>${l}</dd></div>`,r=o=>["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"][Math.round((o%1+1)%1*8)%8],p=o=>{let l=n.fmt.isoDate(o),[,v,h]=l.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][v-1]+h-1};return{update(){M(),a.update()},onHide(){a.onHide()}}}var rt="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas",Ut="grayscale(1) brightness(1.18) contrast(1.05) sepia(.6) hue-rotate(170deg) saturate(1.3)",_t="grayscale(1) brightness(1.9) contrast(1.1) sepia(.4) hue-rotate(170deg) saturate(.8)";var ge={lonToWorld:(e,t)=>(e+180)/360*Math.pow(2,t)*256,latToWorld:(e,t)=>{let a=Math.sin(Math.max(-85.05,Math.min(85.05,e))*Math.PI/180);return(.5-Math.log((1+a)/(1-a))/(4*Math.PI))*Math.pow(2,t)*256},worldToLon:(e,t)=>e/(Math.pow(2,t)*256)*360-180,worldToLat:(e,t)=>{let a=Math.PI-2*Math.PI*e/(Math.pow(2,t)*256);return 180/Math.PI*Math.atan(.5*(Math.exp(a)-Math.exp(-a)))}},Je=new Map,Wt=0,xn=[1500,4e3];function Go(e,t,a){let s=new Image;t.img=s,t.state="loading",Wt++,s.crossOrigin="anonymous",s.onload=()=>{t.state="ok",Wt--,a?.()},s.onerror=()=>{Wt--;let c=xn[t.tries++];if(c===void 0){t.state="err";return}setTimeout(()=>{Je.get(e)===t&&Go(e,t,a)},c)},s.src=e}function qo(e,t){let a=Je.get(e);if(a)return a.state==="ok"?a.img:null;if(Wt>24)return null;let s={img:null,state:"loading",tries:0};if(Je.set(e,s),Go(e,s,t),Je.size>600){let c=Math.floor(150);for(let w of Je.keys()){if(c--<=0)break;Je.delete(w)}}return null}var Hn=10,it=class{constructor(t,{center:a=[0,0],zoom:s=7,minZoom:c=2,maxZoom:w=12,onMove:A,onTap:k}={}){this.canvas=t,this.ctx=t.getContext("2d"),this.lat=a[0],this.lon=a[1],this.zoom=s,this.minZoom=c,this.maxZoom=w,this.onMove=A,this.onTap=k,this.layers=[],this.overlays=[],this.dirty=!0,this.w=0,this.h=0,this._raf=null,this._bind(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(t),this.resize()}resize(){let t=Math.min(window.devicePixelRatio||1,2),a=this.canvas.clientWidth,s=this.canvas.clientHeight;!a||!s||(this.canvas.width=Math.round(a*t),this.canvas.height=Math.round(s*t),this.ctx.setTransform(t,0,0,t,0,0),this.w=a,this.h=s,this.invalidate())}invalidate(){this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=null,this.render()}))}setView(t,a,s){this.lat=t,this.lon=a,s!=null&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,s))),this.invalidate(),this.onMove?.(this)}project(t,a){let s=this.zoom;return[ge.lonToWorld(a,s)-ge.lonToWorld(this.lon,s)+this.w/2,ge.latToWorld(t,s)-ge.latToWorld(this.lat,s)+this.h/2]}unproject(t,a){let s=this.zoom;return[ge.worldToLat(ge.latToWorld(this.lat,s)+a-this.h/2,s),ge.worldToLon(ge.lonToWorld(this.lon,s)+t-this.w/2,s)]}_placeAt(t,a,s,c){let w=this.zoom;this.lon=ge.worldToLon(ge.lonToWorld(a,w)+this.w/2-s,w),this.lat=Math.max(-85,Math.min(85,ge.worldToLat(ge.latToWorld(t,w)+this.h/2-c,w)))}_zoomAbout(t,a,s){let[c,w]=this.unproject(t,a);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,s)),this._placeAt(c,w,t,a)}_bind(){let t=this.canvas,a=new Map,s=null,c=null,w=M=>({x:M.clientX-c.left,y:M.clientY-c.top}),A=()=>{let M=[...a.values()];return{n:M.length,x:M.reduce((i,d)=>i+d.x,0)/M.length,y:M.reduce((i,d)=>i+d.y,0)/M.length,span:M.length<2?0:Math.hypot(M[0].x-M[1].x,M[0].y-M[1].y)}},k=()=>{if(!a.size){s=null;return}let M=A(),[i,d]=this.unproject(M.x,M.y);s={lat:i,lon:d,span:M.span,zoom:this.zoom}};t.addEventListener("pointerdown",M=>{if(a.size>=2)return;c=t.getBoundingClientRect();let i=w(M);a.set(M.pointerId,{...i,x0:i.x,y0:i.y});try{t.setPointerCapture(M.pointerId)}catch{}k(),t.style.cursor="grabbing"}),t.addEventListener("pointermove",M=>{if(!s||!a.has(M.pointerId))return;let i=a.get(M.pointerId);a.set(M.pointerId,{...w(M),x0:i.x0,y0:i.y0});let d=A();d.n>1&&s.span>20&&d.span>8&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,s.zoom+Math.log2(d.span/s.span)))),this._placeAt(s.lat,s.lon,d.x,d.y),this.invalidate(),this.onMove?.(this)});let E=M=>{let i=a.get(M.pointerId);if(a.delete(M.pointerId)){try{t.releasePointerCapture(M.pointerId)}catch{}this.onTap&&!a.size&&Math.hypot(i.x-i.x0,i.y-i.y0)<Hn&&this.onTap({x:i.x,y:i.y},M),k(),a.size||(t.style.cursor="grab")}};t.addEventListener("pointerup",E),t.addEventListener("pointercancel",E),t.addEventListener("wheel",M=>{M.preventDefault();let i=t.getBoundingClientRect(),d=-M.deltaY*(M.deltaMode===1?.05:.0022);this._zoomAbout(M.clientX-i.left,M.clientY-i.top,this.zoom+d),this.invalidate(),this.onMove?.(this)},{passive:!1});for(let M of["gesturestart","gesturechange","gestureend"])t.addEventListener(M,i=>i.preventDefault());t.style.cursor="grab",t.style.touchAction="none"}_layerTiles(t,a,s,c){let{w,h:A}=this,k=Math.min(a,t.maxTileZoom??a),E=256*Math.pow(2,this.zoom-k),M=Math.pow(2,k),i=Math.floor(s/E),d=Math.floor((s+w)/E),S=Math.floor(c/E),u=Math.floor((c+A)/E),r=[];for(let p=S;p<=u;p++)if(!(p<0||p>=M))for(let o=i;o<=d;o++){let l=(o%M+M)%M,v=t.url(k,l,p);v&&r.push({tx:o,ty:p,url:v})}return{size:E,tiles:r}}tilesSettled(t,a){let s=this.layers.find(M=>M.name===t);if(!s||s.enabled===!1||s.opacity===0||!this.w||!this.h)return!0;let c=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),w=ge.lonToWorld(this.lon,this.zoom)-this.w/2,A=ge.latToWorld(this.lat,this.zoom)-this.h/2,{tiles:k}=this._layerTiles(a?{...s,url:a}:s,c,w,A),E=!0;for(let M of k){a&&qo(M.url,()=>this.invalidate());let i=Je.get(M.url)?.state;i!=="ok"&&i!=="err"&&(E=!1)}return E}render(){let{ctx:t,w:a,h:s}=this;if(!a||!s)return;t.clearRect(0,0,a,s),t.fillStyle="#0f1826",t.fillRect(0,0,a,s);let c=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),w=ge.lonToWorld(this.lon,this.zoom)-a/2,A=ge.latToWorld(this.lat,this.zoom)-s/2,k=()=>this.invalidate();for(let E of this.layers){if(E.enabled===!1||E.opacity===0)continue;let{size:M,tiles:i}=this._layerTiles(E,c,w,A);t.save(),t.globalAlpha=E.opacity??1,E.filter&&(t.filter=E.filter),E.blend&&(t.globalCompositeOperation=E.blend);let d=.5;for(let{tx:S,ty:u,url:r}of i){let p=qo(r,k);p&&t.drawImage(p,Math.round(S*M-w)-d,Math.round(u*M-A)-d,Math.ceil(M)+d*2,Math.ceil(M)+d*2)}t.restore()}for(let E of this.overlays){t.save();try{E(t,this)}catch(M){console.error("[map overlay]",M)}t.restore()}}destroy(){this._ro.disconnect()}};function Vo(e,t,a,{stroke:s,fill:c,width:w=1.5,glow:A=8}){if(!a)return;let k=a.type==="Polygon"?[a.coordinates]:a.type==="MultiPolygon"?a.coordinates:null;if(k){e.beginPath();for(let E of k)for(let M of E)M.forEach(([i,d],S)=>{let[u,r]=t.project(d,i);S===0?e.moveTo(u,r):e.lineTo(u,r)}),e.closePath();c&&(e.fillStyle=c,e.fill("evenodd")),s&&(e.save(),A&&(e.shadowColor=s,e.shadowBlur=A/2),e.strokeStyle=s,e.lineWidth=w,e.stroke(),e.restore())}}function qt(e,t,a,s="#f07aa6",c=null,w=0){e.save(),e.shadowColor=s,e.shadowBlur=7,e.strokeStyle=s,e.lineWidth=1.5;let A=7;e.beginPath(),e.arc(t,a,A,0,Math.PI*2),e.stroke(),e.beginPath();for(let[k,E]of[[-1,0],[1,0],[0,-1],[0,1]])e.moveTo(t+k*(A+2),a+E*(A+2)),e.lineTo(t+k*(A+7),a+E*(A+7));if(e.stroke(),e.fillStyle=s,e.beginPath(),e.arc(t,a,2.2,0,Math.PI*2),e.fill(),w>0&&(e.globalAlpha=1-w,e.beginPath(),e.arc(t,a,A+w*26,0,Math.PI*2),e.stroke(),e.globalAlpha=1),c){e.shadowBlur=0,e.font="600 11.5px 'Chakra Petch', sans-serif",e.letterSpacing="1.4px",e.textAlign="left",e.textBaseline="middle";let k=e.measureText(c).width+10;e.fillStyle="rgba(22,33,47,.85)",e.fillRect(t+A+8,a-7,k,14),e.fillStyle=s,e.fillText(c,t+A+13,a)}e.restore()}function Gt(e,t,a,s){let c=156543.03392*Math.cos(t.lat*Math.PI/180)/Math.pow(2,t.zoom),A=c*110/1609.344,E=[1,2,5,10,20,50,100,200,500,1e3].reduce((i,d)=>Math.abs(d-A)<Math.abs(i-A)?d:i),M=E*1609.344/c;e.save(),e.strokeStyle="rgba(221,226,232,.75)",e.lineWidth=1,e.beginPath(),e.moveTo(a,s-4),e.lineTo(a,s),e.lineTo(a+M,s),e.lineTo(a+M,s-4),e.stroke(),e.font="500 11.5px 'JetBrains Mono', monospace",e.fillStyle="rgba(221,226,232,.75)",e.textAlign="center",e.textBaseline="bottom",e.fillText(`${E} mi`,a+M/2,s-5),e.restore()}var Rn=5;function Ko(e){e.className="view radar",e.innerHTML=`
    <div class="radar-wrap">
      <div class="panel bare radar-main">
        <canvas class="fill" id="r-map"></canvas>
        <div class="radar-hud">
          <div class="radar-stamp"><b id="r-time">\u2014</b><span id="r-age">\u2014</span></div>
          <div class="radar-stamp" id="r-storm-hud" hidden><b>HURRICANE ATLAS</b><span></span></div>
          <div class="radar-legend" id="r-legend"></div>
        </div>
        <div class="radar-tools">
          <button class="tl-btn sm" id="r-center" title="Recentre on location">\u2316</button>
          <button class="tl-btn sm" id="r-zin" title="Zoom in">+</button>
          <button class="tl-btn sm" id="r-zout" title="Zoom out">\u2212</button>
          <button class="tl-btn sm on" id="r-labels" title="Place labels">A</button>
          <button class="tl-btn sm on" id="r-alerts" title="Alert polygons">\u26A0</button>
          <button class="tl-btn sm" id="r-storms" title="Hurricane atlas: every NHC best-track storm near you" aria-pressed="false">\u{1F300}</button>
        </div>
        <div class="radar-frames">
          <button class="tl-btn" id="r-play">\u275A\u275A</button>
          <canvas id="r-strip"></canvas>
        </div>
      </div>

      <div class="radar-side">
        <div class="panel storms" id="r-stormpanel" role="region" aria-label="Hurricane atlas" hidden></div>
        <div class="panel">
          <div class="hd">COVERAGE<span class="rule"></span><span class="val" id="r-src">RAINVIEWER</span></div>
          <div class="body" id="r-cover"></div>
        </div>
        <div class="panel grow" style="--ac:var(--rd)">
          <div class="hd">WATCHES &amp; WARNINGS<span class="rule"></span><span class="val" id="r-alertn">0</span></div>
          <div class="body" id="r-alertlist" style="overflow-y:auto"></div>
        </div>
        <div class="panel">
          <div class="hd" style="--ac:var(--am)">CONVECTIVE<span class="rule"></span><span class="val">STORM FUEL</span></div>
          <div class="body" id="r-conv"></div>
        </div>
      </div>
    </div>
  `;let t=C=>e.querySelector("#"+C),a=[],s=0,c=0,w=!1,A=0,k="",E=null,M=performance.now(),i="",d=new it(t("r-map"),{center:[n.loc?.lat??0,n.loc?.lon??0],zoom:7,minZoom:3,maxZoom:11,onMove:()=>$()}),S=C=>(f,T,x)=>!C||!i?null:`${i}${C.path}/256/${f}/${T}/${x}/4/1_1.png`;d.layers=[{name:"base",url:(C,f,T)=>`${rt}/World_Dark_Gray_Base/MapServer/tile/${C}/${T}/${f}`,filter:Ut,opacity:1},{name:"radar",url:(C,f,T)=>S(a[s])(C,f,T),opacity:.82,blend:"screen",maxTileZoom:7},{name:"labels",url:(C,f,T)=>`${rt}/World_Dark_Gray_Reference/MapServer/tile/${C}/${T}/${f}`,filter:_t,opacity:1}];let u=C=>d.layers.find(f=>f.name===C);d.overlays.push((C,f)=>{if(u("alerts")?.enabled!==!1&&r)for(let T of n.alerts){if(!T.geometry)continue;let x=ut(T.event,T.severity);Vo(C,f,T.geometry,{stroke:x,fill:J(x,.12),width:1.5,glow:10})}if(n.loc){let[T,x]=f.project(n.loc.lat,n.loc.lon);qt(C,T,x,V[1],n.loc.name.toUpperCase())}Gt(C,f,14,f.h-14),C.save(),C.strokeStyle="rgba(63,208,216,.06)",C.lineWidth=1;for(let T=1;T<4;T++)C.beginPath(),C.moveTo(f.w*T/4,0),C.lineTo(f.w*T/4,f.h),C.moveTo(0,f.h*T/4),C.lineTo(f.w,f.h*T/4),C.stroke();C.restore()});let r=!0,p=null,o=!1;t("r-storms").addEventListener("click",async C=>{let f=C.currentTarget;if(o=!o,f.classList.toggle("on",o),f.setAttribute("aria-pressed",String(o)),e.classList.toggle("storms-mode",o),o){n.playing=!1,n.emit("play",!1),u("radar").enabled=!1;try{p||=(await import("./storms.UTNUEWE5.js")).createStorms({map:d,panel:t("r-stormpanel"),hud:t("r-storm-hud"),root:e})}catch(T){console.error("[radar] storms",T),o=!1,f.classList.remove("on"),f.setAttribute("aria-pressed","false"),e.classList.remove("storms-mode"),u("radar").enabled=!0;return}o&&p.enter()}else p?.exit(),u("radar").enabled=!0,n.loc&&d.setView(n.loc.lat,n.loc.lon,7),n.playing=!0,n.emit("play",!0),g(),d.invalidate()});let l=ce(t("r-strip"),(C,f,T)=>{if(!a.length)return;let x=a.length,F=Math.max(2,f/x-2),W=a.findIndex(P=>P.kind==="nowcast");if(a.forEach((P,_)=>{let X=_*f/x,N=P.kind==="past",j=_===s?V[1]:N?V[0]:R.warn;C.fillStyle=J(j,_===s?1:.3),C.fillRect(X,_===s?2:6,F,_===s?T-4:T-12)}),W>0){let P=W*f/x-1;C.save(),C.strokeStyle=J(R.warn,.8),C.setLineDash([2,2]),C.beginPath(),C.moveTo(P,0),C.lineTo(P,T),C.stroke(),C.restore()}},{onPick:({x:C,w:f})=>{if(!a.length)return;let T=a[G(Math.floor(C/f*a.length),0,a.length-1)];n.playing=!1,n.emit("play",!1),n.scrubTo(T.time*1e3)}});function v(C){let f=0,T=1/0;for(let x=0;x<a.length;x++){let F=Math.abs(a[x].time*1e3-C);F<T&&(T=F,f=x)}return f}function h(){if(!a.length)return;let C=v(n.cursor);C!==s&&(s=C,b())}function g(){t("r-play").textContent=n.playing?"\u275A\u275A":"\u25B6"}let $=()=>l.render();function b(){let C=a[s];if(!C)return;t("r-time").textContent=n.fmt.hm(C.time*1e3);let f=Math.round((Date.now()/1e3-C.time)/60);t("r-age").textContent=C.kind==="nowcast"?`FORECAST +${Math.abs(f)}m`:f<=1?"LATEST":`${f} MIN AGO`,t("r-age").style.color=C.kind==="nowcast"?R.warn:f<=12?R.good:Le,d.invalidate(),l.render()}async function y(){try{let C=n.radar||await ve.radar();i=C.host;let f=(C.radar?.past||[]).map(x=>({...x,kind:"past"})),T=(C.radar?.nowcast||[]).map(x=>({...x,kind:"nowcast"}));a=[...f,...T],s=v(n.cursor),t("r-src").textContent=T.length?`${f.length} OBS + ${T.length} FCST`:`${f.length} OBSERVED`,b(),L()}catch(C){console.error("[radar] frames",C),t("r-src").textContent="UNAVAILABLE"}}function L(){let C=[["#62a4ef","light"],["#6cc98f","moderate"],["#ecd46a","heavy"],["#f59a5b","very heavy"],["#f47171","intense"],["#c89af5","hail"]];t("r-legend").innerHTML='<span class="lg-title">intensity</span>'+C.map(([f,T])=>`<b><i style="background:${f}"></i>${T}</b>`).join("")}function H(){let C=n.fmt,f=n.frame(),T=[f?.t,f?.precip,f?.cape,f?.cloud,n.alerts.length,n.hours.length].join("|");if(T===k&&n.raw===E)return;k=T,E=n.raw;let x=n.alerts;t("r-alertn").textContent=String(x.length),t("r-alertlist").innerHTML=x.length?x.map(U=>`
      <div class="alert-item" style="--ac:${ut(U.event,U.severity)}">
        <b>${te(U.event)}</b>
        <span>${te(U.areaDesc||"").slice(0,90)}</span><br>
        <span>until ${C.weekday(U.expires)} ${C.hm(U.expires)}</span>
      </div>`).join(""):'<div class="nodata">no active alerts</div>';let F=n.frame(),W=n.hours.filter(U=>U.t>=Date.now()&&U.t<=Date.now()+6*36e5),P=W.reduce((U,ue)=>U+(ue.precip??0),0),_=Math.max(0,...W.map(U=>U.pop??0));t("r-cover").innerHTML=`
      <dl style="margin:0">
        ${O("Now",F?.wx.label??"--")}
        ${O("Rate",F?.precip!=null?`${F.precip.toFixed(3)} in/hr`:"--")}
        ${O("Next 6h total",`${P.toFixed(2)} in`)}
        ${O("Peak chance 6h",`${Math.round(_)}%`)}
        ${O("Cloud cover",F?.cloud!=null?`${Math.round(F.cloud)}%`:"--")}
        ${O("Freezing level",F?.freezing!=null?`${Math.round(F.freezing*3.28084)} ft`:"--")}
      </dl>`;let X=F?.cape??0,N=F?.li,j=F?.cin,oe=X<300?["STABLE",R.good]:X<1e3?["MARGINAL",V[0]]:X<2500?["MODERATE",R.warn]:X<4e3?["STRONG",R.serious]:["EXTREME",R.crit],Z=Math.max(0,...n.hours.filter(U=>U.t>=Date.now()&&U.t<=Date.now()+24*36e5).map(U=>U.cape??0));t("r-conv").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
        <span class="num" style="font-size:1.5rem;font-weight:700;color:${oe[1]}">${Math.round(X)}</span>
        <span class="lbl">J/kg CAPE</span>
        <span class="chip" style="--ac:${oe[1]};margin-left:auto">${oe[0]}</span>
      </div>
      <div class="meter seg" style="--ac:${oe[1]};margin-bottom:8px"><i style="width:${G(X/4e3*100,0,100)}%"></i></div>
      <dl style="margin:0">
        ${O("Lifted index",N!=null?N.toFixed(1):"--")}
        ${O("Inhibition",j!=null?`${Math.round(j)} J/kg`:"--")}
        ${O("Peak CAPE 24h",`${Math.round(Z)} J/kg`)}
      </dl>
      <div style="font-size:max(.58rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        CAPE is the energy available to a rising parcel. Above ~1000 J/kg with a
        negative lifted index, thunderstorms become plausible.
      </div>`}t("r-play").addEventListener("click",()=>{n.playing=!n.playing,n.emit("play",n.playing),g()}),n.on("play",g),n.on("cursor",()=>{n.view==="radar"&&(h(),g())}),t("r-center").addEventListener("click",()=>{n.loc&&d.setView(n.loc.lat,n.loc.lon,7)}),t("r-zin").addEventListener("click",()=>d.setView(d.lat,d.lon,d.zoom+1)),t("r-zout").addEventListener("click",()=>d.setView(d.lat,d.lon,d.zoom-1)),t("r-labels").addEventListener("click",C=>{let f=u("labels");f.enabled=f.enabled===!1,C.currentTarget.classList.toggle("on",f.enabled!==!1),d.invalidate()}),t("r-alerts").addEventListener("click",C=>{r=!r,C.currentTarget.classList.toggle("on",r),d.invalidate()});function D(C){if(n.view!=="radar"||o){M=C;return}let f=Math.min(.2,(C-M)/1e3);if(M=C,n.playing&&a.length){if(!w){if(A+=f,!d.tilesSettled("radar")&&A<Rn)return;w=!0}c+=f;let T=s===a.length-1?1.1:.42;if(c>=T){let x=-1;for(let F=1;F<=a.length;F++){let W=(s+F)%a.length;if(W===s||d.tilesSettled("radar",S(a[W]))){x=W;break}}if(x<0||x===s){c=T-.1;return}c=0,n.hours.length?n.setCursor(a[x].time*1e3):(s=x,b())}}}requestAnimationFrame(function C(f){requestAnimationFrame(C),D(f)}),n.on("loc",()=>{n.loc&&d.setView(n.loc.lat,n.loc.lon,7)}),n.on("radar",y);let O=(C,f)=>`<div class="kv"><dt>${C}</dt><dd>${f}</dd></div>`;return y(),{map:d,update(){H(),d.invalidate()},onShow(){w=!1,A=0,c=0,d.resize(),l.render(),h(),p?.setVisible(!0),o||(n.playing=!0,n.emit("play",!0)),g()},onHide(){p?.setVisible(!1),n.playing=!1,n.emit("play",!1),n.following&&n.setCursor(Date.now())}}}function Nn(e,t){if(!e?.length)return null;let a=null,s=1/0;for(let c of e){let w=Math.abs(c.t-t);w<s&&(s=w,a=c)}return s<=36e5?a:null}function jo(e,t){for(let a of t){let s=e[a];if(s instanceof Date&&!Number.isNaN(+s))return{at:+s,kind:a}}return null}function Fn(e,t,a,s,c){let w=jo(t,["night","nauticalDusk","dusk"]),A=jo(a,["nightEnd","nauticalDawn","dawn"]);if(!w||!A||A.at<=w.at)return{dark:null,samples:[],goodHours:0,score:0,reason:"no darkness"};let k=[],E=Math.ceil(w.at/36e5)*36e5;for(let b=E;b<=A.at;b+=36e5){let y=Nn(e,b);if(!y)continue;let L=c(b),H=s(b)>0;k.push({t:b,cloud:y.cloud??null,moonUp:H,moonLit:L,washed:H&&L>=.25,clear:y.cloud!=null&&y.cloud<=30})}if(!k.length)return{dark:{from:w.at,to:A.at,kind:w.kind},samples:[],goodHours:0,score:0,reason:"beyond the forecast"};let M=b=>b.clear&&!b.washed,i=k.filter(M).length,d=k.filter(b=>b.clear).length,S=k.filter(b=>b.cloud!=null),u=S.length?S.reduce((b,y)=>b+y.cloud,0)/S.length:null,r=null,p=null;for(let b of k.concat([null])){if(b&&M(b)){p=p||{from:b.t,to:b.t},p.to=b.t+36e5;continue}p&&(!r||p.to-p.from>r.to-r.from)&&(r=p),p=null}let o=(A.at-w.at)/36e5,l=c(w.at+(A.at-w.at)/2),v=k.filter(b=>b.moonUp).length/k.length,h=r?(r.to-r.from)/36e5:0,g=.65*Math.min(1,h/4)+.25*Math.min(1,i/Math.max(o,1))+.1*Math.min(1,o/6),$=Math.round(100*Math.max(0,Math.min(1,g)-.08*v*l));return{dark:{from:w.at,to:A.at,kind:w.kind,hours:o},samples:k,goodHours:i,clearHours:d,cloudMean:u,moonLit:l,moonUpHours:k.filter(b=>b.moonUp).length,best:r,score:$}}function Yo(e,t,a,s,c,w=7,A=null){let{sunTimes:k,moonPosition:E,moonIllumination:M,toDeg:i}=c,d=[],S=A==null?(()=>{let p=new Date(s);return p.setHours(12,0,0,0),+p})():Math.floor((s+A)/(24*36e5))*24*36e5+12*36e5-A,u=p=>i(E(new Date(p),t,a).altitude),r=p=>M(new Date(p)).fraction;for(let p=0;p<w;p++){let o=new Date(S+p*24*36e5),l=new Date(S+(p+1)*24*36e5),v=Fn(e,k(o,t,a),k(l,t,a),u,r);d.push({...v,index:p,day:+o})}return d}function to(e){return e.slice(1).reduce((t,a)=>a.score>(t?.score??-1)?a:t,null)}function Zo(e,t){let a=e[0],s=i=>t.hm(i);if(!a||!a.dark)return"No real darkness tonight at this latitude.";if(!a.samples.length)return"Tonight is beyond the forecast.";let c=to(e),w=c&&c.score>a.score+15?c:null,A=i=>i.index===1?"Tomorrow":t.weekday(i.day),k=(i,d)=>`${i} ${d}${i===1?"":"s"}`,E=w?` ${A(w)} is the better night: ${k(w.goodHours,"clear moonless hour")}.`:"";if(a.best&&a.best.to-a.best.from>=2*36e5){let i=(a.best.to-a.best.from)/36e5,d=Math.round(i),S=a.moonLit>=.25&&a.moonUpHours?`, and the moon is ${Math.round(a.moonLit*100)}% lit`:"";if(a.dark.hours-i<1)return`Clear and moonless all night \u2014 about ${k(d,"hour")}, ${s(a.best.from)} to ${s(a.best.to)}${S}.`+E;if(d<3){let u=a.cloudMean!=null&&a.cloudMean>30?`, in a night averaging ${Math.round(a.cloudMean)}% cloud`:a.dark.hours<4?`, which is most of the ${k(Math.round(a.dark.hours),"hour")} of darkness`:"";return`A ${d}-hour window from ${s(a.best.from)}${u}${S}.`+E}return`Clear and moonless from ${s(a.best.from)} to ${s(a.best.to)} \u2014 about ${k(d,"hour")}${S}.`+E}return`Not tonight \u2014 ${a.cloudMean!=null&&a.cloudMean>30?`${Math.round(a.cloudMean)}% cloud through the dark hours`:a.moonUpHours&&a.moonLit>=.25?`a ${Math.round(a.moonLit*100)}% moon up for most of it`:"not much dark sky to work with"}.`+E}function Jo(e){e.className="view skyview",e.innerHTML=`
    <div class="panel bare dome-panel">
      <canvas class="fill" id="s-dome"></canvas>
      <div class="dome-cap"><span class="lbl">CELESTIAL DOME</span><span class="lbl" id="s-domewhen">\u2014</span></div>
    </div>

    <div class="panel moon-panel" style="--ac:var(--ice)">
      <div class="hd">MOON<span class="rule"></span><span class="val" id="s-mphase">\u2014</span></div>
      <div class="body moon-body">
        <canvas id="s-moon"></canvas>
        <dl id="s-moondl" style="margin:0;flex:1"></dl>
      </div>
      <canvas id="s-moonalt" style="flex:1;min-height:58px;width:100%;margin-top:6px"></canvas>
    </div>

    <div class="panel sun-panel" style="--ac:var(--am)">
      <div class="hd">SOLAR DAY<span class="rule"></span><span class="val" id="s-daylen">\u2014</span></div>
      <div class="body">
        <canvas id="s-daybar" style="height:52px;flex:0 0 52px;width:100%"></canvas>
        <dl id="s-sundl" style="margin:6px 0 0"></dl>
      </div>
    </div>

    <div class="panel" style="--ac:var(--vi)">
      <div class="hd">GEOMAGNETIC<span class="rule"></span><span class="val" id="s-kpnow">\u2014</span></div>
      <div class="body">
        <canvas id="s-kp" style="flex:1;min-height:70px;width:100%"></canvas>
        <dl id="s-spacedl" style="margin:6px 0 0"></dl>
      </div>
    </div>

    <div class="panel" style="--ac:var(--lm)">
      <div class="hd">OBSERVING CONDITIONS<span class="rule"></span><span class="val" id="s-seenow">\u2014</span></div>
      <div class="body" id="s-seeing"></div>
      <div class="tn" id="s-tonight"></div>
    </div>
  `;let t=o=>e.querySelector("#"+o),a=null;function s(){let{lat:o,lon:l}=n.loc||{lat:0,lon:0},v=n.fmt.isoDate(n.cursor),h=n.cursor;for(;n.fmt.isoDate(h-6e4)===v;)h-=6e4;let g=[],$=[];for(let b=0;b<=1440;b+=10){let y=new Date(h+b*6e4),L=pt(y,o,l),H=ht(y,o,l);g.push({az:tt(L.azimuth),alt:Ne(L.altitude),t:+y}),$.push({az:tt(H.azimuth),alt:Ne(H.altitude),t:+y})}return{sun:g,moon:$,t0:h}}let c=ce(t("s-dome"),(o,l,v,h)=>{let g=n.frame();if(!g)return;let{sun:$,moon:b}=s(),y=Math.min(l,v)/2-26,L=l/2,H=v/2;$o(o,L,H,y,{sunTrack:$,moonTrack:b,sun:{az:g.sun.compass,alt:g.sun.altDeg},moon:{az:g.moon.compass,alt:g.moon.altDeg},iss:a&&a.alt>0?a:null,night:g.sun.altDeg<-6?1:0}),o.save(),o.font="500 12px 'JetBrains Mono', monospace",o.textAlign="left",o.textBaseline="top";let D=[["SUN",`${g.sun.altDeg.toFixed(1)}\xB0  ${fe(g.sun.compass)}`,"#f2b45a"],["MOON",`${g.moon.altDeg.toFixed(1)}\xB0  ${fe(g.moon.compass)}`,"#7fb2f0"]];a&&D.push(["ISS",`${a.alt>0?`${a.alt.toFixed(0)}\xB0 ${fe(a.az)}`:"below horizon"}`,"#8fdc6a"]),D.forEach(([O,C,f],T)=>{o.fillStyle=f,o.fillText(O,10,10+T*15),o.fillStyle=Te,o.fillText(C,52,10+T*15)}),o.restore()}),w=ce(t("s-moon"),(o,l,v)=>{let h=n.frame();if(!h)return;let g=Math.min(l,v)/2-4;Ct(o,l/2,v/2,Math.max(10,g),h.moon.phase,h.moon.fraction)}),A=ce(t("s-moonalt"),(o,l,v)=>{let{sun:h,moon:g}=s(),$={l:2,r:22,t:12,b:12},b={x:$.l,y:$.t,w:l-$.l-$.r,h:v-$.t-$.b};if(b.w<30||b.h<20)return;let y=D=>b.y+b.h-(G(D,-60,90)+60)/150*b.h,L=D=>b.x+D/(g.length-1)*b.w;o.save(),o.strokeStyle="rgba(63,208,216,.30)",o.setLineDash([3,3]),o.beginPath(),o.moveTo(b.x,y(0)),o.lineTo(b.x+b.w,y(0)),o.stroke(),o.setLineDash([]),o.font="500 11.5px 'JetBrains Mono', monospace",o.fillStyle=le,o.textAlign="right",o.textBaseline="middle",o.fillText("0\xB0",b.x+b.w+18,y(0)),o.restore(),ke(o,h.map((D,O)=>[L(O),y(D.alt)]),"#f2b45a",{width:1.4,glow:6}),o.save(),o.setLineDash([3,3]),ke(o,g.map((D,O)=>[L(O),y(D.alt)]),"#7fb2f0",{width:1.6,glow:7}),o.restore();let H=G(Math.round((n.cursor-g[0].t)/(g.at(-1).t-g[0].t)*(g.length-1)),0,g.length-1);o.save(),o.strokeStyle=V[1],o.lineWidth=1,o.beginPath(),o.moveTo(L(H),b.y),o.lineTo(L(H),b.y+b.h),o.stroke(),o.restore(),o.save(),o.font="500 11.5px 'JetBrains Mono', monospace",o.fillStyle=le,o.textAlign="center",o.textBaseline="top";for(let D=0;D<=24;D+=6)D!==24&&De(o,String(D).padStart(2,"0"),L(D/24*(g.length-1)),v-$.b+1,0,l);o.restore(),we(o,b.x+2,1,"altitude \u2014 sun solid, moon dashed")}),k=ce(t("s-daybar"),(o,l,v)=>{let h=n.sunTimesFor(),g=n.fmt.isoDate(n.cursor),$=n.cursor;for(;n.fmt.isoDate($-6e4)===g;)$-=6e4;let b=$+24*36e5,y=f=>(f-$)/(b-$)*l,L=8,H=16,D=(f,T,x)=>{if(f==null||T==null||isNaN(+f)||isNaN(+T))return;let F=G(y(+f),0,l),W=G(y(+T),0,l);W<=F||(o.fillStyle=x,o.fillRect(F,L,W-F,H))};o.fillStyle="#0f1826",o.fillRect(0,L,l,H),D(h.nightEnd,h.nauticalDawn,"rgba(30,20,70,.9)"),D(h.nauticalDawn,h.dawn,"rgba(40,40,120,.9)"),D(h.dawn,h.sunrise,"rgba(90,60,150,.9)"),D(h.sunrise,h.goldenHourEnd,"rgba(245,154,91,.85)"),D(h.goldenHourEnd,h.goldenHour,"rgba(90,180,235,.75)"),D(h.goldenHour,h.sunset,"rgba(245,154,91,.85)"),D(h.sunset,h.dusk,"rgba(150,70,140,.9)"),D(h.dusk,h.nauticalDusk,"rgba(60,45,130,.9)"),D(h.nauticalDusk,h.night,"rgba(30,20,70,.9)"),o.save(),o.font="500 11.5px 'JetBrains Mono', monospace",o.fillStyle=le,o.textAlign="center",o.textBaseline="top",o.strokeStyle="rgba(255,255,255,.10)";for(let f=0;f<=24;f+=3){let T=f/24*l;o.beginPath(),o.moveTo(T,L+H),o.lineTo(T,L+H+3),o.stroke(),f%6===0&&f<24&&De(o,String(f).padStart(2,"0"),T,L+H+5,0,l)}o.restore();let O=(f,T,x)=>{if(f==null||isNaN(+f))return;let F=G(y(+f),6,l-6);o.save(),o.strokeStyle=x,o.lineWidth=1,o.beginPath(),o.moveTo(F,L-4),o.lineTo(F,L+H),o.stroke(),o.font="600 11.5px 'Chakra Petch', sans-serif",o.fillStyle=x,o.textAlign="center",o.textBaseline="bottom",o.fillText(T,F,L-5),o.restore()};O(h.sunrise,"\u2191","#f2b45a"),O(h.sunset,"\u2193","#f2b45a");let C=G(y(n.cursor),0,l);o.save(),o.strokeStyle=V[1],o.lineWidth=1.5,o.shadowColor=V[1],o.shadowBlur=4,o.beginPath(),o.moveTo(C,L-6),o.lineTo(C,L+H+2),o.stroke(),o.restore()}),E=ce(t("s-kp"),(o,l,v,h)=>{let g=n.kpForecast();if(!g.length){M(o,l,v,"no space weather data");return}xo(o,l,v,h,{rows:g,tf:n.fmt,now:Date.now()})});function M(o,l,v,h){o.save(),o.font="600 11.5px 'Chakra Petch', sans-serif",o.fillStyle=le,o.textAlign="center",o.textBaseline="middle",o.letterSpacing="1.6px",o.fillText(h.toUpperCase(),l/2,v/2),o.restore()}function i(o,l=Date.now()){let v=l,h=6*36e5,g=mt(new Date(v)).phase;for(let $=0;$<240;$++){v+=h;let b=mt(new Date(v)).phase;if(g<=o&&b>=o||g>b&&(g<=o||b>=o)){let L=v-h,H=v;for(let D=0;D<28;D++){let O=(L+H)/2,C=mt(new Date(O)).phase;C<o||C>.9&&o<.1?L=O:H=O}return(L+H)/2}g=b}return null}function d(){let o=n.frame();if(!o)return;let l=n.fmt;t("s-domewhen").textContent=n.atNow?"LIVE":`${l.weekday(n.cursor)} ${l.hm(n.cursor)}`;let v=n.moonTimesFor();t("s-mphase").textContent=fo(o.moon.phase).toUpperCase();let h=i(.5),g=i(0);t("s-moondl").innerHTML=`
      ${r("Illumination",`${(o.moon.fraction*100).toFixed(1)}%`)}
      ${r("Altitude",`${o.moon.altDeg.toFixed(1)}\xB0 ${fe(o.moon.compass)}`)}
      ${r("Distance",`${Math.round(o.moon.distance).toLocaleString()} km`)}
      ${r("Moonrise",v.rise?l.hm(v.rise):v.alwaysUp?"always up":"\u2014")}
      ${r("Moonset",v.set?l.hm(v.set):v.alwaysDown?"never up":"\u2014")}
      ${r("Next full",h?`${l.monthDay(h)} ${l.hm(h)}`:"\u2014")}
      ${r("Next new",g?`${l.monthDay(g)} ${l.hm(g)}`:"\u2014")}
    `;let $=n.sunTimesFor(),b=o.day;t("s-daylen").textContent=b?.daylight?et(b.daylight):"\u2014";let y="\u2014",L=n.days.findIndex(j=>l.isoDate(j.t)===l.isoDate(n.cursor));if(L>0&&n.days[L].daylight&&n.days[L-1].daylight){let j=n.days[L].daylight-n.days[L-1].daylight,oe=Math.abs(j)/60;y=`${j>=0?"+":"\u2212"}${Math.floor(oe)}m ${Math.round(oe%1*60)}s vs yesterday`}t("s-sundl").innerHTML=`
      ${r("First light",l.hm($.dawn))}
      ${r("Sunrise",l.hm($.sunrise))}
      ${r("Golden hour ends",l.hm($.goldenHourEnd))}
      ${r("Solar noon",`${l.hm($.solarNoon)} \xB7 ${u().toFixed(1)}\xB0`)}
      ${r("Golden hour",l.hm($.goldenHour))}
      ${r("Sunset",l.hm($.sunset))}
      ${r("Civil dusk",l.hm($.dusk))}
      ${r("Astronomical dark",isNaN(+$.night)?"none tonight":l.hm($.night))}
      ${r("Day length",y)}
    `;let H=n.currentKp(),D=St(H);t("s-kpnow").textContent=H!=null?`Kp ${H.toFixed(2)} \xB7 ${D.name}`:"NO DATA";let O=n.space,C=O?.wind?.ok?O.wind.data?.[0]?.proton_speed:null,f=O?.mag?.ok?O.mag.data?.[0]?.bt:null,T=O?.mag?.ok?O.mag.data?.[0]?.bz_gsm:null,x=O?.scales?.ok?O.scales.data?.["0"]:null;t("s-spacedl").innerHTML=`
      ${r("Solar wind",C!=null?`${C} km/s`:"\u2014")}
      ${r("IMF Bt / Bz",f!=null?`${f} / ${T} nT`:"\u2014")}
      ${r("Aurora visible to",D.lat!=null?`${D.lat}\xB0 latitude`:"\u2014")}
      ${r("Your latitude",`${Math.abs(n.loc.lat).toFixed(1)}\xB0 ${n.loc.lat>=0?"N":"S"}`)}
      ${r("Radio / Solar / Geo",x?`R${x.R?.Scale??0} S${x.S?.Scale??0} G${x.G?.Scale??0}`:"\u2014")}
    `;let F=o.air,W=Nt("stargaze",{...o,air:F},{sunAltDeg:o.sun.altDeg,moonFraction:o.moon.fraction,moonUp:o.moon.altDeg>0}),P=W?.score??0,_=P>=75?R.good:P>=50?R.warn:P>=30?R.serious:R.crit;t("s-seenow").textContent=`${P}/100`;let X=n.hours.filter(j=>j.t>Date.now()&&j.t<Date.now()+30*36e5),N=null;for(let j of X){let oe=n.frame(j.t);if(!oe||oe.sun.altDeg>-12)continue;let Z=Nt("stargaze",oe,{sunAltDeg:oe.sun.altDeg,moonFraction:oe.moon.fraction,moonUp:oe.moon.altDeg>0});(!N||Z.score>N.score)&&(N={t:j.t,score:Z.score,limiter:Z.limiter})}t("s-seeing").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:5px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${_}">${P}</span>
        <span class="lbl">stargazing now</span>
      </div>
      <div class="meter" style="--ac:${_};margin-bottom:9px"><i style="width:${P}%"></i></div>
      ${(W?.parts||[]).map(j=>`
        <div class="kv">
          <dt>${j.name}</dt>
          <dd style="display:flex;align-items:center;gap:6px">
            <span class="meter" style="width:52px;--ac:${j.value>.7?R.good:j.value>.4?R.warn:R.crit}">
              <i style="width:${j.value*100}%"></i></span>
            ${Math.round(j.value*100)}
          </dd>
        </div>`).join("")}
      <div style="margin-top:8px;font-size:max(.66rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5">
        ${N?`Best hour right now: <b style="color:${Te}">${l.weekday(N.t)} ${l.hm(N.t)}</b> at ${N.score}/100${N.limiter?`, held back by ${N.limiter}`:""}.`:"No astronomical darkness in the next 30 hours."}
      </div>`,S(),c.render(),w.render(),A.render(),k.render(),E.render()}function S(){let o=t("s-tonight");if(!n.loc||!n.hours?.length){o.innerHTML="";return}let l=n.fmt,v=Yo(n.hours,n.loc.lat,n.loc.lon,Date.now(),{sunTimes:po,moonPosition:ht,moonIllumination:mt,toDeg:Ne}),h=to(v),g=Math.max(4,...v.map(b=>b.goodHours)),$=b=>{let y=h&&b.index===h.index&&b.score>v[0].score,L=b.score>=75?R.good:b.score>=45?R.warn:R.crit;return`
        <div class="tn-n${y?" pick":""}${b.index===0?" now":""}"
             title="${b.goodHours} clear moonless hours of ${b.dark?b.dark.hours.toFixed(1):0} dark">
          <span class="tn-h">${b.dark?`${b.goodHours}h`:"\u2014"}</span>
          <span class="tn-bar"><i style="height:${Math.round(b.goodHours/g*100)}%;background:${L}"></i></span>
          <span class="tn-d">${l.weekday(b.day).slice(0,3).toUpperCase()}</span>
        </div>`};o.innerHTML=`
      <p class="tn-verdict">${te(Zo(v,l))}</p>
      <div class="tn-week">${v.map($).join("")}</div>
      <p class="tn-key">clear, moonless hours per night \xB7 next ${7}</p>`}function u(){let{lat:o,lon:l}=n.loc||{lat:0,lon:0},v=n.sunTimesFor();return!v.solarNoon||isNaN(+v.solarNoon)?0:Ne(pt(v.solarNoon,o,l).altitude)}let r=(o,l)=>`<div class="kv"><dt>${o}</dt><dd>${l}</dd></div>`;async function p(){if(n.view==="sky")try{let o=await ve.iss();if(o.pos?.ok){let l=o.pos.data,v=n.loc||{lat:0,lon:0};a={...ft(v.lat,v.lon,l.latitude,l.longitude,l.altitude),lat:l.latitude,lon:l.longitude,visibility:l.visibility},c.render()}}catch{}}return setInterval(p,8e3),{update:d,onShow(){p(),c.render(),w.render(),A.render(),k.render(),E.render()}}}var Qo=[{key:"pm25",label:"PM2.5",unit:"\xB5g/m\xB3",ref:35,who:15,note:"fine particulate \u2014 lungs and bloodstream"},{key:"pm10",label:"PM10",unit:"\xB5g/m\xB3",ref:150,who:45,note:"coarse dust and pollen fragments"},{key:"o3",label:"Ozone",unit:"\xB5g/m\xB3",ref:140,who:100,note:"photochemical smog, peaks mid-afternoon"},{key:"no2",label:"NO\u2082",unit:"\xB5g/m\xB3",ref:200,who:25,note:"traffic and combustion"},{key:"so2",label:"SO\u2082",unit:"\xB5g/m\xB3",ref:350,who:40,note:"industry and shipping"},{key:"co",label:"CO",unit:"\xB5g/m\xB3",ref:1e4,who:4e3,note:"incomplete combustion"}],zn=["I very fair","II fair","III medium","IV olive","V brown","VI dark"];function Xo(e){e.className="view airview",e.innerHTML=`
    <div class="panel aqi-panel">
      <div class="hd">AIR QUALITY<span class="rule"></span><span class="val" id="a-src">US EPA AQI</span></div>
      <div class="body aqi-body">
        <canvas id="a-gauge"></canvas>
        <div class="aqi-meta">
          <div class="aqi-cat" id="a-cat">\u2014</div>
          <div class="aqi-note" id="a-note">\u2014</div>
          <dl id="a-dl" style="margin:8px 0 0"></dl>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="hd" style="--ac:var(--mg)">POLLUTANTS<span class="rule"></span><span class="val">vs EPA / WHO limits</span></div>
      <div class="body" id="a-poll"></div>
    </div>

    <div class="panel">
      <div class="hd" style="--ac:var(--lm)">POLLEN<span class="rule"></span><span class="val" id="a-polsrc">\u2014</span></div>
      <div class="body" id="a-pollen"></div>
    </div>

    <div class="panel">
      <div class="hd" style="--ac:var(--am)">ULTRAVIOLET<span class="rule"></span><span class="val" id="a-uvnow">\u2014</span></div>
      <div class="body">
        <canvas id="a-uv" style="flex:1;min-height:64px;width:100%"></canvas>
        <div id="a-burn" style="margin-top:6px"></div>
      </div>
    </div>

    <div class="panel">
      <div class="hd" style="--ac:var(--ice)">COMFORT<span class="rule"></span><span class="val" id="a-cmf">\u2014</span></div>
      <div class="body" id="a-comfort"></div>
    </div>

    <div class="panel bare">
      <canvas class="fill" id="a-fc"></canvas>
    </div>
  `;let t=i=>e.querySelector("#"+i),a=ce(t("a-gauge"),(i,d,S)=>{let r=n.frame()?.air?.aqi??n.airNow?.aqi,p=Re(r),o=Math.min(d,S)/2-22;Ve(i,d/2,S/2-4,Math.max(18,o),{value:r,min:0,max:300,color:p.color,label:"",unit:"US AQI",bands:[{from:0,to:50,color:R.good},{from:50,to:100,color:R.warn},{from:100,to:150,color:R.serious},{from:150,to:200,color:R.crit},{from:200,to:300,color:"#c89af5"}],ticks:6})}),s=ce(t("a-uv"),(i,d,S,u)=>{let r=n.fmt.isoDate(n.cursor),p=n.hours.filter(H=>n.fmt.isoDate(H.t)===r);if(p.length<2)return;let o={l:2,r:24,t:12,b:14},l={x:o.l,y:o.t,w:d-o.l-o.r,h:S-o.t-o.b},v=H=>l.y+l.h-G(H,0,12)/12*l.h,h="uv index today \xB7 dashed = clear sky";i.save(),i.font=Pe,i.letterSpacing="1.4px";let g={l:l.x+2,t:1,r:l.x+2+i.measureText(h.toUpperCase()).width,b:14};i.restore();for(let[H,D,O]of[[3,R.good,"LOW"],[6,R.warn,"MOD"],[8,R.serious,"HIGH"],[11,R.crit,"V.HIGH"]]){i.save(),i.strokeStyle=J(D,.3),i.setLineDash([3,3]),i.lineWidth=1,i.beginPath(),i.moveTo(l.x,v(H)),i.lineTo(l.x+l.w,v(H)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=J(D,.8),i.textAlign="right";let C=i.measureText(O).width,f=l.x+l.w-2,T=!yo({l:f-C,t:v(H)-13,r:f,b:v(H)-1},g,4);i.textBaseline=T?"bottom":"top",xe(i,O,f,T?v(H)-1:v(H)+2),i.restore()}let $=p.length,b=Math.max(2,l.w/$-1.5);p.forEach((H,D)=>{let O=H.uv??0;if(O<=.03)return;let C=Ue(O).color;Ge(i,l.x+D*l.w/$,v(O),b,l.y+l.h,J(C,.85))});let y=p.map(H=>[l.x+p.indexOf(H)*l.w/$+b/2,v(H.uvClear??0)]);i.save(),i.setLineDash([3,2]),i.strokeStyle=J(Te,.35),i.lineWidth=1,i.beginPath(),y.forEach(([H,D],O)=>O?i.lineTo(H,D):i.moveTo(H,D)),i.stroke(),i.restore(),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=le,i.textAlign="center",i.textBaseline="top";let L=go(l.w/$,i.measureText("00:00").width);p.forEach((H,D)=>{let O=n.fmt.hourOfDay(H.t);Math.round(O)%L||Math.abs(O-Math.round(O))>.02||De(i,n.fmt.hm(H.t),l.x+D*l.w/$+b/2,S-o.b+3,0,d)}),i.restore(),we(i,l.x+2,1,"uv index today \xB7 dashed = clear sky")}),c=ce(t("a-fc"),(i,d,S,u)=>{let r=n.air.filter(L=>L.t>=Date.now()-216e5&&L.t<=Date.now()+3456e5);if(r.length<3){w(i,d,S,"no air quality forecast");return}let p={l:4,r:30,t:16,b:18},o={x:p.l,y:p.t,w:d-p.l-p.r,h:S-p.t-p.b},l=Math.max(110,Math.max(...r.map(L=>L.aqi??0))*1.15),v=L=>o.x+(L-r[0].t)/(r.at(-1).t-r[0].t)*o.w,h=L=>o.y+o.h-G(L,0,l)/l*o.h;for(let[L,H,D]of[[50,R.good,"GOOD"],[100,R.warn,"MODERATE"],[150,R.serious,"SENSITIVE"]])L>l||(i.save(),i.strokeStyle=J(H,.28),i.setLineDash([4,3]),i.beginPath(),i.moveTo(o.x,h(L)),i.lineTo(o.x+o.w,h(L)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=J(H,.85),i.textAlign="right",i.textBaseline="bottom",xe(i,D,o.x+o.w-2,h(L)-2),i.restore());let g=r.length,$=Math.max(1,o.w/g-.5);r.forEach((L,H)=>{L.aqi!=null&&Ge(i,o.x+H*o.w/g,h(L.aqi),$,o.y+o.h,J(Re(L.aqi).color,.8),2)}),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=le,i.textAlign="center",i.textBaseline="top",i.strokeStyle="rgba(255,255,255,.07)";let b="";r.forEach((L,H)=>{let D=n.fmt.isoDate(L.t);if(D===b)return;b=D;let O=o.x+H*o.w/g;i.beginPath(),i.moveTo(O,o.y),i.lineTo(O,o.y+o.h),i.stroke(),O<o.x+o.w-20&&i.fillText(n.fmt.weekday(L.t).toUpperCase(),O+16,S-p.b+4)}),i.restore();let y=v(Date.now());if(y>o.x&&y<o.x+o.w&&(i.save(),i.strokeStyle=J(R.good,.85),i.setLineDash([3,3]),i.beginPath(),i.moveTo(y,o.y),i.lineTo(y,o.y+o.h),i.stroke(),i.restore()),we(i,o.x+2,3,"us aqi \u2014 next 4 days"),u&&u.x>o.x&&u.x<o.x+o.w){let L=G(Math.round((u.x-o.x)/o.w*(g-1)),0,g-1),H=r[L],D=Re(H.aqi);i.save(),i.strokeStyle="rgba(255,255,255,.3)",i.beginPath(),i.moveTo(v(H.t),o.y),i.lineTo(v(H.t),o.y+o.h),i.stroke(),i.restore(),Ye(i,v(H.t),u.y,[`${n.fmt.weekday(H.t)} ${n.fmt.hm(H.t)}|`,`AQI|${Math.round(H.aqi??0)}`,`CATEGORY|${D.name}`,`PM2.5|${H.pm25?.toFixed(1)??"--"}`,`OZONE|${H.o3?.toFixed(0)??"--"}`],d,S,D.color,{pin:u.coarse})}});function w(i,d,S,u){i.save(),i.font="600 11.5px 'Chakra Petch', sans-serif",i.fillStyle=le,i.textAlign="center",i.textBaseline="middle",i.letterSpacing="1.6px",i.fillText(u.toUpperCase(),d/2,S/2),i.restore()}function A(){let i=n.frame();if(!i)return;let d=i.air||n.airNow,S=d?.aqi,u=Re(S);t("a-cat").textContent=u.name,t("a-cat").style.color=u.color,t("a-note").textContent=E(S);let r=null;if(d)for(let g of Qo){let $=d[g.key];if($==null)continue;let b=$/g.ref;(!r||b>r.frac)&&(r={...g,value:$,frac:b})}t("a-dl").innerHTML=`
      ${M("Dominant",r?`${r.label} ${r.value.toFixed(1)} ${r.unit}`:"\u2014")}
      ${M("PM2.5",d?.pm25!=null?`${d.pm25.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
      ${M("Ozone",d?.o3!=null?`${d.o3.toFixed(0)} \xB5g/m\xB3`:"\u2014")}
      ${M("Aerosol depth",d?.aod!=null?d.aod.toFixed(3):"\u2014")}
      ${M("Dust",d?.dust!=null?`${d.dust.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
    `,t("a-poll").innerHTML=Qo.map(g=>{let $=d?.[g.key];if($==null)return"";let b=G($/g.ref*100,0,100),y=$>g.who,L=b>100?R.crit:b>66?R.serious:b>33?R.warn:R.good;return`
        <div style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
            <span class="lbl" style="color:var(--dim)">${g.label}</span>
            <span class="num" style="font-size:max(.72rem,var(--fs-floor,0px));color:${L}">${$.toFixed($<10?1:0)}<span style="color:var(--faint);font-size:max(.85em,var(--fs-floor,0px))"> ${g.unit}</span></span>
          </div>
          <div class="meter" style="--ac:${L};margin:3px 0 2px;position:relative">
            <i style="width:${b}%"></i>
            <span style="position:absolute;left:${G(g.who/g.ref*100,0,100)}%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.5)"></span>
          </div>
          <div style="font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint)">${g.note}${y?' \xB7 <b style="color:'+R.serious+'">above WHO guideline</b>':""}</div>
        </div>`}).join("")||'<div class="nodata">no pollutant data</div>',k();let p=i.uv;t("a-uvnow").textContent=p!=null?`${p.toFixed(1)} \xB7 ${Ue(p).name}`:"\u2014";let o=i.day?.uvMax;t("a-burn").innerHTML=p>0||o>0?`
      <div class="lbl" style="margin-bottom:4px">time to burn at today's peak (UV ${(o??p).toFixed(1)})</div>
      <div class="burngrid">
        ${zn.map((g,$)=>{let b=Mt(o??p,$+1),y=b==null?Le:b<15?R.crit:b<30?R.serious:b<60?R.warn:R.good;return`<div><span class="lbl">${g}</span><b style="color:${y}">${b==null?"\u2014":b+"m"}</b></div>`}).join("")}
      </div>`:'<div class="nodata">no uv exposure right now</div>';let l=_e(i.dew);t("a-cmf").textContent=l.name;let v=i.feels,h=v!=null&&i.temp!=null?v-i.temp:null;t("a-comfort").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:6px">
        <span class="num" style="font-size:1.7rem;font-weight:700;color:${l.color}">${Y.temp(i.dew)}</span>
        <span class="lbl">dew point</span>
      </div>
      <div class="dewstrip">
        ${[[-99,30,"VERY DRY"],[30,45,"DRY"],[45,55,"COMFORTABLE"],[55,60,"STICKY"],[60,65,"HUMID"],[65,70,"OPPRESSIVE"],[70,99,"MISERABLE"]].map(([$,b,y])=>`<i class="${i.dew!=null&&i.dew>=$&&i.dew<b?"on":""}" style="--c:${_e(($+b)/2).color}" title="${y}"></i>`).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:max(.46rem,var(--fs-floor,0px));color:var(--faint);letter-spacing:.08em;margin-top:2px">
        <span>DRY</span><span>COMFORTABLE</span><span>OPPRESSIVE</span>
      </div>
      <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin:6px 0 8px">${l.note}</div>
      <dl style="margin:0">
        ${M("Air temperature",Y.temp(i.temp))}
        ${M("Feels like",`${Y.temp(i.feels)}${h!=null&&Math.abs(h)>=1?` (${Y.signed(h,0)}\xB0)`:""}`)}
        ${M("Relative humidity",Y.pct(i.rh))}
        ${M("Wet bulb",Y.temp(i.wetbulb))}
        ${M("Vapour deficit",i.vpd!=null?`${i.vpd.toFixed(2)} kPa`:"\u2014")}
      </dl>
      <div style="font-size:max(.56rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Dew point predicts how the air feels far better than relative humidity,
        which only tells you how close the air is to saturation at its own temperature.
      </div>`,a.render(),s.render(),c.render()}function k(){let i=n.pollen,d=n.fmt;if(!i||i.source==="none"){let r=n.frame()?.air,p=r&&["grass","birch","alder","ragweed","olive","mugwort"].map(o=>[o,r[o]]).filter(([,o])=>o!=null);if(p?.length){t("a-polsrc").textContent="CAMS EUROPE",t("a-pollen").innerHTML=p.map(([o,l])=>`
          <div class="kv"><dt>${o}</dt><dd>${l.toFixed(1)} grains/m\xB3</dd></div>`).join("");return}t("a-polsrc").textContent="NO COVERAGE",t("a-pollen").innerHTML=`<div class="nodata">
        pollen data unavailable here<br><span style="color:var(--faint);text-transform:none;letter-spacing:0">
        ${te(i?.reason||"no source covers this location")}</span></div>`;return}let S=dt(i.index),u=i.yesterday!=null&&i.index!=null?i.index-i.yesterday:null;t("a-polsrc").textContent=i.source.toUpperCase(),t("a-pollen").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${S.color}">${i.index?.toFixed(1)??"--"}</span>
        <div>
          <div class="chip" style="--ac:${S.color}">${S.name}</div>
          <div style="font-size:max(.54rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">of 12${u!=null?` \xB7 ${Y.signed(u,1)} vs yesterday`:""}</div>
        </div>
      </div>
      <div class="meter" style="--ac:${S.color};margin:7px 0 9px"><i style="width:${G(i.index/12*100,0,100)}%"></i></div>
      ${i.triggers?.length?`
        <div class="lbl" style="margin-bottom:4px">today's triggers</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">
          ${i.triggers.map(r=>`<span class="chip" style="--ac:var(--lm)">${te(r.name)}</span>`).join("")}
        </div>`:""}
      ${i.forecast?.length?`
        <div class="lbl" style="margin-bottom:4px">5-day outlook</div>
        <div class="pollen-fc">
          ${i.forecast.map(r=>{let p=dt(r.index);return`<div>
              <span class="bar" style="height:${G(r.index/12*100,4,100)}%;--c:${p.color}"></span>
              <b>${r.index.toFixed(1)}</b>
              <span>${d.weekday(Date.parse(r.date))}</span>
            </div>`}).join("")}
        </div>`:""}`}function E(i){return i==null?"no measurement available":i<=50?"Air quality is satisfactory. No restrictions.":i<=100?"Acceptable. Unusually sensitive people may want to limit long outdoor exertion.":i<=150?"Sensitive groups \u2014 asthma, heart or lung conditions, children, older adults \u2014 should reduce prolonged exertion.":i<=200?"Everyone may begin to feel effects. Limit prolonged outdoor exertion.":i<=300?"Health alert. Avoid outdoor exertion; keep windows closed.":"Emergency conditions. Remain indoors with filtration if possible."}let M=(i,d)=>`<div class="kv"><dt>${i}</dt><dd>${d}</dd></div>`;return{update:A,onShow(){a.render(),s.render(),c.render()}}}function en(e){e.className="view dataview",e.innerHTML=`
    <div class="panel bare data-climate"><canvas class="fill" id="d2-clim"></canvas></div>
    <div class="panel bare data-spread"><canvas class="fill" id="d2-spread"></canvas></div>

    <div class="panel data-stats">
      <div class="hd">TODAY IN THE RECORD<span class="rule"></span><span class="val" id="d2-yrs">\u2014</span></div>
      <div class="body" id="d2-rec"></div>
    </div>

    <div class="panel bare data-trend"><canvas class="fill" id="d2-trend"></canvas></div>

    <div class="panel data-derived">
      <div class="hd" style="--ac:var(--vi)">DERIVED<span class="rule"></span><span class="val">SEASON TO DATE</span></div>
      <div class="body" id="d2-derived"></div>
    </div>

    <div class="panel bare data-meteo"><canvas class="fill" id="d2-meteo"></canvas></div>
  `;let t=u=>e.querySelector("#"+u),a=u=>uo(u,n.tz);function s(){let u=n.fmt.isoDate(Date.now()),r=n.days.find(p=>n.fmt.isoDate(p.t)===u);return r?r.t:Date.now()-12*36e5}function c(u,r,p,o){u.save(),u.font="600 11.5px 'Chakra Petch', sans-serif",u.fillStyle=le,u.textAlign="center",u.textBaseline="middle",u.letterSpacing="1.6px",u.fillText(o.toUpperCase()+" \u2026",r/2,p/2),u.restore()}let w=ce(t("d2-clim"),(u,r,p,o)=>{if(!n.climate){c(u,r,p,"loading 30-year archive");return}Po(u,r,p,o,{days:n.days.filter(l=>l.t>=s()),climate:n.climate,tf:n.fmt,doyOf:a})}),A=ce(t("d2-spread"),(u,r,p,o)=>{if(!n.models){c(u,r,p,"loading model ensemble");return}Oo(u,r,p,o,{rows:n.models.rows,tf:n.fmt,now:Date.now()})}),k=ce(t("d2-meteo"),(u,r,p,o)=>{Ot(u,r,p,o,{hours:n.hours,days:n.days,tf:n.fmt,span:{lo:n.cursor-24*36e5,hi:n.cursor+96*36e5},cursor:n.cursor,now:Date.now(),panels:["pressure","cloud","uv","cape"]})},{onPick:({x:u,w:r})=>{let p=n.cursor-864e5,o=n.cursor+96*36e5;n.playing=!1,n.scrubTo(p+(u-4)/(r-34)*(o-p))}}),E=ce(t("d2-trend"),(u,r,p,o)=>{let l=n.climate?.annual;if(!l?.length){c(u,r,p,"loading climate record");return}let v={l:4,r:34,t:16,b:18},h={x:v.l,y:v.t,w:r-v.l-v.r,h:p-v.t-v.b};if(h.w<40||h.h<30)return;let g=l.map(U=>U.mean),$=Math.min(...g)-.4,b=Math.max(...g)+.4,y=U=>h.x+U/(l.length-1)*h.w,L=U=>h.y+h.h-(U-$)/(b-$)*h.h;Ae(u,h,ze($,b,Be(h.h,3)).map(U=>({v:U,y:L(U)})),U=>`${U.toFixed(1)}\xB0`);let H=g.reduce((U,ue)=>U+ue,0)/g.length,D=Math.max(2,h.w/l.length-2);l.forEach((U,ue)=>{let Me=U.mean-H,se=Me>=0?qe("#8d9aab","#f2b45a",G(Math.abs(Me)/1.6,0,1)):qe("#8d9aab","#7fb2f0",G(Math.abs(Me)/1.6,0,1)),me=L(H),Ce=L(U.mean);u.fillStyle=J(se,.9),u.fillRect(y(ue)-D/2,Math.min(me,Ce),D,Math.max(1.5,Math.abs(Ce-me)))});let O=l.length,C=l.reduce((U,ue)=>U+ue.year,0)/O,f=H,T=0,x=0;for(let U of l)T+=(U.year-C)*(U.mean-f),x+=(U.year-C)**2;let F=x?T/x:0,W=l.map((U,ue)=>[y(ue),L(f+F*(U.year-C))]);u.save(),u.setLineDash([5,3]),ke(u,W,F>=0?"#f2b45a":"#7fb2f0",{width:2,glow:10}),u.restore(),u.save(),u.font="500 11.5px 'JetBrains Mono', monospace",u.fillStyle=le,u.textAlign="center",u.textBaseline="top";let P=5*Et(Math.ceil(l.length/5),h.w,u.measureText("2020").width);l.forEach((U,ue)=>{U.year%P||De(u,String(U.year),y(ue),p-v.b+4,0,r)}),u.restore(),u.save(),u.font="600 11.5px 'Chakra Petch', sans-serif",u.letterSpacing="1.2px";let _=`TREND ${F>=0?"+":"\u2212"}${Math.abs(F*10).toFixed(2)}\xB0F / DECADE`,X=u.measureText(_).width;u.fillStyle=F>=0?"#f2b45a":"#7fb2f0",u.textAlign="right",u.textBaseline="top",u.fillText(_,h.x+h.w,3),u.restore(),u.save(),u.font=Pe,u.letterSpacing="1.4px";let N="annual mean temperature \xB0F",j="annual mean \xB0F",oe=U=>u.measureText(U.toUpperCase()).width,Z=oe(N)+X+14<=h.w?N:oe(j)+X+14<=h.w?j:null;if(u.restore(),Z&&we(u,h.x+2,3,Z),o&&o.x>h.x&&o.x<h.x+h.w){let U=G(Math.round((o.x-h.x)/h.w*(l.length-1)),0,l.length-1),ue=l[U];u.save(),u.fillStyle="rgba(22,33,47,.94)",u.strokeStyle=J(V[0],.5);let Me=`${ue.year}  ${ue.mean.toFixed(2)}\xB0F  ${ue.mean-H>=0?"+":"\u2212"}${Math.abs(ue.mean-H).toFixed(2)} vs period mean`;u.font="500 11.5px 'JetBrains Mono', monospace";let se=u.measureText(Me).width+14,me=G(y(U)-se/2,4,Math.max(4,r-se-4)),Ce=o.coarse&&o.y<p/2?h.y+h.h-20:h.y+2;u.beginPath(),u.rect(me,Ce,se,18),u.fill(),u.stroke(),u.fillStyle=Te,u.textAlign="left",u.textBaseline="middle",u.fillText(Me,me+7,Ce+9),u.restore()}});function M(){let u=n.fmt,r=n.climate,p=n.dayFor(n.cursor),o=r?.doy?.[a(n.cursor)];if(t("d2-yrs").textContent=r?`${r.years} YEARS \xB7 ${r.start.slice(0,4)}\u2013${r.end.slice(0,4)}`:"\u2014",o&&p){let O=p.tmax-o.normalHigh,C=p.tmin-(o.normalLow??p.tmin),f=G((p.tmax-o.normalHigh)/Math.max(.1,o.recordHigh-o.normalHigh)*100,0,100);t("d2-rec").innerHTML=`
        <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin-bottom:7px">
          ${u.weekday(n.cursor)} ${u.monthDay(n.cursor)} \xB7 forecast against every
          ${u.monthDay(n.cursor)} since ${r.start.slice(0,4)}
        </div>
        <dl style="margin:0">
          ${S("Forecast high",Y.temp(p.tmax),O>=0?"#f2b45a":"#7fb2f0")}
          ${d("Normal high",`${Y.temp(o.normalHigh)}  (${Y.signed(O)}\xB0)`)}
          ${S("Record high",`${Y.temp(o.recordHigh)} in ${o.recordHighYear}`,p.tmax>=o.recordHigh?R.crit:Le)}
          ${d("Forecast low",Y.temp(p.tmin))}
          ${d("Normal low",`${Y.temp(o.normalLow)}  (${Y.signed(C)}\xB0)`)}
          ${S("Record low",`${Y.temp(o.recordLow)} in ${o.recordLowYear}`,p.tmin<=o.recordLow?V[4]:Le)}
        </dl>
        <div class="lbl" style="margin:9px 0 3px">high, normal \u2192 record</div>
        <div class="meter" style="--ac:${f>85?R.crit:R.serious}">
          <i style="width:${f}%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">
          <span>${Y.temp(o.normalHigh)} normal</span><span>${Y.temp(o.recordHigh)} record</span>
        </div>
        <dl style="margin:9px 0 0">
          ${d("Historically wet",`${Math.round(o.wetFrac*100)}% of years`)}
          ${d("Mean precip",`${o.meanPrecip.toFixed(3)} in`)}
          ${d("Forecast precip",`${(p.precip??0).toFixed(2)} in`)}
        </dl>`}else t("d2-rec").innerHTML='<div class="nodata">climate archive loading\u2026</div>';let l=Date.now(),v=n.hours.filter(O=>O.t<=l&&O.t>=l-720*36e5),h=0,g=0,$=0;for(let O of n.days){if(O.tmax==null||O.tmin==null)continue;let C=(O.tmax+O.tmin)/2;O.t>l||(h+=Math.max(0,65-C),g+=Math.max(0,C-65),$+=Math.max(0,Math.min(C,86)-50))}let b=n.models?.rows?.find(O=>O.t>=l),y=b?b.spread<2?["HIGH",R.good]:b.spread<5?["MODERATE",R.warn]:b.spread<9?["LOW",R.serious]:["VERY LOW",R.crit]:null,L=n.models?.rows?.find(O=>O.t>=l+168*36e5),H=n.days.filter(O=>O.t>l).reduce((O,C)=>O+(C.precip??0),0),D=n.days.filter(O=>O.t>l&&(O.precip??0)>=.01).length;t("d2-derived").innerHTML=`
      <dl style="margin:0">
        ${d("Pressure now",`${Y.pressure(n.frame()?.pressure)} inHg`)}
        ${d("3h tendency",i())}
        ${y?S("Forecast confidence",`${y[0]} \xB7 \xB1${(b.spread/2).toFixed(1)}\xB0`,y[1]):""}
        ${L?d("Day-7 model spread",`${L.spread.toFixed(1)}\xB0`):""}
        ${d("16-day precip total",`${H.toFixed(2)} in`)}
        ${d("Wet days ahead",`${D} of ${n.days.filter(O=>O.t>l).length}`)}
      </dl>
      <div class="lbl" style="margin:9px 0 3px">degree days, window shown</div>
      <dl style="margin:0">
        ${d("Heating (base 65\xB0F)",Math.round(h))}
        ${d("Cooling (base 65\xB0F)",Math.round(g))}
        ${d("Growing (50/86\xB0F)",Math.round($))}
      </dl>
      <div style="font-size:max(.55rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Degree days accumulate how far each day's mean sits from a base
        temperature \u2014 the standard proxy for heating load, cooling load and
        crop development.
      </div>`,w.render(),A.render(),E.render(),k.render()}function i(){let u=n.cursor,r=n.hours.find(v=>v.t>=u-3*36e5),p=n.hours.find(v=>v.t>=u);if(!r?.pressure||!p?.pressure)return"\u2014";let o=(p.pressure-r.pressure)*.029529983,l=Math.abs(o)<.02?"steady":Math.abs(o)<.06?"slow":Math.abs(o)<.12?"moderate":"rapid";return`${Y.signed(o,3)} inHg \xB7 ${o>0?"rising":o<0?"falling":""} ${l}`.trim()}let d=(u,r)=>`<div class="kv"><dt>${u}</dt><dd>${r}</dd></div>`,S=(u,r,p)=>`<div class="kv"><dt>${u}</dt><dd style="color:${p}">${r}</dd></div>`;return{update:M,onShow(){w.render(),A.render(),E.render(),k.render()}}}var Qe=null,Wn=()=>Qe?Promise.resolve(Qe):import("./sats.3HHD6MIE.js").then(e=>Qe=e),tn=1852,Un=1e4,on=24,nn="atmos.sats.v1",_n=5e3,an=2,sn=(e,t)=>t?le:qe("#f07aa6","#3fd0d8",G((e??0)/38e3,0,1));function rn(e){e.className="view overheadview",e.innerHTML=`
    <div class="oh-wrap">
      <div class="panel bare oh-main">
        <canvas class="fill" id="o-map"></canvas>
        <!-- radar-stamp and radar-tools are generic HUD furniture; the names
             are historical, not a coupling to the radar view. -->
        <div class="radar-hud">
          <div class="radar-stamp"><b id="o-count">\u2014</b><span id="o-age">\u2014</span></div>
        </div>
        <div class="radar-tools">
          <button class="tl-btn sm" id="o-center" title="Recentre on you">\u2316</button>
          <button class="tl-btn sm" id="o-zin" title="Zoom in">+</button>
          <button class="tl-btn sm" id="o-zout" title="Zoom out">\u2212</button>
        </div>
      </div>

      <div class="oh-side">
        <div class="panel grow">
          <div class="hd">SELECTED<span class="rule"></span><span class="val" id="o-cs">NOTHING</span></div>
          <div class="body" id="o-sel" style="overflow-y:auto"></div>
        </div>
        <div class="panel" style="--ac:var(--vi)">
          <div class="hd">SATELLITES<span class="rule"></span><span class="val" id="o-satstate">OFF</span></div>
          <div class="body" id="o-satui"></div>
        </div>
        <div class="panel" style="--ac:var(--am)">
          <div class="hd">ALSO UP<span class="rule"></span><span class="val" id="o-lookwhen">NOW</span></div>
          <div class="body" id="o-sky"></div>
        </div>
        <div class="panel grow">
          <div class="hd"><span id="o-neartitle">NEAREST</span><span class="rule"></span><span class="val" id="o-src">\u2014</span></div>
          <div class="body" id="o-near" style="overflow-y:auto"></div>
        </div>
      </div>
    </div>
  `;let t=m=>e.querySelector("#"+m),a=[],s=0,c=null,w=!1,A=!1,k=null,E=null,M=null,i=null,d=!1,S=Object.fromEntries(Ie.map(m=>[m.key,m.on]));try{let m=JSON.parse(localStorage.getItem(nn)||"null");if(m&&typeof m=="object")for(let I of Ie)typeof m[I.key]=="boolean"&&(S[I.key]=m[I.key])}catch{}let u={},r=[],p=null,o=0,l=null,v=[],h=()=>n.loc||{lat:0,lon:0},g=new it(t("o-map"),{center:[h().lat,h().lon],zoom:9,minZoom:5,maxZoom:12,onTap:m=>$(m)});g.layers=[{name:"base",url:(m,I,q)=>`${rt}/World_Dark_Gray_Base/MapServer/tile/${m}/${q}/${I}`,filter:Ut,opacity:1},{name:"labels",url:(m,I,q)=>`${rt}/World_Dark_Gray_Reference/MapServer/tile/${m}/${q}/${I}`,filter:_t,opacity:.85}],g.overlays.push((m,I)=>{let q=h(),[B,z]=I.project(q.lat,q.lon),K=156543.03392*Math.cos(I.lat*Math.PI/180)/Math.pow(2,I.zoom);m.save(),m.strokeStyle="rgba(63,208,216,.13)",m.setLineDash([2,4]),m.lineWidth=1,m.font="500 11.5px 'JetBrains Mono', monospace",m.fillStyle=V[0],m.textAlign="center",m.textBaseline="bottom";for(let Q of[10,20,40]){let ee=Q*tn/K;ee<24||ee>Math.max(I.w,I.h)||(m.beginPath(),m.arc(B,z,ee,0,Math.PI*2),m.stroke(),xe(m,`${Q} NM`,B,z-ee-2))}m.restore();for(let Q of d?[]:a){let[ee,ne]=I.project(Q.lat,Q.lon);if(ee<-20||ne<-20||ee>I.w+20||ne>I.h+20)continue;let pe=Q.hex===k,ye=sn(Q.alt,Q.gnd);if(pe){let Se=(Q.gs??0)/60;if(Se>.1&&Q.trk!=null){let lo=Se*tn/K,co=(Q.trk-90)*Math.PI/180;m.save(),m.strokeStyle=J(ye,.6),m.setLineDash([3,3]),m.lineWidth=1.2,m.beginPath(),m.moveTo(ee,ne),m.lineTo(ee+Math.cos(co)*lo,ne+Math.sin(co)*lo),m.stroke(),m.restore()}m.save(),m.strokeStyle=ye,m.lineWidth=1.5,m.shadowColor=ye,m.shadowBlur=5,m.beginPath(),m.arc(ee,ne,13,0,Math.PI*2),m.stroke(),m.restore()}if(m.save(),m.translate(ee,ne),m.rotate((Q.trk??0)*Math.PI/180),m.fillStyle=ye,pe&&(m.shadowColor=ye,m.shadowBlur=4),m.beginPath(),m.moveTo(0,-6.5),m.lineTo(4.5,5),m.lineTo(0,2.4),m.lineTo(-4.5,5),m.closePath(),m.fill(),m.restore(),pe&&Q.cs){m.save(),m.font="600 11.5px 'Chakra Petch', sans-serif",m.letterSpacing="1.2px",m.textAlign="left",m.textBaseline="middle";let Se=m.measureText(Q.cs).width+10;m.fillStyle="rgba(22,33,47,.88)",m.fillRect(ee+16,ne-7,Se,14),m.fillStyle=ye,m.fillText(Q.cs,ee+21,ne),m.restore()}}d&&j(m,I),n.loc&&qt(m,B,z,"#f07aa6",null),Gt(m,I,12,I.h-12)});function $(m){if(d){let B=null,z=on;for(let K of r){let[Q,ee]=g.project(K.p.lat,K.p.lon),ne=Math.hypot(Q-m.x,ee-m.y);ne<z&&(z=ne,B=K)}oe(B?B.sat.id:null);return}let I=null,q=on;for(let B of a){let[z,K]=g.project(B.lat,B.lon),Q=Math.hypot(z-m.x,K-m.y);Q<q&&(q=Q,I=B)}b(I?I.hex:null)}function b(m){if(k===m||(k=m,E=null,D(),g.invalidate(),!m))return;let I=a.find(q=>q.hex===m);I&&ve.flight(I.cs||"",I.hex||"").then(q=>{k===m&&(E=q,D())}).catch(()=>{})}let y=(m,I)=>`<div class="kv"><dt>${m}</dt><dd>${I}</dd></div>`,L=m=>m==null?"\u2014":`${Math.round(m).toLocaleString()} ft`;function H(m,I){let q=h(),B=Math.PI/180,z=(I-q.lon)*B,K=Math.sin(z)*Math.cos(m*B),Q=Math.cos(q.lat*B)*Math.sin(m*B)-Math.sin(q.lat*B)*Math.cos(m*B)*Math.cos(z);return(Ne(Math.atan2(K,Q))+360)%360}function D(){if(d){U();return}let m=a.find(ee=>ee.hex===k);if(!m){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap an aircraft on the map, or a row in NEAREST.</p>';return}t("o-cs").textContent=m.cs||m.reg||m.hex.toUpperCase();let I=m.vs==null||Math.abs(m.vs)<100?"level":m.vs>0?`climbing ${Math.round(m.vs).toLocaleString()} ft/min`:`descending ${Math.abs(Math.round(m.vs)).toLocaleString()} ft/min`,q=H(m.lat,m.lon),B=[],z=E;z?.airline?B.push(y("Operator",te(z.airline))):z?.aircraft?.owner&&B.push(y("Operator",te(z.aircraft.owner)));let K=z?.aircraft?.manufacturer&&z?.aircraft?.type?`${z.aircraft.manufacturer} ${z.aircraft.type}`:m.type;if(K&&B.push(y("Aircraft",te(K))),m.reg&&B.push(y("Registration",te(m.reg))),z?.origin||z?.destination){let ee=ne=>ne?`${te(ne.iata||"??")} <span class="dim">${te(ne.city||"")}</span>`:"\u2014";B.push(y("From",ee(z.origin))),B.push(y("To",ee(z.destination)))}B.push(y("Altitude",m.gnd?"on the ground":L(m.alt))),B.push(y("Motion",`${m.gs==null?"\u2014":`${Math.round(m.gs)} kt`} \xB7 ${I}`)),B.push(y("Heading",m.trk==null?"\u2014":`${Math.round(m.trk)}\xB0 ${fe(m.trk)}`)),B.push(y("From you",`${(m.dst??0).toFixed(1)} nm ${fe(q)}`));let Q=z&&!z.origin&&m.cs?'<p class="hint">No published route \u2014 usually private or general aviation.</p>':z?.origin?'<p class="hint">Route is by callsign, which airlines reuse day to day.</p>':"";t("o-sel").innerHTML=B.join("")+Q}function O(){if(d){ue();return}t("o-neartitle").textContent="NEAREST";let m=a.filter(I=>!I.gnd).slice(0,8);if(t("o-src").textContent=w?c?c.toUpperCase():"NO FEED":"\u2014",!m.length){t("o-near").innerHTML=w?A?'<p class="hint">The aircraft feeds are not answering. Trying again shortly.</p>':'<p class="hint">Nothing in the air within range.</p>':'<p class="hint">Looking for aircraft\u2026</p>';return}t("o-near").innerHTML='<div class="oh-head"><span>callsign</span><span>type</span><span>range</span><span>alt</span></div>'+m.map(I=>`
      <button class="oh-row" data-hex="${te(I.hex)}" aria-pressed="${I.hex===k}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${sn(I.alt,I.gnd)} 80%, var(--ink))">${te(I.cs||I.reg||I.hex)}</span>
        <span class="oh-t">${te(I.type||"")}</span>
        <span class="oh-d">${(I.dst??0).toFixed(1)} nm</span>
        <span class="oh-a">${I.alt==null?"\u2014":`${(I.alt/1e3).toFixed(1)}k`}</span>
      </button>`).join("");for(let I of t("o-near").querySelectorAll(".oh-row"))I.addEventListener("click",()=>{b(I.dataset.hex),O()})}function C(){let m=h(),I=new Date(n.cursor),q=pt(I,m.lat,m.lon),B=ht(I,m.lat,m.lon),z=(ee,ne,pe,ye)=>{let Se=ne>0;return`<div class="kv"><dt style="color:${ye}">${ee}</dt><dd>${Se?`${ne.toFixed(0)}\xB0 up, ${fe(pe)}`:'<span class="dim">below the horizon</span>'}</dd></div>`},K=[z("Sun",Ne(q.altitude),tt(q.azimuth),"#f2b45a"),z("Moon",Ne(B.altitude),tt(B.azimuth),"#7fb2f0")];K.push(M&&M.alt>0?z("ISS",M.alt,M.az,"#8fdc6a"):`<div class="kv"><dt style="color:#8fdc6a">ISS</dt><dd><span class="dim">${M?`below the horizon, ${M.range.toLocaleString()} km away`:"no fix"}</span></dd></div>`);let Q=Math.abs(n.cursor-Date.now());t("o-lookwhen").textContent=Q<6*6e4?"NOW":`${n.fmt.weekday(n.cursor)} ${n.fmt.hm(n.cursor)}`,t("o-sky").innerHTML=K.join("")+'<p class="hint">Aircraft positions from adsb.lol under ODbL; routes and airframes from adsbdb. Both are run by volunteers.</p>'}function f(){if(d){Me();return}let m=a.filter(q=>!q.gnd).length;t("o-count").textContent=w?A?"AIRCRAFT FEEDS NOT ANSWERING":`${m} AIRCRAFT`:"\u2014";let I=s?Math.round((Date.now()-s)/1e3):null;t("o-age").textContent=I==null?"\u2014":I<20?"LIVE":`${I}s AGO`}async function T(){if(!(d||n.view!=="overhead"||!n.loc))try{let m=await ve.aircraft(n.loc.lat,n.loc.lon,60);a=m.aircraft||[],s=m.at||Date.now(),c=m.source,A=m.source==null,w=!0,k&&!a.some(I=>I.hex===k)&&b(null),f(),O(),D(),g.invalidate()}catch{}}async function x(){if(!(n.view!=="overhead"||!n.loc))try{let m=await ve.iss();if(m.pos?.ok){let I=m.pos.data;M=ft(n.loc.lat,n.loc.lon,I.latitude,I.longitude,I.altitude),C()}}catch{}}let F=m=>Ie.find(I=>I.key===m),W=m=>`${m.lat.toFixed(1)},${m.lon.toFixed(1)}`,P=m=>m<1?`${Math.max(1,Math.round(m*60))} min`:m<48?`${Math.round(m)} h`:`${Math.round(m/24)} days`;async function _(m){let I=u[m.key];if(!(I&&(I.state==="ok"||I.state==="loading"))){u[m.key]={state:"loading",sats:[],fetched:null};try{await Wn();let q=new Map,B=1/0;for(let z of m.groups){let K=await fetch(new URL(`/sats/${z}.json`,location.origin));if(!K.ok)throw new Error(`${z} -> ${K.status}`);let Q=await K.json(),ee=Date.parse(Q.fetched);Number.isFinite(ee)&&(B=Math.min(B,ee));for(let ne of Qe.prepare(Q.records,m.key))q.set(ne.id,ne)}if(!q.size)throw new Error("empty");u[m.key]={state:"ok",sats:[...q.values()],fetched:Number.isFinite(B)?B:null}}catch{u[m.key]={state:"fail",sats:[],fetched:null}}N(!0),se(),O(),D(),f(),g.invalidate()}}let X={};function N(m){if(!d)return;let I=n.cursor,q=h(),B=[];for(let K of Ie){let Q=u[K.key];if(!S[K.key]||!Q||Q.state!=="ok")continue;let ee=X[K.key],ne=K.key==="starlink";if(!m&&ne&&ee&&Math.abs(I-ee.at)<_n){B.push(...ee.list);continue}let pe=[];for(let ye of Q.sats){let Se=Qe.positionAt(ye,I);Se&&pe.push({sat:ye,p:Se,cat:K,look:ft(q.lat,q.lon,Se.lat,Se.lon,Se.altKm)})}X[K.key]={at:I,list:pe},B.push(...pe)}r=B;let z=r.find(K=>K.sat.id===p);v=z?Qe.groundTrack(z.sat,I,90,60):[]}function j(m,I){let q=256*Math.pow(2,I.zoom),B=r.find(z=>z.sat.id===p);for(let z of[-q,0,q]){if(B&&v.length){m.save(),m.strokeStyle=J(B.cat.colour,.7),m.setLineDash([4,4]),m.lineWidth=1.4;for(let K of v)m.beginPath(),K.forEach(([Q,ee],ne)=>{let[pe,ye]=I.project(Q,ee);ne?m.lineTo(pe+z,ye):m.moveTo(pe+z,ye)}),m.stroke();m.restore()}for(let K of r){let[Q,ee]=I.project(K.p.lat,K.p.lon),ne=Q+z;if(ne<-6||ee<-6||ne>I.w+6||ee>I.h+6)continue;let pe=K.cat.key==="starlink";m.fillStyle=K.cat.colour,m.beginPath(),m.arc(ne,ee,pe?1.7:3.2,0,Math.PI*2),m.fill()}if(B){let[K,Q]=I.project(B.p.lat,B.p.lon),ee=K+z;if(ee<-40||Q<-20||ee>I.w+40||Q>I.h+20)continue;m.save(),m.strokeStyle=B.cat.colour,m.lineWidth=1.5,m.shadowColor=B.cat.colour,m.shadowBlur=5,m.beginPath(),m.arc(ee,Q,10,0,Math.PI*2),m.stroke(),m.restore(),m.save(),m.font="600 11.5px 'Chakra Petch', sans-serif",m.letterSpacing="1.2px",m.textAlign="left",m.textBaseline="middle";let ne=m.measureText(B.sat.name).width+10;m.fillStyle="rgba(22,33,47,.88)",m.fillRect(ee+14,Q-7,ne,14),m.fillStyle=B.cat.colour,m.fillText(B.sat.name,ee+19,Q),m.restore()}}}function oe(m){p!==m&&(p=m,N(!1),D(),O(),g.invalidate())}let Z=m=>r.filter(I=>W(I.p)===W(m.p)&&I.sat.id!==m.sat.id);function U(){let m=r.find(pe=>pe.sat.id===p);if(!m){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap a dot on the map, or a row in ABOVE YOU.</p>';return}let{sat:I,p:q,look:B,cat:z}=m;t("o-cs").textContent=I.name;let K=[y("Kind",te(Lt(I.name))),y("Group",te(z.label)),y("NORAD ID",String(I.id))];I.intl&&K.push(y("Launch",te(I.intl))),K.push(y("Altitude",`${Math.round(q.altKm).toLocaleString()} km`)),K.push(y("Over",`${Math.abs(q.lat).toFixed(1)}\xB0${q.lat<0?"S":"N"} ${Math.abs(q.lon).toFixed(1)}\xB0${q.lon<0?"W":"E"}`)),K.push(y("From you",B.alt>0?`${B.alt.toFixed(0)}\xB0 up, ${fe(B.az)}`:`<span class="dim">below the horizon, ${B.range.toLocaleString()} km away</span>`));let Q=Qe.elementAgeHours(I,n.cursor);K.push(y("Elements",`${Q<0?"newer than":""} ${P(Math.abs(Q))} ${Q<0?"ahead":"old"}`.trim()));let ee=Z(m),ne=ee.length?`<p class="hint">Same orbit data, so same position: ${ee.slice(0,6).map(pe=>te(pe.sat.name)).join(", ")}${ee.length>6?` and ${ee.length-6} more`:""}. Docked craft share the station's elements.</p>`:"";t("o-sel").innerHTML=K.join("")+ne+'<p class="hint">Dashed line: next 90 minutes of ground track. Kind is read from the catalogue name.</p>'}function ue(){t("o-neartitle").textContent="ABOVE YOU",t("o-src").textContent="CELESTRAK";let m=new Set,I=r.filter(z=>z.look.alt>0).sort((z,K)=>K.look.alt-z.look.alt),q=[];for(let z of I){let K=W(z.p);if(!m.has(K)&&(m.add(K),q.push({q:z,extra:Z(z).length}),q.length>=8))break}let B=Ie.some(z=>S[z.key]&&u[z.key]?.state==="ok");if(!q.length){t("o-near").innerHTML=`<p class="hint">${B?"Nothing in the chosen groups is above your horizon right now.":"Switch on a group above to see what is overhead."}</p>`;return}t("o-near").innerHTML='<div class="oh-head"><span>name</span><span>type</span><span>up</span><span>dir</span></div>'+q.map(({q:z,extra:K})=>`
      <button class="oh-row" data-sat="${z.sat.id}" aria-pressed="${z.sat.id===p}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${z.cat.colour} 80%, var(--ink))">${te(z.sat.name)}${K?` +${K}`:""}</span>
        <span class="oh-t">${Lt(z.sat.name)==="satellite"?"":te(Lt(z.sat.name))}</span>
        <span class="oh-d">${z.look.alt.toFixed(0)}\xB0</span>
        <span class="oh-a">${fe(z.look.az)}</span>
      </button>`).join("");for(let z of t("o-near").querySelectorAll(".oh-row"))z.addEventListener("click",()=>oe(Number(z.dataset.sat)))}function Me(){let m=Ie.filter(q=>S[q.key]&&u[q.key]?.state==="ok");t("o-count").textContent=`${r.length.toLocaleString()} SATELLITES`;let I=m.map(q=>u[q.key].fetched).filter(Boolean);t("o-age").textContent=I.length?`ELEMENTS ${P((Date.now()-Math.min(...I))/36e5).toUpperCase()} OLD`:"\u2014"}function se(){let m=Ie.some(B=>S[B.key]&&u[B.key]?.state==="loading"),I=Ie.some(B=>S[B.key]&&u[B.key]?.state==="fail");t("o-satstate").textContent=d?m?"LOADING":I?"NO DATA":`${r.length.toLocaleString()} SHOWN`:"OFF";let q=B=>{let z=u[B.key],K=!d||!S[B.key]?"":z?.state==="loading"?" \u2026":z?.state==="fail"?" \u2715":z?.state==="ok"?` ${z.sats.length.toLocaleString()}`:"";return`<button class="oh-chip" data-cat="${B.key}" aria-pressed="${!!S[B.key]}" style="--chip:${B.colour}">${te(B.label)}${K}</button>`};t("o-satui").innerHTML=`
      <button class="oh-chip oh-mode" data-mode="1" aria-pressed="${d}">${d?"Back to aircraft":"Show satellites on map"}</button>
      <div class="oh-chips">${Ie.map(q).join("")}</div>
      ${I?'<p class="hint">Satellite elements are not available here. They are published to branyontech.com every two hours.</p>':""}
      ${d&&S.starlink?'<p class="hint">Starlink is thousands of objects: a large download, loaded only when on.</p>':""}
      ${d?'<p class="hint">Elements: CelesTrak. Positions computed here (SGP4).</p>':""}`}function me(){try{localStorage.setItem(nn,JSON.stringify(S))}catch{}}function Ce(m){if(d!==m){if(d=m,clearInterval(l),l=null,m){b(null),g.minZoom=1;let I=h();g.setView(G(I.lat*.5,-40,40),I.lon,an);for(let q of Ie)S[q.key]&&_(q);n.view==="overhead"&&(l=setInterval(()=>{N(!1),Me(),O(),g.invalidate()},1e3)),N(!0)}else p=null,v=[],r=[],g.minZoom=5,g.setView(h().lat,h().lon,9),T();se(),D(),O(),f(),g.invalidate()}}return t("o-satui").addEventListener("click",m=>{let I=m.target.closest("button");if(!I)return;if(I.dataset.mode){Ce(!d);return}let q=F(I.dataset.cat);q&&(S[q.key]=!S[q.key],me(),d&&S[q.key]&&_(q),N(!0),p!=null&&!r.some(B=>B.sat.id===p)&&(p=null),se(),D(),O(),f(),g.invalidate())}),t("o-center").addEventListener("click",()=>{n.loc&&(d?g.setView(G(n.loc.lat*.5,-40,40),n.loc.lon,an):g.setView(n.loc.lat,n.loc.lon,9))}),t("o-zin").addEventListener("click",()=>g.setView(g.lat,g.lon,g.zoom+1)),t("o-zout").addEventListener("click",()=>g.setView(g.lat,g.lon,g.zoom-1)),n.on("loc",()=>{if(n.loc){if(d){N(!0),O(),g.invalidate(),x();return}g.setView(n.loc.lat,n.loc.lon,9),T(),x()}}),D(),C(),se(),O(),n.on("cursor",()=>{n.view==="overhead"&&(C(),d&&(N(!1),D(),O(),g.invalidate()))}),{map:g,update(){C(),g.invalidate()},onShow(){g.resize(),T(),x(),clearInterval(i),i=setInterval(()=>{T(),f()},Un),d&&!l&&(l=setInterval(()=>{N(!1),Me(),O(),g.invalidate()},1e3))},onHide(){clearInterval(i),i=null,clearInterval(l),l=null}}}var re=null,We=null,Vt=!1,Ee=null,qn=0,wt=1/0;function ln(e,t=4){let a=e.createBuffer(1,e.sampleRate*t,e.sampleRate),s=a.getChannelData(0);for(let c=0;c<s.length;c++)s[c]=Math.random()*2-1;return a}function oo(e,t,{type:a,freq:s,q:c,gain:w}){let A=e.createBufferSource();A.buffer=ln(e),A.loop=!0;let k=e.createBiquadFilter();k.type=a,k.frequency.value=s,k.Q.value=c;let E=e.createGain();return E.gain.value=w,A.connect(k).connect(E).connect(t),A.start(),{src:A,filt:k,gain:E}}function cn(){if(re)return;let e=window.AudioContext||window.webkitAudioContext;if(!e)return;re=new e,We=re.createGain(),We.gain.value=0;let t=re.createDynamicsCompressor();t.threshold.value=-18,t.ratio.value=6,t.attack.value=.004,t.release.value=.25,We.connect(t).connect(re.destination);let a=oo(re,We,{type:"bandpass",freq:1400,q:.7,gain:0}),s=oo(re,We,{type:"highpass",freq:4200,q:.5,gain:0}),c=oo(re,We,{type:"bandpass",freq:420,q:1.6,gain:0}),w=re.createOscillator(),A=re.createGain();w.frequency.value=.07,A.gain.value=180,w.connect(A).connect(c.filt.frequency),w.start();let k=re.createGain();k.gain.value=0;let E=re.createBiquadFilter();E.type="lowpass",E.frequency.value=480,E.Q.value=.6,E.connect(k).connect(We);let M=[0,3.5].map(i=>{let d=re.createOscillator();d.type="sawtooth",d.frequency.value=55,d.detune.value=i;let S=re.createGain();return S.gain.value=.22,d.connect(S).connect(E),d.start(),d});Ee={rain:a,patter:s,wind:c,drone:{oscs:M,gain:k,filt:E},lfo:w,lfoGain:A}}function Xe(){return Vt}function dn(e){Vt=e,re&&(e&&re.state==="suspended"&&re.resume(),Ke(We.gain,e?.5:0,e?1.2:.6))}var Ke=(e,t,a=.6)=>{let s=re.currentTime;e.cancelScheduledValues(s),e.setValueAtTime(e.value,s),e.linearRampToValueAtTime(t,s+a)};function Gn(e=.5){if(!re||!Vt)return;let t=re.currentTime,a=re.createBufferSource();a.buffer=ln(re,3);let s=re.createBiquadFilter();s.type="lowpass",s.frequency.setValueAtTime(700-e*480,t),s.Q.value=.5;let c=re.createGain(),w=.55*(1-e*.65);c.gain.setValueAtTime(1e-4,t),c.gain.exponentialRampToValueAtTime(Math.max(.02,w),t+.04+e*.3),c.gain.exponentialRampToValueAtTime(1e-4,t+1.6+e*2.4),a.connect(s).connect(c).connect(We),a.start(t),a.stop(t+4.2)}function un(e){if(!re||!Vt||!Ee)return;let t=e.frame();if(!t)return;let a=t.wx.kind,s=Math.min(1,Math.max((t.precip??0)/.1,a==="rain"||a==="storm"?t.wx.intensity*.5:0)),c=Math.min(1,(t.wind??0)/32),w=Math.min(1,((t.gust??t.wind??0)-(t.wind??0))/18);Ke(Ee.rain.gain.gain,s*.3,.9),Ke(Ee.rain.filt.frequency,900+s*1500,.9),Ke(Ee.patter.gain.gain,s*s*.1,.9),Ke(Ee.wind.gain.gain,c*.24,1.1),Ke(Ee.wind.filt.Q,1.2+w*2.5,1.1),Ee.lfo.frequency.value=.05+w*.22,Ee.lfoGain.gain.value=120+w*420;let A=t.temp??60,k=44+Math.max(0,Math.min(1,(A-20)/80))*26;for(let i of Ee.drone.oscs)i.frequency.setTargetAtTime(k,re.currentTime,1.5);Ke(Ee.drone.gain.gain,.055+(t.sun.altDeg>0?.02:.05),2),Ke(Ee.drone.filt.frequency,300+Math.max(0,t.sun.altDeg)*9,2);let E=a==="storm"?.9:Math.min(.6,(t.cape??0)/2500),M=performance.now();E>.15?(wt===1/0&&(wt=M+Math.random()*6e3),M>wt&&(Gn(Math.random()*(1-E*.6)),wt=M+3e3+Math.random()*22e3*(1.1-E))):wt=1/0,qn=E}function Vn(e){let t=e.fmt,a=e.frame(Date.now());if(!a)return[];let s=[],c=a.day,w=Date.now();s.push({tone:"lead",text:`${t.full(w)}. It is ${Y.temp(a.temp)} and ${a.wx.long.toLowerCase()} in ${e.loc.name}`+(Math.abs((a.feels??a.temp)-a.temp)>=3?`, feeling like ${Y.temp(a.feels)}`:"")+"."});for(let p of e.alerts.slice(0,3))s.push({tone:"alert",text:`${p.event} in effect until ${t.weekday(p.expires)} ${t.hm12(p.expires)}.`+(p.instruction?` ${Kn(p.instruction)}`:"")});if(c){let p=e.climate?.doy?.[jn(e,w)],o=`Today runs ${Y.temp(c.tmin)} to ${Y.temp(c.tmax)}`;if(p){let l=c.tmax-p.normalHigh;Math.abs(l)>=3?o+=`, ${Math.abs(l).toFixed(0)}\xB0 ${l>0?"above":"below"} the normal high of ${Y.temp(p.normalHigh)}`:o+=", right about normal",c.tmax>=p.recordHigh&&(o+=`. That would tie or beat the record of ${Y.temp(p.recordHigh)} set in ${p.recordHighYear}`)}s.push({tone:"body",text:o+"."})}let A=gt(e);if(A?.raining)s.push({tone:"wet",text:A.minutes!=null?`It is raining now and should ease within ${A.minutes} minutes.`:"It is raining now, with no break in the next six hours."});else if(A?.minutes!=null&&A.minutes<=240)s.push({tone:"wet",text:`Rain arrives in about ${A.minutes} minutes, around ${t.hm12(A.changeAt)}.`});else{let p=e.hours.find(o=>o.t>w&&(o.pop??0)>=40);p?s.push({tone:"body",text:`Dry for now. The next real chance of rain is ${t.weekday(p.t)} around ${t.hm12(p.t)}, at ${Math.round(p.pop)} percent.`}):s.push({tone:"body",text:"No meaningful rain anywhere in the sixteen-day window."})}let k=Math.max(...e.hours.filter(p=>p.t>w&&p.t<w+24*36e5).map(p=>p.gust??0),0);k>=22&&s.push({tone:"warn",text:`Wind is worth planning around: gusts reach ${Math.round(k)} miles per hour today, ${Tt(k).effect}.`});let E=_e(a.dew);["STICKY","HUMID","OPPRESSIVE","MISERABLE","LETHAL"].includes(E.name)?s.push({tone:"warn",text:`The air is ${E.name.toLowerCase()} \u2014 dew point ${Y.temp(a.dew)}, ${E.note}.`}):E.name==="VERY DRY"&&s.push({tone:"body",text:`Very dry air, dew point ${Y.temp(a.dew)}. Expect static and chapped lips.`});let M=c?.uvMax;if(M!=null&&M>=6){let p=Math.round(350/(M*15));s.push({tone:"warn",text:`UV peaks at ${M.toFixed(1)}, ${Ue(M).name.toLowerCase()}. Unprotected skin burns in roughly ${p} minutes.`})}let i=a.air?.aqi??e.airNow?.aqi;i!=null&&i>75&&s.push({tone:"warn",text:`Air quality is ${Re(i).name.toLowerCase()} at ${Math.round(i)} on the US index.`});let d=e.pollen;if(d?.index!=null&&d.index>=7){let p=(d.triggers||[]).map(o=>o.name).slice(0,3).join(", ");s.push({tone:"warn",text:`Pollen is ${dt(d.index).name.toLowerCase().replace("-"," to ")} at ${d.index.toFixed(1)} of 12${p?`, driven by ${p}`:""}.`})}let S=Ht.map(p=>({k:p,w:Ft(p,e,{hours:24,limit:1,minScore:62})[0]})).filter(p=>p.w).sort((p,o)=>o.w.peak-p.w.peak).slice(0,2);for(let p of S){let o=Rt(p.k);s.push({tone:"good",text:`Best window to ${o.label.toLowerCase()}: ${t.weekday(p.w.start)} ${t.hm12(p.w.start)} to ${t.hm12(p.w.end)}, scoring ${p.w.peak} out of 100.`})}let u=e.currentKp();if(u!=null&&u>=5){let p=St(u);s.push({tone:"space",text:`Geomagnetic activity is elevated: Kp ${u.toFixed(1)}, ${p.name}. Aurora may be visible to about ${p.lat} degrees latitude.`})}let r=e.sunTimesFor(w);return s.push({tone:"body",text:`Sunset is at ${t.hm12(r.sunset)}, with golden hour beginning ${t.hm12(r.goldenHour)}`+(c?.daylight?` and ${et(c.daylight)} of daylight today`:"")+"."}),s}var Kn=e=>{let t=String(e).replace(/\s+/g," ").match(/^.{0,180}?[.!?](\s|$)/);return(t?t[0]:String(e).slice(0,180)).trim()};function jn(e,t){let[,a,s]=e.fmt.isoDate(t).split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][a-1]+s-1}var Yn={lead:"var(--cy)",alert:"var(--rd)",warn:"var(--am)",wet:"var(--ice)",good:"var(--lm)",space:"var(--vi)",body:"var(--ink)"};function no(e,t){let a=Vn(e);t(`
    <div class="hd">BRIEFING<span class="rule"></span>
      <span class="val">${te(e.loc.name.toUpperCase())} \xB7 ${e.fmt.hm(Date.now())}</span></div>
    <div class="res-list" style="max-height:60vh">
      ${a.map((s,c)=>`
        <p style="
          margin:0 0 10px;
          font-size:${c===0?".92rem":".8rem"};
          line-height:1.6;
          color:${Yn[s.tone]||"var(--ink)"};
          ${s.tone==="alert"?"border-left:2px solid var(--rd);padding-left:10px;":""}
          ${c===0?"font-weight:600;":""}
        ">${te(s.text)}</p>`).join("")}
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      <button class="tl-btn" id="speakBtn">\u25B6 SPEAK</button>
      <button class="tl-btn" id="stopBtn">\u25A0 STOP</button>
    </div>
  `,s=>{let c=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();let w=a.map(E=>E.text).join(" "),A=new SpeechSynthesisUtterance(w);A.rate=1.02,A.pitch=.85;let k=speechSynthesis.getVoices().find(E=>/en[-_](GB|US)/.test(E.lang)&&E.localService);k&&(A.voice=k),speechSynthesis.speak(A)};s.querySelector("#speakBtn").addEventListener("click",c),s.querySelector("#stopBtn").addEventListener("click",()=>speechSynthesis?.cancel()),e.settings.voice&&setTimeout(c,220)})}function pn(e,t,a){let s=t.ownerDocument,c='a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',w=null,A=!1,k=()=>[...t.querySelectorAll(c)].filter(u=>u.tabIndex>=0&&!u.matches(":disabled")&&!u.closest("[hidden], [inert]")&&u.getClientRects().length&&s.defaultView.getComputedStyle(u).visibility!=="hidden").sort((u,r)=>(u.tabIndex||1/0)-(r.tabIndex||1/0)),E=()=>(k()[0]||t).focus();function M(u){!e.hidden&&!t.contains(u.target)&&E()}function i(u){if(e.hidden||u.defaultPrevented||u.isComposing)return;if(u.key==="Escape"){u.preventDefault(),u.stopPropagation(),S();return}if(u.key!=="Tab"||u.ctrlKey||u.metaKey||u.altKey)return;let r=k(),p=r[0],o=r.at(-1);p?(!r.includes(s.activeElement)||(u.shiftKey?s.activeElement===p:s.activeElement===o))&&(u.preventDefault(),(u.shiftKey?o:p).focus()):(u.preventDefault(),t.focus({preventScroll:!0}))}function d(u,r,p){e.hidden&&(w=p||s.activeElement,A=a?.inert||!1,a&&(a.inert=!0),s.addEventListener("keydown",i,!0),s.addEventListener("focusin",M)),t.innerHTML=u;let o=t.querySelector(".hd");o?(o.id||="modalTitle",t.setAttribute("aria-labelledby",o.id),t.removeAttribute("aria-label")):(t.removeAttribute("aria-labelledby"),t.setAttribute("aria-label","Weather dialog")),e.hidden=!1,e.scrollTop=t.scrollTop=0,r&&r(t),t.contains(s.activeElement)||E()}function S(){if(e.hidden)return;e.hidden=!0,s.removeEventListener("keydown",i,!0),s.removeEventListener("focusin",M),t.innerHTML="",a&&(a.inert=A);let u=w;w=null,u?.isConnected&&!u.closest("[inert]")&&u.focus({preventScroll:!0})}return e.addEventListener("click",u=>{u.target===e&&S()}),{open:d,close:S}}var io=["deck","radar","sky","air","data","overhead"],Zn=5*6e4,de={sky:document.getElementById("sky"),boot:document.getElementById("boot"),bootLog:document.getElementById("bootLog"),led:document.getElementById("led"),locBtn:document.getElementById("locBtn"),locName:document.getElementById("locName"),locSub:document.getElementById("locSub"),nav:document.getElementById("nav"),clockTime:document.getElementById("clockTime"),clockZone:document.getElementById("clockZone"),alertBtn:document.getElementById("alertBtn"),soundBtn:document.getElementById("soundBtn"),briefBtn:document.getElementById("briefBtn"),cfgBtn:document.getElementById("cfgBtn"),scrub:document.getElementById("scrub"),modal:document.getElementById("modal"),modalCard:document.getElementById("modalCard")},je=new It(de.sky),gn=null,He={},yn=pn(de.modal,de.modalCard,document.getElementById("app")),fn=[];function be(e,t=""){fn.push(t?`<span class="${t}">${e}</span>`:e),de.bootLog.innerHTML=fn.join(`
`)}async function Jn(){be("ATMOS//NET v1.0.0"),be('<span class="mut">initialising atmospheric console\u2026</span>'),So();let e=new URLSearchParams(location.search).get("q");e!==null&&/^[0-3]$/.test(e)&&Xt(+e),be(`render tier ${ae.tier} \xB7 ${ae.onBattery?"battery":"AC power"}`,"ok");let t=je.init();je.setQuality(ae.tier),be(t?"webgl2 sky renderer online":"webgl2 unavailable \u2014 sky disabled",t?"ok":"err"),ae.onChange(w=>je.setQuality(w));let a=n.loc,s=null;a?be(`location: ${te(a.name)}`):(s=await ve.config(),a=s.home,be(`no saved location \u2014 using ${te(a.name)}`)),be('<span class="mut">contacting feeds\u2026</span>'),await n.setLocation(a,{remember:!s?.public});let c=n.raw;be(`open-meteo forecast  ${c?.forecast?.ok?"OK":"FAIL"}`,c?.forecast?.ok?"ok":"err"),be(`open-meteo air       ${c?.air?.ok?"OK":"FAIL"}`,c?.air?.ok?"ok":"err"),be(`nws alerts           ${c?.alerts?.ok?"OK":"FAIL"}`,c?.alerts?.ok?"ok":"err"),be(`noaa swpc space wx   ${c?.space?.ok?"OK":"FAIL"}`,c?.space?.ok?"ok":"err"),be(`${n.hours.length} hourly steps \xB7 ${n.days.length} days \xB7 ${n.min15.length} 15-min steps`,"ok"),Qn(),be("console ready","ok"),setTimeout(()=>{de.boot.classList.add("done");let w=n.skyParams();w&&je.snap(w)},0),wn(),setInterval(()=>{document.hidden||n.refresh()},Zn),ta(s)}function hn(e,t,a){Object.defineProperty(He,e,{configurable:!0,enumerable:!0,get(){let s=t(document.getElementById(a));return Object.defineProperty(He,e,{value:s,configurable:!0,enumerable:!0,writable:!0}),s}})}function Qn(){gn=Do(de.scrub),He.deck=_o(document.getElementById("view-deck")),He.sky=Jo(document.getElementById("view-sky")),He.air=Xo(document.getElementById("view-air")),He.data=en(document.getElementById("view-data")),hn("radar",Ko,"view-radar"),hn("overhead",rn,"view-overhead");let e=()=>{let a=He[n.view];a?.update&&a.update()};n.on("data",()=>{e(),ao()}),n.on("cursor",()=>{e(),$t()}),n.on("climate",e),n.on("models",e),n.on("pollen",e),n.on("observed",e),n.on("radar",e),n.on("loc",ao),n.on("status",a=>{de.led.dataset.state=a==="ok"?"":a}),de.nav.addEventListener("click",a=>{let s=a.target.closest("button[data-view]");s&&bt(s.dataset.view)}),de.locBtn.addEventListener("click",bn),de.alertBtn.addEventListener("click",$n),de.briefBtn.addEventListener("click",()=>no(n,ct)),de.cfgBtn.addEventListener("click",kn),de.soundBtn.addEventListener("click",ro),document.addEventListener("visibilitychange",()=>{document.hidden||(Kt=0,n.syncToNow())}),window.addEventListener("resize",()=>{je.resize()}),document.addEventListener("keydown",oa),window.addEventListener("hashchange",()=>bt(location.hash.slice(1),{push:!1}));let t=location.hash.slice(1);io.includes(t)&&t!=="deck"?bt(t):document.documentElement.style.setProperty("--stage-dim","0.25"),ao(),e()}function ao(){let e=n.loc;e&&(de.locName.textContent=e.name,de.locSub.textContent=[e.admin1,e.country].filter(Boolean).join(" \xB7 ")||`${e.lat.toFixed(2)}, ${e.lon.toFixed(2)}`),de.clockZone.textContent=n.tz.split("/").pop().replace(/_/g," "),de.alertBtn.dataset.n=String(n.alerts.length),de.soundBtn.classList.toggle("on",Xe())}function bt(e,{push:t=!0}={}){if(!io.includes(e)||n.view===e)return;He[n.view]?.onHide?.(),n.view=e,mo();let a=He[e];t&&location.hash.slice(1)!==e&&history.replaceState(null,"","#"+e);for(let s of de.nav.querySelectorAll("button"))s.setAttribute("aria-selected",String(s.dataset.view===e));for(let s of document.querySelectorAll(".view"))s.classList.toggle("active",s.dataset.view===e);document.documentElement.style.setProperty("--stage-dim",e==="deck"?"0.25":"0.72"),a?.update&&a.update(),a?.onShow&&a.onShow()}var mn=performance.now(),so=0,Kt=0,Xn=20;function wn(e=performance.now()){requestAnimationFrame(wn);let t=Math.min(.1,(e-mn)/1e3);mn=e,Mo(t),document.hidden||(je.render(e,t),gn?.tick(t),Kt+=t,Kt>Xn&&(Kt=0,n.syncToNow()),so+=t,(n.playing||so>.25)&&(so=0,$t()),ea(e),un(n))}function $t(){let e=n.skyParams();e&&je.set(e)}var vn=0;function ea(e){e-vn<500||(vn=e,de.clockTime.textContent=n.fmt.hms(Date.now()))}function ct(e,t,a){yn.open(e,t,a)}function jt(){yn.close()}function bn(){ct(`
    <div class="hd">LOCATION<span class="rule"></span><span class="val">ENTER TO SELECT \xB7 ESC TO CLOSE</span></div>
    <input class="search-input" id="q" placeholder="search any city, or paste  lat, lon" autocomplete="off" spellcheck="false">
    <button class="tl-btn" id="useloc" style="margin-top:8px">\u25CE USE MY LOCATION</button>
    <div class="res-list" id="res"></div>
  `,e=>{let t=e.querySelector("#q"),a=e.querySelector("#res"),s=[],c=0,w=null,A=()=>{s=n.favorites.map(i=>({...i,fav:!0})),k("SAVED")},k=i=>{if(!s.length){a.innerHTML=`<h3>${i}</h3><div class="nodata">no results</div>`;return}a.innerHTML=`<h3>${i}</h3>`+s.map((d,S)=>`
        <div class="res-item ${S===c?"sel":""}" data-i="${S}">
          <div>
            <b>${lt(d.name)}</b><br>
            <span>${lt([d.admin1,d.country||d.country_code].filter(Boolean).join(" \xB7 "))}</span>
          </div>
          <span class="coord">${(+d.latitude).toFixed(2)}, ${(+d.longitude).toFixed(2)}</span>
          ${d.fav?`<button class="rm" data-rm="${S}" title="Remove">\xD7</button>`:""}
        </div>`).join("")},E=async i=>{let d=s[i];d&&(n.addFavorite(d),jt(),await n.setLocation(d),$t())};a.addEventListener("click",i=>{let d=i.target.closest("[data-rm]");if(d){i.stopPropagation(),n.removeFavorite(+d.dataset.rm),A();return}let S=i.target.closest("[data-i]");S&&E(+S.dataset.i)}),t.addEventListener("input",()=>{clearTimeout(w);let i=t.value.trim();if(!i){A();return}let d=i.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);if(d){let S=+d[1],u=+d[2];if(Math.abs(S)<=90&&Math.abs(u)<=180){s=[{name:`${S.toFixed(4)}, ${u.toFixed(4)}`,admin1:"coordinate",latitude:S,longitude:u}],c=0,k("COORDINATE");return}}w=setTimeout(async()=>{try{s=(await ve.geocode(i)).results||[],c=0,k("RESULTS")}catch{s=[],k("RESULTS")}},220)}),t.addEventListener("keydown",i=>{i.key==="ArrowDown"?(c=Math.min(s.length-1,c+1),k(a.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="ArrowUp"?(c=Math.max(0,c-1),k(a.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="Enter"&&(E(c),i.preventDefault())});let M=e.querySelector("#useloc");!navigator.geolocation||!window.isSecureContext?M.remove():M.addEventListener("click",()=>{M.textContent="\u25CE LOCATING\u2026",navigator.geolocation.getCurrentPosition(async i=>{let d=i.coords.latitude,S=i.coords.longitude,u=`${d.toFixed(2)}, ${S.toFixed(2)}`,r="",p="";try{let o=await ve.reverse(d,S);u=o.city||o.locality||o.principalSubdivision||u,r=o.principalSubdivision||"",p=o.countryCode||""}catch{}n.settings.geo="set",jt(),await n.setLocation({name:u,admin1:r,country_code:p,latitude:d,longitude:S}),$t()},i=>{M.textContent=i.code===i.PERMISSION_DENIED?"\u25CE LOCATION BLOCKED IN BROWSER":"\u25CE LOCATION UNAVAILABLE"},{timeout:8e3,maximumAge:30*6e4})}),A(),t.focus()})}function $n(){let e=n.alerts;if(!e.length){ct(`<div class="hd">ALERTS<span class="rule"></span></div>
      <div class="nodata">no active watches, warnings or advisories for this location</div>`);return}ct(`
    <div class="hd" style="--ac:var(--rd)">ACTIVE ALERTS<span class="rule"></span><span class="val">${e.length}</span></div>
    <div class="res-list">
      ${e.map(t=>`
        <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)">
          <b style="color:#f47171;font-size:.82rem;letter-spacing:.08em">${lt(t.event)}</b>
          <div style="font-family:var(--mono);font-size:max(.6rem,var(--fs-floor,0px));color:var(--faint);margin:3px 0 6px">
            ${lt(t.senderName||"")} \xB7 until ${n.fmt.weekday(t.expires)} ${n.fmt.hm(t.expires)}
          </div>
          <div style="font-size:max(.72rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5;white-space:pre-wrap">${lt((t.description||"").slice(0,900))}</div>
          ${t.instruction?`<div style="margin-top:7px;font-size:max(.7rem,var(--fs-floor,0px));color:var(--am);line-height:1.5">${lt(t.instruction.slice(0,400))}</div>`:""}
        </div>`).join("")}
    </div>
  `)}function kn(e){let t=ae.manual;ct(`
    <div class="hd">SETTINGS<span class="rule"></span><span class="val">ATMOS//NET v1.0.0</span></div>
    <div class="setrow">
      <label>Render quality<span class="hint">Auto adapts to power state and measured frame rate</span></label>
      <div class="seg" id="qseg">
        ${["auto","0","1","2","3"].map(a=>`<button data-q="${a}" class="${String(t)===a||t==null&&a==="auto"?"on":""}">${a}</button>`).join("")}
      </div>
    </div>
    <div class="setrow">
      <label>Ambient audio<span class="hint">Generative soundscape matched to live conditions</span></label>
      <div class="seg"><button id="sndT" class="${Xe()?"on":""}">${Xe()?"on":"off"}</button></div>
    </div>
    <div class="setrow">
      <label>Spoken briefing<span class="hint">Reads the briefing aloud when opened</span></label>
      <div class="seg"><button id="voiceT" class="${n.settings.voice?"on":""}">${n.settings.voice?"on":"off"}</button></div>
    </div>
    <h3>Keyboard</h3>
    <div class="keyhelp">
      ${[["1\u20135","switch view"],["Space","play / pause forecast"],["\u2190 \u2192","step 1 hour"],["Shift \u2190 \u2192","step 6 hours"],["N","return to now"],["/","search location"],["A","alerts"],["B","briefing"],["S","ambient audio"],["F","fullscreen"],[",","settings"],["Esc","close"]].map(([a,s])=>`<div><span>${s}</span><kbd>${a}</kbd></div>`).join("")}
    </div>
    <h3>Data sources</h3>
    <div style="font-size:max(.66rem,var(--fs-floor,0px));color:var(--dim);line-height:1.7">
      Open-Meteo (forecast \xB7 air quality \xB7 1994\u2013 archive \xB7 multi-model ensemble) \xB7
      NWS api.weather.gov (US alerts) \xB7 RainViewer (radar) \xB7
      NOAA SWPC (space weather) \xB7 pollen.com (US pollen) \xB7 Esri (map tiles)
    </div>
  `,a=>{a.querySelector("#qseg").addEventListener("click",s=>{let c=s.target.closest("[data-q]");c&&(Xt(c.dataset.q==="auto"?null:+c.dataset.q),a.querySelectorAll("[data-q]").forEach(w=>w.classList.toggle("on",w===c)))}),a.querySelector("#sndT").addEventListener("click",s=>{ro(),s.target.textContent=Xe()?"on":"off",s.target.classList.toggle("on",Xe())}),a.querySelector("#voiceT").addEventListener("click",s=>{n.settings.voice=!n.settings.voice,n.save(),s.target.textContent=n.settings.voice?"on":"off",s.target.classList.toggle("on",n.settings.voice)})},e?.currentTarget)}function ro(){let e=!Xe();cn(),dn(e),n.settings.sound=e,n.save(),de.soundBtn.classList.toggle("on",e)}function ta(e){e?.public&&(n.settings.geo||!navigator.geolocation||!window.isSecureContext||navigator.geolocation.getCurrentPosition(async t=>{let a=t.coords.latitude,s=t.coords.longitude,c=`${a.toFixed(2)}, ${s.toFixed(2)}`,w="",A="";try{let k=await ve.reverse(a,s);c=k.city||k.locality||k.principalSubdivision||c,w=k.principalSubdivision||"",A=k.countryCode||""}catch{}n.settings.geo="set",await n.setLocation({name:c,admin1:w,country_code:A,latitude:a,longitude:s}),$t()},t=>{t.code===t.PERMISSION_DENIED&&(n.settings.geo="denied",n.save())},{timeout:8e3,maximumAge:30*6e4,enableHighAccuracy:!1}))}function oa(e){if(e.defaultPrevented||e.isComposing)return;if(e.target.closest?.('input, textarea, select, button, a[href], summary, [contenteditable], [role="button"], [role="link"], [role="slider"], [role="textbox"], [role="combobox"]')){e.key==="Escape"&&jt();return}if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('[aria-modal="true"]'))return;let t=e.key;if(t==="Escape"){jt();return}if(t>="1"&&t<="6"){bt(io[+t-1]);return}switch(t.toLowerCase()){case" ":n.playing=!n.playing,n.playing&&n.view!=="radar"&&(n.following=!1),n.playing&&n.cursor>=n.span.hi-6e4&&n.setCursor(Date.now()),n.emit("play",n.playing),e.preventDefault();break;case"arrowleft":n.playing=!1,n.scrubTo(n.cursor-(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"arrowright":n.playing=!1,n.scrubTo(n.cursor+(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"n":n.toNow();break;case"/":bn(),e.preventDefault();break;case"a":$n();break;case"b":no(n,ct);break;case"s":ro();break;case",":kn();break;case"r":n.refresh();break;case"f":document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();break;default:break}}var lt=te;Jn().catch(e=>{console.error(e),be(`FATAL: ${e.message}`,"err")});window.ATMOS={store:n,sky:je,perf:ae,setView:bt,views:He};export{jt as closeModal,ct as openModal};
