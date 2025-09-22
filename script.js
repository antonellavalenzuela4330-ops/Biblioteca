// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando sistema...');
    
    // Asegurar que la base de datos esté lista
    if (typeof db !== 'undefined') {
        console.log('Base de datos encontrada:', db);
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
    document.getElementById('userLoanRequestForm').addEventListener('submit', handleUserLoanRequest);
    document.getElementById('returnForm').addEventListener('submit', handleReturnSubmit);
    document.getElementById('notReturnedForm').addEventListener('submit', handleNotReturnedSubmit);
    document.getElementById('userEditForm').addEventListener('submit', handleUserEdit);
    // Quitar búsquedas automáticas: solo con el botón
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
    console.log('Cambiando a página de login...');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('forgotPasswordPage').style.display = 'none';
    
    // Limpiar el formulario de registro al cambiar de página
    document.getElementById('registerForm').reset();
}

function showRegisterPage() {
    console.log('Cambiando a página de registro...');
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'flex';
    document.getElementById('forgotPasswordPage').style.display = 'none';
    
    // Limpiar el formulario de login al cambiar de página
    document.getElementById('loginForm').reset();
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
    console.log('=== INICIANDO PROCESO DE LOGIN ===');
    
    // Obtener los valores de los campos
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    console.log('Email ingresado:', email);
    console.log('Contraseña ingresada:', password ? '***' : 'vacía');

    // Validar que los campos no estén vacíos
    if (!email || !password) {
        console.log('ERROR: Campos vacíos');
        showAlert('Por favor, completa todos los campos', 'warning');
        return;
    }

    try {
        // Verificar que la base de datos esté disponible
        if (typeof db === 'undefined') {
            console.log('ERROR: Base de datos no disponible');
            showAlert('Error: Base de datos no disponible', 'warning');
            return;
        }

        console.log('Base de datos disponible, buscando usuario...');
        
        // Obtener todos los usuarios para debug
        const allUsers = db.getUsers();
        console.log('Todos los usuarios:', allUsers);

        // Buscar usuario activo y con credenciales correctas
        const user = allUsers.find(
            u => u.email === email && u.password === password && u.status === 'activo'
        );

        console.log('Usuario encontrado:', user);

        if (user) {
            console.log('=== LOGIN EXITOSO ===');
            console.log('Estableciendo usuario actual:', user);
            
            currentUser = user;
            console.log('Usuario actual establecido:', currentUser);
            
            console.log('Mostrando dashboard...');
            showDashboard();
            
            showAlert('¡Bienvenido ' + user.name + '!', 'success');
            
            // Limpiar el formulario solo después del login exitoso
            document.getElementById('loginForm').reset();
            console.log('=== LOGIN COMPLETADO EXITOSAMENTE ===');
        } else {
            console.log('=== LOGIN FALLIDO ===');
            console.log('Credenciales incorrectas o usuario no encontrado');
            showAlert('Credenciales incorrectas o usuario inactivo', 'warning');
            
            // Mostrar información de debug
            console.log('Usuarios disponibles para debug:');
            allUsers.forEach(u => {
                console.log(`- ${u.email} (${u.password}) - ${u.status}`);
            });
        }
    } catch (error) {
        console.error('=== ERROR EN LOGIN ===');
        console.error('Error:', error);
        showAlert('Error en el sistema de login: ' + error.message, 'warning');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const dni = document.getElementById('registerDni').value.trim();
    const address = document.getElementById('registerAddress').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    // Validar que todos los campos estén completos
    if (!name || !dni || !address || !phone || !email || !password || !role) {
        showAlert('Por favor, completa todos los campos', 'warning');
        return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Por favor, ingresa un email válido', 'warning');
        return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }

    try {
        if (db.findUserByEmail(email)) {
            showAlert('El email ya está registrado', 'warning');
            return;
        }

        const newUser = {
            name: name,
            dni: dni,
            address: address,
            phone: phone,
            email: email,
            password: password,
            role: role,
            status: 'activo'
        };

        db.addUser(newUser);
        showAlert('Usuario registrado exitosamente', 'success');
        document.getElementById('registerForm').reset();
        showLoginPage();
    } catch (error) {
        showAlert('Error al registrar usuario: ' + error.message, 'warning');
        console.error('Error en handleRegister:', error);
    }
}

function showDashboard() {
    console.log('Mostrando dashboard para usuario:', currentUser);
    
    // Ocultar todas las páginas de autenticación
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('forgotPasswordPage').style.display = 'none';
    
    // Mostrar el dashboard
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'block';
    console.log('Dashboard mostrado:', dashboard.style.display);

    // Actualizar indicadores visuales de rol
    updateRoleIndicators(currentUser.role);

    // Mostrar/ocultar elementos según el rol
    const bibliotecarioElements = document.querySelectorAll('.admin-only');
    const librarianElements = document.querySelectorAll('.librarian-only');
    const userLoansElements = document.querySelectorAll('.user-loans-tab');

    // Solo mostrar admin-only si es bibliotecario
    bibliotecarioElements.forEach(el => {
        el.style.display = currentUser.role === 'bibliotecario' ? 'block' : 'none';
    });

    // Mostrar librarian-only si es bibliotecario
    librarianElements.forEach(el => {
        el.style.display = currentUser.role === 'bibliotecario' ? 'block' : 'none';
    });

    // Mostrar pestaña de préstamos solo para usuarios (no bibliotecario)
    userLoansElements.forEach(el => {
        el.style.display = currentUser.role === 'usuario' ? 'block' : 'none';
    });

    // Cargar datos del dashboard
    try {
        // Actualizar variables globales
        users = db.getUsers();
        books = db.getBooks();
        loans = db.getLoans();
        
        loadBooks();
        loadLoans();
        loadUsers();
        loadStats();
        checkLowStock();
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
    }

    // Mostrar por defecto el catálogo tras iniciar sesión
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.getElementById('catalogSection').classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    const tabCatalog = document.getElementById('tabCatalog');
    if (tabCatalog) tabCatalog.classList.add('active');
    
    console.log('Dashboard configurado completamente');
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
        loadReturns();
        loadNotReturnedBooks();
        loadStockStatus();
        setupReturnUserSelectors();
    } else if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'stats') {
        loadStats();
    } else if (sectionName === 'userLoans') {
        setupUserLoanForm();
        loadUserLoans();
    } else if (sectionName === 'profiles') {
        loadUserProfiles();
        setupProfileUserSelector();
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

    // Función para obtener la URL de la imagen de la portada
    const getBookCoverImage = (title) => {
        const coverImages = {
            'Don Quijote': 'Don Quijote.jpg',
            'Cien años de soledad': 'Cien años de soledad.png',
            'El señor de los anillos': 'El señor de los anillos.jpg',
            '1984': '1984.jpg',
            'Orgullo y prejuicio': 'Orgullo y prejuicio.jpeg',
            'Crimen y castigo': 'Don Quijote.jpg',
            'El gran Gatsby': 'Cien años de soledad.png',
            'Matar a un ruiseñor': 'El señor de los anillos.jpg'
        };
        return coverImages[title] || 'Don Quijote.jpg';
    };

    card.innerHTML = `
        <div class="book-cover">
            <img src="${getBookCoverImage(book.title)}" alt="Portada de ${book.title}" class="book-cover-image" />
        </div>
        <div class="book-info">
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
            </div>
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
        loadBooks();
        loadInventoryTable();
        showAlert('Libro eliminado exitosamente', 'success');
    }
}

function handleLoanSubmit(e) {
    e.preventDefault();
    const bookId = parseInt(document.getElementById('loanBook').value);
    const quantity = parseInt(document.getElementById('loanQuantity').value) || 1;
    const loanDate = document.getElementById('loanDate').value;
    const returnDate = document.getElementById('returnDate').value;

    // Determinar el userId según el rol del usuario
    let userId;
    if (currentUser.role === 'usuario') {
        userId = currentUser.id;
    } else {
        userId = parseInt(document.getElementById('loanUser').value);
    }

    const book = db.getBooks().find(b => b.id === bookId);
    const user = db.getUsers().find(u => u.id === userId);

    if (!book || !user) {
        showAlert('Libro o usuario no encontrado', 'warning');
        return;
    }

    if (quantity <= 0) {
        showAlert('La cantidad debe ser mayor a 0', 'warning');
        return;
    }
    if (book.stock < quantity) {
        showAlert('No hay suficiente stock disponible para este libro', 'warning');
        return;
    }

    // Verificar si el usuario ya tiene un préstamo activo de este libro
    const existingLoan = db.getLoans().find(loan => 
        loan.userId === userId && 
        loan.bookId === bookId && 
        loan.status === 'activo'
    );

    if (existingLoan) {
        showAlert('Ya tienes un préstamo activo de este libro', 'warning');
        return;
    }

    // Crear fecha y hora actual para el préstamo
    const now = new Date();
    const currentDateTime = now.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const newLoan = {
        bookId: bookId,
        userId: userId,
        bookTitle: book.title,
        userName: user.name,
        quantity: quantity,
        loanDate: currentDateTime,
        returnDate: returnDate,
        status: 'pendiente'
    };

    db.addLoan(newLoan);
    loadBooks();
    loadLoans();
    document.getElementById('loanForm').reset();
    
    // Crear notificación de préstamo aprobado
    createLoanNotification(newLoan, 'approved');
    
    if (currentUser.role === 'usuario') {
        showAlert('Tu préstamo ha sido creado exitosamente', 'success');
    } else {
        showAlert('Préstamo creado exitosamente', 'success');
    }
    
    checkLowStock();
}


function loadLoans() {
    const loansList = document.getElementById('loansList');
    const loanBookSelect = document.getElementById('loanBook');
    const loanUserSelect = document.getElementById('loanUser');

    const books = db.getBooks();
    const users = db.getUsers();
    const loans = db.getLoans();

    // Cargar opciones de libros (mostrar todos, indicando stock)
    loanBookSelect.innerHTML = '<option value="">Seleccionar libro</option>';
    books.forEach(book => {
        const disabled = book.stock <= 0 ? 'disabled' : '';
        loanBookSelect.innerHTML += `<option value="${book.id}" ${disabled}>${book.title} (${book.stock} disponibles)</option>`;
    });

    // Adaptar formulario según el rol del usuario
    if (currentUser.role === 'usuario') {
        // Para usuarios, ocultar el selector de usuario y establecer el usuario actual
        loanUserSelect.style.display = 'none';
        loanUserSelect.innerHTML = `<option value="${currentUser.id}" selected>${currentUser.name}</option>`;
        
        // Mostrar solo los préstamos del usuario actual
        const userLoans = loans.filter(loan => loan.userId === currentUser.id);
        
        if (userLoans.length === 0) {
            loansList.innerHTML = '<p style="text-align: center; color: #ffffff; opacity: 0.8; padding: 2rem; font-size: 1.1rem;">No tienes préstamos activos</p>';
        } else {
            loansList.innerHTML = `
                <h3>Mis Préstamos</h3>
                <div class="loans-narrow">
                    <div class="loans-grid" style="margin-top: 1rem;">
                        ${userLoans.map(loan => `
                            <div class="user-loan-card">
                                <div class="loan-info">
                                    <div class="loan-info-item"><strong>Libro:</strong> ${loan.bookTitle}</div>
                                    <div class="loan-info-item"><strong>Usuario:</strong> ${loan.userName}</div>
                                    <div class="loan-info-item"><strong>Fecha de préstamo:</strong> ${loan.loanDate || loan.startDate || 'No especificada'}</div>
                                    <div class="loan-info-item"><strong>Fecha de devolución:</strong> ${loan.returnDate || loan.endDate || 'No especificada'}</div>
                                    <div class="loan-info-item"><strong>Estado:</strong> ${loan.status}</div>
                                </div>
                                <div class="loan-actions">
                                    ${loan.status === 'pendiente' ? 
                                        '<span style="color: #d4af37; font-style: italic;">Préstamo pendiente de aprobación</span>' :
                                    loan.status === 'activo' ? 
                                        `<button class=\"btn\" onclick=\"returnBook(${loan.id})\">Marcar como devuelto</button>` : 
                                        '<span style="color: #ffffff; opacity: 0.8; font-style: italic;">Préstamo finalizado</span>'
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    } else {
        // Para bibliotecarios, mostrar selector de usuario
        loanUserSelect.style.display = 'block';
        loanUserSelect.innerHTML = '<option value="">Seleccionar usuario</option>';
        users.forEach(user => {
            if (user.status === 'activo') {
                loanUserSelect.innerHTML += `<option value="${user.id}">${user.name} (${user.role})</option>`;
            }
        });

        // Mostrar todos los préstamos (administración) en grid y contenedor angosto
        loansList.innerHTML = `
            <h3>Préstamos Activos</h3>
            <div class="loans-narrow">
                <div class="loans-grid" style="margin-top: 1rem;">
                    ${loans.map(loan => `
                        <div class="user-loan-card">
                            <div class="loan-info">
                                <div class="loan-info-item"><strong>Libro:</strong> ${loan.bookTitle}</div>
                                <div class="loan-info-item"><strong>Usuario:</strong> ${loan.userName}</div>
                                <div class="loan-info-item"><strong>Fecha de préstamo:</strong> ${loan.loanDate || loan.startDate || 'No especificada'}</div>
                                <div class="loan-info-item"><strong>Fecha de devolución:</strong> ${loan.returnDate || loan.endDate || 'No especificada'}</div>
                                <div class="loan-info-item"><strong>Estado:</strong> ${loan.status}</div>
                            </div>
                            ${loan.status === 'pendiente' && currentUser.role === 'bibliotecario' ? 
                                `<div class=\"loan-actions\">
                                    <button class=\"btn\" onclick=\"acceptLoan(${loan.id})\" style=\"margin-right: 0.5rem;\">Aprobar Préstamo</button>
                                    <button class=\"btn btn-secondary\" onclick=\"rejectLoan(${loan.id})\">Rechazar</button>
                                </div>` :
                            loan.status === 'aprobado' && currentUser.role === 'bibliotecario' ? 
                                `<div class=\"loan-actions\">
                                    <button class=\"btn\" onclick=\"returnBook(${loan.id})\" style=\"margin-right: 0.5rem;\">Finalizar préstamo</button>
                                    <button class=\"btn btn-warning\" onclick=\"notReturnedBook(${loan.id})\">Devolución no realizada</button>
                                </div>` : 
                                loan.status === 'devuelto' ? 
                                    '<span style="color: #ffffff; opacity: 0.8; font-style: italic;">Préstamo finalizado</span>' :
                                    loan.status === 'rechazado' ?
                                        '<span style="color: #dc3545; font-style: italic;">Préstamo rechazado</span>' :
                                        '<span style="color: #d4af37; font-style: italic;">Préstamo pendiente de aprobación</span>'
                            }
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

function acceptLoan(loanId) {
    const now = new Date().toLocaleString('es-ES');
    db.updateLoan(loanId, { 
        status: 'aprobado',
        approvedAt: now
    });
    loadBooks();
    loadLoans();
    showAlert('Préstamo aprobado exitosamente', 'success');
}

function rejectLoan(loanId) {
    if (confirm('¿Estás seguro de que quieres rechazar este préstamo?')) {
        const now = new Date().toLocaleString('es-ES');
        db.updateLoan(loanId, { 
            status: 'rechazado',
            rejectedAt: now
        });
        loadBooks();
        loadLoans();
        showAlert('Préstamo rechazado', 'warning');
    }
}

function returnBook(loanId) {
    // Guardar el ID del préstamo para usar en la sección de devoluciones
    window.currentLoanId = loanId;
    
    // Pre-llenar el formulario de devolución con los datos del préstamo
    const loan = db.getLoans().find(l => l.id === loanId);
    if (loan) {
        const book = db.getBooks().find(b => b.id === loan.bookId);
        if (book) {
            // Pre-llenar el formulario de devolución
            document.getElementById('returnUser').value = loan.userId;
            document.getElementById('returnIsbn').value = book.isbn;
            document.getElementById('returnDate').value = new Date().toISOString().split('T')[0];
        }
    }
    
    // Hacer scroll hacia el formulario de devolución
    const returnForm = document.getElementById('returnForm');
    if (returnForm) {
        returnForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showAlert('Complete el formulario de devolución para finalizar el préstamo', 'info');
}

function notReturnedBook(loanId) {
    // Guardar el ID del préstamo para usar en la sección de devoluciones
    window.currentLoanId = loanId;
    
    // Pre-llenar el formulario de "Libro No Devuelto" con los datos del préstamo
    const loan = db.getLoans().find(l => l.id === loanId);
    if (loan) {
        const book = db.getBooks().find(b => b.id === loan.bookId);
        if (book) {
            // Pre-llenar el formulario de no devuelto
            document.getElementById('notReturnedUser').value = loan.userId;
            document.getElementById('notReturnedIsbn').value = book.isbn;
            document.getElementById('notReturnedDate').value = new Date().toISOString().split('T')[0];
        }
    }
    
    // Hacer scroll hacia el formulario de no devuelto
    const notReturnedForm = document.getElementById('notReturnedForm');
    if (notReturnedForm) {
        notReturnedForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    showAlert('Complete el formulario de "Libro No Devuelto" para registrar la no devolución', 'warning');
}

function handleUserSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const dni = document.getElementById('userDni').value;
    const phone = document.getElementById('userPhone').value;
    const address = document.getElementById('userAddress').value;
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;

    const newUser = {
        name: name,
        email: email,
        password: password,
        dni: dni,
        phone: phone,
        address: address,
        role: role,
        status: status
    };

    db.addUser(newUser);
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
                    <th>DNI</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Confiabilidad</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.dni || '-'}</td>
                        <td>${user.phone || '-'}</td>
                        <td>${user.role}</td>
                        <td><span class="status-badge ${getStatusClass(user.status)}">${user.status}</span></td>
                        <td><span class="reliability-score ${getReliabilityClass(user.reliabilityScore)}">${user.reliabilityScore}</span></td>
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
        // Llenar el modal de edición con los datos del usuario
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').value = user.name;
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserPassword').value = ''; // No mostrar la contraseña actual
        document.getElementById('editUserDni').value = user.dni || '';
        document.getElementById('editUserPhone').value = user.phone || '';
        document.getElementById('editUserAddress').value = user.address || '';
        document.getElementById('editUserRole').value = user.role;
        document.getElementById('editUserStatus').value = user.status;
        
        // Mostrar el modal
        document.getElementById('userEditModal').style.display = 'block';
    }
}

function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
        db.deleteUser(userId);
        loadUsers();
        showAlert('Usuario eliminado exitosamente', 'success');
    }
}

// Funciones para el modal de edición de usuarios
function closeUserEditModal() {
    document.getElementById('userEditModal').style.display = 'none';
    document.getElementById('userEditForm').reset();
}

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const userEditModal = document.getElementById('userEditModal');
    if (event.target === userEditModal) {
        closeUserEditModal();
    }
}

function handleUserEdit(e) {
    e.preventDefault();
    
    const userId = document.getElementById('editUserId').value;
    console.log('Editando usuario ID:', userId);
    
    const user = db.getUsers().find(u => u.id === parseInt(userId));
    console.log('Usuario encontrado:', user);
    
    if (!user) {
        showAlert('Usuario no encontrado', 'warning');
        return;
    }
    
    // Obtener los datos del formulario
    const updatedUser = {
        name: document.getElementById('editUserName').value.trim(),
        email: document.getElementById('editUserEmail').value.trim(),
        password: document.getElementById('editUserPassword').value || user.password, // Mantener contraseña actual si no se especifica nueva
        dni: document.getElementById('editUserDni').value.trim(),
        phone: document.getElementById('editUserPhone').value.trim(),
        address: document.getElementById('editUserAddress').value.trim(),
        role: document.getElementById('editUserRole').value,
        status: document.getElementById('editUserStatus').value,
        createdAt: user.createdAt, // Mantener fecha de creación
        reliabilityScore: user.reliabilityScore // Mantener puntuación de confiabilidad
    };
    
    console.log('Datos actualizados:', updatedUser);
    
    try {
        // Actualizar el usuario en la base de datos
        const result = db.updateUser(parseInt(userId), updatedUser);
        console.log('Resultado de actualización:', result);
        
        if (result) {
            // Actualizar la tabla de usuarios
            loadUsers();
            
            // Cerrar el modal
            closeUserEditModal();
            
            showAlert('Usuario actualizado correctamente', 'success');
        } else {
            showAlert('Error: Usuario no encontrado', 'warning');
        }
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        showAlert('Error al actualizar el usuario', 'warning');
    }
}

function loadStats() {
    // Actualizar variables globales antes de calcular estadísticas
    users = db.getUsers();
    books = db.getBooks();
    loans = db.getLoans();
    
    const stats = db.getStats();
    
    console.log('Estadísticas calculadas:', stats);
    console.log('Datos actuales:', { users: users.length, books: books.length, loans: loans.length });
    
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


function checkLowStock() {
    const lowStockBooks = db.getBooks().filter(book => book.stock <= 2);
    const alertsContainer = document.getElementById('adminAlerts');
    
    if (lowStockBooks.length > 0) {
        alertsContainer.innerHTML = `
            <div class="alert alert-warning">
                <div><strong>Alerta de stock bajo</strong></div>
                <div class="low-stock-list">
                    ${lowStockBooks.map(book => `
                        <div class="low-stock-item">
                            <span class="low-stock-dot"></span>
                            <span class="low-stock-text">${book.title} - ${book.stock} ejemplares</span>
                        </div>
                    `).join('')}
                </div>
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

// Función debounce para optimizar búsquedas
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


// Funciones para préstamos de usuarios
function setupUserLoanForm() {
    const requestBookSelect = document.getElementById('requestBook');
    const books = db.getBooks();
    
    requestBookSelect.innerHTML = '<option value="">Seleccionar libro</option>';
    books.forEach(book => {
        if (book.stock > 0) {
            requestBookSelect.innerHTML += `<option value="${book.id}">${book.title} (${book.stock} disponibles)</option>`;
        }
    });
    
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('requestStartDate').min = today;
    document.getElementById('requestEndDate').min = today;
    
    // Actualizar fecha de fin cuando cambie la fecha de inicio
    document.getElementById('requestStartDate').addEventListener('change', function() {
        const startDate = this.value;
        document.getElementById('requestEndDate').min = startDate;
    });
}

function handleUserLoanRequest(e) {
    e.preventDefault();
    
    const bookId = parseInt(document.getElementById('requestBook').value);
    const quantity = parseInt(document.getElementById('requestQuantity').value);
    const startDate = document.getElementById('requestStartDate').value;
    const endDate = document.getElementById('requestEndDate').value;
    
    const book = db.getBooks().find(b => b.id === bookId);
    
    if (!book) {
        showUserNotification('Libro no encontrado', 'error');
        return;
    }
    
    if (book.stock < quantity) {
        showUserNotification('No hay suficiente stock disponible', 'error');
        return;
    }
    
    if (new Date(endDate) <= new Date(startDate)) {
        showUserNotification('La fecha de devolución debe ser posterior a la fecha de inicio', 'error');
        return;
    }
    
    // Crear solicitud de préstamo
    const loanRequest = {
        id: Date.now(),
        bookId: bookId,
        userId: currentUser.id,
        bookTitle: book.title,
        userName: currentUser.name,
        quantity: quantity,
        startDate: startDate,
        endDate: endDate,
        // También guardar fechas en formato legible
        loanDate: new Date(startDate).toLocaleDateString('es-ES'),
        returnDate: new Date(endDate).toLocaleDateString('es-ES'),
        status: 'pendiente',
        createdAt: new Date().toISOString(),
        requestedAt: new Date().toLocaleString('es-ES')
    };
    
    // Agregar a la base de datos
    db.addLoan(loanRequest);
    
    // Limpiar formulario
    document.getElementById('userLoanRequestForm').reset();
    
    // Mostrar notificación de éxito
    showUserNotification('Solicitud de préstamo enviada correctamente. Espera la aprobación del administrador.', 'success');
    
    // Actualizar la lista de préstamos
    loadUserLoans();
    
    // Actualizar filtros
    setupUserLoanForm();
}
function loadUserLoans() {
    // Para usuarios, no mostrar historial de préstamos
    // El historial ha sido eliminado del HTML para usuarios
    // Solo cargar notificaciones del usuario
    loadUserNotifications();
}

function getStatusText(status) {
    const statusMap = {
        'pendiente': 'En Observación',
        'aprobado': 'Préstamo Aprobado',
        'rechazado': 'Préstamo Rechazado',
        'devuelto': 'Devuelto'
    };
    return statusMap[status] || status;
}

function calculateDaysRemaining(endDate, status) {
    if (status !== 'aprobado') return null;
    
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return '¡Ya se pasó el día de devolución!';
    } else if (diffDays === 0) {
        return '¡Hoy es el último día para devolver!';
    } else if (diffDays <= 3) {
        return `¡Recordatorio: te quedan solo ${diffDays} días!`;
    }
    
    return null;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
}

// Función eliminada - ya no se muestra historial de préstamos para usuarios

function showUserNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'warning' : type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function returnUserBook(loanId) {
    if (confirm('¿Estás seguro de que quieres marcar este libro como devuelto?')) {
        const now = new Date().toLocaleString('es-ES');
        db.updateLoan(loanId, { 
            status: 'devuelto',
            returnedAt: now
        });
        
        loadUserLoans();
        showUserNotification('Libro marcado como devuelto exitosamente', 'success');
    }
}

// ==================== FUNCIONES DE GESTIÓN DE DEVOLUCIONES ====================

function handleReturnSubmit(e) {
    e.preventDefault();
    
    const userId = parseInt(document.getElementById('returnUser').value);
    const isbn = document.getElementById('returnIsbn').value.trim();
    const condition = document.getElementById('returnCondition').value;
    const returnDate = document.getElementById('returnDate').value;
    const notes = document.getElementById('returnNotes').value.trim();
    
    // Validar que todos los campos estén completos
    if (!userId || !isbn || !condition || !returnDate) {
        showAlert('Por favor, completa todos los campos obligatorios', 'warning');
        return;
    }
    
    // Buscar el libro por ISBN
    const book = db.getBooks().find(b => b.isbn === isbn);
    if (!book) {
        showAlert('No se encontró un libro con ese ISBN', 'warning');
        return;
    }
    
    // Buscar préstamos activos de este libro y usuario específico
    const activeLoans = db.getLoans().filter(loan => 
        loan.bookId === book.id && 
        loan.userId === userId &&
        (loan.status === 'activo' || loan.status === 'aprobado')
    );
    
    if (activeLoans.length === 0) {
        showAlert('No hay préstamos activos de este libro para el usuario seleccionado', 'warning');
        return;
    }
    
    // Registrar la devolución
    const returnRecord = {
        id: Date.now(),
        bookId: book.id,
        bookTitle: book.title,
        userId: userId,
        userName: db.getUsers().find(u => u.id === userId).name,
        isbn: isbn,
        condition: condition,
        returnDate: returnDate,
        notes: notes,
        processedBy: currentUser.name,
        processedAt: new Date().toLocaleString('es-ES'),
        type: 'normal'
    };
    
    // Guardar el registro de devolución
    db.addReturn(returnRecord);
    
    // Actualizar el estado del libro según su condición física
    updateBookCondition(book.id, condition);
    
    // Actualizar la confiabilidad del usuario
    db.updateUserReliability(userId, condition);
    
    // Finalizar el préstamo más antiguo de este libro
    const oldestLoan = activeLoans.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
    db.updateLoan(oldestLoan.id, { 
        status: 'devuelto',
        returnDate: returnDate,
        returnCondition: condition,
        returnNotes: notes
    });
    
    // Limpiar formulario
    document.getElementById('returnForm').reset();
    
    // Crear notificación de devolución exitosa
    createNotification('rating_update', 'Devolución Exitosa', 
        `Has devuelto "${book.title}" exitosamente. Tu calificación de confiabilidad ha sido actualizada.`, userId);
    
    // Recargar datos
    loadReturns();
    loadBooks();
    loadLoans();
    loadStockStatus();
    
    showAlert('Devolución registrada exitosamente', 'success');
}

function handleNotReturnedSubmit(e) {
    e.preventDefault();
    
    const userId = parseInt(document.getElementById('notReturnedUser').value);
    const isbn = document.getElementById('notReturnedIsbn').value.trim();
    const reason = document.getElementById('notReturnedReason').value;
    const notReturnedDate = document.getElementById('notReturnedDate').value;
    const notes = document.getElementById('notReturnedNotes').value.trim();
    
    // Validar que todos los campos estén completos
    if (!userId || !isbn || !reason || !notReturnedDate || !notes) {
        showAlert('Por favor, completa todos los campos obligatorios', 'warning');
        return;
    }
    
    // Buscar el libro por ISBN
    const book = db.getBooks().find(b => b.isbn === isbn);
    if (!book) {
        showAlert('No se encontró un libro con ese ISBN', 'warning');
        return;
    }
    
    // Registrar el libro no devuelto
    const notReturnedRecord = {
        id: Date.now(),
        bookId: book.id,
        bookTitle: book.title,
        userId: userId,
        userName: db.getUsers().find(u => u.id === userId).name,
        isbn: isbn,
        reason: reason,
        notReturnedDate: notReturnedDate,
        notes: notes,
        processedBy: currentUser.name,
        processedAt: new Date().toLocaleString('es-ES'),
        status: 'no_devuelto'
    };
    
    // Guardar el registro
    db.addNotReturned(notReturnedRecord);
    
    // Actualizar el estado del libro según el motivo
    updateBookNotReturned(book.id, reason);
    
    // Actualizar la confiabilidad del usuario
    db.updateUserReliability(userId, reason);
    
    // Buscar y finalizar préstamos activos de este libro y usuario
    const activeLoans = db.getLoans().filter(loan => 
        loan.bookId === book.id && 
        loan.userId === userId &&
        (loan.status === 'activo' || loan.status === 'aprobado')
    );
    
    activeLoans.forEach(loan => {
        db.updateLoan(loan.id, { 
            status: 'no_devuelto',
            notReturnedDate: notReturnedDate,
            notReturnedReason: reason,
            notReturnedNotes: notes
        });
    });
    
    // Crear notificación de libro no devuelto
    createNotification('system', 'Libro No Devuelto', 
        `Se ha registrado que no devolviste "${book.title}". Esto afectará tu calificación de confiabilidad.`, userId);
    
    // Limpiar formulario
    document.getElementById('notReturnedForm').reset();
    
    // Recargar datos
    loadNotReturnedBooks();
    loadBooks();
    loadLoans();
    loadStockStatus();
    
    showAlert('Libro no devuelto registrado exitosamente', 'warning');
}

function updateBookCondition(bookId, condition) {
    const books = db.getBooks();
    const book = books.find(b => b.id === bookId);
    
    if (book) {
        // Actualizar el estado del libro según su condición física
        switch (condition) {
            case 'buen_estado':
                book.physicalCondition = 'buen_estado';
                book.status = 'disponible';
                break;
            case 'estado_regular':
                book.physicalCondition = 'estado_regular';
                book.status = 'disponible';
                break;
            case 'mal_estado':
                book.physicalCondition = 'mal_estado';
                book.status = 'no_disponible';
                break;
        }
        
        book.lastConditionUpdate = new Date().toLocaleString('es-ES');
        db.saveBooks(books);
    }
}

function updateBookNotReturned(bookId, reason) {
    const books = db.getBooks();
    const book = books.find(b => b.id === bookId);
    
    if (book) {
        switch (reason) {
            case 'no_devuelto':
            case 'devuelto_tarde':
                book.status = 'no_disponible';
                book.notReturnedReason = reason;
                break;
            case 'perdido':
            case 'dañado_irreparable':
                book.status = 'perdido';
                book.notReturnedReason = reason;
                // Reducir stock permanentemente
                book.stock = Math.max(0, book.stock - 1);
                break;
        }
        
        book.lastNotReturnedUpdate = new Date().toLocaleString('es-ES');
        db.saveBooks(books);
    }
}

function loadReturns() {
    const returnsList = document.getElementById('returnsList');
    const returns = db.getReturns();
    
    if (returns.length === 0) {
        returnsList.innerHTML = '<p style="text-align: center; color: #ffffff; opacity: 0.8; padding: 2rem;">No hay devoluciones registradas</p>';
        return;
    }
    
    returnsList.innerHTML = `
        <div class="returns-grid">
            ${returns.map(returnRecord => `
                <div class="return-card">
                    <div class="return-header">
                        <h4>${returnRecord.bookTitle}</h4>
                        <span class="return-date">${returnRecord.returnDate}</span>
                    </div>
                    <div class="return-details">
                        <div class="return-detail">
                            <strong>ISBN:</strong> ${returnRecord.isbn}
                        </div>
                        <div class="return-detail">
                            <strong>Estado:</strong> 
                            <span class="condition-badge condition-${returnRecord.condition}">
                                ${getConditionText(returnRecord.condition)}
                            </span>
                        </div>
                        <div class="return-detail">
                            <strong>Procesado por:</strong> ${returnRecord.processedBy}
                        </div>
                        <div class="return-detail">
                            <strong>Fecha de procesamiento:</strong> ${returnRecord.processedAt}
                        </div>
                        ${returnRecord.notes ? `
                            <div class="return-detail">
                                <strong>Observaciones:</strong> ${returnRecord.notes}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function loadNotReturnedBooks() {
    const notReturnedList = document.getElementById('notReturnedList');
    const notReturned = db.getNotReturned();
    
    if (notReturned.length === 0) {
        notReturnedList.innerHTML = '<p style="text-align: center; color: #ffffff; opacity: 0.8; padding: 2rem;">No hay libros no devueltos registrados</p>';
        return;
    }
    
    notReturnedList.innerHTML = `
        <div class="not-returned-grid">
            ${notReturned.map(record => `
                <div class="not-returned-card">
                    <div class="not-returned-header">
                        <h4>${record.bookTitle}</h4>
                        <span class="not-returned-date">${record.notReturnedDate}</span>
                    </div>
                    <div class="not-returned-details">
                        <div class="not-returned-detail">
                            <strong>ISBN:</strong> ${record.isbn}
                        </div>
                        <div class="not-returned-detail">
                            <strong>Motivo:</strong> 
                            <span class="reason-badge reason-${record.reason}">
                                ${getReasonText(record.reason)}
                            </span>
                        </div>
                        <div class="not-returned-detail">
                            <strong>Procesado por:</strong> ${record.processedBy}
                        </div>
                        <div class="not-returned-detail">
                            <strong>Fecha de procesamiento:</strong> ${record.processedAt}
                        </div>
                        <div class="not-returned-detail">
                            <strong>Observaciones:</strong> ${record.notes}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function loadStockStatus() {
    const stockStatus = document.getElementById('stockStatus');
    const books = db.getBooks();
    
    const statusCounts = {
        disponible: 0,
        no_disponible: 0,
        agotado: 0,
        perdido: 0
    };
    
    const conditionCounts = {
        buen_estado: 0,
        estado_regular: 0,
        mal_estado: 0
    };
    
    books.forEach(book => {
        statusCounts[book.status] = (statusCounts[book.status] || 0) + 1;
        if (book.physicalCondition) {
            conditionCounts[book.physicalCondition] = (conditionCounts[book.physicalCondition] || 0) + 1;
        }
    });
    
    stockStatus.innerHTML = `
        <div class="stock-summary">
            <h4>Resumen de Estado del Stock</h4>
            <div class="stock-cards">
                <div class="stock-card available">
                    <div class="stock-number">${statusCounts.disponible}</div>
                    <div class="stock-label">Disponibles</div>
                </div>
                <div class="stock-card unavailable">
                    <div class="stock-number">${statusCounts.no_disponible}</div>
                    <div class="stock-label">No Disponibles</div>
                </div>
                <div class="stock-card out-of-stock">
                    <div class="stock-number">${statusCounts.agotado}</div>
                    <div class="stock-label">Agotados</div>
                </div>
                <div class="stock-card lost">
                    <div class="stock-number">${statusCounts.perdido}</div>
                    <div class="stock-label">Perdidos</div>
                </div>
            </div>
        </div>
        
        <div class="condition-summary">
            <h4>Estado Físico de los Libros</h4>
            <div class="condition-cards">
                <div class="condition-card good">
                    <div class="condition-number">${conditionCounts.buen_estado}</div>
                    <div class="condition-label">Buen Estado</div>
                </div>
                <div class="condition-card regular">
                    <div class="condition-number">${conditionCounts.estado_regular}</div>
                    <div class="condition-label">Estado Regular</div>
                </div>
                <div class="condition-card bad">
                    <div class="condition-number">${conditionCounts.mal_estado}</div>
                    <div class="condition-label">Mal Estado</div>
                </div>
            </div>
        </div>
    `;
}

function updateBookAvailability() {
    const books = db.getBooks();
    let updated = 0;
    
    books.forEach(book => {
        // Si el libro tiene mal estado físico, marcarlo como no disponible
        if (book.physicalCondition === 'mal_estado' && book.status === 'disponible') {
            book.status = 'no_disponible';
            updated++;
        }
        // Si el libro está en buen estado y no está perdido, marcarlo como disponible
        else if (book.physicalCondition === 'buen_estado' && book.status === 'no_disponible' && book.stock > 0) {
            book.status = 'disponible';
            updated++;
        }
    });
    
    if (updated > 0) {
        db.saveBooks(books);
        loadBooks();
        loadStockStatus();
        showAlert(`Se actualizó la disponibilidad de ${updated} libros`, 'success');
    } else {
        showAlert('No se encontraron libros que necesiten actualización de disponibilidad', 'info');
    }
}

function generateStockReport() {
    const books = db.getBooks();
    const returns = db.getReturns();
    const notReturned = db.getNotReturned();
    
    let report = 'REPORTE DE STOCK DE BIBLIOTECA\n';
    report += '=====================================\n\n';
    
    report += 'RESUMEN GENERAL:\n';
    report += `Total de libros en catálogo: ${books.length}\n`;
    report += `Total de ejemplares: ${books.reduce((sum, book) => sum + book.stock, 0)}\n`;
    report += `Devoluciones registradas: ${returns.length}\n`;
    report += `Libros no devueltos: ${notReturned.length}\n\n`;
    
    report += 'ESTADO POR LIBRO:\n';
    report += '================\n';
    books.forEach(book => {
        report += `${book.title} (${book.isbn}):\n`;
        report += `  - Stock: ${book.stock}\n`;
        report += `  - Estado: ${book.status}\n`;
        report += `  - Condición física: ${book.physicalCondition || 'No evaluada'}\n`;
        if (book.notReturnedReason) {
            report += `  - Motivo no devolución: ${getReasonText(book.notReturnedReason)}\n`;
        }
        report += '\n';
    });
    
    // Crear y descargar el archivo
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_stock_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showAlert('Reporte de stock generado y descargado', 'success');
}

function getConditionText(condition) {
    const conditions = {
        'buen_estado': 'Buen Estado',
        'estado_regular': 'Estado Regular',
        'mal_estado': 'Mal Estado'
    };
    return conditions[condition] || condition;
}

function getReasonText(reason) {
    const reasons = {
        'no_devuelto': 'No Devuelto',
        'devuelto_tarde': 'Devuelto Fuera de Tiempo',
        'perdido': 'Libro Perdido',
        'dañado_irreparable': 'Dañado Irreparable'
    };
    return reasons[reason] || reason;
}

// ==================== FUNCIONES DE GESTIÓN DE PERFILES DE USUARIOS ====================

function setupReturnUserSelectors() {
    const returnUserSelect = document.getElementById('returnUser');
    const notReturnedUserSelect = document.getElementById('notReturnedUser');
    const users = db.getUsers().filter(u => u.status === 'activo' || u.status === 'advertencia');
    
    // Limpiar opciones existentes
    returnUserSelect.innerHTML = '<option value="">SELECCIONAR USUARIO</option>';
    notReturnedUserSelect.innerHTML = '<option value="">SELECCIONAR USUARIO</option>';
    
    users.forEach(user => {
        const option1 = document.createElement('option');
        option1.value = user.id;
        option1.textContent = `${user.name} (${user.dni}) - Score: ${user.reliabilityScore}`;
        returnUserSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = user.id;
        option2.textContent = `${user.name} (${user.dni}) - Score: ${user.reliabilityScore}`;
        notReturnedUserSelect.appendChild(option2);
    });
}

function setupProfileUserSelector() {
    const profileUserSelect = document.getElementById('profileUserSelect');
    const users = db.getUsers();
    
    profileUserSelect.innerHTML = '<option value="">Seleccionar usuario para ver perfil</option>';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.dni}) - ${user.reliabilityLevel || 'N/A'} - Score: ${user.reliabilityScore}`;
        profileUserSelect.appendChild(option);
    });
}

function loadUserProfiles() {
    const usersReliabilityList = document.getElementById('usersReliabilityList');
    const users = db.getUsers();
    
    // Ordenar usuarios por score de confiabilidad (descendente)
    const sortedUsers = users.sort((a, b) => b.reliabilityScore - a.reliabilityScore);
    
    usersReliabilityList.innerHTML = `
        <div class="users-reliability-grid">
            ${sortedUsers.map(user => {
                const reliabilityLevel = db.getReliabilityLevel(user.reliabilityScore);
                const statusClass = getStatusClass(user.status);
                const reliabilityClass = getReliabilityClass(user.reliabilityScore);
                
                return `
                    <div class="user-reliability-card">
                        <div class="user-card-header">
                            <h4>${user.name}</h4>
                            <span class="dni-badge">DNI: ${user.dni}</span>
                        </div>
                        <div class="user-card-info">
                            <div class="info-row">
                                <span class="label">Email:</span>
                                <span class="value">${user.email}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Estado:</span>
                                <span class="status-badge ${statusClass}">${user.status}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Score de Confiabilidad:</span>
                                <span class="reliability-score ${reliabilityClass}">${user.reliabilityScore}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Nivel:</span>
                                <span class="reliability-level ${reliabilityClass}">${reliabilityLevel}</span>
                            </div>
                        </div>
                        <div class="user-card-stats">
                            <div class="stat-item">
                                <span class="stat-number">${user.goodReturns || 0}</span>
                                <span class="stat-label">Buenas</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${user.regularReturns || 0}</span>
                                <span class="stat-label">Regulares</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${user.badReturns || 0}</span>
                                <span class="stat-label">Malas</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${user.notReturned || 0}</span>
                                <span class="stat-label">No Devueltos</span>
                            </div>
                        </div>
                        <div class="user-card-actions">
                            <button class="btn btn-sm" onclick="viewUserProfile(${user.id})">Ver Perfil</button>
                            ${user.status === 'suspendido' ? 
                                `<button class="btn btn-sm btn-secondary" onclick="reactivateUserProfile(${user.id})">Reactivar</button>` :
                                `<button class="btn btn-sm btn-warning" onclick="suspendUserProfile(${user.id})">Suspender</button>`
                            }
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function loadUserProfile() {
    const userId = parseInt(document.getElementById('profileUserSelect').value);
    if (!userId) {
        showAlert('Por favor, selecciona un usuario', 'warning');
        return;
    }
    
    const profile = db.getUserProfile(userId);
    if (!profile) {
        showAlert('No se pudo cargar el perfil del usuario', 'error');
        return;
    }
    
    // Mostrar el contenedor del perfil
    document.getElementById('userProfileContainer').style.display = 'block';
    
    // Llenar información básica
    document.getElementById('profileUserName').textContent = profile.name;
    document.getElementById('profileDni').textContent = profile.dni || '-';
    document.getElementById('profileEmail').textContent = profile.email;
    document.getElementById('profilePhone').textContent = profile.phone || '-';
    document.getElementById('profileAddress').textContent = profile.address || '-';
    document.getElementById('profileCreatedAt').textContent = new Date(profile.createdAt).toLocaleDateString('es-ES');
    
    // Estado del usuario
    const statusElement = document.getElementById('profileStatus');
    statusElement.textContent = profile.status;
    statusElement.className = `status-badge ${getStatusClass(profile.status)}`;
    
    // Confiabilidad
    document.getElementById('reliabilityScore').textContent = profile.reliabilityScore;
    document.getElementById('reliabilityLevel').textContent = profile.reliabilityLevel;
    document.getElementById('goodReturns').textContent = profile.goodReturns || 0;
    document.getElementById('regularReturns').textContent = profile.regularReturns || 0;
    document.getElementById('badReturns').textContent = profile.badReturns || 0;
    document.getElementById('notReturned').textContent = profile.notReturned || 0;
    
    // Estadísticas de préstamos
    document.getElementById('totalLoansCount').textContent = profile.totalLoans || 0;
    document.getElementById('activeLoansCount').textContent = profile.activeLoans || 0;
    document.getElementById('completedLoansCount').textContent = profile.completedLoans || 0;
    
    // Actividad reciente
    loadRecentActivity(profile.recentActivity);
    
    // Mostrar/ocultar botones según el estado
    const suspendBtn = document.getElementById('suspendBtn');
    const reactivateBtn = document.getElementById('reactivateBtn');
    
    if (profile.status === 'suspendido') {
        suspendBtn.style.display = 'none';
        reactivateBtn.style.display = 'inline-block';
    } else {
        suspendBtn.style.display = 'inline-block';
        reactivateBtn.style.display = 'none';
    }
    
    // Guardar el ID del usuario actual para las acciones
    document.getElementById('userProfileContainer').dataset.userId = userId;
}

function loadRecentActivity(activities) {
    const recentActivity = document.getElementById('recentActivity');
    
    if (!activities || activities.length === 0) {
        recentActivity.innerHTML = '<p>No hay actividad reciente</p>';
        return;
    }
    
    recentActivity.innerHTML = activities.map(activity => {
        const date = new Date(activity.date).toLocaleDateString('es-ES');
        const time = new Date(activity.date).toLocaleTimeString('es-ES');
        
        let activityText = '';
        let activityClass = '';
        
        switch (activity.type) {
            case 'loan':
                activityText = `Préstamo: ${activity.bookTitle}`;
                activityClass = 'activity-loan';
                break;
            case 'return':
                activityText = `Devolución: ${activity.bookTitle} (${getConditionText(activity.condition)})`;
                activityClass = 'activity-return';
                break;
            case 'not_returned':
                activityText = `No devuelto: ${activity.bookTitle} (${getReasonText(activity.reason)})`;
                activityClass = 'activity-not-returned';
                break;
        }
        
        return `
            <div class="activity-item ${activityClass}">
                <div class="activity-content">
                    <div class="activity-text">${activityText}</div>
                    <div class="activity-date">${date} ${time}</div>
                </div>
            </div>
        `;
    }).join('');
}

function viewUserProfile(userId) {
    document.getElementById('profileUserSelect').value = userId;
    loadUserProfile();
}

function suspendUserProfile(userId) {
    const reason = prompt('Motivo de suspensión:');
    if (reason) {
        const user = db.suspendUser(userId, reason);
        if (user) {
            showAlert('Usuario suspendido exitosamente', 'warning');
            loadUserProfiles();
            if (document.getElementById('userProfileContainer').dataset.userId == userId) {
                loadUserProfile();
            }
        }
    }
}

function reactivateUserProfile(userId) {
    if (confirm('¿Estás seguro de que quieres reactivar este usuario?')) {
        const user = db.reactivateUser(userId);
        if (user) {
            showAlert('Usuario reactivado exitosamente', 'success');
            loadUserProfiles();
            if (document.getElementById('userProfileContainer').dataset.userId == userId) {
                loadUserProfile();
            }
        }
    }
}

function suspendUser() {
    const userId = parseInt(document.getElementById('userProfileContainer').dataset.userId);
    suspendUserProfile(userId);
}

function reactivateUser() {
    const userId = parseInt(document.getElementById('userProfileContainer').dataset.userId);
    reactivateUserProfile(userId);
}

function getStatusClass(status) {
    const classes = {
        'activo': 'status-active',
        'inactivo': 'status-inactive',
        'suspendido': 'status-suspended',
        'advertencia': 'status-warning'
    };
    return classes[status] || 'status-unknown';
}

function getReliabilityClass(score) {
    if (score >= 80) return 'reliability-excellent';
    if (score >= 50) return 'reliability-intermediate';
    return 'reliability-low';
}

// ===== SISTEMA DE NOTIFICACIONES =====

// Array global para almacenar notificaciones
let notifications = [];

// Inicializar notificaciones al cargar la página
function initializeNotifications() {
    // Cargar notificaciones desde localStorage si existen
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
        notifications = JSON.parse(savedNotifications);
    }
    
    // Cargar notificaciones de ejemplo si no hay ninguna
    if (notifications.length === 0) {
        loadSampleNotifications();
    }
    
    updateNotificationBadge();
}

// Cargar notificaciones de ejemplo
function loadSampleNotifications() {
    const sampleNotifications = [
        {
            id: 1,
            type: 'loan_approved',
            title: 'Préstamo Aprobado',
            content: 'Tu solicitud de préstamo para "El Quijote" ha sido aprobada. Puedes recoger el libro en la biblioteca.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
            read: false,
            userId: 1
        },
        {
            id: 2,
            type: 'return_reminder',
            title: 'Recordatorio de Devolución',
            content: 'Tienes 2 días para devolver "Cien años de soledad". La fecha límite es el 15 de diciembre.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
            read: false,
            userId: 1
        },
        {
            id: 3,
            type: 'rating_update',
            title: 'Actualización de Calificación',
            content: 'Tu calificación de confiabilidad ha mejorado a 95 puntos tras una devolución puntual.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
            read: true,
            userId: 1
        }
    ];
    
    notifications = sampleNotifications;
    saveNotifications();
}

// Guardar notificaciones en localStorage
function saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Crear una nueva notificación
function createNotification(type, title, content, userId = null) {
    const notification = {
        id: Date.now(),
        type: type,
        title: title,
        content: content,
        timestamp: new Date(),
        read: false,
        userId: userId || getCurrentUserId()
    };
    
    notifications.unshift(notification); // Agregar al inicio
    saveNotifications();
    updateNotificationBadge();
    
    // Si estamos en la sección de notificaciones, actualizar la vista
    if (document.getElementById('notificationsSection').classList.contains('active')) {
        loadNotifications();
    }
    
    return notification;
}

// Obtener el ID del usuario actual
function getCurrentUserId() {
    const currentUser = getCurrentUser();
    return currentUser ? currentUser.id : null;
}

// Obtener notificaciones del usuario actual
function getUserNotifications(userId = null) {
    const targetUserId = userId || getCurrentUserId();
    return notifications.filter(notification => notification.userId === targetUserId);
}

// Cargar notificaciones en la interfaz
function loadNotifications(filter = 'all') {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    let userNotifications = getUserNotifications(userId);
    
    // Aplicar filtro
    if (filter !== 'all') {
        if (filter === 'unread') {
            userNotifications = userNotifications.filter(n => !n.read);
        } else {
            userNotifications = userNotifications.filter(n => n.type === filter);
        }
    }
    
    const notificationsList = document.getElementById('notificationsList');
    const noNotificationsMessage = document.getElementById('noNotificationsMessage');
    
    if (userNotifications.length === 0) {
        notificationsList.innerHTML = '';
        noNotificationsMessage.style.display = 'block';
        return;
    }
    
    noNotificationsMessage.style.display = 'none';
    
    notificationsList.innerHTML = userNotifications.map(notification => {
        return createNotificationHTML(notification);
    }).join('');
}

// Crear HTML para una notificación
function createNotificationHTML(notification) {
    const timeAgo = getTimeAgo(notification.timestamp);
    const readClass = notification.read ? 'read' : 'unread';
    const unreadIndicator = notification.read ? '' : '<div class="notification-unread-indicator"></div>';
    
    return `
        <div class="notification-item ${readClass}" onclick="markAsRead(${notification.id})">
            ${unreadIndicator}
            <div class="notification-header">
                <h3 class="notification-title">${notification.title}</h3>
                <span class="notification-time">${timeAgo}</span>
            </div>
            <div class="notification-content">${notification.content}</div>
            <div class="notification-type ${notification.type}">${getNotificationTypeText(notification.type)}</div>
            <div class="notification-actions-item">
                <button class="btn btn-secondary" onclick="event.stopPropagation(); deleteNotification(${notification.id})">Eliminar</button>
            </div>
        </div>
    `;
}

// Obtener texto del tipo de notificación
function getNotificationTypeText(type) {
    const types = {
        'loan_approved': 'Préstamo Aprobado',
        'loan_rejected': 'Préstamo Rechazado',
        'return_reminder': 'Recordatorio',
        'overdue': 'Vencido',
        'rating_update': 'Calificación',
        'system': 'Sistema'
    };
    return types[type] || 'General';
}

// Obtener tiempo transcurrido
function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
        return `hace ${minutes} min`;
    } else if (hours < 24) {
        return `hace ${hours}h`;
    } else {
        return `hace ${days} días`;
    }
}

// Marcar notificación como leída
function markAsRead(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
        notification.read = true;
        saveNotifications();
        updateNotificationBadge();
        loadNotifications(document.getElementById('notificationFilter').value);
    }
}

// Marcar todas las notificaciones como leídas
function markAllAsRead() {
    const userId = getCurrentUserId();
    notifications.forEach(notification => {
        if (notification.userId === userId) {
            notification.read = true;
        }
    });
    saveNotifications();
    updateNotificationBadge();
    loadNotifications(document.getElementById('notificationFilter').value);
    showAlert('Todas las notificaciones han sido marcadas como leídas', 'success');
}

// Eliminar notificación
function deleteNotification(notificationId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
        notifications = notifications.filter(n => n.id !== notificationId);
        saveNotifications();
        updateNotificationBadge();
        loadNotifications(document.getElementById('notificationFilter').value);
    }
}

// Limpiar todas las notificaciones
function clearAllNotifications() {
    if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
        const userId = getCurrentUserId();
        notifications = notifications.filter(n => n.userId !== userId);
        saveNotifications();
        updateNotificationBadge();
        loadNotifications();
        showAlert('Todas las notificaciones han sido eliminadas', 'success');
    }
}

// Filtrar notificaciones
function filterNotifications() {
    const filter = document.getElementById('notificationFilter').value;
    loadNotifications(filter);
}

// Actualizar badge de notificaciones
function updateNotificationBadge() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const unreadCount = getUserNotifications(userId).filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// Mostrar notificaciones en la sección de Mis Préstamos
function loadUserNotifications() {
    const userId = getCurrentUserId();
    if (!userId) return;
    
    const userNotifications = getUserNotifications(userId).slice(0, 3); // Mostrar solo las 3 más recientes
    const container = document.getElementById('userNotifications');
    
    if (!container) return;
    
    if (userNotifications.length === 0) {
        container.innerHTML = `
            <h3>Notificaciones</h3>
            <p>No tienes notificaciones nuevas.</p>
            <p>Aquí recibirás notificaciones sobre el estado de tus préstamos, recordatorios de devolución y actualizaciones importantes.</p>
            <button class="btn btn-secondary" onclick="showSection('notifications')">Ver todas las notificaciones</button>
        `;
        return;
    }
    
    container.innerHTML = `
        <h3>Notificaciones Recientes</h3>
        ${userNotifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" onclick="markAsRead(${notification.id})">
                <div class="notification-header">
                    <h4>${notification.title}</h4>
                    <span>${getTimeAgo(notification.timestamp)}</span>
                </div>
                <p>${notification.content}</p>
            </div>
        `).join('')}
        <button class="btn btn-secondary" onclick="showSection('notifications')">Ver todas las notificaciones</button>
    `;
}

// Integrar notificaciones con el sistema de préstamos
function createLoanNotification(loan, action) {
    const book = db.getBookById(loan.bookId);
    const user = db.getUserById(loan.userId);
    
    if (!book || !user) return;
    
    let title, content, type;
    
    switch (action) {
        case 'approved':
            title = 'Préstamo Aprobado';
            content = `Tu solicitud de préstamo para "${book.title}" ha sido aprobada. Puedes recoger el libro en la biblioteca.`;
            type = 'loan_approved';
            break;
        case 'rejected':
            title = 'Préstamo Rechazado';
            content = `Tu solicitud de préstamo para "${book.title}" ha sido rechazada. Contacta a la biblioteca para más información.`;
            type = 'loan_rejected';
            break;
        case 'return_reminder':
            title = 'Recordatorio de Devolución';
            const daysLeft = Math.ceil((new Date(loan.returnDate) - new Date()) / (1000 * 60 * 60 * 24));
            content = `Tienes ${daysLeft} días para devolver "${book.title}". La fecha límite es el ${new Date(loan.returnDate).toLocaleDateString()}.`;
            type = 'return_reminder';
            break;
        case 'overdue':
            title = 'Libro Vencido';
            content = `El libro "${book.title}" está vencido. Por favor, devuélvelo lo antes posible para evitar sanciones.`;
            type = 'overdue';
            break;
    }
    
    createNotification(type, title, content, loan.userId);
}

// Verificar préstamos vencidos y crear notificaciones
function checkOverdueLoans() {
    const currentDate = new Date();
    const loans = db.getLoans();
    
    loans.forEach(loan => {
        if (loan.status === 'activo' && new Date(loan.returnDate) < currentDate) {
            // Verificar si ya existe una notificación de vencimiento para este préstamo
            const existingNotification = notifications.find(n => 
                n.type === 'overdue' && 
                n.userId === loan.userId && 
                n.content.includes(loan.bookId.toString())
            );
            
            if (!existingNotification) {
                createLoanNotification(loan, 'overdue');
            }
        }
    });
}

// Verificar recordatorios de devolución (3 días antes)
function checkReturnReminders() {
    const currentDate = new Date();
    const reminderDate = new Date(currentDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 días después
    const loans = db.getLoans();
    
    loans.forEach(loan => {
        if (loan.status === 'activo') {
            const returnDate = new Date(loan.returnDate);
            const daysDiff = Math.ceil((returnDate - currentDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 3) {
                // Verificar si ya existe un recordatorio para este préstamo
                const existingNotification = notifications.find(n => 
                    n.type === 'return_reminder' && 
                    n.userId === loan.userId && 
                    n.content.includes(loan.bookId.toString())
                );
                
                if (!existingNotification) {
                    createLoanNotification(loan, 'return_reminder');
                }
            }
        }
    });
}

// Actualizar la función showSection para incluir notificaciones
const originalShowSection = showSection;
showSection = function(sectionName) {
    originalShowSection(sectionName);
    
    // Cargar datos específicos de la sección
    if (sectionName === 'notifications') {
        loadNotifications();
    } else if (sectionName === 'userLoans') {
        loadUserNotifications();
    }
};

// Inicializar notificaciones cuando se carga la página
// Modificar la función original de inicialización
const originalDOMContentLoaded = document.addEventListener;
document.addEventListener = function(event, handler) {
    if (event === 'DOMContentLoaded') {
        originalDOMContentLoaded.call(this, event, function() {
            // Llamar al handler original
            handler();
            
            // Inicializar sistema de notificaciones
            setTimeout(() => {
                initializeNotifications();
                checkOverdueLoans();
                checkReturnReminders();
            }, 1000);
        });
    } else {
        originalDOMContentLoaded.call(this, event, handler);
    }
};

// ===== FUNCIONES DE DIFERENCIACIÓN VISUAL DE ROLES =====

// Actualizar indicadores visuales según el rol del usuario
function updateRoleIndicators(role) {
    const welcomeTitle = document.getElementById('welcomeTitle');
    const welcomeSubtitle = document.getElementById('welcomeSubtitle');
    
    // Actualizar título dinámico según el rol
    switch (role) {
        case 'usuario':
            welcomeTitle.textContent = 'Bienvenido Usuario';
            welcomeTitle.className = 'welcome-title user-welcome';
            welcomeSubtitle.textContent = 'Sistema de Gestión de Biblioteca - Área de Usuario';
            break;
        case 'bibliotecario':
            welcomeTitle.textContent = 'Bienvenido Bibliotecario';
            welcomeTitle.className = 'welcome-title librarian-welcome';
            welcomeSubtitle.textContent = 'Sistema de Gestión de Biblioteca - Área de Bibliotecario';
            break;
        case 'admin':
            welcomeTitle.textContent = 'Bienvenido Administrador';
            welcomeTitle.className = 'welcome-title admin-welcome';
            welcomeSubtitle.textContent = 'Sistema de Gestión de Biblioteca - Área de Administración';
            break;
        default:
            welcomeTitle.textContent = 'Bienvenido Usuario';
            welcomeTitle.className = 'welcome-title user-welcome';
            welcomeSubtitle.textContent = 'Sistema de Gestión de Biblioteca - Área de Usuario';
    }
}