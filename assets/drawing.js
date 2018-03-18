/**
 * Предоставляет пользовательский интерфейс для рисования видео потока на холсте canvas.
 * Перед использованием нужно установить canvas с помощью метода setCanvas().
 */
class Canvas {
    /**
     * Конструктор класса.
     * @param {Element} canvas
     */
    constructor(canvas) {
        this._canvas = canvas;
        this._ctx = null;
        this._lock = false;
        this._createContext();
        this._emptyCanvas = document.createElement('canvas');
        this._videoCanvas = document.createElement('canvas');
        this._videoCtx = this._videoCanvas.getContext('2d');
        this._emptyCtx = this._emptyCanvas.getContext('2d');
        this._emptyCtx.globalAlpha = 0;
        this.filters = [];
        this._videoStream = null;
    }

    /**
     * Вызывается вручную, когда изменяются размеры canvas.
     * @param {Object} sizes
     * @private
     */
    _resize(sizes) {
        this._emptyCanvas.width = this._videoCanvas.width = sizes.width;
        this._emptyCanvas.height = this._videoCanvas.height = sizes.height;
    }

    /**
     * Возвращает холст.
     * @return {null|Element}
     */
    get canvas() {
        return this._canvas;
    }

    /**
     * Устанавливает холст для рисования.
     * @param {null|Element} val Canvas.
     */
    set canvas(val) {
        this._canvas = val;
        this._createContext();
    }

    /**
     * Создает контекст для рисования. Переопределяется в дочерних классах.
     * @private
     */
    _createContext() {}

    /**
     * Захватывает виедо поток и рисует его на canvas.
     * @param {VideoStream} video Видео поток.
     */
    async captureVideoStream(video) {
        this._videoStream = video;
        this._canvas.width = this._videoStream.stream.videoWidth || 640;
        this._canvas.height = this._videoStream.stream.videoHeight || 480;
        this._resize({
            width: this._canvas.width,
            height: this._canvas.height,
        });
        this._videoStream.stream.addEventListener(
            'loadedmetadata', this._drawVideoFrame.bind(this)
        );
    }

    /**
     * Рисует кадр из потока, установленного с помощью captureVideoStream().
     * @private
     */
    async _drawVideoFrame() {
        window.requestAnimationFrame(this._drawVideoFrame.bind(this));
        if (this._videoStream && !this._lock) {
            this._lock ^= true;
            let promise = new Promise(async (resolve) => {
                this._videoCtx.drawImage(
                    this._videoStream.stream, 0, 0,
                    this._videoStream.stream.videoWidth,
                    this._videoStream.stream.videoHeight
                );
                if(this.filters.length !== 0) {
                    let _slice = this.filters.slice(1);
                    await this.filters[0].apply(this._emptyCtx, this._videoCanvas);
                    for (let _i = 0; _i < _slice.length; _i++) {
                        _slice[_i].afterRedraw(this._emptyCtx);
                        await _slice[_i].apply(this._emptyCtx, this._emptyCanvas);
                    }
                } else {
                    this._emptyCtx.drawImage(this._videoCanvas, 0, 0);
                }
                resolve(this._emptyCanvas);
            });
            promise.then((_ctx) => {
                    window.requestAnimationFrame(() => {
                        this._ctx.drawImage(_ctx, 0, 0);
                        this._lock ^= true;
                    });
                });
        } else if(this._lock) {
            this.filters.map((f) => {
                f.afterRedraw(this._emptyCtx);
            });
        } else {
            throw new Error('Stream is not defined!');
        }
    }

    /**
     * Добавляет пользовательские фильтры к изображению на холсте.
     * @param {Filter} filter
     */
    addFilter(filter) {
        this.filters.push(filter);
    }
}

/**
 * Класс для рисования с помощью GPU на 2D canvas.
 */
class Canvas2D extends Canvas {
    /**
     * Конструктор класса Canvas2D.
     * @param {Element} canvas
     */
    constructor(canvas) {
        super(canvas);
    }

    /**
     * @inheritDoc
     */
    _createContext() {
        this._ctx = this._canvas.getContext('2d');
    }
}

/**
 * Класс для рисования на canvas с помощью библиотеки three.js.
 */
class Canvas3D extends Canvas {
    /**
     * Конструктор класса Canvas3D.
     * @param {Element} canvas
     */
    constructor(canvas) {
        super(canvas);
    }

    /**
     * @inheritDoc
     */
    _createContext() {
        this._ctx = this._canvas.getContext('2d');
    }

    /**
     * @inheritDoc
     */
    _resize(sizes) {
        super._resize(sizes);
        this.filters.forEach((e) => {
            if (e instanceof Filter3D) {
                e.resetCanvasSizes(sizes);
            }
        });
    }

    /**
     * Добавляет 3D фильтр.
     * @param {Filter3D} filter
     */
    addFilter3D(filter) {
        this.filters.push(filter);
        filter.canvas = this._videoCtx.canvas;
        filter.init();
    }
}

/**
 * Класс, представляющий виедо поток.
 */
class VideoStream {
    /**
     * Конструктор класса VideoStream.
     * @param {Element} video <video> Element.
     */
    constructor(video) {
        this._video = video;
    }

    /**
     * Возвращает <video> элемент.
     * @return {Element}
     */
    get stream() {
        return this._video;
    }

    /**
     * Создает видео поток из MediaStream.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getUserMedia
     * @param {MediaStream} mediaStream
     * @return {self}
     */
    static fromMedia(mediaStream) {
        let _video = document.createElement('video');
        _video.srcObject = mediaStream;
        _video.setAttribute('autoplay', true);
        return new this(_video);
    }
}
