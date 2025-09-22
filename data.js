// Sistema de Base de Datos usando localStorage
class Database {
    constructor() {
        this.initializeDatabase();
    }

    // Inicializar la base de datos con datos por defecto si está vacía
    initializeDatabase() {
        // Eliminar usuarios con rol "admin" si existen en localStorage
        let existingUsers = JSON.parse(localStorage.getItem('biblioteca_users') || '[]');
        let filteredUsers = existingUsers.filter(u => u.role !== 'admin');
        // Si hay usuarios "admin", o si no hay usuarios válidos, reescribe los usuarios por defecto
        if (filteredUsers.length !== existingUsers.length || filteredUsers.length === 0) {
            const defaultUsers = [
                { 
                    id: 1, 
                    name: "Bibliotecario", 
                    email: "bibliotecario@biblioteca.com", 
                    password: "biblio123", 
                    role: "bibliotecario", 
                    status: "activo",
                    dni: "12345678",
                    phone: "555-0001",
                    address: "Biblioteca Central",
                    reliabilityScore: 100,
                    totalLoans: 0,
                    goodReturns: 0,
                    regularReturns: 0,
                    badReturns: 0,
                    notReturned: 0,
                    createdAt: new Date().toISOString()
                },
                { 
                    id: 2, 
                    name: "Usuario", 
                    email: "user@biblioteca.com", 
                    password: "user123", 
                    role: "usuario", 
                    status: "activo",
                    dni: "87654321",
                    phone: "555-0002",
                    address: "Calle Principal 123",
                    reliabilityScore: 100,
                    totalLoans: 0,
                    goodReturns: 0,
                    regularReturns: 0,
                    badReturns: 0,
                    notReturned: 0,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('biblioteca_users', JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem('biblioteca_books')) {
            const defaultBooks = [
                { 
                    id: 1, 
                    title: "Don Quijote", 
                    author: "Miguel de Cervantes", 
                    genre: "Novela", 
                    editorial: "Editorial Castalia",
                    tutor: "Dr. Francisco Rico",
                    year: 1605,
                    stock: 5, 
                    isbn: "978-84-376-0494-7",
                    description: "Obra maestra de la literatura universal que narra las aventuras de un hidalgo manchego",
                    status: "disponible"
                },
                { 
                    id: 2, 
                    title: "Cien años de soledad", 
                    author: "Gabriel García Márquez", 
                    genre: "Realismo mágico", 
                    editorial: "Editorial Sudamericana",
                    tutor: "Dr. Gerald Martin",
                    year: 1967,
                    stock: 3, 
                    isbn: "978-84-397-2071-7",
                    description: "Crónica de la familia Buendía a lo largo de siete generaciones",
                    status: "disponible"
                },
                { 
                    id: 3, 
                    title: "El señor de los anillos", 
                    author: "J.R.R. Tolkien", 
                    genre: "Fantasía", 
                    editorial: "Minotauro",
                    tutor: "Dr. Tom Shippey",
                    year: 1954,
                    stock: 0, 
                    isbn: "978-84-450-7179-3",
                    description: "Epopeya fantástica sobre la lucha contra el poder del Anillo Único",
                    status: "agotado"
                },
                { 
                    id: 4, 
                    title: "1984", 
                    author: "George Orwell", 
                    genre: "Ciencia ficción", 
                    editorial: "Debolsillo",
                    tutor: "Dr. Bernard Crick",
                    year: 1949,
                    stock: 2, 
                    isbn: "978-84-206-5160-2",
                    description: "Distopía que describe una sociedad totalitaria bajo vigilancia constante",
                    status: "disponible"
                },
                { 
                    id: 5, 
                    title: "Orgullo y prejuicio", 
                    author: "Jane Austen", 
                    genre: "Romance", 
                    editorial: "Alma",
                    tutor: "Dr. Claudia Johnson",
                    year: 1813,
                    stock: 1, 
                    isbn: "978-84-206-5160-3",
                    description: "Historia de amor entre Elizabeth Bennet y Mr. Darcy en la Inglaterra del siglo XIX",
                    status: "disponible"
                }
            ];
            localStorage.setItem('biblioteca_books', JSON.stringify(defaultBooks));
        }

        if (!localStorage.getItem('biblioteca_loans')) {
            localStorage.setItem('biblioteca_loans', JSON.stringify([]));
        }

        if (!localStorage.getItem('biblioteca_returns')) {
            localStorage.setItem('biblioteca_returns', JSON.stringify([]));
        }

        if (!localStorage.getItem('biblioteca_not_returned')) {
            localStorage.setItem('biblioteca_not_returned', JSON.stringify([]));
        }
    }

    // Métodos para usuarios
    getUsers() {
        return JSON.parse(localStorage.getItem('biblioteca_users') || '[]');
    }

    saveUsers(users) {
        localStorage.setItem('biblioteca_users', JSON.stringify(users));
    }

    addUser(user) {
        const users = this.getUsers();
        user.id = this.getNextId(users);
        user.status = user.status || 'activo';
        user.reliabilityScore = user.reliabilityScore || 100;
        user.totalLoans = user.totalLoans || 0;
        user.goodReturns = user.goodReturns || 0;
        user.regularReturns = user.regularReturns || 0;
        user.badReturns = user.badReturns || 0;
        user.notReturned = user.notReturned || 0;
        user.createdAt = user.createdAt || new Date().toISOString();
        users.push(user);
        this.saveUsers(users);
        return user;
    }

    updateUser(userId, updatedUser) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            this.saveUsers(users);
            return users[index];
        }
        return null;
    }

    deleteUser(userId) {
        const users = this.getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);
        this.saveUsers(filteredUsers);
    }

    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email && user.status === 'activo');
    }

    findUserByEmailAndPassword(email, password) {
        const users = this.getUsers();
        return users.find(user => user.email === email && user.password === password && user.status === 'activo');
    }

    // Métodos para libros
    getBooks() {
        return JSON.parse(localStorage.getItem('biblioteca_books') || '[]');
    }

    saveBooks(books) {
        localStorage.setItem('biblioteca_books', JSON.stringify(books));
    }

    addBook(book) {
        const books = this.getBooks();
        book.id = this.getNextId(books);
        book.status = book.status || 'disponible';
        books.push(book);
        this.saveBooks(books);
        return book;
    }

    updateBook(bookId, updatedBook) {
        const books = this.getBooks();
        const index = books.findIndex(book => book.id === bookId);
        if (index !== -1) {
            books[index] = { ...books[index], ...updatedBook };
            this.saveBooks(books);
            return books[index];
        }
        return null;
    }

    deleteBook(bookId) {
        const books = this.getBooks();
        const filteredBooks = books.filter(book => book.id !== bookId);
        this.saveBooks(filteredBooks);
    }

    searchBooks(query, filters = {}) {
        const books = this.getBooks();
        return books.filter(book => {
            const matchesQuery = !query || 
                book.title.toLowerCase().includes(query.toLowerCase()) ||
                book.author.toLowerCase().includes(query.toLowerCase()) ||
                book.genre.toLowerCase().includes(query.toLowerCase()) ||
                book.editorial.toLowerCase().includes(query.toLowerCase()) ||
                book.tutor.toLowerCase().includes(query.toLowerCase());
            
            const matchesGenre = !filters.genre || book.genre === filters.genre;
            const matchesEditorial = !filters.editorial || book.editorial === filters.editorial;
            const matchesTutor = !filters.tutor || book.tutor === filters.tutor;
            const matchesStatus = !filters.status || book.status === filters.status;
            
            return matchesQuery && matchesGenre && matchesEditorial && matchesTutor && matchesStatus;
        });
    }

    // Métodos para préstamos
    getLoans() {
        return JSON.parse(localStorage.getItem('biblioteca_loans') || '[]');
    }

    saveLoans(loans) {
        localStorage.setItem('biblioteca_loans', JSON.stringify(loans));
    }

    addLoan(loan) {
        const loans = this.getLoans();
        loan.id = this.getNextId(loans);
        loan.status = loan.status || 'activo';
        loan.createdAt = new Date().toISOString();
        loans.push(loan);
        this.saveLoans(loans);
        
        // Actualizar stock del libro
        const books = this.getBooks();
        const book = books.find(b => b.id === loan.bookId);
        if (book) {
            const quantity = Math.max(1, parseInt(loan.quantity) || 1);
            if (book.stock < quantity) {
                throw new Error('No hay suficiente stock para realizar el préstamo');
            }
            book.stock -= quantity;
            if (book.stock === 0) {
                book.status = 'agotado';
            }
            this.saveBooks(books);
        }
        
        return loan;
    }

    updateLoan(loanId, updatedLoan) {
        const loans = this.getLoans();
        const index = loans.findIndex(loan => loan.id === loanId);
        if (index !== -1) {
            const oldStatus = loans[index].status;
            loans[index] = { ...loans[index], ...updatedLoan };
            
            // Si el préstamo se marca como devuelto, restaurar stock por cantidad
            if (updatedLoan.status === 'devuelto' && oldStatus !== 'devuelto') {
                const books = this.getBooks();
                const book = books.find(b => b.id === loans[index].bookId);
                if (book) {
                    const quantity = Math.max(1, parseInt(loans[index].quantity) || 1);
                    book.stock += quantity;
                    if (book.stock > 0) {
                        book.status = 'disponible';
                    }
                    this.saveBooks(books);
                }
            }
            
            this.saveLoans(loans);
            return loans[index];
        }
        return null;
    }

    deleteLoan(loanId) {
        const loans = this.getLoans();
        const filteredLoans = loans.filter(loan => loan.id !== loanId);
        this.saveLoans(filteredLoans);
    }

    // Utilidad para generar IDs únicos
    getNextId(array) {
        if (array.length === 0) return 1;
        return Math.max(...array.map(item => item.id)) + 1;
    }

    // Obtener estadísticas
    getStats() {
        const books = this.getBooks();
        const loans = this.getLoans();
        const users = this.getUsers();
        
        // Calcular total de libros disponibles (suma de stock de todos los libros)
        const totalAvailableBooks = books.reduce((sum, book) => sum + book.stock, 0);
        
        return {
            totalBooks: books.length,
            availableBooks: totalAvailableBooks,
            totalLoans: loans.length,
            activeLoans: loans.filter(l => l.status === 'activo' || l.status === 'aprobado').length,
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'activo').length
        };
    }

    // Métodos para devoluciones
    getReturns() {
        return JSON.parse(localStorage.getItem('biblioteca_returns') || '[]');
    }

    saveReturns(returns) {
        localStorage.setItem('biblioteca_returns', JSON.stringify(returns));
    }

    addReturn(returnRecord) {
        const returns = this.getReturns();
        returnRecord.id = this.getNextId(returns);
        returns.push(returnRecord);
        this.saveReturns(returns);
        return returnRecord;
    }

    updateReturn(returnId, updatedReturn) {
        const returns = this.getReturns();
        const index = returns.findIndex(returnRecord => returnRecord.id === returnId);
        if (index !== -1) {
            returns[index] = { ...returns[index], ...updatedReturn };
            this.saveReturns(returns);
            return returns[index];
        }
        return null;
    }

    deleteReturn(returnId) {
        const returns = this.getReturns();
        const filteredReturns = returns.filter(returnRecord => returnRecord.id !== returnId);
        this.saveReturns(filteredReturns);
    }

    // Métodos para libros no devueltos
    getNotReturned() {
        return JSON.parse(localStorage.getItem('biblioteca_not_returned') || '[]');
    }

    saveNotReturned(notReturned) {
        localStorage.setItem('biblioteca_not_returned', JSON.stringify(notReturned));
    }

    addNotReturned(notReturnedRecord) {
        const notReturned = this.getNotReturned();
        notReturnedRecord.id = this.getNextId(notReturned);
        notReturned.push(notReturnedRecord);
        this.saveNotReturned(notReturned);
        return notReturnedRecord;
    }

    updateNotReturned(notReturnedId, updatedNotReturned) {
        const notReturned = this.getNotReturned();
        const index = notReturned.findIndex(record => record.id === notReturnedId);
        if (index !== -1) {
            notReturned[index] = { ...notReturned[index], ...updatedNotReturned };
            this.saveNotReturned(notReturned);
            return notReturned[index];
        }
        return null;
    }

    deleteNotReturned(notReturnedId) {
        const notReturned = this.getNotReturned();
        const filteredNotReturned = notReturned.filter(record => record.id !== notReturnedId);
        this.saveNotReturned(filteredNotReturned);
    }

    // Métodos para gestión de confiabilidad de usuarios
    calculateReliabilityScore(userId) {
        const user = this.getUsers().find(u => u.id === userId);
        if (!user) return 100;

        const totalReturns = user.goodReturns + user.regularReturns + user.badReturns + user.notReturned;
        if (totalReturns === 0) return 100;

        // Sistema de puntuación mejorado:
        // Buen estado: +5 puntos (recompensa por buen cuidado)
        // Estado regular: -10 puntos (penalización por descuido)
        // Mal estado: -25 puntos (penalización severa por mal cuidado)
        // No devuelto: -50 puntos (penalización máxima)
        let score = 100;
        score += (user.goodReturns * 5);
        score += (user.regularReturns * -10);
        score += (user.badReturns * -25);
        score += (user.notReturned * -50);

        // Asegurar que el score esté entre 0 y 100
        return Math.max(0, Math.min(100, score));
    }

    updateUserReliability(userId, returnType) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;

        // Actualizar contadores según el tipo de devolución
        switch (returnType) {
            case 'buen_estado':
                user.goodReturns++;
                break;
            case 'estado_regular':
                user.regularReturns++;
                break;
            case 'mal_estado':
                user.badReturns++;
                break;
            case 'no_devuelto':
            case 'devuelto_tarde':
            case 'perdido':
            case 'dañado_irreparable':
                user.notReturned++;
                break;
        }

        // Recalcular score de confiabilidad
        user.reliabilityScore = this.calculateReliabilityScore(userId);
        
        // Actualizar estado del usuario basado en confiabilidad
        if (user.reliabilityScore < 30) {
            user.status = 'suspendido';
            user.suspensionReason = 'Baja confiabilidad - Score: ' + user.reliabilityScore;
            user.suspendedAt = new Date().toISOString();
        } else if (user.reliabilityScore < 50) {
            user.status = 'advertencia';
            user.warningReason = 'Confiabilidad baja - Score: ' + user.reliabilityScore;
            user.warnedAt = new Date().toISOString();
        }

        this.saveUsers(users);
        return user;
    }

    getUserProfile(userId) {
        const user = this.getUsers().find(u => u.id === userId);
        if (!user) return null;

        const loans = this.getLoans().filter(loan => loan.userId === userId);

        return {
            ...user,
            totalLoans: loans.length,
            activeLoans: loans.filter(l => l.status === 'activo' || l.status === 'aprobado').length,
            completedLoans: loans.filter(l => l.status === 'devuelto').length,
            reliabilityLevel: this.getReliabilityLevel(user.reliabilityScore),
            recentActivity: this.getUserRecentActivity(userId)
        };
    }

    getReliabilityLevel(score) {
        if (score >= 80) return 'Excelente';
        if (score >= 50) return 'Intermedio';
        return 'Bajo';
    }

    getUserRecentActivity(userId) {
        const loans = this.getLoans().filter(loan => loan.userId === userId);
        const returns = this.getReturns().filter(ret => {
            const loan = loans.find(l => l.id === ret.loanId);
            return loan;
        });
        const notReturned = this.getNotReturned().filter(nr => {
            const loan = loans.find(l => l.id === nr.loanId);
            return loan;
        });

        // Combinar y ordenar por fecha
        const activities = [
            ...loans.map(loan => ({ ...loan, type: 'loan', date: loan.createdAt })),
            ...returns.map(ret => ({ ...ret, type: 'return', date: ret.processedAt })),
            ...notReturned.map(nr => ({ ...nr, type: 'not_returned', date: nr.processedAt }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        return activities.slice(0, 10); // Últimas 10 actividades
    }

    suspendUser(userId, reason) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.status = 'suspendido';
            user.suspensionReason = reason;
            user.suspendedAt = new Date().toISOString();
            this.saveUsers(users);
            return user;
        }
        return null;
    }

    reactivateUser(userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            user.status = 'activo';
            user.suspensionReason = null;
            user.suspendedAt = null;
            this.saveUsers(users);
            return user;
        }
        return null;
    }

    // Limpiar toda la base de datos (útil para testing)
    clearDatabase() {
        localStorage.removeItem('biblioteca_users');
        localStorage.removeItem('biblioteca_books');
        localStorage.removeItem('biblioteca_loans');
        localStorage.removeItem('biblioteca_returns');
        localStorage.removeItem('biblioteca_not_returned');
        this.initializeDatabase();
    }
}

// Instancia global de la base de datos
const db = new Database();

// Variables globales para compatibilidad con el código existente
let users = [];
let books = [];
let loans = [];
let currentUser = null;

// Función para verificar si el usuario está autenticado
function isAuthenticated() {
    return currentUser !== null;
}

// Función para obtener el usuario current
function getCurrentUser() {
    return currentUser;
}

// Función para establecer el usuario current
function setCurrentUser(user) {
    currentUser = user;
}

// Función para limpiar el usuario current (logout)
function clearCurrentUser() {
    currentUser = null;
}