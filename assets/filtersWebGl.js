/**
 * Фильтр, применяемый к Canvas3D.
 */
class Filter3D extends Filter {
    /**
     * Конструктор класса.
     * @param {Object} [options]
     */
    constructor(options) {
        super();
    }

    /**
     * Первичная инициализация для рендера.
     */
    init() {
        if (!THREE) {
            throw new Error('Для работы требуется three.js');
        }
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(this._canvas.width, this._canvas.height);
        this._scene = new THREE.Scene();
        this._camera = new THREE.Camera();
        this._scene.add(this._camera);
    }

    /**
     * Возвращает GLSL vertexShader.
     * @return {string}
     * @private
     */
    get _vertexShader() {
        return `
            uniform sampler2D u_texture;
            varying vec2 vUv;
            void main()	{
                gl_Position = vec4(position, 1.0);
                vUv = (position.xy + 1.0) * 0.5;
            }
        `;
    }

    /**
     * Возвращает GSLS fragmentShader.
     * @return {string}
     * @private
     */
    get _fragmentShader() {
        return '';
    }

    /**
     * Рендерит новый кадр для canvas.
     * @private
     */
    _render() {
        this._renderer.render(this._scene, this._camera);
    }

    /**
     * Возвращает проми, который зарезолвится после загрузки текстуры.
     * @param {Element} canvas
     * @return {Promise<void>}
     * @private
     */
    async _loadTexture(canvas) {
        return new Promise((resolve, reject) => {
            let _loader = new THREE.TextureLoader();
            _loader.load(
                canvas.toDataURL('image/jpeg'),
                (texture) => {
                    resolve(texture);
                },
                undefined,
                (e) => {
                    reject(e);
                }
            );
        });
    }

    /**
     * Обязательно вызвать через super() в дочерних классах.
     * @inheritDoc
     * @return {Promise<THREE.Texture>} Возвращает текстуру, создержащуюю изображение canvas.
     */
    async apply(ctx, source) {
        let _texture = await this._loadTexture(this._canvas);
        this._scene.remove(this._scene, ...this._scene.children);
        _texture.minFilter = THREE.LinearFilter;
        return _texture;
    }

    /**
     * Устанавливает canvas, как источник изображения.
     * @param {Element} value
     */
    set canvas(value) {
        this._canvas = value;
    }

    /**
     * Изменяет размер canvas для рендера.
     * @param {Object} sizes
     */
    resetCanvasSizes(sizes) {
        this._canvas.width = sizes.width;
        this._canvas.height = sizes.height;
        this._renderer.setSize(sizes.width, sizes.height);
    }

    /**
     * Возвращает Promise, который вернет ImageData WebGL canvas.
     * @private
     * @return {Promise}
     */
    get _image() {
        return new Promise((resolve) => {
            let _image = new Image();
            _image.src = this._renderer.domElement.toDataURL('image/jpeg');
            _image.onload = () => {
                resolve(_image);
            };
        });
    }
}

class Filter3DDis extends Filter3D {
    /**
     * @inheritDoc
     */
    get _fragmentShader() {
        return `
            uniform sampler2D u_texture;
            varying vec2 vUv;
        
            void main()	{
                vec4 color = texture2D(u_texture, vUv);
                color.g = texture2D(u_texture, vUv + vec2(0.01, 0.01)).g;
                color.b = texture2D(u_texture, vUv + vec2(-0.01, 0.01)).b;
                gl_FragColor = color;
            }
        `;
    }

    /**
     * @inheritDoc
     */
    async apply(ctx, source) {
        let _texture = await super.apply(source);
        let _geometry = new THREE.PlaneGeometry(this._canvas.width, this._canvas.height);
        let _uniforms = {
            u_texture: {type: 't', value: _texture},
        };
        let _shaderMaterial = new THREE.ShaderMaterial({
            uniforms: _uniforms,
            vertexShader: this._vertexShader,
            fragmentShader: this._fragmentShader
        });
        this._scene.add(new THREE.Mesh(_geometry, _shaderMaterial));
        this._render();
        let _image = await this._image;
        ctx.drawImage(_image, 0, 0);
        _texture.dispose();
        return new Promise ((resolve) => {
            resolve(null);
        });
    }
}
