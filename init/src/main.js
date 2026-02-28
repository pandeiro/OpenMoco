import './style.css';
import { initLogger } from './lib/logger.js';

initLogger();

// Router simple implementation
const routes = {
    '/init/': 'home',
    '/init/welcome': 'welcome',
    '/init/repos': 'repos',
    '/init/resume': 'resume',
};

async function router() {
    const path = window.location.pathname;
    const route = routes[path] || 'home';

    const app = document.getElementById('app');
    app.innerHTML = '<div class="container"><p>Loading...</p></div>';

    try {
        const { render } = await import(`./views/${route}.js`);
        app.innerHTML = '';
        const view = await render();
        app.appendChild(view);
    } catch (err) {
        console.error('Routing failed:', err);
        app.innerHTML = `<div class="container"><p class="error">Failed to load view: ${err.message}</p></div>`;
    }
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/init/sw.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.error('SW failed:', err));
    });
}

// Navigation helper
window.navigate = (path) => {
    window.history.pushState({}, '', path);
    router();
};

window.addEventListener('popstate', router);
router();
