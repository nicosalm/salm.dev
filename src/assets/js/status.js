(function() {
    var API = 'https://status.salm.dev';
    var services = document.getElementById('status-services');
    var incidentsBox = document.getElementById('status-incidents');
    var coding = document.getElementById('status-coding');
    var analytics = document.getElementById('status-analytics');

    var SPINNER_FRAMES = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
    var spinTimer = null;

    startSpinner();
    fetch(API)
        .then(function(res) {
            if (!res.ok) throw new Error(res.status);
            return res.json();
        })
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
        renderIncidents(data.incidents);
        renderStats(data.stats || {});
        renderCoding(data);
    }

    // A uniform row: label · dotted leader · value, matching the Domains list.
    function statRow(labelHtml, valueHtml, className) {
        return '<div class="stat-row' + (className ? ' ' + className : '') + '">' +
            '<span class="stat-label">' + labelHtml + '</span>' +
            '<span class="dot-leader"></span>' +
            '<span class="stat-value">' + valueHtml + '</span>' +
            '</div>';
    }

    function section(rows) {
        if (!rows) return note('unavailable');
        if (!rows.length) return note('none');
        return '<div class="status-section">' + rows.join('') + '</div>';
    }

    function boxHead(title, noteHtml) {
        return '<div class="status-box-head"><h2>' + title + '</h2>' +
            (noteHtml ? '<small class="section-note">' + noteHtml + '</small>' : '') + '</div>';
    }

    function note(text) {
        return '<p class="text-muted text-small">' + text + '</p>';
    }

    function hostLabel(url) {
        return String(url).replace(/^https?:\/\//, '').replace(/\/$/, '');
    }

    function renderServices(checks) {
        var checked = '';
        if (checks.length) {
            var at = Date.parse(checks[0].last_check_at);
            checked = '(last checked <code>' + (isNaN(at) ? esc(checks[0].last_check_at) : formatDuration((Date.now() - at) / 1000) + ' ago') + '</code>)';
        }
        var rows = checks.length ? checks.map(serviceRow) : null;
        services.innerHTML = boxHead('Services', checked) + section(rows);
    }

    function renderIncidents(incidents) {
        incidentsBox.innerHTML = boxHead('Recent incidents') + section(incidents ? incidents.map(incidentRow) : null);
    }

    function serviceRow(c) {
        var up = !c.down;
        var dot = '<span class="status-dot ' + (up ? 'up' : 'down') + '" title="' + (up ? 'up' : 'down') + '"></span>';
        var name = '<a href="' + esc(c.url) + '" target="_blank">' + esc(c.alias || hostLabel(c.url)) + '</a>';
        var days = c.domain && c.domain.remaining_days != null ? ' <span class="dim">· ' + c.domain.remaining_days + 'd</span>' : '';
        var uptime = c.uptime != null ? c.uptime.toFixed(2) + '%' : '-';
        var down = '';
        if (!up) {
            var since = c.down_since ? ' ' + formatDuration((Date.now() - Date.parse(c.down_since)) / 1000) : '';
            var error = c.error ? ' · ' + esc(c.error) : '';
            down = '<span class="dim">down' + since + error + ' · </span>';
        }
        return statRow(dot + name, down + uptime + days);
    }

    function incidentRow(d) {
        var length = d.ended_at ? formatDuration(d.duration) : 'ongoing';
        var error = d.error ? ' <span class="dim">· ' + esc(d.error) + '</span>' : '';
        return statRow('<code>' + esc(String(d.started_at).slice(0, 10)) + '</code> ' + esc(hostLabel(d.check)), length + error, 'stat-row-wrap');
    }

    function renderStats(s) {
        var rb = s.analytics || {};
        var cf = s.cloudflare;
        var served = '-';
        var cached = '';
        if (cf) {
            var bytes = cf.bytes || 0;
            var pctCached = bytes > 0 ? ((cf.cachedBytes || 0) / bytes * 100) : 0;
            served = formatBytes(bytes);
            cached = pctCached.toFixed(0) + '% cached';
        }

        function allTime(n) {
            return n ? formatNumber(n) + ' all time' : '';
        }

        analytics.innerHTML = boxHead('Site', '(in the last 7 days)') +
            '<div class="stat-tiles">' +
            statTile('Users', formatNumber(rb.users), allTime(rb.allUsers)) +
            statTile('Pageviews', formatNumber(rb.pageviews), allTime(rb.allPageviews)) +
            statTile('Served', served, cached) +
            '</div>';
    }

    function statTile(label, value, sub) {
        return '<div class="stat-tile">' +
            '<span class="stat-tile-label">' + label + '</span>' +
            '<span class="stat-value">' + value + '</span>' +
            (sub ? '<span class="stat-tile-sub">' + sub + '</span>' : '') +
            '</div>';
    }

    function renderCoding(data) {
        var languages = data.languages && data.languages
            .filter(function(l) { return l.name !== 'Other' && l.decimal >= 0.5; })
            .map(function(l) { return statRow(esc(l.name), l.decimal + 'h'); });
        var editors = data.editors && data.editors
            .map(function(e) { return statRow(esc(e.name), e.percent + '%'); });

        var hours = '';
        if (data.activity) {
            var seconds = data.activity.reduce(function(acc, cur) { return acc + (cur.grand_total ? cur.grand_total.total_seconds : 0); }, 0);
            hours = '(<code>' + (seconds / 3600).toFixed(2) + 'h</code> in the last 7 days)';
        }

        coding.innerHTML = boxHead('Coding', hours) +
            '<div class="status-columns">' +
            '<div><h3>Languages</h3>' + section(languages) + '</div>' +
            '<div><h3>Editors</h3>' + section(editors) + '</div>' +
            '</div>';
    }

    function formatNumber(n) {
        if (n == null) return '-';
        n = Number(n);
        if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
        return String(n);
    }

    function formatDuration(seconds) {
        if (seconds == null || isNaN(seconds)) return '-';
        seconds = Math.max(0, seconds);
        if (seconds < 60) return Math.round(seconds) + 's';
        if (seconds < 3600) return Math.round(seconds / 60) + 'm';
        if (seconds < 86400) return Math.round(seconds / 3600) + 'h';
        return Math.round(seconds / 86400) + 'd';
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
