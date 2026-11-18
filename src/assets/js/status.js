(function() {
    var API = 'https://status.salm.dev';
    var services = document.getElementById('status-services');
    var renews = document.getElementById('salm-dev-renews');
    var incidentsPanel = document.getElementById('status-incidents');
    var analytics = document.getElementById('status-analytics');

    var SEP = ' <span class="meta-sep" aria-hidden="true"></span> ';
    var regions = window.Intl && Intl.DisplayNames ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;
    var lastCheckAt = null;

    load(true);
    setInterval(function() { if (!document.hidden) load(false); }, 60000);
    setInterval(tickChecked, 1000);
    new ResizeObserver(tipTruncated).observe(document.querySelector('.panel-grid'));
    document.fonts.ready.then(tipTruncated);

    function load(first) {
        fetch(API)
            .then(function(res) {
                if (!res.ok) throw new Error(res.status);
                return res.json();
            })
            .then(render)
            .catch(function() {
                if (!first) return;
                services.innerHTML = '<p>Failed to load status data.</p>';
            });
    }

    function render(data) {
        var checks = data.checks || [];
        renderServices(checks);
        renderIncidents(data.incidents);
        renderStats(data.stats || {});
        tipTruncated();
        if (checks.length) document.body.dataset.status = checks.some(function(c) { return c.down; }) ? 'down' : 'up';
    }

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
        return '<div class="panel-rows">' + rows.join('') + '</div>';
    }

    function panelHead(title, noteHtml) {
        return '<div class="panel-head"><h2>' + title + '</h2>' +
            (noteHtml ? '<small class="section-note">' + noteHtml + '</small>' : '') + '</div>';
    }

    function note(text) {
        return '<p class="text-muted text-small">' + text + '</p>';
    }

    function hostLabel(url) {
        return String(url).replace(/^https?:\/\//, '').replace(/\/$/, '');
    }

    function renderServices(checks) {
        var times = checks.map(function(c) { return Date.parse(c.last_check_at); }).filter(function(t) { return !isNaN(t); });
        lastCheckAt = times.length ? Math.min.apply(null, times) : null;
        var checked = lastCheckAt ? ', checked <span class="checked-ago">' + since(lastCheckAt) + '</span> ago' : '';
        var rows = checks.length ? checks.map(serviceRow) : null;
        services.innerHTML = panelHead('Services', checks.length ? '(last 30 days' + checked + ')' : '') + section(rows);
        renderRenewal(checks);
    }

    function renderRenewal(checks) {
        var site = checks.filter(function(c) { return hostLabel(c.url) === 'salm.dev'; })[0];
        var days = site && site.domain ? site.domain.remaining_days : null;
        if (!renews || days == null) return;
        renews.textContent = days > 0 ? 'renews in ' + days + 'd' : 'expired';
        renews.className = days > 0 ? 'domain-active' : 'domain-expired';
    }

    function since(at) {
        return formatDuration((Date.now() - at) / 1000);
    }

    function tickChecked() {
        var el = lastCheckAt && services.querySelector('.checked-ago');
        if (el) el.textContent = since(lastCheckAt);
    }

    function renderIncidents(incidents) {
        incidentsPanel.innerHTML = panelHead('Downtime') + section(incidents ? incidents.map(incidentRow) : null);
    }

    function serviceRow(c) {
        var up = !c.down;
        var dot = '<span class="status-dot ' + (up ? 'up' : 'down') + '" title="' + (up ? 'up' : 'down') + '"></span>';
        var link = '<a href="' + esc(c.url) + '" target="_blank">' + esc(c.alias || hostLabel(c.url)) + '</a>';
        var uptime = c.uptime != null ? c.uptime.toFixed(2) + '%' : '-';
        var html = statRow(dot + link, uptime);
        if (!up) {
            var downFor = c.down_since ? ' ' + formatDuration((Date.now() - Date.parse(c.down_since)) / 1000) : '';
            var error = c.error ? SEP + errorLabel(c.error) : '';
            html += '<div class="stat-row-note">down' + downFor + error + '</div>';
        }
        return html;
    }

    function incidentRow(d) {
        var start = new Date(d.started_at || NaN);
        var date = isNaN(start) ? '-' : isoDate(start);
        var length = d.ended_at ? formatDuration(d.duration) : isNaN(start) ? 'ongoing' : formatDuration((Date.now() - start) / 1000) + ' so far';
        var error = d.error ? SEP + '<span class="dim">' + errorLabel(d.error) + '</span>' : '';
        return statRow(esc(hostLabel(d.check)), '<span class="dim">' + date + '</span>' + SEP + length + error, 'stat-row-wrap');
    }

    function errorLabel(error) {
        var code = /^\d{3}\b/.exec(error);
        return code ? tipped(code[0], esc(error), esc(error)) : esc(error);
    }

    function tipped(text, tip, label, className) {
        return '<abbr tabindex="0"' + (className ? ' class="' + className + '"' : '') + ' aria-label="' + label + '" data-tip="' + tip + '">' + text + '</abbr>';
    }

    function isoDate(t) {
        return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
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
            return n ? formatNumber(n) + ' total' : '';
        }

        analytics.innerHTML = panelHead('Site', '(in the last 7 days)') +
            '<div class="stat-tiles">' +
            statTile('Visitors', formatNumber(rb.users) + trend(rb.users, rb.prevUsers), allTime(rb.allUsers)) +
            statTile('Pageviews', formatNumber(rb.pageviews) + trend(rb.pageviews, rb.prevPageviews), allTime(rb.allPageviews)) +
            statTile('Average visit', minutesSeconds(rb.duration) + trend(rb.duration, rb.prevDuration, minutesSeconds), rb.pagesPerVisit != null ? Number(rb.pagesPerVisit).toFixed(1) + ' pages' : '') +
            statTile('Served', served, cached) +
            '</div>' +
            (s.audience ? renderAudience(s.audience) : '');
    }

    function renderAudience(a) {
        function rows(list, label) {
            return list && list.map(function(m) { return statRow(label(m.value), percent(m.percentage)); });
        }
        var pages = rows(a.pages, pageLink);
        var countries = rows(a.countries, function(v) { return name(countryName(v)); });
        return '<div class="panel-columns">' +
            '<div><h3>Pages</h3>' + section(pages) + '</div>' +
            '<div><h3>Countries</h3>' + section(countries) + '</div>' +
            '</div>';
    }

    function pageLink(path) {
        var url;
        try {
            url = new URL(path, location.origin);
        } catch (e) {
            return name(path);
        }
        if (url.origin !== location.origin) return name(path);
        return '<a href="' + esc(url.pathname) + '">' + esc(path) + '</a>';
    }

    function name(text) {
        return '<span class="stat-name">' + esc(text) + '</span>';
    }

    function tipTruncated() {
        document.querySelectorAll('.panel .stat-label > a, .panel .stat-name').forEach(function(el) {
            if (el.scrollWidth > el.clientWidth) el.dataset.tip = el.textContent;
            else delete el.dataset.tip;
        });
    }

    function countryName(code) {
        try {
            return regions ? regions.of(code) : code;
        } catch (e) {
            return code;
        }
    }

    function percent(n) {
        return n != null ? Number(n).toFixed(2) + '%' : '-';
    }

    function trend(current, previous, format) {
        if (current == null || !Number(previous)) return '';
        var change = Math.round((current - previous) / previous * 100);
        if (!change) return '';
        var text = (change > 0 ? '+' : '') + change + '%';
        var tip = (format || formatNumber)(previous) + ' in the 7 days before';
        return ' ' + tipped(text, tip, text + ', ' + tip, 'trend ' + (change > 0 ? 'up' : 'down'));
    }

    function statTile(label, value, sub) {
        return '<div class="stat-tile">' +
            '<span class="stat-tile-label">' + label + '</span>' +
            '<span class="stat-value">' + value + '</span>' +
            (sub ? '<span class="stat-tile-sub">' + sub + '</span>' : '') +
            '</div>';
    }

    function formatNumber(n) {
        if (n == null) return '-';
        n = Number(n);
        if (n >= 999.5e3) return compact(n / 1e6) + 'M';
        if (n >= 999.5) return compact(n / 1e3) + 'k';
        return String(Math.round(n * 100) / 100);
    }

    function minutesSeconds(seconds) {
        if (seconds == null) return '-';
        var s = Math.round(seconds);
        if (s >= 3600) return formatDuration(s);
        if (s < 60) return s + 's';
        return Math.floor(s / 60) + 'm' + (s % 60 ? s % 60 + 's' : '');
    }

    function compact(v) {
        return v.toFixed(v < 9.995 ? 2 : v < 99.95 ? 1 : 0);
    }

    function formatDuration(seconds) {
        if (seconds == null || isNaN(seconds)) return '-';
        seconds = Math.max(0, seconds);
        var d = Math.floor(seconds / 86400);
        var h = Math.floor(seconds % 86400 / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        if (d) return d + 'd' + (h ? h + 'h' : '');
        if (h) return h + 'h' + (m ? m + 'm' : '');
        if (m) return m + 'm';
        return Math.floor(seconds) + 's';
    }

    function formatBytes(n) {
        if (!n) return '0 B';
        var units = ['B', 'KB', 'MB', 'GB', 'TB'];
        var i = 0;
        while (n >= 999.5 && i < units.length - 1) {
            n /= 1024;
            i++;
        }
        return (i === 0 ? n : compact(n)) + ' ' + units[i];
    }

    function esc(s) {
        if (!s) return '';
        var d = document.createElement('div');
        d.textContent = s;
        return d.innerHTML.replace(/"/g, '&quot;');
    }
})();
