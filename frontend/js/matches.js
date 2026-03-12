/* ============================================
   Matches Page
   ============================================ */

let allMatches = [];
let matchTeamsCache = {};
let matchesPerPage = 20;
let currentMatchPage = 1;

registerPage('matches', async () => {
    const [matches, teams] = await Promise.all([
        api('/matches/'),
        api('/teams/'),
    ]);

    allMatches = matches;
    matchTeamsCache = {};
    teams.forEach(t => matchTeamsCache[t.id] = t.name);

    // Extract unique seasons
    const seasons = [...new Set(matches.map(m => m.season))].sort().reverse();

    currentMatchPage = 1;

    return `
        <div class="page-header">
            <h2>Matches</h2>
            <p>${matches.length.toLocaleString()} matches in the database</p>
        </div>

        <div class="toolbar">
            <input type="text" class="search-input" id="matchSearch" placeholder="Search by team name...">
            <select class="filter-select" id="matchSeasonFilter">
                <option value="">All Seasons</option>
                ${seasons.map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
            <select class="filter-select" id="matchTeamFilter">
                <option value="">All Teams</option>
                ${teams.map(t => `<option value="${t.id}">${escapeHTML(t.name)}</option>`).join('')}
            </select>
        </div>

        <div id="matchesContainer">
            ${renderMatchesView(matches)}
        </div>
    `;
});

function init_matches() {
    const searchInput = document.getElementById('matchSearch');
    const seasonFilter = document.getElementById('matchSeasonFilter');
    const teamFilter = document.getElementById('matchTeamFilter');

    if (searchInput) searchInput.addEventListener('input', filterMatches);
    if (seasonFilter) seasonFilter.addEventListener('change', filterMatches);
    if (teamFilter) teamFilter.addEventListener('change', filterMatches);
}

function renderMatchesView(matches) {
    if (matches.length === 0) {
        return showEmpty('📅', 'No matches found matching your filters');
    }

    const totalPages = Math.ceil(matches.length / matchesPerPage);
    const start = (currentMatchPage - 1) * matchesPerPage;
    const pageMatches = matches.slice(start, start + matchesPerPage);

    return `
        <div class="matches-grid">
            ${pageMatches.map(m => renderMatchCard(m)).join('')}
        </div>
        ${totalPages > 1 ? renderPagination(totalPages, matches.length) : ''}
    `;
}

function renderMatchCard(m) {
    const homeName = matchTeamsCache[m.home_team_id] || `Team ${m.home_team_id}`;
    const awayName = matchTeamsCache[m.away_team_id] || `Team ${m.away_team_id}`;

    return `
        <div class="match-card" onclick="viewMatchDetail(${m.id})">
            <div class="match-card-header">
                <span>${formatDate(m.match_date)}</span>
                <span class="card-badge badge-purple">${escapeHTML(m.season)}</span>
            </div>
            <div class="match-card-teams">
                <div class="match-team">
                    <div class="match-team-name">${escapeHTML(homeName)}</div>
                </div>
                <div class="match-score">
                    <span>${m.home_goals}</span>
                    <span class="match-score-divider">-</span>
                    <span>${m.away_goals}</span>
                </div>
                <div class="match-team">
                    <div class="match-team-name">${escapeHTML(awayName)}</div>
                </div>
            </div>
            <div class="match-card-footer">
                <div class="match-stat">
                    <div class="match-stat-value">${m.home_shots + m.away_shots}</div>
                    <div class="match-stat-label">Shots</div>
                </div>
                <div class="match-stat">
                    <div class="match-stat-value">${m.home_corners + m.away_corners}</div>
                    <div class="match-stat-label">Corners</div>
                </div>
                <div class="match-stat">
                    <div class="match-stat-value">${m.home_yellow + m.away_yellow}</div>
                    <div class="match-stat-label">Yellows</div>
                </div>
                <div class="match-stat">
                    <div class="match-stat-value">${m.home_red + m.away_red}</div>
                    <div class="match-stat-label">Reds</div>
                </div>
            </div>
        </div>
    `;
}

function renderPagination(totalPages, totalItems) {
    const start = (currentMatchPage - 1) * matchesPerPage + 1;
    const end = Math.min(currentMatchPage * matchesPerPage, totalItems);

    return `
        <div style="text-align: center; margin-top: 20px; color: var(--text-secondary); font-size: 0.85rem;">
            Showing ${start}–${end} of ${totalItems.toLocaleString()} matches
        </div>
        <div class="pagination">
            <button class="page-btn" onclick="changeMatchPage(1)" ${currentMatchPage === 1 ? 'disabled' : ''}>First</button>
            <button class="page-btn" onclick="changeMatchPage(${currentMatchPage - 1})" ${currentMatchPage === 1 ? 'disabled' : ''}>Prev</button>
            <span style="padding: 8px 12px; font-size: 0.85rem; color: var(--text-secondary);">
                Page ${currentMatchPage} of ${totalPages}
            </span>
            <button class="page-btn" onclick="changeMatchPage(${currentMatchPage + 1})" ${currentMatchPage === totalPages ? 'disabled' : ''}>Next</button>
            <button class="page-btn" onclick="changeMatchPage(${totalPages})" ${currentMatchPage === totalPages ? 'disabled' : ''}>Last</button>
        </div>
    `;
}

function changeMatchPage(page) {
    currentMatchPage = page;
    const filtered = getFilteredMatches();
    document.getElementById('matchesContainer').innerHTML = renderMatchesView(filtered);
}

function getFilteredMatches() {
    const search = document.getElementById('matchSearch')?.value.toLowerCase() || '';
    const season = document.getElementById('matchSeasonFilter')?.value || '';
    const teamId = document.getElementById('matchTeamFilter')?.value || '';

    let filtered = allMatches;

    if (search) {
        filtered = filtered.filter(m => {
            const homeName = (matchTeamsCache[m.home_team_id] || '').toLowerCase();
            const awayName = (matchTeamsCache[m.away_team_id] || '').toLowerCase();
            return homeName.includes(search) || awayName.includes(search);
        });
    }

    if (season) {
        filtered = filtered.filter(m => m.season === season);
    }

    if (teamId) {
        const tid = parseInt(teamId);
        filtered = filtered.filter(m => m.home_team_id === tid || m.away_team_id === tid);
    }

    return filtered;
}

function filterMatches() {
    currentMatchPage = 1;
    const filtered = getFilteredMatches();
    document.getElementById('matchesContainer').innerHTML = renderMatchesView(filtered);
}

async function viewMatchDetail(matchId) {
    try {
        const match = await api(`/matches/${matchId}`);
        const homeName = matchTeamsCache[match.home_team_id] || `Team ${match.home_team_id}`;
        const awayName = matchTeamsCache[match.away_team_id] || `Team ${match.away_team_id}`;

        const modalHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
                    ${formatDate(match.match_date)} · ${escapeHTML(match.season)}
                </div>
                <div class="match-card-teams" style="justify-content: center; gap: 24px;">
                    <div class="match-team">
                        <div class="match-team-name" style="font-size: 1.1rem;">${escapeHTML(homeName)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Home</div>
                    </div>
                    <div class="match-score" style="font-size: 2rem;">
                        <span>${match.home_goals}</span>
                        <span class="match-score-divider">-</span>
                        <span>${match.away_goals}</span>
                    </div>
                    <div class="match-team">
                        <div class="match-team-name" style="font-size: 1.1rem;">${escapeHTML(awayName)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Away</div>
                    </div>
                </div>
            </div>

            <table class="data-table" style="font-size: 0.85rem;">
                <thead>
                    <tr>
                        <th style="text-align: center;">Home</th>
                        <th style="text-align: center;">Stat</th>
                        <th style="text-align: center;">Away</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: center; font-weight: 700;">${match.home_goals}</td>
                        <td style="text-align: center; color: var(--text-secondary);">Goals</td>
                        <td style="text-align: center; font-weight: 700;">${match.away_goals}</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">${match.home_shots}</td>
                        <td style="text-align: center; color: var(--text-secondary);">Shots</td>
                        <td style="text-align: center;">${match.away_shots}</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">${match.home_corners}</td>
                        <td style="text-align: center; color: var(--text-secondary);">Corners</td>
                        <td style="text-align: center;">${match.away_corners}</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">${match.home_yellow}</td>
                        <td style="text-align: center; color: var(--text-secondary);">Yellow Cards</td>
                        <td style="text-align: center;">${match.away_yellow}</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">${match.home_red}</td>
                        <td style="text-align: center; color: var(--text-secondary);">Red Cards</td>
                        <td style="text-align: center;">${match.away_red}</td>
                    </tr>
                </tbody>
            </table>
        `;

        openModal(`${homeName} vs ${awayName}`, modalHTML);
    } catch (err) {
        showToast('Failed to load match details', 'error');
    }
}
