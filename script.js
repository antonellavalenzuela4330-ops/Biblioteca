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
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    // Validar que todos los campos estén completos
    if (!name || !email || !password || !role) {
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

    // Actualizar información del usuario
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role;

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
    } else if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'stats') {
        loadStats();
    } else if (sectionName === 'userLoans') {
        setupUserLoanForm();
        loadUserLoans();
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

    if (book.stock <= 0) {
        showAlert('No hay stock disponible para este libro', 'warning');
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
        loanDate: currentDateTime,
        returnDate: returnDate,
        status: 'pendiente'
    };

    db.addLoan(newLoan);
    loadBooks();
    loadLoans();
    document.getElementById('loanForm').reset();
    
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

    // Cargar opciones de libros
    loanBookSelect.innerHTML = '<option value="">Seleccionar libro</option>';
    books.forEach(book => {
        if (book.stock > 0) {
            loanBookSelect.innerHTML += `<option value="${book.id}">${book.title} (${book.stock} disponibles)</option>`;
        }
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
                <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                    ${userLoans.map(loan => `
                        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.35); font-family: 'Times New Roman', Times, serif; color: #ffffff; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.1); position: relative; overflow: hidden;">
                            <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #d4af37 0%, #ffe082 50%, #d4af37 100%);"></div>
                            <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Libro:</strong> ${loan.bookTitle}</div>
                            <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Usuario:</strong> ${loan.userName}</div>
                            <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Fecha de préstamo:</strong> ${loan.loanDate || loan.startDate || 'No especificada'}</div>
                            <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Fecha de devolución:</strong> ${loan.returnDate || loan.endDate || 'No especificada'}</div>
                            <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Estado:</strong> ${loan.status}</div>
                            ${loan.status === 'pendiente' ? 
                                '<span style="color: #d4af37; font-style: italic;">Préstamo pendiente de aprobación</span>' :
                            loan.status === 'activo' ? 
                                `<button class="btn" onclick="returnBook(${loan.id})" style="margin-top: 0.5rem;">Marcar como devuelto</button>` : 
                                '<span style="color: #ffffff; opacity: 0.8; font-style: italic;">Préstamo finalizado</span>'
                            }
                        </div>
                    `).join('')}
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

        // Mostrar todos los préstamos
        loansList.innerHTML = `
            <h3>Préstamos Activos</h3>
            <div style="display: grid; gap: 1rem; margin-top: 1rem;">
                ${loans.map(loan => `
                    <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.35); font-family: 'Times New Roman', Times, serif; color: #ffffff; box-shadow: 0 4px 16px rgba(212, 175, 55, 0.1); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #d4af37 0%, #ffe082 50%, #d4af37 100%);"></div>
                        <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Libro:</strong> ${loan.bookTitle}</div>
                        <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Usuario:</strong> ${loan.userName}</div>
                        <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Fecha de préstamo:</strong> ${loan.loanDate || loan.startDate || 'No especificada'}</div>
                        <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Fecha de devolución:</strong> ${loan.returnDate || loan.endDate || 'No especificada'}</div>
                        <div style="color: #ffffff; margin-bottom: 0.75rem;"><strong style="color: #d4af37;">Estado:</strong> ${loan.status}</div>
                        ${loan.status === 'pendiente' && currentUser.role === 'bibliotecario' ? 
                            `<div class="loan-actions">
                                <button class="btn" onclick="acceptLoan(${loan.id})" style="margin-right: 0.5rem;">Aprobar Préstamo</button>
                                <button class="btn btn-secondary" onclick="rejectLoan(${loan.id})">Rechazar</button>
                            </div>` :
                        loan.status === 'aprobado' && currentUser.role === 'bibliotecario' ? 
                            `<button class="btn" onclick="returnBook(${loan.id})" style="margin-top: 0.5rem;">Finalizar préstamo</button>` : 
                            loan.status === 'devuelto' ? 
                                '<span style="color: #ffffff; opacity: 0.8; font-style: italic;">Préstamo finalizado</span>' :
                                loan.status === 'rechazado' ?
                                    '<span style="color: #dc3545; font-style: italic;">Préstamo rechazado</span>' :
                                    '<span style="color: #d4af37; font-style: italic;">Préstamo pendiente de aprobación</span>'
                        }
                    </div>
                `).join('')}

                <div style="grid-column: span 2; text-align: center; margin-top: 1rem;">
                    <button class="btn" onclick="exportLoansToCSV()" style="padding: 0.75rem 1.5rem; font-size: 1rem;">Exportar Préstamos a CSV</button>
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
    // Crear fecha y hora actual para la devolución
    const now = new Date();
    const currentDateTime = now.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    db.updateLoan(loanId, { 
        status: 'devuelto',
        returnDate: currentDateTime
    });
    loadBooks();
    loadLoans();
    showAlert('Préstamo finalizado exitosamente', 'success');
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
        loadUsers();
        showAlert('Usuario eliminado exitosamente', 'success');
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

            <div style="grid-column: span 2; text-align: center; margin-top: 1rem;">
                <button class="btn" onclick="exportLoansToCSV()" style="padding: 0.75rem 1.5rem; font-size: 1rem;">Exportar Préstamos a CSV</button>
            </div>
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
    const userLoansList = document.getElementById('userLoansList');
    const loans = db.getLoans();
    const userLoans = loans.filter(loan => loan.userId === currentUser.id);
    
    if (userLoans.length === 0) {
        userLoansList.innerHTML = '<p style="text-align: center; color: #ffffff; opacity: 0.8; padding: 2rem; font-size: 1.1rem;">No tienes préstamos registrados</p>';
        return;
    }
    
    userLoansList.innerHTML = userLoans.map(loan => {
        const statusClass = `status-${loan.status}`;
        const statusText = getStatusText(loan.status);
        const daysRemaining = calculateDaysRemaining(loan.endDate, loan.status);
        
        return `
            <div class="user-loan-card">
                <div class="loan-status ${statusClass}">${statusText}</div>
                <div class="loan-info">
                    <div class="loan-info-item"><strong>Libro:</strong> ${loan.bookTitle}</div>
                    <div class="loan-info-item"><strong>Cantidad:</strong> ${loan.quantity}</div>
                    <div class="loan-info-item"><strong>Fecha de inicio:</strong> ${formatDate(loan.startDate)}</div>
                    <div class="loan-info-item"><strong>Fecha de devolución:</strong> ${formatDate(loan.endDate)}</div>
                    <div class="loan-info-item"><strong>Solicitado:</strong> ${loan.requestedAt || 'N/A'}</div>
                    ${loan.approvedAt ? `<div class="loan-info-item"><strong>Aprobado:</strong> ${loan.approvedAt}</div>` : ''}
                </div>
                ${daysRemaining ? `<div class="loan-info-item"><strong>Recordatorio:</strong> ${daysRemaining}</div>` : ''}
                <div class="loan-actions">
                    ${loan.status === 'pendiente' ? 
                        '<span style="color: #d4af37; font-style: italic;">Esperando aprobación del bibliotecario</span>' : 
                        loan.status === 'aprobado' ?
                            '<span style="color: #28a745; font-style: italic;">Préstamo activo - Contacta al bibliotecario para devolución</span>' :
                            ''
                    }
                </div>
            </div>
        `;
    }).join('');
    
    // Mostrar notificaciones
    showUserNotifications(userLoans);
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

function showUserNotifications(loans) {
    const notificationsContainer = document.getElementById('userNotifications');
    notificationsContainer.innerHTML = '';
    
    loans.forEach(loan => {
        if (loan.status === 'aprobado') {
            const daysRemaining = calculateDaysRemaining(loan.endDate, loan.status);
            if (daysRemaining) {
                const notificationClass = daysRemaining.includes('¡Ya se pasó') ? 'notification-danger' : 
                                        daysRemaining.includes('último día') ? 'notification-warning' : 
                                        'notification-info';
                
                const notification = document.createElement('div');
                notification.className = `notification ${notificationClass}`;
                notification.innerHTML = `
                    <div class="notification-title">Recordatorio de Préstamo</div>
                    <div class="notification-message">
                        <strong>${loan.bookTitle}</strong><br>
                        ${daysRemaining}
                    </div>
                `;
                notificationsContainer.appendChild(notification);
            }
        }
    });
}

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

function exportLoansToCSV() {
    const loans = db.getLoans();
    const csvContent = [
        ['ID', 'Libro', 'Usuario', 'Fecha de Préstamo', 'Fecha de Devolución', 'Estado'],
        ...loans.map(loan => [
            loan.id,
            loan.bookTitle,
            loan.userName,
            loan.loanDate || loan.startDate || 'N/A',
            loan.returnDate || loan.endDate || 'N/A',
            loan.status
        ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'prestamos_biblioteca.csv';
    link.click();
}