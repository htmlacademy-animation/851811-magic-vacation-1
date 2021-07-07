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
