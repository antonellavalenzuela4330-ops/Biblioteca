// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando sistema...');
    
    // Asegurar que la base de datos esté lista
    if (typeof db !== 'undefined') {
        console.log('Base de datos encontrada:', db);
        refreshGlobalData();
        console.log('Datos globales actualizados:', { users: users.length, books: books.length, loans: loans.length });
        
        setupEventListeners();
        showLoginPage(); // Mostrar la página de login por defecto
        setupSearchFilters();
    } else {
        console.error('Error: Base de datos no encontrada');
        alert('Error: Base de datos no encontrada. Recarga la página.');
    }
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
    document.getElementById('bookForm').addEventListener('submit', handleBookSubmit);
    document.getElementById('loanForm').addEventListener('submit', handleLoanSubmit);
    document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
    document.getElementById('modalBookForm').addEventListener('submit', handleModalBookSubmit);
    
    // Búsqueda en tiempo real
    document.getElementById('searchInput').addEventListener('input', debounce(searchBooks, 300));
    
    // Filtros
    document.getElementById('genreFilter').addEventListener('change', searchBooks);
    document.getElementById('editorialFilter').addEventListener('change', searchBooks);
    document.getElementById('tutorFilter').addEventListener('change', searchBooks);
    document.getElementById('statusFilter').addEventListener('change', searchBooks);
}

function setupSearchFilters() {
    try {
        const books = db.getBooks();
        const genres = [...new Set(books.map(book => book.genre))];
        const editorials = [...new Set(books.map(book => book.editorial))];
        const tutors = [...new Set(books.map(book => book.tutor))];
        
        populateFilter('genreFilter', genres);
        populateFilter('editorialFilter', editorials);
        populateFilter('tutorFilter', tutors);
    } catch (error) {
        console.log('Error configurando filtros:', error);
    }
}

function populateFilter(filterId, options) {
    const select = document.getElementById(filterId);
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// Funciones de navegación entre páginas de autenticación
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('forgotPasswordPage').style.display = 'none';
}

function showRegisterPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'flex';
    document.getElementById('forgotPasswordPage').style.display = 'none';
}

function showForgotPassword() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('forgotPasswordPage').style.display = 'flex';
}

function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    
    const user = db.findUserByEmail(email);
    if (user) {
        showAlert('Se han enviado instrucciones de recuperación a tu email', 'success');
        document.getElementById('forgotPasswordForm').reset();
        showLoginPage();
    } else {
        showAlert('No se encontró una cuenta con ese email', 'warning');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    console.log('Intentando login con:', email);
    
    try {
        // Verificar que la base de datos esté disponible
        if (typeof db === 'undefined') {
            console.error('Base de datos no disponible');
            showAlert('Error: Base de datos no disponible', 'warning');
            return;
        }
        
        const user = db.findUserByEmailAndPassword(email, password);
        console.log('Usuario encontrado:', user);
        
        if (user && user.status === 'activo') {
            currentUser = user;
            showDashboard();
            showAlert('¡Bienvenido ' + user.name + '!', 'success');
        } else if (user && user.status !== 'activo') {
            showAlert('Tu cuenta está ' + user.status, 'warning');
        } else {
            showAlert('Credenciales incorrectas', 'warning');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showAlert('Error en el sistema de login: ' + error.message, 'warning');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    if (db.findUserByEmail(email)) {
        showAlert('El email ya está registrado', 'warning');
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: password,
        role: role,
        status: 'activo'
    };

    db.addUser(newUser);
    refreshGlobalData();
    showAlert('Usuario registrado exitosamente', 'success');
    document.getElementById('registerForm').reset();
    showLoginPage();
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('forgotPasswordPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;

    // Mostrar/ocultar elementos según el rol
    const adminElements = document.querySelectorAll('.admin-only');
    const librarianElements = document.querySelectorAll('.librarian-only');

    adminElements.forEach(el => {
        el.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    });

    librarianElements.forEach(el => {
        el.style.display = (currentUser.role === 'bibliotecario' || currentUser.role === 'admin') ? 'block' : 'none';
    });

    loadBooks();
    loadLoans();
    loadUsers();
    loadStats();
    checkLowStock();
}

function logout() {
    currentUser = null;
    showLoginPage();
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loginForm').reset();
}

function showSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    document.getElementById(sectionName + 'Section').classList.add('active');
    event.target.classList.add('active');

    // Cargar datos específicos de la sección
    if (sectionName === 'admin') {
        loadInventoryTable();
    } else if (sectionName === 'loans') {
        loadLoans();
    } else if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'stats') {
        loadStats();
    }
}

function loadBooks() {
    const grid = document.getElementById('booksGrid');
    grid.innerHTML = '';

    const books = db.getBooks();
    books.forEach(book => {
        const bookCard = createBookCard(book);
        grid.appendChild(bookCard);
    });
}

function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';

    let stockClass = 'stock-available';
    let stockText = `${book.stock} disponibles`;

    if (book.stock === 0) {
        stockClass = 'stock-out';
        stockText = 'Sin stock';
    } else if (book.stock <= 2) {
        stockClass = 'stock-low';
        stockText = `${book.stock} disponibles (Stock bajo)`;
    }

    card.innerHTML = `
        <div class="book-title">${book.title}</div>
        <div class="book-author">Por: ${book.author}</div>
        <div class="book-details">
            <div><strong>Género:</strong> ${book.genre}</div>
            <div><strong>Editorial:</strong> ${book.editorial}</div>
            <div><strong>Tutor:</strong> ${book.tutor}</div>
            <div><strong>Año:</strong> ${book.year}</div>
            <div><strong>ISBN:</strong> ${book.isbn}</div>
        </div>
        ${book.description ? `<div class="book-description">${book.description}</div>` : ''}
        <div class="book-stock">
            <span class="stock-badge ${stockClass}">${stockText}</span>
            ${(currentUser.role === 'bibliotecario' || currentUser.role === 'admin') ? 
                `<button class="btn" onclick="editBook(${book.id})">Editar</button>` : ''}
        </div>
    `;

    return card;
}

function searchBooks() {
    const searchTerm = document.getElementById('searchInput').value;
    const genreFilter = document.getElementById('genreFilter').value;
    const editorialFilter = document.getElementById('editorialFilter').value;
    const tutorFilter = document.getElementById('tutorFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filters = {};
    if (genreFilter) filters.genre = genreFilter;
    if (editorialFilter) filters.editorial = editorialFilter;
    if (tutorFilter) filters.tutor = tutorFilter;
    if (statusFilter) filters.status = statusFilter;

    const results = db.searchBooks(searchTerm, filters);
    const resultsGrid = document.getElementById('searchResults');
    resultsGrid.innerHTML = '';

    if (results.length === 0) {
        resultsGrid.innerHTML = '<p>No se encontraron libros</p>';
        return;
    }

    results.forEach(book => {
        const bookCard = createBookCard(book);
        resultsGrid.appendChild(bookCard);
    });
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('genreFilter').value = '';
    document.getElementById('editorialFilter').value = '';
    document.getElementById('tutorFilter').value = '';
    document.getElementById('statusFilter').value = '';
    searchBooks();
}

function showAddBookModal() {
    document.getElementById('modalTitle').textContent = 'Agregar Nuevo Libro';
    document.getElementById('modalBookForm').reset();
    document.getElementById('bookModal').style.display = 'block';
}

function closeBookModal() {
    document.getElementById('bookModal').style.display = 'none';
}

function editBook(bookId) {
    const book = db.getBooks().find(b => b.id === bookId);
    if (book) {
        document.getElementById('modalTitle').textContent = 'Editar Libro';
        document.getElementById('modalBookTitle').value = book.title;
        document.getElementById('modalBookAuthor').value = book.author;
        document.getElementById('modalBookGenre').value = book.genre;
        document.getElementById('modalBookEditorial').value = book.editorial;
        document.getElementById('modalBookTutor').value = book.tutor;
        document.getElementById('modalBookYear').value = book.year;
        document.getElementById('modalBookStock').value = book.stock;
        document.getElementById('modalBookIsbn').value = book.isbn;
        document.getElementById('modalBookDescription').value = book.description || '';
        
        // Cambiar el formulario para editar
        const form = document.getElementById('modalBookForm');
        form.dataset.editId = bookId;
        document.getElementById('bookModal').style.display = 'block';
    }
}

function handleModalBookSubmit(e) {
    e.preventDefault();
    const editId = e.target.dataset.editId;
    
    const bookData = {
        title: document.getElementById('modalBookTitle').value,
        author: document.getElementById('modalBookAuthor').value,
        genre: document.getElementById('modalBookGenre').value,
        editorial: document.getElementById('modalBookEditorial').value,
        tutor: document.getElementById('modalBookTutor').value,
        year: parseInt(document.getElementById('modalBookYear').value),
        stock: parseInt(document.getElementById('modalBookStock').value),
        isbn: document.getElementById('modalBookIsbn').value,
        description: document.getElementById('modalBookDescription').value
    };

    if (editId) {
        // Editar libro existente
        db.updateBook(parseInt(editId), bookData);
        showAlert('Libro actualizado exitosamente', 'success');
    } else {
        // Agregar nuevo libro
        db.addBook(bookData);
        showAlert('Libro agregado exitosamente', 'success');
    }

    refreshGlobalData();
    loadBooks();
    loadInventoryTable();
    closeBookModal();
    checkLowStock();
}

function handleBookSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const genre = document.getElementById('bookGenre').value;
    const editorial = document.getElementById('bookEditorial').value;
    const tutor = document.getElementById('bookTutor').value;
    const year = parseInt(document.getElementById('bookYear').value);
    const stock = parseInt(document.getElementById('bookStock').value);
    const isbn = document.getElementById('bookIsbn').value;
    const description = document.getElementById('bookDescription').value;

    const newBook = {
        title: title,
        author: author,
        genre: genre,
        editorial: editorial,
        tutor: tutor,
        year: year,
        stock: stock,
        isbn: isbn,
        description: description
    };

    db.addBook(newBook);
    refreshGlobalData();
    loadBooks();
    document.getElementById('bookForm').reset();
    showAlert('Libro agregado exitosamente', 'success');
    checkLowStock();
}

function loadInventoryTable() {
    const table = document.getElementById('inventoryTable');
    const books = db.getBooks();
    
    table.innerHTML = `
        <h3>Inventario Completo</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Género</th>
                    <th>Editorial</th>
                    <th>Tutor</th>
                    <th>Año</th>
                    <th>Stock</th>
                    <th>ISBN</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${books.map(book => `
                    <tr>
                        <td>${book.id}</td>
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${book.genre}</td>
                        <td>${book.editorial}</td>
                        <td>${book.tutor}</td>
                        <td>${book.year}</td>
                        <td>${book.stock}</td>
                        <td>${book.isbn}</td>
                        <td>${book.status}</td>
                        <td>
                            <button class="btn" onclick="editBook(${book.id})">Editar</button>
                            <button class="btn btn-secondary" onclick="deleteBook(${book.id})">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function deleteBook(bookId) {
    if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        db.deleteBook(bookId);
        refreshGlobalData();
        loadBooks();
        loadInventoryTable();
        showAlert('Libro eliminado exitosamente', 'success');
    }
}

function handleLoanSubmit(e) {
    e.preventDefault();
    const bookId = parseInt(document.getElementById('loanBook').value);
    const userId = parseInt(document.getElementById('loanUser').value);
    const loanDate = document.getElementById('loanDate').value;
    const returnDate = document.getElementById('returnDate').value;

    const book = db.getBooks().find(b => b.id === bookId);
    const user = db.getUsers().find(u => u.id === userId);

    if (!book || !user) {
        showAlert('Libro o usuario no encontrado', 'warning');
        return;
    }

    if (book.stock <= 0) {
        showAlert('No hay stock disponible para este libro', 'warning');
        return;
    }

    const newLoan = {
        bookId: bookId,
        userId: userId,
        bookTitle: book.title,
        userName: user.name,
        loanDate: loanDate,
        returnDate: returnDate,
        status: 'activo'
    };

    db.addLoan(newLoan);
    refreshGlobalData();
    loadBooks();
    loadLoans();
    document.getElementById('loanForm').reset();
    showAlert('Préstamo creado exitosamente', 'success');
    checkLowStock();
}

const prestamos = []; // O usa tu almacenamiento actual
const usuarioLogueado = "usuario"; // O tu variable real

document.getElementById('loanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const libro = document.getElementById('loanBookSelect').value;
    const fechaPrestamo = document.getElementById('loanStartDate').value;
    const fechaDevolucion = document.getElementById('loanEndDate').value;
    const ahora = new Date();
    const hora = ahora.toTimeString().split(' ')[0];

    prestamos.push({
        libro,
        usuario: usuarioLogueado,
        fechaPrestamo: `${fechaPrestamo} ${hora}`,
        fechaDevolucion,
        estado: 'activo'
    });
    mostrarPrestamos();
    this.reset();
});

function mostrarPrestamos() {
    const loansList = document.getElementById('loansList');
    loansList.innerHTML = '';
    prestamos.forEach(prestamo => {
        loansList.innerHTML += `
            <div class="prestamo-card">
                <b>Libro:</b> ${prestamo.libro}<br>
                <b>Usuario:</b> ${prestamo.usuario}<br>
                <b>Fecha de préstamo:</b> ${prestamo.fechaPrestamo}<br>
                <b>Fecha de devolución:</b> ${prestamo.fechaDevolucion}<br>
                <b>Estado:</b> ${prestamo.estado}
            </div>
        `;
    });
}

function loadLoans() {
    const loansList = document.getElementById('loansList');
    const loanBookSelect = document.getElementById('loanBook');
    const loanUserSelect = document.getElementById('loanUser');

    const books = db.getBooks();
    const users = db.getUsers();
    const loans = db.getLoans();

    // Cargar opciones de libros
    loanBookSelect.innerHTML = '<option value="">Seleccionar libro</option>';
    books.forEach(book => {
        if (book.stock > 0) {
            loanBookSelect.innerHTML += `<option value="${book.id}">${book.title} (${book.stock} disponibles)</option>`;
        }
    });

    // Cargar opciones de usuarios
    loanUserSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
    users.forEach(user => {
        if (user.role === 'usuario' && user.status === 'activo') {
            loanUserSelect.innerHTML += `<option value="${user.id}">${user.name}</option>`;
        }
    });

    // Mostrar lista de préstamos
    loansList.innerHTML = `
        <h3>Préstamos Activos</h3>
        <div style="display: grid; gap: 1rem; margin-top: 1rem;">
            ${loans.map(loan => `
                <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div><strong>Libro:</strong> ${loan.bookTitle}</div>
                    <div><strong>Usuario:</strong> ${loan.userName}</div>
                    <div><strong>Fecha de préstamo:</strong> ${loan.loanDate}</div>
                    <div><strong>Fecha de devolución:</strong> ${loan.returnDate}</div>
                    <div><strong>Estado:</strong> ${loan.status}</div>
                    ${loan.status === 'activo' ? 
                        `<button class="btn" onclick="returnBook(${loan.id})" style="margin-top: 0.5rem;">Marcar como devuelto</button>` : 
                        '<span style="color: #718096;">Préstamo finalizado</span>'
                    }
                </div>
            `).join('')}
        </div>
    `;
}

function returnBook(loanId) {
    db.updateLoan(loanId, { status: 'devuelto' });
    refreshGlobalData();
    loadBooks();
    loadLoans();
    showAlert('Libro marcado como devuelto', 'success');
}

function handleUserSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;

    const newUser = {
        name: name,
        email: email,
        password: password,
        role: role,
        status: status
    };

    db.addUser(newUser);
    refreshGlobalData();
    loadUsers();
    document.getElementById('userForm').reset();
    showAlert('Usuario agregado exitosamente', 'success');
}

function loadUsers() {
    const usersTable = document.getElementById('usersTable');
    const users = db.getUsers();
    
    usersTable.innerHTML = `
        <h3>Usuarios Registrados</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${user.status}</td>
                        <td>
                            <button class="btn" onclick="editUser(${user.id})">Editar</button>
                            <button class="btn btn-secondary" onclick="deleteUser(${user.id})">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function editUser(userId) {
    const user = db.getUsers().find(u => u.id === userId);
    if (user) {
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPassword').value = user.password;
        document.getElementById('userRole').value = user.role;
        document.getElementById('userStatus').value = user.status;
        
        // Cambiar el formulario para editar
        const form = document.getElementById('userForm');
        form.dataset.editId = userId;
        form.querySelector('button[type="submit"]').textContent = 'Actualizar Usuario';
    }
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        db.deleteUser(userId);
        refreshGlobalData();
        loadUsers();
        showAlert('Usuario eliminado exitosamente', 'success');
    }
}

function loadStats() {
    const stats = db.getStats();
    
    document.getElementById('totalBooks').textContent = stats.totalBooks;
    document.getElementById('availableBooks').textContent = stats.availableBooks;
    document.getElementById('totalLoans').textContent = stats.totalLoans;
    document.getElementById('activeLoans').textContent = stats.activeLoans;
    document.getElementById('totalUsers').textContent = stats.totalUsers;
    document.getElementById('activeUsers').textContent = stats.activeUsers;
    
    // Crear gráficos simples
    createGenreChart();
    createLoansChart();
}

function createGenreChart() {
    const books = db.getBooks();
    const genreCount = {};
    
    books.forEach(book => {
        genreCount[book.genre] = (genreCount[book.genre] || 0) + 1;
    });
    
    const chartContainer = document.getElementById('genreChart');
    chartContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${Object.entries(genreCount).map(([genre, count]) => `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${genre}</span>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 100px; height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
                            <div style="width: ${(count / Math.max(...Object.values(genreCount))) * 100}%; height: 100%; background: #667eea;"></div>
                        </div>
                        <span style="font-weight: 600;">${count}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function createLoansChart() {
    const loans = db.getLoans();
    const monthCount = {};
    
    loans.forEach(loan => {
        const month = new Date(loan.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        monthCount[month] = (monthCount[month] || 0) + 1;
    });
    
    const chartContainer = document.getElementById('loansChart');
    chartContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${Object.entries(monthCount).map(([month, count]) => `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>${month}</span>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div style="width: 100px; height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
                            <div style="width: ${(count / Math.max(...Object.values(monthCount))) * 100}%; height: 100%; background: #764ba2;"></div>
                        </div>
                        <span style="font-weight: 600;">${count}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function exportCatalog() {
    const books = db.getBooks();
    const csvContent = [
        ['Título', 'Autor', 'Género', 'Editorial', 'Tutor', 'Año', 'Stock', 'ISBN', 'Estado'],
        ...books.map(book => [
            book.title,
            book.author,
            book.genre,
            book.editorial,
            book.tutor,
            book.year,
            book.stock,
            book.isbn,
            book.status
        ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'catalogo_biblioteca.csv';
    link.click();
}

function checkLowStock() {
    const lowStockBooks = db.getBooks().filter(book => book.stock <= 2);
    const alertsContainer = document.getElementById('adminAlerts');
    
    if (lowStockBooks.length > 0) {
        alertsContainer.innerHTML = `
            <div class="alert alert-warning">
                ⚠️ Alerta: Los siguientes libros tienen stock bajo:
                <ul style="margin-top: 0.5rem;">
                    ${lowStockBooks.map(book => `
                        <li>${book.title} - ${book.stock} ejemplares</li>
                    `).join('')}
                </ul>
            </div>
        `;
    } else {
        alertsContainer.innerHTML = '';
    }
}

function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Supón que tienes un array de libros llamado "libros"
const libros = [
    { id: 1, titulo: "Don Quijote" },
    { id: 2, titulo: "Cien años de soledad" },
    // ...otros libros...
];

// Función para llenar el select de libros
function llenarSelectLibros() {
    const select = document.getElementById('loanBookSelect');
    select.innerHTML = '<option value="">Seleccionar libro</option>';
    libros.forEach(libro => {
        const option = document.createElement('option');
        option.value = libro.id;
        option.textContent = libro.titulo;
        select.appendChild(option);
    });
}

// Llama a esta función cuando se muestre la sección de préstamos o al cargar la página
llenarSelectLibros();

// Utilidad para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}