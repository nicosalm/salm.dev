(function() {
    var API = 'https://status.salm.dev';
    var services = document.getElementById('status-services');
    var coding = document.getElementById('status-coding');
    var analytics = document.getElementById('status-analytics');

    var SPINNER_FRAMES = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
    var spinTimer = null;

    startSpinner();
    fetch(API)
        .then(function(res) { return res.json(); })
        .then(function(data) { stopSpinner(); render(data); })
        .catch(function() {
            stopSpinner();
            services.innerHTML = '<p>Failed to load status data.</p>';
        });

    function startSpinner() {
        services.innerHTML = '<p class="status-loading text-muted text-small"><span class="spinner" aria-hidden="true">' + SPINNER_FRAMES[0] + '</span> loading</p>';
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var el = services.querySelector('.spinner');
        var i = 0;
        spinTimer = setInterval(function() {
            i = (i + 1) % SPINNER_FRAMES.length;
            el.textContent = SPINNER_FRAMES[i];
        }, 80);
    }

    function stopSpinner() {
        if (spinTimer) { clearInterval(spinTimer); spinTimer = null; }
    }

    function render(data) {
        renderServices(data.checks || []);
        if (data.stats) renderStats(data.stats);
        renderCoding(data);
    }

    // A uniform row: label · meter (or a dotted leader) · value. The middle
    // column is always present so every row's label and value align on the grid.
    function statRow(labelHtml, meterHtml, valueHtml) {
        return '<div class="stat-row">' +
            '<span class="stat-label">' + labelHtml + '</span>' +
            (meterHtml || '<span class="dot-leader"></span>') +
            '<span class="stat-value">' + valueHtml + '</span>' +
            '</div>';
    }

    function meter(pct) {
        var w = Math.max(0, Math.min(100, pct));
        return '<span class="meter"><span class="meter-fill" style="width:' + w.toFixed(1) + '%"></span></span>';
    }

    function renderServices(checks) {
        var checked = checks.length ? '<small class="section-note">last checked <code>' + esc(checks[0].last_check_at) + '</code></small>' : '';
        var html = '<h2>Services</h2>' + checked + '<div class="status-section">';
        checks.forEach(function(c) {
            var up = !c.down;
            var mark = '<span class="status-mark ' + (up ? 'up' : 'down') + '">' + (up ? 'up' : 'down') + '</span>';
            var name = '<a href="' + esc(c.url) + '" target="_blank">' + esc(c.alias || c.url) + '</a>';
            var days = c.domain && c.domain.remaining_days != null ? ' <span class="dim">· ' + c.domain.remaining_days + 'd</span>' : '';
            var value = (up ? '' : '<span class="dim">down · </span>') + c.uptime.toFixed(2) + '%' + days;
            html += statRow(mark + name, meter(c.uptime), value);
        });
        html += '</div>';
        services.innerHTML = html;
    }

    function renderStats(s) {
        var rb = s.analytics || {};
        var cf = s.cloudflare || {};
        var bytes = cf.bytes || 0;
        var cachedBytes = cf.cachedBytes || 0;
        var pctCached = bytes > 0 ? (cachedBytes / bytes * 100) : 0;

        function withAllTime(v, all) {
            var out = formatNumber(v);
            if (all) out += ' <span class="dim">(' + formatNumber(all) + ')</span>';
            return out;
        }

        var html = '<h2>Site</h2><small class="section-note">in the last 7 days</small>';
        html += '<div class="status-section">';
        html += statRow('Users', '', withAllTime(rb.users, rb.allUsers));
        html += statRow('Pageviews', '', withAllTime(rb.pageviews, rb.allPageviews));
        html += statRow('Served/Cached', bytes > 0 ? meter(pctCached) : '', formatBytes(bytes) + ' / ' + formatBytes(cachedBytes) + ' <span class="dim">· ' + pctCached.toFixed(0) + '%</span>');
        html += '</div>';
        analytics.innerHTML = html;
    }

    function renderCoding(data) {
        var languages = data.languages.filter(function(l) { return l.name !== 'Other' && l.decimal >= 0.5; });
        var seconds = data.activity.reduce(function(acc, cur) { return acc + cur.grand_total.total_seconds; }, 0);
        var hours = (seconds / 3600).toFixed(2);
        var maxDecimal = languages.reduce(function(m, l) { return Math.max(m, l.decimal); }, 0) || 1;

        var html = '<h2>Coding</h2><small class="section-note"><code>' + hours + 'h</code> in the last 7 days</small>';

        html += '<h3>Languages</h3><div class="status-section">';
        languages.forEach(function(l) {
            html += statRow(esc(l.name), meter(l.decimal / maxDecimal * 100), l.decimal + 'h');
        });
        html += '</div>';

        html += '<h3>Editors</h3><div class="status-section">';
        data.editors.forEach(function(e) {
            html += statRow(esc(e.name), meter(e.percent), e.percent + '%');
        });
        html += '</div>';

        coding.innerHTML = html;
    }

    function formatNumber(n) {
        if (n == null) return '-';
        n = Number(n);
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
        return String(n);
    }

    function formatBytes(n) {
        if (!n) return '0 B';
        var units = ['B', 'KB', 'MB', 'GB', 'TB'];
        var i = Math.floor(Math.log(n) / Math.log(1024));
        i = Math.min(i, units.length - 1);
        var val = n / Math.pow(1024, i);
        return (i === 0 ? val : val.toFixed(2)) + ' ' + units[i];
    }

    function esc(s) {
        if (!s) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML;
    }
})();
