// Datos y estado de la aplicación
const AppState = {
    pets: [],
    searchTerm: '',
    filterType: 'all',
    sortBy: 'recent',
    showEditor: false,
    editingPet: null,
    showSuccess: false,
    successMessage: '',
    editorState: {
        filter: 'none',
        background: 'none',
        brightness: 100,
        contrast: 100,
        saturation: 100,
        stickers: []
    },
    currentTheme: 'christmas'
};

// Configuración
const CONFIG = {
    STORAGE_KEY: 'navidad-jurasica-pets',
    BACKGROUNDS: [
        { id: 'none', name: 'Sin fondo', color: 'linear-gradient(135deg, #f5f5f5, #e5e5e5)' },
        { id: 'red', name: 'Rojo Navideño', color: 'linear-gradient(135deg, #8B0000, #c41e3a)' },
        { id: 'green', name: 'Verde Pino', color: 'linear-gradient(135deg, #0a5d0a, #064706)' },
        { id: 'gold', name: 'Dorado Festivo', color: 'linear-gradient(135deg, #b8860b, #d4af37)' },
        { id: 'snow', name: 'Nieve', color: 'linear-gradient(135deg, #e0f7ff, #ffffff)' },
        { id: 'night', name: 'Noche Estrellada', color: 'linear-gradient(135deg, #0a1128, #1e3a5f)' }
    ],
    FILTERS: [
        { id: 'none', name: 'Normal' },
        { id: 'warm', name: 'Cálido' },
        { id: 'vintage', name: 'Vintage' },
        { id: 'festive', name: 'Festivo' },
        { id: 'golden', name: 'Dorado' }
    ],
    STICKERS: ['🎄', '🎅', '🦌', '❄️', '⭐', '🎁', '🔔', '🕯️', '🌟', '🦕', '🦖', '☃️']
};

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    createSnowEffect();
    initializeCountdown();
    initializeEventListeners();
    loadPets();
    initializeEditor();
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

// Contador de Navidad
function initializeCountdown() {
    function updateCountdown() {
        const now = new Date();
        const currentYear = now.getFullYear();
        let christmas = new Date(currentYear, 11, 25);
        if (now > christmas) christmas = new Date(currentYear + 1, 11, 25);
        
        const diff = christmas - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('countdown').textContent = 
            `🎅 ${days} días ${hours}h ${minutes}m para Navidad 🎄`;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// Event listeners mejorados
function initializeEventListeners() {
    // Formulario de mascota
    document.getElementById('pet-form').addEventListener('submit', handleAddPet);
    
    // Vista previa de imagen
    document.getElementById('image-input').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('image-preview');
                preview.querySelector('img').src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Filtros y búsqueda
    document.getElementById('search-input').addEventListener('input', function(e) {
        AppState.searchTerm = e.target.value;
        renderPets();
    });
    
    document.getElementById('type-filter').addEventListener('change', function(e) {
        AppState.filterType = e.target.value;
        renderPets();
    });
    
    document.getElementById('sort-by').addEventListener('change', function(e) {
        AppState.sortBy = e.target.value;
        renderPets();
    });
    
    // Editor
    document.getElementById('save-edits').addEventListener('click', applyEdits);
    document.getElementById('cancel-edits').addEventListener('click', closeEditor);
    
    // Sliders del editor
    ['brightness', 'contrast', 'saturation'].forEach(adj => {
        const slider = document.getElementById(adj);
        const value = document.getElementById(`${adj}-value`);
        
        slider.addEventListener('input', function() {
            value.textContent = `${this.value}%`;
            AppState.editorState[adj] = Number(this.value);
            applyEditorEffects();
        });
    });
    
    // Cambio de tema
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

// Gestión de mascotas
function loadPets() {
    try {
        const storedPets = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (storedPets) {
            AppState.pets = JSON.parse(storedPets);
        }
        renderPets();
        updateTypeFilter();
    } catch (error) {
        console.log('No hay mascotas guardadas aún');
    } finally {
        document.getElementById('loading-message').classList.add('hidden');
    }
}

function savePets() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(AppState.pets));
}

function handleAddPet(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = formData.get('image');
    
    // Validación básica
    if (!formData.get('name') || !formData.get('type') || !formData.get('age') || !formData.get('description')) {
        showSuccessMessage('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    const newPet = {
        id: Date.now().toString(),
        name: formData.get('name'),
        type: formData.get('type'),
        age: formData.get('age'),
        description: formData.get('description'),
        image: null,
        editedImage: null,
        votes: 0,
        timestamp: Date.now(),
        dateAdded: new Date().toLocaleDateString('es-ES')
    };
    
    if (file && file.size > 0) {
        // Validar tamaño de archivo (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            showSuccessMessage('La imagen es demasiado grande. Máximo 5MB permitido.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            newPet.image = e.target.result;
            addPetToApp(newPet);
        };
        reader.readAsDataURL(file);
    } else {
        addPetToApp(newPet);
    }
    
    e.target.reset();
    document.getElementById('image-preview').style.display = 'none';
}

function addPetToApp(pet) {
    AppState.pets.unshift(pet);
    savePets();
    renderPets();
    updateTypeFilter();
    showSuccessMessage('¡Mascota agregada con éxito! 🦕🎄');
}

function deletePet(petId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta mascota?')) {
        AppState.pets = AppState.pets.filter(pet => pet.id !== petId);
        savePets();
        renderPets();
        updateTypeFilter();
        showSuccessMessage('Mascota eliminada exitosamente 🗑️');
    }
}

function handleVote(petId) {
    const pet = AppState.pets.find(p => p.id === petId);
    if (pet) {
        pet.votes += 1;
        savePets();
        renderPets();
        showSuccessMessage('¡Voto registrado! ❤️');
    }
}

function handleSelect(petName) {
    showSuccessMessage(`¡${petName} es tu compañero navideño! 🎉🦕`);
}

// Renderizado de mascotas mejorado
function renderPets() {
    const container = document.getElementById('pets-container');
    const emptyMessage = document.getElementById('empty-message');
    
    const filteredPets = getFilteredPets();
    
    if (filteredPets.length === 0) {
        container.innerHTML = '';
        emptyMessage.classList.remove('hidden');
        return;
    }
    
    emptyMessage.classList.add('hidden');
    
    const maxVotes = Math.max(0, ...AppState.pets.map(p => p.votes));
    
    container.innerHTML = filteredPets.map(pet => {
        const isMostVoted = pet.votes > 0 && pet.votes === maxVotes;
        const displayImage = pet.editedImage || pet.image;
        
        return `
            <div class="pet-card ${isMostVoted ? 'most-voted' : ''}">
                ${isMostVoted ? '<div class="most-voted-badge"><i class="fas fa-crown"></i> Más Votada</div>' : ''}
                
                <button class="delete-btn" onclick="deletePet('${pet.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                
                <div class="pet-image">
                    ${displayImage ? 
                        `<img src="${displayImage}" alt="${pet.name}">` : 
                        '<div class="pet-image-placeholder">🦕</div>'
                    }
                </div>
                
                <div class="pet-info">
                    <div class="pet-header">
                        <h3 class="pet-name">${pet.name}</h3>
                        <span class="pet-type">${pet.type}</span>
                    </div>
                    
                    <div class="pet-details">
                        <p class="pet-age"><i class="fas fa-birthday-cake"></i> Edad: ${pet.age} años</p>
                        <p class="pet-description">${pet.description}</p>
                    </div>
                    
                    <div class="pet-stats">
                        <span class="pet-date">Agregado: ${pet.dateAdded}</span>
                        <span class="pet-id">ID: ${pet.id.substring(0, 8)}</span>
                    </div>
                    
                    <div class="pet-actions">
                        <button class="action-btn vote-btn" onclick="handleVote('${pet.id}')">
                            <i class="fas fa-heart"></i> Votar
                        </button>
                        
                        <div class="votes-count">❤️ ${pet.votes} votos</div>
                        
                        <button class="action-btn select-btn" onclick="handleSelect('${pet.name}')">
                            <i class="fas fa-gift"></i> Elegir Mascota
                        </button>
                        
                        <div class="action-buttons-grid">
                            ${pet.image ? `
                                <button class="small-btn edit-btn" onclick="openEditor('${pet.id}')" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                            ${displayImage ? `
                                <button class="small-btn download-btn" onclick="downloadImage('${pet.id}')" title="Descargar">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="small-btn share-btn" onclick="shareImage('${pet.id}')" title="Compartir">
                                    <i class="fas fa-share"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getFilteredPets() {
    return AppState.pets
        .filter(pet => {
            const matchesSearch = pet.name.toLowerCase().includes(AppState.searchTerm.toLowerCase()) ||
                                pet.description.toLowerCase().includes(AppState.searchTerm.toLowerCase());
            const matchesType = AppState.filterType === 'all' || pet.type === AppState.filterType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (AppState.sortBy === 'votes') return b.votes - a.votes;
            if (AppState.sortBy === 'name') return a.name.localeCompare(b.name);
            return b.timestamp - a.timestamp;
        });
}

function updateTypeFilter() {
    const typeFilter = document.getElementById('type-filter');
    const types = ['all', ...new Set(AppState.pets.map(p => p.type))];
    
    typeFilter.innerHTML = types.map(type => 
        `<option value="${type}">${type === 'all' ? 'Todos los tipos' : type}</option>`
    ).join('');
    
    typeFilter.value = AppState.filterType;
}

// Funciones de utilidad mejoradas
function showSuccessMessage(msg) {
    const successMessage = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    
    successText.textContent = msg;
    successMessage.classList.remove('hidden');
    
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}

function downloadImage(petId) {
    const pet = AppState.pets.find(p => p.id === petId);
    if (!pet) return;
    
    const img = pet.editedImage || pet.image;
    if (!img) return;
    
    const link = document.createElement('a');
    link.href = img;
    link.download = `${pet.name}-navidad.png`;
    link.click();
    showSuccessMessage('¡Imagen descargada! 📥');
}

async function shareImage(petId) {
    const pet = AppState.pets.find(p => p.id === petId);
    if (!pet) return;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: `${pet.name} - Navidad Jurásica`,
                text: pet.description,
                url: window.location.href
            });
        } catch (err) {
            console.log('Error al compartir:', err);
        }
    } else {
        // Fallback para navegadores que no soportan Web Share API
        if (navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(`${pet.name} - ${pet.description}`);
                showSuccessMessage('¡Información copiada al portapapeles! 📋');
            } catch (err) {
                showSuccessMessage('Función de compartir no disponible 📱');
            }
        } else {
            showSuccessMessage('Función de compartir no disponible 📱');
        }
    }
}

// Editor de imágenes mejorado
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
}

function openEditor(petId) {
    const pet = AppState.pets.find(p => p.id === petId);
    if (!pet || !pet.image) return;
    
    AppState.editingPet = pet;
    AppState.showEditor = true;
    AppState.editorState = {
        filter: 'none',
        background: 'none',
        brightness: 100,
        contrast: 100,
        saturation: 100,
        stickers: []
    };
    
    // Resetear controles
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
    
    document.getElementById('editor-modal').classList.remove('hidden');
    applyEditorEffects();
}

function closeEditor() {
    AppState.showEditor = false;
    AppState.editingPet = null;
    document.getElementById('editor-modal').classList.add('hidden');
}

function applyEditorEffects() {
    if (!AppState.editingPet) return;
    
    const canvas = document.getElementById('editor-canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // Configurar tamaño del canvas manteniendo la proporción
        const maxWidth = 600;
        const maxHeight = 400;
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
            ctx.fillStyle = background.color;
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
        }
        
        ctx.filter = filterString;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Aplicar stickers
        AppState.editorState.stickers.forEach(sticker => {
            ctx.font = '40px Arial';
            ctx.fillText(sticker.emoji, sticker.x, sticker.y);
        });
    };
    
    img.src = AppState.editingPet.image;
}

function addSticker(emoji) {
    AppState.editorState.stickers.push({
        emoji,
        x: Math.random() * 300,
        y: Math.random() * 200
    });
    applyEditorEffects();
}

function applyEdits() {
    if (!AppState.editingPet) return;
    
    const canvas = document.getElementById('editor-canvas');
    const editedImage = canvas.toDataURL('image/png');
    
    AppState.editingPet.editedImage = editedImage;
    savePets();
    renderPets();
    closeEditor();
    showSuccessMessage('¡Edición guardada exitosamente! ✨');
}

// Función para cambiar tema
function toggleTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (AppState.currentTheme === 'christmas') {
        // Cambiar a tema jurásico
        document.body.style.background = 'linear-gradient(135deg, var(--jurassic-green), var(--jurassic-light))';
        themeToggle.textContent = '🦕';
        AppState.currentTheme = 'jurassic';
    } else {
        // Cambiar a tema navideño
        document.body.style.background = 'linear-gradient(135deg, var(--primary-red), var(--secondary-red), var(--dark-red))';
        themeToggle.textContent = '🎄';
        AppState.currentTheme = 'christmas';
    }
}

// Hacer funciones disponibles globalmente para los eventos onclick en HTML
window.deletePet = deletePet;
window.handleVote = handleVote;
window.handleSelect = handleSelect;
window.openEditor = openEditor;
window.downloadImage = downloadImage;
window.shareImage = shareImage;