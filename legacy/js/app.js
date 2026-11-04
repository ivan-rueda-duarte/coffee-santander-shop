// Lógica principal de la tienda: lee CAFES, PROVINCIAS, MUNICIPIO_PROVINCIA,
// PRESENTACIONES, MOLIENDAS y TIENDA (js/data.js) y el trazado de MAPA_SANTANDER
// (js/mapa.js). Dibuja el atlas (mapa + índice de cafés), la ficha de cada café y el
// pedido, que se guarda en el navegador y se envía por WhatsApp.

const ROAST_SCALE = {
    'Claro': 1,
    'Medio claro': 2,
    'Medio': 3,
    'Medio oscuro': 4,
    'Oscuro': 5
};

const DEFAULT_COLOR = '#d9dee1';
const STORAGE_KEY = 'desantander.carrito.v1';
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea, [tabindex]:not([tabindex="-1"])';
const SVG_NS = 'http://www.w3.org/2000/svg';

// "Guanentá" → "guanenta", "Café San Gil" → "cafe-san-gil"
function slugify(text) {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Evita que un dato con < o & rompa el HTML que se inserta con innerHTML.
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// "573001129874" → "+57 300 112 9874"
function formatWhatsapp(digits) {
    const m = String(digits).match(/^(57)(\d{3})(\d{3})(\d{4})$/);
    return m ? `+${m[1]} ${m[2]} ${m[3]} ${m[4]}` : `+${digits}`;
}

// 6.637 → "6°38′"
function formatDegrees(value) {
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const min = Math.round((abs - deg) * 60);
    return min === 60 ? `${deg + 1}°00′` : `${deg}°${String(min).padStart(2, '0')}′`;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class CoffeeShop {
    constructor() {
        this.cafes = CAFES;
        this.provincias = PROVINCIAS;
        this.map = MAPA_SANTANDER;
        this.filters = { provincia: 'all' };
        this.currentSort = 'featured';
        this.filteredCafes = [...this.cafes];

        // Pedido: líneas { cafeId, gramos, molienda, qty } + datos de entrega.
        this.cart = [];
        this.delivery = { ciudad: '', pago: '' };
        this.sent = false;        // true tras pulsar "Finalizar compra"
        this.lastFocus = null;
        this.toastTimer = null;
        this.viewBox = [...this.map.viewBox];
        this.viewAnim = null;

        this.loadCart();
        this.init();
    }

    init() {
        this.readFiltersFromUrl();
        this.buildMap();
        this.renderLegend();
        this.renderStaticCopy();
        this.renderPagos();
        this.renderCart();
        this.setupEventListeners();
        this.update({ animate: false });
        document.getElementById('year').textContent = new Date().getFullYear();
    }

    // ---------- Utilidades ----------

    getProvincia(key) {
        return this.provincias[key] || { nombre: 'Santander', slug: slugify(String(key)), color: DEFAULT_COLOR, descripcion: '' };
    }

    // Provincias que tienen al menos un café, en el orden de PROVINCIAS.
    stockedProvinces() {
        return Object.keys(this.provincias).filter(k => this.cafes.some(c => c.provincia === k));
    }

    getCafe(id) {
        return this.cafes.find(c => c.id === id);
    }

    getPresentacion(cafe, gramos) {
        return cafe.presentaciones.find(p => p.gramos === gramos) || cafe.presentaciones[0];
    }

    // Precio más bajo del café (la presentación pequeña).
    basePrice(cafe) {
        return Math.min(...cafe.presentaciones.map(p => p.precio_cop));
    }

    formatPrice(price) {
        return `$${price.toLocaleString('es-CO')}`;
    }

    countLabel(n) {
        return `${n} ${n === 1 ? 'café' : 'cafés'}`;
    }

    bagsLabel(n) {
        return `${n} ${n === 1 ? 'bolsa' : 'bolsas'}`;
    }

    // Lista en español: "a, b y c"
    listLabel(items) {
        if (items.length <= 1) return items.join('');
        return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
    }

    // Textos de relleno en data.js que no deben verse en la tienda.
    isPlaceholder(text) {
        return !text || /por completar/i.test(text);
    }

    renderRoast(level) {
        const value = ROAST_SCALE[level] || 3;
        return `<span class="roast" aria-hidden="true">${
            [1, 2, 3, 4, 5].map(i => `<i class="${i <= value ? 'on' : ''}"></i>`).join('')
        }</span>`;
    }

    // Café disponible con mejor puntaje SCA.
    bestCafe() {
        const disponibles = this.cafes.filter(c => c.disponible);
        return disponibles.length ? [...disponibles].sort((a, b) => b.puntaje_cata - a.puntaje_cata)[0] : null;
    }

    municipioOf(cafe) {
        const key = slugify(cafe.municipio);
        return this.map.municipios.find(m => slugify(m.nombre) === key);
    }

    // ---------- URL ----------

    readFiltersFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('provincia');
        const key = Object.keys(this.provincias).find(k => this.getProvincia(k).slug === slug);
        if (key) this.filters.provincia = key;
    }

    writeFiltersToUrl() {
        const params = new URLSearchParams(window.location.search);
        params.delete('marca');
        if (this.filters.provincia === 'all') params.delete('provincia');
        else params.set('provincia', this.getProvincia(this.filters.provincia).slug);

        const query = params.toString();
        const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
        try {
            history.replaceState(null, '', url);
        } catch (e) {
            // Algunos navegadores no permiten cambiar la URL al abrir el archivo con file://
        }
    }

    // ---------- Textos que dependen de los datos ----------

    renderStaticCopy() {
        const stocked = this.stockedProvinces();
        document.getElementById('atlasSummary').textContent = this.cafes.length
            ? `${this.countLabel(this.cafes.length)} de especialidad de ${stocked.length === 1 ? 'la provincia' : `${stocked.length} provincias`} de Santander, de marca propia. Toca una provincia para ver sus cafés.`
            : 'Estamos preparando la próxima cosecha. Escríbenos por WhatsApp y te avisamos cuando haya café.';

        document.getElementById('howtoShipping').textContent =
            `Despachamos desde ${TIENDA.ciudad_despacho} a todo Colombia y te decimos el costo del envío por WhatsApp. Pagas con ${this.listLabel(TIENDA.pagos.map(p => p.toLowerCase()))}.`;
        document.getElementById('businessLink').href = `https://wa.me/${TIENDA.whatsapp}`;

        const link = document.getElementById('footerWhatsapp');
        link.href = `https://wa.me/${TIENDA.whatsapp}`;
        link.textContent = `WhatsApp ${formatWhatsapp(TIENDA.whatsapp)}`;
        document.getElementById('footerEnvio').textContent = TIENDA.envio;
        document.getElementById('footerPagos').textContent = TIENDA.pagos.join(' · ');
    }

    // ---------- Mapa ----------

    svg(tag, attrs = {}) {
        const el = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    }

    // Grados → coordenadas del mapa (misma proyección que tools/build_mapa.py).
    project(lon, lat) {
        const p = this.map.proyeccion;
        return [(lon - p.lon0) * p.cos * p.k + p.dx, -(lat - p.lat0) * p.k + p.dy];
    }

    // Dibuja el departamento en un <svg>. Devuelve los grupos por provincia.
    drawDepartment(svgEl, { interactive }) {
        const groups = {};
        const pendingHatch = interactive ? 'url(#hatch)' : null;
        Object.keys(this.provincias).forEach(key => {
            groups[key] = this.svg('g', { class: 'prov', 'data-provincia': key });
        });
        groups.__pending = this.svg('g', { class: 'prov prov--pending' });

        this.map.municipios.forEach(m => {
            const group = groups[m.provincia] || groups.__pending;
            const path = this.svg('path', { d: m.d, class: 'mpio', 'data-municipio': m.nombre });
            if (m.provincia) path.setAttribute('fill', this.getProvincia(m.provincia).color);
            const title = this.svg('title');
            title.textContent = m.provincia ? `${m.nombre} · Provincia ${m.provincia === 'Comunera' || m.provincia === 'Metropolitana' ? m.provincia : `de ${m.provincia}`}` : `${m.nombre} · provincia por verificar`;
            path.appendChild(title);
            group.appendChild(path);
        });
        Object.values(groups).forEach(g => svgEl.appendChild(g));

        if (pendingHatch) {
            const pending = this.map.municipios.filter(m => !m.provincia);
            pending.forEach(m => svgEl.appendChild(this.svg('path', { d: m.d, class: 'hatch', fill: pendingHatch })));
        }
        svgEl.appendChild(this.svg('path', { d: this.map.limitesProvincia, class: 'borders' }));
        svgEl.appendChild(this.svg('path', { d: this.map.contorno, class: 'outline' }));
        return groups;
    }

    buildMap() {
        const svgEl = document.getElementById('mapSvg');
        svgEl.setAttribute('viewBox', this.map.viewBox.join(' '));

        // Trama para municipios sin provincia confirmada (Tona).
        const defs = this.svg('defs');
        const pattern = this.svg('pattern', { id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
        pattern.appendChild(this.svg('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#96a3ad', 'stroke-width': 1.2 }));
        defs.appendChild(pattern);
        svgEl.appendChild(defs);

        // Gratícula cada medio grado
        const p = this.map.proyeccion;
        const [, , vw, vh] = this.map.viewBox;
        const lonMin = p.lon0 - (p.dx) / (p.cos * p.k);
        const lonMax = p.lon0 + (vw - p.dx) / (p.cos * p.k);
        const latMax = p.lat0 + p.dy / p.k;
        const latMin = p.lat0 - (vh - p.dy) / p.k;
        this.graticule = { lons: [], lats: [] };
        const grat = this.svg('g', { class: 'graticule' });
        for (let lon = Math.ceil(lonMin * 2) / 2; lon <= lonMax; lon += 0.5) {
            const x = this.project(lon, 0)[0];
            grat.appendChild(this.svg('line', { x1: x, y1: 0, x2: x, y2: vh }));
            this.graticule.lons.push(lon);
        }
        for (let lat = Math.ceil(latMin * 2) / 2; lat <= latMax; lat += 0.5) {
            const y = this.project(0, lat)[1];
            grat.appendChild(this.svg('line', { x1: 0, y1: y, x2: vw, y2: y }));
            this.graticule.lats.push(lat);
        }
        svgEl.appendChild(grat);

        this.mapGroups = this.drawDepartment(svgEl, { interactive: true });
        this.mapSvg = svgEl;

        // Provincias: con café se pueden elegir; sin café quedan atenuadas.
        const stocked = this.stockedProvinces();
        Object.keys(this.provincias).forEach(key => {
            const g = this.mapGroups[key];
            if (stocked.includes(key)) {
                g.classList.add('prov--active-able');
                g.addEventListener('click', () => this.setFilter('provincia', this.filters.provincia === key ? 'all' : key));
            } else {
                g.classList.add('prov--empty');
            }
        });

        // Municipios de origen de cada café, un poco más intensos.
        this.cafes.forEach(cafe => {
            const path = svgEl.querySelector(`[data-municipio="${CSS.escape((this.municipioOf(cafe) || {}).nombre || '')}"]`);
            if (path) path.classList.add('mpio--origin');
        });

        this.buildOverlay();
    }

    // Etiquetas de provincia, pines de café y marcas de gratícula en HTML,
    // para que el texto conserve su tamaño en cualquier encuadre.
    buildOverlay() {
        const overlay = document.getElementById('mapOverlay');
        overlay.innerHTML = '';
        this.overlayItems = [];
        const stocked = this.stockedProvinces();

        Object.entries(this.map.provincias).forEach(([key, prov]) => {
            const el = document.createElement('span');
            el.className = `map-label${stocked.includes(key) ? '' : ' map-label--soon'}`;
            el.textContent = key;
            el.setAttribute('aria-hidden', 'true');
            overlay.appendChild(el);
            this.overlayItems.push({ el, x: prov.c[0], y: prov.c[1], provincia: key, kind: 'label' });
        });

        this.graticule.lats.forEach(lat => {
            const el = document.createElement('span');
            el.className = 'map-tick';
            el.textContent = `${formatDegrees(lat)}N`;
            el.setAttribute('aria-hidden', 'true');
            overlay.appendChild(el);
            this.overlayItems.push({ el, kind: 'tick-lat', lat });
        });
        this.graticule.lons.forEach(lon => {
            const el = document.createElement('span');
            el.className = 'map-tick';
            el.textContent = `${formatDegrees(lon)}O`;
            el.setAttribute('aria-hidden', 'true');
            overlay.appendChild(el);
            this.overlayItems.push({ el, kind: 'tick-lon', lon });
        });

        const [, , vw] = this.map.viewBox;
        this.cafes.forEach(cafe => {
            const m = this.municipioOf(cafe);
            if (!m) return;
            const btn = document.createElement('button');
            btn.type = 'button';
            // Los pines del borde derecho llevan la etiqueta a la izquierda.
            btn.className = 'pin';
            if (m.c[0] > vw * 0.72) btn.dataset.side = 'left';
            btn.setAttribute('aria-label', `Ver ficha de ${cafe.nombre}, ${cafe.municipio}`);
            btn.innerHTML = `
                <span class="pin__dot" aria-hidden="true"></span>
                <span class="pin__text" aria-hidden="true">
                    <span class="pin__name">${escapeHtml(cafe.nombre.replace(/^Café\s+/i, ''))}</span>
                </span>`;
            btn.addEventListener('click', () => this.openModal(cafe));
            overlay.appendChild(btn);
            this.overlayItems.push({ el: btn, x: m.c[0], y: m.c[1], provincia: cafe.provincia, kind: 'pin' });
        });

        this.placeOverlay();
        if ('ResizeObserver' in window) {
            new ResizeObserver(() => this.placeOverlay()).observe(overlay);
        }
    }

    // Coloca etiquetas, pines y marcas de gratícula según el encuadre actual.
    // Las etiquetas de provincia se apartan de los pines y no salen del marco.
    placeOverlay() {
        const [vx, vy, vw, vh] = this.viewBox;
        const overlay = document.getElementById('mapOverlay');
        const width = overlay.clientWidth || 1;
        const height = overlay.clientHeight || 1;
        const toPx = (x, y) => [(x - vx) / vw * width, (y - vy) / vh * height];
        const filtered = this.filters.provincia !== 'all';
        const place = (el, x, y) => { el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`; };

        const boxes = [];
        const hits = box => boxes.some(b => box.x0 < b.x1 + 3 && box.x1 > b.x0 - 3 && box.y0 < b.y1 + 2 && box.y1 > b.y0 - 2);

        // Puntos de los pines: siempre visibles, reservan su lugar primero.
        const pins = this.overlayItems.filter(i => i.kind === 'pin');
        pins.forEach(item => {
            const [x, y] = toPx(item.x, item.y);
            item.px = [x, y];
            item.el.hidden = x < -4 || x > width + 4 || y < -4 || y > height + 4;
            if (!item.el.hidden) boxes.push({ x0: x - 9, x1: x + 9, y0: y - 9, y1: y + 9 });
        });

        // Nombres de los pines: a la derecha, a la izquierda o solo el punto.
        pins.forEach(item => {
            if (item.el.hidden) return;
            const [x, y] = item.px;
            const preferLeft = item.el.dataset.side === 'left';
            item.el.classList.remove('pin--compact');
            let placed = false;
            for (const side of preferLeft ? ['left', 'right'] : ['right', 'left']) {
                item.el.classList.toggle('pin--left', side === 'left');
                const w = item.el.offsetWidth;
                const h = item.el.offsetHeight;
                const left = side === 'left' ? x - w + 13 : x - 13;
                // La caja del texto empieza después del propio punto (que ya está reservado).
                const text = side === 'left'
                    ? { x0: left, x1: x - 14, y0: y - 8, y1: y + 8 }
                    : { x0: x + 14, x1: left + w, y0: y - 8, y1: y + 8 };
                if (text.x0 < 2 || text.x1 > width - 2 || hits(text)) continue;
                place(item.el, left, y - h / 2);
                boxes.push(text);
                placed = true;
                break;
            }
            if (!placed) {
                item.el.classList.remove('pin--left');
                item.el.classList.add('pin--compact');
                place(item.el, x - 13, y - item.el.offsetHeight / 2);
            }
        });

        this.overlayItems.forEach(item => {
            if (item.kind === 'tick-lat') {
                const y = toPx(0, this.project(0, item.lat)[1])[1];
                item.el.hidden = y < height * 0.04 || y > height * 0.9;
                place(item.el, 6, y - 9);
                return;
            }
            if (item.kind === 'tick-lon') {
                const x = toPx(this.project(item.lon, 0)[0], 0)[0];
                item.el.hidden = x < width * 0.06 || x > width * 0.86;
                place(item.el, x + 4, 4);
                return;
            }
            if (item.kind !== 'label') return;

            // Nombres de provincia: en su centro, o un poco más abajo o arriba; si no caben, se ocultan.
            const [cx, cy] = toPx(item.x, item.y);
            let dimmed = cx < 0 || cx > width || cy < 0 || cy > height || (filtered && item.provincia !== this.filters.provincia);
            item.el.classList.remove('is-dimmed');
            const w = item.el.offsetWidth;
            const h = item.el.offsetHeight;
            if (!dimmed) {
                const x = Math.min(Math.max(cx - w / 2, 4), width - w - 4);
                const spot = [0, 20, -20, 40, -40]
                    .map(dy => ({ x0: x, x1: x + w, y0: cy - h / 2 + dy, y1: cy + h / 2 + dy }))
                    .find(box => box.y0 > 2 && box.y1 < height - 2 && !hits(box));
                if (spot) {
                    place(item.el, spot.x0, spot.y0);
                    boxes.push(spot);
                } else {
                    dimmed = true;
                }
            }
            item.el.classList.toggle('is-dimmed', dimmed);
        });

        // Escala gráfica: kilómetros por unidad del mapa en el encuadre actual.
        const kmPerUnit = 111.32 / this.map.proyeccion.k;
        const pxPerUnit = width / vw;
        const target = 90 / (kmPerUnit * pxPerUnit);
        const steps = [5, 10, 20, 25, 50, 100];
        const km = steps.find(s => s >= target) || 100;
        const scale = document.getElementById('mapScale');
        scale.style.setProperty('--scale-w', `${Math.round(km / kmPerUnit * pxPerUnit)}px`);
        document.getElementById('mapScaleMid').textContent = km / 2;
        document.getElementById('mapScaleEnd').textContent = `${km} km`;
    }

    // Encuadre del mapa: departamento completo o una provincia con margen.
    targetViewBox() {
        const full = this.map.viewBox;
        if (this.filters.provincia === 'all') return [...full];
        const prov = this.map.provincias[this.filters.provincia];
        if (!prov) return [...full];
        const [x, y, w, h] = prov.bbox;
        const aspect = full[2] / full[3];
        let bw = w * 1.35;
        let bh = h * 1.35;
        if (bw / bh > aspect) bh = bw / aspect; else bw = bh * aspect;
        bw = Math.max(bw, full[2] * 0.4);
        bh = bw / aspect;
        return [x + w / 2 - bw / 2, y + h / 2 - bh / 2, bw, bh];
    }

    // Interacción firma: el mapa se acerca a la provincia elegida.
    zoomTo(target, animate) {
        cancelAnimationFrame(this.viewAnim);
        const apply = vb => {
            this.viewBox = vb;
            this.mapSvg.setAttribute('viewBox', vb.map(n => n.toFixed(2)).join(' '));
            this.placeOverlay();
        };
        if (!animate || prefersReducedMotion()) {
            apply(target);
            return;
        }
        const from = [...this.viewBox];
        const start = performance.now();
        const duration = 650;
        const ease = t => 1 - Math.pow(1 - t, 4);
        const step = now => {
            const t = Math.min(1, (now - start) / duration);
            const k = ease(t);
            apply(from.map((v, i) => v + (target[i] - v) * k));
            if (t < 1) this.viewAnim = requestAnimationFrame(step);
        };
        this.viewAnim = requestAnimationFrame(step);
    }

    syncMapSelection() {
        const selected = this.filters.provincia;
        this.mapSvg.classList.toggle('is-filtered', selected !== 'all');
        Object.entries(this.mapGroups).forEach(([key, g]) => g.classList.toggle('prov--selected', key === selected));
        document.getElementById('mapReset').hidden = selected === 'all';
    }

    // ---------- Leyenda (filtro por provincia) ----------

    renderLegend() {
        const list = document.getElementById('legendList');
        const stocked = this.stockedProvinces();
        list.innerHTML = '';

        const makeBtn = (key, label, count, color) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'legend-btn';
            btn.dataset.provincia = key;
            btn.innerHTML = `${color ? `<span class="swatch" style="--swatch:${color}"></span>` : ''}${escapeHtml(label)} <span class="legend-btn__count">${count}</span>`;
            btn.addEventListener('click', () => this.setFilter('provincia', key));
            list.appendChild(btn);
        };

        makeBtn('all', 'Todas', this.cafes.length, null);
        stocked.forEach(key => makeBtn(key, key, this.cafes.filter(c => c.provincia === key).length, this.getProvincia(key).color));

        const soon = Object.keys(this.provincias).filter(k => !stocked.includes(k));
        document.getElementById('legendSoon').textContent = soon.length
            ? `Próximamente: ${this.listLabel(soon)}.`
            : '';
    }

    setFilter(type, value) {
        this.filters[type] = value;
        this.update({ animate: true });
    }

    clearFilters() {
        this.filters = { provincia: 'all' };
        this.update({ animate: true });
    }

    setSort(sort) {
        this.currentSort = sort;
        this.update({ animate: false });
    }

    // Aplica filtro y orden, y sincroniza mapa, leyenda, índice y URL.
    update({ animate }) {
        const { provincia } = this.filters;
        const list = this.cafes.filter(c => provincia === 'all' || c.provincia === provincia);

        const sorters = {
            'featured': () => 0,
            'cupping': (a, b) => b.puntaje_cata - a.puntaje_cata,
            'price-asc': (a, b) => this.basePrice(a) - this.basePrice(b),
            'price-desc': (a, b) => this.basePrice(b) - this.basePrice(a),
            'altitude': (a, b) => b.altura_msnm - a.altura_msnm
        };
        this.filteredCafes = list.sort(sorters[this.currentSort] || sorters.featured);

        document.querySelectorAll('#legendList .legend-btn').forEach(btn => {
            btn.setAttribute('aria-pressed', btn.dataset.provincia === provincia);
        });

        this.syncMapSelection();
        this.zoomTo(this.targetViewBox(), animate);
        this.renderIndex();
        this.writeFiltersToUrl();
    }

    // ---------- Índice de cafés ----------

    resultsLabel(n) {
        const { provincia } = this.filters;
        if (provincia !== 'all') return `${this.countLabel(n)} en ${provincia}`;
        const provs = new Set(this.filteredCafes.map(c => c.provincia)).size;
        return `${this.countLabel(n)} · ${provs} ${provs === 1 ? 'provincia' : 'provincias'}`;
    }

    renderIndex() {
        const container = document.getElementById('indexList');
        const count = this.filteredCafes.length;
        container.innerHTML = '';
        document.getElementById('resultsCount').textContent = this.resultsLabel(count);

        if (count === 0) {
            const filtered = this.filters.provincia !== 'all';
            container.innerHTML = `
                <div class="empty-state">
                    <p class="empty-state__title">${filtered
                        ? `Todavía no tenemos cafés de ${escapeHtml(this.filters.provincia)}.`
                        : 'Estamos preparando la próxima cosecha.'}</p>
                    <p>${filtered ? 'Mira los cafés de las otras provincias.' : 'Escríbenos por WhatsApp y te avisamos cuando haya café disponible.'}</p>
                    ${filtered
                        ? '<button type="button" class="btn btn--ghost" id="clearFiltersBtn">Ver todos los cafés</button>'
                        : `<a class="btn btn--ghost" href="https://wa.me/${TIENDA.whatsapp}" target="_blank" rel="noopener">Escribir por WhatsApp</a>`}
                </div>`;
            const clearBtn = document.getElementById('clearFiltersBtn');
            if (clearBtn) clearBtn.addEventListener('click', () => this.clearFilters());
            return;
        }

        // Con un orden elegido, lista única ordenada; si no, agrupada por provincia.
        if (this.currentSort !== 'featured') {
            const flat = document.createElement('section');
            flat.className = 'index-group';
            flat.setAttribute('aria-label', 'Cafés ordenados');
            this.filteredCafes.forEach(cafe => flat.appendChild(this.createLot(cafe, { showProvince: true })));
            container.appendChild(flat);
            return;
        }

        // Agrupar por provincia, en el orden de PROVINCIAS.
        const keys = [...Object.keys(this.provincias), undefined];
        keys.forEach(key => {
            const cafes = this.filteredCafes.filter(c => key === undefined ? !this.provincias[c.provincia] : c.provincia === key);
            if (cafes.length === 0) return;
            const provincia = this.getProvincia(key);
            const group = document.createElement('section');
            group.className = 'index-group';
            group.setAttribute('aria-label', key ? provincia.nombre : 'Otros municipios');
            const minPrice = Math.min(...cafes.map(c => this.basePrice(c)));
            group.innerHTML = `
                <div class="index-group__head">
                    <span class="swatch" style="--swatch:${provincia.color}"></span>
                    <h3 class="index-group__name">${escapeHtml(key || 'Otros municipios')}</h3>
                    <span class="index-group__meta">${this.countLabel(cafes.length)} · desde ${this.formatPrice(minPrice)}</span>
                </div>
                ${key && !this.isPlaceholder(provincia.descripcion) ? `<p class="index-group__desc">${escapeHtml(provincia.descripcion)}</p>` : ''}`;
            cafes.forEach(cafe => group.appendChild(this.createLot(cafe)));
            container.appendChild(group);
        });
    }

    createLot(cafe, { showProvince = false } = {}) {
        const article = document.createElement('article');
        article.className = `lot${cafe.disponible ? '' : ' lot--soldout'}`;
        const sizes = cafe.presentaciones.map(p => `${p.gramos} g`).join(' · ');
        const seal = cafe.puntaje_cata >= 80
            ? `<span class="seal seal--sm lot__seal" role="img" aria-label="Puntaje SCA ${cafe.puntaje_cata}"><span class="seal__num">${cafe.puntaje_cata}</span><span class="seal__unit">pts<br>SCA</span></span>`
            : '';
        article.innerHTML = `
            ${seal}
            <div class="lot__info">
                <button type="button" class="lot__name view-btn" aria-label="Ver ficha de ${escapeHtml(cafe.nombre)}">
                    <span>${escapeHtml(cafe.nombre)}</span>
                </button>
                <p class="lot__meta">
                    <span>${showProvince ? `<i class="swatch swatch--inline" style="--swatch:${this.getProvincia(cafe.provincia).color}" aria-hidden="true"></i>` : ''}${escapeHtml(cafe.municipio)}${showProvince && this.provincias[cafe.provincia] ? `, ${escapeHtml(cafe.provincia)}` : ''}${cafe.finca ? `, finca ${escapeHtml(cafe.finca)}` : ''}</span>
                    <span>${cafe.altura_msnm.toLocaleString('es-CO')} m</span>
                    <span>${escapeHtml(cafe.variedad)}</span>
                    <span>${escapeHtml(cafe.proceso)}</span>
                </p>
                <p class="lot__notes"><em>${escapeHtml(this.listLabel(cafe.perfil_taza))}</em></p>
                <p class="lot__roast">Tueste ${escapeHtml(cafe.tueste.toLowerCase())}${this.renderRoast(cafe.tueste)}</p>
                ${this.bestCafe() && this.bestCafe().id === cafe.id ? '<p class="lot__best">Mejor puntaje SCA del catálogo</p>' : ''}
            </div>
            <div class="lot__buy">
                <p class="lot__price"><small>desde</small><strong>${this.formatPrice(this.basePrice(cafe))}</strong><small>${sizes}</small></p>
                <div class="lot__actions">
                    <button class="btn btn--ghost lot__detail" type="button">Ficha</button>
                    <button class="btn btn--primary add-btn" type="button" aria-label="${cafe.disponible ? `Agregar ${escapeHtml(cafe.nombre)}, ${cafe.presentaciones[0].gramos} g en grano entero, al pedido` : `${escapeHtml(cafe.nombre)} agotado`}" ${cafe.disponible ? '' : 'disabled'}>${cafe.disponible ? 'Agregar' : 'Agotado'}</button>
                </div>
            </div>`;
        article.querySelector('.lot__name').addEventListener('click', () => this.openModal(cafe));
        article.querySelector('.lot__detail').addEventListener('click', () => this.openModal(cafe));
        article.querySelector('.add-btn').addEventListener('click', () => this.addToCart(cafe));
        return article;
    }

    // ---------- Ficha ----------

    renderSeg(name, options, selected) {
        return `<div class="seg">${options.map(opt => `
            <label class="seg__opt">
                <input type="radio" name="${name}" value="${escapeHtml(opt.value)}" ${opt.value === selected ? 'checked' : ''}>
                <span class="seg__body">${escapeHtml(opt.label)}${opt.sub ? `<small>${escapeHtml(opt.sub)}</small>` : ''}</span>
            </label>`).join('')}</div>`;
    }

    // Minimapa de la ficha: el departamento con la provincia y el municipio del café.
    renderMiniMap(cafe) {
        const svgEl = this.svg('svg', { viewBox: this.map.viewBox.join(' '), 'aria-hidden': 'true' });
        this.drawDepartment(svgEl, { interactive: false });
        const prov = this.getProvincia(cafe.provincia);
        svgEl.querySelectorAll(`.prov[data-provincia="${CSS.escape(cafe.provincia)}"] .mpio`).forEach(p => p.setAttribute('style', `fill:${prov.color}`));
        svgEl.querySelectorAll('.prov:not([data-provincia="' + CSS.escape(cafe.provincia) + '"]) .mpio').forEach(p => p.removeAttribute('fill'));
        const m = this.municipioOf(cafe);
        if (m) {
            const origin = svgEl.querySelector(`[data-municipio="${CSS.escape(m.nombre)}"]`);
            if (origin) {
                origin.classList.add('mpio--origin');
                origin.setAttribute('style', `fill:color-mix(in oklab, ${prov.color} 70%, #24170f)`);
            }
            svgEl.appendChild(this.svg('circle', { cx: m.c[0], cy: m.c[1], r: 14, class: 'detail__map-dot' }));
        }
        return { svg: svgEl.outerHTML, municipio: m };
    }

    openModal(cafe) {
        const provincia = this.getProvincia(cafe.provincia);
        const modalBody = document.getElementById('modalBody');
        const mini = this.renderMiniMap(cafe);
        const coords = mini.municipio
            ? `${formatDegrees(mini.municipio.lonlat[1])} N · ${formatDegrees(mini.municipio.lonlat[0])} O`
            : '';

        const specs = [
            ['Municipio', cafe.municipio],
            ['Provincia', provincia.nombre],
            cafe.finca && ['Finca', cafe.finca],
            ['Altura del cultivo', `${cafe.altura_msnm.toLocaleString('es-CO')} m s. n. m.`],
            ['Variedad', cafe.variedad],
            ['Proceso', cafe.proceso],
            ['Tueste', `${escapeHtml(cafe.tueste)} ${this.renderRoast(cafe.tueste)}`, true]
        ].filter(Boolean);

        // La barra de puntaje va de 80 (mínimo de especialidad) a 100.
        const barWidth = Math.max(0, Math.min(100, (cafe.puntaje_cata - 80) * 5));
        const presentacionOpts = cafe.presentaciones.map(p => ({ value: String(p.gramos), label: `${p.gramos} g`, sub: this.formatPrice(p.precio_cop) }));
        const moliendaOpts = MOLIENDAS.map(m => ({ value: m, label: m }));

        modalBody.innerHTML = `
            <div class="detail">
                <div class="detail__map">
                    ${mini.svg}
                    <p class="detail__map-caption"><strong>${escapeHtml(cafe.municipio)}</strong>${escapeHtml(provincia.nombre)}${coords ? `<br>${coords}` : ''}</p>
                </div>
                <div class="detail__body">
                    <h2 id="modalTitle">${escapeHtml(cafe.nombre)}</h2>
                    <p class="detail__origin">${escapeHtml(cafe.municipio)} · ${escapeHtml(provincia.nombre)}</p>

                    <div class="modal-section">
                        <h3>Perfil de taza</h3>
                        <div class="tags">
                            ${cafe.perfil_taza.map(nota => `<span class="tag">${escapeHtml(nota)}</span>`).join('')}
                        </div>
                    </div>

                    <div class="modal-section">
                        <h3>Puntaje SCA</h3>
                        <div class="cupping">
                            <span class="seal seal--lg" role="img" aria-label="Puntaje SCA ${cafe.puntaje_cata} de 100"><span class="seal__num">${cafe.puntaje_cata}</span><span class="seal__unit">pts<br>SCA</span></span>
                            <div class="cupping__bar" aria-hidden="true"><span style="width: ${barWidth}%"></span></div>
                        </div>
                        <p class="cupping__hint">Puntaje de taza de la Specialty Coffee Association: de 80 en adelante es café de especialidad; desde 85, excelente.</p>
                    </div>

                    <div class="modal-section">
                        <h3>Ficha técnica</h3>
                        <div class="spec-table">
                            ${specs.map(([label, value, raw]) => `<div class="spec"><span>${escapeHtml(label)}</span><strong>${raw ? value : escapeHtml(value)}</strong></div>`).join('')}
                        </div>
                        <details class="glossary">
                            <summary>¿Qué significa cada dato?</summary>
                            <dl>
                                <div><dt>Altura</dt><dd>Metros sobre el nivel del mar donde crece el café. A más altura el grano madura más lento y la taza suele ser más dulce y compleja.</dd></div>
                                <div><dt>Variedad</dt><dd>El tipo de planta de café. Caturra, Castillo, Typica o Bourbon dan sabores distintos, como pasa con las variedades de uva en el vino.</dd></div>
                                <div><dt>Proceso</dt><dd>Cómo se separa el grano de la fruta. En el lavado se quita la pulpa con agua; da tazas limpias y de acidez brillante.</dd></div>
                                <div><dt>Tueste</dt><dd>Un tueste claro deja más acidez y notas frutales; uno oscuro da más cuerpo, amargor y notas de chocolate.</dd></div>
                            </dl>
                        </details>
                    </div>

                    <div class="modal-section">
                        <h3>Origen</h3>
                        <p>${escapeHtml(cafe.origen)} ${this.isPlaceholder(provincia.descripcion) ? '' : escapeHtml(provincia.descripcion)}</p>
                    </div>

                    <div class="modal-section">
                        <h3>Historia</h3>
                        <p>${escapeHtml(cafe.historia)}</p>
                    </div>

                    <form class="detail__buy" id="buyForm">
                        <div class="buy__groups">
                            <fieldset class="buy__group">
                                <legend>Tamaño</legend>
                                ${this.renderSeg('gramos', presentacionOpts, String(cafe.presentaciones[0].gramos))}
                            </fieldset>
                            <fieldset class="buy__group">
                                <legend>Molienda</legend>
                                ${this.renderSeg('molienda', moliendaOpts, MOLIENDAS[0])}
                            </fieldset>
                        </div>
                        <div class="detail__buy-row">
                            <p class="price"><span id="buyPrice"></span><small id="buyLabel"></small></p>
                            <button class="btn btn--primary add-to-cart-btn" type="submit" ${cafe.disponible ? '' : 'disabled'}>
                                ${cafe.disponible ? 'Agregar al pedido' : 'Agotado'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const form = modalBody.querySelector('#buyForm');
        const readChoice = () => ({
            gramos: Number(form.elements.gramos.value),
            molienda: form.elements.molienda.value
        });
        const refreshPrice = () => {
            const { gramos, molienda } = readChoice();
            const pres = this.getPresentacion(cafe, gramos);
            modalBody.querySelector('#buyPrice').textContent = this.formatPrice(pres.precio_cop);
            modalBody.querySelector('#buyLabel').textContent = `${pres.gramos} g · ${molienda}`;
        };
        form.addEventListener('change', refreshPrice);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const { gramos, molienda } = readChoice();
            this.addToCart(cafe, gramos, molienda);
            this.closeModal();
        });
        refreshPrice();

        this.lastFocus = document.activeElement;
        const modal = document.getElementById('brandModal');
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        this.setBackgroundInert(true, modal);
        modal.querySelector('.modal-content').scrollTop = 0;
        document.getElementById('closeModal').focus();
    }

    closeModal() {
        const modal = document.getElementById('brandModal');
        if (!modal.classList.contains('open')) return;

        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        this.setBackgroundInert(false);
        if (this.lastFocus) this.lastFocus.focus();
    }

    // ---------- Carrito: datos ----------

    lineKey(line) {
        return `${line.cafeId}|${line.gramos}|${line.molienda}`;
    }

    findLine(key) {
        return this.cart.find(l => this.lineKey(l) === key);
    }

    linePrice(line) {
        return this.getPresentacion(this.getCafe(line.cafeId), line.gramos).precio_cop * line.qty;
    }

    cartTotals() {
        const bags = this.cart.reduce((sum, l) => sum + l.qty, 0);
        const subtotal = this.cart.reduce((sum, l) => sum + this.linePrice(l), 0);
        return { bags, subtotal };
    }

    loadCart() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (!saved) return;
            // Solo se recuperan líneas cuyo café y presentación siguen existiendo y disponibles.
            this.cart = (saved.lines || [])
                .filter(l => {
                    const cafe = this.getCafe(l.cafeId);
                    return cafe && cafe.disponible &&
                        cafe.presentaciones.some(p => p.gramos === l.gramos) &&
                        MOLIENDAS.includes(l.molienda) &&
                        Number.isInteger(l.qty) && l.qty > 0;
                })
                .map(l => ({ ...l, qty: Math.min(l.qty, MAX_CANTIDAD) }));
            this.delivery = {
                ciudad: typeof saved.ciudad === 'string' ? saved.ciudad.slice(0, 60) : '',
                pago: TIENDA.pagos.includes(saved.pago) ? saved.pago : ''
            };
            this.sent = Boolean(saved.sent) && this.cart.length > 0;
        } catch (e) {
            this.cart = [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                lines: this.cart,
                ciudad: this.delivery.ciudad,
                pago: this.delivery.pago,
                sent: this.sent
            }));
        } catch (e) {
            // Modo privado o almacenamiento lleno: el carrito sigue funcionando en memoria.
        }
    }

    addToCart(cafe, gramos = cafe.presentaciones[0].gramos, molienda = MOLIENDAS[0]) {
        if (!cafe.disponible) return;

        const line = { cafeId: cafe.id, gramos, molienda, qty: 1 };
        const existing = this.findLine(this.lineKey(line));
        if (existing) {
            if (existing.qty >= MAX_CANTIDAD) {
                this.showToast(`Puedes pedir hasta ${MAX_CANTIDAD} bolsas de cada café aquí. Para más, escríbenos por WhatsApp.`);
                return;
            }
            existing.qty += 1;
        } else {
            this.cart.push(line);
        }

        this.sent = false;
        this.saveCart();
        this.renderCart();
        this.showToast(`Agregaste ${cafe.nombre}: ${gramos} g, ${molienda.toLowerCase()}. Puedes cambiarlo en tu pedido.`, { label: 'Ver pedido', onClick: () => this.openCart() });

        // Animación de feedback
        const cartCount = document.getElementById('cartCount');
        cartCount.classList.remove('bump');
        void cartCount.offsetWidth;
        cartCount.classList.add('bump');
    }

    changeQty(key, delta) {
        const line = this.findLine(key);
        if (!line) return;

        if (line.qty + delta <= 0) {
            this.removeLine(key);
            return;
        }
        line.qty = Math.min(line.qty + delta, MAX_CANTIDAD);
        this.sent = false;
        this.saveCart();
        this.renderCart();
    }

    removeLine(key) {
        const index = this.cart.findIndex(l => this.lineKey(l) === key);
        if (index === -1) return;

        const [removed] = this.cart.splice(index, 1);
        this.sent = false;
        this.saveCart();
        this.renderCart();
        this.showToast(`${this.getCafe(removed.cafeId).nombre} quitado del pedido`, {
            label: 'Deshacer',
            onClick: () => {
                this.cart.splice(Math.min(index, this.cart.length), 0, removed);
                this.saveCart();
                this.renderCart();
            }
        });
    }

    // Cambia tamaño o molienda de una línea; si ya existe una igual, las une.
    updateLine(key, changes) {
        const line = this.findLine(key);
        if (!line) return;

        const updated = { ...line, ...changes };
        const target = this.findLine(this.lineKey(updated));
        if (target && target !== line) {
            target.qty = Math.min(target.qty + line.qty, MAX_CANTIDAD);
            this.cart = this.cart.filter(l => l !== line);
        } else {
            Object.assign(line, changes);
        }
        this.sent = false;
        this.saveCart();
        this.renderCart();
    }

    clearCart() {
        const previous = { cart: this.cart, sent: this.sent };
        this.cart = [];
        this.sent = false;
        this.saveCart();
        this.renderCart();
        this.showToast('Vaciaste el pedido.', {
            label: 'Deshacer',
            onClick: () => {
                this.cart = previous.cart;
                this.sent = previous.sent;
                this.saveCart();
                this.renderCart();
            }
        });
    }

    setDelivery(changes) {
        Object.assign(this.delivery, changes);
        this.saveCart();
        this.renderCheckoutLink();
    }

    // ---------- Carrito: interfaz ----------

    renderPagos() {
        const container = document.getElementById('cartPagos');
        container.innerHTML = TIENDA.pagos.map(pago => `
            <label class="seg__opt">
                <input type="radio" name="pago" value="${escapeHtml(pago)}" ${pago === this.delivery.pago ? 'checked' : ''}>
                <span class="seg__body">${escapeHtml(pago)}</span>
            </label>`).join('');
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => this.setDelivery({ pago: input.value }));
        });
        document.getElementById('cartCiudad').value = this.delivery.ciudad;
    }

    renderCart() {
        const list = document.getElementById('cartItems');
        const { bags, subtotal } = this.cartTotals();
        const empty = this.cart.length === 0;

        const cartCount = document.getElementById('cartCount');
        cartCount.textContent = bags;
        cartCount.hidden = bags === 0;
        document.getElementById('cartBtn').setAttribute('aria-label', bags ? `Abrir pedido, ${this.bagsLabel(bags)}` : 'Abrir pedido');

        document.getElementById('cartTotal').textContent = this.formatPrice(subtotal);
        document.getElementById('cartBags').textContent = bags ? `· ${this.bagsLabel(bags)}` : '';
        document.getElementById('cartShipping').textContent = `Se confirma por WhatsApp · desde ${TIENDA.ciudad_despacho}`;
        document.getElementById('cartFootNote').textContent = empty
            ? 'Agrega un café para armar tu pedido.'
            : this.sent
                ? 'Tu pedido se hace cuando lo envías en WhatsApp.'
                : 'Se abre WhatsApp con tu pedido ya escrito; solo tienes que enviarlo.';

        document.getElementById('cartOptions').hidden = empty || this.sent;
        document.getElementById('cartSent').hidden = !this.sent;

        if (empty) {
            list.innerHTML = `<li class="drawer__empty">
                <p>Tu pedido está vacío.</p>
                <button type="button" class="btn btn--ghost" id="emptyCartBrowse">Ver los cafés</button>
            </li>`;
            document.getElementById('emptyCartBrowse').addEventListener('click', () => {
                this.closeCart();
                document.getElementById('indice').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            });
        } else {
            list.innerHTML = '';
            this.cart.forEach(line => list.appendChild(this.createCartItem(line)));
        }

        if (this.sent) this.renderSentPanel();
        this.renderCheckoutLink();
        this.renderOrderBar();
    }

    // Barra inferior en celular con el resumen del pedido.
    renderOrderBar() {
        const { bags, subtotal } = this.cartTotals();
        const drawerOpen = document.getElementById('cartDrawer').classList.contains('open');
        document.getElementById('orderBar').hidden = bags === 0 || drawerOpen;
        document.getElementById('orderBarBags').textContent = `Tu pedido · ${this.bagsLabel(bags)}`;
        document.getElementById('orderBarTotal').textContent = this.formatPrice(subtotal);
    }

    createCartItem(line) {
        const cafe = this.getCafe(line.cafeId);
        const key = this.lineKey(line);
        const pres = this.getPresentacion(cafe, line.gramos);
        const li = document.createElement('li');
        li.className = 'cart-item';
        li.innerHTML = `
            <div>
                <div class="cart-item__top">
                    <div class="cart-item__title">
                        <span class="swatch" style="--swatch:${this.getProvincia(cafe.provincia).color}" aria-hidden="true"></span>
                        <div>
                            <p class="cart-item__name">${escapeHtml(cafe.nombre)}</p>
                            <p class="cart-item__meta">${escapeHtml(cafe.municipio)} · ${this.formatPrice(pres.precio_cop)} c/u</p>
                        </div>
                    </div>
                    <button type="button" class="cart-item__remove" aria-label="Quitar ${escapeHtml(cafe.nombre)} ${line.gramos} g ${escapeHtml(line.molienda)} del pedido">
                        <svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>
                    </button>
                </div>
                <div class="cart-item__opts">
                    <select aria-label="Tamaño" data-field="gramos">
                        ${cafe.presentaciones.map(p => `<option value="${p.gramos}" ${p.gramos === line.gramos ? 'selected' : ''}>${p.gramos} g · ${this.formatPrice(p.precio_cop)}</option>`).join('')}
                    </select>
                    <select aria-label="Molienda" data-field="molienda">
                        ${MOLIENDAS.map(m => `<option value="${escapeHtml(m)}" ${m === line.molienda ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('')}
                    </select>
                </div>
                <div class="cart-item__bottom">
                    <div class="qty" role="group" aria-label="Cantidad">
                        <button type="button" data-delta="-1" aria-label="${line.qty === 1 ? 'Quitar' : 'Una bolsa menos'}">−</button>
                        <span aria-live="polite">${line.qty}</span>
                        <button type="button" data-delta="1" aria-label="Una bolsa más" ${line.qty >= MAX_CANTIDAD ? 'disabled' : ''}>+</button>
                    </div>
                    <p class="cart-item__price">${this.formatPrice(this.linePrice(line))}<small>${this.bagsLabel(line.qty)} de ${line.gramos} g</small></p>
                </div>
            </div>
        `;
        li.querySelectorAll('[data-delta]').forEach(btn => {
            btn.addEventListener('click', () => this.changeQty(key, Number(btn.dataset.delta)));
        });
        li.querySelector('.cart-item__remove').addEventListener('click', () => this.removeLine(key));
        li.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', () => {
                const field = select.dataset.field;
                this.updateLine(key, { [field]: field === 'gramos' ? Number(select.value) : select.value });
            });
        });
        return li;
    }

    whatsappUrl() {
        return `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(this.buildOrderMessage())}`;
    }

    renderCheckoutLink() {
        const link = document.getElementById('checkoutBtn');
        const empty = this.cart.length === 0;
        link.setAttribute('aria-disabled', empty);
        link.tabIndex = empty ? -1 : 0;
        link.href = empty ? '#' : this.whatsappUrl();
    }

    renderSentPanel() {
        const url = this.whatsappUrl();
        document.getElementById('sentMessage').textContent = this.buildOrderMessage();
        document.getElementById('reopenWhatsapp').href = url;
        const phone = document.getElementById('sentPhone');
        phone.href = `https://wa.me/${TIENDA.whatsapp}`;
        phone.textContent = formatWhatsapp(TIENDA.whatsapp);
    }

    // Resumen del pedido en texto plano para enviarlo por WhatsApp.
    buildOrderMessage() {
        const lines = this.cart.map(line => {
            const cafe = this.getCafe(line.cafeId);
            return `• ${line.qty} × ${cafe.nombre} · ${line.gramos} g · ${line.molienda}: ${this.formatPrice(this.linePrice(line))}`;
        });
        const { bags, subtotal } = this.cartTotals();
        const ciudad = this.delivery.ciudad.trim();

        return [
            `¡Hola, ${TIENDA.nombre}! Quiero hacer este pedido:`,
            '',
            ...lines,
            '',
            `*Subtotal: ${this.formatPrice(subtotal)}* (${this.bagsLabel(bags)})`,
            `Envío: por confirmar, despacho desde ${TIENDA.ciudad_despacho}`,
            `Ciudad de entrega: ${ciudad || 'por confirmar'}`,
            `Pago: ${this.delivery.pago || 'por confirmar'}`,
            '',
            '¿Me confirman el costo del envío y el tiempo de entrega? Gracias.'
        ].join('\n');
    }

    // El botón es un enlace real a wa.me (sin ventanas emergentes que bloquear);
    // aquí solo se registra el envío y se muestra el panel de confirmación.
    checkout() {
        if (this.cart.length === 0) return;
        this.sent = true;
        this.saveCart();
        this.renderCart();
        document.getElementById('cartSent').scrollIntoView({ block: 'start' });
        document.getElementById('copyMessageBtn').focus({ preventScroll: true });
    }

    async copyMessage() {
        const text = this.buildOrderMessage();
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Mensaje copiado. Pégalo en WhatsApp.');
        } catch (e) {
            // Sin permiso de portapapeles: se selecciona el texto para copiarlo a mano.
            const pre = document.getElementById('sentMessage');
            const range = document.createRange();
            range.selectNodeContents(pre);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            this.showToast('Selecciona y copia el mensaje con Ctrl+C o manteniéndolo pulsado.');
        }
    }

    openCart() {
        this.closeModal();
        this.lastFocus = document.activeElement;
        document.getElementById('cartOverlay').hidden = false;
        const drawer = document.getElementById('cartDrawer');
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        this.setBackgroundInert(true, drawer);
        this.renderOrderBar();
        document.getElementById('closeCart').focus();
    }

    closeCart() {
        const drawer = document.getElementById('cartDrawer');
        if (!drawer.classList.contains('open')) return;

        document.getElementById('cartOverlay').hidden = true;
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        this.setBackgroundInert(false);
        this.renderOrderBar();
        if (this.lastFocus) this.lastFocus.focus();
    }

    // Mientras un panel está abierto, el resto de la página no recibe foco ni lectura.
    setBackgroundInert(active, except) {
        const regions = ['#siteHeader', 'main', '.site-footer', '#orderBar', '#brandModal', '#cartDrawer']
            .map(sel => document.querySelector(sel));
        regions.forEach(el => {
            if (!el) return;
            if (active && el !== except) el.setAttribute('inert', '');
            else el.removeAttribute('inert');
        });
    }

    // Mantiene el Tab dentro del panel abierto.
    trapFocus(e, container) {
        if (e.key !== 'Tab') return;
        const focusables = [...container.querySelectorAll(FOCUSABLE)]
            .filter(el => el.offsetParent !== null && el.getAttribute('aria-disabled') !== 'true');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    showToast(message, action) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        if (action) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'toast__action';
            btn.textContent = action.label;
            btn.addEventListener('click', () => {
                toast.classList.remove('show');
                action.onClick();
            });
            toast.appendChild(btn);
        }
        toast.classList.add('show');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => toast.classList.remove('show'), action ? 5000 : 2600);
    }


    // ---------- Eventos ----------

    setupEventListeners() {
        // Orden y mapa
        document.getElementById('sortSelect').addEventListener('change', (e) => this.setSort(e.target.value));
        document.getElementById('mapReset').addEventListener('click', () => this.setFilter('provincia', 'all'));

        // Ficha: botón de cerrar y clic en el fondo
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('brandModal').addEventListener('click', (e) => {
            if (e.target.id === 'brandModal') this.closeModal();
        });

        // Pedido
        document.getElementById('cartBtn').addEventListener('click', () => this.openCart());
        document.getElementById('orderBarBtn').addEventListener('click', () => this.openCart());
        document.getElementById('closeCart').addEventListener('click', () => this.closeCart());
        document.getElementById('cartOverlay').addEventListener('click', () => this.closeCart());
        document.getElementById('checkoutBtn').addEventListener('click', (e) => {
            if (this.cart.length === 0) {
                e.preventDefault();
                return;
            }
            this.checkout();
        });
        document.getElementById('cartCiudad').addEventListener('input', (e) => this.setDelivery({ ciudad: e.target.value }));
        document.getElementById('copyMessageBtn').addEventListener('click', () => this.copyMessage());
        document.getElementById('editOrderBtn').addEventListener('click', () => {
            this.sent = false;
            this.saveCart();
            this.renderCart();
        });
        document.getElementById('clearCartBtn').addEventListener('click', () => this.clearCart());

        // Teclado: Escape cierra lo abierto; Tab se queda dentro del panel abierto
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeCart();
                return;
            }
            const modal = document.getElementById('brandModal');
            const drawer = document.getElementById('cartDrawer');
            if (drawer.classList.contains('open')) this.trapFocus(e, drawer);
            else if (modal.classList.contains('open')) this.trapFocus(e, modal.querySelector('.modal-content'));
        });

        // Si el pedido cambia en otra pestaña, se refleja aquí.
        window.addEventListener('storage', (e) => {
            if (e.key !== STORAGE_KEY) return;
            this.loadCart();
            this.renderPagos();
            this.renderCart();
        });
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.shop = new CoffeeShop();
});
