#include <common>

uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv_;
varying vec4 vWorldPosition;

uniform vec3 uColor;
uniform float uSpeed;
uniform mat4 uReflectMatrix;
uniform sampler2D uReflectTexture;
uniform float uReflectIntensity;
uniform vec2 uMipmapTextureSize;

// Simple fresnel approximation
vec3 fresnel(vec3 F0, vec3 normal, vec3 viewDir) {
    float cosTheta = max(dot(normal, viewDir), 0.0);
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// Simple packed texture LOD sampling
vec3 packedTexture2DLOD(sampler2D tex, vec2 uv, float level, vec2 texSize) {
    return texture2D(tex, uv, level).rgb;
}

void main(){
    vec2 p = vUv_;
    
    vec2 surfaceNormalUv = vWorldPosition.xz;
    surfaceNormalUv.x += iTime * uSpeed;
    vec3 surfaceNormal = texture2D(normalMap, surfaceNormalUv).rgb * 2.0 - 1.0;
    surfaceNormal = vec3(surfaceNormal.r, surfaceNormal.b, surfaceNormal.g);
    surfaceNormal = normalize(surfaceNormal);
    
    vec3 viewDir = normalize(vViewPosition);
    float d = length(vViewPosition);
    
    vec2 distortion = surfaceNormal.xz * (0.001 + 1.0/d);
    
    vec4 reflectPoint = uReflectMatrix * vWorldPosition;
    reflectPoint = reflectPoint / reflectPoint.w;
    
    vec2 roughnessUv = vWorldPosition.xz;
    roughnessUv.x += iTime * uSpeed;
    float roughnessValue = texture2D(roughnessMap, roughnessUv).r;
    roughnessValue = roughnessValue * (1.7 - 0.7 * roughnessValue);
    roughnessValue *= 4.0;
    float level = roughnessValue;
    vec2 finalUv = reflectPoint.xy + distortion;
    vec3 reflectionSample = packedTexture2DLOD(uReflectTexture, finalUv, level, uMipmapTextureSize);
    reflectionSample *= uReflectIntensity;
    
    vec3 col = uColor;
    col *= 3.0;
    vec3 fres = fresnel(vec3(0.0), vNormal, viewDir);
    col = mix(col, reflectionSample, fres);
    
    csm_DiffuseColor = vec4(col, 1.0);
}
