/* ============================================
   Premier League Analytics — Main App
   ============================================ */

const API_BASE = '';

// ---------- API Helper ----------
async function api(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        if (response.status === 204) return null;
        return await response.json();
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err);
        throw err;
    }
}

// ---------- Toast Notifications ----------
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ---------- Modal ----------
function openModal(title, bodyHTML, footerHTML) {
    const overlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;

    if (footerHTML) {
        modalFooter.innerHTML = footerHTML;
        modalFooter.style.display = 'flex';
    } else {
        modalFooter.innerHTML = '';
        modalFooter.style.display = 'none';
    }

    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// ---------- Loading ----------
function showLoading() {
    return '<div class="loading"><div class="spinner"></div></div>';
}

// ---------- Empty State ----------
function showEmpty(icon, text) {
    return `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <p class="empty-state-text">${text}</p>
        </div>
    `;
}

// ---------- Router ----------
const pages = {};

function registerPage(name, renderFn) {
    pages[name] = renderFn;
}

async function navigateTo(pageName) {
    const mainContent = document.getElementById('mainContent');

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });

    // Show loading
    mainContent.innerHTML = showLoading();

    // Render page
    if (pages[pageName]) {
        try {
            mainContent.innerHTML = '<div class="fade-in"></div>';
            const html = await pages[pageName]();
            mainContent.querySelector('.fade-in').innerHTML = html;

            // Run page init if exists
            const initFn = window[`init_${pageName}`];
            if (typeof initFn === 'function') {
                initFn();
            }
        } catch (err) {
            mainContent.innerHTML = showEmpty('❌', `Failed to load page: ${err.message}`);
        }
    } else {
        mainContent.innerHTML = showEmpty('🔍', 'Page not found');
    }

    // Close mobile sidebar
    closeMobileSidebar();

    // Update URL hash
    window.location.hash = pageName;
}

// ---------- Mobile Sidebar ----------
function openMobileSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('active');
    document.getElementById('menuToggle').classList.add('active');
}

function closeMobileSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('active');
    document.getElementById('menuToggle').classList.remove('active');
}

// ---------- Utility: Format Date ----------
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

// ---------- Utility: Escape HTML ----------
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
    // Nav clicks
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });

    // Mobile menu
    document.getElementById('menuToggle').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.classList.contains('open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    });

    document.getElementById('sidebarOverlay').addEventListener('click', closeMobileSidebar);

    // Modal close
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    // Route from hash or default to dashboard
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(hash);
});

// Handle browser back/forward
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    navigateTo(hash);
});
