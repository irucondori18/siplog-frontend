/* === CONFIGURACIÓN Y NODOS === */
const CONFIG = {
    center: { lat: -23.7, lng: -65.9 },
    zoom: 9,
    simSpeed: 0.08, // Velocidad REDUCIDA para movimiento más lento y realista
    routeFallback: false, // Se activa si falla la API de Directions
    alertRadius: 0.05 // Aprox 5-6 km en grados lat/lon para detección
};

const usuario_invitado = {
    role: 'guest',
    username: 'invitado',
    password: '12345678'
}

const usuario_empresa = {
    role: 'company',
    username: 'empresa',
    password: '12345678'
}

const usuario_transportista = {
    role: 'transportista',
    username: 'transportista',
    password: '12345678',
    id_transportista: 9
}

const NODES = [
    { id: 'jujuy', name: 'S.S. de Jujuy', lat: -24.1858, lng: -65.2995 },
    { id: 'yala', name: 'Yala', lat: -24.1189, lng: -65.4055 },
    { id: 'volcan', name: 'Volcán', lat: -23.9167, lng: -65.4667 },
    { id: 'purmamarca', name: 'Purmamarca', lat: -23.7483, lng: -65.4923 },
    { id: 'lipan', name: 'Cuesta de Lipán', lat: -23.6882, lng: -65.6460 },
    { id: 'salinas', name: 'Salinas Grandes', lat: -23.6196, lng: -65.8576 },
    { id: 'susques', name: 'Susques', lat: -23.4038, lng: -66.3664 },
    { id: 'jama', name: 'Paso de Jama', lat: -23.2375, lng: -67.0764 }
];

/* === ESTADO APLICACIÓN === */
const state = {
    map: null,
    google: null,
    directionsService: null,
    routePath: [], // Array de LatLngs reales de la carretera
    // transports: [],
    alerts: [],
    markers: {}, // ID -> Marker
    selectedId: null
};
const recorridos = []; // cada elemento será { id, dni, name, license, dangerCard, insurance, company }

//Se le asigna un rol dependiendo el botón que aprete el usuario
const session = {
    role: null // 'guest' | 'company'
};

/* === CONTROLADOR === */
window.app = {
    
    // 1. INIT
    init: () => {
        setTimeout(() => {
            const status = document.getElementById('status-api');
            if (status) {
                status.innerText = "READY";
                status.className = "text-green-500 font-bold animate-none";
                const btn = document.getElementById('btn-enter');
                btn.disabled = false;
                btn.classList.remove('cursor-wait');
                btn.classList.add('cursor-pointer', 'animate-pulse');
            }
   
        }, 1500);

        app.renderDropdowns();
        app.startClock();


    },

    // init: () => {
    //     setTimeout(() => {
    //         const splash = document.getElementById('splash-screen');
    //         const login = document.getElementById('login-screen');
    //         const main = document.getElementById('app-container');
            
    //         if (splash) {
    //             splash.style.opacity = '0';
    //             splash.style.display = 'none';
    //         }
    //         if (login) {
    //             login.style.display = 'none';
    //         }
            
    //         // 2. Mostrar contenedor principal ANTES de inicializar el mapa
    //         if (main) {
    //             main.classList.remove('opacity-0');
    //             main.style.display = 'flex';
    //         }

    //         // 3. Esperar a que el DOM se actualice completamente
    //         new Promise(resolve => setTimeout(resolve, 100));

    //         try {
    //             // Verificar que el elemento map existe
    //             const mapElement = document.getElementById('map');
    //             if (!mapElement) {
    //                 throw new Error('Elemento #map no encontrado en el DOM');
    //             }

    //             // Configurar rol como empresa
    //             session.role = 'company';
                
    //             // Inicializar todo el sistema
                
                
    //             console.log("✅ Sistema SIPLoG cargado correctamente");
    //         } catch (error) {
    //             console.error("❌ Error crítico al inicializar:", error);
    //             alert("Error al cargar el mapa: " + error.message + "\nPor favor recarga la página.");
    //         }
    //     }, 1500);

    //     app.initMap();
    //     app.calculateRealRoute();
    //     app.renderDropdowns();
    //     app.initData();
    //     app.startSimulation();
    //     app.startClock();

    // },

    // // 1. INIT - Carga directa al mapa
    // init: async () => {
    //     // 1. Ocultar splash y login
        
    // },

    // 2. INGRESAR
    enterSystem: async () => {
        const btn = document.getElementById('btn-enter');
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> INICIANDO SESIÓN EMPRESA...';
        const selectChofer = document.getElementById('driver_selection');    
        selectChofer.classList.remove('hidden');
        try {
            btn.removed = true;
            await app.initMap();
            // Intentar cargar ruta real antes de empezar
            await app.calculateRealRoute();
            
            app.initData();
            //DESCOMENTAR
            // app.startSimulation();

            const splash = document.getElementById('splash-screen');
            const main = document.getElementById('app-container');
            splash.style.opacity = '0';
            main.classList.remove('opacity-0');

            setTimeout(() => splash.style.display = 'none', 800);
        } catch (error) {
            console.error("Error crítico:", error);
            btn.innerText = "ERROR DE SISTEMA";
            btn.classList.add('bg-red-600');
        }
    },
    
    //ingresar como invitado
    enterAsGuest: async () => {
        const btn = document.getElementById('btn-enter');
        if (btn) {
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> INICIANDO SESIÓN INVITADO...';
            btn.classList.remove('animate-pulse');
        }

        try {
            await app.initMap();
            await app.calculateRealRoute();
            app.initData();
            app.startSimulation();

            const splash = document.getElementById('splash-screen');
            const main = document.getElementById('app-container');
            if (splash && main) {
                splash.style.opacity = '0';
                main.classList.remove('opacity-0');
                setTimeout(() => splash.style.display = 'none', 800);
            }

            app.configureGuestUI();
        } catch (error) {
            console.error('Error crítico invitado:', error);
            if (btn) {
                btn.innerText = 'ERROR DE SISTEMA';
                btn.classList.add('bg-red-600');
                btn.disabled = false;
            }
        }
    },

    enterAsTransportista: async () => {
        const btn = document.getElementById('btn-enter');
        if (btn) {
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">sync</span> INICIANDO SESIÓN TRANSPORTISTA...';
            btn.classList.remove('animate-pulse');
        }

        try {
            await app.initMap();
            await app.calculateRealRoute();
            app.initData();
            app.startSimulation();

            const splash = document.getElementById('splash-screen');
            const main = document.getElementById('app-container');
            if (splash && main) {
                splash.style.opacity = '0';
                main.classList.remove('opacity-0');
                setTimeout(() => splash.style.display = 'none', 800);
            }

            app.configureGuestUI();
        } catch (error) {
            console.error('Error crítico transportista:', error);
            if (btn) {
                btn.innerText = 'ERROR DE SISTEMA';
                btn.classList.add('bg-red-600');
                btn.disabled = false;
            }
        }
    },

    configureGuestUI: () => {
        // Ocultar botones de carga (tienen clase company-only en la navbar)
        document.querySelectorAll('.company-only').forEach(el => {
            el.classList.add('hidden');
        });
        if(session.role === 'transportista'){
            const btnRecorrido = document.getElementById('iniciar_recorrido');    
            btnRecorrido.classList.remove('hidden');
            const selectChofer = document.getElementById('driver_selection');    
            selectChofer.classList.add('hidden');
        }
        // Opcional: si quieres ocultar también pestaña "Choferes" completa
        const tabDrivers = document.getElementById('tab-drivers');
        const panelDrivers = document.getElementById('panel-drivers');
        if (tabDrivers) tabDrivers.classList.add('hidden');
        if (panelDrivers) panelDrivers.classList.add('hidden');

        const tabFleet = document.getElementById('tab-fleet');
        const panelFleet = document.getElementById('panel-fleet');
        if (tabFleet) tabFleet.classList.add('hidden');
        if (panelFleet) panelFleet.classList.add('hidden');

        // Forzar que la pestaña activa sea Flota o Alertas (por ejemplo Alertas)
        app.switchTab('alerts');
    },

    restoreCompanyUI: () => {
    // Mostrar de nuevo los elementos ocultados por company-only
    document.querySelectorAll('.company-only').forEach(el => {
        el.classList.remove('hidden');
    });

    // Restaurar pestaña y panel de Choferes
    const tabDrivers = document.getElementById('tab-drivers');
    const panelDrivers = document.getElementById('panel-drivers');
    if (tabDrivers) tabDrivers.classList.remove('hidden');
    if (panelDrivers) panelDrivers.classList.remove('hidden');

    // Restaurar pestaña y panel de Flota
    const tabFleet = document.getElementById('tab-fleet');
    const panelFleet = document.getElementById('panel-fleet');
    if (tabFleet) tabFleet.classList.remove('hidden');
    if (panelFleet) panelFleet.classList.remove('hidden');

    // Si querés devolver la pestaña activa a "Flota"
    app.switchTab('fleet');
},

    //ingresar como empresa
    // Mostrar pantalla de login empresa
    showCompanyLogin() {
        document.getElementById('splash-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            const loginScreen = document.getElementById('login-screen');
            loginScreen.classList.remove('hidden');
            loginScreen.classList.add('flex');
            setTimeout(() => loginScreen.style.opacity = '1', 50);
        }, 700);
},

// Volver al splash
backToSplash() {
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('login-screen').style.opacity = '0';
    const btn = document.getElementById('btn-enter');

    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    btn.innerHTML = `
        <span class="relative flex items-center gap-3">
            INICIAR SESIÓN
            <span class="material-symbols-outlined">arrow_forward</span>
        </span>
    `;

    setTimeout(() => {

        // OCULTAR TODO inmediatamente ANTES de restaurar UI
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('login-screen').classList.remove('flex');

        const splash = document.getElementById('splash-screen');

        // splash aparece pero INVISIBLE
        splash.style.display = 'flex';
        splash.style.opacity = '0';

        // Forzar layout para que la transición funcione
        splash.getBoundingClientRect();

        // AHORA sí iniciamos el fade-in
        splash.style.opacity = '1';

        // ⬅ ESPERAR hasta que el fade-in termine
        setTimeout(() => {
            this.restoreCompanyUI(); // ahora NO SE VE NADA
            this.init();
        }, 500); // ← PONÉ ACÁ EL MISMO tiempo de transición de tu splash

    }, 700);

},

// Procesar login empresa
login(event) {

    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');


    // const username = "si";
    // const password = "si"
    // const errorDiv = document.getElementById('login-error');


    // Aquí puedes validar contra tu backend
    // Por ahora, simulamos una validación simple
    if (username && password) {
        // Login exitoso
        document.getElementById('login-screen').style.opacity = '0';
        setTimeout(() => {
            
            document.getElementById('login-screen').classList.add('hidden');
            // Aquí va tu código para mostrar la vista de empresa
            if(username === usuario_empresa.username && password === usuario_empresa.password){
                session.role = 'company';
                rol = "EMPRESA";
                console.log('Ingresando al sistema como empresa...');
                app.enterSystem()
            }
            else if(username === usuario_transportista.username && password === usuario_transportista.password){
                session.role = 'transportista';
                rol = "TRANSPORTISTA";
                console.log('Ingresando al sistema como transportista...');
                app.enterAsTransportista();
            }
            else if(username === usuario_invitado.username && password === usuario_invitado.password){
                session.role = 'guest';
                rol = "INVITADO";
                console.log('Ingresando al sistema como invitado...');
                app.enterAsGuest();
            }else{
                // Mostrar error
                errorDiv.classList.remove('hidden');
                setTimeout(() => errorDiv.classList.add('hidden'), 3000);
                return;
            }
            document.getElementById("user-role").textContent = rol; 
        }, 700);
    } else {
        // Mostrar error
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 3000);
    }
},

    populateDriverSelect: () => {
    const select = document.getElementById('select-driver');
    const warning = document.getElementById('no-free-drivers');
    if (!select) return;

    select.innerHTML = '';

    const freeDrivers = drivers.filter(d => !d.assigned);

    if (freeDrivers.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Sin choferes disponibles';
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);
        if (warning) warning.classList.remove('hidden');
    } else {
        if (warning) warning.classList.add('hidden');

        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = 'Selecciona un chofer...';
        optDefault.disabled = true;
        optDefault.selected = true;
        select.appendChild(optDefault);

        freeDrivers.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = `${d.name} (${d.dni})`;
            select.appendChild(opt);
        });
    }
},

    populateTransportSelect: () => {
    const select = document.getElementById('select-transport');
    const warning = document.getElementById('no-free-transports');
    if (!select) return;

    select.innerHTML = '';

    const freeTransports = transports.filter(d => !d.assigned);

    if (freeTransports.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Sin transportes disponibles';
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);
        if (warning) warning.classList.remove('hidden');
    } else {
        if (warning) warning.classList.add('hidden');

        const optDefault = document.createElement('option');
        optDefault.value = '';
        optDefault.textContent = 'Selecciona un transporte...';
        optDefault.disabled = true;
        optDefault.selected = true;
        select.appendChild(optDefault);

        freeTransports.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            console.log(d);
            opt.textContent = `${d.plate} (${d.brand})`;
            select.appendChild(opt);
        });
    }
},


    // 3. MAPA
    initMap: async () => {
        const { Map, Polyline } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
        const { DirectionsService } = await google.maps.importLibrary("routes");

        state.google = { Map, Polyline, AdvancedMarkerElement, PinElement, DirectionsService };
        state.directionsService = new DirectionsService();

        state.map = new Map(document.getElementById("map"), {
            center: CONFIG.center,
            zoom: CONFIG.zoom,
            mapId: 'DEMO_MAP_ID',
            disableDefaultUI: true,
            gestureHandling: 'greedy',
            mapTypeId: 'terrain',
            backgroundColor: '#1e293b'
        });

        // Marcadores de Ciudades
        NODES.forEach(n => {
            const pin = new PinElement({ scale: 0.6, background: '#334155', borderColor: '#475569', glyph: '' });
            new AdvancedMarkerElement({
                map: state.map,
                position: { lat: n.lat, lng: n.lng },
                content: pin.element,
                title: n.name
            });
        });
    },

    // 4. CÁLCULO DE RUTA REAL (NUEVO)
    calculateRealRoute: () => {
        return new Promise((resolve) => {
            const request = {
                origin: NODES[0], // Jujuy
                destination: NODES[NODES.length - 1], // Jama
                travelMode: 'DRIVING'
            };

            state.directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    // Guardamos todos los puntos de la ruta
                    state.routePath = result.routes[0].overview_path;
                    
                    // Dibujar la ruta real
                    new state.google.Polyline({
                        path: state.routePath,
                        geodesic: true,
                        strokeColor: "#6366f1",
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        map: state.map
                    });

                    // Mapear cada nodo a su índice más cercano en la ruta real
                    // Esto nos permite saber en qué "kilómetro" está cada ciudad
                    NODES.forEach(node => {
                        let minDst = Infinity;
                        let closestIdx = 0;
                        const nLat = node.lat;
                        const nLng = node.lng;

                        state.routePath.forEach((p, i) => {
                            // Distancia euclidiana simple (suficiente para este zoom)
                            const d = Math.sqrt(Math.pow(p.lat() - nLat, 2) + Math.pow(p.lng() - nLng, 2));
                            if (d < minDst) {
                                minDst = d;
                                closestIdx = i;
                            }
                        });
                        node.pathIndex = closestIdx;
                    });

                    console.log("Ruta real cargada:", state.routePath.length, "puntos");
                } else {
                    console.warn("Fallo Directions API, usando modo fallback lineal");
                    CONFIG.routeFallback = true;
                    // Dibujar línea recta como fallback
                        new state.google.Polyline({
                        path: NODES.map(n => ({ lat: n.lat, lng: n.lng })),
                        strokeColor: "#6366f1",
                        strokeOpacity: 0.5,
                        strokeWeight: 4,
                        map: state.map
                    });
                }
                resolve();
            });
        });
    },

    // 5. DATA INICIAL
    initData: () => {
        // app.createRecorrido({ plate: "AD 440 JK", company: "TransNOA", driver: "Carlos M.", startLocation: "purmamarca", direction: "asc" });
        // app.createRecorrido({ plate: "AE 112 BB", company: "Logística Jujuy", driver: "Roberto S.", startLocation: "susques", direction: "desc" });
        // app.createRecorrido({ plate: "AF 990 ZZ", company: "Redpack", driver: "Juan P.", startLocation: "jujuy", direction: "asc" });
        state.alerts = [];

        const alert = { id: 1, type: 'clima', title: 'Clima', desc: 'Visibilidad reducida en zona de frontera.', location: 'jama' };
        state.alerts.push(alert);
        app.renderAlertList();
        app.createAlertMarker(alert);
        app.renderFleetList();
        app.renderDriverList();
    },

    // 6. LOGICA TRANSPORTE (ACTUALIZADA)
    createRecorrido: (data) => {
        if(session.role == 'transportista'){
            data.id_driver = usuario_transportista.id_transportista;
        }
        console.log(data);
        const startNode = NODES.find(n => n.id === data.inicio);
        if (!startNode) return;

        let currentPathIdx = 0;
        let endPathIdx = 0;

        if (!CONFIG.routeFallback) {
            // MODO RUTA REAL
            currentPathIdx = startNode.pathIndex;
            // Si va ascendente (a Chile), el fin es el último punto del array
            // Si va descendente (a Jujuy), el fin es el índice 0
            endPathIdx = data.destino === 'asc' ? state.routePath.length - 1 : 0;
        } else {
            // MODO FALLBACK (Lógica anterior basada en índices de NODES)
            currentPathIdx = NODES.findIndex(n => n.id === data.inicio);
            endPathIdx = data.destino === 'asc' ? NODES.length - 1 : 0;
        }

        const transporte = transports.find(x => x.id == data.id_transporte);

        const t = {
            id: Date.now() + Math.random(),
            ...data,
            currentPathIdx: currentPathIdx,
            targetPathIdx: endPathIdx,
            speed: (CONFIG.simSpeed + (Math.random() * 0.05)) * (data.destino === 'asc' ? 1 : -1), // Velocidad positiva o negativa
            lat: startNode.lat,
            lng: startNode.lng,
            lastNodeName: startNode.name,
            notifiedAlerts: new Set(), // Para no repetir notificaciones
            plate: transporte.plate
        };

        recorridos.push(t);
        app.addTransportMarker(t);
        app.startSimulation();
    },

    addTransportMarker: (t) => {
        const el = document.createElement('div');
        el.className = "group relative cursor-pointer";
        el.innerHTML = `
            <div class="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded border border-slate-600 opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-20 shadow-lg pointer-events-none font-bold tracking-wider">
                ${t.plate}
            </div>
            <div class="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white shadow-[0_0_15px_rgba(99,102,241,0.6)] flex items-center justify-center transform transition hover:scale-110 active:scale-95">
                <span class="material-symbols-outlined text-white text-lg">local_shipping</span>
            </div>
        `;
        el.onclick = (e) => { e.stopPropagation(); app.selectRecorrido(t.id); };

        const marker = new state.google.AdvancedMarkerElement({
            map: state.map,
            position: { lat: t.lat, lng: t.lng },
            content: el,
            title: t.plate,
            zIndex: 100
        });
        state.markers[t.id] = marker;
    },

    // 7. SIMULACIÓN (ACTUALIZADA con PROXIMIDAD)
    startSimulation: () => {
        setInterval(() => {
            recorridos.forEach(t => {
                
                // Lógica de movimiento (existente)
                if (!CONFIG.routeFallback) {
                    if ((t.direction === 'asc' && t.currentPathIdx >= t.targetPathIdx) ||
                        (t.direction === 'desc' && t.currentPathIdx <= t.targetPathIdx)) {
                        return; 
                    }
                    t.currentPathIdx += t.speed;
                    const pIdx = Math.floor(t.currentPathIdx);
                    if (pIdx >= 0 && pIdx < state.routePath.length) {
                        const point = state.routePath[pIdx];
                        t.lat = point.lat();
                        t.lng = point.lng();
                        NODES.forEach(n => {
                            if (Math.abs(n.pathIndex - pIdx) < 20) t.lastNodeName = n.name; 
                        });
                    }
                }

                // === NUEVO: CHECK PROXIMIDAD DE ALERTAS ===
                app.checkProximity(t);

                // Actualizar Marker en Mapa
                if (state.markers[t.id]) {
                    state.markers[t.id].position = { lat: t.lat, lng: t.lng };
                }

                // Actualizar UI si está seleccionado
                if (state.selectedId === t.id) app.updateCard(t);
            });
        }, 50); 
    },

    openModal: (type) => {
        // type: 'driver' | 'vehicle' | 'alert' | 'transport'
        let id = type;

        // compatibilidad con código viejo
        if (type === 'transport') id = 'vehicle';

        // si abrimos transporte, rellenar choferes libres
        if (id === 'recorrido') {
            app.populateDriverSelect();
            app.populateTransportSelect();
        }

        const modal = document.getElementById(`modal-${id}`);
        const content = document.getElementById(`modal-${id}-content`);
        if (!modal || !content) return;

        modal.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('opacity-0', 'scale-95');
            content.classList.add('opacity-100', 'scale-100');
        }, 20);
    },

    closeModal: (type) => {
        let id = type;
        if (type === 'transport') id = 'vehicle';

        const modal = document.getElementById(`modal-${id}`);
        const content = document.getElementById(`modal-${id}-content`);
        if (!modal || !content) return;

        content.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 200);
    },

    submitDriver: (event) => {
        event.preventDefault();
        const form = event.target;

        const driver = {
            id: Date.now(),
            name: form.driverName.value.trim(),
            dni: form.dni.value.trim(),
            license: form.license.value.trim(),
            dangerCard: form.dangerCard.value.trim(),
            insurance: form.insurance.value.trim(),
            company: form.company.value.trim(),
            assigned: false // importante: todavía sin transporte
        };

        drivers.push(driver);
        app.closeModal('driver');
        app.renderDriverList();
    },

    submitVehicle: (event) => {
        event.preventDefault();
        const form = event.target;

        const id_driver = form.id_driver.value;
        const driver = drivers.find(d => d.id.toString() === id_driver);

        if (!driver) {
            alert('Selecciona un chofer disponible.');
            return;
        }

        const data = {
            plate: form.plate.value.trim(),
            model: form.model.value.trim(),
            brand: form.brand.value.trim(),
            trailerType: form.trailerType.value,
            driver: driver.name,
            company: driver.company || 'Empresa',
            startLocation: form.startLocation.value,
            direction: form.direction.value
        };

        // Crear transporte en la simulación
        app.createRecorrido(data);

        // Marcar chofer como asignado
        driver.assigned = true;

        // ACTUALIZAR PANELES
        app.renderFleetList();     // muestra el nuevo camión en "Flota"
        app.renderDriverList();    // actualiza la lista de choferes

        // Cerrar modal y limpiar
        app.closeModal('vehicle');
        form.reset();
    },

    // === NUEVAS FUNCIONES DE NOTIFICACIÓN ===
    
    checkProximity: (t) => {
        state.alerts.forEach(alert => {
            // Verificar si ya fue notificado de esta alerta específica
            if(t.notifiedAlerts.has(alert.id)) return;

            const alertNode = NODES.find(n => n.id === alert.location);
            if(!alertNode) return;

            // Distancia simple (pitágoras) porque las coord son cercanas
            const dist = Math.sqrt(Math.pow(t.lat - alertNode.lat, 2) + Math.pow(t.lng - alertNode.lng, 2));

            if(dist < CONFIG.alertRadius) {
                t.notifiedAlerts.add(alert.id); // Marcar como notificado
                app.showNotification(t, alert);
            }
        });
    },

    showNotification: (t, alert) => {
        const container = document.getElementById('notification-area');
        const id = 'toast-' + Date.now();
        
        const colorClass = alert.type === 'accident' ? 'bg-red-500' : (alert.type === 'road' ? 'bg-blue-500' : 'bg-amber-500');
        const icon = alert.type === 'accident' ? 'car_crash' : (alert.type === 'road' ? 'road' : 'warning');

        const toast = document.createElement('div');
        toast.className = `w-full bg-slate-900 border-l-4 ${colorClass.replace('bg-', 'border-')} shadow-2xl rounded-r-lg p-4 flex items-center gap-4 toast-enter pointer-events-auto`;
        toast.innerHTML = `
            <div class="rounded-full p-2 bg-slate-800 ${colorClass.replace('bg-', 'text-')}">
                <span class="material-symbols-outlined animate-pulse">${icon}</span>
            </div>
            <div class="flex-1">
                <div class="text-[15px] text-slate-400 font-bold uppercase tracking-widest flex justify-between">
                    <span>PROXIMIDAD DETECTADA</span>
                    <span>${t.plate}</span>
                </div>
                <div class="font-bold text-white text-sm leading-tight mt-1">
                    ${alert.title} en zona próxima
                </div>
            </div>
        `;

        container.appendChild(toast);

        // Animación de entrada
        requestAnimationFrame(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-enter-active');
        });

        // Sonido simple (opcional, solo beep de consola visual)
        console.log("BEEP: Alerta de proximidad para " + t.plate);

        // Remover después de 5 segundos
        setTimeout(() => {
            toast.classList.remove('toast-enter-active');
            toast.classList.add('toast-exit-active');
            setTimeout(() => toast.remove(), 500); // Esperar animación
        }, 5000);
    },


    renderDriverList: () => {
        const container = document.getElementById('panel-drivers');
        const counter = document.getElementById('count-drivers');
        if (!container) return;

        container.innerHTML = '';

        const mapDrivers = new Map();

        // 1) desde transports precargados y nuevos
        //VER SI DESCOMENTAR
        // transports.forEach(t => {
        //     if (!t.driver) return;
        //     const name = t.driver.trim();
        //     if (!name) return;
        //     if (!mapDrivers.has(name)) {
        //         mapDrivers.set(name, { name, fromTransports: [], fromForm: null });
        //     }
        //     mapDrivers.get(name).fromTransports.push(t);
        // });
        // 2) desde formulario de transportistas
        drivers.forEach(d => {
            const name = d.name || d.dni;
            if (!mapDrivers.has(name)) {
                mapDrivers.set(name, { name, fromTransports: [], fromForm: d });
            } else {
                mapDrivers.get(name).fromForm = d;
            }
        });

        const list = Array.from(mapDrivers.values());
        if (counter) counter.textContent = list.length.toString();

        list.forEach(d => {
            const plates = recorridos.map(r => r.id_transporte).join(' · ') || 'Sin unidades asignadas';
            const initials = d.name.split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();

            const card = document.createElement('div');
            card.className = 'bg-slate-900/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-500 transition cursor-pointer';

            card.innerHTML = `
                <div class="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                    ${initials}
                </div>
                <div class="flex-1">
                    <div class="text-sm font-semibold text-slate-100">${d.name}</div>
                    <div class="text-[11px] text-slate-400 uppercase tracking-wider">
                        ${d.fromForm.dni}
                    </div>
                </div>
            `;

            if (d.fromTransports.length > 0) {
                const first = d.fromTransports[0];
                card.onclick = () => {
                    app.selectRecorrido(first.id);
                    app.switchTab('fleet');
                };
            }

            container.appendChild(card);
        });
    },

    // 8. INTERACCIÓN UI
    selectRecorrido: (id) => {
        state.selectedId = id;
        const t = recorridos.find(x => x.id === id);
        if (!t) return;
        state.map.panTo({ lat: t.lat, lng: t.lng });
        const card = document.getElementById('track-card');
        card.classList.remove('translate-y-[150%]');
        app.updateCard(t);
    },

    updateCard: (t) => {
        const transporte = transports.find(x => x.id == t.id_transporte);
        const transportista = drivers.find(x => x.id == t.id_driver);

        document.getElementById('card-plate').innerText = transporte?.plate ?? '';
        document.getElementById('card-driver').innerText = transportista?.name ?? 'Chofer Desconocido';
        document.getElementById('card-speed').innerText = Math.abs(Math.floor(t.speed * 120)) + " km/h"; // Simulando velocidad visual
        document.getElementById('card-from').innerText = t.lastNodeName || "EN RUTA"; 
        
        // Calcular destino nombre
        const destName = t.direction === 'asc' ? 'CHILE (Frontera)' : 'JUJUY (Capital)';
        document.getElementById('card-to').innerText = destName;

        // Barra de progreso aproximada
        let pct = 0;
        if(!CONFIG.routeFallback) {
            pct = (t.currentPathIdx / state.routePath.length) * 100;
            if(t.direction === 'desc') pct = 100 - pct; // Invertir barra si baja
        }
        document.getElementById('card-progress').style.width = Math.min(Math.max(pct, 0), 100) + "%";
    },

    closeCard: () => {
        state.selectedId = null;
        document.getElementById('track-card').classList.add('translate-y-[150%]');
    },

    submitTransport: (e) => {
        e.preventDefault();
        // Modificado para unir nombre y apellido
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        data.driver = `${data.driverName} ${data.driverSurname}`; // Unir campos
        
        app.createRecorrido(data);
        app.renderFleetList();
        app.closeModal('transport');
        app.switchTab('fleet');
        e.target.reset();
    },

    submitAlert: (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target));
        console.log(data);
        const titles = { clima: 'Clima', road: 'Ruta', accident: 'Accidente' };
        const alert = { id: Date.now(), ...data, title: titles[data.type] };
        state.alerts.unshift(alert);
        app.createAlertMarker(alert);
        app.renderAlertList();
        app.closeModal('alert');
        app.switchTab('alerts');
        e.target.reset();
    },

    createAlertMarker: (a) => {
        const el = document.createElement('div');
        const color = a.type === 'accident' ? 'text-red-500' : (a.type === 'road' ? 'text-blue-500' : 'text-amber-500');
        const icon = a.type === 'accident' ? 'car_crash' : (a.type === 'road' ? 'road' : 'warning');
        el.innerHTML = `<span class="material-symbols-outlined ${color} text-3xl drop-shadow-md animate-bounce">${icon}</span>`;

        const loc = NODES.find(n => n.id === a.location);
        if (loc) {
            new state.google.AdvancedMarkerElement({
                map: state.map,
                position: { lat: loc.lat + 0.005, lng: loc.lng },
                content: el,
                title: a.title
            });
        }
    },

    renderFleetList: () => {
        console.log("xdddddddd");
        console.log(transports);
        const list = document.getElementById('panel-fleet');
        document.getElementById('count-fleet').innerText = transports.length;
        list.innerHTML = transports.map(t => `
            <div onclick="app.selectRecorrido(${t.id})" class="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 cursor-pointer transition flex justify-between items-center group mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-slate-400 font-bold text-xs border border-slate-600 font-mono shadow-inner">${t.plate.substring(0, 2)}</div>
                    <div>
                        <div class="font-bold text-slate-200 text-sm group-hover:text-indigo-400 font-mono tracking-wide transition">${t.plate}</div>
                        <div class="text-[10px] text-slate-500 uppercase">${t.brand}</div>
                    </div>
                </div>
                <div class="text-[10px] text-green-400 bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50 font-bold flex items-center gap-1">
                    <div class="live-dot w-1.5 h-1.5 bg-green-500"></div> RUTA 9/52
                </div>
            </div>
        `).join('');
    },

    renderAlertList: () => {
        const list = document.getElementById('alert-list-content');
        list.innerHTML = state.alerts.map(a => {
            const loc = NODES.find(n => n.id === a.location)?.name || 'Ruta';
            const color = a.type === 'accident' ? 'red' : (a.type === 'road' ? 'blue' : 'amber');
            const icon = a.type === 'accident' ? 'car_crash' : (a.type === 'road' ? 'road' : 'warning');
            return `
            <div class="bg-slate-800 p-3 rounded-lg border-l-4 border-${color}-500 mb-2 cursor-pointer hover:bg-slate-750 transition shadow-sm group">
                <div class="flex justify-between items-start mb-1">
                    <h4 class="text-${color}-500 text-sm font-bold flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">${icon}</span> ${a.title}
                    </h4>
                    <span class="text-[10px] text-slate-500 uppercase">AHORA</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed mb-2 group-hover:text-white">${a.desc}</p>
                <div class="text-[10px] text-slate-400 uppercase font-bold bg-slate-900/50 p-1 px-2 rounded w-fit flex items-center gap-1">
                    <span class="material-symbols-outlined text-[10px]">location_on</span> ${loc}
                </div>
            </div>`;
        }).join('');
    },

    renderDropdowns: () => {
        const opts = NODES.map(n => `<option value="${n.id}">${n.name}</option>`).join('');
        document.getElementById('select-start').innerHTML = opts;
        document.getElementById('select-alert-loc').innerHTML = opts;
    },

    startClock: () => setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString('es-AR');
    }, 1000),

    toggleSidebar: () => document.getElementById('sidebar').classList.toggle('-translate-x-full'),

    switchTab: (tab) => {
        const btnFleet = document.getElementById('tab-fleet');
        const btnDrivers = document.getElementById('tab-drivers');
        const btnAlerts = document.getElementById('tab-alerts');

        const panelFleet = document.getElementById('panel-fleet');
        const panelDrivers = document.getElementById('panel-drivers');
        const panelAlerts = document.getElementById('panel-alerts');

        [btnFleet, btnDrivers, btnAlerts].forEach(b => b && b.classList.remove('tab-active'));
        [panelFleet, panelDrivers, panelAlerts].forEach(p => p && p.classList.add('hidden'));

        if (tab === 'fleet') {
            btnFleet && btnFleet.classList.add('tab-active');
            panelFleet && panelFleet.classList.remove('hidden');
        } else if (tab === 'drivers') {
            btnDrivers && btnDrivers.classList.add('tab-active');
            panelDrivers && panelDrivers.classList.remove('hidden');
            app.renderDriverList(); // ← aquí también
        } else if (tab === 'alerts') {
            btnAlerts && btnAlerts.classList.add('tab-active');
            panelAlerts && panelAlerts.classList.remove('hidden');
        }
    },


    resetView: () => state.map && (state.map.setCenter(CONFIG.center), state.map.setZoom(CONFIG.zoom))
};

// Iniciar al Cargar
document.addEventListener('DOMContentLoaded', app.init);
