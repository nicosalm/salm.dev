(function() {
    var API = 'https://status.salm.dev';
    var services = document.getElementById('status-services');
    var coding = document.getElementById('status-coding');
    var analytics = document.getElementById('status-analytics');

    fetch(API)
        .then(function(res) { return res.json(); })
        .then(render)
        .catch(function() {
            services.innerHTML = '<p>Failed to load status data.</p>';
        });

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
        var html = '<h2>Services</h2><div class="status-section">';
        checks.forEach(function(c) {
            var up = !c.down;
            var dot = '<span class="status-dot ' + (up ? 'up' : 'down') + '" title="' + (up ? 'up' : 'down') + '"></span>';
            var name = '<a href="' + esc(c.url) + '" target="_blank">' + esc(c.alias || c.url) + '</a>';
            var days = c.domain && c.domain.remaining_days != null ? ' <span class="dim">· ' + c.domain.remaining_days + 'd</span>' : '';
            var value = (up ? '' : '<span class="dim">down · </span>') + c.uptime.toFixed(2) + '%' + days;
            html += statRow(dot + name, meter(c.uptime), value);
        });
        html += '</div>';
        if (checks.length) {
            html += '<small class="status-note">last checked <code>' + esc(checks[0].last_check_at) + '</code></small>';
        }
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
            if (all) out += ' <span class="dim">(all-time ' + formatNumber(all) + ')</span>';
            return out;
        }

        var html = '<div class="section-head"><h2>Site</h2><span class="section-note">' + esc(formatWindow(s.window)) + '</span></div>';
        html += '<div class="status-section">';
        html += statRow('users', '', withAllTime(rb.users, rb.allUsers));
        html += statRow('pageviews', '', withAllTime(rb.pageviews, rb.allPageviews));
        html += statRow('served', '', formatBytes(bytes));
        html += statRow('cached', bytes > 0 ? meter(pctCached) : '', formatBytes(cachedBytes) + ' <span class="dim">· ' + pctCached.toFixed(0) + '%</span>');
        html += '</div>';
        analytics.innerHTML = html;
    }

    function renderCoding(data) {
        var languages = data.languages.filter(function(l) { return l.name !== 'Other' && l.decimal >= 0.5; });
        var seconds = data.activity.reduce(function(acc, cur) { return acc + cur.grand_total.total_seconds; }, 0);
        var hours = (seconds / 3600).toFixed(2);
        var maxDecimal = languages.reduce(function(m, l) { return Math.max(m, l.decimal); }, 0) || 1;

        var html = '<div class="section-head"><h2>Coding</h2><span class="section-note">last 7 days · ' + hours + 'h</span></div>';

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

    function formatWindow(w) {
        if (!w || !w.start || !w.end) return 'last 7 days';
        var end = w.start.slice(0, 4) === w.end.slice(0, 4) ? w.end.slice(5) : w.end;
        return w.start + '/' + end;
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
