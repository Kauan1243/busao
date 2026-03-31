/**
 * MobiBus Premium - Aplicação Principal
 * Sistema de Mobilidade Urbana em Tempo Real
 * @version 2.0.0
 * @author MobiBus Team
 */

class MobiBusApp {
    constructor() {
        // Estado da aplicação
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            activeBuses: 0,
            usersActive: 0,
            timeSaved: 0,
            realTimeData: null,
            selectedLine: 'all',
            notifications: [],
            theme: 'light',
            language: 'pt-BR'
        };
        
        // Dados mockados para simulação
        this.mockData = {
            stats: {
                activeBuses: 24,
                usersActive: 1847,
                timeSaved: 18,
                totalTrips: 342,
                satisfaction: 4.8
            },
            lines: {
                203: {
                    name: 'Centro/Zona Sul',
                    color: '#FF6B6B',
                    eta: 3,
                    nextBuses: [3, 12, 24],
                    activeBuses: 4,
                    status: 'on-time',
                    progress: 80,
                    route: [
                        { name: 'Terminal Central', lat: -23.5505, lng: -46.6333 },
                        { name: 'Av. Paulista', lat: -23.5600, lng: -46.6400 },
                        { name: 'Parque Ibirapuera', lat: -23.5700, lng: -46.6500 }
                    ]
                },
                415: {
                    name: 'Universidades',
                    color: '#4ECDC4',
                    eta: 7,
                    nextBuses: [7, 19, 35],
                    activeBuses: 3,
                    status: 'delayed',
                    progress: 53,
                    route: [
                        { name: 'USP', lat: -23.5400, lng: -46.6200 },
                        { name: 'UNIP', lat: -23.5450, lng: -46.6250 },
                        { name: 'Mackenzie', lat: -23.5500, lng: -46.6300 }
                    ]
                },
                512: {
                    name: 'Industrial/Parque',
                    color: '#45B7D1',
                    eta: 1,
                    nextBuses: [1, 8, 16],
                    activeBuses: 5,
                    status: 'approaching',
                    progress: 93,
                    route: [
                        { name: 'Distrito Industrial', lat: -23.5800, lng: -46.6600 },
                        { name: 'Parque Industrial', lat: -23.5750, lng: -46.6550 },
                        { name: 'Centro Comercial', lat: -23.5700, lng: -46.6500 }
                    ]
                }
            },
            tariffs: {
                normal: 4.50,
                estudante: 2.25,
                idoso: 0,
                linhas: {
                    203: 4.50,
                    415: 4.50,
                    512: 4.80
                },
                lastUpdate: '2026-03-31T10:00:00'
            },
            busPositions: [
                { line: 203, x: 20, y: 45, speed: 35 },
                { line: 203, x: 55, y: 60, speed: 28 },
                { line: 415, x: 35, y: 30, speed: 42 },
                { line: 512, x: 75, y: 25, speed: 38 }
            ],
            users: [
                { id: 1, name: 'Ana Silva', email: 'ana@email.com', password: '123456', type: 'estudante', favorites: [203] },
                { id: 2, name: 'Carlos Souza', email: 'carlos@email.com', password: '123456', type: 'comum', favorites: [415, 512] }
            ]
        };
        
        // Inicializar
        this.init();
    }
    
    /**
     * Inicialização da aplicação
     */
    async init() {
        console.log('🚀 MobiBus Premium iniciando...');
        
        // Carregar dados salvos
        this.loadStoredData();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Iniciar simulações em tempo real
        this.startRealTimeSimulation();
        
        // Carregar estatísticas
        await this.loadStats();
        
        // Animar elementos na página
        this.animateOnScroll();
        
        // Configurar menu mobile
        this.setupMobileMenu();
        
        // Iniciar simulação do mockup do telefone
        this.startMockupSimulation();
        
        console.log('✅ MobiBus Premium pronto!');
    }
    
    /**
     * Carregar dados armazenados localmente
     */
    loadStoredData() {
        try {
            const storedUser = localStorage.getItem('mobibus_user');
            if (storedUser) {
                this.state.currentUser = JSON.parse(storedUser);
                this.state.isAuthenticated = true;
                this.updateUserUI();
            }
            
            const storedTheme = localStorage.getItem('mobibus_theme');
            if (storedTheme) {
                this.state.theme = storedTheme;
                this.applyTheme();
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    
    /**
     * Configurar event listeners globais
     */
    setupEventListeners() {
        // Menu mobile
        const mobileToggle = document.getElementById('mobileToggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Controles do dashboard
        const controlBtns = document.querySelectorAll('.control-btn');
        controlBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const line = btn.dataset.line;
                this.filterDashboard(line);
            });
        });
        
        // User preview click
        const userPreview = document.getElementById('userPreview');
        if (userPreview) {
            userPreview.addEventListener('click', () => {
                if (this.state.isAuthenticated) {
                    window.location.href = 'pages/perfil.html';
                } else {
                    window.location.href = 'pages/perfil.html?action=login';
                }
            });
        }
        
        // Scroll suave para âncoras
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href && href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    }
    
    /**
     * Iniciar simulação de dados em tempo real
     */
    startRealTimeSimulation() {
        // Atualizar ETAs a cada 3 segundos
        setInterval(() => {
            this.updateRealTimeETAs();
        }, 3000);
        
        // Atualizar posições dos ônibus a cada 2 segundos
        setInterval(() => {
            this.updateBusPositions();
        }, 2000);
        
        // Atualizar estatísticas a cada 10 segundos
        setInterval(() => {
            this.updateStats();
        }, 10000);
    }
    
    /**
     * Atualizar ETAs em tempo real
     */
    updateRealTimeETAs() {
        // Simular variação nos ETAs
        for (let line in this.mockData.lines) {
            const lineData = this.mockData.lines[line];
            const variation = (Math.random() - 0.5) * 2;
            let newEta = Math.max(1, Math.min(15, lineData.eta + variation));
            newEta = Math.round(newEta * 10) / 10;
            lineData.eta = newEta;
            
            // Atualizar próximo ônibus
            if (newEta <= 2) {
                lineData.status = 'approaching';
                lineData.progress = 90 + Math.random() * 10;
            } else if (newEta <= 5) {
                lineData.status = 'on-time';
                lineData.progress = 60 + Math.random() * 20;
            } else {
                lineData.status = 'delayed';
                lineData.progress = 30 + Math.random() * 30;
            }
            
            // Atualizar UI se existir
            const etaElement = document.getElementById(`eta${line}`);
            if (etaElement) {
                etaElement.textContent = `${Math.floor(newEta)} min`;
                this.animateValue(etaElement);
            }
            
            const progressBar = document.getElementById(`progress${line}`);
            if (progressBar) {
                progressBar.style.width = `${lineData.progress}%`;
            }
            
            // Atualizar status badge
            const lineCard = document.querySelector(`.line-card[data-line="${line}"]`);
            if (lineCard) {
                const statusBadge = lineCard.querySelector('.line-status-badge');
                if (statusBadge) {
                    this.updateStatusBadge(statusBadge, lineData.status);
                }
            }
        }
        
        // Atualizar ETA no mockup
        const mockupEta = document.querySelector('.eta-badge span');
        if (mockupEta) {
            const eta203 = this.mockData.lines[203].eta;
            mockupEta.textContent = `Próximo ônibus: ${Math.floor(eta203)} min`;
        }
    }
    
    /**
     * Atualizar posições dos ônibus no mapa
     */
    updateBusPositions() {
        this.mockData.busPositions.forEach(bus => {
            // Movimento aleatório suave
            let newX = bus.x + (Math.random() - 0.5) * 3;
            let newY = bus.y + (Math.random() - 0.5) * 2;
            newX = Math.min(Math.max(newX, 5), 95);
            newY = Math.min(Math.max(newY, 5), 95);
            bus.x = newX;
            bus.y = newY;
        });
        
        // Atualizar posição no mockup
        const movingBus = document.querySelector('.moving-bus');
        if (movingBus) {
            const bus203 = this.mockData.busPositions.find(b => b.line === 203);
            if (bus203) {
                movingBus.style.left = `${bus203.x}%`;
                movingBus.style.bottom = `${bus203.y}%`;
            }
        }
    }
    
    /**
     * Atualizar estatísticas do dashboard
     */
    async loadStats() {
        this.updateStats();
    }
    
    updateStats() {
        // Simular variação nas estatísticas
        const variation = () => Math.floor(Math.random() * 5) - 2;
        
        const newActiveBuses = Math.max(15, Math.min(35, this.mockData.stats.activeBuses + variation()));
        const newUsersActive = Math.max(1500, Math.min(2200, this.mockData.stats.usersActive + Math.floor(Math.random() * 50)));
        
        this.mockData.stats.activeBuses = newActiveBuses;
        this.mockData.stats.usersActive = newUsersActive;
        
        // Atualizar UI
        const activeBusesEl = document.getElementById('activeBuses');
        const usersActiveEl = document.getElementById('usersActive');
        const timeSavedEl = document.getElementById('timeSaved');
        
        if (activeBusesEl) this.animateNumber(activeBusesEl, newActiveBuses);
        if (usersActiveEl) this.animateNumber(usersActiveEl, newUsersActive);
        if (timeSavedEl) this.animateNumber(timeSavedEl, this.mockData.stats.timeSaved);
    }
    
    /**
     * Filtrar dashboard por linha
     */
    filterDashboard(line) {
        this.state.selectedLine = line;
        
        // Atualizar UI dos botões
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => {
            if (btn.dataset.line === line) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Filtrar cards de linha
        const lineCards = document.querySelectorAll('.line-card');
        if (line === 'all') {
            lineCards.forEach(card => card.style.display = 'block');
        } else {
            lineCards.forEach(card => {
                if (card.dataset.line === line) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * Atualizar status badge
     */
    updateStatusBadge(badge, status) {
        const statusMap = {
            'on-time': { icon: 'fa-check-circle', text: 'No horário', class: 'status-on-time' },
            'delayed': { icon: 'fa-exclamation-triangle', text: 'Tráfego intenso', class: 'status-delayed' },
            'approaching': { icon: 'fa-bus', text: 'Aproximando', class: 'status-approaching' }
        };
        
        const config = statusMap[status];
        if (config) {
            badge.innerHTML = `<i class="fas ${config.icon}"></i> ${config.text}`;
            badge.className = `line-status-badge ${config.class}`;
        }
    }
    
    /**
     * Atualizar UI do usuário
     */
    updateUserUI() {
        const userNameSpan = document.getElementById('userName');
        if (userNameSpan) {
            if (this.state.isAuthenticated && this.state.currentUser) {
                userNameSpan.textContent = this.state.currentUser.name.split(' ')[0];
            } else {
                userNameSpan.textContent = 'Visitante';
            }
        }
    }
    
    /**
     * Animar número
     */
    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Animar valor de elemento
     */
    animateValue(element) {
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
    
    /**
     * Animar elementos ao scroll
     */
    animateOnScroll() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Animar cards de features
        document.querySelectorAll('.feature-card-premium, .testimonial-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s ease';
            observer.observe(el);
        });
    }
    
    /**
     * Configurar menu mobile
     */
    setupMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const mobileToggle = document.getElementById('mobileToggle');
        
        if (navLinks && mobileToggle) {
            window.toggleMobileMenu = () => {
                navLinks.classList.toggle('active');
                const icon = mobileToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                }
            };
        }
        
        // Fechar menu ao clicar em um link
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                const navLinks = document.querySelector('.nav-links');
                if (navLinks && window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    const icon = document.querySelector('#mobileToggle i');
                    if (icon) {
                        icon.classList.add('fa-bars');
                        icon.classList.remove('fa-times');
                    }
                }
            });
        });
    }
    
    /**
     * Iniciar simulação do mockup do telefone
     */
    startMockupSimulation() {
        const canvas = document.getElementById('mockupCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Desenhar mapa simplificado
        const drawMap = () => {
            if (!ctx) return;
            
            // Fundo gradiente
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#e0e7ff');
            gradient.addColorStop(1, '#c7d2fe');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            // Desenhar ruas
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            
            // Ruas horizontais
            for (let i = 0; i < 5; i++) {
                const y = (i + 1) * (height / 6);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            
            // Ruas verticais
            for (let i = 0; i < 4; i++) {
                const x = (i + 1) * (width / 5);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            
            // Desenhar pontos de parada
            const stops = [
                { x: width * 0.2, y: height * 0.3 },
                { x: width * 0.5, y: height * 0.5 },
                { x: width * 0.8, y: height * 0.7 },
                { x: width * 0.3, y: height * 0.8 }
            ];
            
            stops.forEach(stop => {
                ctx.beginPath();
                ctx.fillStyle = '#FFE66D';
                ctx.arc(stop.x, stop.y, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.fillStyle = 'white';
                ctx.arc(stop.x, stop.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
        };
        
        drawMap();
        
        // Animar o desenho do mapa
        setInterval(() => {
            drawMap();
        }, 5000);
    }
    
    /**
     * Alternar tema (claro/escuro)
     */
    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('mobibus_theme', this.state.theme);
        this.applyTheme();
    }
    
    /**
     * Aplicar tema
     */
    applyTheme() {
        if (this.state.theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
    
    /**
     * Login do usuário
     */
    async login(email, password) {
        const user = this.mockData.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.state.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                type: user.type,
                favorites: user.favorites
            };
            this.state.isAuthenticated = true;
            
            localStorage.setItem('mobibus_user', JSON.stringify(this.state.currentUser));
            this.updateUserUI();
            
            return { success: true, user: this.state.currentUser };
        }
        
        return { success: false, message: 'E-mail ou senha inválidos' };
    }
    
    /**
     * Logout do usuário
     */
    logout() {
        this.state.currentUser = null;
        this.state.isAuthenticated = false;
        localStorage.removeItem('mobibus_user');
        this.updateUserUI();
        
        return { success: true };
    }
    
    /**
     * Registrar novo usuário
     */
    async register(name, email, password, type) {
        // Verificar se email já existe
        const exists = this.mockData.users.find(u => u.email === email);
        if (exists) {
            return { success: false, message: 'E-mail já cadastrado' };
        }
        
        const newUser = {
            id: this.mockData.users.length + 1,
            name,
            email,
            password,
            type,
            favorites: []
        };
        
        this.mockData.users.push(newUser);
        
        // Salvar no localStorage
        const users = JSON.parse(localStorage.getItem('mobibus_users') || '[]');
        users.push(newUser);
        localStorage.setItem('mobibus_users', JSON.stringify(users));
        
        return { success: true, user: newUser };
    }
    
    /**
     * Adicionar linha aos favoritos
     */
    addFavorite(lineId) {
        if (!this.state.isAuthenticated || !this.state.currentUser) {
            return { success: false, message: 'Faça login para adicionar favoritos' };
        }
        
        if (!this.state.currentUser.favorites.includes(lineId)) {
            this.state.currentUser.favorites.push(lineId);
            localStorage.setItem('mobibus_user', JSON.stringify(this.state.currentUser));
            return { success: true };
        }
        
        return { success: false, message: 'Linha já está nos favoritos' };
    }
    
    /**
     * Remover linha dos favoritos
     */
    removeFavorite(lineId) {
        if (this.state.isAuthenticated && this.state.currentUser) {
            const index = this.state.currentUser.favorites.indexOf(lineId);
            if (index > -1) {
                this.state.currentUser.favorites.splice(index, 1);
                localStorage.setItem('mobibus_user', JSON.stringify(this.state.currentUser));
                return { success: true };
            }
        }
        return { success: false };
    }
    
    /**
     * Obter dados de uma linha específica
     */
    getLineData(lineId) {
        return this.mockData.lines[lineId] || null;
    }
    
    /**
     * Obter todas as linhas
     */
    getAllLines() {
        return this.mockData.lines;
    }
    
    /**
     * Obter tarifas atualizadas
     */
    getTariffs() {
        return this.mockData.tariffs;
    }
    
    /**
     * Obter posições dos ônibus
     */
    getBusPositions() {
        return this.mockData.busPositions;
    }
    
    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.mobibus = new MobiBusApp();
});

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobiBusApp;
}