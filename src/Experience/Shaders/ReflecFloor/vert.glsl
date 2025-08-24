varying vec2 vUv_;
varying vec4 vWorldPosition;

void main() {
    vUv_ = uv;
    vWorldPosition = modelMatrix * vec4(position, 1.0);
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
