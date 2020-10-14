export default (uniforms) => (
  {
    uniforms,
    vertexShader: `
      // Переменные, которые передаёт Three.js для проецирования на плоскость
      uniform mat4 projectionMatrix;
      uniform mat4 modelMatrix;
      uniform mat4 viewMatrix;

      // Атрибуты вершины из геометрии
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;

      // Varying-переменная для передачи uv во фрагментный шейдер
      varying vec2 vUv;

      void main() {

        vUv = uv;

        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );

      }
    `,
    fragmentShader: `
      precision mediump float;

      uniform sampler2D map;

      struct optionsStruct {
        float hueShift;
      };

      uniform optionsStruct options;

      varying vec2 vUv;

      vec3 hueShift(vec3 color, float hue) {
        const vec3 k = vec3(0.57735, 0.57735, 0.57735);
        float cosAngle = cos(hue);
        return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
      }

      void main() {
        vec4 texel = texture2D(map, vUv);
        vec4 result = texel;

        if (options.hueShift != 0.0) {
          vec3 hueShifted = hueShift(result.rgb, options.hueShift);

          result = vec4(hueShifted.rgb, 1);
        }
        gl_FragColor = result;
      }
    `,
  }
);
