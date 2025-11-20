// Configuración
const CONFIG = {
    STORAGE_KEY: 'navidad-magica-images',
    BACKGROUNDS: [
        { id: 'none', name: 'Sin fondo', color: 'linear-gradient(135deg, #f5f5f5, #e5e5e5)' },
        { id: 'red', name: 'Rojo Navideño', color: 'linear-gradient(135deg, #8B0000, #c41e3a)' },
        { id: 'green', name: 'Verde Pino', color: 'linear-gradient(135deg, #0a5d0a, #064706)' },
        { id: 'gold', name: 'Dorado Festivo', color: 'linear-gradient(135deg, #b8860b, #d4af37)' },
        { id: 'snow', name: 'Nieve', color: 'linear-gradient(135deg, #e0f7ff, #ffffff)' },
        { id: 'night', name: 'Noche Estrellada', color: 'linear-gradient(135deg, #0a1128, #1e3a5f)' },
        { id: 'candy', name: 'Dulces', color: 'linear-gradient(135deg, #ff6b6b, #ffa8a8)' },
        { id: 'blue', name: 'Azul Hielo', color: 'linear-gradient(135deg, #4facfe, #00f2fe)' }
    ],
    FILTERS: [
        { id: 'none', name: 'Normal' },
        { id: 'warm', name: 'Cálido' },
        { id: 'vintage', name: 'Vintage' },
        { id: 'festive', name: 'Festival' },
        { id: 'golden', name: 'Dorado' },
        { id: 'cool', name: 'Frío' },
        { id: 'dramatic', name: 'Dramático' }
    ],
    STICKERS: ['🎄', '🎅', '🦌', '❄️', '⭐', '🎁', '🔔', '🕯️', '🌟', '🤶', '☃️', '🕊️', '✨', '🎀', '🧦', '🍪']
};

// Estado de la aplicación
const AppState = {
    originalImage: null,
    currentImage: null,
    editorState: {
        filter: 'none',
        background: 'none',
        brightness: 100,
        contrast: 100,
        saturation: 100,
        stickers: []
    },
    currentTheme: 'christmas',
    currentTab: 'editor',
    editingImageId: null
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    createSnowEffect();
    initializeEventListeners();
    initializeEditor();
    loadGallery();
}

// Efecto de nieve mejorado
function createSnowEffect() {
    const snowContainer = document.getElementById('snow-container');
    const snowflakesCount = 50;
    
    for (let i = 0; i < snowflakesCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.top = `-${Math.random() * 100}px`;
        snowflake.style.animationDelay = `${Math.random() * 5}s`;
        snowflake.style.animationDuration = `${Math.random() * 3 + 5}s`;
        snowflake.style.fontSize = `${Math.random() * 15 + 10}px`;
        snowflake.style.opacity = `${Math.random() * 0.7 + 0.3}`;
        snowContainer.appendChild(snowflake);
    }
}

// Event listeners
function initializeEventListeners() {
    // Navegación entre pestañas
    document.getElementById('editor-tab').addEventListener('click', () => switchTab('editor'));
    document.getElementById('gallery-tab').addEventListener('click', () => switchTab('gallery'));
    document.getElementById('view-gallery').addEventListener('click', () => switchTab('gallery'));
    
    // Carga de imagen
    document.getElementById('image-input').addEventListener('change', handleImageUpload);
    document.getElementById('upload-area').addEventListener('click', () => {
        document.getElementById('image-input').click();
    });
    document.getElementById('remove-image').addEventListener('click', removeImage);
    
    // Arrastrar y soltar
    const uploadArea = document.getElementById('upload-area');
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Botones de acción
    document.getElementById('save-image').addEventListener('click', saveImageToGallery);
    document.getElementById('reset-editor').addEventListener('click', resetEditor);
    
    // Cambio de tema
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

// Cambiar entre pestañas
function switchTab(tab) {
    AppState.currentTab = tab;
    
    // Actualizar navegación
    document.getElementById('editor-tab').classList.toggle('active', tab === 'editor');
    document.getElementById('gallery-tab').classList.toggle('active', tab === 'gallery');
    
    // Mostrar/ocultar contenido
    document.getElementById('editor-content').style.display = tab === 'editor' ? 'grid' : 'none';
    document.getElementById('gallery-content').style.display = tab === 'gallery' ? 'block' : 'none';
    
    // Recargar galería si es necesario
    if (tab === 'gallery') {
        loadGallery();
    }
}

// Inicializar controles del editor
function initializeEditor() {
    // Fondos
    const backgroundsContainer = document.getElementById('backgrounds-container');
    backgroundsContainer.innerHTML = CONFIG.BACKGROUNDS.map(bg => `
        <button class="background-btn ${bg.id === 'none' ? 'active' : ''}" 
                data-background="${bg.id}" 
                style="background: ${bg.color}"
                title="${bg.name}">
        </button>
    `).join('');
    
    // Filtros
    const filtersContainer = document.getElementById('filters-container');
    filtersContainer.innerHTML = CONFIG.FILTERS.map(filter => `
        <button class="filter-btn ${filter.id === 'none' ? 'active' : ''}" 
                data-filter="${filter.id}">
            ${filter.name}
        </button>
    `).join('');
    
    // Stickers
    const stickersContainer = document.getElementById('stickers-container');
    stickersContainer.innerHTML = CONFIG.STICKERS.map(emoji => `
        <button class="sticker-btn" data-sticker="${emoji}">
            ${emoji}
        </button>
    `).join('');
    
    // Event listeners del editor
    document.querySelectorAll('.background-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.background-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            AppState.editorState.background = this.dataset.background;
            applyEditorEffects();
        });
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            AppState.editorState.filter = this.dataset.filter;
            applyEditorEffects();
        });
    });
    
    document.querySelectorAll('.sticker-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            addSticker(this.dataset.sticker);
        });
    });
    
    // Sliders de ajustes
    ['brightness', 'contrast', 'saturation'].forEach(adj => {
        const slider = document.getElementById(adj);
        const value = document.getElementById(`${adj}-value`);
        
        slider.addEventListener('input', function() {
            value.textContent = `${this.value}%`;
            AppState.editorState[adj] = Number(this.value);
            applyEditorEffects();
        });
    });
}

// Manejo de carga de imágenes
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // Validar tipo de archivo
        if (!file.type.match('image.*')) {
            showSuccessMessage('Por favor, selecciona un archivo de imagen válido');
            return;
        }
        
        // Validar tamaño (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
            showSuccessMessage('La imagen es demasiado grande. Máximo 10MB permitido.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            loadImageToEditor(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    document.getElementById('upload-area').style.borderColor = '#8B0000';
    document.getElementById('upload-area').style.background = '#fff0f0';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('upload-area').style.borderColor = '#fbbf24';
    document.getElementById('upload-area').style.background = '#fff9f9';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                loadImageToEditor(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            showSuccessMessage('Por favor, suelta solo archivos de imagen');
        }
    }
}

function loadImageToEditor(imageData, imageId = null) {
    AppState.originalImage = imageData;
    AppState.currentImage = imageData;
    AppState.editingImageId = imageId;
    
    // Mostrar vista previa
    const preview = document.getElementById('image-preview');
    preview.querySelector('img').src = imageData;
    preview.style.display = 'block';
    
    // Ocultar placeholder del canvas
    document.getElementById('canvas-placeholder').classList.add('hidden');
    document.getElementById('editor-canvas').style.display = 'block';
    
    // Aplicar efectos iniciales
    applyEditorEffects();
    
    showSuccessMessage('¡Imagen cargada exitosamente! 🎄');
}

function removeImage() {
    AppState.originalImage = null;
    AppState.currentImage = null;
    AppState.editingImageId = null;
    
    // Ocultar vista previa
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('image-input').value = '';
    
    // Mostrar placeholder del canvas
    document.getElementById('canvas-placeholder').classList.remove('hidden');
    document.getElementById('editor-canvas').style.display = 'none';
    
    showSuccessMessage('Imagen eliminada');
}

// Aplicar efectos del editor
function applyEditorEffects() {
    if (!AppState.originalImage) return;
    
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Configurar tamaño del canvas manteniendo la proporción
        const maxWidth = 600;
        const maxHeight = 500;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Aplicar fondo
        const background = CONFIG.BACKGROUNDS.find(bg => bg.id === AppState.editorState.background);
        if (background && background.id !== 'none') {
            // Crear un gradiente o color sólido según el fondo
            if (background.color.includes('gradient')) {
                // Para fondos con gradiente, necesitamos crear un patrón
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                if (background.id === 'red') {
                    gradient.addColorStop(0, '#8B0000');
                    gradient.addColorStop(1, '#c41e3a');
                } else if (background.id === 'green') {
                    gradient.addColorStop(0, '#0a5d0a');
                    gradient.addColorStop(1, '#064706');
                } else if (background.id === 'gold') {
                    gradient.addColorStop(0, '#b8860b');
                    gradient.addColorStop(1, '#d4af37');
                } else if (background.id === 'snow') {
                    gradient.addColorStop(0, '#e0f7ff');
                    gradient.addColorStop(1, '#ffffff');
                } else if (background.id === 'night') {
                    gradient.addColorStop(0, '#0a1128');
                    gradient.addColorStop(1, '#1e3a5f');
                } else if (background.id === 'candy') {
                    gradient.addColorStop(0, '#ff6b6b');
                    gradient.addColorStop(1, '#ffa8a8');
                } else if (background.id === 'blue') {
                    gradient.addColorStop(0, '#4facfe');
                    gradient.addColorStop(1, '#00f2fe');
                }
                ctx.fillStyle = gradient;
            } else {
                ctx.fillStyle = background.color;
            }
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Aplicar filtros CSS personalizados
        let filterString = '';
        filterString += `brightness(${AppState.editorState.brightness}%) `;
        filterString += `contrast(${AppState.editorState.contrast}%) `;
        filterString += `saturate(${AppState.editorState.saturation}%)`;
        
        // Aplicar filtros especiales
        if (AppState.editorState.filter === 'warm') {
            filterString += ' sepia(30%) hue-rotate(-10deg)';
        } else if (AppState.editorState.filter === 'vintage') {
            filterString += ' sepia(50%) contrast(1.1) brightness(1.1)';
        } else if (AppState.editorState.filter === 'festive') {
            filterString += ' saturate(1.5) hue-rotate(10deg)';
        } else if (AppState.editorState.filter === 'golden') {
            filterString += ' sepia(20%) saturate(1.3) contrast(1.1)';
        } else if (AppState.editorState.filter === 'cool') {
            filterString += ' hue-rotate(180deg) saturate(1.2)';
        } else if (AppState.editorState.filter === 'dramatic') {
            filterString += ' contrast(1.4) brightness(0.9) saturate(1.3)';
        }
        
        ctx.filter = filterString;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Aplicar stickers
        AppState.editorState.stickers.forEach(sticker => {
            ctx.font = '40px Arial';
            ctx.fillText(sticker.emoji, sticker.x, sticker.y);
        });
    };
    
    img.src = AppState.originalImage;
}

function addSticker(emoji) {
    if (!AppState.originalImage) {
        showSuccessMessage('Primero carga una imagen para agregar stickers');
        return;
    }
    
    const canvas = document.getElementById('editor-canvas');
    AppState.editorState.stickers.push({
        emoji,
        x: Math.random() * (canvas.width - 40),
        y: Math.random() * (canvas.height - 40)
    });
    applyEditorEffects();
    showSuccessMessage(`Sticker ${emoji} agregado!`);
}

// Funciones de utilidad
function showSuccessMessage(msg) {
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    
    successText.textContent = msg;
    successMessage.classList.remove('hidden');
    
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}

// Guardar imagen en localStorage
function saveImageToGallery() {
    if (!AppState.originalImage) {
        showSuccessMessage('Primero carga una imagen para guardar');
        return;
    }
    
    const canvas = document.getElementById('editor-canvas');
    const editedImage = canvas.toDataURL('image/png');
    
    // Obtener imágenes existentes
    const savedImages = getSavedImages();
    
    // Crear objeto de imagen
    const imageData = {
        id: AppState.editingImageId || Date.now().toString(),
        original: AppState.originalImage,
        edited: editedImage,
        name: `Imagen Navideña ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        editorState: {...AppState.editorState}
    };
    
    // Actualizar o agregar imagen
    if (AppState.editingImageId) {
        // Actualizar imagen existente
        const index = savedImages.findIndex(img => img.id === AppState.editingImageId);
        if (index !== -1) {
            savedImages[index] = imageData;
        }
    } else {
        // Agregar nueva imagen
        savedImages.unshift(imageData);
    }
    
    // Guardar en localStorage
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(savedImages));
    
    // Resetear editor
    resetEditor();
    
    // Mostrar mensaje de éxito
    showSuccessMessage('¡Imagen guardada en la galería! 📥');
    
    // Recargar galería si estamos en esa pestaña
    if (AppState.currentTab === 'gallery') {
        loadGallery();
    }
}

// Obtener imágenes guardadas
function getSavedImages() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error al cargar imágenes:', error);
        return [];
    }
}

// Cargar galería
function loadGallery() {
    const galleryContainer = document.getElementById('gallery-container');
    const savedImages = getSavedImages();
    
    if (savedImages.length === 0) {
        galleryContainer.innerHTML = `
            <div class="gallery-empty">
                <div class="gallery-empty-icon">🖼️</div>
                <h3>No hay imágenes guardadas</h3>
                <p>Usa el editor para crear y guardar tus imágenes navideñas</p>
            </div>
        `;
        return;
    }
    
    galleryContainer.innerHTML = `
        <div class="gallery-grid">
            ${savedImages.map(image => `
                <div class="gallery-item">
                    <img src="${image.edited}" alt="${image.name}" class="gallery-image">
                    <div class="gallery-info">
                        <div class="gallery-name">${image.name}</div>
                        <div class="gallery-date">${new Date(image.date).toLocaleDateString()}</div>
                        <div class="gallery-actions">
                            <button class="gallery-action-btn edit-btn" onclick="editImage('${image.id}')">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="gallery-action-btn delete-btn" onclick="deleteImage('${image.id}')">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Editar imagen desde la galería
function editImage(imageId) {
    const savedImages = getSavedImages();
    const image = savedImages.find(img => img.id === imageId);
    
    if (image) {
        // Cargar imagen en el editor
        loadImageToEditor(image.original, image.id);
        
        // Restaurar estado del editor
        AppState.editorState = {...image.editorState};
        
        // Actualizar controles UI
        document.getElementById('brightness').value = AppState.editorState.brightness;
        document.getElementById('contrast').value = AppState.editorState.contrast;
        document.getElementById('saturation').value = AppState.editorState.saturation;
        document.getElementById('brightness-value').textContent = `${AppState.editorState.brightness}%`;
        document.getElementById('contrast-value').textContent = `${AppState.editorState.contrast}%`;
        document.getElementById('saturation-value').textContent = `${AppState.editorState.saturation}%`;
        
        document.querySelectorAll('.background-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.background === AppState.editorState.background);
        });
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === AppState.editorState.filter);
        });
        
        // Cambiar a pestaña de editor
        switchTab('editor');
        
        showSuccessMessage('Imagen cargada para editar ✏️');
    }
}

// Eliminar imagen de la galería
function deleteImage(imageId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
        const savedImages = getSavedImages();
        const filteredImages = savedImages.filter(img => img.id !== imageId);
        
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(filteredImages));
        loadGallery();
        showSuccessMessage('Imagen eliminada 🗑️');
    }
}

function resetEditor() {
    if (!AppState.originalImage) {
        showSuccessMessage('No hay imagen para reiniciar');
        return;
    }
    
    AppState.editorState = {
        filter: 'none',
        background: 'none',
        brightness: 100,
        contrast: 100,
        saturation: 100,
        stickers: []
    };
    
    // Resetear controles UI
    document.getElementById('brightness').value = 100;
    document.getElementById('contrast').value = 100;
    document.getElementById('saturation').value = 100;
    document.getElementById('brightness-value').textContent = '100%';
    document.getElementById('contrast-value').textContent = '100%';
    document.getElementById('saturation-value').textContent = '100%';
    
    document.querySelectorAll('.background-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.background === 'none');
    });
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === 'none');
    });
    
    applyEditorEffects();
    showSuccessMessage('Editor reiniciado ✨');
}

function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (AppState.currentTheme === 'christmas') {
        // Cambiar a tema azul/hielo
        document.body.style.background = 'linear-gradient(135deg, #0a5d6b, #4facfe, #00f2fe)';
        themeToggle.textContent = '❄️';
        AppState.currentTheme = 'winter';
    } else {
        // Cambiar a tema navideño
        document.body.style.background = 'linear-gradient(135deg, var(--primary-red), var(--secondary-red), var(--dark-red))';
        themeToggle.textContent = '🎄';
        AppState.currentTheme = 'christmas';
    }
}

// Hacer funciones disponibles globalmente
window.editImage = editImage;
window.deleteImage = deleteImage;