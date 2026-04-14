uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

varying vec2 vUv_;
varying vec4 vWorldPosition;
varying vec3 vNormalW;

void main(){
    vec3 p=position;
    
    vUv_=uv;
    vWorldPosition=modelMatrix*vec4(p,1.0);
    vNormalW=normalize(mat3(modelMatrix)*normal);
    
    gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
}
