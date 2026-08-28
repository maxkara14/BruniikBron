function renderScripts() {
    const container = document.getElementById('scripts-container');
    if (!container) return;

    container.replaceChildren();

    for (const script of siteData.scripts || []) {
        const card = document.createElement('article');
        card.className = 'card';

        const header = document.createElement('div');
        header.className = 'post-header';

        const avatar = document.createElement('div');
        avatar.className = 'avatar utility';
        avatar.textContent = '⌘';
        avatar.setAttribute('aria-hidden', 'true');

        const meta = document.createElement('div');
        meta.className = 'post-meta';

        const title = document.createElement('div');
        title.className = 'post-author';
        title.textContent = script.title;

        const type = document.createElement('span');
        type.className = 'post-time';
        type.textContent = 'Скрипт SillyTavern • JSON';

        const body = document.createElement('div');
        body.className = 'post-body';

        const description = document.createElement('p');
        description.textContent = script.description;

        const download = document.createElement('a');
        download.className = 'btn download-btn';
        download.href = script.scriptFile;
        download.download = '';
        download.textContent = script.btnText || 'Скачать JSON';

        meta.append(title, type);
        header.append(avatar, meta);
        body.append(description, download);
        card.append(header, body);
        container.append(card);
    }
}

function setupScriptsToggle() {
    const section = document.getElementById('scripts-section');
    const header = section?.querySelector('h2');
    const wrapper = document.getElementById('scripts-toggle-wrapper');
    const inner = wrapper?.querySelector('.toggle-inner');
    if (!section || !header || !wrapper || !inner) return;

    let collapsed = true;
    let transitionTimer;

    const finishTransition = () => {
        wrapper.dataset.animating = 'false';
        if (!collapsed) wrapper.style.height = 'auto';
    };

    const setCollapsed = (nextCollapsed, immediate = false) => {
        collapsed = nextCollapsed;
        header.classList.toggle('collapsed', collapsed);
        section.classList.toggle('is-collapsed', collapsed);
        wrapper.classList.toggle('collapsed', collapsed);
        header.setAttribute('aria-expanded', String(!collapsed));
        clearTimeout(transitionTimer);

        if (immediate) {
            wrapper.style.height = collapsed ? '0px' : 'auto';
            wrapper.dataset.animating = 'false';
            return;
        }

        wrapper.dataset.animating = 'true';
        wrapper.style.height = `${inner.scrollHeight}px`;

        requestAnimationFrame(() => {
            wrapper.style.height = collapsed ? '0px' : `${inner.scrollHeight}px`;
        });

        transitionTimer = setTimeout(finishTransition, 420);
    };

    const toggle = () => setCollapsed(!collapsed);

    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggle();
    });

    if ('ResizeObserver' in window) {
        const resizeObserver = new ResizeObserver(() => {
            if (!collapsed && wrapper.dataset.animating === 'true') {
                wrapper.style.height = `${inner.scrollHeight}px`;
            }
        });
        resizeObserver.observe(inner);
    }

    setCollapsed(true, true);
}

document.addEventListener('DOMContentLoaded', () => {
    renderScripts();
    setupScriptsToggle();
});
