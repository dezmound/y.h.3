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
        this._bridgeCanvas = document.createElement('canvas');
        this._bridgeContext = this._bridgeCanvas.getContext('2d');
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
     * Рендерит новый кадр для canvas.
     * @private
     */
    _render() {
        this._renderer.render(this._scene, this._camera);
    }

    /**
     * Обязательно вызвать через super() в дочерних классах.
     * @inheritDoc
     */
    apply(ctx) {
        let _texture = new THREE.CanvasTexture(this._canvas);
        let _material = new THREE.SpriteMaterial({
            map: _texture,
            color: 0xffffff,
        });
        let _sprite = new THREE.Sprite(_material);
        _texture.minFilter = THREE.LinearFilter;
        _sprite.scale.set(2, 2, 1);
        this._scene.remove(this._scene, ...this._scene.children);
        this._scene.add(_sprite);
        this._render();
        this._imageData.then((_imageData) => {
            window.requestAnimationFrame(() => {
                // ctx.clearRect(
                //     0, 0,
                //     ctx.canvas.width,
                //     ctx.canvas.height
                // );
                ctx.putImageData(_imageData, 0, 0);
            });
        });
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
        this._bridgeCanvas.width = sizes.width;
        this._bridgeCanvas.height = sizes.height;
    }

    /**
     * Возвращает Promise, который вернет ImageData WebGL canvas.
     * @private
     * @return {Promise}
     */
    get _imageData() {
        return new Promise((resolve) => {
            let _image = new Image();
            _image.src = this._renderer.domElement.toDataURL('image/jpeg');
            _image.onload = () => {
                this._bridgeContext.drawImage(_image, 0, 0);
                resolve(this._bridgeContext.getImageData(
                    0, 0,
                    _image.width,
                    _image.height
                ));
            };
        });
    }
}
