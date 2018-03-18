Source map:
```
assets
├── drawing.js // Модуль отрисовки видео изображения на canvas элементе.
├── filters.js // Фильтры для классов Canvas2D/Canvas3D
├── filtersWebGl.js // Фильтры для класса Canvas3D.
└── main.js // Основная логика приложения + классы для работы с DOM элементами типа {.code|.scene-walker}.
```
На странице добавил несколько эффектов.
1. `FilterTerminatorVisionRed` - накладывает красный цвет на изображение.   
Реализован путем изменения значения цвета в `ImageData`, изображения на canvas.
2. `FilterNoise` - накладывает белые полосы на изображение в canvas.   
Использует стандартные методы для рисования на canvas.
3. `FilterVoice` - рисует на canvas диаграмму текущего уровня громкости в виде прямоугольника.
4. `FilterFace` - рисует на canvas прямоугольник с текстом если находит на нем лицо.   
Сканирует изображение с определенной переодичностью, по умолчанию - 1 секунда.
5. `Filter3DDis` - смещает синий и зеленый канал изображения на определенную константу.
6. `CodeGenerator` - генерирует рандомный текст и выводит его посимвольно в элемент с определенной задержкой.
7. `SceneWalker` - случайным образом перемещает элемент по сцене, использует `CSS` анимации.

P.S. В `FireFox` подтормаживает изображение, если стоит фильтр `Filter3DDis`.   
Я думаю проблема в библиотеке `three.js` и в том коде, что она вставляетв начало `fragmentShader`.    
Потому что в консоли у меня падает такой `warning`:
```
THREE.WebGLShader: gl.getShaderInfoLog() fragment 0:2(12): warning: extension `GL_ARB_gpu_shader5' unsupported in fragment shader
```
