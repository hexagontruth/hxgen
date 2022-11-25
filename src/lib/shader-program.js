export default class ShaderProgram {
  static build(player, shaderDefs) {
    return shaderDefs.map((shaderDef) => {
      const [vertText, fragText] = shaderDef.slice(0, 2);
      const config = shaderDef[2]; // Optional
      const program = new ShaderProgram(player, vertText, fragText, config);
      return program;
    });
  }

  constructor(player, vertText, fragText, config={}) {
    this.player = player;
    this.gl = player.gl;
    this.vertText = vertText;
    this.fragText = fragText;
    this.buildConfig(config);

    const gl = this.gl;
    this.vertShader = gl.createShader(gl.VERTEX_SHADER);
    this.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(this.vertShader, vertText);
    gl.shaderSource(this.fragShader, fragText);
    gl.compileShader(this.vertShader);
    gl.compileShader(this.fragShader);
    gl.getShaderParameter(this.vertShader, gl.COMPILE_STATUS) || console.error(gl.getShaderInfoLog(this.vertShader));
    gl.getShaderParameter(this.fragShader, gl.COMPILE_STATUS) || console.error(gl.getShaderInfoLog(this.fragShader));
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vertShader);
    gl.attachShader(this.program, this.fragShader);
    gl.linkProgram(this.program);

    this.textures = [];
    this.framebuffers = [];
    this.numTextureBuffers = this.stateful ? 2 : 1;
    for (let i = 0; i < this.numTextureBuffers; i++) {
      const texture = gl.createTexture();
      const fb = gl.createFramebuffer();
      this.textures.push(texture);
      this.framebuffers.push(fb);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    };

    this.cover = this.contain = this.aspect = null;
    this.handleResize();
  }

  buildConfig(config) {
    if (config.size) {
      const size = Array.isArray(config.size) ? config.size : [config.size, config.size];
      this.persistent = true;
      this.size = size;
    }
    this.stateful = !!config.state;
    this.uniforms = config.uniforms || {};
  }


  getTexture(idx) {
    return this.textures[idx % this.numTextureBuffers];
  }

  getFramebuffer(idx) {
    return this.framebuffers[idx % this.numTextureBuffers];
  }

  setUniforms(uniforms) {
    const {gl, program} = this;
    gl.useProgram(program);
    uniforms = Object.assign({}, uniforms, this.uniforms);
    for (let [key, value] of Object.entries(uniforms)) {
      if (value == null) {
        continue;
      }
      if (typeof value == 'function') {
        value = value(uniforms);
      }
      const idx = gl.getUniformLocation(program, key);
      if (!value.length)
        value = [value];
      const type = typeof value[0] == 'boolean' ? 'i' : 'f';
      const fnKey = 'uniform%1%2v'.replace('%1', value.length).replace('%2', type);
      gl[fnKey](idx, value);
    }
  }

  setTextures(textures) {
    const {gl} = this;
    gl.useProgram(this.program);
    const entries = Object.entries(textures);
    let idx = 0;
    for (let [uniformName, textureData] of entries) {
      const textures = Array.isArray(textureData) ? textureData : [textureData];
      const uniformLoc = gl.getUniformLocation(this.program, uniformName);
      const idxRange = [];
      for (const texture of textures) {
        const enumKey = 'TEXTURE%'.replace('%', idx);
        gl.activeTexture(gl[enumKey]);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        idxRange.push(idx);
        idx++;
      }
      gl.uniform1iv(uniformLoc, idxRange);
    }
  }

  handleResize(ev) {
    const {gl} = this;
    const [w, h] = this.size || this.player.size;
    this.contain = w > h ? [w / h, 1] : [1, h / w];
    this.cover = w > h ? [1, h / w] : [w / h, 1];

    if (!this.persistent || !ev) { // This is terrible
      for (let i = 0; i < this.numTextureBuffers; i++) {
        const [texture, fb] = [this.textures[i], this.framebuffers[i]];
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      };
    }
  }
}
