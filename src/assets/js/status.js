(function() {
    var API = 'https://status.salm.dev';
    var services = document.getElementById('status-services');
    var renews = document.getElementById('salm-dev-renews');
    var incidentsPanel = document.getElementById('status-incidents');
    var coding = document.getElementById('status-coding');
    var analytics = document.getElementById('status-analytics');

    var SEP = ' <span class="meta-sep" aria-hidden="true"></span> ';
    var lastCheckAt = null;

    load(true);
    setInterval(function() { if (!document.hidden) load(false); }, 60000);
    setInterval(tickChecked, 1000);

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
        renderCoding(data);
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
        if (renews && days != null) renews.textContent = 'renews in ' + days + 'd';
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
        var name = '<a href="' + esc(c.url) + '" target="_blank">' + esc(c.alias || hostLabel(c.url)) + '</a>';
        var uptime = c.uptime != null ? c.uptime.toFixed(2) + '%' : '-';
        var html = statRow(dot + name, uptime);
        if (!up) {
            var since = c.down_since ? ' ' + formatDuration((Date.now() - Date.parse(c.down_since)) / 1000) : '';
            var error = c.error ? SEP + errorLabel(c.error) : '';
            html += '<div class="stat-row-note">down' + since + error + '</div>';
        }
        return html;
    }

    function incidentRow(d) {
        var start = new Date(d.started_at);
        var date = isNaN(start) ? esc(String(d.started_at).slice(0, 10)) : start.toLocaleDateString('en-CA');
        var length = d.ended_at ? formatDuration(d.duration) : formatDuration((Date.now() - start) / 1000) + ' so far';
        var error = d.error ? SEP + '<span class="dim">' + errorLabel(d.error) + '</span>' : '';
        return statRow(esc(hostLabel(d.check)), '<span class="dim">' + date + '</span>' + SEP + length + error, 'stat-row-wrap');
    }

    function errorLabel(error) {
        var code = /^\d{3}\b/.exec(error);
        return code ? '<abbr data-tip="' + esc(error) + '">' + code[0] + '</abbr>' : esc(error);
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

        analytics.innerHTML = panelHead('Site', '(in the last 7 days)') +
            '<div class="stat-tiles">' +
            statTile('Visitors', formatNumber(rb.users), allTime(rb.allUsers)) +
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
            hours = '(' + (seconds / 3600).toFixed(2) + 'h in the last 7 days)';
        }

        coding.innerHTML = panelHead('Coding', hours) +
            '<div class="panel-columns">' +
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
        var d = Math.floor(seconds / 86400);
        var h = Math.floor(seconds % 86400 / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        if (d) return d + 'd' + (h ? ' ' + h + 'h' : '');
        if (h) return h + 'h' + (m ? ' ' + m + 'm' : '');
        if (m) return m + 'm';
        return Math.floor(seconds) + 's';
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
        return d.innerHTML.replace(/"/g, '&quot;');
    }
})();
