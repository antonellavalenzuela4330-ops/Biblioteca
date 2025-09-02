# 📚 Sistema de Gestión de Biblioteca Digital

Un sistema completo de gestión de biblioteca desarrollado en HTML, CSS y JavaScript con almacenamiento local.

## 🚀 Características Principales

### 👥 Gestión de Usuarios
- **Sistema de Roles**: Administrador, Bibliotecario y Usuario
- **Registro e Inicio de Sesión**: Sistema de autenticación completo
- **Gestión de Cuentas**: Los administradores pueden crear, editar y eliminar usuarios
- **Estados de Usuario**: Activo, Inactivo y Suspendido

### 📖 Gestión de Libros
- **Catálogo Completo**: Información detallada de cada libro
- **Campos Extendidos**: Título, Autor, Género, Editorial, Tutor/Académico, Año, Stock, ISBN y Descripción
- **Estado de Stock**: Disponible, Stock bajo, Agotado
- **CRUD Completo**: Crear, Leer, Actualizar y Eliminar libros

### 🔍 Búsqueda Avanzada
- **Búsqueda por Texto**: Título, autor, género, editorial o tutor
- **Filtros Múltiples**: Género, Editorial, Tutor y Estado
- **Búsqueda en Tiempo Real**: Resultados instantáneos mientras escribes
- **Resultados Filtrados**: Combinación de búsqueda y filtros

### 📋 Sistema de Préstamos
- **Creación de Préstamos**: Solo bibliotecarios pueden crear préstamos
- **Control de Stock**: El stock se actualiza automáticamente
- **Estado de Préstamos**: Activo y Devuelto
- **Historial Completo**: Seguimiento de todos los préstamos

### 📊 Estadísticas y Reportes
- **Dashboard Estadístico**: Resumen completo de la biblioteca
- **Métricas Clave**: Total de libros, disponibles, préstamos, usuarios
- **Gráficos Visuales**: Libros por género y préstamos por mes
- **Exportación**: Catálogo exportable en formato CSV

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: localStorage (Base de datos local del navegador)
- **Diseño**: CSS Grid, Flexbox, Diseño Responsivo
- **Interfaz**: Material Design, Gradientes, Sombras y Efectos

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere servidor web ni base de datos externa

### Instalación
1. Descarga todos los archivos del proyecto
2. Abre `index.html` en tu navegador
3. ¡Listo! El sistema está funcionando

### Usuarios por Defecto
- **Administrador**: admin@biblioteca.com / admin123
- **Bibliotecario**: biblio@biblioteca.com / biblio123
- **Usuario**: user@biblioteca.com / user123

## 📱 Funcionalidades por Rol

### 👑 Administrador
- Acceso completo a todas las funcionalidades
- Gestión de usuarios (crear, editar, eliminar)
- Gestión completa de libros
- Control total de préstamos
- Acceso a estadísticas y reportes

### 📚 Bibliotecario
- Gestión de libros (agregar, editar, eliminar)
- Control de préstamos (crear, marcar como devuelto)
- Búsqueda y consulta de libros
- Acceso a estadísticas básicas

### 👤 Usuario
- Consulta del catálogo de libros
- Búsqueda avanzada de libros
- Visualización de disponibilidad
- Consulta de estadísticas públicas

## 🔍 Funcionalidades de Búsqueda

### Búsqueda por Texto
- Busca en título, autor, género, editorial y tutor
- Búsqueda en tiempo real (300ms de delay)
- Resultados instantáneos

### Filtros Disponibles
- **Género**: Filtra por tipo de literatura
- **Editorial**: Filtra por casa editorial
- **Tutor**: Filtra por académico responsable
- **Estado**: Disponible o Agotado

### Combinación de Filtros
- Los filtros se pueden combinar entre sí
- Búsqueda de texto + filtros simultáneos
- Botón para limpiar todos los filtros

## 📊 Sistema de Estadísticas

### Métricas Principales
- **Libros**: Total en catálogo y disponibles
- **Préstamos**: Total realizados y activos
- **Usuarios**: Total registrados y activos

### Visualizaciones
- **Gráfico de Géneros**: Distribución de libros por género
- **Gráfico de Préstamos**: Préstamos por mes
- **Barras de Progreso**: Visualización intuitiva de datos

## 💾 Almacenamiento de Datos

### Base de Datos Local
- Utiliza localStorage del navegador
- Datos persistentes entre sesiones
- No requiere conexión a internet
- Datos de ejemplo incluidos

### Estructura de Datos
- **Usuarios**: Información personal y credenciales
- **Libros**: Catálogo completo con metadatos
- **Préstamos**: Historial de préstamos y devoluciones

## 🎨 Características de Diseño

### Interfaz Moderna
- Diseño limpio y profesional
- Gradientes y sombras elegantes
- Iconos emoji para mejor UX
- Colores consistentes y accesibles

### Responsividad
- Adaptable a todos los dispositivos
- Grid y Flexbox para layouts flexibles
- Breakpoints para móviles y tablets
- Navegación optimizada para touch

### Componentes Reutilizables
- Tarjetas de libros consistentes
- Formularios estandarizados
- Tablas responsivas
- Modales elegantes

## 🔧 Funcionalidades Técnicas

### Validación de Formularios
- Validación HTML5 nativa
- Validación JavaScript personalizada
- Mensajes de error claros
- Prevención de envíos inválidos

### Gestión de Estado
- Estado global de la aplicación
- Sincronización de datos en tiempo real
- Actualización automática de vistas
- Persistencia de sesión

### Optimización de Rendimiento
- Debounce en búsquedas
- Lazy loading de datos
- Actualizaciones incrementales
- Caché local eficiente

## 📁 Estructura del Proyecto

```
biblioteca/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── data.js             # Base de datos y utilidades
└── README.md           # Documentación
```

## 🚀 Funcionalidades Futuras

### Próximas Mejoras
- [ ] Sistema de notificaciones por email
- [ ] Backup y sincronización en la nube
- [ ] API REST para integración externa
- [ ] Sistema de multas por retrasos
- [ ] Reportes avanzados en PDF
- [ ] Dashboard en tiempo real
- [ ] Sistema de reservas
- [ ] Integración con códigos QR

### Mejoras Técnicas
- [ ] PWA (Progressive Web App)
- [ ] Service Workers para offline
- [ ] IndexedDB para mayor capacidad
- [ ] WebSockets para tiempo real
- [ ] Tests automatizados
- [ ] CI/CD pipeline

## 🤝 Contribución

### Cómo Contribuir
1. Fork del proyecto
2. Crea una rama para tu feature
3. Commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

### Estándares de Código
- Código limpio y documentado
- Nombres descriptivos para variables
- Comentarios en español
- Indentación consistente

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado como proyecto educativo para el análisis de requerimientos de sistemas.

## 📞 Soporte

Para soporte técnico o preguntas:
- Abre un issue en el repositorio
- Revisa la documentación
- Consulta los ejemplos incluidos

---

**¡Disfruta usando tu Sistema de Biblioteca Digital! 📚✨**
