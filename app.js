// Отрисовка расширений
function renderExtensions() {
    const container = document.getElementById('extensions-container');
    container.innerHTML = ''; 
    
    siteData.extensions.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="post-header">
                <div class="avatar utility">E</div>
                <div class="post-meta">
                    <span class="post-author">${item.title}</span>
                    <span class="post-time">SillyTavern Extension</span>
                </div>
            </div>
            <div class="post-body">
                <p>${item.description}</p>
                <a href="${item.url}" target="_blank" class="btn download-btn">🔗 ${item.btnText}</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// Отрисовка ботов
function renderBots() {
    const container = document.getElementById('bots-container');
    container.innerHTML = '';
    
    siteData.bots.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="post-header">
                <div class="avatar bot">C</div>
                <div class="post-meta">
                    <span class="post-author">${item.title}</span>
                    <span class="post-time">Архив Персонажей • JSON</span>
                </div>
            </div>
            <div class="post-body">
                <p>${item.description}</p>
                <a href="${item.botFile}" download class="btn download-btn">💾 Скачать персонажа</a>
            </div>
        `;
        container.appendChild(card);
    });
}

// Отрисовка Галереи (v2.0 - Кликабельная)
function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;

    container.innerHTML = ''; 
    
    siteData.gallery.forEach(img => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        item.innerHTML = `
            <a href="${img.src}" target="_blank" rel="noopener noreferrer" title="Открыть оригинал: ${img.title}">
                <img src="${img.src}" alt="${img.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzZjJjMmMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iI2Q0YWYzNyIgZm9udC1zaXplPSIxOHB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QXJ0IEhlcmU8L3RleHQ+PC9zdmc+'" loading="lazy">
            </a>
        `;
        container.appendChild(item);
    });
}

// 🔧 Движок для спойлеров (с гидравликой)
function setupToggles() {
    const sections = [
        { id: 'extensions-section', contentId: 'extensions-container', collapseDefault: false },
        { id: 'bots-section', contentId: 'bots-container', collapseDefault: false },
        { id: 'gallery-section', contentId: 'gallery-container', collapseDefault: true } 
    ];

    sections.forEach(sec => {
        const sectionEl = document.getElementById(sec.id);
        if (!sectionEl) return;

        const header = sectionEl.querySelector('h2'); 
        const content = document.getElementById(sec.contentId); 

        if (!header || !content) return;

        header.classList.add('toggle-header');

        const wrapper = document.createElement('div');
        wrapper.className = 'toggle-wrapper';
        
        const inner = document.createElement('div');
        inner.className = 'toggle-inner';

        content.parentNode.insertBefore(wrapper, content);
        wrapper.appendChild(inner);
        inner.appendChild(content);

        if (sec.collapseDefault) {
            header.classList.add('collapsed');
            wrapper.classList.add('collapsed');
        }

        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            wrapper.classList.toggle('collapsed');
        });
    });
}

// === КАСТОМНЫЙ ПЛЕЕР ===
function initCustomPlayer() {
    const audio = document.getElementById('lofi-audio');
    const playBtn = document.getElementById('lofi-play-btn');
    const volSlider = document.getElementById('lofi-vol');
    if (!audio || !playBtn || !volSlider) return;

    audio.volume = volSlider.value;

    playBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playBtn.innerHTML = '⏸ PAUSE';
            playBtn.style.background = '#fff';
        } else {
            audio.pause();
            playBtn.innerHTML = '▶ PLAY';
            playBtn.style.background = 'var(--accent-gold)';
        }
    });

    volSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });
}

// === ПОМОДОРО ТАЙМЕР (С КАСТОМНЫМ ВВОДОМ) ===
function initPomodoro() {
    let defaultMins = 25;
    let timeLeft = defaultMins * 60; 
    let timerId = null;
    let isRunning = false;
    let completedCycles = 0; 
    
    const display = document.getElementById('pomo-display');
    const startBtn = document.getElementById('pomo-start');
    const resetBtn = document.getElementById('pomo-reset');
    
    if (!display || !startBtn || !resetBtn) return;

    function updateDisplay() {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        display.innerText = `${m}:${s}`;
    }

    // Тюнинг: Кастомный ввод времени по клику!
    display.style.cursor = 'pointer';
    display.title = 'Кликни, чтобы изменить время';
    display.addEventListener('click', () => {
        if (isRunning) {
            showLoFiToast("⏸ Сначала поставь на паузу, гонщик!");
            return;
        }
        let mins = prompt("Сколько минут заводим?", Math.floor(timeLeft / 60));
        // Защита от кривого ввода (букв, минусов)
        if (mins && !isNaN(mins) && mins > 0) {
            defaultMins = parseInt(mins);
            timeLeft = defaultMins * 60;
            updateDisplay();
            showLoFiToast(`⏱ Таймер перенастроен на ${defaultMins} мин.`);
        }
    });

    startBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timerId);
            startBtn.innerText = '▶ Старт';
        } else {
            timerId = setInterval(() => {
                if (timeLeft > 0) { 
                    timeLeft--; 
                    updateDisplay(); 
                } else { 
                    clearInterval(timerId); 
                    isRunning = false;
                    completedCycles++;
                    
                    // Фейерверк из светлячков по центру
                    for(let i = 0; i < 20; i++) {
                        setTimeout(() => {
                            const boomX = window.innerWidth / 2 + (Math.random() * 300 - 150);
                            const boomY = window.innerHeight / 2 + (Math.random() * 300 - 150);
                            if (typeof createFireflyExplosion === 'function') createFireflyExplosion(boomX, boomY);
                        }, i * 150); 
                    }
                    
                    showLoFiToast(`🍅 Цикл завершен! Всего помидорок за сегодня: ${completedCycles}`);
                    
                    timeLeft = 5 * 60; // 5 минут отдыха
                    updateDisplay();
                    startBtn.innerText = '☕ Отдых';
                }
            }, 1000);
            startBtn.innerText = '⏸ Пауза';
        }
        isRunning = !isRunning;
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerId);
        isRunning = false;
        timeLeft = defaultMins * 60; // Сбрасываем к последнему заданному времени
        startBtn.innerText = '▶ Старт';
        updateDisplay();
    });
}
// === ДВИЖОК DRAG & DROP (С СЕНСОРНЫМ ПРИВОДОМ) ===
function initDraggableWidgets() {
    const widgets = [
        { el: document.querySelector('.widget-left'), handle: document.querySelector('.pomo-title') },
        { el: document.querySelector('.widget-right'), handle: document.querySelector('.sticky-title') }
    ];

    widgets.forEach(widget => {
        if (!widget.el || !widget.handle) return;
        
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        function dragStart(e) {
            // Если тапаем с телефона - берем координаты первого пальца
            const evt = e.type.includes('touch') ? e.touches[0] : e;
            if (!e.type.includes('touch')) e.preventDefault(); 
            
            widget.el.classList.add('is-dragging');
            
            const rect = widget.el.getBoundingClientRect();
            widget.el.style.left = rect.left + 'px';
            widget.el.style.top = rect.top + 'px';
            widget.el.style.right = 'auto'; 
            widget.el.style.bottom = 'auto';

            pos3 = evt.clientX;
            pos4 = evt.clientY;
            
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchend', dragEnd);
            // passive: false нужно, чтобы телефон не пытался скроллить страницу во время таскания виджета!
            document.addEventListener('touchmove', dragMove, { passive: false }); 
        }

        function dragMove(e) {
            e.preventDefault(); // Глушим системный скролл
            const evt = e.type.includes('touch') ? e.touches[0] : e;
            pos1 = pos3 - evt.clientX;
            pos2 = pos4 - evt.clientY;
            pos3 = evt.clientX;
            pos4 = evt.clientY;
            
            widget.el.style.top = (widget.el.offsetTop - pos2) + "px";
            widget.el.style.left = (widget.el.offsetLeft - pos1) + "px";
        }

        function dragEnd() {
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchend', dragEnd);
            document.removeEventListener('touchmove', dragMove);
            widget.el.classList.remove('is-dragging');
        }

        // Цепляем и мышку, и пальцы
        widget.handle.addEventListener('mousedown', dragStart);
        widget.handle.addEventListener('touchstart', dragStart, { passive: false });
    });
}
// === СИСТЕМА УВЕДОМЛЕНИЙ (АЧИВКИ) ===
function showLoFiToast(message, color = 'var(--accent-gold)') {
    let container = document.getElementById('lofi-toasts');
    if (!container) {
        container = document.createElement('div');
        container.id = 'lofi-toasts';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'lofi-toast';
    toast.innerHTML = message;
    toast.style.borderLeftColor = color;
    container.appendChild(toast);
    
    // Самоуничтожение через 4.5 секунды
    setTimeout(() => { if(toast.parentNode) toast.remove(); }, 4500);
}
// === ДВИЖОК ЧАСТИЦ (ВЗРЫВ СВЕТЛЯЧКА) ===
function createFireflyExplosion(x, y) {
    const particleCount = 8; // Количество осколков при взрыве
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'firefly-particle';
        document.body.appendChild(particle);

        // Ставим частицу в координаты лопнувшего светлячка
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        // Вычисляем случайное направление разлета по кругу (360 градусов)
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 40 + 20; // Улетят на расстояние от 20 до 60px
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        // Запускаем анимацию через requestAnimationFrame (чтобы браузер не тупил)
        requestAnimationFrame(() => {
            particle.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
            particle.style.opacity = '0';
        });

        // Убираем мусор (осколки) из памяти через полсекунды
        setTimeout(() => { if (particle.parentNode) particle.remove(); }, 500);
    }
}
// === ГЕНЕРАТОР СВЕТЛЯЧКОВ (МИНИ-ИГРА) ===
function initFireflyMinigame() {
    let score = 0;
    let idleTimer; // Наш датчик холостого хода
    let reminderCount = 0; // Предохранитель от бесконечного спама

    // База забавных фраз для AFK
    const afkPhrases = [
        "✨ Эй, ты тут? Светлячки совсем расслабились!",
        "✨ Ты там уснул под Lo-Fi? Искры наглеют!",
        "✨ Приём, база! Плотность светлячков превышает норму!",
        "✨ АФК-режим обнаружен. Возвращайся к ловле!",
        "✨ Не зевай, а то все золотые жуки разлетятся!"
    ];

    const scoreBoard = document.createElement('div');
    scoreBoard.id = 'firefly-score-board';
    scoreBoard.innerHTML = '✨ Поймано: <span>0</span>';
    document.body.appendChild(scoreBoard);

    // Умная функция сброса таймера
    function resetIdleTimer() {
        clearTimeout(idleTimer); 
        
        // Заводим новый на 30 секунд (30000 миллисекунд)
        idleTimer = setTimeout(() => {
            if (reminderCount < 5) { // Теперь напомнит до 5 раз, фразы-то разные!
                if (score === 0) {
                    showLoFiToast("✨ Псс... Светлячки пролетают мимо! Попробуй поймать!");
                } else {
                    // Выбираем случайную фразу из нашего "бардачка"
                    const randomPhrase = afkPhrases[Math.floor(Math.random() * afkPhrases.length)];
                    showLoFiToast(randomPhrase);
                }
                reminderCount++;
            }
        }, 30000);
    }

    // Запускаем таймер при старте двигателя
    resetIdleTimer();

    // Конвейер светлячков
    setInterval(() => {
        if(Math.random() > 0.3) return; 

        const bug = document.createElement('div');
        bug.className = 'lofi-firefly';
        
        let size = Math.random() * 5 + 3;
        bug.style.width = size + 'px';
        bug.style.height = size + 'px';
        bug.style.left = Math.random() * 95 + 'vw';
        
        // Запоминаем время анимации конкретно этого жука
        let animDurationSec = Math.random() * 15 + 10;
        bug.style.animationDuration = animDurationSec + 's';

        bug.onclick = function() {
            if (this.dataset.dead) return;
            this.dataset.dead = true;

            score++;
            scoreBoard.querySelector('span').innerText = score;
            
            if(score === 1) scoreBoard.classList.add('active');
            
            // --- РАЗДАЧА АЧИВОК ---
            if (score === 1) showLoFiToast("🏆 Первая искра! Так держать!");
            if (score === 10) showLoFiToast("🏆 10 светлячков! Да ты в прайме, чел!", "#6b8c6c");
            if (score === 25) showLoFiToast("🔥 25 искр! А ты хорош, мужик, хороош!", "#e8d087");
            if (score === 50) showLoFiToast("👑 50! Хокаге светлячков!", "#c084fc");
            if (score === 100) showLoFiToast("💀 100 искр... Друг, может тебе траву потрогать?", "#ef4444");
            
            scoreBoard.style.transform = 'scale(1.1)';
            setTimeout(() => scoreBoard.style.transform = 'scale(1)', 150);

            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            createFireflyExplosion(centerX, centerY);
            this.remove();

            // СБРАСЫВАЕМ ТАЙМЕР АФК ПРИ КЛИКЕ!
            resetIdleTimer();
            // Сбрасываем счетчик спама, чтобы таймер снова мог напоминать
            reminderCount = 0; 
        };

        document.body.appendChild(bug);
        // Уничтожаем ИМЕННО когда заканчивается его личная анимация! (умножаем на 1000 для перевода в миллисекунды)
        setTimeout(() => { if(bug.parentNode) bug.remove(); }, animDurationSec * 1000);
    }, 2000);
}
// === ВИЗУАЛЬНЫЙ ЭФФЕКТ "ДЫХАНИЕ СПОКОЙНОГО ПОТОКА" ===
function initLoFiCursor() {
    const symbols = ['♪', '♫', '✧', '✦', '☕'];
    let lastEmitTime = 0;

    document.addEventListener('mousemove', function(e) {
        const now = Date.now();
        if (now - lastEmitTime < 80) return;
        if (Math.random() > 0.3) return;

        lastEmitTime = now;

        const particle = document.createElement('div');
        particle.className = 'lofi-particle';
        particle.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        
        const offsetX = (Math.random() - 0.5) * 20;
        const offsetY = (Math.random() - 0.5) * 20;
        
        particle.style.left = (e.pageX + offsetX) + 'px';
        particle.style.top = (e.pageY + offsetY) + 'px';
        
        if (Math.random() > 0.5) {
            particle.style.color = '#dcb97a';
            particle.style.textShadow = '0 0 8px rgba(220, 185, 122, 0.6)';
        }

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 2000);
    });
}
// === МЕХАНИКА СКЕТЧ-ЗАПИСОК (CANVAS С СЕНСОРОМ) ===
function initCanvasNotes() {
    const spawnBtn = document.createElement('button');
    spawnBtn.innerHTML = '📝 Новый скетч';
    spawnBtn.className = 'btn'; 
    spawnBtn.style.position = 'fixed';
    spawnBtn.style.bottom = '20px';
    spawnBtn.style.left = '20px';
    spawnBtn.style.zIndex = '2000';
    document.body.appendChild(spawnBtn);

    let noteCount = 0;

    spawnBtn.addEventListener('click', () => {
        noteCount++;
        const note = document.createElement('div');
        note.className = 'canvas-note';
        
        // === ПУЛЕНЕПРОБИВАЕМЫЙ СПАВН ===
        const noteWidth = 220; // Примерная полная ширина записки
        
        // Вычисляем X: берем ширину экрана, отнимаем ширину записки и делаем небольшой каскад
        let startX = window.innerWidth - noteWidth - 20 - (noteCount % 5) * 20;
        
        // Если экран совсем узкий (мобилка) и места справа не осталось, паркуем слева
        if (startX < 20) {
            startX = 20 + (noteCount % 3) * 10;
        }
        
        note.style.top = (100 + (noteCount % 5) * 30) + 'px';
        note.style.left = startX + 'px';
        note.style.right = 'auto'; // Строго отрываем от правого края, чтобы не было конфликта CSS!

        note.innerHTML = `
            <div class="canvas-handle" title="Потяни меня"></div>
            <div class="canvas-pin"></div>
            <div class="canvas-close" title="Выкинуть в мусорку">✖</div>
            <canvas width="180" height="180" class="canvas-board"></canvas>
        `;
        document.body.appendChild(note);

        note.querySelector('.canvas-close').addEventListener('click', () => {
            note.style.transform = 'scale(0)';
            setTimeout(() => note.remove(), 200);
        });

        // --- МЕХАНИКА ПЕРЕТАСКИВАНИЯ ---
        const handle = note.querySelector('.canvas-handle');
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        function dragStart(e) {
            const evt = e.type.includes('touch') ? e.touches[0] : e;
            if (!e.type.includes('touch')) e.preventDefault();
            note.style.zIndex = 1600 + noteCount;
            pos3 = evt.clientX; 
            pos4 = evt.clientY;
            
            document.addEventListener('mouseup', dragEnd);
            document.addEventListener('mousemove', dragMove);
            document.addEventListener('touchend', dragEnd);
            document.addEventListener('touchmove', dragMove, { passive: false });
        }
        
        function dragMove(e) {
            e.preventDefault();
            const evt = e.type.includes('touch') ? e.touches[0] : e;
            pos1 = pos3 - evt.clientX; 
            pos2 = pos4 - evt.clientY;
            pos3 = evt.clientX; 
            pos4 = evt.clientY;
            note.style.top = (note.offsetTop - pos2) + "px";
            note.style.left = (note.offsetLeft - pos1) + "px";
        }

        function dragEnd() {
            document.removeEventListener('mouseup', dragEnd);
            document.removeEventListener('mousemove', dragMove);
            document.removeEventListener('touchend', dragEnd);
            document.removeEventListener('touchmove', dragMove);
        }

        handle.addEventListener('mousedown', dragStart);
        handle.addEventListener('touchstart', dragStart, { passive: false });

        // --- МЕХАНИКА РИСОВАНИЯ ---
        const canvas = note.querySelector('.canvas-board');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        ctx.strokeStyle = '#3b301a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const evt = e.type.includes('touch') ? e.touches[0] : e;
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }

        function startDraw(e) {
            if (e.type.includes('touch')) e.preventDefault(); // Глушим скролл при рисовании
            isDrawing = true;
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }

        function draw(e) {
            if (!isDrawing) return;
            if (e.type.includes('touch')) e.preventDefault(); // Глушим скролл при рисовании
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }

        function stopDraw() { isDrawing = false; }

        // Слушаем мышь
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDraw);
        canvas.addEventListener('mouseleave', stopDraw);
        
        // Слушаем сенсор (телефоны/планшеты)
        canvas.addEventListener('touchstart', startDraw, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDraw);
        canvas.addEventListener('touchcancel', stopDraw);
    });
}

// === ЗАПУСК ВСЕХ ДВИЖКОВ ПРИ СТАРТЕ ===
document.addEventListener('DOMContentLoaded', () => {
    // Восстановленные базовые модули:
    renderExtensions(); 
    renderBots();       
    renderGallery();    
    setupToggles();     
    initCustomPlayer(); 

    // Наши новые турбины и интерактив:
    initPomodoro();     
    initLoFiCursor();   
    initDraggableWidgets(); 
    initFireflyMinigame();  
    initCanvasNotes(); 
});
