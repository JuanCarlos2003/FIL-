let currentForumId = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentForumId = urlParams.get('id');
    
    if (currentForumId) {
        loadForumDetails();
        loadComments();
        updateCommentFormVisibility();
    } else {
        window.location.href = 'forums.html';
    }
});

function getAuthInfo() {
    return {
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username')
    };
}

function updateCommentFormVisibility() {
    const commentFormContainer = document.getElementById('commentFormContainer');
    const { token } = getAuthInfo();
    
    if (token) {
        commentFormContainer.style.display = 'block';
        const commentForm = document.getElementById('commentForm');
        commentForm.removeEventListener('submit', handleCommentSubmit);
        commentForm.addEventListener('submit', handleCommentSubmit);
    } else {
        commentFormContainer.style.display = 'none';
    }
}

async function loadForumDetails() {
    try {
        const response = await fetch(`${API_URL}/api/forums/${currentForumId}`);
        if (!response.ok) {
            throw new Error('Error al cargar los detalles del foro');
        }
        const forum = await response.json();
        displayForumDetails(forum);
        // Actualizar el título de la página
        document.title = `FIL+ - ${forum.name}`;
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo cargar el foro', 'error');
        setTimeout(() => {
            window.location.href = 'forums.html';
        }, 2000);
    }
}

function displayForumDetails(forum) {
    const detailsContainer = document.getElementById('forumDetails');
    const createdDate = new Date(forum.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    detailsContainer.innerHTML = `
        <h1>${forum.name}</h1>
        <p class="forum-description">${forum.description}</p>
        <div class="forum-meta">
            <span>Género: ${forum.category.genre}</span>
            <span>Tema: ${forum.category.theme}</span>
            <span>Idioma: ${forum.category.language}</span>
            <span>Creado por: ${forum.createdBy}</span>
            <span>Fecha: ${createdDate}</span>
        </div>
    `;
}

async function loadComments() {
    try {
        const response = await fetch(`${API_URL}/api/comments/forum/${currentForumId}`);
        if (!response.ok) {
            throw new Error('Error al cargar los comentarios');
        }
        const comments = await response.json();
        displayComments(comments);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudieron cargar los comentarios', 'error');
    }
}

function displayComments(comments) {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = '';

    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = '<p class="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
        return;
    }

    const commentsList = document.createElement('div');
    commentsList.className = 'comments-list';

    // Cambiamos el orden: ordenamos por fecha de más antiguo a más nuevo
    comments
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-card';
            
            const date = new Date(comment.timestamp);
            const formattedDate = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            commentElement.innerHTML = `
                <div class="comment-header">
                    <strong class="comment-author">${comment.username}</strong>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <p class="comment-text">${comment.text}</p>
            `;
            
            commentsList.appendChild(commentElement);
        });

    commentsContainer.appendChild(commentsList);
}

async function handleCommentSubmit(e) {
    e.preventDefault();

    const { token, username } = getAuthInfo();
    
    if (!token) {
        Swal.fire('Error', 'Debes iniciar sesión para comentar', 'error');
        return;
    }

    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        Swal.fire('Error', 'El comentario no puede estar vacío', 'error');
        return;
    }

    const commentData = {
        forumId: currentForumId,
        text: commentText,
        username: username
    };

    try {
        const response = await fetch(`${API_URL}/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            throw new Error('Error al publicar el comentario');
        }

        const result = await response.json();
        if (result) {
            Swal.fire('Éxito', 'Comentario publicado correctamente', 'success');
            document.getElementById('commentText').value = '';
            await loadComments();
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo publicar el comentario', 'error');
    }
}