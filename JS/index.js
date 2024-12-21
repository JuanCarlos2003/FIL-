document.addEventListener('DOMContentLoaded', () => {
    loadRecentPublications();
    loadActiveForums();
    loadFeaturedAuthors();
    updateStats();
    setupButtons();
});

async function loadRecentPublications() {
    try {
        const response = await fetch(`${API_URL}/api/publications`);
        if (!response.ok) throw new Error('Error al cargar publicaciones');
        
        let publications = await response.json();
        // Mostrar solo las 3 publicaciones más recientes
        publications = publications.slice(0, 3);
        
        const container = document.getElementById('publicationsContainer');
        container.innerHTML = '';

        publications.forEach(pub => {
            const card = document.createElement('div');
            card.className = 'publication-card';
            card.innerHTML = `
                <div class="publication-header">
                    <h3>${escapeHtml(pub.title)}</h3>
                    <span class="author-name">por ${escapeHtml(pub.authorName)}</span>
                </div>
                ${pub.imageUrl ? `<img src="${API_URL}${pub.imageUrl}" alt="${escapeHtml(pub.title)}" class="publication-image">` : ''}
                <p class="publication-description">${escapeHtml(pub.description.substring(0, 150))}...</p>
                <div class="publication-meta">
                    <span>${escapeHtml(pub.genre)}</span>
                    <span>${new Date(pub.createdAt).toLocaleDateString()}</span>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('No se pudieron cargar las publicaciones');
    }
}

async function loadActiveForums() {
    try {
        const response = await fetch(`${API_URL}/api/forums`);
        if (!response.ok) throw new Error('Error al cargar foros');
        
        let forums = await response.json();
        // Mostrar solo los 3 foros más recientes
        forums = forums.slice(0, 3);
        
        const container = document.getElementById('forumsContainer');
        container.innerHTML = '';

        forums.forEach(forum => {
            const card = document.createElement('div');
            card.className = 'forum-card';
            card.innerHTML = `
                <h3>${escapeHtml(forum.name)}</h3>
                <p>${escapeHtml(forum.description)}</p>
                <div class="forum-meta">
                    <span>Creado por: ${escapeHtml(forum.createdBy)}</span>
                    <span>${new Date(forum.createdAt).toLocaleDateString()}</span>
                </div>
                <button onclick="window.location.href='forum.html?id=${forum.id}'" class="btn btn-secondary">
                    Unirse a la discusión
                </button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('No se pudieron cargar los foros');
    }
}

async function loadFeaturedAuthors() {
    try {
        const response = await fetch(`${API_URL}/api/authors`);
        if (!response.ok) throw new Error('Error al cargar autores');
        
        let authors = await response.json();
        // Mostrar solo 3 autores destacados
        authors = authors.slice(0, 3);
        
        const container = document.getElementById('authorsContainer');
        container.innerHTML = '';

        authors.forEach(author => {
            const card = document.createElement('div');
            card.className = 'author-card';
            card.innerHTML = `
                <h3>${escapeHtml(author.name)}</h3>
                <p class="genre">${escapeHtml(author.genre)}</p>
                <p class="short-bio">${author.shortBio ? escapeHtml(author.shortBio.substring(0, 100)) + '...' : 'Sin biografía'}</p>
                <button onclick="window.location.href='expositores.html'" class="btn btn-secondary">
                    Ver Perfil
                </button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('No se pudieron cargar los autores');
    }
}

async function updateStats() {
    try {
        // Obtener estadísticas
        const [publications, forums, authors, comments] = await Promise.all([
            fetch(`${API_URL}/api/publications`).then(r => r.json()),
            fetch(`${API_URL}/api/forums`).then(r => r.json()),
            fetch(`${API_URL}/api/authors`).then(r => r.json()),
            fetch(`${API_URL}/api/comments`).then(r => r.json())
        ]);

        // Animación para los números
        animateNumber('publications-count', publications.length);
        animateNumber('forums-count', forums.length);
        animateNumber('authors-count', authors.length);
        animateNumber('comments-count', comments.length);

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

function animateNumber(elementId, finalNumber) {
    const element = document.getElementById(elementId);
    const duration = 2000; // 2 segundos
    const steps = 50;
    const stepValue = finalNumber / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;
        const currentValue = Math.round(stepValue * currentStep);
        element.textContent = currentValue;

        if (currentStep === steps) {
            element.textContent = finalNumber;
            clearInterval(interval);
        }
    }, duration / steps);
}

function setupButtons() {
    const registerButton = document.getElementById('registerButton');
    const learnMoreButton = document.getElementById('learnMoreButton');

    registerButton?.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (token) {
            Swal.fire('¡Ya estás registrado!', 'Ya tienes una cuenta activa.', 'info');
        } else {
            window.location.href = 'registro.html';
        }
    });

    learnMoreButton?.addEventListener('click', () => {
        Swal.fire({
            title: 'Sobre FIL+',
            html: `
                <div class="learn-more-content">
                    <p>FIL+ es la plataforma digital oficial de la Feria Internacional del Libro de Guadalajara.</p>
                    <p>Aquí podrás:</p>
                    <ul>
                        <li>Conectar con autores</li>
                        <li>Participar en foros de discusión</li>
                        <li>Descubrir nuevas publicaciones</li>
                        <li>Ser parte de una comunidad literaria</li>
                    </ul>
                </div>
            `,
            confirmButtonText: 'Entendido',
            customClass: {
                container: 'learn-more-modal'
            }
        });
    });
}

function showErrorMessage(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonColor: '#5c2a9d'
    });
}

// Función de utilidad para escapar HTML y prevenir XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}