document.addEventListener('DOMContentLoaded', () => {
    loadComments();
    updateCommentFormVisibility();
});

function updateCommentFormVisibility() {
    const commentFormContainer = document.getElementById('commentFormContainer');

    if (window.token && window.currentUsername) {
        // Hay sesión iniciada
        commentFormContainer.style.display = 'block';
        commentFormContainer.classList.remove('no-session');
    } else {
        // No hay sesión
        commentFormContainer.style.display = 'none'; 
        // O:
        // commentFormContainer.classList.add('no-session');
        // Si quieres mostrar el mensaje de "inicia sesión" sin ocultar el contenedor
    }
}


async function loadComments() {
    try {
        const res = await fetch(`${API_URL}/api/comments`);
        const data = await res.json();
        displayComments(data);
    } catch (err) {
        console.error("Error al cargar comentarios:", err);
    }
}

function displayComments(comments) {
    const commentsContainer = document.getElementById('commentsContainer');
    commentsContainer.innerHTML = '';

    if (!comments || comments.length === 0) {
        commentsContainer.innerHTML = '<p>No hay comentarios aún. ¡Sé el primero en comentar!</p>';
        return;
    }

    comments.forEach(comment => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h3>${comment.username}</h3>
            <p>${comment.text}</p>
        `;
        commentsContainer.appendChild(card);
    });
}

async function postComment(e) {
    e.preventDefault();
    if (!window.token) {
        Swal.fire('Advertencia', 'Debes iniciar sesión para publicar un comentario.', 'warning');
        return;
    }

    const commentText = document.getElementById('commentText').value.trim();
    if (!commentText) {
        Swal.fire('Error', 'El comentario no puede estar vacío.', 'error');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.token}`
            },
            body: JSON.stringify({ text: commentText })
        });

        const data = await res.json();
        if (data.error) {
            Swal.fire('Error', data.error, 'error');
        } else {
            Swal.fire('Éxito', 'Comentario publicado.', 'success');
            // Recargar los comentarios
            loadComments();
            // Limpiar el textarea
            document.getElementById('commentText').value = '';
        }
    } catch (err) {
        Swal.fire('Error', 'Error de conexión con el servidor.', 'error');
    }
}
