import * as THREE from 'three';

export function makeWallMaterial() {
  const mat = new THREE.MeshToonMaterial({ color: 0xf2e3b8 });

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>',
        `#include <common>
         varying vec3 vWorld;
         varying vec3 vWorldNormal;`)
      .replace('#include <begin_vertex>',
        `#include <begin_vertex>
         vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
         vWorldNormal = normalize(mat3(modelMatrix) * normal);`);

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>',
        `#include <common>
         varying vec3 vWorld;
         varying vec3 vWorldNormal;
         float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
         vec3 srgb(vec3 c){ return pow(c, vec3(2.2)); }`)
      .replace('#include <color_fragment>',
        `#include <color_fragment>
         float h = hash(floor(vWorld.xz / 60.0));
         vec3 pal[4] = vec3[4](
           vec3(.95,.89,.72), vec3(.94,.70,.48),
           vec3(.72,.79,.85), vec3(.92,.71,.69));
         vec3 col = pal[int(h * 3.99)];

         float f = fract(vWorld.y / 3.0);
         bool isWall = abs(vWorldNormal.y) < 0.3;
         if (isWall && f > 0.15 && f < 0.45) col = vec3(.44,.72,.91);

         diffuseColor.rgb = srgb(col);`);
  };

  // lets three.js cache this shader variant
  mat.customProgramCacheKey = () => 'wall-v1';
  return mat;
}

export function makeGrassMaterial() {
  const mat = new THREE.MeshToonMaterial({ color: 0x5db84a });

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>',
        `#include <common>
         varying vec3 vWorld;
         varying vec3 vWorldNormal;`)
      .replace('#include <begin_vertex>',
        `#include <begin_vertex>
         vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
         vWorldNormal = normalize(mat3(modelMatrix) * normal);`);

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>',
        `#include <common>
         varying vec3 vWorld;
         varying vec3 vWorldNormal;

         float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
         vec2  hash2(vec2 p){ return vec2(hash(p), hash(p + 19.19)); }

         float vnoise(vec2 p){
           vec2 i = floor(p), f = fract(p);
           f = f * f * (3.0 - 2.0 * f);
           return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
         }
         vec3 srgb(vec3 c){ return pow(c, vec3(2.2)); }`)
      .replace('#include <color_fragment>',
        `#include <color_fragment>

         // 1. big patches in three flat greens (like the Constant colour ramp)
         float n = vnoise(vWorld.xz / 50.0) * 0.7 + vnoise(vWorld.xz / 17.0) * 0.3;
         vec3 col = vec3(0.25, 0.56, 0.23);                 // dark  3F8F3A
         if (n > 0.45) col = vec3(0.36, 0.72, 0.29);        // mid   5DB84A
         if (n > 0.60) col = vec3(0.56, 0.83, 0.37);        // light 8ED45F

         // 2. small darker tufts, faded out with distance to avoid shimmer
         float fade = 1.0 - smoothstep(25.0, 90.0, distance(vWorld, cameraPosition));

         vec2 cell = floor(vWorld.xz / 0.25);
         vec2 pt = (cell + 0.2 + 0.6 * hash2(cell)) * 0.25;
         float fleck = 1.0 - smoothstep(0.035, 0.05, length(vWorld.xz - pt));

         // a second, lighter layer with a different grid so it doesn't look like a regular dot pattern
         vec2 cell2 = floor((vWorld.xz + 7.3) / 0.4);
         vec2 pt2 = (cell2 + 0.2 + 0.6 * hash2(cell2 + 3.7)) * 0.4 - 7.3;
         float fleck2 = 1.0 - smoothstep(0.04, 0.06, length(vWorld.xz - pt2));

         col *= 1.0 - 0.22 * fleck * fade;
         col  = mix(col, col * 1.18, fleck2 * fade);

         // 3. dirt on steep slopes (hard edge)
         if (vWorldNormal.y < 0.2) col = vec3(0.61, 0.42, 0.25);   // 9B6B3F

         diffuseColor.rgb = srgb(col);`);
  };

  mat.customProgramCacheKey = () => 'grass-v3';
  return mat;
}
