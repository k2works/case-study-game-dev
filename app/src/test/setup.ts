import '@testing-library/jest-dom'

// ResizeObserverのモック（Rechartsで必要）
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// TensorFlow.jsのテスト環境設定
// IndexedDBのモック
const mockIndexedDB = {
  open: () =>
    Promise.resolve({
      transaction: () => ({
        objectStore: () => ({
          put: () => Promise.resolve(),
          get: () => Promise.resolve(undefined),
          delete: () => Promise.resolve(),
        }),
      }),
    }),
  deleteDatabase: () => Promise.resolve(),
}

Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
})

// WebGL/Canvasのモック
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: (contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return {
        // WebGLRenderingContextのモック
        createShader: () => ({}),
        createProgram: () => ({}),
        shaderSource: () => {},
        compileShader: () => {},
        attachShader: () => {},
        linkProgram: () => {},
        useProgram: () => {},
        createBuffer: () => ({}),
        bindBuffer: () => {},
        bufferData: () => {},
        createTexture: () => ({}),
        bindTexture: () => {},
        texImage2D: () => {},
        viewport: () => {},
        clearColor: () => {},
        clear: () => {},
        drawArrays: () => {},
        drawElements: () => {},
        getParameter: () => 1,
        getShaderParameter: () => true,
        getProgramParameter: () => true,
        getUniformLocation: () => ({}),
        getAttribLocation: () => 0,
        uniform1f: () => {},
        uniform2f: () => {},
        uniform3f: () => {},
        uniform4f: () => {},
        uniformMatrix4fv: () => {},
        enableVertexAttribArray: () => {},
        vertexAttribPointer: () => {},
        canvas: { width: 1, height: 1 },
      }
    }
    return null
  },
})
