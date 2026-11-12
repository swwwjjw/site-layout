document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('words-input');
    const btnParse = document.getElementById('btn-parse');
    const btnReset = document.getElementById('btn-reset');
    const block1Output = document.getElementById('block-1-output');
    const block2 = document.getElementById('block-2');
    const block3 = document.getElementById('block-3');

    let itemsData = [];
    let draggedElement = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    function getRandomColor() {
        const h = Math.floor(Math.random() * 360);
        return `hsl(${h}, 70%, 80%)`;
    }

    // 1. Парсинг и отрисовка
    function parseAndRender() {
        const str = input.value;
        const tokens = str.split(/[-–]/).map(s => s.trim()).filter(Boolean);

        let lower = [], upper = [], nums = [];

        tokens.forEach(token => {
            if (!isNaN(Number(token))) {
                nums.push(token);
            } else if (token[0] === token[0].toUpperCase() && token[0] !== token[0].toLowerCase()) {
                upper.push(token);
            } else {
                lower.push(token);
            }
        });

        lower.sort((a, b) => a.localeCompare(b));
        upper.sort((a, b) => a.localeCompare(b));
        nums.sort((a, b) => Number(a) - Number(b));

        itemsData = [];
        let aCount = 1, bCount = 1, nCount = 1;

        lower.forEach(w => itemsData.push({ id: `a${aCount++}`, value: w, color: getRandomColor() }));
        upper.forEach(w => itemsData.push({ id: `b${bCount++}`, value: w, color: getRandomColor() }));
        nums.forEach(w => itemsData.push({ id: `n${nCount++}`, value: w, color: getRandomColor() }));

        renderBlock2();
    }

    function renderBlock2() {
        block2.innerHTML = '';
        block3.innerHTML = '';
        block1Output.innerHTML = '';
        
        itemsData.forEach(item => {
            const el = document.createElement('div');
            el.className = 'word-item';
            el.dataset.id = item.id;
            el.dataset.value = item.value;
            el.dataset.originalColor = item.color;
            el.textContent = `${item.id} ${item.value}`;
            el.style.backgroundColor = item.color;
            el.draggable = true;
            
            block2.appendChild(el);
        });
    }

    // 2. Проверка пересечения (коллизии)
    function isOverlapping(newEl, newLeft, newTop) {
        const newRect = {
            left: newLeft,
            top: newTop,
            right: newLeft + newEl.offsetWidth,
            bottom: newTop + newEl.offsetHeight
        };

        const children = Array.from(block3.children);
        for (let child of children) {
            if (child === newEl) continue; // Пропускаем сам перетаскиваемый элемент

            const childRect = {
                left: parseFloat(child.style.left) || 0,
                top: parseFloat(child.style.top) || 0,
                right: (parseFloat(child.style.left) || 0) + child.offsetWidth,
                bottom: (parseFloat(child.style.top) || 0) + child.offsetHeight
            };

            // Проверка пересечения прямоугольников
            const isOverlap = !(
                newRect.right < childRect.left ||
                newRect.left > childRect.right ||
                newRect.bottom < childRect.top ||
                newRect.top > childRect.bottom
            );

            if (isOverlap) return true;
        }
        return false;
    }

    // 3. Drag & Drop
    document.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('word-item')) return;
        
        draggedElement = e.target;
        
        // Запоминаем смещение курсора относительно элемента
        const rect = draggedElement.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        e.dataTransfer.setData('text/plain', draggedElement.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    });

    // Над Блоком 3
    block3.addEventListener('dragover', (e) => {
        e.preventDefault();
        block3.classList.add('drag-over');
    });
    block3.addEventListener('dragleave', () => {
        block3.classList.remove('drag-over');
    });

    // Сброс в Блок 3
    block3.addEventListener('drop', (e) => {
        e.preventDefault();
        block3.classList.remove('drag-over');
        
        if (!draggedElement) return;
        const id = e.dataTransfer.getData('text/plain');
        const el = document.querySelector(`[data-id="${id}"]`);
        if (!el) return;

        const block3Rect = block3.getBoundingClientRect();
        
        // Вычисляем новые координаты
        let newLeft = e.clientX - block3Rect.left - dragOffsetX;
        let newTop = e.clientY - block3Rect.top - dragOffsetY;

        // Если элемент перетаскивается в Блок 3 впервые (из Блока 2)
        if (el.parentElement !== block3) {
            el.style.width = el.offsetWidth + 'px'; // Фиксируем ширину
            el.style.position = 'absolute';
            block3.appendChild(el);
        }

        // Проверка на наложение
        if (isOverlapping(el, newLeft, newTop)) {
            // Если накладывается, оставляем старые координаты (или можно вернуть в Блок 2)
            return; 
        }

        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;
    });

    // Над Блоком 2 (для возврата)
    block2.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Сброс в Блок 2 (Возврат)
    block2.addEventListener('drop', (e) => {
        e.preventDefault();
        
        if (!draggedElement) return;
        const id = e.dataTransfer.getData('text/plain');
        const el = document.querySelector(`[data-id="${id}"]`);
        if (!el) return;

        // Сброс стилей
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.width = '';
        el.style.zIndex = '';
        el.style.backgroundColor = el.dataset.originalColor;

        // Восстановление порядка
        const originalIndex = itemsData.findIndex(item => item.id === id);
        const allItems = Array.from(block2.children);
        let inserted = false;

        for (let i = 0; i < allItems.length; i++) {
            const currentId = allItems[i].dataset.id;
            const currentIndex = itemsData.findIndex(item => item.id === currentId);
            
            if (currentIndex > originalIndex) {
                block2.insertBefore(el, allItems[i]);
                inserted = true;
                break;
            }
        }
        if (!inserted) block2.appendChild(el);
    });

    // 4. Клик по элементу в Блоке 3
    block3.addEventListener('click', (e) => {
        const el = e.target.closest('.word-item');
        if (!el) return;

        const value = el.dataset.value;
        const originalColor = el.dataset.originalColor;

        const span = document.createElement('span');
        span.className = 'clicked-word';
        span.textContent = value;
        span.style.color = originalColor;
        
        block1Output.appendChild(span);
    });

    // 5. Кнопки
    btnParse.addEventListener('click', parseAndRender);
    btnReset.addEventListener('click', () => {
        input.value = '';
        block1Output.innerHTML = '';
        block2.innerHTML = '';
        block3.innerHTML = '';
        itemsData = [];
    });
});