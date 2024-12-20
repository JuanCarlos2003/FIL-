const API_URL = "http://192.168.100.64:3000";
let token = null;
let currentUsername = null;
let isAuthor = false;

document.addEventListener('DOMContentLoaded', () => {
    // Recuperar datos del localStorage
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedIsAuthor = localStorage.getItem('isAuthor') === 'true';

    if (savedToken && savedUsername) {
        token = savedToken;
        currentUsername = savedUsername;
        isAuthor = savedIsAuthor;
    }
    // Actualiza la constante header en header-footer.js

    const header = `
    <header>
        <div class="header-main">
            <a href="index.html" class="logo">FIL+</a>
            <div class="header-main-right">
                <div class="search-container desktop-only">
                    <form class="search-bar" action="#" method="get">
                        <input type="text" placeholder="¿Qué estás buscando?" aria-label="Buscar">
                        <button type="submit" aria-label="Realizar búsqueda">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </form>
                </div>
                <div class="user-section desktop-only" id="userSection"></div>
                <button class="mobile-menu-button" aria-label="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
        
        <div class="header-content">
            <nav class="nav-menu">
                <ul class="nav-links">
                    <li><a href="index.html">Inicio</a></li>
                    <li><a href="eventos.html">Programación</a></li>
                    <li><a href="expositores.html">Expositores</a></li>
                    <li><a href="comunidad.html">Comunidad</a></li>
                    <li><a href="libros.html">Biblioteca</a></li>
                    <li class="mobile-only">
                        <div class="search-container mobile">
                            <form class="search-bar" action="#" method="get">
                                <input type="text" placeholder="¿Qué estás buscando?" aria-label="Buscar">
                                <button type="submit" aria-label="Realizar búsqueda">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </li>
                    <li class="mobile-only user-section" id="userSectionMobile"></li>
                </ul>
            </nav>
        </div>
    </header>
`;

    // Footer template
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

    // Insertar header y footer
    document.getElementById('header-container').innerHTML = header;
    document.getElementById('footer-container').innerHTML = footer;

    // Inicializar funcionalidad del menú móvil
    initMobileMenu();

    // Renderizar sección de usuario
    renderUserSection();
});

function initMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const headerContent = document.querySelector('.header-content');
    const userSection = document.getElementById('userSection');
    const userSectionMobile = document.getElementById('userSectionMobile');

    // Clonar el contenido del userSection al userSectionMobile
    if (userSection && userSectionMobile) {
        userSectionMobile.innerHTML = userSection.innerHTML;
    }

    mobileMenuButton.addEventListener('click', () => {
        mobileMenuButton.classList.toggle('active');
        headerContent.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuButton.classList.remove('active');
            headerContent.classList.remove('active');
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('header')) {
            mobileMenuButton.classList.remove('active');
            headerContent.classList.remove('active');
        }
    });
}

function renderUserSection() {
    const userSections = [
        document.getElementById('userSection'),
        document.getElementById('userSectionMobile')
    ];

    const userContent = token && currentUsername ? `
        <div class="user-info">
            <span class="username">
                ${currentUsername}
                ${isAuthor ? '<span class="author-badge">(Autor)</span>' : ''}
            </span>
            <button id="logoutBtn" class="logout-btn">Cerrar Sesión</button>
        </div>
    ` : `
        <button id="loginBtn" class="btn-login">Iniciar Sesión</button>
    `;

    userSections.forEach(section => {
        if (section) {
            section.innerHTML = userContent;

            // Agregar event listeners
            if (token && currentUsername) {
                section.querySelector('#logoutBtn').addEventListener('click', logoutUser);
            } else {
                section.querySelector('#loginBtn').addEventListener('click', showLoginModal);
            }
        }
    });
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
                
                <div class="author-section">
                    <label class="checkbox-container">
                        <input type="checkbox" id="isAuthor"> Soy autor
                        <span class="checkmark"></span>
                    </label>
                    <div id="authorCodeSection" style="display: none;">
                        <label for="authorCode">Código de Autorización:</label>
                        <input type="text" id="authorCode">
                        <small>*Este código es proporcionado por los organizadores de la FIL</small>
                    </div>
                </div>

                <button type="submit">Registrarse</button>
            </form>
            <p>¿Ya tienes cuenta? <a href="#" id="switchToLogin">Inicia sesión</a></p>
        `;

        const isAuthorCheckbox = modal.querySelector('#isAuthor');
        const authorCodeSection = modal.querySelector('#authorCodeSection');
        isAuthorCheckbox.addEventListener('change', (e) => {
            authorCodeSection.style.display = e.target.checked ? 'block' : 'none';
        });

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
            const isAuthorChecked = modal.querySelector('#isAuthor')?.checked || false;
            const authorCode = isAuthorChecked ? modal.querySelector('#authorCode').value : null;

            if (isAuthorChecked && !authorCode) {
                Swal.fire('Error', 'El código de autorización es requerido para registrarse como autor.', 'error');
                return;
            }

            try {
                const res = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username,
                        password,
                        isAuthor: isAuthorChecked,
                        authorCode: authorCode
                    })
                });
                const data = await res.json();

                if (data.error) {
                    Swal.fire('Error', data.error, 'error');
                } else {
                    if (isAuthorChecked) {
                        const loginRes = await fetch(`${API_URL}/api/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username, password })
                        });
                        const loginData = await loginRes.json();

                        if (loginData.token) {
                            localStorage.setItem('token', loginData.token);
                            localStorage.setItem('username', loginData.username);
                            localStorage.setItem('isAuthor', 'true');
                            localStorage.setItem('needsProfile', 'true');

                            Swal.fire({
                                title: '¡Registro exitoso!',
                                text: 'Ahora completaremos tu perfil de autor',
                                icon: 'success',
                                showConfirmButton: true,
                                confirmButtonText: 'Completar perfil',
                                allowOutsideClick: false
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    window.location.href = 'author-profile.html';
                                }
                            });
                        }
                    } else {
                        Swal.fire({
                            title: '¡Registro exitoso!',
                            text: 'Ya puedes iniciar sesión',
                            icon: 'success'
                        }).then(() => {
                            modal.querySelector('#modal-forms').innerHTML = `
                                <h2>Iniciar Sesión</h2>
                                <form id="loginForm">
                                    <label for="logUsername">Usuario:</label>
                                    <input id="logUsername" type="text" value="${username}" required>
                                    <label for="logPassword">Contraseña:</label>
                                    <input id="logPassword" type="password" required>
                                    <button type="submit">Ingresar</button>
                                </form>
                                <p>¿No tienes cuenta? <a href="#" id="switchToRegister">Regístrate aquí</a></p>
                            `;
                            initModalEvents(modal, closeModal);
                        });
                    }
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
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (data.error) {
                    Swal.fire('Error', data.error, 'error');
                } else {
                    token = data.token;
                    currentUsername = data.username;
                    isAuthor = data.isAuthor;

                    localStorage.setItem('token', token);
                    localStorage.setItem('username', currentUsername);
                    localStorage.setItem('isAuthor', isAuthor);

                    Swal.fire('Éxito', 'Sesión iniciada.', 'success');
                    renderUserSection();
                    closeModal();
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
    isAuthor = false;

    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAuthor');

    Swal.fire('Sesión cerrada', 'Has cerrado sesión correctamente.', 'info');
    renderUserSection();
    window.location.reload();
}