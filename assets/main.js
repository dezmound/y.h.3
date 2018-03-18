/**
 * Выводит случайный текст в блок.
 */
class CodeGenerator {
    /**
     * Конструктор.
     * @param {Element} element Элемент, в который будет выводится текст.
     * @param {Object} [options]
     */
    constructor(element, options) {
        this.options = Object.assign({
            delay: 15,
        });
        this._codeElement = element;
        this._delay = this.options.delay;
        this._vocabulary = [
            'push',
            'pop',
            'add',
            'div',
            'jmp',
            'jnz',
            'call',
            'ret',
        ];
    }

    /**
     * Запускает генератор случайных последовательностей.
     */
    runGenerator() {
        let _numbers = (new Array(Math.floor(Math.random() * 1000 % 40)))
            .fill(0)
            .map((e) => Math.floor(Math.random() * 100));
        this._text = _numbers.map(
            (e) => (~e).toString(2).padStart(8, '00000000')
        );
        this._vocabulary.map((e) => {
            this._text.splice(
                Math.random() * 10000 % this._text.length,
                0,
                e
            );
        });
        this._text = this._text.join(' ');
        this._index = 0;
        this._timeout = setTimeout(this._update.bind(this), this._delay);
    }

    /**
     * Обновляет содержимое элемента с кодом.
     * @private
     */
    _update() {
        if (++this._index >= this._text.length) {
            this.stopGenerator();
            this.runGenerator();
        }
        this._codeElement.innerHTML = this._text.slice(0, this._index);
        this._timeout = setTimeout(this._update.bind(this), this._delay);
    }

    /**
     * Останавливает генератор случайных последовательностей.
     */
    stopGenerator() {
        clearTimeout(this._timeout);
    }
}

/**
 * Передвигает элемент по сцене случайным образом.
 */
class SceneWalker {
    /**
     * Конструктор класса.
     * @param {Element} walker
     * @param {Object} [options]
     */
    constructor(walker, options) {
        this.options = Object.assign({
            delay: 700,
        }, options);
        this._walker = walker;
        this._delay = this.options.delay;
    }

    /**
     * Запускает эффект случайного блуждания по сцене.
     */
    run() {
        this._timer = setTimeout(this._move.bind(this), this._delay);
    }

    /**
     * Останавливает эффект.
     */
    stop() {
        clearTimeout(this._timer);
    }

    /**
     * Вычисляет новую позицию элемента на сцене.
     * @private
     */
    _move() {
        let parentRect = this._walker.parentNode.getBoundingClientRect();
        this._walker.style.transform = `translate(
            ${Math.floor(Math.random() * 1000 % parentRect.width)}px, 
            ${Math.floor(Math.random() * 1000 % parentRect.height)}px
        )`;
        this.run();
    }
}

window.onload = function(e) {
    try {
        let canvas = new Canvas3D(document.querySelector('canvas'));
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
        navigator.getUserMedia({
            video: true,
            audio: true,
        }, function(stream) {
            canvas.addFilter(new FilterNone());
            canvas.addFilter(new FilterFace({
                clearTarget: true,
            }));
            canvas.addFilter3D(new Filter3DDis());
            canvas.addFilter(new FilterTerminatorVisionRed());
            canvas.addFilter(new FilterNoise());
            canvas.addFilter(new FilterVoice({
                mediaStream: stream,
            }));
            canvas.captureVideoStream(VideoStream.fromMedia(stream));
        }, function(e) {
            throw new Error(e);
        });
        let codeGenerator = new CodeGenerator(document.querySelector('.code'));
        codeGenerator.runGenerator();
        let walker = new SceneWalker(document.querySelector('.scene-walker'));
        walker.run();
    } catch (e) {
        console.log(e);
    }
};
