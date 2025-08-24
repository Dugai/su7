uniform sampler2D uEnvmap1;
uniform sampler2D uEnvmap2;
uniform float uWeight;
uniform float uIntensity;

varying vec2 vUv;

void main() {
    vec3 color1 = texture2D(uEnvmap1, vUv).rgb;
    vec3 color2 = texture2D(uEnvmap2, vUv).rgb;
    
    vec3 finalColor = mix(color1, color2, uWeight) * uIntensity;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
