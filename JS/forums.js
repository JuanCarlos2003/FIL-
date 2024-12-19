document.addEventListener('DOMContentLoaded', () => {
    loadForums();
    setupNewForumForm();
    updateForumFormVisibility();
});

function getAuthInfo() {
    return {
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username')
    };
}

function updateForumFormVisibility() {
    const newForumButtonContainer = document.getElementById('newForumButtonContainer');
    const { token } = getAuthInfo();
    
    if (token) {
        newForumButtonContainer.style.display = 'block';
    } else {
        newForumButtonContainer.style.display = 'none';
    }
}

function setupNewForumForm() {
    const newForumButton = document.getElementById('newForumButton');
    const newForumForm = document.getElementById('newForumForm');
    const forumForm = document.getElementById('forumForm');

    newForumButton?.addEventListener('click', () => {
        newForumForm.style.display = 'block';
        newForumButton.style.display = 'none';
    });

    forumForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNewForum();
    });
}

async function createNewForum() {
    const { token, username } = getAuthInfo();
    
    if (!token) {
        Swal.fire('Error', 'Debes iniciar sesión para crear un foro', 'error');
        return;
    }

    const forumData = {
        name: document.getElementById('forumName').value,
        category: {
            genre: document.getElementById('forumGenre').value,
            theme: document.getElementById('forumTheme').value,
            language: document.getElementById('forumLanguage').value
        },
        description: document.getElementById('forumDescription').value,
        username: username
    };

    try {
        const response = await fetch(`${API_URL}/api/forums`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(forumData)
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const result = await response.json();

        if (result) {
            Swal.fire('Éxito', 'Foro creado correctamente', 'success');
            document.getElementById('forumForm').reset();
            document.getElementById('newForumForm').style.display = 'none';
            document.getElementById('newForumButton').style.display = 'block';
            loadForums();
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo crear el foro', 'error');
    }
}

async function loadForums() {
    try {
        const response = await fetch(`${API_URL}/api/forums`);
        if (!response.ok) {
            throw new Error('Error al cargar los foros');
        }
        const forums = await response.json();
        displayForums(forums);
    } catch (error) {
        console.error('Error al cargar los foros:', error);
        Swal.fire('Error', 'No se pudieron cargar los foros', 'error');
    }
}

function displayForums(forums) {
    const forumsContainer = document.getElementById('forumsList');
    forumsContainer.innerHTML = '';

    if (!forums || forums.length === 0) {
        forumsContainer.innerHTML = '<p class="no-forums">No hay foros creados aún. ¡Sé el primero en crear uno!</p>';
        return;
    }

    forums.forEach(forum => {
        const forumElement = document.createElement('div');
        forumElement.className = 'forum-card';
        
        // Formatear la fecha de creación
        const createdDate = new Date(forum.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        forumElement.innerHTML = `
            <h3>${forum.name}</h3>
            <p>${forum.description}</p>
            <div class="forum-meta">
                <span>Género: ${forum.category.genre}</span>
                <span>Tema: ${forum.category.theme}</span>
                <span>Idioma: ${forum.category.language}</span>
            </div>
            <div class="forum-footer">
                <span class="forum-creator">Creado por: ${forum.createdBy}</span>
                <span class="forum-date">${createdDate}</span>
            </div>
            <button onclick="window.location.href='forum.html?id=${forum.id}'">
                Ver Foro
            </button>
        `;
        forumsContainer.appendChild(forumElement);
    });
}