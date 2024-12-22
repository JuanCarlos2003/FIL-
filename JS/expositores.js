document.addEventListener('DOMContentLoaded', () => {
    loadAuthors();
    loadPublications();
    checkAuthorAccess();
});

function checkAuthorAccess() {
    const token = localStorage.getItem('token');
    const authorSection = document.getElementById('authorPublishSection');
    
    if (token) {
        fetch(`${API_URL}/api/auth/check-author`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.isAuthor) {
                authorSection.style.display = 'block';
                setupAuthorForm();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire('Error', 'Error al verificar acceso de autor', 'error');
        });
    }
}

async function loadAuthors() {
    try {
        const response = await fetch(`${API_URL}/api/authors`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const authors = await response.json();
        displayAuthors(authors);
    } catch (error) {
        console.error('Error al cargar autores:', error);
        Swal.fire('Error', 'No se pudieron cargar los autores', 'error');
    }
}

function displayAuthors(authors) {
    const authorsContainer = document.getElementById('authorsContainer');
    if (!authorsContainer) return;
    
    authorsContainer.innerHTML = '';

    if (!Array.isArray(authors) || authors.length === 0) {
        authorsContainer.innerHTML = `
            <div class="no-authors">
                <i class="fas fa-user-slash" style="font-size: 3rem; color: var(--primary-light); margin-bottom: 15px;"></i>
                <p>No hay autores registrados aún.</p>
            </div>`;
        return;
    }

    authors.forEach(author => {
        if (!author || !author.name) return;
        
        const authorInitials = author.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const authorElement = document.createElement('div');
        authorElement.className = 'author-card';
        authorElement.innerHTML = `
            <div class="author-image">
                ${author.imageUrl ? 
                    `<img src="${API_URL}${author.imageUrl}" alt="${escapeHtml(author.name)}">` :
                    authorInitials
                }
            </div>
            <div class="author-info">
                <h3>${escapeHtml(author.name)}</h3>
                <p class="genre">${escapeHtml(author.genre || 'No especificado')}</p>
                <p class="short-bio">${author.shortBio ? escapeHtml(author.shortBio.substring(0, 150) + '...') : 'Sin biografía'}</p>
                <button class="view-profile-btn" onclick="showAuthorProfile('${author.userId}')">
                    Ver Perfil Completo
                </button>
                <div class="author-social-links">
                    ${author.social ? `
                        ${author.social.twitter ? `<a href="${author.social.twitter}" target="_blank"><i class="fab fa-twitter"></i></a>` : ''}
                        ${author.social.instagram ? `<a href="${author.social.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>` : ''}
                    ` : ''}
                </div>
            </div>
        `;
        authorsContainer.appendChild(authorElement);
    });
}

async function loadPublications() {
    try {
        const response = await fetch(`${API_URL}/api/publications`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const publications = await response.json();
        displayPublications(publications);
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        Swal.fire('Error', 'No se pudieron cargar las publicaciones', 'error');
    }
}

function displayPublications(publications) {
    const publicationsContainer = document.getElementById('publicationsContainer');
    const currentUser = localStorage.getItem('username');
    if (!publicationsContainer) return;

    publicationsContainer.innerHTML = '';

    if (!Array.isArray(publications) || publications.length === 0) {
        publicationsContainer.innerHTML = `
            <div class="no-publications">
                <i class="fas fa-book-open" style="font-size: 3rem; color: var(--primary-light); margin-bottom: 15px;"></i>
                <p>No hay publicaciones disponibles.</p>
            </div>`;
        return;
    }

    publications.forEach(pub => {
        if (!pub || !pub.title) return;
        
        const pubElement = document.createElement('div');
        pubElement.className = 'publication-card';
        pubElement.innerHTML = `
            <div class="publication-header">
                <h3>${escapeHtml(pub.title)}</h3>
                <span class="author-name" onclick="showAuthorProfile('${pub.authorId}')">
                    <i class="fas fa-user-edit"></i> ${escapeHtml(pub.authorName)}
                </span>
            </div>
            ${pub.imageUrl ? 
                `<img src="${API_URL}${pub.imageUrl}" alt="${escapeHtml(pub.title)}" class="publication-image">` : 
                ''
            }
            <p class="publication-description">${escapeHtml(pub.description)}</p>
            <div class="publication-tags">
                <span class="publication-tag">${escapeHtml(pub.genre)}</span>
            </div>
            <div class="publication-meta">
                <div class="publication-stats">
                    <div class="stat-item">
                        <i class="far fa-calendar-alt"></i>
                        <span>${new Date(pub.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            ${currentUser === pub.authorName ? `
                <button class="delete-publication-btn" onclick="handlePublicationDelete('${pub.id}')">
                    <i class="fas fa-trash-alt"></i> Eliminar Publicación
                </button>
            ` : ''}
        `;
        publicationsContainer.appendChild(pubElement);
    });
}

async function handlePublicationDelete(publicationId) {
    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire('Error', 'Debes iniciar sesión para eliminar publicaciones', 'error');
        return;
    }

    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción una vez eliminada la publicación.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`${API_URL}/api/publications/${publicationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la publicación');
            }

            await Swal.fire(
                'Eliminada',
                'La publicación ha sido eliminada correctamente.',
                'success'
            );

            // Recargar las publicaciones
            await loadPublications();
        } catch (error) {
            console.error('Error:', error);
            Swal.fire('Error', 'No se pudo eliminar la publicación', 'error');
        }
    }
}

function setupAuthorForm() {
    const publishForm = document.getElementById('publishForm');
    if (publishForm) {
        publishForm.onsubmit = handlePublicationSubmit;
    }
}

async function handlePublicationSubmit(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
        Swal.fire('Error', 'Debes iniciar sesión como autor para publicar', 'error');
        return;
    }

    // Validar campos
    const title = document.getElementById('pubTitle').value.trim();
    const description = document.getElementById('pubDescription').value.trim();
    const genre = document.getElementById('pubGenre').value;
    
    if (!title || !description || !genre) {
        Swal.fire('Error', 'Todos los campos son obligatorios', 'error');
        return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('genre', genre);
    
    const imageInput = document.getElementById('pubImage');
    if (imageInput && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        Swal.fire({
            title: 'Publicando...',
            didOpen: () => {
                Swal.showLoading();
            },
            allowOutsideClick: false
        });

        const response = await fetch(`${API_URL}/api/publications`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear la publicación');
        }

        const result = await response.json();
        
        await Swal.fire({
            icon: 'success',
            title: 'Publicación creada correctamente',
            showConfirmButton: false,
            timer: 1500
        });

        document.getElementById('publishForm').reset();
        await loadPublications();

    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', error.message || 'No se pudo crear la publicación', 'error');
    }
}

async function showAuthorProfile(authorId) {
    try {
        const [authorResponse, publicationsResponse] = await Promise.all([
            fetch(`${API_URL}/api/authors/${authorId}`),
            fetch(`${API_URL}/api/publications/author/${authorId}`)
        ]);

        if (!authorResponse.ok || !publicationsResponse.ok) {
            throw new Error('Error al obtener datos del autor');
        }

        const author = await authorResponse.json();
        const publications = await publicationsResponse.json();
        
        Swal.fire({
            html: `
                <div class="author-profile">
                    <div class="author-header">
                        <div class="author-image-column">
                            <div class="author-image">
                                ${author.imageUrl ? 
                                    `<img src="${API_URL}${author.imageUrl}" alt="${escapeHtml(author.name)}">` :
                                    author.name.split(' ').map(n => n[0]).join('').toUpperCase()
                                }
                            </div>
                        </div>
                        <div class="author-info-column">
                            <h2 class="author-name">${escapeHtml(author.name)}</h2>
                            <div class="author-stats">
                                <div class="stat-card">
                                    <div class="stat-title">Género Principal</div>
                                    <div class="stat-value">${escapeHtml(author.genre)}</div>
                                </div>
                                <div class="stat-card">
                                    <div class="stat-title">Publicaciones</div>
                                    <div class="stat-value">${publications.length} obras</div>
                                </div>
                                ${author.awards ? `
                                    <div class="stat-card">
                                        <div class="stat-title">Premios</div>
                                        <div class="stat-value">${author.awards} 🏆</div>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="author-bio">
                                <h3 class="bio-title">Biografía</h3>
                                <p class="bio-content">${escapeHtml(author.shortBio || 'Sin biografía disponible.')}</p>
                            </div>
                        </div>
                    </div>

                    <div class="publications-section">
                        <h3 class="publications-title">Publicaciones</h3>
                        <div class="publications-grid">
                            ${publications && publications.length > 0 ? 
                                publications.map(pub => `
                                    <div class="publication-card">
                                        <h4 class="pub-title">${escapeHtml(pub.title)}</h4>
                                        ${pub.imageUrl ? `
                                            <img src="${API_URL}${pub.imageUrl}" 
                                                 alt="${escapeHtml(pub.title)}"
                                                 class="pub-image">
                                        ` : ''}
                                        <p>${escapeHtml(pub.description)}</p>
                                        <div class="pub-meta">
                                            <span class="pub-genre">${escapeHtml(pub.genre)}</span>
                                            <span class="pub-date">${new Date(pub.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                `).join('') : 
                                '<div class="no-publications">No hay publicaciones disponibles</div>'
                            }
                        </div>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: '90%',
            customClass: {
                popup: 'author-profile-popup'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo cargar el perfil del autor', 'error');
    }
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