/**
 * Класс для создания пользовательских фильтров.
 */
class Filter {
    /**
     * Применяет фильтр к контексту canvas.
     * @param {CanvasRenderingContext2D} ctx
     */
    apply(ctx) {}
}

/**
 * Фильтр изобржения, увеличивает значение красного цвета в изображении.
 */
class FilterTerminatorVisonRed extends Filter {
    /**
     * @inheritDoc
     */
    apply(ctx) {
        let _imageData = ctx.getImageData(
            0, 0, ctx.canvas.width, ctx.canvas.height
        );
        let byteStream = _imageData.data;
        for (let i = 0; i < byteStream.length; i+= 4) {
            byteStream[i] += 100;
            byteStream[i + 1] -= 75;
            byteStream[i + 2] -= 75;
            byteStream[i + 1] = byteStream[i + 1] < 0 ? 0 : byteStream[i + 1];
            byteStream[i + 2] = byteStream[i + 2] < 0 ? 0 : byteStream[i + 2];
        }
        ctx.putImageData(new ImageData(
            byteStream, ctx.canvas.width, ctx.canvas.height
        ), 0, 0);
    }
}

/**
 * Фильтр белый шум на изображении.
 */
class FilterNoize extends Filter {
    /**
     * Конструктор класса.
     * @param {Object} [options]
     */
    constructor(options) {
        super();
        this.options = Object.assign({
            frequency: 0.9,
            alpha: 0.57,
        }, options);
        this.frequency = Math.abs(1 - this.options.frequency);
        this.alpha = this.options.alpha;
    }
    /**
     * @inheritDoc
     */
    apply(ctx) {
        let _step = Math.floor(this.frequency * ctx.canvas.height);
        for (
            let i = 0;
            i < ctx.canvas.height;
            i += Math.floor(((Math.random() * 100) % 100) + _step)
        ) {
            let _from = Math.floor(((Math.random() * 1000) % ctx.canvas.width));
            let _width = Math.floor(
                (Math.random() * 1000) % (ctx.canvas.width - _from)
            );
            ctx.beginPath();
            ctx.setLineDash((
                    new Array(3).fill(0)
                ).map((e) => Math.floor(Math.random() * 100) % 20));
            ctx.strokeStyle = `rgba(255,255,255,${this.alpha})`;
            ctx.moveTo(_from, i);
            ctx.lineTo(_from + _width, i);
            ctx.stroke();
        }
    }
}

/**
 * Визуализирует звуковой канал на сцене в виде диаграмы уровня громкости.
 */
class FilterVoice extends Filter {
    /**
     * Конструктор класса.
     * @param {Object} [options]
     */
    constructor(options) {
        super();
        this.options = Object.assign({
            position: {
                x: 5,
                y: 100,
            },
            fillStyle: 'rgba(255, 252, 28, 0.7)',
            maxWidth: 200,
            height: 20,
            mediaStream: null,
        }, options);
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this._audioContext = new AudioContext();
        this._analyzer = this._audioContext.createAnalyser();
        this._micro = this._audioContext
            .createMediaStreamSource(this.options.mediaStream);
        this._processor = this._audioContext.createScriptProcessor(2048, 1, 1);
        this._processor.fftSize = 1024;
        this._processor.smoothingTimeConstant = 0.8;
        this._micro.connect(this._analyzer);
        this._analyzer.connect(this._processor);
        this._processor.connect(this._audioContext.destination);
        this._processor.onaudioprocess = this._audioProcessHandle.bind(this);
        this._maxValue = 0.01;
    }

    /**
     * Обработчик события audioProcess класса Processor.
     * @param {Event} e
     * @private
     */
    _audioProcessHandle(e) {
        let _bytes = new Uint8Array(this._analyzer.frequencyBinCount);
        this._analyzer.getByteFrequencyData(_bytes);
        this._volume = _bytes.reduce((a, b) => a + b, 0) / _bytes.length;
        this._maxValue = Math.max(this._maxValue, this._volume);
    }

    /**
     * @inheritDoc
     */
    apply(ctx) {
        let _x = Math.floor((this.options.position.x / 100) * ctx.canvas.width)
            - this.options.maxWidth;
        let _y = Math.floor((this.options.position.y / 100) * ctx.canvas.height)
            - this.options.height;
        let _volumePercent = (this._volume / this._maxValue);
        let _width = Math.floor(_volumePercent * this.options.maxWidth);
        ctx.fillStyle = this.options.fillStyle;
        ctx.fillRect(
            _x < 0 ? 0 : _x,
            _y < 0 ? 0 : _y,
            _width,
            this.options.height
        );
    }
}
