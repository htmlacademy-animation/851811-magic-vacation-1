import vertexShader from './vertex-shader.glsl';
import fragmentShader from './fragment-shader.glsl';

export default (uniforms) => (
  {
    uniforms,
    vertexShader,
    fragmentShader,
  }
);
