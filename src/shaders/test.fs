#include common.fs

void main() {
  vec2 uv = gl_FragCoord.xy / size;
  vec2 cv = uv * 2. - 1.;
  cv *= cover;
  vec3 c, hex;

  hex = cart2hex * cv;

  c = hsv2rgb(vec3(
    cv.x,
    osc(cv.y /2. - cv.x / 2. - time),
    5./6.
  ));

  c = mix(c, xsum(c, trot(hex, unit.xxx, time)), 1. - step(2./3., amax(hex)));

  c = clamp(c, 0., 1.) * htWhite;
  fragColor = vec4(c, 1);
}
