const searchForm = document.getElementById('searchForm');
const searchQueryInput = document.getElementById('searchQuery');
const searchAuthorInput = document.getElementById('searchAuthor');
const searchResults = document.getElementById('searchResults');
const paginationControls = document.getElementById('paginationControls');

const myShelf = document.getElementById('myShelf');
const recommendationsDiv = document.getElementById('recommendations');
const statsDiv = document.getElementById('stats');
const readBooksSection = document.getElementById('readBooksSection');
const readBooksList = document.getElementById('readBooksList');
const booksReadCountSpan = document.getElementById('booksReadCount');
const pagesReadCountSpan = document.getElementById('pagesReadCount');

const toast = document.getElementById('toast');
const spinnerOverlay = document.getElementById('spinnerOverlay');

const filterCategoryInput = document.getElementById('filterCategory');
const applyFilterBtn = document.getElementById('applyFilterBtn');
const filterStatusSelect = document.getElementById('filterStatus');

const navbar = document.getElementById('navbar');

const editModal = document.getElementById('editModal');
const editModalClose = document.getElementById('editModalClose');
const editModalTitle = document.getElementById('editModalTitle');
const editModalAuthors = document.getElementById('editModalAuthors');
const editModalThumbnail = document.getElementById('editModalThumbnail');
const editModalReview = document.getElementById('editModalReview');
const editModalTags = document.getElementById('editModalTags');
const editModalRating = document.getElementById('editModalRating');
const saveEditBtn = document.getElementById('saveEditBtn');

const tagsSpinner = document.getElementById('tagsSpinner');
const tagsList = document.getElementById('tagsList');

let currentEditBookId = null;
let currentEditRating = 0;
let currentSearchPage = 1;
let currentSearchQuery = '';
let currentSearchAuthor = '';

// Asegurar que el modal esté oculto al inicio
document.addEventListener('DOMContentLoaded', () => {
    editModal.style.display = 'none';
    updateUIBasedOnSession();
});

// Cerrar modal edición
editModalClose.addEventListener('click', () => editModal.style.display = 'none');
window.addEventListener('click', (e)=> {
    if(e.target === editModal) editModal.style.display='none';
});

function updateUIBasedOnSession() {
    const searchSection = document.querySelector('.search-section');
    if (searchSection) searchSection.style.display = 'block';

    if (token && currentUsername) {
        if (navbar) navbar.style.display = 'block';
        const filtersSec = document.querySelector('.filters-section');
        const librarySec = document.querySelector('.library-section');
        if (filtersSec) filtersSec.style.display = 'block';
        if (librarySec) librarySec.style.display = 'block';

        loadMyShelfWithFilters();
        loadStats();
        loadRecommendations();
        loadAllTags(); // Cargar las etiquetas del usuario
    } else {
        if (navbar) navbar.style.display = 'none';
        const filtersSec = document.querySelector('.filters-section');
        const librarySec = document.querySelector('.library-section');
        if (filtersSec) filtersSec.style.display = 'none';
        if (librarySec) librarySec.style.display = 'none';
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showSpinner(show) {
    spinnerOverlay.style.display = show ? 'flex' : 'none';
}

if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentSearchQuery = searchQueryInput.value.trim();
        currentSearchAuthor = searchAuthorInput ? searchAuthorInput.value.trim() : '';
        currentSearchPage = 1;
        searchBooksAndDisplay();
    });
}

async function searchBooksAndDisplay() {
    if(!currentSearchQuery) return;
    showSpinner(true);
    try {
        const res = await fetch(`${API_URL}/api/books?q=${encodeURIComponent(currentSearchQuery)}&author=${encodeURIComponent(currentSearchAuthor)}&page=${currentSearchPage}`);
        const data = await res.json();
        showSpinner(false);
        displaySearchResults(data.books, data.total);
    } catch (err) {
        showSpinner(false);
        showToast("Error de conexión al buscar libros.");
    }
}

function displayPagination(total) {
    paginationControls.innerHTML = '';
    const totalPages = Math.ceil(total/10);
    if(totalPages <= 1) return;

    for(let i=1; i<=totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.style.marginRight='5px';
        btn.style.padding='5px';
        if(i===currentSearchPage) {
            btn.style.fontWeight = 'bold';
            btn.style.background='#ccc';
        }
        btn.addEventListener('click', ()=> {
            currentSearchPage = i;
            searchBooksAndDisplay();
        });
        paginationControls.appendChild(btn);
    }
}

function displaySearchResults(books, total) {
    searchResults.innerHTML = '';
    if (!books || books.length === 0) {
        searchResults.innerHTML = '<p>No se encontraron resultados.</p>';
        paginationControls.innerHTML = '';
        return;
    }
    books.forEach(book => {
        const card = createBookCard(book, false);
        searchResults.appendChild(card);
    });
    displayPagination(total);
}

function createBookCard(book, inShelf = true) {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
        <img src="${book.thumbnail}" alt="Portada"/>
        <h3>${book.title}</h3>
        <p>${book.authors}</p>
        ${book.pages ? `<p>Páginas: ${book.pages}</p>` : ''}
    `;

    if (!inShelf) {
        const btn = document.createElement('button');
        btn.textContent = 'Agregar a mi biblioteca';
        btn.addEventListener('click', () => addToShelf(book));
        card.appendChild(btn);
    } else {
        const ratingDiv = document.createElement('div');
        ratingDiv.style.marginTop = '10px';
        const currentRating = book.rating || 0;
        for (let i=1; i<=5; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i<=currentRating?' selected':'');
            star.textContent = '★';
            ratingDiv.appendChild(star);
        }
        card.appendChild(ratingDiv);

        if(!book.finishedDate){
            const finishBtn = document.createElement('button');
            finishBtn.textContent = "Marcar como leído";
            finishBtn.addEventListener('click', () => finishBook(book.book_id));
            card.appendChild(finishBtn);
        } else {
            const finishedP = document.createElement('p');
            finishedP.textContent = `Terminado el: ${book.finishedDate}`;
            card.appendChild(finishedP);

            // Botón compartir
            const shareBtn = document.createElement('button');
            shareBtn.textContent = "Compartir";
            shareBtn.addEventListener('click', () => {
                const shareLink = `https://books.google.com/books?id=${book.book_id}`;
                navigator.clipboard.writeText(shareLink).then(()=>{
                    showToast("Enlace copiado al portapapeles");
                });
            });
            card.appendChild(shareBtn);
        }

        const editBtn = document.createElement('button');
        editBtn.textContent = "Editar detalles";
        editBtn.addEventListener('click', () => openEditModal(book));
        card.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.textContent = "Eliminar";
        delBtn.style.background = "red";
        delBtn.style.color = "white";
        delBtn.addEventListener('click', () => removeFromShelf(book.book_id));
        card.appendChild(delBtn);
    }

    return card;
}

function openEditModal(book) {
    // Solo abre si hay datos
    if (!book || !book.book_id) return;
    currentEditBookId = book.book_id;
    editModalTitle.textContent = book.title || '';
    editModalAuthors.textContent = book.authors || '';
    editModalThumbnail.src = book.thumbnail || '';
    editModalReview.value = book.review || "";
    editModalTags.value = (book.tags || []).join(", ");
    currentEditRating = book.rating || 0;

    renderEditModalRating();
    editModal.style.display = 'block';
}

function renderEditModalRating() {
    editModalRating.innerHTML = '';
    for (let i=1; i<=5; i++) {
        const star = document.createElement('span');
        star.className = 'star' + (i<=currentEditRating ? ' selected' : '');
        star.textContent = '★';
        star.addEventListener('click', ()=> {
            currentEditRating = i;
            renderEditModalRating();
        });
        editModalRating.appendChild(star);
    }
}

saveEditBtn.addEventListener('click', async () => {
    if (!currentEditBookId || !token) return;

    const review = editModalReview.value.trim();
    const tags = editModalTags.value.split(',').map(t=>t.trim()).filter(t=>t);

    showSpinner(true);

    await fetch(`${API_URL}/api/shelf/review`, {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({bookId: currentEditBookId, review: review || ""})
    });

    await fetch(`${API_URL}/api/shelf/tags`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({bookId: currentEditBookId, tags})
    });

    if (currentEditRating > 0) {
        await fetch(`${API_URL}/api/shelf/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookId: currentEditBookId, rating: currentEditRating })
        });
    }

    showSpinner(false);
    showToast("Detalles del libro actualizados.");
    editModal.style.display = 'none';
    loadMyShelfWithFilters();
    loadStats();
    loadRecommendations();
    loadAllTags(); // refrescar las etiquetas disponibles
});

async function addToShelf(book) {
    if(!token) {
        showToast("Debes iniciar sesión.");
        return;
    }
    showSpinner(true);
    const res = await fetch(`${API_URL}/api/shelf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ book })
    });
    showSpinner(false);
    const data = await res.json();
    if (data.error) {
        showToast(data.error);
    } else {
        showToast(data.message);
        loadMyShelfWithFilters();
        loadStats();
        loadRecommendations();
        loadAllTags();
    }
}

function loadMyShelfWithFilters() {
    const category = filterCategoryInput.value.trim();
    loadMyShelf(category);
}

async function loadMyShelf(category='') {
    if(!token) return;
    showSpinner(true);
    const url = `${API_URL}/api/shelf${category?`?category=${encodeURIComponent(category)}`:''}`;
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    showSpinner(false);
    const books = await res.json();
    displayMyShelf(books);
}

function displayMyShelf(books) {
    myShelf.innerHTML = '';
    readBooksList.innerHTML = '';

    const statusFilter = filterStatusSelect.value;
    let filteredBooks = books;
    if(statusFilter === 'read') {
        filteredBooks = books.filter(b => b.finishedDate);
    } else if (statusFilter === 'unread') {
        filteredBooks = books.filter(b => !b.finishedDate);
    }

    if (filteredBooks.length === 0) {
        myShelf.innerHTML = '<p>No hay libros que coincidan con los filtros.</p>';
        readBooksSection.style.display = 'none';
        return;
    }

    const unreadBooks = filteredBooks.filter(b => !b.finishedDate);
    const readBooks = filteredBooks.filter(b => b.finishedDate);

    if (unreadBooks.length === 0 && readBooks.length === 0) {
        myShelf.innerHTML = '<p>No hay libros que coincidan con los filtros.</p>';
        readBooksSection.style.display = 'none';
        return;
    }

    if (unreadBooks.length > 0) {
        unreadBooks.forEach(book => {
            const card = createBookCard(book, true);
            myShelf.appendChild(card);
        });
    } else {
        if (statusFilter === '' || statusFilter === 'unread') {
            myShelf.innerHTML = '<p>No hay libros sin leer.</p>';
        }
    }

    if (readBooks.length > 0) {
        readBooksSection.style.display = 'block';
        readBooksList.innerHTML = '';
        readBooks.forEach(book => {
            const card = createBookCard(book, true);
            readBooksList.appendChild(card);
        });
    } else {
        readBooksSection.style.display = 'none';
    }
}

async function finishBook(bookId) {
    if(!token) return;
    const res = await fetch(`${API_URL}/api/shelf/finish`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({bookId})
    });
    const data = await res.json();
    if(data.error) showToast(data.error);
    else {
        showToast(data.message);
        loadMyShelfWithFilters();
        loadStats();
        loadRecommendations();
        loadAllTags();
    }
}

async function removeFromShelf(bookId) {
    if(!token) {
        showToast("Debes iniciar sesión.");
        return;
    }
    const res = await fetch(`${API_URL}/api/shelf/${bookId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await res.json();
    if(data.error) {
        showToast(data.error);
    } else {
        showToast(data.message);
        loadMyShelfWithFilters();
        loadStats();
        loadRecommendations();
        loadAllTags();
    }
}

async function loadStats() {
    if(!token) return;
    const res = await fetch(`${API_URL}/api/stats`, {
        headers:{'Authorization':`Bearer ${token}`}
    });
    const data = await res.json();
    booksReadCountSpan.textContent = data.totalBooksRead;
    pagesReadCountSpan.textContent = data.totalPages;
}

async function loadRecommendations() {
    if(!token) return;
    const res = await fetch(`${API_URL}/api/recommendations`, {
        headers:{'Authorization':`Bearer ${token}`}
    });
    const data = await res.json();
    recommendationsDiv.innerHTML = '';
    if(!data || data.length === 0) {
        recommendationsDiv.innerHTML = '<p>No hay recomendaciones disponibles.</p>';
        return;
    }
    data.forEach(book => {
        const card = createBookCard(book, false);
        recommendationsDiv.appendChild(card);
    });
}

if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', () => {
        loadMyShelfWithFilters();
    });
}

// Cargar todas las etiquetas del usuario
async function loadAllTags() {
    if(!token) return;
    tagsSpinner.style.display = 'flex';
    tagsList.style.display = 'none';
    tagsList.innerHTML = '';

    const res = await fetch(`${API_URL}/api/shelf`, {
        headers: {'Authorization':`Bearer ${token}`}
    });
    const data = await res.json();
    // extraer tags únicas
    const allTags = new Set();
    data.forEach(b => {
        (b.tags || []).forEach(t => allTags.add(t));
    });

    tagsSpinner.style.display = 'none';
    if (allTags.size === 0) {
        tagsList.innerHTML = '<p>No hay etiquetas disponibles.</p>';
    } else {
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        allTags.forEach(tag => {
            const li = document.createElement('li');
            li.style.marginBottom = '5px';
            li.innerHTML = `<a href="#" class="tag-link" data-tag="${tag}">${tag}</a>`;
            ul.appendChild(li);
        });
        tagsList.appendChild(ul);
    }
    tagsList.style.display = 'block';

    // Al hacer click en una etiqueta sugerida, ponerla en el input category
    tagsList.querySelectorAll('.tag-link').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            filterCategoryInput.value = a.dataset.tag;
            loadMyShelfWithFilters();
        });
    });
}
