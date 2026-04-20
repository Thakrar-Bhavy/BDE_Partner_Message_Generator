// ⚠️ PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW
// Example: "https://script.google.com/macros/s/AKfycby.../exec"
const GAS_AUTH_URL = "https://script.google.com/macros/s/AKfycbwtovABUZBHU1gTx-d4Y3vN3UErLyewDToR9Y0fMWijDQ1dTi_FXlDk2pKs6ekyNCScDQ/exec";

document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    initializePage();
});

function initializePage() {
    const page = document.body?.dataset?.page || 'router';

    if (page === 'router') {
        routeEntryPage();
        return;
    }

    if (page === 'login') {
        initializeLoginPage();
        return;
    }

    if (page === 'dashboard') {
        initializeDashboardPage();
    }
}

function routeEntryPage() {
    if (isLoggedIn()) {
        window.location.replace('dashboard.html');
        return;
    }

    window.location.replace('login.html');
}

function isLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true' && Boolean(localStorage.getItem('username'));
}

function initializeLoginPage() {
    if (isLoggedIn()) {
        showApp(localStorage.getItem('username'));
        return;
    }

    const loginBtn = document.getElementById('loginBtn');
    const passwordInput = document.getElementById('loginPassword');
    const usernameInput = document.getElementById('loginUsername');
    const passToggle = document.getElementById('passToggle');

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        loginBtn.disabled = false;
        loginBtn.textContent = 'Enter Workspace \u2192';
    }

    if (passwordInput) {
        passwordInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                handleLogin();
            }
        });
    }

    if (usernameInput) {
        usernameInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                passwordInput?.focus();
            }
        });
    }

    if (passToggle) {
        passToggle.addEventListener('click', () => {
            const passInput = document.getElementById('loginPassword');
            if (!passInput) {
                return;
            }

            const isPassword = passInput.type === 'password';
            passInput.type = isPassword ? 'text' : 'password';
            passToggle.textContent = isPassword ? '\uD83D\uDE48' : '\uD83D\uDC41';
        });
    }
}

function initializeDashboardPage() {
    if (!isLoggedIn()) {
        showLogin();
        return;
    }

    const storedUsername = localStorage.getItem('username') || 'User';
    const displayName = storedUsername.charAt(0).toUpperCase() + storedUsername.slice(1);
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Hi, ${displayName} \uD83D\uDC4B`;
    }

    const themeToggle = document.getElementById('themeToggle');
    const logoutBtn = document.getElementById('logoutBtn');

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    if (typeof handleModeSelection === 'function') {
        handleModeSelection('selection');
    }

    if (typeof initializeDashboardApp === 'function') {
        initializeDashboardApp();
    }
}

function handleModeSelection(mode) {
    const selectionSection = document.getElementById('inputSelectionSection');
    const manualSection = document.getElementById('manualFormSection');
    const fullProfileSection = document.getElementById('fullProfileSection');
    const outputSection = document.getElementById('outputAndTipsSection');

    [selectionSection, manualSection, fullProfileSection].forEach(section => {
        if (!section) {
            return;
        }
        section.classList.add('hidden');
        section.classList.remove('active');
    });

    if (outputSection) {
        outputSection.classList.add('hidden');
        outputSection.classList.remove('active');
    }

    if (mode === 'manual') {
        manualSection?.classList.remove('hidden');
        manualSection?.classList.add('active');
        outputSection?.classList.remove('hidden');
        outputSection?.classList.add('active');
    } else if (mode === 'fullProfile') {
        fullProfileSection?.classList.remove('hidden');
        fullProfileSection?.classList.add('active');
        outputSection?.classList.remove('hidden');
        outputSection?.classList.add('active');
    } else {
        selectionSection?.classList.remove('hidden');
        selectionSection?.classList.add('active');
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('linkedinOutreachTheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    updateThemeToggleLabel();
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem('linkedinOutreachTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeToggleLabel();
}

function updateThemeToggleLabel() {
    const button = document.getElementById('themeToggle');
    if (!button) {
        return;
    }

    button.innerHTML = document.body.classList.contains('dark-mode') ? '&#9728; Light' : '&#127769; Dark';
}

async function handleLogin() {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const loginBtn = document.getElementById('loginBtn');

    if (!usernameInput || !passwordInput || !loginBtn) {
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        showLoginError('\u26A0 Please enter both username and password.');
        return;
    }

    hideLoginError();
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="login-spinner">◷</span> Authenticating...';

    // Mock bypass if they haven't set the URL yet (so the app doesn't break entirely during setup)
    if (GAS_AUTH_URL === "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE") {
        console.warn("GAS_AUTH_URL is not set. Using fallback mock authentication.");
        setTimeout(() => {
            if (username === "dev" || username === "bhavy") {
                loginSuccess(username, loginBtn, passwordInput);
            } else {
                loginFailed('\u26A0 Invalid generic config. Set your GAS_AUTH_URL.', loginBtn);
            }
        }, 800);
        return;
    }

    try {
        // Prepare the payload URL for GET request (easier to avoid CORS issues with Apps script for simple apps)
        const params = new URLSearchParams({ username: username, password: password });
        const requestUrl = `${GAS_AUTH_URL}?${params.toString()}`;

        const response = await fetch(requestUrl, {
            method: 'GET',
            mode: 'cors',
            redirect: 'follow'
        });

        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
            loginSuccess(data.username || username, loginBtn, passwordInput);
        } else {
            loginFailed(`\u26A0 ${data.message || 'Invalid username or password'}`, loginBtn);
        }
    } catch (error) {
        console.error("Login fetch error:", error);
        loginFailed('\u26A0 Connection error: Make sure your Script is deployed with Access: "Anyone".', loginBtn);
    }
}

function loginSuccess(username, loginBtn, passwordInput) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Enter Workspace \u2192';
    if (passwordInput) passwordInput.value = '';
    showApp(username);
}

function loginFailed(message, loginBtn) {
    showLoginError(message);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Enter Workspace \u2192';
}

function showApp(username) {
    const currentPage = document.body?.dataset?.page;
    if (currentPage !== 'dashboard') {
        window.location.replace('dashboard.html');
        return;
    }

    const displayName = username ? username.charAt(0).toUpperCase() + username.slice(1) : 'User';
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Hi, ${displayName} \uD83D\uDC4B`;
    }
}

function showLogin() {
    const currentPage = document.body?.dataset?.page;
    if (currentPage !== 'login') {
        window.location.replace('login.html');
        return;
    }

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Enter Workspace \u2192';
    }
}

function logoutUser() {
    localStorage.clear();
    window.location.replace('login.html');
}

function showLoginError(message) {
    const errorBox = document.getElementById('loginError');
    if (!errorBox) {
        return;
    }

    errorBox.textContent = message;
    errorBox.classList.add('show');
}

function hideLoginError() {
    const errorBox = document.getElementById('loginError');
    if (!errorBox) {
        return;
    }

    errorBox.classList.remove('show');
    errorBox.textContent = '';
}

// -----------------------------------------------------
// SECURITY: Disable Right-Click and Developer Tools
// -----------------------------------------------------

// Disable Right-Click
document.addEventListener('contextmenu', event => event.preventDefault());

// Disable DevTools keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }
    // Ctrl+Shift+I, J, C
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
});