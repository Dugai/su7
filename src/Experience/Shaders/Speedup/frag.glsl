uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;

varying vec2 vUv;

uniform float uSpeed;
uniform float uOpacity;

// Simple noise function
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Simple noise function
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec3 pos2col(vec2 i){
    i += vec2(9.0, 0.0);
    
    float r = random(i + vec2(12.0, 2.0));
    float g = random(i + vec2(7.0, 5.0));
    float b = random(i);
    
    vec3 col = vec3(r, g, b);
    return col;
}

vec3 colorNoise(vec2 uv){
    vec2 size = vec2(1.0);
    vec2 pc = uv * size;
    vec2 base = floor(pc);
    
    vec3 v1 = pos2col((base + vec2(0.0, 0.0)) / size);
    vec3 v2 = pos2col((base + vec2(1.0, 0.0)) / size);
    vec3 v3 = pos2col((base + vec2(0.0, 1.0)) / size);
    vec3 v4 = pos2col((base + vec2(1.0, 1.0)) / size);
    
    vec2 f = fract(pc);
    f = smoothstep(0.0, 1.0, f);
    
    vec3 px1 = mix(v1, v2, f.x);
    vec3 px2 = mix(v3, v4, f.x);
    vec3 v = mix(px1, px2, f.y);
    return v;
}

float map(float value, float min1, float max1, float min2, float max2) {
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main(){
    vec2 uv = vUv;
    
    vec3 col = vec3(1.0);
    
    float mask = 1.0;
    
    vec2 noiseUv = uv;
    noiseUv.x += -iTime * 0.5;
    float noiseValue = noise(noiseUv * vec2(3.0, 100.0));
    mask = noiseValue;
    mask = map(mask, -1.0, 1.0, 0.0, 1.0);
    mask = pow(clamp(mask - 0.1, 0.0, 1.0), 11.0);
    mask = smoothstep(0.0, 0.04, mask);
    
    col = colorNoise(noiseUv * vec2(10.0, 100.0));
    col *= vec3(1.5, 1.0, 400.0);
    
    mask *= smoothstep(0.02, 0.5, uv.x) * smoothstep(0.02, 0.5, 1.0 - uv.x);
    mask *= smoothstep(0.01, 0.1, uv.y) * smoothstep(0.01, 0.1, 1.0 - uv.y);
    mask *= smoothstep(1.0, 10.0, uSpeed);
    
    gl_FragColor = vec4(col, mask * uOpacity);
}
