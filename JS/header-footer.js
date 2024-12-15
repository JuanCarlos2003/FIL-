const API_URL = "http://localhost:3000"; // Ajustar URL de tu API
let token = null;
let currentUsername = null;

document.addEventListener('DOMContentLoaded', () => {
    const header = `
        <header>
            <div class="logo">FIL+</div>
            <div class="header-content">
                <ul class="nav-links">
                    <li><a href="index.html">Inicio</a></li>
                    <li><a href="eventos.html">Programación</a></li>
                    <li><a href="expositores.html">Expositores</a></li>
                    <li><a href="comunidad.html">Comunidad</a></li>
                    <li><a href="libros.html">Biblioteca</a></li>
                </ul>
                <div class="header-right">
                    <form id="searchForm" class="search-bar" action="#" method="get">
                        <input id="searchQuery" type="text" name="search" placeholder="Buscar..." aria-label="Buscar">
                        <button type="submit">🔍</button>
                    </form>
                    <div id="userSection" style="display:inline-block;margin-left:20px;"></div>
                </div>
            </div>
        </header>
    `;
    const footer = `
        <footer>
            <div class="footer-container">
                <div class="footer-column">
                    <h3>Información</h3>
                    <ul>
                        <li><strong>Ubicación:</strong> Expo Guadalajara, Jalisco, México</li>
                        <li><strong>Fechas:</strong> 25 de noviembre al 3 de diciembre</li>
                        <li><strong>Horarios:</strong> 9:00 AM - 8:00 PM</li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Enlaces Útiles</h3>
                    <ul>
                        <li><a href="index.html">Inicio</a></li>
                        <li><a href="programacion.html">Programación</a></li>
                        <li><a href="expositores.html">Expositores</a></li>
                        <li><a href="comunidad.html">Comunidad</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h3>Síguenos</h3>
                    <ul class="social-links">
                        <li><a href="#">Facebook</a></li>
                        <li><a href="#">Twitter</a></li>
                        <li><a href="#">Instagram</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 FIL+. Todos los derechos reservados.</p>
            </div>
        </footer>
    `;

    document.getElementById('header-container').innerHTML = header;
    document.getElementById('footer-container').innerHTML = footer;

    // Recuperar token y username del localStorage si existen
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
        token = savedToken;
        currentUsername = savedUsername;
    }

    renderUserSection();
});

function renderUserSection() {
    const userSection = document.getElementById('userSection');
    if (token && currentUsername) {
        userSection.innerHTML = `
            <span style="font-weight:bold;">${currentUsername}</span>
            <button id="logoutBtn" style="padding:5px 10px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer;">Cerrar Sesión</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', logoutUser);
    } else {
        userSection.innerHTML = `<button id="loginBtn" class="btn-login">Iniciar Sesión</button>`;
        document.getElementById('loginBtn').addEventListener('click', showLoginModal);
    }
}

function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="modal-forms">
                <h2>Iniciar Sesión</h2>
                <form id="loginForm">
                    <label for="logUsername">Usuario:</label>
                    <input id="logUsername" type="text" required>
                    <label for="logPassword">Contraseña:</label>
                    <input id="logPassword" type="password" required>
                    <button type="submit">Ingresar</button>
                </form>
                <p>¿No tienes cuenta? <a href="#" id="switchToRegister">Regístrate aquí</a></p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('.close').addEventListener('click', closeModal);

    const switchToRegister = modal.querySelector('#switchToRegister');
    switchToRegister.addEventListener('click', () => {
        modal.querySelector('#modal-forms').innerHTML = `
            <h2>Registrarse</h2>
            <form id="registerForm">
                <label for="regUsername">Usuario:</label>
                <input id="regUsername" type="text" required>
                <label for="regPassword">Contraseña:</label>
                <input id="regPassword" type="password" required>
                <button type="submit">Registrarse</button>
            </form>
            <p>¿Ya tienes cuenta? <a href="#" id="switchToLogin">Inicia sesión</a></p>
        `;
        modal.querySelector('#switchToLogin').addEventListener('click', () => {
            modal.querySelector('#modal-forms').innerHTML = `
                <h2>Iniciar Sesión</h2>
                <form id="loginForm">
                    <label for="logUsername">Usuario:</label>
                    <input id="logUsername" type="text" required>
                    <label for="logPassword">Contraseña:</label>
                    <input id="logPassword" type="password" required>
                    <button type="submit">Ingresar</button>
                </form>
                <p>¿No tienes cuenta? <a href="#" id="switchToRegister">Regístrate aquí</a></p>
            `;
            initModalEvents(modal, closeModal);
        });
        initModalEvents(modal, closeModal);
    });

    initModalEvents(modal, closeModal);
}

function initModalEvents(modal, closeModal) {
    const registerForm = modal.querySelector('#registerForm');
    const loginForm = modal.querySelector('#loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = modal.querySelector('#regUsername').value;
            const password = modal.querySelector('#regPassword').value;

            try {
                const res = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({username, password})
                });
                const data = await res.json();
                if (data.error) {
                    Swal.fire('Error', data.error, 'error');
                } else {
                    Swal.fire('Éxito', data.message, 'success');
                    // Cambiar a login
                    modal.querySelector('#modal-forms').innerHTML = `
                        <h2>Iniciar Sesión</h2>
                        <form id="loginForm">
                            <label for="logUsername">Usuario:</label>
                            <input id="logUsername" type="text" required>
                            <label for="logPassword">Contraseña:</label>
                            <input id="logPassword" type="password" required>
                            <button type="submit">Ingresar</button>
                        </form>
                        <p>¿No tienes cuenta? <a href="#" id="switchToRegister">Regístrate aquí</a></p>
                    `;
                    initModalEvents(modal, closeModal);
                }
            } catch (err) {
                Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = modal.querySelector('#logUsername').value;
            const password = modal.querySelector('#logPassword').value;

            try {
                const res = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({username, password})
                });
                const data = await res.json();
                if (data.error) {
                    Swal.fire('Error', data.error, 'error');
                } else {
                    token = data.token;
                    currentUsername = data.username;
                    // Guardar token y username en localStorage
                    localStorage.setItem('token', token);
                    localStorage.setItem('username', currentUsername);

                    Swal.fire('Éxito', 'Sesión iniciada.', 'success');
                    renderUserSection();
                    closeModal();

                    // Recargar la página después de iniciar sesión exitosamente
                    window.location.reload();
                }
            } catch (err) {
                Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
            }
        });
    }
}

function logoutUser() {
    token = null;
    currentUsername = null;
    // Eliminar de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    Swal.fire('Sesión cerrada', 'Has cerrado sesión correctamente.', 'info');
    renderUserSection();

    // Recargar la página al cerrar sesión
    window.location.reload();
}
