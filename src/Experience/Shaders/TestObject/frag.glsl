uniform float iTime;
uniform vec2 iResolution;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec3 col = vec3(uv, 0.5 + 0.5 * sin(iTime));
    gl_FragColor = vec4(col, 1.0);
}
