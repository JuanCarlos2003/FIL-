document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const isAuthor = localStorage.getItem('isAuthor') === 'true';
    const needsProfile = localStorage.getItem('needsProfile') === 'true';

    if (!token || !isAuthor) {
        window.location.href = 'index.html';
        return;
    }

    if (!needsProfile) {
        window.location.href = 'expositores.html';
        return;
    }

    setupProfileForm();
}

function setupProfileForm() {
    const form = document.getElementById('authorProfileForm');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem('token');

            const profileData = {
                name: document.getElementById('authorName').value,
                genre: document.getElementById('authorGenre').value,
                shortBio: document.getElementById('authorBio').value
            };

            try {
                const response = await fetch(`${API_URL}/api/authors/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(profileData)
                });

                if (response.ok) {
                    // Eliminar flag de perfil necesario
                    localStorage.removeItem('needsProfile');
                    
                    Swal.fire({
                        title: '¡Perfil guardado!',
                        text: 'Tu perfil de autor ha sido creado correctamente',
                        icon: 'success',
                        showConfirmButton: true,
                        confirmButtonText: 'Continuar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = 'expositores.html';
                        }
                    });
                } else {
                    throw new Error('Error al guardar el perfil');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'No se pudo guardar el perfil', 'error');
            }
        });
    }
}