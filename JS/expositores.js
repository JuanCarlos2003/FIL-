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
        .then(response => response.json())
        .then(data => {
            if (data.isAuthor) {
                authorSection.style.display = 'block';
                setupAuthorForm();
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

async function loadAuthors() {
    try {
        const response = await fetch(`${API_URL}/api/authors`);
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

    if (authors.length === 0) {
        authorsContainer.innerHTML = '<p class="no-authors">No hay autores registrados aún.</p>';
        return;
    }

    authors.forEach(author => {
        const authorElement = document.createElement('div');
        authorElement.className = 'author-card';
        authorElement.innerHTML = `
            <div class="author-info">
                <h3>${author.name}</h3>
                <p class="genre">Género: ${author.genre}</p>
                <p class="short-bio">${author.shortBio ? author.shortBio.substring(0, 150) + '...' : 'Sin biografía'}</p>
                <button onclick="showAuthorProfile('${author.userId}')">Ver Perfil Completo</button>
            </div>
        `;
        authorsContainer.appendChild(authorElement);
    });
}

async function loadPublications() {
    try {
        const response = await fetch(`${API_URL}/api/publications`);
        const publications = await response.json();
        displayPublications(publications);
    } catch (error) {
        console.error('Error al cargar publicaciones:', error);
        Swal.fire('Error', 'No se pudieron cargar las publicaciones', 'error');
    }
}

function displayPublications(publications) {
    const publicationsContainer = document.getElementById('publicationsContainer');
    if (!publicationsContainer) return;

    publicationsContainer.innerHTML = '';

    if (publications.length === 0) {
        publicationsContainer.innerHTML = '<p class="no-publications">No hay publicaciones disponibles.</p>';
        return;
    }

    publications.forEach(pub => {
        const pubElement = document.createElement('div');
        pubElement.className = 'publication-card';
        pubElement.innerHTML = `
            <div class="publication-header">
                <h3>${pub.title}</h3>
                <span class="author-name" onclick="showAuthorProfile('${pub.authorId}')">
                    por ${pub.authorName}
                </span>
            </div>
            ${pub.imageUrl ? `<img src="${API_URL}${pub.imageUrl}" alt="${pub.title}" class="publication-image">` : ''}
            <p class="publication-description">${pub.description}</p>
            <div class="publication-meta">
                <span>Género: ${pub.genre}</span>
                <span>Fecha: ${new Date(pub.createdAt).toLocaleDateString()}</span>
            </div>
        `;
        publicationsContainer.appendChild(pubElement);
    });
}

function setupAuthorForm() {
    const publishForm = document.getElementById('publishForm');
    if (publishForm) {
        publishForm.addEventListener('submit', handlePublicationSubmit);
    }
}

async function handlePublicationSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) {
        Swal.fire('Error', 'Debes iniciar sesión como autor para publicar', 'error');
        return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('title', document.getElementById('pubTitle').value);
    formData.append('description', document.getElementById('pubDescription').value);
    formData.append('genre', document.getElementById('pubGenre').value);
    
    const imageInput = document.getElementById('pubImage');
    if (imageInput && imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        // Mostrar loading
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
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        
        // Cerrar loading y mostrar éxito
        Swal.fire({
            icon: 'success',
            title: 'Publicación creada correctamente',
            showConfirmButton: false,
            timer: 1500
        });

        // Limpiar formulario y recargar publicaciones
        document.getElementById('publishForm').reset();
        await loadPublications();

    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo crear la publicación', 'error');
    }
}

async function showAuthorProfile(authorId) {
    try {
        // Primero, obtener los datos del autor
        const authorResponse = await fetch(`${API_URL}/api/authors/${authorId}`);
        const author = await authorResponse.json();
        
        // Luego, obtener las publicaciones del autor
        const publicationsResponse = await fetch(`${API_URL}/api/publications/author/${authorId}`);
        const publications = await publicationsResponse.json();
        
        Swal.fire({
            title: author.name,
            html: `
                <div class="author-profile">
                    <p><strong>Género:</strong> ${author.genre}</p>
                    <p><strong>Biografía:</strong></p>
                    <p>${author.shortBio || 'Sin biografía'}</p>
                    <h4>Publicaciones:</h4>
                    <div class="author-publications">
                        ${publications && publications.length > 0 ? 
                            publications.map(pub => `
                                <div class="publication">
                                    <h5>${pub.title}</h5>
                                    <p>${pub.description}</p>
                                    ${pub.imageUrl ? `
                                        <img src="${API_URL}${pub.imageUrl}" 
                                             alt="${pub.title}" 
                                             style="max-width: 200px; margin-top: 10px;">
                                    ` : ''}
                                    <p class="publication-meta">
                                        <span>Género: ${pub.genre}</span>
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