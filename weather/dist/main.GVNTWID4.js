import{A as Ie,B as Te,C as qe,D as Q,E as $o,F as ue,G as Ae,H as Fe,I as Ce,J as Ge,K as Oe,L as ke,M as Je,N as ko,O as Lt,P as Be,Q as Dt,R as Mo,S as It,T as Pe,U as wt,V as ze,W as Ve,X as So,Y as To,Z as Ot,_ as Ao,a as ye,b as oe,c as K,d as J,e as ge,f as tt,g as Xt,h as Tt,i as eo,j as He,k as _e,l as At,m as ht,n as Et,o as Ct,p as Ue,q as pt,r as vo,s as a,t as Y,u as N,v as Ee,w as De,x as de,y as bo,z as $e}from"./chunk.4M74E7FC.js";import{a as xe,b as Pt}from"./chunk.4OCC54MU.js";import{a as mt,b as ot,c as Ne,d as yo,e as gt,f as vt,g as yt,h as wo}from"./chunk.ZRZBQBLH.js";var oo=new Set,se={tier:2,fps:60,onBattery:!1,batteryLevel:1,hidden:!1,reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,manual:null,onChange(e){return oo.add(e),()=>oo.delete(e)}},to=0,xt=0,Eo=0,st=0,it=0;function Co(e){to++,xt+=e;let t=performance.now();if(t-Eo<1e3)return;Eo=t,se.fps=xt>0?to/xt:60,to=0,xt=0,se.fps<40?(st++,it=0):se.fps>55?(it++,st=0):(st=0,it=0);let n=nt();n!==se.tier&&at(n)}function Ln(){return typeof matchMedia!="function"?!1:matchMedia("(pointer: coarse)").matches&&matchMedia("(max-width: 820px)").matches}function nt(){if(se.manual!=null)return se.manual;if(se.hidden)return 0;if(se.reducedMotion)return 1;if(Ln()){let t=1;return st>=3&&(t=Math.max(0,se.tier-1)),it>=6&&se.tier<2&&(t=se.tier+1),Math.max(0,Math.min(2,t))}let e=se.onBattery?2:3;return se.onBattery&&se.batteryLevel<.25&&(e=1),st>=3&&(e=Math.max(0,se.tier-1)),it>=6&&e>se.tier&&(e=se.tier+1),Math.max(0,Math.min(3,e))}function at(e){se.tier=e,document.documentElement.dataset.q=String(e),st=0,it=0;for(let t of oo)t(e)}function Lo(){document.addEventListener("visibilitychange",()=>{se.hidden=document.hidden,at(nt())}),matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{se.reducedMotion=e.matches,at(nt())}),navigator.getBattery&&navigator.getBattery().then(e=>{let t=()=>{se.onBattery=!e.charging,se.batteryLevel=e.level,at(nt())};e.addEventListener("chargingchange",t),e.addEventListener("levelchange",t),t()}).catch(()=>{}),at(nt())}function no(e){se.manual=e,at(nt())}var Dn=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,In=`#version 300 es
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
}`,Do={sunAlt:.4,sunAz:3,moonAlt:-.4,moonAz:1,moonPhase:.25,moonFrac:.5,viewAz:Math.PI,cloudLow:.2,cloudMid:.1,cloudHigh:.1,precip:0,snow:0,storm:0,fog:0,wind:6,windDir:4,kp:2,lat:33.6,haze:.15,cityGlow:.5},On=new Set(["snow","lat"]),Rt=class{constructor(t){this.canvas=t,this.gl=null,this.params={...Do},this.target={...Do},this.quality=2,this.running=!1,this.flash=0,this.nextBolt=1/0,this.scale=1,this.ok=!1,this.t0=performance.now()}init(){let t=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)return this.ok=!1,!1;this.gl=t;let n=Pn(t,Dn,In);if(!n)return this.ok=!1,!1;this.prog=n,t.useProgram(n);let s=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,s),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let c=t.getAttribLocation(n,"aPos");t.enableVertexAttribArray(c),t.vertexAttribPointer(c,2,t.FLOAT,!1,0,0),this.u={};for(let w of["uRes","uTime","uQuality","uSunAlt","uSunAz","uMoonAlt","uMoonAz","uMoonPhase","uMoonFrac","uViewAz","uCloudLow","uCloudMid","uCloudHigh","uPrecip","uSnow","uStorm","uFlash","uFog","uWind","uWindDir","uKp","uLat","uHaze","uCityGlow"])this.u[w]=t.getUniformLocation(n,w);return this.resize(),this.ok=!0,!0}set(t){Object.assign(this.target,t)}snap(t){Object.assign(this.target,t),Object.assign(this.params,t)}setQuality(t){this.quality=t,this.scale=t>=3?1:t===2?.85:t===1?.65:.5,this.resize()}resize(){let t=this.gl;if(!t)return;let n=Math.min(window.devicePixelRatio||1,this.quality>=3?2:1.5),s=Math.max(2,Math.floor(this.canvas.clientWidth*n*this.scale)),c=Math.max(2,Math.floor(this.canvas.clientHeight*n*this.scale));this.canvas.width===s&&this.canvas.height===c||(this.canvas.width=s,this.canvas.height=c,t.viewport(0,0,s,c))}render(t,n){if(!this.ok)return;let s=this.gl,c=this.params,w=this.target,C=1-Math.pow(.0016,n);for(let T in w){if(On.has(T)){c[T]=w[T];continue}if(T.endsWith("Az")||T==="windDir"){let k=w[T]-c[T];k=((k+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,c[T]+=k*C}else c[T]+=(w[T]-c[T])*C}c.storm>.12?(this.nextBolt===1/0&&(this.nextBolt=t+Math.random()*3e3),t>this.nextBolt&&(this.flash=.3+Math.random()*.45,this.nextBolt=t+900+Math.random()*9e3*(1.15-c.storm))):this.nextBolt=1/0,this.flash*=Math.pow(8e-5,n),this.flash<.002&&(this.flash=0);let $=this.u;s.uniform2f($.uRes,this.canvas.width,this.canvas.height),s.uniform1f($.uTime,(t-this.t0)/1e3),s.uniform1i($.uQuality,this.quality),s.uniform1f($.uSunAlt,c.sunAlt),s.uniform1f($.uSunAz,c.sunAz),s.uniform1f($.uMoonAlt,c.moonAlt),s.uniform1f($.uMoonAz,c.moonAz),s.uniform1f($.uMoonPhase,c.moonPhase),s.uniform1f($.uMoonFrac,c.moonFrac),s.uniform1f($.uViewAz,c.viewAz),s.uniform1f($.uCloudLow,c.cloudLow),s.uniform1f($.uCloudMid,c.cloudMid),s.uniform1f($.uCloudHigh,c.cloudHigh),s.uniform1f($.uPrecip,c.precip),s.uniform1f($.uSnow,c.snow),s.uniform1f($.uStorm,c.storm),s.uniform1f($.uFlash,this.flash),s.uniform1f($.uFog,c.fog),s.uniform1f($.uWind,c.wind),s.uniform1f($.uWindDir,c.windDir),s.uniform1f($.uKp,c.kp),s.uniform1f($.uLat,c.lat),s.uniform1f($.uHaze,c.haze),s.uniform1f($.uCityGlow,c.cityGlow),s.drawArrays(s.TRIANGLES,0,3)}};function Pn(e,t,n){let s=Io(e,e.VERTEX_SHADER,t),c=Io(e,e.FRAGMENT_SHADER,n);if(!s||!c)return null;let w=e.createProgram();return e.attachShader(w,s),e.attachShader(w,c),e.linkProgram(w),e.getProgramParameter(w,e.LINK_STATUS)?(e.deleteShader(s),e.deleteShader(c),w):(console.error("[sky] link failed:",e.getProgramInfoLog(w)),null)}function Io(e,t,n){let s=e.createShader(t);if(e.shaderSource(s,n),e.compileShader(s),!e.getShaderParameter(s,e.COMPILE_STATUS)){let c=e.getShaderInfoLog(s);console.error(`[sky] ${t===e.VERTEX_SHADER?"vertex":"fragment"} compile failed:
${c}`);let w=/ERROR:\s*\d+:(\d+)/.exec(c||"");if(w){let C=n.split(`
`),$=+w[1];console.error(C.slice(Math.max(0,$-3),$+2).map((T,k)=>`${Math.max(1,$-2)+k}| ${T}`).join(`
`))}return null}return s}var Qe=8,Oo=8,Po=16,xo=15;function Ro(e){e.innerHTML=`
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
  `;let t=e.querySelector(".tl-canvas"),n=e.querySelector(".tl-when b"),s=e.querySelector(".tl-when span"),c=e.querySelector(".tl-delta"),w=e.querySelector(".tl-play"),C=!1,$=ue(t,k,{inspect:!1});function T(r){let{lo:f,hi:o}=a.span,l=r-Qe-Oo;return{lo:f,hi:o,plotW:l,xOf:m=>Qe+(m-f)/(o-f||1)*l,tOf:m=>f+(m-Qe)/l*(o-f||1)}}function k(r,f,o,l){let m=a.hours;if(!m?.length)return;let y=T(f),v=a.fmt,b={x:Qe,y:Po,w:y.plotW,h:o-Po-xo};r.save(),r.fillStyle="rgba(8,13,22,.4)";for(let B=0;B<a.days.length;B++){let _=a.days[B],X=a.days[B+1];if(!_.sunset)continue;let ne=K(y.xOf(_.sunset),b.x,b.x+b.w),V=K(X?.sunrise?y.xOf(X.sunrise):b.x+b.w,b.x,b.x+b.w);V>ne&&r.fillRect(ne,b.y,V-ne,b.h)}r.restore();let M=m.map(B=>B.temp).filter(B=>B!=null),L=Math.min(...M),H=Math.max(...M),D=B=>b.y+b.h*.92-(B-L)/(H-L||1)*b.h*.72,g=m.filter(B=>B.temp!=null).map(B=>[y.xOf(B.t),D(B.temp)]);r.save(),r.beginPath(),Fe(r,g),r.lineTo(g.at(-1)[0],b.y+b.h),r.lineTo(g[0][0],b.y+b.h),r.closePath();let S=r.createLinearGradient(0,b.y,0,b.y+b.h);S.addColorStop(0,Q(Te(H),.34)),S.addColorStop(1,Q(Te(L),.03)),r.fillStyle=S,r.fill(),r.restore();let E=r.createLinearGradient(Qe,0,Qe+y.plotW,0);for(let B=0;B<=12;B++){let _=m[Math.round(B/12*(m.length-1))];E.addColorStop(B/12,Te(_?.temp))}r.save(),r.shadowColor=Q(Y[0],.8),r.shadowBlur=4,r.beginPath(),Fe(r,g),r.strokeStyle=E,r.lineWidth=1.8,r.lineJoin="round",r.stroke(),r.restore();let O=Math.max(...m.map(B=>B.precip??0),.02);r.save();for(let B of m){let _=B.precip??0;if(_<.001)continue;let X=y.xOf(B.t),ne=K(_/O,.08,1)*b.h*.3;r.fillStyle=Q(Y[4],.75),r.fillRect(X-.7,b.y+b.h-ne,1.6,ne)}r.restore(),r.save(),r.font=Ie,r.letterSpacing="1.2px",r.textBaseline="top";let p=a.days.length>1?Math.abs(y.xOf(a.days[1].t)-y.xOf(a.days[0].t)):b.w,I=34,R=Math.max(1,Math.ceil(I/Math.max(1,p))),W=0;for(let B of a.days){let _=y.xOf(B.t),X=W++%R===0;_<b.x||_>b.x+b.w||(r.strokeStyle=X?"rgba(255,255,255,.10)":"rgba(255,255,255,.05)",r.lineWidth=1,r.beginPath(),r.moveTo(Math.round(_)+.5,b.y),r.lineTo(Math.round(_)+.5,b.y+b.h),r.stroke(),!(!X||_+I>b.x+b.w)&&(r.fillStyle=de,r.textAlign="left",r.fillText(v.weekday(B.t).toUpperCase(),_+3,o-xo+3)))}r.restore();for(let B of a.alerts){let _=Date.parse(B.effective||B.onset||0),X=Date.parse(B.expires||B.ends||0);if(!_||!X)continue;let ne=K(y.xOf(_),b.x,b.x+b.w),V=K(y.xOf(X),b.x,b.x+b.w);V<=ne||(r.fillStyle=Q(N.crit,.55),r.fillRect(ne,b.y-4,V-ne,3))}let x=Date.now(),U=y.xOf(x);if(U>=b.x&&U<=b.x+b.w&&(r.save(),r.strokeStyle=Q(N.good,.85),r.lineWidth=1,r.setLineDash([2,3]),r.shadowColor=N.good,r.shadowBlur=4,r.beginPath(),r.moveTo(Math.round(U)+.5,b.y-4),r.lineTo(Math.round(U)+.5,b.y+b.h),r.stroke(),r.restore()),l&&!C&&l.x>b.x&&l.x<b.x+b.w){let B=y.tOf(l.x);r.save(),r.strokeStyle="rgba(255,255,255,.22)",r.lineWidth=1,r.beginPath(),r.moveTo(Math.round(l.x)+.5,b.y),r.lineTo(Math.round(l.x)+.5,b.y+b.h),r.stroke(),r.font=$e,r.fillStyle=De,r.textAlign=l.x>f-70?"right":"left",r.textBaseline="top",r.fillText(`${v.weekday(B)} ${v.hm(B)}`,l.x+(l.x>f-70?-5:5),2),r.restore()}let q=y.xOf(a.cursor);r.save(),r.strokeStyle=Y[1],r.lineWidth=1.5,r.shadowColor=Y[1],r.shadowBlur=7,r.beginPath(),r.moveTo(Math.round(q)+.5,b.y-6),r.lineTo(Math.round(q)+.5,b.y+b.h+3),r.stroke(),r.fillStyle=Y[1],r.beginPath(),r.moveTo(q,b.y-10),r.lineTo(q+5,b.y-16),r.lineTo(q-5,b.y-16),r.closePath(),r.fill(),r.restore()}let i=r=>{let f=t.getBoundingClientRect(),o=T(f.width);a.playing=!1,A(),a.scrubTo(o.tOf(K(r-f.left,Qe,f.width-Oo)))};t.addEventListener("pointerdown",r=>{C=!0,t.setPointerCapture(r.pointerId),i(r.clientX)}),t.addEventListener("pointermove",r=>{C&&i(r.clientX)});let u=r=>{if(C){C=!1;try{t.releasePointerCapture(r.pointerId)}catch{}}};t.addEventListener("pointerup",u),t.addEventListener("pointercancel",u),t.style.cursor="ew-resize",e.addEventListener("click",r=>{let f=r.target.closest("button");if(!f)return;if(f.dataset.rate){a.playRate=+f.dataset.rate,e.querySelectorAll("[data-rate]").forEach(l=>l.classList.toggle("on",+l.dataset.rate===a.playRate));return}let o=f.dataset.act;o==="now"?a.toNow():o==="back"?(a.playing=!1,a.scrubTo(a.cursor-36e5)):o==="fwd"?(a.playing=!1,a.scrubTo(a.cursor+36e5)):o==="play"&&(a.playing=!a.playing,a.playing&&a.view!=="radar"&&(a.following=!1),a.playing&&a.cursor>=a.span.hi-6e4&&a.setCursor(Date.now()),a.emit("play",a.playing)),A()});function A(){w.textContent=a.playing?"\u275A\u275A":"\u25B6",w.classList.toggle("on",a.playing),e.querySelector(".tl-now").classList.toggle("on",a.atNow)}function d(){let r=a.fmt,f=a.cursor;n.textContent=r.hm12(f),s.textContent=`${r.weekday(f)} ${r.monthDay(f)}`;let o=f-Date.now(),l=Math.round(Math.abs(o)/6e4);if(l<3)c.textContent="NOW",c.className="tl-delta now";else{let m=Math.floor(l/60),y=l%60,v=m>=24?`${Math.floor(m/24)}d ${m%24}h`:m?`${m}h ${y}m`:`${y}m`;c.textContent=o>0?`+${v}`:`\u2212${v}`,c.className="tl-delta "+(o>0?"fwd":"back")}A()}return a.on("cursor",()=>{d(),$.render()}),a.on("data",()=>{d(),$.render()}),a.on("play",A),e.querySelector('[data-rate="1"]').classList.add("on"),d(),{render:()=>$.render(),tick(r){if(!a.playing||a.view==="radar")return;let f=a.cursor+r*1e3*3600*a.playRate;f>=a.span.hi?(a.setCursor(a.span.hi),a.playing=!1,a.emit("play",!1),A()):a.setCursor(f)}}}function Ht(e,t,n,s,c){let{hours:w,days:C,span:$,cursor:T,now:k,tf:i,panels:u=["temp","pop"],showAxis:A=!0}=c;if(!w?.length)return;let d=4,r=30,f=14,o=A?30:4,l=t-d-r;if(l<30)return;let m=w.filter(p=>p.t>=$.lo-36e5&&p.t<=$.hi+36e5);if(m.length<2)return;let y=p=>d+(p-$.lo)/($.hi-$.lo)*l,v=p=>$.lo+(p-d)/l*($.hi-$.lo),b={temp:1,pop:.42,wind:.42,cloud:.3,pressure:.42,uv:.36,cape:.36},M=u.reduce((p,I)=>p+(b[I]||.4),0),L=u.length>2?16:9,H=n-f-o-(u.length-1)*L,D=f,g={};for(let p of u){let I=H*(b[p]||.4)/M;g[p]={x:d,y:D,w:l,h:I},D+=I+L}let S={x:d,y:f,w:l,h:n-f-o};if(ko(e,S,C||[],y),C?.length){e.save(),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=1,e.font=Ie,e.letterSpacing="1.2px",e.textBaseline="top";for(let p of C){let I=y(p.t);I<d-1||I>d+l||(e.beginPath(),e.moveTo(Math.round(I)+.5,f),e.lineTo(Math.round(I)+.5,f+S.h),e.stroke(),A&&(e.fillStyle=de,e.textAlign="left",e.fillText(i.weekday(p.t).toUpperCase(),I+3,n-o+17)))}e.restore()}let E=[];if(g.temp){let p=g.temp,I=m.map(V=>V.temp).filter(V=>V!=null),R=m.map(V=>V.feels).filter(V=>V!=null),W=I.concat(R),x=Math.min(...W)-2,U=Math.max(...W)+2,q=V=>p.y+p.h-(V-x)/(U-x)*p.h;if(Ce(e,p,ze(x,U,Be(p.h,3)).map(V=>({v:V,y:q(V)})),V=>`${Math.round(V)}\xB0`),R.length>1){e.save(),e.setLineDash([4,3]);let V=m.filter(fe=>fe.feels!=null).map(fe=>[y(fe.t),q(fe.feels)]);Ae(e,V,Q(Y[1],.75),{width:1.5,glow:6}),e.restore()}let B=m.filter(V=>V.temp!=null).map(V=>[y(V.t),q(V.temp)]);e.save(),e.beginPath(),Fe(e,B),e.lineTo(B.at(-1)[0],p.y+p.h),e.lineTo(B[0][0],p.y+p.h),e.closePath();let _=e.createLinearGradient(0,p.y,0,p.y+p.h);_.addColorStop(0,Q(Te(U),.3)),_.addColorStop(1,Q(Te(x),.02)),e.fillStyle=_,e.fill(),e.restore();let X=e.createLinearGradient(d,0,d+l,0);for(let V=0;V<=8;V++){let fe=m[Math.round(V/8*(m.length-1))];X.addColorStop(V/8,Te(fe?.temp))}e.save(),e.shadowColor=Q(Y[0],.9),e.shadowBlur=6,e.beginPath(),Fe(e,B),e.strokeStyle=X,e.lineWidth=2.2,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),e.save(),e.font=$e,e.textAlign="center",e.textBaseline="bottom";let ne=e.measureText("100\xB0").width+6;for(let V of C||[]){let fe=m.filter(j=>i.isoDate(j.t)===i.isoDate(V.t)&&j.temp!=null);if(fe.length<3)continue;let we=fe.reduce((j,ie)=>ie.temp>j.temp?ie:j),Se=fe.reduce((j,ie)=>ie.temp<j.temp?ie:j);for(let[j,ie,h]of[[we,-6,"bottom"],[Se,13,"top"]]){let P=y(j.t),G=e.measureText(`${Math.round(j.temp)}\xB0`).width;if(P-G/2<d+4||P+G/2>d+l-ne)continue;let F=q(j.temp)+ie,z=h==="top"?F+9>p.y+p.h:F-9<p.y;e.textBaseline=z?h==="top"?"bottom":"top":h,e.fillStyle=Te(j.temp),Oe(e,`${Math.round(j.temp)}\xB0`,P,z?q(j.temp)-ie:F)}}e.restore(),wt(e,p,p.y-11,"temperature \xB0F",[{label:"actual",color:Y[0]},{label:"feels like",short:"feels",color:Y[1],dash:!0}],{short:"temp \xB0F"}),E.push({key:"temp",box:p,yOf:q})}if(g.pop){let p=g.pop,I=_=>p.y+p.h-K(_,0,100)/100*p.h;Ce(e,p,[50,100].map(_=>({v:_,y:I(_)})),_=>`${_}%`);let R=m.map(_=>[y(_.t),I(_.pop??0)]);e.save(),e.beginPath(),Fe(e,R),e.lineTo(R.at(-1)[0],p.y+p.h),e.lineTo(R[0][0],p.y+p.h),e.closePath();let W=e.createLinearGradient(0,p.y,0,p.y+p.h);W.addColorStop(0,Q(Y[4],.55)),W.addColorStop(1,Q(Y[4],.04)),e.fillStyle=W,e.fill(),e.restore(),Ae(e,R,Y[4],{width:1.6,glow:7});let x="precip probability";e.save(),e.font=Ie,e.letterSpacing="1.4px";let U={l:p.x+2,t:p.y-11,r:p.x+2+e.measureText(x.toUpperCase()).width,b:p.y-2};e.restore(),e.save(),e.font=$e,e.textAlign="center",e.fillStyle=Y[0];let q=-999,B=e.measureText("100%").width+6;for(let _=1;_<m.length-1;_++){let X=m[_];if((X.precip??0)<.02||(X.precip??0)<=(m[_-1].precip??0)||(X.precip??0)<(m[_+1].precip??0))continue;let ne=y(X.t),V=`${X.precip.toFixed(2)}"`,fe=e.measureText(V),we=fe.width,Se=fe.actualBoundingBoxAscent+fe.actualBoundingBoxDescent;if(ne-q<46||ne-we/2<d+4||ne+we/2>d+l-B)continue;let j=I(X.pop??0),ie=!It({l:ne-we/2,t:j-4-Se,r:ne+we/2,b:j-4},U,4);!ie&&j+4+Se>p.y+p.h||(e.textBaseline=ie?"bottom":"top",Oe(e,V,ne,ie?j-4:j+4),q=ne)}e.restore(),ke(e,p.x+2,p.y-11,x),E.push({key:"pop",box:p,yOf:I})}if(g.wind){let p=g.wind,I=Math.max(...m.map(U=>U.gust??U.wind??0),10)*1.12,R=U=>p.y+p.h-K(U,0,I)/I*p.h;Ce(e,p,ze(0,I,Be(p.h,2)).map(U=>({v:U,y:R(U)})),U=>String(Math.round(U)));let W=m.map(U=>[y(U.t),R(U.gust??U.wind??0)]);e.save(),e.beginPath(),Fe(e,W),e.lineTo(W.at(-1)[0],p.y+p.h),e.lineTo(W[0][0],p.y+p.h),e.closePath(),e.fillStyle=Q(N.serious,.16),e.fill(),e.restore(),Ae(e,W,Q(N.serious,.85),{width:1.2,glow:5}),Ae(e,m.map(U=>[y(U.t),R(U.wind??0)]),Y[3],{width:1.8,glow:8}),e.save(),e.strokeStyle=Q(Y[3],.55),e.lineWidth=1;let x=Math.max(1,Math.round(m.length/(l/26)));for(let U=0;U<m.length;U+=x){let q=m[U];if(q.windDir==null)continue;let B=y(q.t),_=p.y+p.h-5,X=(q.windDir-90+180)*Math.PI/180;e.save(),e.translate(B,_),e.rotate(X),e.beginPath(),e.moveTo(-4,0),e.lineTo(4,0),e.moveTo(4,0),e.lineTo(1.5,-2),e.moveTo(4,0),e.lineTo(1.5,2),e.stroke(),e.restore()}e.restore(),wt(e,p,p.y-11,"wind mph",[{label:"sustained",short:"wind",color:Y[3]},{label:"gusts",color:N.serious}],{short:"wind"}),E.push({key:"wind",box:p,yOf:R})}if(g.cloud){let p=g.cloud,I=m.length,R=Math.max(1,l/I),W=[["cloudHigh",Q(Y[4],.55)],["cloudMid",Q(Y[0],.5)],["cloudLow",Q(Ee,.45)]];m.forEach((B,_)=>{let X=d+_*l/I,ne=p.y,V=p.h/3;W.forEach(([fe,we],Se)=>{let j=K((B[fe]??0)/100,0,1);e.fillStyle=we,e.fillRect(X,ne+(V-2)*(1-j),Math.max(1,R-.5),(V-2)*j),ne+=V})}),e.save(),e.font=Ie,e.textAlign="right",e.textBaseline="middle";let x=p.h/3,U=13;(x>=U?[0,1,2]:x*2>=U?[0,2]:[]).forEach(B=>{let _=["HIGH","MID","LOW"][B],X=p.y+x*(B+.5);e.fillStyle="rgba(22,33,47,.75)",e.fillRect(p.x+p.w-30,X-5,30,10),e.fillStyle=de,Oe(e,_,p.x+p.w-2,X)}),e.restore(),ke(e,p.x+2,p.y-11,"cloud decks %"),E.push({key:"cloud",box:p})}if(g.pressure){let p=g.pressure,I=m.map(q=>q.pressure).filter(q=>q!=null),R=Math.min(...I)-1,W=Math.max(...I)+1,x=q=>p.y+p.h-(q-R)/(W-R)*p.h,U=Be(p.h,2);Ce(e,p,ze(R,W,U).slice(0,U).map(q=>({v:q,y:x(q)})),q=>(q*.02953).toFixed(2)),Ae(e,m.filter(q=>q.pressure!=null).map(q=>[y(q.t),x(q.pressure)]),Y[3],{width:1.8,glow:8}),ke(e,p.x+2,p.y-11,"pressure inHg"),E.push({key:"pressure",box:p,yOf:x})}if(g.uv){let p=g.uv,I=x=>p.y+p.h-K(x,0,12)/12*p.h;Ce(e,p,[3,6,8,11].map(x=>({v:x,y:I(x)})),String);let R=m.length,W=Math.max(1,l/R-1);m.forEach((x,U)=>{let q=x.uv??0;if(q<=.05)return;let B=d+U*l/R,_=q<3?N.good:q<6?N.warn:q<8?N.serious:q<11?N.crit:Y[3];Ge(e,B,I(q),W,p.y+p.h,Q(_,.8))}),ke(e,p.x+2,p.y-11,"uv index"),E.push({key:"uv",box:p,yOf:I})}if(g.cape){let p=g.cape,I=Math.max(...m.map(x=>x.cape??0),500)*1.1,R=x=>p.y+p.h-K(x,0,I)/I*p.h;Ce(e,p,ze(0,I,Be(p.h,2)).map(x=>({v:x,y:R(x)})),x=>String(Math.round(x)));let W=m.map(x=>[y(x.t),R(x.cape??0)]);e.save(),e.beginPath(),Fe(e,W),e.lineTo(W.at(-1)[0],p.y+p.h),e.lineTo(W[0][0],p.y+p.h),e.closePath(),e.fillStyle=Q(N.crit,.18),e.fill(),e.restore(),Ae(e,W,N.crit,{width:1.6,glow:7}),ke(e,p.x+2,p.y-11,"CAPE J/kg"),E.push({key:"cape",box:p,yOf:R})}if(A){e.save(),e.font=$e,e.fillStyle=de,e.textAlign="center",e.textBaseline="top";let p=($.hi-$.lo)/36e5,I=p>200?24:p>96?12:p>40?6:p>16?3:1,R=e.measureText("00:00").width+8,W=e.measureText("00:00").width/2,x=l/Math.max(p,1),U=[1,3,6,12,24,48].filter(q=>q>=I).find(q=>q*x>=R)??48;for(let q of m){let B=i.hourOfDay(q.t);if(Math.abs(B-Math.round(B))>.01||Math.round(B)%U!==0)continue;let _=y(q.t);_-W<0||_>d+l-10||e.fillText(i.hm(q.t),_,n-o+4)}e.restore()}let O=u.map(p=>g[p]);if(k!=null&&k>=$.lo&&k<=$.hi&&O.forEach((p,I)=>Lt(e,y(k),p,Q(N.good,.9),I?null:"NOW",{dash:[3,3]})),T!=null&&Math.abs(T-(k??T))>9e4&&T>=$.lo&&T<=$.hi&&O.forEach(p=>Lt(e,y(T),p,Y[1],null)),s&&s.x>d&&s.x<d+l){let p=v(s.x),I=Ho(m,p);if(I){let R=y(I.t);e.save(),e.strokeStyle="rgba(255,255,255,.35)",e.setLineDash([2,3]),e.lineWidth=1,e.beginPath(),e.moveTo(Math.round(R)+.5,f),e.lineTo(Math.round(R)+.5,f+S.h),e.stroke(),e.restore();for(let x of E){if(!x.yOf)continue;let U=x.key==="temp"?I.temp:x.key==="pop"?I.pop??0:x.key==="wind"?I.wind:x.key==="pressure"?I.pressure:x.key==="uv"?I.uv:x.key==="cape"?I.cape:null;U!=null&&(e.save(),e.fillStyle=Ee,e.shadowColor=Y[0],e.shadowBlur=5,e.beginPath(),e.arc(R,x.yOf(U),3.5,0,Math.PI*2),e.fill(),e.restore())}let W=[`${i.weekday(I.t)} ${i.hm(I.t)}|`];g.temp&&(W.push(`TEMP|${J.temp(I.temp)}`),W.push(`FEELS|${J.temp(I.feels)}`)),g.pop&&(W.push(`RAIN CHANCE|${J.pct(I.pop)}`),(I.precip??0)>.001&&W.push(`AMOUNT|${J.inches(I.precip)}"`)),g.wind&&W.push(`WIND|${J.wind(I.wind)} ${ge(I.windDir)}`),g.pressure&&W.push(`PRESSURE|${J.pressure(I.pressure)}`),g.uv&&W.push(`UV|${I.uv?.toFixed(1)??"--"}`),g.cape&&W.push(`CAPE|${Math.round(I.cape??0)}`),W.push(`SKY|${Tt(Math.round(I.code??0)).label}`),Je(e,R,s.y,W,t,n,"#3fd0d8",{pin:s.coarse})}}return{xOf:y,tOf:v,boxes:g}}function Ho(e,t){let n=null,s=1/0;for(let c of e){let w=Math.abs(c.t-t);w<s&&(s=w,n=c)}return n}function No(e,t,n){e.save(),e.font=$e;let s=Math.max(0,...t.map(c=>e.measureText(n(c)).width));return e.restore(),s+8}function Fo(e,t,n,s,{rows:c,tf:w,now:C}){if(!c?.length)return;let $=4,T=34,k=16,i=20,u={x:$,y:k,w:t-$-T,h:n-k-i};if(u.w<30||u.h<20)return;let A=Math.min(...c.map(D=>D.min)),d=Math.max(...c.map(D=>D.max)),r=A-2,f=d+2,o=D=>u.y+u.h-(D-r)/(f-r)*u.h,l=ze(r,f,Be(u.h,4)),m=D=>`${Math.round(D)}\xB0`,y=u.w-No(e,l,m),v=D=>u.x+(D-c[0].t)/(c.at(-1).t-c[0].t)*y;Ce(e,u,l.map(D=>({v:D,y:o(D)})),m),e.save(),e.beginPath(),c.forEach((D,g)=>g?e.lineTo(v(D.t),o(D.max)):e.moveTo(v(D.t),o(D.max)));for(let D=c.length-1;D>=0;D--)e.lineTo(v(c[D].t),o(c[D].min));e.closePath();let b=e.createLinearGradient(u.x,0,u.x+u.w,0);b.addColorStop(0,Q(Y[0],.3)),b.addColorStop(1,Q(Y[0],.1)),e.fillStyle=b,e.fill(),e.strokeStyle=Q(Y[0],.35),e.lineWidth=1,e.stroke(),e.restore(),Ae(e,c.map(D=>[v(D.t),o(D.mean)]),Y[0],{width:2,glow:10}),e.save(),e.strokeStyle=bo,e.font=$e,e.fillStyle=de,e.textAlign="center",e.textBaseline="top";let M="",L=e.measureText("WED").width+8,H=-1e9;for(let D of c){let g=w.isoDate(D.t);if(g===M)continue;M=g;let S=v(D.t);e.beginPath(),e.moveTo(S+.5,u.y),e.lineTo(S+.5,u.y+u.h),e.stroke(),!(S<u.x+12||S>u.x+y-12||S-H<L)&&(e.fillText(w.weekday(D.t).toUpperCase(),S,n-i+5),H=S)}if(e.restore(),C>=c[0].t&&C<=c.at(-1).t&&Lt(e,v(C),u,Q(N.good,.9),"NOW",{dash:[3,3]}),wt(e,u,3,"model agreement \xB0F",[{label:"ensemble mean",short:"mean",color:Y[0]},{label:"model range",short:"range",color:Q(Y[0],.35)}],{short:"model spread \xB0F"}),s&&s.x>u.x&&s.x<u.x+y){let D=c[0].t+(s.x-u.x)/y*(c.at(-1).t-c[0].t),g=Ho(c,D);if(g){let S=v(g.t);e.save(),e.strokeStyle="rgba(255,255,255,.3)",e.setLineDash([2,3]),e.beginPath(),e.moveTo(S+.5,u.y),e.lineTo(S+.5,u.y+u.h),e.stroke(),e.restore();let E=g.spread<2?"HIGH":g.spread<5?"MODERATE":g.spread<9?"LOW":"VERY LOW";Je(e,S,s.y,[`${w.weekday(g.t)} ${w.hm(g.t)}|`,`MEAN|${J.tempP(g.mean)}`,`RANGE|${J.temp(g.min)}\u2013${J.temp(g.max)}`,`SPREAD|${g.spread.toFixed(1)}\xB0`,`CONFIDENCE|${E}`,g.precipAgree!=null?`MODELS WET|${Math.round(g.precipAgree*100)}%`:null].filter(Boolean),t,n,"#3fd0d8",{pin:s.coarse})}}}function Bo(e,t,n,s,{days:c,climate:w,tf:C,doyOf:$}){if(!c?.length||!w?.doy?.length)return;let T=4,k=34,i=16,u=20,A={x:T,y:i,w:t-T-k,h:n-i-u};if(A.w<40||A.h<30)return;let d=c.map(g=>{let S=w.doy[$(g.t)];return S?{...g,c:S}:null}).filter(Boolean);if(!d.length)return;let r=d.flatMap(g=>[g.c.recordHigh,g.c.recordLow,g.tmax,g.tmin]).filter(g=>g!=null),f=Math.min(...r)-3,o=Math.max(...r)+3,l=d.length,m=ze(f,o,Be(A.h,4)),y=g=>`${Math.round(g)}\xB0`,v=A.w-No(e,m,y),b=v/l,M=g=>A.x+b*(g+.5),L=g=>A.y+A.h-(g-f)/(o-f)*A.h;Ce(e,A,m.map(g=>({v:g,y:L(g)})),y),e.save(),e.beginPath(),d.forEach((g,S)=>S?e.lineTo(M(S),L(g.c.recordHigh)):e.moveTo(M(S),L(g.c.recordHigh)));for(let g=l-1;g>=0;g--)e.lineTo(M(g),L(d[g].c.recordLow));e.closePath(),e.fillStyle="rgba(255,255,255,.045)",e.fill(),e.restore(),e.save(),e.beginPath(),d.forEach((g,S)=>S?e.lineTo(M(S),L(g.c.normalHigh)):e.moveTo(M(S),L(g.c.normalHigh)));for(let g=l-1;g>=0;g--)e.lineTo(M(g),L(d[g].c.normalLow));e.closePath(),e.fillStyle="rgba(141,154,171,.20)",e.fill(),e.strokeStyle="rgba(141,154,171,.45)",e.setLineDash([3,3]),e.lineWidth=1,e.stroke(),e.restore();let H=Math.min(15,b*.42);d.forEach((g,S)=>{if(g.tmax==null||g.tmin==null)return;let E=(g.tmax-g.c.normalHigh+(g.tmin-(g.c.normalLow??g.c.normalHigh)))/2,O=K(Math.abs(E)/15,0,1),p=E>=0?qe("#8d9aab","#f2b45a",O):qe("#8d9aab","#7fb2f0",O),I=M(S)-H/2,R=L(g.tmax),W=L(g.tmin);e.save(),e.shadowColor=p,e.shadowBlur=5,e.fillStyle=p;let x=Math.min(4,H/2);e.beginPath(),e.moveTo(I,W-x),e.lineTo(I,R+x),e.quadraticCurveTo(I,R,I+x,R),e.lineTo(I+H-x,R),e.quadraticCurveTo(I+H,R,I+H,R+x),e.lineTo(I+H,W-x),e.quadraticCurveTo(I+H,W,I+H-x,W),e.lineTo(I+x,W),e.quadraticCurveTo(I,W,I,W-x),e.closePath(),e.fill(),e.restore(),g.tmax>=g.c.recordHigh&&(e.save(),e.fillStyle=N.crit,e.font=$e,e.textAlign="center",e.textBaseline="bottom",Oe(e,"REC",M(S),L(g.tmax)-4),e.restore())}),e.save(),e.font=$e,e.fillStyle=de,e.textAlign="center",e.textBaseline="top";let D=Dt(l,A.w,e.measureText("WED").width,{least:l>12?2:1});if(d.forEach((g,S)=>{S%D||Pe(e,C.weekday(g.t).toUpperCase(),M(S),n-u+5,0,t)}),e.restore(),wt(e,A,3,"forecast vs climate record \xB0F",[{label:"forecast",color:"#f2b45a"},{label:"normal",color:"rgba(141,154,171,.7)",dash:!0},{label:"record range",short:"record",color:"rgba(255,255,255,.2)"}],{short:"climate record \xB0F"}),s&&s.x>A.x&&s.x<A.x+v){let g=K(Math.floor((s.x-A.x)/b),0,l-1),S=d[g],E=S.tmax-S.c.normalHigh;Je(e,M(g),s.y,[`${C.weekday(S.t)} ${C.monthDay(S.t)}|`,`FORECAST|${J.temp(S.tmin)} \u2013 ${J.temp(S.tmax)}`,`NORMAL|${J.temp(S.c.normalLow)} \u2013 ${J.temp(S.c.normalHigh)}`,`HIGH vs NORMAL|${J.signed(E)}\xB0`,`RECORD HIGH|${J.temp(S.c.recordHigh)} (${S.c.recordHighYear})`,`RECORD LOW|${J.temp(S.c.recordLow)} (${S.c.recordLowYear})`],t,n,E>=0?"#f2b45a":"#7fb2f0",{pin:s.coarse})}}function zo(e,t,n,s,{rows:c,tf:w,now:C}){if(!c?.length)return;let $=4,T=22,k=14,i=18,u={x:$,y:k,w:t-$-T,h:n-k-i};if(u.w<30)return;let A=c.length,d=Math.max(5.6,Math.ceil(Math.max(...c.map(D=>D.kp))+.8)),r=D=>u.y+u.h-K(D,0,d)/d*u.h,f=[3,5,7].filter(D=>D<=d);e.save(),e.font=$e;let o=Math.max(20,u.w-(Math.max(...f.map(D=>e.measureText(String(D)).width))+8));e.restore();let l=o/A,m=Math.max(2,l-2);Ce(e,u,f.map(D=>({v:D,y:r(D)})),String),e.save(),e.strokeStyle=Q(N.serious,.5),e.setLineDash([4,3]),e.lineWidth=1,e.beginPath(),e.moveTo(u.x,r(5)),e.lineTo(u.x+u.w,r(5)),e.stroke(),e.restore(),c.forEach((D,g)=>{let S=D.kp<3?Y[0]:D.kp<5?N.good:D.kp<6?N.warn:D.kp<7?N.serious:N.crit,E=u.x+g*l;Ge(e,E,r(Math.min(D.kp,d)),m,u.y+u.h,Q(S,D.observed==="observed"?.9:.55))}),e.save(),e.font=Ie,e.textAlign="left",e.textBaseline="bottom";let y=e.measureText("STORM").width+4,v=D=>{for(let g=Math.max(0,Math.floor((D-u.x)/l));g<A&&u.x+g*l<D+y;g++)if(c[g].kp>5)return!1;return!0},b=null;for(let D=u.x+3;D+y<=u.x+o;D+=l)if(v(D)){b=D;break}b==null&&(b=u.x+3,e.fillStyle="rgba(22,33,47,.85)",e.fillRect(b-2,r(5)-14,y,12)),e.fillStyle=Q(N.serious,.8),Oe(e,"STORM",b,r(5)-2),e.restore(),e.save(),e.font=$e,e.fillStyle=de,e.textAlign="center",e.textBaseline="top";let M="",L=e.measureText("WED").width+8,H=-1e9;if(c.forEach((D,g)=>{let S=w.isoDate(D.t);if(S===M)return;M=S;let E=u.x+g*l+m/2;E<u.x+10||E>u.x+o-10||E-H<L||(e.fillText(w.weekday(D.t).toUpperCase(),E,n-i+4),H=E)}),e.restore(),ke(e,u.x+2,2,"planetary K index"),s&&s.x>u.x&&s.x<u.x+o){let D=K(Math.floor((s.x-u.x)/l),0,A-1),g=c[D];Je(e,u.x+D*l+m/2,s.y,[`${w.weekday(g.t)} ${w.hm(g.t)}|`,`Kp|${g.kp.toFixed(2)}`,`STATUS|${(g.observed||"predicted").toUpperCase()}`],t,n,Y[3],{pin:s.coarse})}}var Nt=(e,t,n)=>n>=6&&n<22;function le(e,t,n,s,c){return e==null?.5:e>=n&&e<=s?1:e<n?t>=n?1:K((e-t)/(n-t),0,1):c<=s?1:K((c-e)/(c-s),0,1)}var Ft={walk:{label:"WALK",icon:"\u{1F6B6}",color:"#3fd0d8",hours:Nt,score(e){return[["temperature",le(e.feels??e.temp,30,50,75,95),.3],["dry",1-K((e.pop??0)/100,0,1)*.9,.24],["wind",le(e.wind,-1,0,12,30),.12],["humidity",le(e.dew,-20,20,60,76),.1],["UV",le(e.uv,-1,0,5,11),.07],["air quality",le(e.air?.aqi,-1,0,50,160),.07],["daylight",e.isDay?1:.5,.1]]}},bike:{label:"BIKE",icon:"\u{1F6B2}",color:"#8fdc6a",hours:Nt,score(e){return[["temperature",le(e.feels??e.temp,25,58,78,98),.26],["dry",1-K((e.pop??0)/100,0,1),.22],["wind",le(e.gust??e.wind,-1,0,8,24),.24],["visibility",le(e.vis,0,8e3,1/0,1/0),.08],["UV",le(e.uv,-1,0,5,11),.05],["air quality",le(e.air?.aqi,-1,0,50,150),.05],["daylight",e.isDay?1:.35,.1]]}},grill:{label:"GRILL",icon:"\u{1F525}",color:"#f2b45a",hours:Nt,score(e){return[["dry",1-K((e.pop??0)/100,0,1)*1,.34],["temperature",le(e.temp,35,62,88,104),.24],["wind",le(e.wind,-1,0,10,22),.24],["daylight or dusk",e.isDay?1:.55,.1],["humidity",le(e.dew,-20,20,64,78),.08]]}},stargaze:{label:"STARGAZE",icon:"\u2726",color:"#b39dfa",hours:e=>!e.isDay,score(e,t){return[["darkness",e.isDay?0:1,.26],["clear sky",1-K((e.cloud??0)/100,0,1),.32],["no moon",1-K(t?.moonFraction??.5,0,1)*(t?.moonUp?1:.15),.18],["transparency",le(e.vis,0,2e4,1/0,1/0),.1],["low humidity",le(e.rh,-1,0,65,100),.08],["calm",le(e.wind,-1,0,8,28),.06]]}},photo:{label:"PHOTO",icon:"\u25CE",color:"#f07aa6",hours:(e,t)=>!!e.isDay||t?.sunAltDeg!=null&&t.sunAltDeg>-8,score(e,t){let n=t?.sunAltDeg==null?.4:Math.exp(-Math.pow((t.sunAltDeg-3)/7,2)),s=1-Math.abs((e.cloud??50)/100-.45)*1.6;return[["golden light",K(n,0,1),.4],["sky texture",K(s,0,1),.26],["dry",1-K((e.pop??0)/100,0,1)*.7,.18],["clarity",le(e.vis,0,15e3,1/0,1/0),.16]]}},swim:{label:"SWIM",icon:"\u{1F3CA}",color:"#7fb2f0",hours:(e,t,n)=>!!e.isDay&&n>=7&&n<20,score(e){let t=[95,96,99].includes(Number(e.code));return[["temperature",le(e.feels??e.temp,65,80,95,105),.34],["dry",1-K((e.pop??0)/100,0,1),.18],["no thunder",t?0:1,.1],["sunshine",le(e.cloud,-1,0,40,100),.12],["wind",le(e.wind,-1,0,10,25),.12],["UV",le(e.uv,-1,2,7,11),.08],["air quality",le(e.air?.aqi,-1,0,50,150),.06]]}},openWindows:{label:"OPEN UP",icon:"\u{1FA9F}",color:"#5cd6bc",hours:Nt,score(e){return[["comfortable air",le(e.temp,40,62,76,90),.34],["dry air",le(e.dew,-20,25,58,70),.24],["clean air",le(e.air?.aqi,-1,0,50,130),.22],["no rain",1-K((e.pop??0)/100,0,1),.12],["calm",le(e.wind,-1,0,14,34),.08]]}}},Bt=Object.keys(Ft),zt=e=>Ft[e];function Wt(e,t,n){let s=Ft[e];if(!s||!t)return null;let c=s.score(t,n),w=0;for(let[,T,k]of c)w+=K(T,0,1)*k;let C=null,$=0;for(let[T,k,i]of c){let u=(1-K(k,0,1))*i;u>$&&($=u,C=T)}return{score:Math.round(K(w,0,1)*100),limiter:$>.06?C:null,parts:c.map(([T,k,i])=>({name:T,value:K(k,0,1),weight:i}))}}function xn(e,t){let n=e.fmt?.hourOfDay?e.fmt.hourOfDay(t):NaN;return Number.isFinite(n)?n:new Date(t).getHours()}function Wo(e,t,n=36){let s=Ft[e];if(!s)return[];let c=Date.now(),w=c+n*36e5;return t.hours.filter(C=>C.t>=c-18e5&&C.t<=w).map(C=>{let $=Hn(t,C.t),T=s.hours?!!s.hours(C,$,xn(t,C.t)):!0;return{t:C.t,eligible:T,...Wt(e,{...C,air:Rn(t,C.t)},$)}})}function _o(e,t,{hours:n=36,at:s=90}={}){let w=Wo(e,t,n).filter(C=>C.eligible);return{great:w.filter(C=>C.score>=s).length,eligible:w.length}}function _t(e,t,{hours:n=36,limit:s=3,minScore:c=55}={}){let w=Wo(e,t,n);if(!w.length)return[];for(let k of w)k.eligible||(k.score=-1/0);let C=12,$=new Array(w.length).fill(!1),T=[];for(let k=0;k<s;k++){let i=-1;for(let o=0;o<w.length;o++)$[o]||w[o].score<c||(i<0||w[o].score>w[i].score)&&(i=o);if(i<0)break;let u=w[i].score,A=Math.max(c,u-C),d=i,r=i;for(;d-1>=0&&!$[d-1]&&w[d-1].score>=A;)d--;for(;r+1<w.length&&!$[r+1]&&w[r+1].score>=A;)r++;for(let o=d;o<=r;o++)$[o]=!0;let f=0;for(let o=d;o<=r;o++)f+=w[o].score;T.push({start:w[d].t,end:w[r].t+36e5,peakAt:w[i].t,peak:u,avg:Math.round(f/(r-d+1)),hours:r-d+1,limiter:w[i].limiter,parts:w[i].parts})}return T.sort((k,i)=>i.peak-k.peak||k.start-i.start)}function Rn(e,t){if(!e.air?.length)return null;let n=null,s=1/0;for(let c of e.air){let w=Math.abs(c.t-t);w<s&&(s=w,n=c)}return s<36e5*2?n:null}function Hn(e,t){let n=e.frame(t);return n?{sunAltDeg:n.sun.altDeg,moonFraction:n.moon.fraction,moonUp:n.moon.altDeg>0}:{}}function bt(e){let t=Date.now(),n=t+6*36e5,s=(e.min15?.length?e.min15:e.hours).filter(T=>T.t>=t-9e5&&T.t<=n);if(s.length<2)return null;let c=.002,w=(s[0].precip??0)>=c,C=null;for(let T of s)if((T.precip??0)>=c!==w){C=T;break}let $=s.reduce((T,k)=>(k.precip??0)>(T.precip??0)?k:T,s[0]);return{raining:w,changeAt:C?.t??null,minutes:C?Math.round((C.t-t)/6e4):null,peak:$.precip??0,peakAt:$.t,resolution:e.min15?.length?15:60,series:s.map(T=>({t:T.t,p:T.precip??0}))}}function Uo(e,t){return e?e.raining?e.minutes!=null?`Rain now \u2014 easing in about ${e.minutes} min`:"Rain now \u2014 no let-up in the next 6 hours":e.minutes!=null&&e.minutes<=240?`${e.peak>.08?"Heavy rain":e.peak>.02?"Rain":"Light rain"} starting in ${e.minutes} min (${t.hm(e.changeAt)})`:null:null}var Ut=e=>e<0?0:e>1?1:e,ve=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function qo(e,t,n={},s={}){if(!t)return null;let c=ve(t.temperature_2m),w=String(n.temperature_2m||"").includes("F"),C=ve(t.wind_speed_10m),$=/mp\/?h|mph/i.test(String(n.wind_speed_10m||"")),T=ve(t.precipitation),k=/inch/i.test(String(n.precipitation||""));return{name:e,tempRaw:c,tempC:c===null?null:w?(c-32)/1.8:c,windKmh:C===null?null:$?C*1.609344:C,precipMm:T===null?null:k?T*25.4:T,cloudPct:ve(t.cloud_cover),night:t.is_day===0,...s}}function $t(e){let t=ve(e?.tempC);if(t===null)return null;let n=Ut(1-Math.abs(t-21)/18),s=Ut(1-(ve(e?.precipMm)??0)/2),c=Ut(1-(ve(e?.cloudPct)??0)/100*.6),w=Ut(1-Math.max(0,(ve(e?.windKmh)??0)-20)/40);return Math.round(100*(.4*n+.3*s+.2*c+.1*w))}function qt(e){let t=ve(e?.precipMm)??0,n=ve(e?.cloudPct),s=ve(e?.windKmh)??0;return t>=.5?"raining":t>0?"drizzling":s>=20+40/2?"blowing hard":n===null?null:n<=15?"clear":n<=45?"some cloud":n<=80?"cloudy":"overcast"}function Nn(e,t){let n=$t(e),s=$t(t);if(s===null)return null;let c=ve(t.tempC)!==null&&ve(e?.tempC)!==null?Math.round(t.tempC-e.tempC):null,w=ve(t.tempRaw)!==null&&ve(e?.tempRaw)!==null?Math.round(t.tempRaw-e.tempRaw):null;return{name:t.name,score:s,deltaScore:n===null?null:s-n,deltaC:c,deltaShown:w===null?c:w,better:n!==null&&s>n,headline:qt(t),tempC:ve(t.tempC),localHour:ve(t.localHour),night:t.night===!0}}function Go(e,t){let n=(Array.isArray(t)?t:[]).map(s=>Nn(e,s)).filter(Boolean);return n.sort((s,c)=>c.score-s.score||(c.deltaC??0)-(s.deltaC??0)||String(s.name).localeCompare(String(c.name))),n}function ao(e){if(!e)return"";let t=[],n=e.deltaShown??e.deltaC;return n!==null&&n!==0?t.push(`${Math.abs(n)}\xB0 ${n>0?"warmer":"colder"}`):n===0&&t.push("same temperature"),e.headline&&t.push(e.headline),e.night&&e.localHour!==null&&t.push(`${e.localHour}:00 there`),t.join(", ")}function Vo(e,t){if(!t.length)return"Nowhere to compare against right now.";let n=t.filter(w=>w.better);if(!n.length)return`Nowhere on the list beats ${e} right now.`;let s=n[0],c=n.length-1;return`${s.name} is better than ${e} right now \u2014 ${ao(s)}.`+(c>0?` So ${c===1?"is one other":`are ${c} others`}.`:"")}var Fn="../countdown/stats.json",Ko=[{place:"San Francisco, California",lat:37.7749,lon:-122.4194},{place:"Vancouver, Canada",lat:49.2497,lon:-123.1193},{place:"Grants Pass, Oregon",lat:42.4393,lon:-123.3307}],Bn=600*1e3;function jo(e){e.className="panel elsewhere",e.innerHTML=`
    <div class="hd">ELSEWHERE<span class="rule"></span><span class="val" id="ew-count">\u2014</span></div>
    <div class="body">
      <div class="ew-list" id="ew-list"><div class="ew-empty">Looking\u2026</div></div>
      <p class="ew-say" id="ew-say"></p>
    </div>`;let t=A=>e.querySelector(`#${A}`),n=null,s=0,c=[],w="",C=!1;async function $(){if(n)return n;try{let A=await(await fetch(new URL(Fn,location.href),{cache:"no-cache"})).json(),d=Array.isArray(A?.trips)?A.trips:[],r=new Date,f=`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`,o=m=>typeof m.date!="string"||(m.date.length===7?`${m.date}-01`:m.date)<=f,l=new Set;n=d.filter(m=>m&&typeof m.lat=="number"&&typeof m.lon=="number"&&o(m)&&typeof m.place=="string"&&!l.has(m.place)&&l.add(m.place)),n.length||(console.warn("ELSEWHERE: trip list had no usable coordinates; using the fallback"),n=Ko)}catch(A){console.warn("ELSEWHERE: could not read the trip list, using the fallback \u2014",A.message),n=Ko}return n}async function T(A){try{let r=(await ye.bundle(A.lat,A.lon))?.forecast?.data;if(!r?.current)return null;let f=Number(String(r.current.time||"").slice(11,13));return qo(A.place,r.current,r.current_units,{localHour:Number.isFinite(f)?f:null})}catch{return null}}async function k(){let A=a.loc;if(!A||C)return;let d=`${A.lat?.toFixed(2)},${A.lon?.toFixed(2)}`;if(!(d===w&&Date.now()-s<Bn)){C=!0;try{let r=await $(),f=await T({place:A.name||"here",lat:A.lat,lon:A.lon});if(!f)return;let o=(await Promise.all(r.map(T))).filter(Boolean);c=Go(f,o),w=d,s=Date.now(),i(f),u(f)}finally{C=!1}}}function i(A){let d=$t(A),r=c.filter(l=>l.better);if(t("ew-count").textContent=c.length?r.length?`${r.length} better`:"none better":"\u2014",!c.length){t("ew-list").innerHTML='<div class="ew-empty">No places to compare.</div>',t("ew-say").textContent="";return}let f=l=>`
      <div class="ew-row${l.better?" is-better":""}">
        <span class="ew-name">${oe(l.name)}</span>
        <span class="ew-what">${oe(ao(l))}</span>
      </div>`,o=`
      <div class="ew-here">
        <span class="ew-name">${oe(A.name)}</span>
        <span class="ew-what">here \xB7 ${oe(qt(A)||"")}${Number.isFinite(d)?` \xB7 ${d}/100`:""}</span>
      </div>`;t("ew-list").innerHTML=r.map(f).join("")+o+c.filter(l=>!l.better).map(f).join(""),t("ew-say").textContent=Vo(A.name,c)}async function u(A){try{let d={here:A.name,hereSky:qt(A),hereScore:$t(A),rows:c.map(o=>({name:o.name,delta:o.deltaShown??o.deltaC,sky:o.headline,better:o.better,night:o.night}))},r=btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),f=await ye.elsewhere(r);f?.text&&w&&(t("ew-say").textContent=f.text)}catch{}}return{update(){k()},onHide(){}}}function Yo(e){e.className="view deck active",e.innerHTML=`
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
  `;let t=o=>e.querySelector("#"+o),n=jo(t("d-elsewhere")),s=ue(t("d-meteo"),(o,l,m,y)=>{let v=Date.now();Ht(o,l,m,y,{hours:a.hours,days:a.days,tf:a.fmt,span:{lo:a.cursor-12*36e5,hi:a.cursor+36*36e5},cursor:a.cursor,now:v,panels:["temp","pop","wind"]})},{onPick:({x:o,w:l})=>{let m=a.cursor-432e5,y=a.cursor+36*36e5,v=l-34;a.playing=!1,a.scrubTo(m+(o-4)/v*(y-m))}}),c=ue(t("d-spark"),(o,l,m)=>{let y=a.hours.filter(b=>b.t>=a.cursor-36e5&&b.t<=a.cursor+864e5);if(y.length<2)return;let v=So(o,{x:0,y:4,w:l,h:m-14},y.map(b=>b.temp),{color:Y[0],glow:9});o.save(),o.font="500 11.5px 'JetBrains Mono', monospace",o.fillStyle=de,o.textAlign="center",o.textBaseline="bottom";for(let b=0;b<y.length;b+=6)Pe(o,a.fmt.hour(y[b].t).replace(/\s/g,""),b/(y.length-1)*l,m,0,l);o.restore(),v?.length&&(o.save(),o.fillStyle=Ee,o.shadowColor=Y[0],o.shadowBlur=5,o.beginPath(),o.arc(v[1]?.[0]??v[0][0],v[1]?.[1]??v[0][1],3,0,Math.PI*2),o.fill(),o.restore())}),w=ue(t("d-moondisc"),(o,l,m)=>{let y=a.frame();y&&Ot(o,l/2,m/2,Math.max(10,Math.min(l,m)/2-3),y.moon.phase,y.moon.fraction)}),C=ue(t("d-nc"),(o,l,m)=>{let y=bt(a);if(!y?.series?.length)return;let v=Math.max(...y.series.map(L=>L.p),.02),b=y.series.length,M=Math.max(1,l/b-.6);y.series.forEach((L,H)=>{let D=H*l/b,g=L.p>0?Math.max(1.5,L.p/v*m):0;g&&Ge(o,D,m-g,M,m,Q(L.p>.08?N.crit:L.p>.02?Y[0]:Y[4],.9),2)}),o.save(),o.strokeStyle="rgba(255,255,255,.10)",o.beginPath(),o.moveTo(0,m-.5),o.lineTo(l,m-.5),o.stroke(),o.restore()}),$=[["g-wind",(o,l,m)=>{let y=a.frame(),v=Math.min(l,m)/2-16;To(o,l/2,m/2-4,Math.max(14,v),{dir:y?.windDir,speed:y?.wind,gust:y?.gust,color:Y[3]})}],["g-hum",(o,l,m)=>{let y=a.frame(),v=Math.min(l,m)/2-18;Ve(o,l/2,m/2-6,Math.max(14,v),{value:y?.rh,min:0,max:100,color:Y[4],label:"humidity",unit:"%",sub:y?Ue(y.dew).name:""})}],["g-pres",(o,l,m)=>{let y=a.frame(),v=Math.min(l,m)/2-18,b=y?.pressure?y.pressure*.029529983:null;Ve(o,l/2,m/2-6,Math.max(14,v),{value:b,min:28.5,max:31,color:Y[3],label:"pressure",unit:"inHg",decimals:2,sub:T()})}],["g-uv",(o,l,m)=>{let y=a.frame(),v=Math.min(l,m)/2-18;Ve(o,l/2,m/2-6,Math.max(14,v),{value:y?.uv,min:0,max:12,color:_e(y?.uv).color,label:"uv index",unit:"index",decimals:1,sub:_e(y?.uv).name,bands:[{from:0,to:3,color:N.good},{from:3,to:6,color:N.warn},{from:6,to:8,color:N.serious},{from:8,to:11,color:N.crit},{from:11,to:12,color:Y[3]}]})}],["g-aqi",(o,l,m)=>{let v=a.frame()?.air?.aqi??a.airNow?.aqi,b=He(v),M=Math.min(l,m)/2-18;Ve(o,l/2,m/2-6,Math.max(14,M),{value:v,min:0,max:200,color:b.color,label:"air quality",unit:"US AQI",sub:b.name.length>12?"SENSITIVE":b.name,bands:[{from:0,to:50,color:N.good},{from:50,to:100,color:N.warn},{from:100,to:150,color:N.serious},{from:150,to:200,color:N.crit}]})}],["g-vis",(o,l,m)=>{let y=a.frame(),v=y?.vis!=null?y.vis/1609.344:null,b=Math.min(l,m)/2-18;Ve(o,l/2,m/2-6,Math.max(14,b),{value:v==null?null:Math.min(v,10),min:0,max:10,color:Y[0],label:"visibility",unit:"miles",decimals:1,sub:v==null?"":v>=9?"CLEAR":v>=3?"HAZY":v>=1?"POOR":"FOG"})}]].map(([o,l])=>ue(t(o),l));function T(){let o=a.cursor,l=a.hours.find(v=>v.t>=o-3*36e5),m=a.hours.find(v=>v.t>=o);if(!l?.pressure||!m?.pressure)return"";let y=(m.pressure-l.pressure)*.029529983;return Math.abs(y)<.02?"STEADY":y>0?`RISING ${y.toFixed(2)}`:`FALLING ${Math.abs(y).toFixed(2)}`}function k(){let o=a.frame();if(!o)return;let l=a.fmt;t("d-temp").innerHTML=`${o.temp==null?"--":Math.round(o.temp)}<sup>\xB0F</sup>`,t("d-cond").textContent=o.wx.label,t("d-glyph").textContent=eo(Math.round(o.code??0),o.isDay>.5),t("d-feels").textContent=J.temp(o.feels),t("d-dew").textContent=J.temp(o.dew),t("d-obs").textContent=a.atNow?`LIVE \xB7 ${Xt(a.lastFetch)}`:`PROJECTED \xB7 ${l.hm(a.cursor)}`;let m=a.observed,y=t("d-obsline");if(a.atNow&&m?.tempF!=null){let x=o.temp!=null?o.temp-m.tempF:null;y.innerHTML=`observed <b>${Math.round(m.tempF)}\xB0</b><span> \xB7 ${oe(m.name||m.station)} ${m.distanceMi} mi \xB7 ${Xt(Date.parse(m.time))}</span>`+(x!=null&&Math.abs(x)>=1.5?`<em> \xB7 model runs ${J.signed(x,0)}\xB0</em>`:""),y.style.display=""}else y.style.display="none";let v=o.day;t("d-hi").textContent=J.temp(v?.tmax),t("d-lo").textContent=J.temp(v?.tmin);let b=t("d-anom"),M=a.climate?.doy?.[f(a.cursor)];if(M&&v?.tmax!=null){let x=v.tmax-M.normalHigh;b.textContent=`${J.signed(x,1)}\xB0`,b.style.color=Math.abs(x)<2?De:x>0?"#f2b45a":"#7fb2f0"}else b.textContent="--",b.style.color="";let L=a.sunTimesFor();t("d-sunrise").textContent=l.hm(L.sunrise),t("d-sunset").textContent=l.hm(L.sunset),t("d-daylight").textContent=v?.daylight?tt(v.daylight):"--";let H=a.alerts,D=t("d-alertPanel");D.style.display=H.length?"":"none",t("d-alertN").textContent=String(H.length),t("d-alerts").innerHTML=H.slice(0,4).map(x=>`
      <div class="alert-item" style="--ac:${pt(x.event,x.severity)}">
        <b>${oe(x.event||"Alert")}</b>
        <span>until ${l.weekday(x.expires||x.ends)} ${l.hm(x.expires||x.ends)}</span>
      </div>`).join("");let g=bt(a),S=Uo(g,l),E=t("d-ncline");if(S)E.textContent=S,E.className="nowcast-line wet";else{let x=a.hours.find(U=>U.t>Date.now()&&(U.pop??0)>=40);E.textContent=x?`Dry for 6+ hours. Next real chance ${l.weekday(x.t)} ${l.hm(x.t)} (${Math.round(x.pop)}%).`:"Dry. No meaningful precipitation in the forecast window.",E.className="nowcast-line"}t("d-ncres").textContent=g?`${g.resolution}-MIN`:"\u2014";let O=o.moon,p=a.moonTimesFor();t("d-moonname").textContent=`${Math.round(O.fraction*100)}% LIT`,t("d-sunmoon").innerHTML=`
      <dl style="margin:0">
        ${d("Sun altitude",`${o.sun.altDeg.toFixed(1)}\xB0 ${ge(o.sun.compass)}`)}
        ${d("Golden hour",`${l.hm(L.goldenHour)} \u2013 ${l.hm(L.sunset)}`)}
        ${d("Blue hour",`${l.hm(L.sunset)} \u2013 ${l.hm(L.dusk)}`)}
        ${d("Astro dark",isNaN(+L.night)?"none tonight":l.hm(L.night))}
        ${d("Moon",`${r(O.phase)}`)}
        ${d("Moon alt",`${O.altDeg.toFixed(1)}\xB0 ${ge(O.compass)}`)}
        ${d("Moonrise",p.rise?l.hm(p.rise):"\u2014")}
        ${d("Moonset",p.set?l.hm(p.set):"\u2014")}
      </dl>`;let I=Ct(o.wind);t("n-wind").textContent=`${I.name} \xB7 from ${ge(o.windDir)}`,t("n-hum").textContent=Ue(o.dew).note,t("n-pres").textContent=o.pressure?`${Math.round(o.pressure)} hPa`:"";let R=At(o.uv,a.settings.skinType);t("n-uv").textContent=R==null?"no burn risk":R>180?"burn risk negligible":`burn in ~${R} min`;let W=o.air?.aqi??a.airNow?.aqi;t("n-aqi").textContent=o.air?.pm25!=null?`PM2.5 ${o.air.pm25.toFixed(1)} \xB5g/m\xB3`:W!=null?"":"no data",t("n-vis").textContent=o.vis!=null?`${(o.vis/1609.344).toFixed(1)} mi`:"",t("d-instnote").textContent=a.atNow?"LIVE":l.hm(a.cursor),u(),A(),w.render();for(let x of $)x.render();s.render(),c.render(),C.render()}let i=null;function u(){let o=a.fmt,l=v=>`${o.weekday(v)} ${o.hour(v)}`,m=(v,b)=>o.isoDate(v)===o.isoDate(b)?`${o.weekday(v)} ${o.hour(v)}\u2013${o.hour(b)}`:`${l(v)} \u2013 ${l(b)}`,y=Bt.map(v=>{let b=zt(v),M=_t(v,a,{hours:36,limit:1,minScore:50})[0],L=_o(v,a,{hours:36,at:90});return{k:v,meta:b,w:M,g:L}}).sort((v,b)=>b.g.great-v.g.great||(b.w?.peak??0)-(v.w?.peak??0));t("d-act").innerHTML=y.map(({k:v,meta:b,w:M,g:L})=>{let H=L.great,D=L.eligible?H/L.eligible:0,g=H>0?N.good:(M?.peak??0)>=60?N.warn:N.serious,S=M?`<b class="act-best">Best ${l(M.peakAt)}</b><span class="act-good">Good ${m(M.start,M.end)}</span>`+(H===0?`<span class="act-note">Best hour scores ${M.peak}/100</span>`:"")+(M.limiter?`<span class="act-note">Held back by ${M.limiter}</span>`:""):'<span class="act-note">No good time in the next 36 hours</span>',E=i===v&&M,O=M?M.parts.map(p=>{let I=Math.round((1-p.value)*p.weight*100);return`<span class="act-factor"><span class="act-fname">${p.name}</span><span class="meter act-fbar" style="--ac:${I===0?N.good:p.value>=.6?N.warn:N.serious}"><i style="width:${Math.round(p.value*100)}%"></i></span><span class="act-fpts">${I?"\u2212"+I:"full marks"}</span></span>`}).join(""):"";return`
        <button type="button" class="act-row" data-act="${v}" aria-expanded="${E?"true":"false"}"
                aria-controls="act-why-${v}"${M?"":" disabled"}>
          <span class="act-icon" style="color:${b.color}">${b.icon}</span>
          <span class="act-text">
            <span class="act-name">${b.label}</span>
            <span class="act-when">${S}</span>
            <span class="meter act-bar" style="--ac:${g}"><i style="width:${Math.round(D*100)}%"></i></span>
          </span>
          <span class="act-score" style="color:${g}">${H}<small class="act-unit">great hours</small></span>
        </button>
        <div class="act-why" id="act-why-${v}"${E?"":" hidden"}>
          <span class="act-whyhd">Why the best hour (${M?l(M.peakAt):""}) scores ${M?.peak??0}</span>${O}
        </div>`}).join("")}t("d-act").addEventListener("click",o=>{let l=o.target.closest(".act-row");!l||l.disabled||(i=i===l.dataset.act?null:l.dataset.act,u(),t("d-act").querySelector(`.act-row[data-act="${l.dataset.act}"]`)?.focus())}),t("d-act").addEventListener("keydown",o=>{if(o.key!=="Escape"||!i)return;let l=i;i=null,u(),t("d-act").querySelector(`.act-row[data-act="${l}"]`)?.focus()});function A(){let o=a.fmt,l=o.isoDate(Date.now()),m=a.days.filter(L=>L.tmax!=null&&o.isoDate(L.t)>=l);if(!m.length)return;let y=Math.min(...m.map(L=>L.tmin)),v=Math.max(...m.map(L=>L.tmax)),b=o.isoDate(Date.now()),M=o.isoDate(a.cursor);t("d-tenday").innerHTML=m.map(L=>{let H=o.isoDate(L.t),D=(v-L.tmax)/(v-y||1)*100,g=(L.tmin-y)/(v-y||1)*100,S=`linear-gradient(to top, ${Te(L.tmin)}, ${Te(L.tmax)})`;return`
        <div class="tenday-col ${H===b?"today":""} ${H===M?"cursor":""}" data-t="${L.t}">
          <div class="td-day">${H===b?"TODAY":o.weekday(L.t)}</div>
          <div class="td-date">${o.monthDay(L.t)}</div>
          <div class="td-glyph" title="${Tt(Math.round(L.code)).long}">${eo(Math.round(L.code),!0)}</div>
          <div class="td-hi">${Math.round(L.tmax)}\xB0</div>
          <div class="td-bar"><i style="top:${D}%;bottom:${g}%;background:${S};box-shadow:0 0 8px ${Te(L.tmax)}66"></i></div>
          <div class="td-lo">${Math.round(L.tmin)}\xB0</div>
          <div class="td-pop">${(L.pop??0)>=10?`${Math.round(L.pop)}%`:""}</div>
        </div>`}).join(""),t("d-tdnote").textContent=`${m.length} DAYS AHEAD`,t("d-tenday").querySelectorAll(".tenday-col").forEach(L=>{L.addEventListener("click",()=>{a.playing=!1,a.scrubTo(+L.dataset.t+13*36e5)})})}let d=(o,l)=>`<div class="kv"><dt>${o}</dt><dd>${l}</dd></div>`,r=o=>["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"][Math.round((o%1+1)%1*8)%8],f=o=>{let l=a.fmt.isoDate(o),[,m,y]=l.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][m-1]+y-1};return{update(){k(),n.update()},onHide(){n.onHide()}}}var lt="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas",Vt="grayscale(1) brightness(1.18) contrast(1.05) sepia(.6) hue-rotate(170deg) saturate(1.3)",Kt="grayscale(1) brightness(1.9) contrast(1.1) sepia(.4) hue-rotate(170deg) saturate(.8)";var pe={lonToWorld:(e,t)=>(e+180)/360*Math.pow(2,t)*256,latToWorld:(e,t)=>{let n=Math.sin(Math.max(-85.05,Math.min(85.05,e))*Math.PI/180);return(.5-Math.log((1+n)/(1-n))/(4*Math.PI))*Math.pow(2,t)*256},worldToLon:(e,t)=>e/(Math.pow(2,t)*256)*360-180,worldToLat:(e,t)=>{let n=Math.PI-2*Math.PI*e/(Math.pow(2,t)*256);return 180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)))}},Ke=new Map,Gt=0,zn=[1500,4e3];function Jo(e,t,n){let s=new Image;t.img=s,t.state="loading",Gt++,s.crossOrigin="anonymous",s.onload=()=>{t.state="ok",Gt--,n?.()},s.onerror=()=>{Gt--;let c=zn[t.tries++];if(c===void 0){t.state="err";return}setTimeout(()=>{Ke.get(e)===t&&Jo(e,t,n)},c)},s.src=e}function Zo(e,t){let n=Ke.get(e);if(n)return n.state==="ok"?n.img:null;if(Gt>24)return null;let s={img:null,state:"loading",tries:0};if(Ke.set(e,s),Jo(e,s,t),Ke.size>600){let c=Math.floor(150);for(let w of Ke.keys()){if(c--<=0)break;Ke.delete(w)}}return null}var Wn=10,rt=class{constructor(t,{center:n=[0,0],zoom:s=7,minZoom:c=2,maxZoom:w=12,onMove:C,onTap:$}={}){this.canvas=t,this.ctx=t.getContext("2d"),this.lat=n[0],this.lon=n[1],this.zoom=s,this.minZoom=c,this.maxZoom=w,this.onMove=C,this.onTap=$,this.layers=[],this.overlays=[],this.dirty=!0,this.w=0,this.h=0,this._raf=null,this._bind(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(t),this.resize()}resize(){let t=Math.min(window.devicePixelRatio||1,2),n=this.canvas.clientWidth,s=this.canvas.clientHeight;!n||!s||(this.canvas.width=Math.round(n*t),this.canvas.height=Math.round(s*t),this.ctx.setTransform(t,0,0,t,0,0),this.w=n,this.h=s,this.invalidate())}invalidate(){this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=null,this.render()}))}setView(t,n,s){this.lat=t,this.lon=n,s!=null&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,s))),this.invalidate(),this.onMove?.(this)}project(t,n){let s=this.zoom;return[pe.lonToWorld(n,s)-pe.lonToWorld(this.lon,s)+this.w/2,pe.latToWorld(t,s)-pe.latToWorld(this.lat,s)+this.h/2]}unproject(t,n){let s=this.zoom;return[pe.worldToLat(pe.latToWorld(this.lat,s)+n-this.h/2,s),pe.worldToLon(pe.lonToWorld(this.lon,s)+t-this.w/2,s)]}_placeAt(t,n,s,c){let w=this.zoom;this.lon=pe.worldToLon(pe.lonToWorld(n,w)+this.w/2-s,w),this.lat=Math.max(-85,Math.min(85,pe.worldToLat(pe.latToWorld(t,w)+this.h/2-c,w)))}_zoomAbout(t,n,s){let[c,w]=this.unproject(t,n);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,s)),this._placeAt(c,w,t,n)}_bind(){let t=this.canvas,n=new Map,s=null,c=null,w=k=>({x:k.clientX-c.left,y:k.clientY-c.top}),C=()=>{let k=[...n.values()];return{n:k.length,x:k.reduce((i,u)=>i+u.x,0)/k.length,y:k.reduce((i,u)=>i+u.y,0)/k.length,span:k.length<2?0:Math.hypot(k[0].x-k[1].x,k[0].y-k[1].y)}},$=()=>{if(!n.size){s=null;return}let k=C(),[i,u]=this.unproject(k.x,k.y);s={lat:i,lon:u,span:k.span,zoom:this.zoom}};t.addEventListener("pointerdown",k=>{if(n.size>=2)return;c=t.getBoundingClientRect();let i=w(k);n.set(k.pointerId,{...i,x0:i.x,y0:i.y});try{t.setPointerCapture(k.pointerId)}catch{}$(),t.style.cursor="grabbing"}),t.addEventListener("pointermove",k=>{if(!s||!n.has(k.pointerId))return;let i=n.get(k.pointerId);n.set(k.pointerId,{...w(k),x0:i.x0,y0:i.y0});let u=C();u.n>1&&s.span>20&&u.span>8&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,s.zoom+Math.log2(u.span/s.span)))),this._placeAt(s.lat,s.lon,u.x,u.y),this.invalidate(),this.onMove?.(this)});let T=k=>{let i=n.get(k.pointerId);if(n.delete(k.pointerId)){try{t.releasePointerCapture(k.pointerId)}catch{}this.onTap&&!n.size&&Math.hypot(i.x-i.x0,i.y-i.y0)<Wn&&this.onTap({x:i.x,y:i.y},k),$(),n.size||(t.style.cursor="grab")}};t.addEventListener("pointerup",T),t.addEventListener("pointercancel",T),t.addEventListener("wheel",k=>{k.preventDefault();let i=t.getBoundingClientRect(),u=-k.deltaY*(k.deltaMode===1?.05:.0022);this._zoomAbout(k.clientX-i.left,k.clientY-i.top,this.zoom+u),this.invalidate(),this.onMove?.(this)},{passive:!1});for(let k of["gesturestart","gesturechange","gestureend"])t.addEventListener(k,i=>i.preventDefault());t.style.cursor="grab",t.style.touchAction="none"}_layerTiles(t,n,s,c){let{w,h:C}=this,$=Math.min(n,t.maxTileZoom??n),T=256*Math.pow(2,this.zoom-$),k=Math.pow(2,$),i=Math.floor(s/T),u=Math.floor((s+w)/T),A=Math.floor(c/T),d=Math.floor((c+C)/T),r=[];for(let f=A;f<=d;f++)if(!(f<0||f>=k))for(let o=i;o<=u;o++){let l=(o%k+k)%k,m=t.url($,l,f);m&&r.push({tx:o,ty:f,url:m})}return{size:T,tiles:r}}tilesSettled(t,n){let s=this.layers.find(k=>k.name===t);if(!s||s.enabled===!1||s.opacity===0||!this.w||!this.h)return!0;let c=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),w=pe.lonToWorld(this.lon,this.zoom)-this.w/2,C=pe.latToWorld(this.lat,this.zoom)-this.h/2,{tiles:$}=this._layerTiles(n?{...s,url:n}:s,c,w,C),T=!0;for(let k of $){n&&Zo(k.url,()=>this.invalidate());let i=Ke.get(k.url)?.state;i!=="ok"&&i!=="err"&&(T=!1)}return T}inkIn(t,n,s,c,w){if(n<0||s<0||n+c>this.w||s+w>this.h)return 1;let C=this.layers.find(l=>l.name===t);if(!C||C.enabled===!1||C.opacity===0)return 0;n=Math.round(n),s=Math.round(s),c=Math.max(1,Math.round(c)),w=Math.max(1,Math.round(w));let $=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),T=pe.lonToWorld(this.lon,this.zoom)-this.w/2,k=pe.latToWorld(this.lat,this.zoom)-this.h/2,{size:i,tiles:u}=this._layerTiles(C,$,T,k),A=this._inkCanvas||(this._inkCanvas=document.createElement("canvas"));A.width=c,A.height=w;let d=A.getContext("2d",{willReadFrequently:!0}),r=!1;for(let{tx:l,ty:m,url:y}of u){let v=Math.round(l*i-T),b=Math.round(m*i-k);if(v>n+c||b>s+w||v+i<n||b+i<s)continue;let M=Ke.get(y);M?.state==="ok"&&(d.drawImage(M.img,v-n,b-s,Math.ceil(i),Math.ceil(i)),r=!0)}if(!r)return 0;let f;try{f=d.getImageData(0,0,c,w).data}catch{return 0}let o=0;for(let l=3;l<f.length;l+=4)f[l]>64&&o++;return o/(c*w)}render(){let{ctx:t,w:n,h:s}=this;if(!n||!s)return;t.clearRect(0,0,n,s),t.fillStyle="#0f1826",t.fillRect(0,0,n,s);let c=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),w=pe.lonToWorld(this.lon,this.zoom)-n/2,C=pe.latToWorld(this.lat,this.zoom)-s/2,$=()=>this.invalidate();for(let T of this.layers){if(T.enabled===!1||T.opacity===0)continue;let{size:k,tiles:i}=this._layerTiles(T,c,w,C);t.save(),t.globalAlpha=T.opacity??1,T.filter&&(t.filter=T.filter),T.blend&&(t.globalCompositeOperation=T.blend);let u=.5;for(let{tx:A,ty:d,url:r}of i){let f=Zo(r,$);f&&t.drawImage(f,Math.round(A*k-w)-u,Math.round(d*k-C)-u,Math.ceil(k)+u*2,Math.ceil(k)+u*2)}t.restore()}for(let T of this.overlays){t.save();try{T(t,this)}catch(k){console.error("[map overlay]",k)}t.restore()}}destroy(){this._ro.disconnect()}};function Qo(e,t,n,{stroke:s,fill:c,width:w=1.5,glow:C=8}){if(!n)return;let $=n.type==="Polygon"?[n.coordinates]:n.type==="MultiPolygon"?n.coordinates:null;if($){e.beginPath();for(let T of $)for(let k of T)k.forEach(([i,u],A)=>{let[d,r]=t.project(u,i);A===0?e.moveTo(d,r):e.lineTo(d,r)}),e.closePath();c&&(e.fillStyle=c,e.fill("evenodd")),s&&(e.save(),C&&(e.shadowColor=s,e.shadowBlur=C/2),e.strokeStyle=s,e.lineWidth=w,e.stroke(),e.restore())}}function jt(e,t,n,s="#f07aa6",c=null,w=0,C=null){e.save(),e.shadowColor=s,e.shadowBlur=7,e.strokeStyle=s,e.lineWidth=1.5;let $=7;e.beginPath(),e.arc(t,n,$,0,Math.PI*2),e.stroke(),e.beginPath();for(let[T,k]of[[-1,0],[1,0],[0,-1],[0,1]])e.moveTo(t+T*($+2),n+k*($+2)),e.lineTo(t+T*($+7),n+k*($+7));if(e.stroke(),e.fillStyle=s,e.beginPath(),e.arc(t,n,2.2,0,Math.PI*2),e.fill(),w>0&&(e.globalAlpha=1-w,e.beginPath(),e.arc(t,n,$+w*26,0,Math.PI*2),e.stroke(),e.globalAlpha=1),c){e.shadowBlur=0,e.font="600 11.5px 'Chakra Petch', sans-serif",e.letterSpacing="1.4px",e.textAlign="left",e.textBaseline="middle";let T=e.measureText(c).width+10,k=[[t+$+8,n-7],[t-$-8-T,n-7],[t-T/2,n-$-26],[t-T/2,n+$+12]],[i,u]=k[0];if(C){let A=1/0;for(let[d,r]of k){let f=C(d-3,r-3,T+6,20);f<A-.02&&(A=f,i=d,u=r)}}e.fillStyle="rgba(22,33,47,.85)",e.fillRect(i,u,T,14),e.fillStyle=s,e.fillText(c,i+5,u+7)}e.restore()}function Yt(e,t,n,s){let c=156543.03392*Math.cos(t.lat*Math.PI/180)/Math.pow(2,t.zoom),C=c*110/1609.344,T=[1,2,5,10,20,50,100,200,500,1e3].reduce((i,u)=>Math.abs(u-C)<Math.abs(i-C)?u:i),k=T*1609.344/c;e.save(),e.strokeStyle="rgba(221,226,232,.75)",e.lineWidth=1,e.beginPath(),e.moveTo(n,s-4),e.lineTo(n,s),e.lineTo(n+k,s),e.lineTo(n+k,s-4),e.stroke(),e.font="500 11.5px 'JetBrains Mono', monospace",e.fillStyle="rgba(221,226,232,.75)",e.textAlign="center",e.textBaseline="bottom",e.fillText(`${T} mi`,n+k/2,s-5),e.restore()}var _n=5;function Xo(e){e.className="view radar",e.innerHTML=`
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
  `;let t=E=>e.querySelector("#"+E),n=[],s=0,c=0,w=!1,C=0,$="",T=null,k=performance.now(),i="",u=new rt(t("r-map"),{center:[a.loc?.lat??0,a.loc?.lon??0],zoom:7,minZoom:3,maxZoom:11,onMove:()=>b()}),A=E=>(O,p,I)=>!E||!i?null:`${i}${E.path}/256/${O}/${p}/${I}/4/1_1.png`;u.layers=[{name:"base",url:(E,O,p)=>`${lt}/World_Dark_Gray_Base/MapServer/tile/${E}/${p}/${O}`,filter:Vt,opacity:1},{name:"radar",url:(E,O,p)=>A(n[s])(E,O,p),opacity:.82,blend:"screen",maxTileZoom:7},{name:"labels",url:(E,O,p)=>`${lt}/World_Dark_Gray_Reference/MapServer/tile/${E}/${p}/${O}`,filter:Kt,opacity:1}];let d=E=>u.layers.find(O=>O.name===E);u.overlays.push((E,O)=>{if(d("alerts")?.enabled!==!1&&r)for(let p of a.alerts){if(!p.geometry)continue;let I=pt(p.event,p.severity);Qo(E,O,p.geometry,{stroke:I,fill:Q(I,.12),width:1.5,glow:10})}if(a.loc){let[p,I]=O.project(a.loc.lat,a.loc.lon);jt(E,p,I,Y[1],a.loc.name.toUpperCase(),0,(R,W,x,U)=>O.inkIn("labels",R,W,x,U))}Yt(E,O,14,O.h-14),E.save(),E.strokeStyle="rgba(63,208,216,.06)",E.lineWidth=1;for(let p=1;p<4;p++)E.beginPath(),E.moveTo(O.w*p/4,0),E.lineTo(O.w*p/4,O.h),E.moveTo(0,O.h*p/4),E.lineTo(O.w,O.h*p/4),E.stroke();E.restore()});let r=!0,f=null,o=!1;t("r-storms").addEventListener("click",async E=>{let O=E.currentTarget;if(o=!o,O.classList.toggle("on",o),O.setAttribute("aria-pressed",String(o)),e.classList.toggle("storms-mode",o),o){a.playing=!1,a.emit("play",!1),d("radar").enabled=!1;try{f||=(await import("./storms.QZPVT37Q.js")).createStorms({map:u,panel:t("r-stormpanel"),hud:t("r-storm-hud"),root:e})}catch(p){console.error("[radar] storms",p),o=!1,O.classList.remove("on"),O.setAttribute("aria-pressed","false"),e.classList.remove("storms-mode"),d("radar").enabled=!0;return}o&&f.enter()}else f?.exit(),d("radar").enabled=!0,a.loc&&u.setView(a.loc.lat,a.loc.lon,7),a.playing=!0,a.emit("play",!0),v(),u.invalidate()});let l=ue(t("r-strip"),(E,O,p)=>{if(!n.length)return;let I=n.length,R=Math.max(2,O/I-2),W=n.findIndex(x=>x.kind==="nowcast");if(n.forEach((x,U)=>{let q=U*O/I,B=x.kind==="past",_=U===s?Y[1]:B?Y[0]:N.warn;E.fillStyle=Q(_,U===s?1:.3),E.fillRect(q,U===s?2:6,R,U===s?p-4:p-12)}),W>0){let x=W*O/I-1;E.save(),E.strokeStyle=Q(N.warn,.8),E.setLineDash([2,2]),E.beginPath(),E.moveTo(x,0),E.lineTo(x,p),E.stroke(),E.restore()}},{onPick:({x:E,w:O})=>{if(!n.length)return;let p=n[K(Math.floor(E/O*n.length),0,n.length-1)];a.playing=!1,a.emit("play",!1),a.scrubTo(p.time*1e3)}});function m(E){let O=0,p=1/0;for(let I=0;I<n.length;I++){let R=Math.abs(n[I].time*1e3-E);R<p&&(p=R,O=I)}return O}function y(){if(!n.length)return;let E=m(a.cursor);E!==s&&(s=E,M())}function v(){t("r-play").textContent=a.playing?"\u275A\u275A":"\u25B6"}let b=()=>l.render();function M(){let E=n[s];if(!E)return;t("r-time").textContent=a.fmt.hm(E.time*1e3);let O=Math.round((Date.now()/1e3-E.time)/60);t("r-age").textContent=E.kind==="nowcast"?`FORECAST +${Math.abs(O)}m`:O<=1?"LATEST":`${O} MIN AGO`,t("r-age").style.color=E.kind==="nowcast"?N.warn:O<=12?N.good:De,u.invalidate(),l.render()}async function L(){try{let E=a.radar||await ye.radar();i=E.host;let O=(E.radar?.past||[]).map(I=>({...I,kind:"past"})),p=(E.radar?.nowcast||[]).map(I=>({...I,kind:"nowcast"}));n=[...O,...p],s=m(a.cursor),t("r-src").textContent=p.length?`${O.length} OBS + ${p.length} FCST`:`${O.length} OBSERVED`,M(),H()}catch(E){console.error("[radar] frames",E),t("r-src").textContent="UNAVAILABLE"}}function H(){let E=[["#62a4ef","light"],["#6cc98f","moderate"],["#ecd46a","heavy"],["#f59a5b","very heavy"],["#f47171","intense"],["#c89af5","hail"]];t("r-legend").innerHTML='<span class="lg-title">intensity</span>'+E.map(([O,p])=>`<b><i style="background:${O}"></i>${p}</b>`).join("")}function D(){let E=a.fmt,O=a.frame(),p=[O?.t,O?.precip,O?.cape,O?.cloud,a.alerts.length,a.hours.length].join("|");if(p===$&&a.raw===T)return;$=p,T=a.raw;let I=a.alerts;t("r-alertn").textContent=String(I.length),t("r-alertlist").innerHTML=I.length?I.map(V=>`
      <div class="alert-item" style="--ac:${pt(V.event,V.severity)}">
        <b>${oe(V.event)}</b>
        <span>${oe(V.areaDesc||"").slice(0,90)}</span><br>
        <span>until ${E.weekday(V.expires)} ${E.hm(V.expires)}</span>
      </div>`).join(""):'<div class="nodata">no active alerts</div>';let R=a.frame(),W=a.hours.filter(V=>V.t>=Date.now()&&V.t<=Date.now()+6*36e5),x=W.reduce((V,fe)=>V+(fe.precip??0),0),U=Math.max(0,...W.map(V=>V.pop??0));t("r-cover").innerHTML=`
      <dl style="margin:0">
        ${S("Now",R?.wx.label??"--")}
        ${S("Rate",R?.precip!=null?`${R.precip.toFixed(3)} in/hr`:"--")}
        ${S("Next 6h total",`${x.toFixed(2)} in`)}
        ${S("Peak chance 6h",`${Math.round(U)}%`)}
        ${S("Cloud cover",R?.cloud!=null?`${Math.round(R.cloud)}%`:"--")}
        ${S("Freezing level",R?.freezing!=null?`${Math.round(R.freezing*3.28084)} ft`:"--")}
      </dl>`;let q=R?.cape??0,B=R?.li,_=R?.cin,X=q<300?["STABLE",N.good]:q<1e3?["MARGINAL",Y[0]]:q<2500?["MODERATE",N.warn]:q<4e3?["STRONG",N.serious]:["EXTREME",N.crit],ne=Math.max(0,...a.hours.filter(V=>V.t>=Date.now()&&V.t<=Date.now()+24*36e5).map(V=>V.cape??0));t("r-conv").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
        <span class="num" style="font-size:1.5rem;font-weight:700;color:${X[1]}">${Math.round(q)}</span>
        <span class="lbl">J/kg CAPE</span>
        <span class="chip" style="--ac:${X[1]};margin-left:auto">${X[0]}</span>
      </div>
      <div class="meter seg" style="--ac:${X[1]};margin-bottom:8px"><i style="width:${K(q/4e3*100,0,100)}%"></i></div>
      <dl style="margin:0">
        ${S("Lifted index",B!=null?B.toFixed(1):"--")}
        ${S("Inhibition",_!=null?`${Math.round(_)} J/kg`:"--")}
        ${S("Peak CAPE 24h",`${Math.round(ne)} J/kg`)}
      </dl>
      <div style="font-size:max(.58rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        CAPE is the energy available to a rising parcel. Above ~1000 J/kg with a
        negative lifted index, thunderstorms become plausible.
      </div>`}t("r-play").addEventListener("click",()=>{a.playing=!a.playing,a.emit("play",a.playing),v()}),a.on("play",v),a.on("cursor",()=>{a.view==="radar"&&(y(),v())}),t("r-center").addEventListener("click",()=>{a.loc&&u.setView(a.loc.lat,a.loc.lon,7)}),t("r-zin").addEventListener("click",()=>u.setView(u.lat,u.lon,u.zoom+1)),t("r-zout").addEventListener("click",()=>u.setView(u.lat,u.lon,u.zoom-1)),t("r-labels").addEventListener("click",E=>{let O=d("labels");O.enabled=O.enabled===!1,E.currentTarget.classList.toggle("on",O.enabled!==!1),u.invalidate()}),t("r-alerts").addEventListener("click",E=>{r=!r,E.currentTarget.classList.toggle("on",r),u.invalidate()});function g(E){if(a.view!=="radar"||o){k=E;return}let O=Math.min(.2,(E-k)/1e3);if(k=E,a.playing&&n.length){if(!w){if(C+=O,!u.tilesSettled("radar")&&C<_n)return;w=!0}c+=O;let p=s===n.length-1?1.1:.42;if(c>=p){let I=-1;for(let R=1;R<=n.length;R++){let W=(s+R)%n.length;if(W===s||u.tilesSettled("radar",A(n[W]))){I=W;break}}if(I<0||I===s){c=p-.1;return}c=0,a.hours.length?a.setCursor(n[I].time*1e3):(s=I,M())}}}requestAnimationFrame(function E(O){requestAnimationFrame(E),g(O)}),a.on("loc",()=>{a.loc&&u.setView(a.loc.lat,a.loc.lon,7)}),a.on("radar",L);let S=(E,O)=>`<div class="kv"><dt>${E}</dt><dd>${O}</dd></div>`;return L(),{map:u,update(){D(),u.invalidate()},onShow(){w=!1,C=0,c=0,u.resize(),l.render(),y(),f?.setVisible(!0),o||(a.playing=!0,a.emit("play",!0)),v()},onHide(){f?.setVisible(!1),a.playing=!1,a.emit("play",!1),a.following&&a.setCursor(Date.now())}}}function Un(e,t){if(!e?.length)return null;let n=null,s=1/0;for(let c of e){let w=Math.abs(c.t-t);w<s&&(s=w,n=c)}return s<=36e5?n:null}function en(e,t){for(let n of t){let s=e[n];if(s instanceof Date&&!Number.isNaN(+s))return{at:+s,kind:n}}return null}function qn(e,t,n,s,c){let w=en(t,["night","nauticalDusk","dusk"]),C=en(n,["nightEnd","nauticalDawn","dawn"]);if(!w||!C||C.at<=w.at)return{dark:null,samples:[],goodHours:0,score:0,reason:"no darkness"};let $=[],T=Math.ceil(w.at/36e5)*36e5;for(let M=T;M<=C.at;M+=36e5){let L=Un(e,M);if(!L)continue;let H=c(M),D=s(M)>0;$.push({t:M,cloud:L.cloud??null,moonUp:D,moonLit:H,washed:D&&H>=.25,clear:L.cloud!=null&&L.cloud<=30})}if(!$.length)return{dark:{from:w.at,to:C.at,kind:w.kind},samples:[],goodHours:0,score:0,reason:"beyond the forecast"};let k=M=>M.clear&&!M.washed,i=$.filter(k).length,u=$.filter(M=>M.clear).length,A=$.filter(M=>M.cloud!=null),d=A.length?A.reduce((M,L)=>M+L.cloud,0)/A.length:null,r=null,f=null;for(let M of $.concat([null])){if(M&&k(M)){f=f||{from:M.t,to:M.t},f.to=M.t+36e5;continue}f&&(!r||f.to-f.from>r.to-r.from)&&(r=f),f=null}let o=(C.at-w.at)/36e5,l=c(w.at+(C.at-w.at)/2),m=$.filter(M=>M.moonUp).length/$.length,y=r?(r.to-r.from)/36e5:0,v=.65*Math.min(1,y/4)+.25*Math.min(1,i/Math.max(o,1))+.1*Math.min(1,o/6),b=Math.round(100*Math.max(0,Math.min(1,v)-.08*m*l));return{dark:{from:w.at,to:C.at,kind:w.kind,hours:o},samples:$,goodHours:i,clearHours:u,cloudMean:d,moonLit:l,moonUpHours:$.filter(M=>M.moonUp).length,best:r,score:b}}function tn(e,t,n,s,c,w=7,C=null){let{sunTimes:$,moonPosition:T,moonIllumination:k,toDeg:i}=c,u=[],A=C==null?(()=>{let f=new Date(s);return f.setHours(12,0,0,0),+f})():Math.floor((s+C)/(24*36e5))*24*36e5+12*36e5-C,d=f=>i(T(new Date(f),t,n).altitude),r=f=>k(new Date(f)).fraction;for(let f=0;f<w;f++){let o=new Date(A+f*24*36e5),l=new Date(A+(f+1)*24*36e5),m=qn(e,$(o,t,n),$(l,t,n),d,r);u.push({...m,index:f,day:+o})}return u}function so(e){return e.slice(1).reduce((t,n)=>n.score>(t?.score??-1)?n:t,null)}function on(e,t){let n=e[0],s=i=>t.hm(i);if(!n||!n.dark)return"No real darkness tonight at this latitude.";if(!n.samples.length)return"Tonight is beyond the forecast.";let c=so(e),w=c&&c.score>n.score+15?c:null,C=i=>i.index===1?"Tomorrow":t.weekday(i.day),$=(i,u)=>`${i} ${u}${i===1?"":"s"}`,T=w?` ${C(w)} is the better night: ${$(w.goodHours,"clear moonless hour")}.`:"";if(n.best&&n.best.to-n.best.from>=2*36e5){let i=(n.best.to-n.best.from)/36e5,u=Math.round(i),A=n.moonLit>=.25&&n.moonUpHours?`, and the moon is ${Math.round(n.moonLit*100)}% lit`:"";if(n.dark.hours-i<1)return`Clear and moonless all night \u2014 about ${$(u,"hour")}, ${s(n.best.from)} to ${s(n.best.to)}${A}.`+T;if(u<3){let d=n.cloudMean!=null&&n.cloudMean>30?`, in a night averaging ${Math.round(n.cloudMean)}% cloud`:n.dark.hours<4?`, which is most of the ${$(Math.round(n.dark.hours),"hour")} of darkness`:"";return`A ${u}-hour window from ${s(n.best.from)}${d}${A}.`+T}return`Clear and moonless from ${s(n.best.from)} to ${s(n.best.to)} \u2014 about ${$(u,"hour")}${A}.`+T}return`Not tonight \u2014 ${n.cloudMean!=null&&n.cloudMean>30?`${Math.round(n.cloudMean)}% cloud through the dark hours`:n.moonUpHours&&n.moonLit>=.25?`a ${Math.round(n.moonLit*100)}% moon up for most of it`:"not much dark sky to work with"}.`+T}function nn(e){e.className="view skyview",e.innerHTML=`
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
  `;let t=o=>e.querySelector("#"+o),n=null;function s(){let{lat:o,lon:l}=a.loc||{lat:0,lon:0},m=a.fmt.isoDate(a.cursor),y=a.cursor;for(;a.fmt.isoDate(y-6e4)===m;)y-=6e4;let v=[],b=[];for(let M=0;M<=1440;M+=10){let L=new Date(y+M*6e4),H=mt(L,o,l),D=vt(L,o,l);v.push({az:ot(H.azimuth),alt:Ne(H.altitude),t:+L}),b.push({az:ot(D.azimuth),alt:Ne(D.altitude),t:+L})}return{sun:v,moon:b,t0:y}}let c=ue(t("s-dome"),(o,l,m,y)=>{let v=a.frame();if(!v)return;let{sun:b,moon:M}=s(),L=Math.min(l,m)/2-26,H=l/2,D=m/2;Ao(o,H,D,L,{sunTrack:b,moonTrack:M,sun:{az:v.sun.compass,alt:v.sun.altDeg},moon:{az:v.moon.compass,alt:v.moon.altDeg},iss:n&&n.alt>0?n:null,night:v.sun.altDeg<-6?1:0}),o.save(),o.font="500 12px 'JetBrains Mono', monospace",o.textAlign="left",o.textBaseline="top";let g=[["SUN",`${v.sun.altDeg.toFixed(1)}\xB0  ${ge(v.sun.compass)}`,"#f2b45a"],["MOON",`${v.moon.altDeg.toFixed(1)}\xB0  ${ge(v.moon.compass)}`,"#7fb2f0"]];n&&g.push(["ISS",`${n.alt>0?`${n.alt.toFixed(0)}\xB0 ${ge(n.az)}`:"below horizon"}`,"#8fdc6a"]),g.forEach(([S,E,O],p)=>{o.fillStyle=O,o.fillText(S,10,10+p*15),o.fillStyle=Ee,o.fillText(E,52,10+p*15)}),o.restore()}),w=ue(t("s-moon"),(o,l,m)=>{let y=a.frame();if(!y)return;let v=Math.min(l,m)/2-4;Ot(o,l/2,m/2,Math.max(10,v),y.moon.phase,y.moon.fraction)}),C=ue(t("s-moonalt"),(o,l,m)=>{let{sun:y,moon:v}=s(),b={l:2,r:22,t:12,b:12},M={x:b.l,y:b.t,w:l-b.l-b.r,h:m-b.t-b.b};if(M.w<30||M.h<20)return;let L=g=>M.y+M.h-(K(g,-60,90)+60)/150*M.h,H=g=>M.x+g/(v.length-1)*M.w;o.save(),o.strokeStyle="rgba(63,208,216,.30)",o.setLineDash([3,3]),o.beginPath(),o.moveTo(M.x,L(0)),o.lineTo(M.x+M.w,L(0)),o.stroke(),o.setLineDash([]),o.font="500 11.5px 'JetBrains Mono', monospace",o.fillStyle=de,o.textAlign="right",o.textBaseline="middle",o.fillText("0\xB0",M.x+M.w+18,L(0)),o.restore(),Ae(o,y.map((g,S)=>[H(S),L(g.alt)]),"#f2b45a",{width:1.4,glow:6}),o.save(),o.setLineDash([3,3]),Ae(o,v.map((g,S)=>[H(S),L(g.alt)]),"#7fb2f0",{width:1.6,glow:7}),o.restore();let D=K(Math.round((a.cursor-v[0].t)/(v.at(-1).t-v[0].t)*(v.length-1)),0,v.length-1);o.save(),o.strokeStyle=Y[1],o.lineWidth=1,o.beginPath(),o.moveTo(H(D),M.y),o.lineTo(H(D),M.y+M.h),o.stroke(),o.restore(),o.save(),o.font="500 11.5px 'JetBrains Mono', monospace",o.fillStyle=de,o.textAlign="center",o.textBaseline="top";for(let g=0;g<=24;g+=6)g!==24&&Pe(o,String(g).padStart(2,"0"),H(g/24*(v.length-1)),m-b.b+1,0,l);o.restore(),ke(o,M.x+2,1,"altitude \u2014 sun solid, moon dashed")}),$=ue(t("s-daybar"),(o,l,m)=>{let y=a.sunTimesFor(),v=a.fmt.isoDate(a.cursor),b=a.cursor;for(;a.fmt.isoDate(b-6e4)===v;)b-=6e4;let M=b+24*36e5,L=O=>(O-b)/(M-b)*l,H=8,D=16,g=(O,p,I)=>{if(O==null||p==null||isNaN(+O)||isNaN(+p))return;let R=K(L(+O),0,l),W=K(L(+p),0,l);W<=R||(o.fillStyle=I,o.fillRect(R,H,W-R,D))};o.fillStyle="#0f1826",o.fillRect(0,H,l,D),g(y.nightEnd,y.nauticalDawn,"rgba(30,20,70,.9)"),g(y.nauticalDawn,y.dawn,"rgba(40,40,120,.9)"),g(y.dawn,y.sunrise,"rgba(90,60,150,.9)"),g(y.sunrise,y.goldenHourEnd,"rgba(245,154,91,.85)"),g(y.goldenHourEnd,y.goldenHour,"rgba(90,180,235,.75)"),g(y.goldenHour,y.sunset,"rgba(245,154,91,.85)"),g(y.sunset,y.dusk,"rgba(150,70,140,.9)"),g(y.dusk,y.nauticalDusk,"rgba(60,45,130,.9)"),g(y.nauticalDusk,y.night,"rgba(30,20,70,.9)"),o.save(),o.font="500 11.5px 'JetBrains Mono', monospace",o.fillStyle=de,o.textAlign="center",o.textBaseline="top",o.strokeStyle="rgba(255,255,255,.10)";for(let O=0;O<=24;O+=3){let p=O/24*l;o.beginPath(),o.moveTo(p,H+D),o.lineTo(p,H+D+3),o.stroke(),O%6===0&&O<24&&Pe(o,String(O).padStart(2,"0"),p,H+D+5,0,l)}o.restore();let S=(O,p,I)=>{if(O==null||isNaN(+O))return;let R=K(L(+O),6,l-6);o.save(),o.strokeStyle=I,o.lineWidth=1,o.beginPath(),o.moveTo(R,H-4),o.lineTo(R,H+D),o.stroke(),o.font="600 11.5px 'Chakra Petch', sans-serif",o.fillStyle=I,o.textAlign="center",o.textBaseline="bottom",o.fillText(p,R,H-5),o.restore()};S(y.sunrise,"\u2191","#f2b45a"),S(y.sunset,"\u2193","#f2b45a");let E=K(L(a.cursor),0,l);o.save(),o.strokeStyle=Y[1],o.lineWidth=1.5,o.shadowColor=Y[1],o.shadowBlur=4,o.beginPath(),o.moveTo(E,H-6),o.lineTo(E,H+D+2),o.stroke(),o.restore()}),T=ue(t("s-kp"),(o,l,m,y)=>{let v=a.kpForecast();if(!v.length){k(o,l,m,"no space weather data");return}zo(o,l,m,y,{rows:v,tf:a.fmt,now:Date.now()})});function k(o,l,m,y){o.save(),o.font="600 11.5px 'Chakra Petch', sans-serif",o.fillStyle=de,o.textAlign="center",o.textBaseline="middle",o.letterSpacing="1.6px",o.fillText(y.toUpperCase(),l/2,m/2),o.restore()}function i(o,l=Date.now()){let m=l,y=6*36e5,v=yt(new Date(m)).phase;for(let b=0;b<240;b++){m+=y;let M=yt(new Date(m)).phase;if(v<=o&&M>=o||v>M&&(v<=o||M>=o)){let H=m-y,D=m;for(let g=0;g<28;g++){let S=(H+D)/2,E=yt(new Date(S)).phase;E<o||E>.9&&o<.1?H=S:D=S}return(H+D)/2}v=M}return null}function u(){let o=a.frame();if(!o)return;let l=a.fmt;t("s-domewhen").textContent=a.atNow?"LIVE":`${l.weekday(a.cursor)} ${l.hm(a.cursor)}`;let m=a.moonTimesFor();t("s-mphase").textContent=wo(o.moon.phase).toUpperCase();let y=i(.5),v=i(0);t("s-moondl").innerHTML=`
      ${r("Illumination",`${(o.moon.fraction*100).toFixed(1)}%`)}
      ${r("Altitude",`${o.moon.altDeg.toFixed(1)}\xB0 ${ge(o.moon.compass)}`)}
      ${r("Distance",`${Math.round(o.moon.distance).toLocaleString()} km`)}
      ${r("Moonrise",m.rise?l.hm(m.rise):m.alwaysUp?"always up":"\u2014")}
      ${r("Moonset",m.set?l.hm(m.set):m.alwaysDown?"never up":"\u2014")}
      ${r("Next full",y?`${l.monthDay(y)} ${l.hm(y)}`:"\u2014")}
      ${r("Next new",v?`${l.monthDay(v)} ${l.hm(v)}`:"\u2014")}
    `;let b=a.sunTimesFor(),M=o.day;t("s-daylen").textContent=M?.daylight?tt(M.daylight):"\u2014";let L="\u2014",H=a.days.findIndex(_=>l.isoDate(_.t)===l.isoDate(a.cursor));if(H>0&&a.days[H].daylight&&a.days[H-1].daylight){let _=a.days[H].daylight-a.days[H-1].daylight,X=Math.abs(_)/60;L=`${_>=0?"+":"\u2212"}${Math.floor(X)}m ${Math.round(X%1*60)}s vs yesterday`}t("s-sundl").innerHTML=`
      ${r("First light",l.hm(b.dawn))}
      ${r("Sunrise",l.hm(b.sunrise))}
      ${r("Golden hour ends",l.hm(b.goldenHourEnd))}
      ${r("Solar noon",`${l.hm(b.solarNoon)} \xB7 ${d().toFixed(1)}\xB0`)}
      ${r("Golden hour",l.hm(b.goldenHour))}
      ${r("Sunset",l.hm(b.sunset))}
      ${r("Civil dusk",l.hm(b.dusk))}
      ${r("Astronomical dark",isNaN(+b.night)?"none tonight":l.hm(b.night))}
      ${r("Day length",L)}
    `;let D=a.currentKp(),g=Et(D);t("s-kpnow").textContent=D!=null?`Kp ${D.toFixed(2)} \xB7 ${g.name}`:"NO DATA";let S=a.space,E=S?.wind?.ok?S.wind.data?.[0]?.proton_speed:null,O=S?.mag?.ok?S.mag.data?.[0]?.bt:null,p=S?.mag?.ok?S.mag.data?.[0]?.bz_gsm:null,I=S?.scales?.ok?S.scales.data?.["0"]:null;t("s-spacedl").innerHTML=`
      ${r("Solar wind",E!=null?`${E} km/s`:"\u2014")}
      ${r("IMF Bt / Bz",O!=null?`${O} / ${p} nT`:"\u2014")}
      ${r("Aurora visible to",g.lat!=null?`${g.lat}\xB0 latitude`:"\u2014")}
      ${r("Your latitude",`${Math.abs(a.loc.lat).toFixed(1)}\xB0 ${a.loc.lat>=0?"N":"S"}`)}
      ${r("Radio / Solar / Geo",I?`R${I.R?.Scale??0} S${I.S?.Scale??0} G${I.G?.Scale??0}`:"\u2014")}
    `;let R=o.air,W=Wt("stargaze",{...o,air:R},{sunAltDeg:o.sun.altDeg,moonFraction:o.moon.fraction,moonUp:o.moon.altDeg>0}),x=W?.score??0,U=x>=75?N.good:x>=50?N.warn:x>=30?N.serious:N.crit;t("s-seenow").textContent=`${x}/100`;let q=a.hours.filter(_=>_.t>Date.now()&&_.t<Date.now()+30*36e5),B=null;for(let _ of q){let X=a.frame(_.t);if(!X||X.sun.altDeg>-12)continue;let ne=Wt("stargaze",X,{sunAltDeg:X.sun.altDeg,moonFraction:X.moon.fraction,moonUp:X.moon.altDeg>0});(!B||ne.score>B.score)&&(B={t:_.t,score:ne.score,limiter:ne.limiter})}t("s-seeing").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:5px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${U}">${x}</span>
        <span class="lbl">stargazing now</span>
      </div>
      <div class="meter" style="--ac:${U};margin-bottom:9px"><i style="width:${x}%"></i></div>
      ${(W?.parts||[]).map(_=>`
        <div class="kv">
          <dt>${_.name}</dt>
          <dd style="display:flex;align-items:center;gap:6px">
            <span class="meter" style="width:52px;--ac:${_.value>.7?N.good:_.value>.4?N.warn:N.crit}">
              <i style="width:${_.value*100}%"></i></span>
            ${Math.round(_.value*100)}
          </dd>
        </div>`).join("")}
      <div style="margin-top:8px;font-size:max(.66rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5">
        ${B?`Best hour right now: <b style="color:${Ee}">${l.weekday(B.t)} ${l.hm(B.t)}</b> at ${B.score}/100${B.limiter?`, held back by ${B.limiter}`:""}.`:"No astronomical darkness in the next 30 hours."}
      </div>`,A(),c.render(),w.render(),C.render(),$.render(),T.render()}function A(){let o=t("s-tonight");if(!a.loc||!a.hours?.length){o.innerHTML="";return}let l=a.fmt,m=tn(a.hours,a.loc.lat,a.loc.lon,Date.now(),{sunTimes:yo,moonPosition:vt,moonIllumination:yt,toDeg:Ne}),y=so(m),v=Math.max(4,...m.map(M=>M.goodHours)),b=M=>{let L=y&&M.index===y.index&&M.score>m[0].score,H=M.score>=75?N.good:M.score>=45?N.warn:N.crit;return`
        <div class="tn-n${L?" pick":""}${M.index===0?" now":""}"
             title="${M.goodHours} clear moonless hours of ${M.dark?M.dark.hours.toFixed(1):0} dark">
          <span class="tn-h">${M.dark?`${M.goodHours}h`:"\u2014"}</span>
          <span class="tn-bar"><i style="height:${Math.round(M.goodHours/v*100)}%;background:${H}"></i></span>
          <span class="tn-d">${l.weekday(M.day).slice(0,3).toUpperCase()}</span>
        </div>`};o.innerHTML=`
      <p class="tn-verdict">${oe(on(m,l))}</p>
      <div class="tn-week">${m.map(b).join("")}</div>
      <p class="tn-key">clear, moonless hours per night \xB7 next ${7}</p>`}function d(){let{lat:o,lon:l}=a.loc||{lat:0,lon:0},m=a.sunTimesFor();return!m.solarNoon||isNaN(+m.solarNoon)?0:Ne(mt(m.solarNoon,o,l).altitude)}let r=(o,l)=>`<div class="kv"><dt>${o}</dt><dd>${l}</dd></div>`;async function f(){if(a.view==="sky")try{let o=await ye.iss();if(o.pos?.ok){let l=o.pos.data,m=a.loc||{lat:0,lon:0};n={...gt(m.lat,m.lon,l.latitude,l.longitude,l.altitude),lat:l.latitude,lon:l.longitude,visibility:l.visibility},c.render()}}catch{}}return setInterval(f,8e3),{update:u,onShow(){f(),c.render(),w.render(),C.render(),$.render(),T.render()}}}var an=[{key:"pm25",label:"PM2.5",unit:"\xB5g/m\xB3",ref:35,who:15,note:"fine particulate \u2014 lungs and bloodstream"},{key:"pm10",label:"PM10",unit:"\xB5g/m\xB3",ref:150,who:45,note:"coarse dust and pollen fragments"},{key:"o3",label:"Ozone",unit:"\xB5g/m\xB3",ref:140,who:100,note:"photochemical smog, peaks mid-afternoon"},{key:"no2",label:"NO\u2082",unit:"\xB5g/m\xB3",ref:200,who:25,note:"traffic and combustion"},{key:"so2",label:"SO\u2082",unit:"\xB5g/m\xB3",ref:350,who:40,note:"industry and shipping"},{key:"co",label:"CO",unit:"\xB5g/m\xB3",ref:1e4,who:4e3,note:"incomplete combustion"}],Vn=["I very fair","II fair","III medium","IV olive","V brown","VI dark"];function sn(e){e.className="view airview",e.innerHTML=`
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
  `;let t=i=>e.querySelector("#"+i),n=ue(t("a-gauge"),(i,u,A)=>{let r=a.frame()?.air?.aqi??a.airNow?.aqi,f=He(r),o=Math.min(u,A)/2-22;Ve(i,u/2,A/2-4,Math.max(18,o),{value:r,min:0,max:300,color:f.color,label:"",unit:"US AQI",bands:[{from:0,to:50,color:N.good},{from:50,to:100,color:N.warn},{from:100,to:150,color:N.serious},{from:150,to:200,color:N.crit},{from:200,to:300,color:"#c89af5"}],ticks:6})}),s=ue(t("a-uv"),(i,u,A,d)=>{let r=a.fmt.isoDate(a.cursor),f=a.hours.filter(D=>a.fmt.isoDate(D.t)===r);if(f.length<2)return;let o={l:2,r:24,t:12,b:14},l={x:o.l,y:o.t,w:u-o.l-o.r,h:A-o.t-o.b},m=D=>l.y+l.h-K(D,0,12)/12*l.h,y="uv index today \xB7 dashed = clear sky";i.save(),i.font=Ie,i.letterSpacing="1.4px";let v={l:l.x+2,t:1,r:l.x+2+i.measureText(y.toUpperCase()).width,b:14};i.restore();for(let[D,g,S]of[[3,N.good,"LOW"],[6,N.warn,"MOD"],[8,N.serious,"HIGH"],[11,N.crit,"V.HIGH"]]){i.save(),i.strokeStyle=Q(g,.3),i.setLineDash([3,3]),i.lineWidth=1,i.beginPath(),i.moveTo(l.x,m(D)),i.lineTo(l.x+l.w,m(D)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=Q(g,.8),i.textAlign="right";let E=i.measureText(S).width,O=l.x+l.w-2,p=!It({l:O-E,t:m(D)-13,r:O,b:m(D)-1},v,4);i.textBaseline=p?"bottom":"top",Oe(i,S,O,p?m(D)-1:m(D)+2),i.restore()}let b=f.length,M=Math.max(2,l.w/b-1.5);f.forEach((D,g)=>{let S=D.uv??0;if(S<=.03)return;let E=_e(S).color;Ge(i,l.x+g*l.w/b,m(S),M,l.y+l.h,Q(E,.85))});let L=f.map(D=>[l.x+f.indexOf(D)*l.w/b+M/2,m(D.uvClear??0)]);i.save(),i.setLineDash([3,2]),i.strokeStyle=Q(Ee,.35),i.lineWidth=1,i.beginPath(),L.forEach(([D,g],S)=>S?i.lineTo(D,g):i.moveTo(D,g)),i.stroke(),i.restore(),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=de,i.textAlign="center",i.textBaseline="top";let H=Mo(l.w/b,i.measureText("00:00").width);f.forEach((D,g)=>{let S=a.fmt.hourOfDay(D.t);Math.round(S)%H||Math.abs(S-Math.round(S))>.02||Pe(i,a.fmt.hm(D.t),l.x+g*l.w/b+M/2,A-o.b+3,0,u)}),i.restore(),ke(i,l.x+2,1,"uv index today \xB7 dashed = clear sky")}),c=ue(t("a-fc"),(i,u,A,d)=>{let r=a.air.filter(g=>g.t>=Date.now()-216e5&&g.t<=Date.now()+3456e5);if(r.length<3){w(i,u,A,"no air quality forecast");return}let f={l:4,r:30,t:16,b:18},o={x:f.l,y:f.t,w:u-f.l-f.r,h:A-f.t-f.b},l=Math.max(110,Math.max(...r.map(g=>g.aqi??0))*1.15),m=g=>o.x+(g-r[0].t)/(r.at(-1).t-r[0].t)*o.w,y=g=>o.y+o.h-K(g,0,l)/l*o.h,v=[[50,N.good,"GOOD"],[100,N.warn,"MODERATE"],[150,N.serious,"SENSITIVE"]].filter(([g])=>g<=l);for(let[g,S]of v)i.save(),i.strokeStyle=Q(S,.28),i.setLineDash([4,3]),i.beginPath(),i.moveTo(o.x,y(g)),i.lineTo(o.x+o.w,y(g)),i.stroke(),i.restore();let b=r.length,M=Math.max(1,o.w/b-.5);r.forEach((g,S)=>{g.aqi!=null&&Ge(i,o.x+S*o.w/b,y(g.aqi),M,o.y+o.h,Q(He(g.aqi).color,.8),2)}),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.textAlign="right",i.textBaseline="bottom";let L=o.w/b;for(let[g,S,E]of v){let O=i.measureText(E).width+4,p=R=>{let W=Math.max(0,Math.floor((R-O-o.x)/L)),x=Math.min(b-1,Math.floor((R-o.x)/L));for(let U=W;U<=x;U++)if((r[U].aqi??0)>g)return!1;return!0},I=null;for(let R=o.x+o.w-2;R-O>=o.x;R-=L)if(p(R)){I=R;break}I==null&&(I=o.x+o.w-2,i.fillStyle="rgba(22,33,47,.85)",i.fillRect(I-O,y(g)-15,O+2,13)),i.fillStyle=Q(S,.85),Oe(i,E,I,y(g)-2)}i.restore(),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=de,i.textAlign="center",i.textBaseline="top",i.strokeStyle="rgba(255,255,255,.07)";let H="";r.forEach((g,S)=>{let E=a.fmt.isoDate(g.t);if(E===H)return;H=E;let O=o.x+S*o.w/b;i.beginPath(),i.moveTo(O,o.y),i.lineTo(O,o.y+o.h),i.stroke(),O<o.x+o.w-20&&i.fillText(a.fmt.weekday(g.t).toUpperCase(),O+16,A-f.b+4)}),i.restore();let D=m(Date.now());if(D>o.x&&D<o.x+o.w&&(i.save(),i.strokeStyle=Q(N.good,.85),i.setLineDash([3,3]),i.beginPath(),i.moveTo(D,o.y),i.lineTo(D,o.y+o.h),i.stroke(),i.restore()),ke(i,o.x+2,3,"us aqi \u2014 next 4 days"),d&&d.x>o.x&&d.x<o.x+o.w){let g=K(Math.round((d.x-o.x)/o.w*(b-1)),0,b-1),S=r[g],E=He(S.aqi);i.save(),i.strokeStyle="rgba(255,255,255,.3)",i.beginPath(),i.moveTo(m(S.t),o.y),i.lineTo(m(S.t),o.y+o.h),i.stroke(),i.restore(),Je(i,m(S.t),d.y,[`${a.fmt.weekday(S.t)} ${a.fmt.hm(S.t)}|`,`AQI|${Math.round(S.aqi??0)}`,`CATEGORY|${E.name}`,`PM2.5|${S.pm25?.toFixed(1)??"--"}`,`OZONE|${S.o3?.toFixed(0)??"--"}`],u,A,E.color,{pin:d.coarse})}});function w(i,u,A,d){i.save(),i.font="600 11.5px 'Chakra Petch', sans-serif",i.fillStyle=de,i.textAlign="center",i.textBaseline="middle",i.letterSpacing="1.6px",i.fillText(d.toUpperCase(),u/2,A/2),i.restore()}function C(){let i=a.frame();if(!i)return;let u=i.air||a.airNow,A=u?.aqi,d=He(A);t("a-cat").textContent=d.name,t("a-cat").style.color=d.color,t("a-note").textContent=T(A);let r=null;if(u)for(let v of an){let b=u[v.key];if(b==null)continue;let M=b/v.ref;(!r||M>r.frac)&&(r={...v,value:b,frac:M})}t("a-dl").innerHTML=`
      ${k("Dominant",r?`${r.label} ${r.value.toFixed(1)} ${r.unit}`:"\u2014")}
      ${k("PM2.5",u?.pm25!=null?`${u.pm25.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
      ${k("Ozone",u?.o3!=null?`${u.o3.toFixed(0)} \xB5g/m\xB3`:"\u2014")}
      ${k("Aerosol depth",u?.aod!=null?u.aod.toFixed(3):"\u2014")}
      ${k("Dust",u?.dust!=null?`${u.dust.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
    `,t("a-poll").innerHTML=an.map(v=>{let b=u?.[v.key];if(b==null)return"";let M=K(b/v.ref*100,0,100),L=b>v.who,H=M>100?N.crit:M>66?N.serious:M>33?N.warn:N.good;return`
        <div style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
            <span class="lbl" style="color:var(--dim)">${v.label}</span>
            <span class="num" style="font-size:max(.72rem,var(--fs-floor,0px));color:${H}">${b.toFixed(b<10?1:0)}<span style="color:var(--faint);font-size:max(.85em,var(--fs-floor,0px))"> ${v.unit}</span></span>
          </div>
          <div class="meter" style="--ac:${H};margin:3px 0 2px;position:relative">
            <i style="width:${M}%"></i>
            <span style="position:absolute;left:${K(v.who/v.ref*100,0,100)}%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.5)"></span>
          </div>
          <div style="font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint)">${v.note}${L?' \xB7 <b style="color:'+N.serious+'">above WHO guideline</b>':""}</div>
        </div>`}).join("")||'<div class="nodata">no pollutant data</div>',$();let f=i.uv;t("a-uvnow").textContent=f!=null?`${f.toFixed(1)} \xB7 ${_e(f).name}`:"\u2014";let o=i.day?.uvMax;t("a-burn").innerHTML=f>0||o>0?`
      <div class="lbl" style="margin-bottom:4px">time to burn at today's peak (UV ${(o??f).toFixed(1)})</div>
      <div class="burngrid">
        ${Vn.map((v,b)=>{let M=At(o??f,b+1),L=M==null?De:M<15?N.crit:M<30?N.serious:M<60?N.warn:N.good;return`<div><span class="lbl">${v}</span><b style="color:${L}">${M==null?"\u2014":M+"m"}</b></div>`}).join("")}
      </div>`:'<div class="nodata">no uv exposure right now</div>';let l=Ue(i.dew);t("a-cmf").textContent=l.name;let m=i.feels,y=m!=null&&i.temp!=null?m-i.temp:null;t("a-comfort").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:6px">
        <span class="num" style="font-size:1.7rem;font-weight:700;color:${l.color}">${J.temp(i.dew)}</span>
        <span class="lbl">dew point</span>
      </div>
      <div class="dewstrip">
        ${[[-99,30,"VERY DRY"],[30,45,"DRY"],[45,55,"COMFORTABLE"],[55,60,"STICKY"],[60,65,"HUMID"],[65,70,"OPPRESSIVE"],[70,99,"MISERABLE"]].map(([b,M,L])=>`<i class="${i.dew!=null&&i.dew>=b&&i.dew<M?"on":""}" style="--c:${Ue((b+M)/2).color}" title="${L}"></i>`).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:max(.46rem,var(--fs-floor,0px));color:var(--faint);letter-spacing:.08em;margin-top:2px">
        <span>DRY</span><span>COMFORTABLE</span><span>OPPRESSIVE</span>
      </div>
      <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin:6px 0 8px">${l.note}</div>
      <dl style="margin:0">
        ${k("Air temperature",J.temp(i.temp))}
        ${k("Feels like",`${J.temp(i.feels)}${y!=null&&Math.abs(y)>=1?` (${J.signed(y,0)}\xB0)`:""}`)}
        ${k("Relative humidity",J.pct(i.rh))}
        ${k("Wet bulb",J.temp(i.wetbulb))}
        ${k("Vapour deficit",i.vpd!=null?`${i.vpd.toFixed(2)} kPa`:"\u2014")}
      </dl>
      <div style="font-size:max(.56rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Dew point predicts how the air feels far better than relative humidity,
        which only tells you how close the air is to saturation at its own temperature.
      </div>`,n.render(),s.render(),c.render()}function $(){let i=a.pollen,u=a.fmt;if(!i||i.source==="none"){let r=a.frame()?.air,f=r&&["grass","birch","alder","ragweed","olive","mugwort"].map(o=>[o,r[o]]).filter(([,o])=>o!=null);if(f?.length){t("a-polsrc").textContent="CAMS EUROPE",t("a-pollen").innerHTML=f.map(([o,l])=>`
          <div class="kv"><dt>${o}</dt><dd>${l.toFixed(1)} grains/m\xB3</dd></div>`).join("");return}t("a-polsrc").textContent="NO COVERAGE",t("a-pollen").innerHTML=`<div class="nodata">
        pollen data unavailable here<br><span style="color:var(--faint);text-transform:none;letter-spacing:0">
        ${oe(i?.reason||"no source covers this location")}</span></div>`;return}let A=ht(i.index),d=i.yesterday!=null&&i.index!=null?i.index-i.yesterday:null;t("a-polsrc").textContent=i.source.toUpperCase(),t("a-pollen").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${A.color}">${i.index?.toFixed(1)??"--"}</span>
        <div>
          <div class="chip" style="--ac:${A.color}">${A.name}</div>
          <div style="font-size:max(.54rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">of 12${d!=null?` \xB7 ${J.signed(d,1)} vs yesterday`:""}</div>
        </div>
      </div>
      <div class="meter" style="--ac:${A.color};margin:7px 0 9px"><i style="width:${K(i.index/12*100,0,100)}%"></i></div>
      ${i.triggers?.length?`
        <div class="lbl" style="margin-bottom:4px">today's triggers</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">
          ${i.triggers.map(r=>`<span class="chip" style="--ac:var(--lm)">${oe(r.name)}</span>`).join("")}
        </div>`:""}
      ${i.forecast?.length?`
        <div class="lbl" style="margin-bottom:4px">5-day outlook</div>
        <div class="pollen-fc">
          ${i.forecast.map(r=>{let f=ht(r.index);return`<div>
              <span class="bar" style="height:${K(r.index/12*100,4,100)}%;--c:${f.color}"></span>
              <b>${r.index.toFixed(1)}</b>
              <span>${u.weekday(Date.parse(r.date))}</span>
            </div>`}).join("")}
        </div>`:""}`}function T(i){return i==null?"no measurement available":i<=50?"Air quality is satisfactory. No restrictions.":i<=100?"Acceptable. Unusually sensitive people may want to limit long outdoor exertion.":i<=150?"Sensitive groups \u2014 asthma, heart or lung conditions, children, older adults \u2014 should reduce prolonged exertion.":i<=200?"Everyone may begin to feel effects. Limit prolonged outdoor exertion.":i<=300?"Health alert. Avoid outdoor exertion; keep windows closed.":"Emergency conditions. Remain indoors with filtration if possible."}let k=(i,u)=>`<div class="kv"><dt>${i}</dt><dd>${u}</dd></div>`;return{update:C,onShow(){n.render(),s.render(),c.render()}}}function rn(e){e.className="view dataview",e.innerHTML=`
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
  `;let t=d=>e.querySelector("#"+d),n=d=>vo(d,a.tz);function s(){let d=a.fmt.isoDate(Date.now()),r=a.days.find(f=>a.fmt.isoDate(f.t)===d);return r?r.t:Date.now()-12*36e5}function c(d,r,f,o){d.save(),d.font="600 11.5px 'Chakra Petch', sans-serif",d.fillStyle=de,d.textAlign="center",d.textBaseline="middle",d.letterSpacing="1.6px",d.fillText(o.toUpperCase()+" \u2026",r/2,f/2),d.restore()}let w=ue(t("d2-clim"),(d,r,f,o)=>{if(!a.climate){c(d,r,f,"loading 30-year archive");return}Bo(d,r,f,o,{days:a.days.filter(l=>l.t>=s()),climate:a.climate,tf:a.fmt,doyOf:n})}),C=ue(t("d2-spread"),(d,r,f,o)=>{if(!a.models){c(d,r,f,"loading model ensemble");return}Fo(d,r,f,o,{rows:a.models.rows,tf:a.fmt,now:Date.now()})}),$=ue(t("d2-meteo"),(d,r,f,o)=>{Ht(d,r,f,o,{hours:a.hours,days:a.days,tf:a.fmt,span:{lo:a.cursor-24*36e5,hi:a.cursor+96*36e5},cursor:a.cursor,now:Date.now(),panels:["pressure","cloud","uv","cape"]})},{onPick:({x:d,w:r})=>{let f=a.cursor-864e5,o=a.cursor+96*36e5;a.playing=!1,a.scrubTo(f+(d-4)/(r-34)*(o-f))}}),T=ue(t("d2-trend"),(d,r,f,o)=>{let l=a.climate?.annual;if(!l?.length){c(d,r,f,"loading climate record");return}let m={l:4,r:34,t:16,b:18},y={x:m.l,y:m.t,w:r-m.l-m.r,h:f-m.t-m.b};if(y.w<40||y.h<30)return;let v=l.map(j=>j.mean),b=Math.min(...v)-.4,M=Math.max(...v)+.4,L=j=>y.y+y.h-(j-b)/(M-b)*y.h,H=ze(b,M,Be(y.h,3)),D=j=>`${j.toFixed(1)}\xB0`;d.save(),d.font=$e;let g=Math.max(...H.map(j=>d.measureText(D(j)).width))+8;d.restore();let S=Math.max(20,y.w-g),E=Math.max(2,S/l.length-2),O=j=>y.x+E/2+j/(l.length-1)*(S-E);Ce(d,y,H.map(j=>({v:j,y:L(j)})),D);let p=v.reduce((j,ie)=>j+ie,0)/v.length;l.forEach((j,ie)=>{let h=j.mean-p,P=h>=0?qe("#8d9aab","#f2b45a",K(Math.abs(h)/1.6,0,1)):qe("#8d9aab","#7fb2f0",K(Math.abs(h)/1.6,0,1)),G=L(p),F=L(j.mean);d.fillStyle=Q(P,.9),d.fillRect(O(ie)-E/2,Math.min(G,F),E,Math.max(1.5,Math.abs(F-G)))});let I=l.length,R=l.reduce((j,ie)=>j+ie.year,0)/I,W=p,x=0,U=0;for(let j of l)x+=(j.year-R)*(j.mean-W),U+=(j.year-R)**2;let q=U?x/U:0,B=l.map((j,ie)=>[O(ie),L(W+q*(j.year-R))]);d.save(),d.setLineDash([5,3]),Ae(d,B,q>=0?"#f2b45a":"#7fb2f0",{width:2,glow:10}),d.restore(),d.save(),d.font="500 11.5px 'JetBrains Mono', monospace",d.fillStyle=de,d.textAlign="center",d.textBaseline="top";let _=5*Dt(Math.ceil(l.length/5),S,d.measureText("2020").width);l.forEach((j,ie)=>{j.year%_||Pe(d,String(j.year),O(ie),f-m.b+4,0,r)}),d.restore(),d.save(),d.font="600 11.5px 'Chakra Petch', sans-serif",d.letterSpacing="1.2px";let X=`TREND ${q>=0?"+":"\u2212"}${Math.abs(q*10).toFixed(2)}\xB0F / DECADE`,ne=d.measureText(X).width;d.fillStyle=q>=0?"#f2b45a":"#7fb2f0",d.textAlign="right",d.textBaseline="top",d.fillText(X,y.x+y.w,3),d.restore(),d.save(),d.font=Ie,d.letterSpacing="1.4px";let V="annual mean temperature \xB0F",fe="annual mean \xB0F",we=j=>d.measureText(j.toUpperCase()).width,Se=we(V)+ne+14<=y.w?V:we(fe)+ne+14<=y.w?fe:null;if(d.restore(),Se&&ke(d,y.x+2,3,Se),o&&o.x>y.x&&o.x<y.x+S){let j=K(Math.round((o.x-y.x-E/2)/(S-E)*(l.length-1)),0,l.length-1),ie=l[j];d.save(),d.fillStyle="rgba(22,33,47,.94)",d.strokeStyle=Q(Y[0],.5);let h=`${ie.year}  ${ie.mean.toFixed(2)}\xB0F  ${ie.mean-p>=0?"+":"\u2212"}${Math.abs(ie.mean-p).toFixed(2)} vs period mean`;d.font="500 11.5px 'JetBrains Mono', monospace";let P=d.measureText(h).width+14,G=K(O(j)-P/2,4,Math.max(4,r-P-4)),F=o.coarse&&o.y<f/2?y.y+y.h-20:y.y+2;d.beginPath(),d.rect(G,F,P,18),d.fill(),d.stroke(),d.fillStyle=Ee,d.textAlign="left",d.textBaseline="middle",d.fillText(h,G+7,F+9),d.restore()}});function k(){let d=a.fmt,r=a.climate,f=a.dayFor(a.cursor),o=r?.doy?.[n(a.cursor)];if(t("d2-yrs").textContent=r?`${r.years} YEARS \xB7 ${r.start.slice(0,4)}\u2013${r.end.slice(0,4)}`:"\u2014",o&&f){let S=f.tmax-o.normalHigh,E=f.tmin-(o.normalLow??f.tmin),O=K((f.tmax-o.normalHigh)/Math.max(.1,o.recordHigh-o.normalHigh)*100,0,100);t("d2-rec").innerHTML=`
        <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin-bottom:7px">
          ${d.weekday(a.cursor)} ${d.monthDay(a.cursor)} \xB7 forecast against every
          ${d.monthDay(a.cursor)} since ${r.start.slice(0,4)}
        </div>
        <dl style="margin:0">
          ${A("Forecast high",J.temp(f.tmax),S>=0?"#f2b45a":"#7fb2f0")}
          ${u("Normal high",`${J.temp(o.normalHigh)}  (${J.signed(S)}\xB0)`)}
          ${A("Record high",`${J.temp(o.recordHigh)} in ${o.recordHighYear}`,f.tmax>=o.recordHigh?N.crit:De)}
          ${u("Forecast low",J.temp(f.tmin))}
          ${u("Normal low",`${J.temp(o.normalLow)}  (${J.signed(E)}\xB0)`)}
          ${A("Record low",`${J.temp(o.recordLow)} in ${o.recordLowYear}`,f.tmin<=o.recordLow?Y[4]:De)}
        </dl>
        <div class="lbl" style="margin:9px 0 3px">high, normal \u2192 record</div>
        <div class="meter" style="--ac:${O>85?N.crit:N.serious}">
          <i style="width:${O}%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">
          <span>${J.temp(o.normalHigh)} normal</span><span>${J.temp(o.recordHigh)} record</span>
        </div>
        <dl style="margin:9px 0 0">
          ${u("Historically wet",`${Math.round(o.wetFrac*100)}% of years`)}
          ${u("Mean precip",`${o.meanPrecip.toFixed(3)} in`)}
          ${u("Forecast precip",`${(f.precip??0).toFixed(2)} in`)}
        </dl>`}else t("d2-rec").innerHTML='<div class="nodata">climate archive loading\u2026</div>';let l=Date.now(),m=a.hours.filter(S=>S.t<=l&&S.t>=l-720*36e5),y=0,v=0,b=0;for(let S of a.days){if(S.tmax==null||S.tmin==null)continue;let E=(S.tmax+S.tmin)/2;S.t>l||(y+=Math.max(0,65-E),v+=Math.max(0,E-65),b+=Math.max(0,Math.min(E,86)-50))}let M=a.models?.rows?.find(S=>S.t>=l),L=M?M.spread<2?["HIGH",N.good]:M.spread<5?["MODERATE",N.warn]:M.spread<9?["LOW",N.serious]:["VERY LOW",N.crit]:null,H=a.models?.rows?.find(S=>S.t>=l+168*36e5),D=a.days.filter(S=>S.t>l).reduce((S,E)=>S+(E.precip??0),0),g=a.days.filter(S=>S.t>l&&(S.precip??0)>=.01).length;t("d2-derived").innerHTML=`
      <dl style="margin:0">
        ${u("Pressure now",`${J.pressure(a.frame()?.pressure)} inHg`)}
        ${u("3h tendency",i())}
        ${L?A("Forecast confidence",`${L[0]} \xB7 \xB1${(M.spread/2).toFixed(1)}\xB0`,L[1]):""}
        ${H?u("Day-7 model spread",`${H.spread.toFixed(1)}\xB0`):""}
        ${u("16-day precip total",`${D.toFixed(2)} in`)}
        ${u("Wet days ahead",`${g} of ${a.days.filter(S=>S.t>l).length}`)}
      </dl>
      <div class="lbl" style="margin:9px 0 3px">degree days, window shown</div>
      <dl style="margin:0">
        ${u("Heating (base 65\xB0F)",Math.round(y))}
        ${u("Cooling (base 65\xB0F)",Math.round(v))}
        ${u("Growing (50/86\xB0F)",Math.round(b))}
      </dl>
      <div style="font-size:max(.55rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Degree days accumulate how far each day's mean sits from a base
        temperature \u2014 the standard proxy for heating load, cooling load and
        crop development.
      </div>`,w.render(),C.render(),T.render(),$.render()}function i(){let d=a.cursor,r=a.hours.find(m=>m.t>=d-3*36e5),f=a.hours.find(m=>m.t>=d);if(!r?.pressure||!f?.pressure)return"\u2014";let o=(f.pressure-r.pressure)*.029529983,l=Math.abs(o)<.02?"steady":Math.abs(o)<.06?"slow":Math.abs(o)<.12?"moderate":"rapid";return`${J.signed(o,3)} inHg \xB7 ${o>0?"rising":o<0?"falling":""} ${l}`.trim()}let u=(d,r)=>`<div class="kv"><dt>${d}</dt><dd>${r}</dd></div>`,A=(d,r,f)=>`<div class="kv"><dt>${d}</dt><dd style="color:${f}">${r}</dd></div>`;return{update:k,onShow(){w.render(),C.render(),T.render(),$.render()}}}var Xe=null,Kn=()=>Xe?Promise.resolve(Xe):import("./sats.3HHD6MIE.js").then(e=>Xe=e),ln=1852,jn=1e4,cn=24,dn="atmos.sats.v1",Yn=5e3,un=2,fn=(e,t)=>t?de:qe("#f07aa6","#3fd0d8",K((e??0)/38e3,0,1));function hn(e){e.className="view overheadview",e.innerHTML=`
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
  `;let t=h=>e.querySelector("#"+h),n=[],s=0,c=null,w=!1,C=!1,$=null,T=null,k=null,i=null,u=!1,A=Object.fromEntries(xe.map(h=>[h.key,h.on]));try{let h=JSON.parse(localStorage.getItem(dn)||"null");if(h&&typeof h=="object")for(let P of xe)typeof h[P.key]=="boolean"&&(A[P.key]=h[P.key])}catch{}let d={},r=[],f=null,o=0,l=null,m=[],y=()=>a.loc||{lat:0,lon:0},v=new rt(t("o-map"),{center:[y().lat,y().lon],zoom:9,minZoom:5,maxZoom:12,onTap:h=>b(h)});v.layers=[{name:"base",url:(h,P,G)=>`${lt}/World_Dark_Gray_Base/MapServer/tile/${h}/${G}/${P}`,filter:Vt,opacity:1},{name:"labels",url:(h,P,G)=>`${lt}/World_Dark_Gray_Reference/MapServer/tile/${h}/${G}/${P}`,filter:Kt,opacity:.85}],v.overlays.push((h,P)=>{let G=y(),[F,z]=P.project(G.lat,G.lon),Z=156543.03392*Math.cos(P.lat*Math.PI/180)/Math.pow(2,P.zoom);h.save(),h.strokeStyle="rgba(63,208,216,.13)",h.setLineDash([2,4]),h.lineWidth=1,h.font="500 11.5px 'JetBrains Mono', monospace",h.fillStyle=Y[0],h.textAlign="center",h.textBaseline="middle";let ae=[0,-35,35,-70,70,-110,110,180];for(let ee of[10,20,40]){let te=ee*ln/Z;if(te<24||te>Math.max(P.w,P.h))continue;h.beginPath(),h.arc(F,z,te,0,Math.PI*2),h.stroke();let re=`${ee} NM`,be=h.measureText(re).width+4,me=F,Ze=z-te-8,ut=1/0;for(let ft of ae){let ho=ft*Math.PI/180,po=F+te*Math.sin(ho),mo=ft?z-te*Math.cos(ho):z-te-8,go=P.inkIn("labels",po-be/2-3,mo-10,be+6,20);go<ut-.02&&(ut=go,me=po,Ze=mo)}Oe(h,re,me,Ze)}h.restore();for(let ee of u?[]:n){let[te,re]=P.project(ee.lat,ee.lon);if(te<-20||re<-20||te>P.w+20||re>P.h+20)continue;let be=ee.hex===$,me=fn(ee.alt,ee.gnd);if(be){let Ze=(ee.gs??0)/60;if(Ze>.1&&ee.trk!=null){let ut=Ze*ln/Z,ft=(ee.trk-90)*Math.PI/180;h.save(),h.strokeStyle=Q(me,.6),h.setLineDash([3,3]),h.lineWidth=1.2,h.beginPath(),h.moveTo(te,re),h.lineTo(te+Math.cos(ft)*ut,re+Math.sin(ft)*ut),h.stroke(),h.restore()}h.save(),h.strokeStyle=me,h.lineWidth=1.5,h.shadowColor=me,h.shadowBlur=5,h.beginPath(),h.arc(te,re,13,0,Math.PI*2),h.stroke(),h.restore()}if(h.save(),h.translate(te,re),h.rotate((ee.trk??0)*Math.PI/180),h.fillStyle=me,be&&(h.shadowColor=me,h.shadowBlur=4),h.beginPath(),h.moveTo(0,-6.5),h.lineTo(4.5,5),h.lineTo(0,2.4),h.lineTo(-4.5,5),h.closePath(),h.fill(),h.restore(),be&&ee.cs){h.save(),h.font="600 11.5px 'Chakra Petch', sans-serif",h.letterSpacing="1.2px",h.textAlign="left",h.textBaseline="middle";let Ze=h.measureText(ee.cs).width+10;h.fillStyle="rgba(22,33,47,.88)",h.fillRect(te+16,re-7,Ze,14),h.fillStyle=me,h.fillText(ee.cs,te+21,re),h.restore()}}u&&_(h,P),a.loc&&jt(h,F,z,"#f07aa6",null),Yt(h,P,12,P.h-12)});function b(h){if(u){let F=null,z=cn;for(let Z of r){let[ae,ee]=v.project(Z.p.lat,Z.p.lon),te=Math.hypot(ae-h.x,ee-h.y);te<z&&(z=te,F=Z)}X(F?F.sat.id:null);return}let P=null,G=cn;for(let F of n){let[z,Z]=v.project(F.lat,F.lon),ae=Math.hypot(z-h.x,Z-h.y);ae<G&&(G=ae,P=F)}M(P?P.hex:null)}function M(h){if($===h||($=h,T=null,g(),v.invalidate(),!h))return;let P=n.find(G=>G.hex===h);P&&ye.flight(P.cs||"",P.hex||"").then(G=>{$===h&&(T=G,g())}).catch(()=>{})}let L=(h,P)=>`<div class="kv"><dt>${h}</dt><dd>${P}</dd></div>`,H=h=>h==null?"\u2014":`${Math.round(h).toLocaleString()} ft`;function D(h,P){let G=y(),F=Math.PI/180,z=(P-G.lon)*F,Z=Math.sin(z)*Math.cos(h*F),ae=Math.cos(G.lat*F)*Math.sin(h*F)-Math.sin(G.lat*F)*Math.cos(h*F)*Math.cos(z);return(Ne(Math.atan2(Z,ae))+360)%360}function g(){if(u){V();return}let h=n.find(ee=>ee.hex===$);if(!h){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap an aircraft on the map, or a row in NEAREST.</p>';return}t("o-cs").textContent=h.cs||h.reg||h.hex.toUpperCase();let P=h.vs==null||Math.abs(h.vs)<100?"level":h.vs>0?`climbing ${Math.round(h.vs).toLocaleString()} ft/min`:`descending ${Math.abs(Math.round(h.vs)).toLocaleString()} ft/min`,G=D(h.lat,h.lon),F=[],z=T;z?.airline?F.push(L("Operator",oe(z.airline))):z?.aircraft?.owner&&F.push(L("Operator",oe(z.aircraft.owner)));let Z=z?.aircraft?.manufacturer&&z?.aircraft?.type?`${z.aircraft.manufacturer} ${z.aircraft.type}`:h.type;if(Z&&F.push(L("Aircraft",oe(Z))),h.reg&&F.push(L("Registration",oe(h.reg))),z?.origin||z?.destination){let ee=te=>te?`${oe(te.iata||"??")} <span class="dim">${oe(te.city||"")}</span>`:"\u2014";F.push(L("From",ee(z.origin))),F.push(L("To",ee(z.destination)))}F.push(L("Altitude",h.gnd?"on the ground":H(h.alt))),F.push(L("Motion",`${h.gs==null?"\u2014":`${Math.round(h.gs)} kt`} \xB7 ${P}`)),F.push(L("Heading",h.trk==null?"\u2014":`${Math.round(h.trk)}\xB0 ${ge(h.trk)}`)),F.push(L("From you",`${(h.dst??0).toFixed(1)} nm ${ge(G)}`));let ae=z&&!z.origin&&h.cs?'<p class="hint">No published route \u2014 usually private or general aviation.</p>':z?.origin?'<p class="hint">Route is by callsign, which airlines reuse day to day.</p>':"";t("o-sel").innerHTML=F.join("")+ae}function S(){if(u){fe();return}t("o-neartitle").textContent="NEAREST";let h=n.filter(P=>!P.gnd).slice(0,8);if(t("o-src").textContent=w?c?c.toUpperCase():"NO FEED":"\u2014",!h.length){t("o-near").innerHTML=w?C?'<p class="hint">The aircraft feeds are not answering. Trying again shortly.</p>':'<p class="hint">Nothing in the air within range.</p>':'<p class="hint">Looking for aircraft\u2026</p>';return}t("o-near").innerHTML='<div class="oh-head"><span>callsign</span><span>type</span><span>range</span><span>alt</span></div>'+h.map(P=>`
      <button class="oh-row" data-hex="${oe(P.hex)}" aria-pressed="${P.hex===$}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${fn(P.alt,P.gnd)} 80%, var(--ink))">${oe(P.cs||P.reg||P.hex)}</span>
        <span class="oh-t">${oe(P.type||"")}</span>
        <span class="oh-d">${(P.dst??0).toFixed(1)} nm</span>
        <span class="oh-a">${P.alt==null?"\u2014":`${(P.alt/1e3).toFixed(1)}k`}</span>
      </button>`).join("");for(let P of t("o-near").querySelectorAll(".oh-row"))P.addEventListener("click",()=>{M(P.dataset.hex),S()})}function E(){let h=y(),P=new Date(a.cursor),G=mt(P,h.lat,h.lon),F=vt(P,h.lat,h.lon),z=(ee,te,re,be)=>{let me=te>0;return`<div class="kv"><dt style="color:${be}">${ee}</dt><dd>${me?`${te.toFixed(0)}\xB0 up, ${ge(re)}`:'<span class="dim">below the horizon</span>'}</dd></div>`},Z=[z("Sun",Ne(G.altitude),ot(G.azimuth),"#f2b45a"),z("Moon",Ne(F.altitude),ot(F.azimuth),"#7fb2f0")];Z.push(k&&k.alt>0?z("ISS",k.alt,k.az,"#8fdc6a"):`<div class="kv"><dt style="color:#8fdc6a">ISS</dt><dd><span class="dim">${k?`below the horizon, ${k.range.toLocaleString()} km away`:"no fix"}</span></dd></div>`);let ae=Math.abs(a.cursor-Date.now());t("o-lookwhen").textContent=ae<6*6e4?"NOW":`${a.fmt.weekday(a.cursor)} ${a.fmt.hm(a.cursor)}`,t("o-sky").innerHTML=Z.join("")+'<p class="hint">Aircraft positions from adsb.lol under ODbL; routes and airframes from adsbdb. Both are run by volunteers.</p>'}function O(){if(u){we();return}let h=n.filter(G=>!G.gnd).length;t("o-count").textContent=w?C?"AIRCRAFT FEEDS NOT ANSWERING":`${h} AIRCRAFT`:"\u2014";let P=s?Math.round((Date.now()-s)/1e3):null;t("o-age").textContent=P==null?"\u2014":P<20?"LIVE":`${P}s AGO`}async function p(){if(!(u||a.view!=="overhead"||!a.loc))try{let h=await ye.aircraft(a.loc.lat,a.loc.lon,60);n=h.aircraft||[],s=h.at||Date.now(),c=h.source,C=h.source==null,w=!0,$&&!n.some(P=>P.hex===$)&&M(null),O(),S(),g(),v.invalidate()}catch{}}async function I(){if(!(a.view!=="overhead"||!a.loc))try{let h=await ye.iss();if(h.pos?.ok){let P=h.pos.data;k=gt(a.loc.lat,a.loc.lon,P.latitude,P.longitude,P.altitude),E()}}catch{}}let R=h=>xe.find(P=>P.key===h),W=h=>`${h.lat.toFixed(1)},${h.lon.toFixed(1)}`,x=h=>h<1?`${Math.max(1,Math.round(h*60))} min`:h<48?`${Math.round(h)} h`:`${Math.round(h/24)} days`;async function U(h){let P=d[h.key];if(!(P&&(P.state==="ok"||P.state==="loading"))){d[h.key]={state:"loading",sats:[],fetched:null};try{await Kn();let G=new Map,F=1/0;for(let z of h.groups){let Z=await fetch(new URL(`/sats/${z}.json`,location.origin));if(!Z.ok)throw new Error(`${z} -> ${Z.status}`);let ae=await Z.json(),ee=Date.parse(ae.fetched);Number.isFinite(ee)&&(F=Math.min(F,ee));for(let te of Xe.prepare(ae.records,h.key))G.set(te.id,te)}if(!G.size)throw new Error("empty");d[h.key]={state:"ok",sats:[...G.values()],fetched:Number.isFinite(F)?F:null}}catch{d[h.key]={state:"fail",sats:[],fetched:null}}B(!0),Se(),S(),g(),O(),v.invalidate()}}let q={};function B(h){if(!u)return;let P=a.cursor,G=y(),F=[];for(let Z of xe){let ae=d[Z.key];if(!A[Z.key]||!ae||ae.state!=="ok")continue;let ee=q[Z.key],te=Z.key==="starlink";if(!h&&te&&ee&&Math.abs(P-ee.at)<Yn){F.push(...ee.list);continue}let re=[];for(let be of ae.sats){let me=Xe.positionAt(be,P);me&&re.push({sat:be,p:me,cat:Z,look:gt(G.lat,G.lon,me.lat,me.lon,me.altKm)})}q[Z.key]={at:P,list:re},F.push(...re)}r=F;let z=r.find(Z=>Z.sat.id===f);m=z?Xe.groundTrack(z.sat,P,90,60):[]}function _(h,P){let G=256*Math.pow(2,P.zoom),F=r.find(z=>z.sat.id===f);for(let z of[-G,0,G]){if(F&&m.length){h.save(),h.strokeStyle=Q(F.cat.colour,.7),h.setLineDash([4,4]),h.lineWidth=1.4;for(let Z of m)h.beginPath(),Z.forEach(([ae,ee],te)=>{let[re,be]=P.project(ae,ee);te?h.lineTo(re+z,be):h.moveTo(re+z,be)}),h.stroke();h.restore()}for(let Z of r){let[ae,ee]=P.project(Z.p.lat,Z.p.lon),te=ae+z;if(te<-6||ee<-6||te>P.w+6||ee>P.h+6)continue;let re=Z.cat.key==="starlink";h.fillStyle=Z.cat.colour,h.beginPath(),h.arc(te,ee,re?1.7:3.2,0,Math.PI*2),h.fill()}if(F){let[Z,ae]=P.project(F.p.lat,F.p.lon),ee=Z+z;if(ee<-40||ae<-20||ee>P.w+40||ae>P.h+20)continue;h.save(),h.strokeStyle=F.cat.colour,h.lineWidth=1.5,h.shadowColor=F.cat.colour,h.shadowBlur=5,h.beginPath(),h.arc(ee,ae,10,0,Math.PI*2),h.stroke(),h.restore(),h.save(),h.font="600 11.5px 'Chakra Petch', sans-serif",h.letterSpacing="1.2px",h.textAlign="left",h.textBaseline="middle";let te=h.measureText(F.sat.name).width+10;h.fillStyle="rgba(22,33,47,.88)",h.fillRect(ee+14,ae-7,te,14),h.fillStyle=F.cat.colour,h.fillText(F.sat.name,ee+19,ae),h.restore()}}}function X(h){f!==h&&(f=h,B(!1),g(),S(),v.invalidate())}let ne=h=>r.filter(P=>W(P.p)===W(h.p)&&P.sat.id!==h.sat.id);function V(){let h=r.find(re=>re.sat.id===f);if(!h){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap a dot on the map, or a row in ABOVE YOU.</p>';return}let{sat:P,p:G,look:F,cat:z}=h;t("o-cs").textContent=P.name;let Z=[L("Kind",oe(Pt(P.name))),L("Group",oe(z.label)),L("NORAD ID",String(P.id))];P.intl&&Z.push(L("Launch",oe(P.intl))),Z.push(L("Altitude",`${Math.round(G.altKm).toLocaleString()} km`)),Z.push(L("Over",`${Math.abs(G.lat).toFixed(1)}\xB0${G.lat<0?"S":"N"} ${Math.abs(G.lon).toFixed(1)}\xB0${G.lon<0?"W":"E"}`)),Z.push(L("From you",F.alt>0?`${F.alt.toFixed(0)}\xB0 up, ${ge(F.az)}`:`<span class="dim">below the horizon, ${F.range.toLocaleString()} km away</span>`));let ae=Xe.elementAgeHours(P,a.cursor);Z.push(L("Elements",`${ae<0?"newer than":""} ${x(Math.abs(ae))} ${ae<0?"ahead":"old"}`.trim()));let ee=ne(h),te=ee.length?`<p class="hint">Same orbit data, so same position: ${ee.slice(0,6).map(re=>oe(re.sat.name)).join(", ")}${ee.length>6?` and ${ee.length-6} more`:""}. Docked craft share the station's elements.</p>`:"";t("o-sel").innerHTML=Z.join("")+te+'<p class="hint">Dashed line: next 90 minutes of ground track. Kind is read from the catalogue name.</p>'}function fe(){t("o-neartitle").textContent="ABOVE YOU",t("o-src").textContent="CELESTRAK";let h=new Set,P=r.filter(z=>z.look.alt>0).sort((z,Z)=>Z.look.alt-z.look.alt),G=[];for(let z of P){let Z=W(z.p);if(!h.has(Z)&&(h.add(Z),G.push({q:z,extra:ne(z).length}),G.length>=8))break}let F=xe.some(z=>A[z.key]&&d[z.key]?.state==="ok");if(!G.length){t("o-near").innerHTML=`<p class="hint">${F?"Nothing in the chosen groups is above your horizon right now.":"Switch on a group above to see what is overhead."}</p>`;return}t("o-near").innerHTML='<div class="oh-head"><span>name</span><span>type</span><span>up</span><span>dir</span></div>'+G.map(({q:z,extra:Z})=>`
      <button class="oh-row" data-sat="${z.sat.id}" aria-pressed="${z.sat.id===f}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${z.cat.colour} 80%, var(--ink))">${oe(z.sat.name)}${Z?` +${Z}`:""}</span>
        <span class="oh-t">${Pt(z.sat.name)==="satellite"?"":oe(Pt(z.sat.name))}</span>
        <span class="oh-d">${z.look.alt.toFixed(0)}\xB0</span>
        <span class="oh-a">${ge(z.look.az)}</span>
      </button>`).join("");for(let z of t("o-near").querySelectorAll(".oh-row"))z.addEventListener("click",()=>X(Number(z.dataset.sat)))}function we(){let h=xe.filter(G=>A[G.key]&&d[G.key]?.state==="ok");t("o-count").textContent=`${r.length.toLocaleString()} SATELLITES`;let P=h.map(G=>d[G.key].fetched).filter(Boolean);t("o-age").textContent=P.length?`ELEMENTS ${x((Date.now()-Math.min(...P))/36e5).toUpperCase()} OLD`:"\u2014"}function Se(){let h=xe.some(F=>A[F.key]&&d[F.key]?.state==="loading"),P=xe.some(F=>A[F.key]&&d[F.key]?.state==="fail");t("o-satstate").textContent=u?h?"LOADING":P?"NO DATA":`${r.length.toLocaleString()} SHOWN`:"OFF";let G=F=>{let z=d[F.key],Z=!u||!A[F.key]?"":z?.state==="loading"?" \u2026":z?.state==="fail"?" \u2715":z?.state==="ok"?` ${z.sats.length.toLocaleString()}`:"";return`<button class="oh-chip" data-cat="${F.key}" aria-pressed="${!!A[F.key]}" style="--chip:${F.colour}">${oe(F.label)}${Z}</button>`};t("o-satui").innerHTML=`
      <button class="oh-chip oh-mode" data-mode="1" aria-pressed="${u}">${u?"Back to aircraft":"Show satellites on map"}</button>
      <div class="oh-chips">${xe.map(G).join("")}</div>
      ${P?'<p class="hint">Satellite elements are not available here. They are published to branyontech.com every two hours.</p>':""}
      ${u&&A.starlink?'<p class="hint">Starlink is thousands of objects: a large download, loaded only when on.</p>':""}
      ${u?'<p class="hint">Elements: CelesTrak. Positions computed here (SGP4).</p>':""}`}function j(){try{localStorage.setItem(dn,JSON.stringify(A))}catch{}}function ie(h){if(u!==h){if(u=h,clearInterval(l),l=null,h){M(null),v.minZoom=1;let P=y();v.setView(K(P.lat*.5,-40,40),P.lon,un);for(let G of xe)A[G.key]&&U(G);a.view==="overhead"&&(l=setInterval(()=>{B(!1),we(),S(),v.invalidate()},1e3)),B(!0)}else f=null,m=[],r=[],v.minZoom=5,v.setView(y().lat,y().lon,9),p();Se(),g(),S(),O(),v.invalidate()}}return t("o-satui").addEventListener("click",h=>{let P=h.target.closest("button");if(!P)return;if(P.dataset.mode){ie(!u);return}let G=R(P.dataset.cat);G&&(A[G.key]=!A[G.key],j(),u&&A[G.key]&&U(G),B(!0),f!=null&&!r.some(F=>F.sat.id===f)&&(f=null),Se(),g(),S(),O(),v.invalidate())}),t("o-center").addEventListener("click",()=>{a.loc&&(u?v.setView(K(a.loc.lat*.5,-40,40),a.loc.lon,un):v.setView(a.loc.lat,a.loc.lon,9))}),t("o-zin").addEventListener("click",()=>v.setView(v.lat,v.lon,v.zoom+1)),t("o-zout").addEventListener("click",()=>v.setView(v.lat,v.lon,v.zoom-1)),a.on("loc",()=>{if(a.loc){if(u){B(!0),S(),v.invalidate(),I();return}v.setView(a.loc.lat,a.loc.lon,9),p(),I()}}),g(),E(),Se(),S(),a.on("cursor",()=>{a.view==="overhead"&&(E(),u&&(B(!1),g(),S(),v.invalidate()))}),{map:v,update(){E(),v.invalidate()},onShow(){v.resize(),p(),I(),clearInterval(i),i=setInterval(()=>{p(),O()},jn),u&&!l&&(l=setInterval(()=>{B(!1),we(),S(),v.invalidate()},1e3))},onHide(){clearInterval(i),i=null,clearInterval(l),l=null}}}var ce=null,We=null,Zt=!1,Le=null,Zn=0,kt=1/0;function pn(e,t=4){let n=e.createBuffer(1,e.sampleRate*t,e.sampleRate),s=n.getChannelData(0);for(let c=0;c<s.length;c++)s[c]=Math.random()*2-1;return n}function io(e,t,{type:n,freq:s,q:c,gain:w}){let C=e.createBufferSource();C.buffer=pn(e),C.loop=!0;let $=e.createBiquadFilter();$.type=n,$.frequency.value=s,$.Q.value=c;let T=e.createGain();return T.gain.value=w,C.connect($).connect(T).connect(t),C.start(),{src:C,filt:$,gain:T}}function mn(){if(ce)return;let e=window.AudioContext||window.webkitAudioContext;if(!e)return;ce=new e,We=ce.createGain(),We.gain.value=0;let t=ce.createDynamicsCompressor();t.threshold.value=-18,t.ratio.value=6,t.attack.value=.004,t.release.value=.25,We.connect(t).connect(ce.destination);let n=io(ce,We,{type:"bandpass",freq:1400,q:.7,gain:0}),s=io(ce,We,{type:"highpass",freq:4200,q:.5,gain:0}),c=io(ce,We,{type:"bandpass",freq:420,q:1.6,gain:0}),w=ce.createOscillator(),C=ce.createGain();w.frequency.value=.07,C.gain.value=180,w.connect(C).connect(c.filt.frequency),w.start();let $=ce.createGain();$.gain.value=0;let T=ce.createBiquadFilter();T.type="lowpass",T.frequency.value=480,T.Q.value=.6,T.connect($).connect(We);let k=[0,3.5].map(i=>{let u=ce.createOscillator();u.type="sawtooth",u.frequency.value=55,u.detune.value=i;let A=ce.createGain();return A.gain.value=.22,u.connect(A).connect(T),u.start(),u});Le={rain:n,patter:s,wind:c,drone:{oscs:k,gain:$,filt:T},lfo:w,lfoGain:C}}function et(){return Zt}function gn(e){Zt=e,ce&&(e&&ce.state==="suspended"&&ce.resume(),je(We.gain,e?.5:0,e?1.2:.6))}var je=(e,t,n=.6)=>{let s=ce.currentTime;e.cancelScheduledValues(s),e.setValueAtTime(e.value,s),e.linearRampToValueAtTime(t,s+n)};function Jn(e=.5){if(!ce||!Zt)return;let t=ce.currentTime,n=ce.createBufferSource();n.buffer=pn(ce,3);let s=ce.createBiquadFilter();s.type="lowpass",s.frequency.setValueAtTime(700-e*480,t),s.Q.value=.5;let c=ce.createGain(),w=.55*(1-e*.65);c.gain.setValueAtTime(1e-4,t),c.gain.exponentialRampToValueAtTime(Math.max(.02,w),t+.04+e*.3),c.gain.exponentialRampToValueAtTime(1e-4,t+1.6+e*2.4),n.connect(s).connect(c).connect(We),n.start(t),n.stop(t+4.2)}function vn(e){if(!ce||!Zt||!Le)return;let t=e.frame();if(!t)return;let n=t.wx.kind,s=Math.min(1,Math.max((t.precip??0)/.1,n==="rain"||n==="storm"?t.wx.intensity*.5:0)),c=Math.min(1,(t.wind??0)/32),w=Math.min(1,((t.gust??t.wind??0)-(t.wind??0))/18);je(Le.rain.gain.gain,s*.3,.9),je(Le.rain.filt.frequency,900+s*1500,.9),je(Le.patter.gain.gain,s*s*.1,.9),je(Le.wind.gain.gain,c*.24,1.1),je(Le.wind.filt.Q,1.2+w*2.5,1.1),Le.lfo.frequency.value=.05+w*.22,Le.lfoGain.gain.value=120+w*420;let C=t.temp??60,$=44+Math.max(0,Math.min(1,(C-20)/80))*26;for(let i of Le.drone.oscs)i.frequency.setTargetAtTime($,ce.currentTime,1.5);je(Le.drone.gain.gain,.055+(t.sun.altDeg>0?.02:.05),2),je(Le.drone.filt.frequency,300+Math.max(0,t.sun.altDeg)*9,2);let T=n==="storm"?.9:Math.min(.6,(t.cape??0)/2500),k=performance.now();T>.15?(kt===1/0&&(kt=k+Math.random()*6e3),k>kt&&(Jn(Math.random()*(1-T*.6)),kt=k+3e3+Math.random()*22e3*(1.1-T))):kt=1/0,Zn=T}function Qn(e){let t=e.fmt,n=e.frame(Date.now());if(!n)return[];let s=[],c=n.day,w=Date.now();s.push({tone:"lead",text:`${t.full(w)}. It is ${J.temp(n.temp)} and ${n.wx.long.toLowerCase()} in ${e.loc.name}`+(Math.abs((n.feels??n.temp)-n.temp)>=3?`, feeling like ${J.temp(n.feels)}`:"")+"."});for(let f of e.alerts.slice(0,3))s.push({tone:"alert",text:`${f.event} in effect until ${t.weekday(f.expires)} ${t.hm12(f.expires)}.`+(f.instruction?` ${Xn(f.instruction)}`:"")});if(c){let f=e.climate?.doy?.[ea(e,w)],o=`Today runs ${J.temp(c.tmin)} to ${J.temp(c.tmax)}`;if(f){let l=c.tmax-f.normalHigh;Math.abs(l)>=3?o+=`, ${Math.abs(l).toFixed(0)}\xB0 ${l>0?"above":"below"} the normal high of ${J.temp(f.normalHigh)}`:o+=", right about normal",c.tmax>=f.recordHigh&&(o+=`. That would tie or beat the record of ${J.temp(f.recordHigh)} set in ${f.recordHighYear}`)}s.push({tone:"body",text:o+"."})}let C=bt(e);if(C?.raining)s.push({tone:"wet",text:C.minutes!=null?`It is raining now and should ease within ${C.minutes} minutes.`:"It is raining now, with no break in the next six hours."});else if(C?.minutes!=null&&C.minutes<=240)s.push({tone:"wet",text:`Rain arrives in about ${C.minutes} minutes, around ${t.hm12(C.changeAt)}.`});else{let f=e.hours.find(o=>o.t>w&&(o.pop??0)>=40);f?s.push({tone:"body",text:`Dry for now. The next real chance of rain is ${t.weekday(f.t)} around ${t.hm12(f.t)}, at ${Math.round(f.pop)} percent.`}):s.push({tone:"body",text:"No meaningful rain anywhere in the sixteen-day window."})}let $=Math.max(...e.hours.filter(f=>f.t>w&&f.t<w+24*36e5).map(f=>f.gust??0),0);$>=22&&s.push({tone:"warn",text:`Wind is worth planning around: gusts reach ${Math.round($)} miles per hour today, ${Ct($).effect}.`});let T=Ue(n.dew);["STICKY","HUMID","OPPRESSIVE","MISERABLE","LETHAL"].includes(T.name)?s.push({tone:"warn",text:`The air is ${T.name.toLowerCase()} \u2014 dew point ${J.temp(n.dew)}, ${T.note}.`}):T.name==="VERY DRY"&&s.push({tone:"body",text:`Very dry air, dew point ${J.temp(n.dew)}. Expect static and chapped lips.`});let k=c?.uvMax;if(k!=null&&k>=6){let f=Math.round(350/(k*15));s.push({tone:"warn",text:`UV peaks at ${k.toFixed(1)}, ${_e(k).name.toLowerCase()}. Unprotected skin burns in roughly ${f} minutes.`})}let i=n.air?.aqi??e.airNow?.aqi;i!=null&&i>75&&s.push({tone:"warn",text:`Air quality is ${He(i).name.toLowerCase()} at ${Math.round(i)} on the US index.`});let u=e.pollen;if(u?.index!=null&&u.index>=7){let f=(u.triggers||[]).map(o=>o.name).slice(0,3).join(", ");s.push({tone:"warn",text:`Pollen is ${ht(u.index).name.toLowerCase().replace("-"," to ")} at ${u.index.toFixed(1)} of 12${f?`, driven by ${f}`:""}.`})}let A=Bt.map(f=>({k:f,w:_t(f,e,{hours:24,limit:1,minScore:62})[0]})).filter(f=>f.w).sort((f,o)=>o.w.peak-f.w.peak).slice(0,2);for(let f of A){let o=zt(f.k);s.push({tone:"good",text:`Best window to ${o.label.toLowerCase()}: ${t.weekday(f.w.start)} ${t.hm12(f.w.start)} to ${t.hm12(f.w.end)}, scoring ${f.w.peak} out of 100.`})}let d=e.currentKp();if(d!=null&&d>=5){let f=Et(d);s.push({tone:"space",text:`Geomagnetic activity is elevated: Kp ${d.toFixed(1)}, ${f.name}. Aurora may be visible to about ${f.lat} degrees latitude.`})}let r=e.sunTimesFor(w);return s.push({tone:"body",text:`Sunset is at ${t.hm12(r.sunset)}, with golden hour beginning ${t.hm12(r.goldenHour)}`+(c?.daylight?` and ${tt(c.daylight)} of daylight today`:"")+"."}),s}var Xn=e=>{let t=String(e).replace(/\s+/g," ").match(/^.{0,180}?[.!?](\s|$)/);return(t?t[0]:String(e).slice(0,180)).trim()};function ea(e,t){let[,n,s]=e.fmt.isoDate(t).split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][n-1]+s-1}var ta={lead:"var(--cy)",alert:"var(--rd)",warn:"var(--am)",wet:"var(--ice)",good:"var(--lm)",space:"var(--vi)",body:"var(--ink)"};function ro(e,t){let n=Qn(e);t(`
    <div class="hd">BRIEFING<span class="rule"></span>
      <span class="val">${oe(e.loc.name.toUpperCase())} \xB7 ${e.fmt.hm(Date.now())}</span></div>
    <div class="res-list" style="max-height:60vh">
      ${n.map((s,c)=>`
        <p style="
          margin:0 0 10px;
          font-size:${c===0?".92rem":".8rem"};
          line-height:1.6;
          color:${ta[s.tone]||"var(--ink)"};
          ${s.tone==="alert"?"border-left:2px solid var(--rd);padding-left:10px;":""}
          ${c===0?"font-weight:600;":""}
        ">${oe(s.text)}</p>`).join("")}
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      <button class="tl-btn" id="speakBtn">\u25B6 SPEAK</button>
      <button class="tl-btn" id="stopBtn">\u25A0 STOP</button>
    </div>
  `,s=>{let c=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();let w=n.map(T=>T.text).join(" "),C=new SpeechSynthesisUtterance(w);C.rate=1.02,C.pitch=.85;let $=speechSynthesis.getVoices().find(T=>/en[-_](GB|US)/.test(T.lang)&&T.localService);$&&(C.voice=$),speechSynthesis.speak(C)};s.querySelector("#speakBtn").addEventListener("click",c),s.querySelector("#stopBtn").addEventListener("click",()=>speechSynthesis?.cancel()),e.settings.voice&&setTimeout(c,220)})}function yn(e,t,n){let s=t.ownerDocument,c='a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',w=null,C=!1,$=()=>[...t.querySelectorAll(c)].filter(d=>d.tabIndex>=0&&!d.matches(":disabled")&&!d.closest("[hidden], [inert]")&&d.getClientRects().length&&s.defaultView.getComputedStyle(d).visibility!=="hidden").sort((d,r)=>(d.tabIndex||1/0)-(r.tabIndex||1/0)),T=()=>($()[0]||t).focus();function k(d){!e.hidden&&!t.contains(d.target)&&T()}function i(d){if(e.hidden||d.defaultPrevented||d.isComposing)return;if(d.key==="Escape"){d.preventDefault(),d.stopPropagation(),A();return}if(d.key!=="Tab"||d.ctrlKey||d.metaKey||d.altKey)return;let r=$(),f=r[0],o=r.at(-1);f?(!r.includes(s.activeElement)||(d.shiftKey?s.activeElement===f:s.activeElement===o))&&(d.preventDefault(),(d.shiftKey?o:f).focus()):(d.preventDefault(),t.focus({preventScroll:!0}))}function u(d,r,f){e.hidden&&(w=f||s.activeElement,C=n?.inert||!1,n&&(n.inert=!0),s.addEventListener("keydown",i,!0),s.addEventListener("focusin",k)),t.innerHTML=d;let o=t.querySelector(".hd");o?(o.id||="modalTitle",t.setAttribute("aria-labelledby",o.id),t.removeAttribute("aria-label")):(t.removeAttribute("aria-labelledby"),t.setAttribute("aria-label","Weather dialog")),e.hidden=!1,e.scrollTop=t.scrollTop=0,r&&r(t),t.contains(s.activeElement)||T()}function A(){if(e.hidden)return;e.hidden=!0,s.removeEventListener("keydown",i,!0),s.removeEventListener("focusin",k),t.innerHTML="",n&&(n.inert=C);let d=w;w=null,d?.isConnected&&!d.closest("[inert]")&&d.focus({preventScroll:!0})}return e.addEventListener("click",d=>{d.target===e&&A()}),{open:u,close:A}}var uo=["deck","radar","sky","air","data","overhead"],oa=5*6e4,he={sky:document.getElementById("sky"),boot:document.getElementById("boot"),bootLog:document.getElementById("bootLog"),led:document.getElementById("led"),locBtn:document.getElementById("locBtn"),locName:document.getElementById("locName"),locSub:document.getElementById("locSub"),nav:document.getElementById("nav"),clockTime:document.getElementById("clockTime"),clockZone:document.getElementById("clockZone"),alertBtn:document.getElementById("alertBtn"),soundBtn:document.getElementById("soundBtn"),briefBtn:document.getElementById("briefBtn"),cfgBtn:document.getElementById("cfgBtn"),scrub:document.getElementById("scrub"),modal:document.getElementById("modal"),modalCard:document.getElementById("modalCard")},Ye=new Rt(he.sky),Mn=null,Re={},Sn=yn(he.modal,he.modalCard,document.getElementById("app")),wn=[];function Me(e,t=""){wn.push(t?`<span class="${t}">${e}</span>`:e),he.bootLog.innerHTML=wn.join(`
`)}async function na(){Me("ATMOS//NET v1.0.0"),Me('<span class="mut">initialising atmospheric console\u2026</span>'),Lo();let e=new URLSearchParams(location.search).get("q");e!==null&&/^[0-3]$/.test(e)&&no(+e),Me(`render tier ${se.tier} \xB7 ${se.onBattery?"battery":"AC power"}`,"ok");let t=Ye.init();Ye.setQuality(se.tier),Me(t?"webgl2 sky renderer online":"webgl2 unavailable \u2014 sky disabled",t?"ok":"err"),se.onChange(w=>Ye.setQuality(w));let n=a.loc,s=null;n?Me(`location: ${oe(n.name)}`):(s=await ye.config(),n=s.home,Me(`no saved location \u2014 using ${oe(n.name)}`)),Me('<span class="mut">contacting feeds\u2026</span>'),await a.setLocation(n,{remember:!s?.public});let c=a.raw;Me(`open-meteo forecast  ${c?.forecast?.ok?"OK":"FAIL"}`,c?.forecast?.ok?"ok":"err"),Me(`open-meteo air       ${c?.air?.ok?"OK":"FAIL"}`,c?.air?.ok?"ok":"err"),Me(`nws alerts           ${c?.alerts?.ok?"OK":"FAIL"}`,c?.alerts?.ok?"ok":"err"),Me(`noaa swpc space wx   ${c?.space?.ok?"OK":"FAIL"}`,c?.space?.ok?"ok":"err"),Me(`${a.hours.length} hourly steps \xB7 ${a.days.length} days \xB7 ${a.min15.length} 15-min steps`,"ok"),aa(),Me("console ready","ok"),setTimeout(()=>{he.boot.classList.add("done");let w=a.skyParams();w&&Ye.snap(w)},0),Tn(),setInterval(()=>{document.hidden||a.refresh()},oa),ra(s)}function bn(e,t,n){Object.defineProperty(Re,e,{configurable:!0,enumerable:!0,get(){let s=t(document.getElementById(n));return Object.defineProperty(Re,e,{value:s,configurable:!0,enumerable:!0,writable:!0}),s}})}function aa(){Mn=Ro(he.scrub),Re.deck=Yo(document.getElementById("view-deck")),Re.sky=nn(document.getElementById("view-sky")),Re.air=sn(document.getElementById("view-air")),Re.data=rn(document.getElementById("view-data")),bn("radar",Xo,"view-radar"),bn("overhead",hn,"view-overhead");let e=()=>{let n=Re[a.view];n?.update&&n.update()};a.on("data",()=>{e(),lo()}),a.on("cursor",()=>{e(),St()}),a.on("climate",e),a.on("models",e),a.on("pollen",e),a.on("observed",e),a.on("radar",e),a.on("loc",lo),a.on("status",n=>{he.led.dataset.state=n==="ok"?"":n}),he.nav.addEventListener("click",n=>{let s=n.target.closest("button[data-view]");s&&Mt(s.dataset.view)}),he.locBtn.addEventListener("click",An),he.alertBtn.addEventListener("click",En),he.briefBtn.addEventListener("click",()=>ro(a,dt)),he.cfgBtn.addEventListener("click",Cn),he.soundBtn.addEventListener("click",fo),document.addEventListener("visibilitychange",()=>{document.hidden||(Jt=0,a.syncToNow())}),window.addEventListener("resize",()=>{Ye.resize()}),document.addEventListener("keydown",la),window.addEventListener("hashchange",()=>Mt(location.hash.slice(1),{push:!1}));let t=location.hash.slice(1);uo.includes(t)&&t!=="deck"?Mt(t):document.documentElement.style.setProperty("--stage-dim","0.25"),lo(),e()}function lo(){let e=a.loc;e&&(he.locName.textContent=e.name,he.locSub.textContent=[e.admin1,e.country].filter(Boolean).join(" \xB7 ")||`${e.lat.toFixed(2)}, ${e.lon.toFixed(2)}`),he.clockZone.textContent=a.tz.split("/").pop().replace(/_/g," "),he.alertBtn.dataset.n=String(a.alerts.length),he.soundBtn.classList.toggle("on",et())}function Mt(e,{push:t=!0}={}){if(!uo.includes(e)||a.view===e)return;Re[a.view]?.onHide?.(),a.view=e,$o();let n=Re[e];t&&location.hash.slice(1)!==e&&history.replaceState(null,"","#"+e);for(let s of he.nav.querySelectorAll("button"))s.setAttribute("aria-selected",String(s.dataset.view===e));for(let s of document.querySelectorAll(".view"))s.classList.toggle("active",s.dataset.view===e);document.documentElement.style.setProperty("--stage-dim",e==="deck"?"0.25":"0.72"),n?.update&&n.update(),n?.onShow&&n.onShow()}var $n=performance.now(),co=0,Jt=0,sa=20;function Tn(e=performance.now()){requestAnimationFrame(Tn);let t=Math.min(.1,(e-$n)/1e3);$n=e,Co(t),document.hidden||(Ye.render(e,t),Mn?.tick(t),Jt+=t,Jt>sa&&(Jt=0,a.syncToNow()),co+=t,(a.playing||co>.25)&&(co=0,St()),ia(e),vn(a))}function St(){let e=a.skyParams();e&&Ye.set(e)}var kn=0;function ia(e){e-kn<500||(kn=e,he.clockTime.textContent=a.fmt.hms(Date.now()))}function dt(e,t,n){Sn.open(e,t,n)}function Qt(){Sn.close()}function An(){dt(`
    <div class="hd">LOCATION<span class="rule"></span><span class="val">ENTER TO SELECT \xB7 ESC TO CLOSE</span></div>
    <input class="search-input" id="q" placeholder="search any city, or paste  lat, lon" autocomplete="off" spellcheck="false">
    <button class="tl-btn" id="useloc" style="margin-top:8px">\u25CE USE MY LOCATION</button>
    <div class="res-list" id="res"></div>
  `,e=>{let t=e.querySelector("#q"),n=e.querySelector("#res"),s=[],c=0,w=null,C=()=>{s=a.favorites.map(i=>({...i,fav:!0})),$("SAVED")},$=i=>{if(!s.length){n.innerHTML=`<h3>${i}</h3><div class="nodata">no results</div>`;return}n.innerHTML=`<h3>${i}</h3>`+s.map((u,A)=>`
        <div class="res-item ${A===c?"sel":""}" data-i="${A}">
          <div>
            <b>${ct(u.name)}</b><br>
            <span>${ct([u.admin1,u.country||u.country_code].filter(Boolean).join(" \xB7 "))}</span>
          </div>
          <span class="coord">${(+u.latitude).toFixed(2)}, ${(+u.longitude).toFixed(2)}</span>
          ${u.fav?`<button class="rm" data-rm="${A}" title="Remove">\xD7</button>`:""}
        </div>`).join("")},T=async i=>{let u=s[i];u&&(a.addFavorite(u),Qt(),await a.setLocation(u),St())};n.addEventListener("click",i=>{let u=i.target.closest("[data-rm]");if(u){i.stopPropagation(),a.removeFavorite(+u.dataset.rm),C();return}let A=i.target.closest("[data-i]");A&&T(+A.dataset.i)}),t.addEventListener("input",()=>{clearTimeout(w);let i=t.value.trim();if(!i){C();return}let u=i.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);if(u){let A=+u[1],d=+u[2];if(Math.abs(A)<=90&&Math.abs(d)<=180){s=[{name:`${A.toFixed(4)}, ${d.toFixed(4)}`,admin1:"coordinate",latitude:A,longitude:d}],c=0,$("COORDINATE");return}}w=setTimeout(async()=>{try{s=(await ye.geocode(i)).results||[],c=0,$("RESULTS")}catch{s=[],$("RESULTS")}},220)}),t.addEventListener("keydown",i=>{i.key==="ArrowDown"?(c=Math.min(s.length-1,c+1),$(n.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="ArrowUp"?(c=Math.max(0,c-1),$(n.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="Enter"&&(T(c),i.preventDefault())});let k=e.querySelector("#useloc");!navigator.geolocation||!window.isSecureContext?k.remove():k.addEventListener("click",()=>{k.textContent="\u25CE LOCATING\u2026",navigator.geolocation.getCurrentPosition(async i=>{let u=i.coords.latitude,A=i.coords.longitude,d=`${u.toFixed(2)}, ${A.toFixed(2)}`,r="",f="";try{let o=await ye.reverse(u,A);d=o.city||o.locality||o.principalSubdivision||d,r=o.principalSubdivision||"",f=o.countryCode||""}catch{}a.settings.geo="set",Qt(),await a.setLocation({name:d,admin1:r,country_code:f,latitude:u,longitude:A}),St()},i=>{k.textContent=i.code===i.PERMISSION_DENIED?"\u25CE LOCATION BLOCKED IN BROWSER":"\u25CE LOCATION UNAVAILABLE"},{timeout:8e3,maximumAge:30*6e4})}),C(),t.focus()})}function En(){let e=a.alerts;if(!e.length){dt(`<div class="hd">ALERTS<span class="rule"></span></div>
      <div class="nodata">no active watches, warnings or advisories for this location</div>`);return}dt(`
    <div class="hd" style="--ac:var(--rd)">ACTIVE ALERTS<span class="rule"></span><span class="val">${e.length}</span></div>
    <div class="res-list">
      ${e.map(t=>`
        <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)">
          <b style="color:#f47171;font-size:.82rem;letter-spacing:.08em">${ct(t.event)}</b>
          <div style="font-family:var(--mono);font-size:max(.6rem,var(--fs-floor,0px));color:var(--faint);margin:3px 0 6px">
            ${ct(t.senderName||"")} \xB7 until ${a.fmt.weekday(t.expires)} ${a.fmt.hm(t.expires)}
          </div>
          <div style="font-size:max(.72rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5;white-space:pre-wrap">${ct((t.description||"").slice(0,900))}</div>
          ${t.instruction?`<div style="margin-top:7px;font-size:max(.7rem,var(--fs-floor,0px));color:var(--am);line-height:1.5">${ct(t.instruction.slice(0,400))}</div>`:""}
        </div>`).join("")}
    </div>
  `)}function Cn(e){let t=se.manual;dt(`
    <div class="hd">SETTINGS<span class="rule"></span><span class="val">ATMOS//NET v1.0.0</span></div>
    <div class="setrow">
      <label>Render quality<span class="hint">Auto adapts to power state and measured frame rate</span></label>
      <div class="seg" id="qseg">
        ${["auto","0","1","2","3"].map(n=>`<button data-q="${n}" class="${String(t)===n||t==null&&n==="auto"?"on":""}">${n}</button>`).join("")}
      </div>
    </div>
    <div class="setrow">
      <label>Ambient audio<span class="hint">Generative soundscape matched to live conditions</span></label>
      <div class="seg"><button id="sndT" class="${et()?"on":""}">${et()?"on":"off"}</button></div>
    </div>
    <div class="setrow">
      <label>Spoken briefing<span class="hint">Reads the briefing aloud when opened</span></label>
      <div class="seg"><button id="voiceT" class="${a.settings.voice?"on":""}">${a.settings.voice?"on":"off"}</button></div>
    </div>
    <h3>Keyboard</h3>
    <div class="keyhelp">
      ${[["1\u20136","switch view"],["Space","play / pause forecast"],["\u2190 \u2192","step 1 hour"],["Shift \u2190 \u2192","step 6 hours"],["N","return to now"],["/","search location"],["A","alerts"],["B","briefing"],["S","ambient audio"],["F","fullscreen"],[",","settings"],["Esc","close"]].map(([n,s])=>`<div><span>${s}</span><kbd>${n}</kbd></div>`).join("")}
    </div>
    <h3>Data sources</h3>
    <div style="font-size:max(.66rem,var(--fs-floor,0px));color:var(--dim);line-height:1.7">
      Open-Meteo (forecast \xB7 air quality \xB7 1994\u2013 archive \xB7 multi-model ensemble) \xB7
      NWS api.weather.gov (US alerts) \xB7 RainViewer (radar) \xB7
      NOAA SWPC (space weather) \xB7 pollen.com (US pollen) \xB7 Esri (map tiles)
    </div>
  `,n=>{n.querySelector("#qseg").addEventListener("click",s=>{let c=s.target.closest("[data-q]");c&&(no(c.dataset.q==="auto"?null:+c.dataset.q),n.querySelectorAll("[data-q]").forEach(w=>w.classList.toggle("on",w===c)))}),n.querySelector("#sndT").addEventListener("click",s=>{fo(),s.target.textContent=et()?"on":"off",s.target.classList.toggle("on",et())}),n.querySelector("#voiceT").addEventListener("click",s=>{a.settings.voice=!a.settings.voice,a.save(),s.target.textContent=a.settings.voice?"on":"off",s.target.classList.toggle("on",a.settings.voice)})},e?.currentTarget)}function fo(){let e=!et();mn(),gn(e),a.settings.sound=e,a.save(),he.soundBtn.classList.toggle("on",e)}function ra(e){e?.public&&(a.settings.geo||!navigator.geolocation||!window.isSecureContext||navigator.geolocation.getCurrentPosition(async t=>{let n=t.coords.latitude,s=t.coords.longitude,c=`${n.toFixed(2)}, ${s.toFixed(2)}`,w="",C="";try{let $=await ye.reverse(n,s);c=$.city||$.locality||$.principalSubdivision||c,w=$.principalSubdivision||"",C=$.countryCode||""}catch{}a.settings.geo="set",await a.setLocation({name:c,admin1:w,country_code:C,latitude:n,longitude:s}),St()},t=>{t.code===t.PERMISSION_DENIED&&(a.settings.geo="denied",a.save())},{timeout:8e3,maximumAge:30*6e4,enableHighAccuracy:!1}))}function la(e){if(e.defaultPrevented||e.isComposing)return;if(e.target.closest?.('input, textarea, select, button, a[href], summary, [contenteditable], [role="button"], [role="link"], [role="slider"], [role="textbox"], [role="combobox"]')){e.key==="Escape"&&Qt();return}if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('[aria-modal="true"]'))return;let t=e.key;if(t==="Escape"){Qt();return}if(t>="1"&&t<="6"){Mt(uo[+t-1]);return}switch(t.toLowerCase()){case" ":a.playing=!a.playing,a.playing&&a.view!=="radar"&&(a.following=!1),a.playing&&a.cursor>=a.span.hi-6e4&&a.setCursor(Date.now()),a.emit("play",a.playing),e.preventDefault();break;case"arrowleft":a.playing=!1,a.scrubTo(a.cursor-(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"arrowright":a.playing=!1,a.scrubTo(a.cursor+(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"n":a.toNow();break;case"/":An(),e.preventDefault();break;case"a":En();break;case"b":ro(a,dt);break;case"s":fo();break;case",":Cn();break;case"r":a.refresh();break;case"f":document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();break;default:break}}var ct=oe;na().catch(e=>{console.error(e),Me(`FATAL: ${e.message}`,"err")});window.ATMOS={store:a,sky:Ye,perf:se,setView:Mt,views:Re};export{Qt as closeModal,dt as openModal};
