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
        authorsContainer.innerHTML = '<p class="no-authors">No hay autores registrados aún.</p>';
        return;
    }

    authors.forEach(author => {
        if (!author || !author.name) return; // Skip invalid authors
        
        const authorElement = document.createElement('div');
        authorElement.className = 'author-card';
        authorElement.innerHTML = `
            <div class="author-info">
                <h3>${escapeHtml(author.name)}</h3>
                <p class="genre">Género: ${escapeHtml(author.genre || 'No especificado')}</p>
                <p class="short-bio">${author.shortBio ? escapeHtml(author.shortBio.substring(0, 150) + '...') : 'Sin biografía'}</p>
                <button onclick="showAuthorProfile('${author.userId}')">Ver Perfil Completo</button>
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
        publicationsContainer.innerHTML = '<p class="no-publications">No hay publicaciones disponibles.</p>';
        return;
    }

    publications.forEach(pub => {
        if (!pub || !pub.title) return; // Skip invalid publications
        
        const pubElement = document.createElement('div');
        pubElement.className = 'publication-card';
        pubElement.innerHTML = `
            <div class="publication-header">
                <h3>${escapeHtml(pub.title)}</h3>
                <span class="author-name" onclick="showAuthorProfile('${pub.authorId}')">
                    por ${escapeHtml(pub.authorName)}
                </span>
            </div>
            ${pub.imageUrl ? `<img src="${API_URL}${pub.imageUrl}" alt="${escapeHtml(pub.title)}" class="publication-image">` : ''}
            <p class="publication-description">${escapeHtml(pub.description)}</p>
            <div class="publication-meta">
                <span>Género: ${escapeHtml(pub.genre)}</span>
                <span>Fecha: ${new Date(pub.createdAt).toLocaleDateString()}</span>
            </div>
            ${currentUser === pub.authorName ? `
                <button class="delete-publication-btn" onclick="handlePublicationDelete('${pub.id}')">
                    Eliminar Publicación
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
            title: escapeHtml(author.name),
            html: `
                <div class="author-profile">
                    <p><strong>Género:</strong> ${escapeHtml(author.genre)}</p>
                    <p><strong>Biografía:</strong></p>
                    <p>${escapeHtml(author.shortBio || 'Sin biografía')}</p>
                    <h4>Publicaciones:</h4>
                    <div class="author-publications">
                        ${publications && publications.length > 0 ? 
                            publications.map(pub => `
                                <div class="publication">
                                    <h5>${escapeHtml(pub.title)}</h5>
                                    <p>${escapeHtml(pub.description)}</p>
                                    ${pub.imageUrl ? `
                                        <img src="${API_URL}${pub.imageUrl}" 
                                             alt="${escapeHtml(pub.title)}" 
                                             style="max-width: 200px; margin-top: 10px;">
                                    ` : ''}
                                    <p class="publication-meta">
                                        <span>Género: ${escapeHtml(pub.genre)}</span>
                                        <span>Fecha: ${new Date(pub.createdAt).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            `).join('') : 
                            '<p>No hay publicaciones disponibles</p>'
                        }
                    </div>
                </div>
            `,
            width: '80%',
            showCloseButton: true,
            customClass: {
                container: 'author-profile-modal',
                popup: 'author-profile-popup',
                content: 'author-profile-content'
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