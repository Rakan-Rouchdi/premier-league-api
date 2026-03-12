/* ============================================
   Analytics Page
   ============================================ */

let analyticsTeamsCache = {};
let analyticsSeasons = [];
let analyticsTeamsList = [];

registerPage('analytics', async () => {
    const teams = await api('/teams/');
    analyticsTeamsCache = {};
    teams.forEach(t => analyticsTeamsCache[t.id] = t.name);
    analyticsTeamsList = teams;

    // Extract seasons from matches for the league table selector
    const matches = await api('/matches/');
    analyticsSeasons = [...new Set(matches.map(m => m.season))].sort().reverse();

    return `
        <div class="page-header">
            <h2>Analytics</h2>
            <p>Insights and statistics from Premier League data</p>
        </div>

        <div class="tabs" id="analyticsTabs">
            <button class="tab active" data-tab="scorers" onclick="switchAnalyticsTab('scorers')">Top Scorers</button>
            <button class="tab" data-tab="assists" onclick="switchAnalyticsTab('assists')">Top Assists</button>
            <button class="tab" data-tab="highscoring" onclick="switchAnalyticsTab('highscoring')">Highest Scoring</button>
            <button class="tab" data-tab="leaguetable" onclick="switchAnalyticsTab('leaguetable')">League Table</button>
            <button class="tab" data-tab="teamsummary" onclick="switchAnalyticsTab('teamsummary')">Team Summary</button>
        </div>

        <div id="analyticsContent">
            <div class="loading"><div class="spinner"></div></div>
        </div>
    `;
});

function init_analytics() {
    switchAnalyticsTab('scorers');
}

async function switchAnalyticsTab(tab) {
    // Update active tab
    document.querySelectorAll('#analyticsTabs .tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });

    const container = document.getElementById('analyticsContent');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        switch (tab) {
            case 'scorers':
                await renderTopScorers(container);
                break;
            case 'assists':
                await renderTopAssists(container);
                break;
            case 'highscoring':
                await renderHighScoring(container);
                break;
            case 'leaguetable':
                await renderLeagueTable(container);
                break;
            case 'teamsummary':
                await renderTeamSummary(container);
                break;
        }
    } catch (err) {
        container.innerHTML = showEmpty('❌', `Failed to load analytics: ${err.message}`);
    }
}

// ---------- Top Scorers ----------
async function renderTopScorers(container) {
    const players = await api('/analytics/top-scorers?limit=20');

    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">🏆 Top Goal Scorers</h3>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">Top 20 players by goals</span>
            </div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Player</th>
                            <th>Team</th>
                            <th>Goals</th>
                            <th>Assists</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map((p, i) => `
                            <tr>
                                <td>
                                    <span class="position-cell ${i < 3 ? 'top-4' : ''}" style="font-size: 1rem;">
                                        ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                    </span>
                                </td>
                                <td><strong>${escapeHTML(p.name)}</strong></td>
                                <td>${escapeHTML(analyticsTeamsCache[p.team_id] || 'Unknown')}</td>
                                <td><strong style="color: var(--pl-purple); font-size: 1.1rem;">${p.goals}</strong></td>
                                <td>${p.assists}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ---------- Top Assists ----------
async function renderTopAssists(container) {
    const players = await api('/analytics/top-assists?limit=20');

    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">🎯 Top Assist Providers</h3>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">Top 20 players by assists</span>
            </div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Player</th>
                            <th>Team</th>
                            <th>Assists</th>
                            <th>Goals</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${players.map((p, i) => `
                            <tr>
                                <td>
                                    <span class="position-cell ${i < 3 ? 'top-4' : ''}" style="font-size: 1rem;">
                                        ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                                    </span>
                                </td>
                                <td><strong>${escapeHTML(p.name)}</strong></td>
                                <td>${escapeHTML(analyticsTeamsCache[p.team_id] || 'Unknown')}</td>
                                <td><strong style="color: var(--pl-purple); font-size: 1.1rem;">${p.assists}</strong></td>
                                <td>${p.goals}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ---------- Highest Scoring Matches ----------
async function renderHighScoring(container) {
    const matches = await api('/analytics/highest-scoring-matches?limit=20');

    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">⚽ Highest Scoring Matches</h3>
                <span style="color: var(--text-secondary); font-size: 0.85rem;">Top 20 by total goals</span>
            </div>
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 50px;">#</th>
                            <th>Home Team</th>
                            <th style="text-align: center;">Score</th>
                            <th>Away Team</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Season</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${matches.map((m, i) => `
                            <tr>
                                <td><strong>${i + 1}</strong></td>
                                <td>${escapeHTML(analyticsTeamsCache[m.home_team_id] || `Team ${m.home_team_id}`)}</td>
                                <td style="text-align: center;">
                                    <strong>${m.home_goals} - ${m.away_goals}</strong>
                                </td>
                                <td>${escapeHTML(analyticsTeamsCache[m.away_team_id] || `Team ${m.away_team_id}`)}</td>
                                <td>
                                    <strong style="color: var(--pl-pink); font-size: 1.1rem;">${m.total_goals}</strong>
                                </td>
                                <td style="color: var(--text-secondary);">${formatDate(m.match_date)}</td>
                                <td><span class="card-badge badge-purple">${escapeHTML(m.season)}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ---------- League Table ----------
async function renderLeagueTable(container) {
    const seasons = analyticsSeasons;
    const defaultSeason = seasons[0] || '2024/25';

    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">📋 League Table</h3>
                <select class="filter-select" id="leagueSeasonSelect" onchange="loadLeagueTable()">
                    ${seasons.map(s => `<option value="${s}" ${s === defaultSeason ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div id="leagueTableBody">
                <div class="loading"><div class="spinner"></div></div>
            </div>
        </div>
    `;

    await loadLeagueTable();
}

async function loadLeagueTable() {
    const season = document.getElementById('leagueSeasonSelect').value;
    const tableBody = document.getElementById('leagueTableBody');
    tableBody.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const table = await api(`/analytics/league-table?season=${encodeURIComponent(season)}`);

        // Filter out teams with 0 matches played
        const activeTeams = table.filter(t => t.played > 0);

        if (activeTeams.length === 0) {
            tableBody.innerHTML = showEmpty('📋', 'No matches found for this season');
            return;
        }

        tableBody.innerHTML = `
            <div class="league-table-container">
                <table class="league-table">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Team</th>
                            <th>P</th>
                            <th>W</th>
                            <th>D</th>
                            <th>L</th>
                            <th>GF</th>
                            <th>GA</th>
                            <th>GD</th>
                            <th>Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeTeams.map((t, i) => `
                            <tr>
                                <td class="position-cell ${i < 4 ? 'top-4' : ''} ${i >= activeTeams.length - 3 ? 'relegation' : ''}">
                                    ${i + 1}
                                </td>
                                <td style="text-align: left; font-weight: 600;">${escapeHTML(t.team_name)}</td>
                                <td>${t.played}</td>
                                <td>${t.wins}</td>
                                <td>${t.draws}</td>
                                <td>${t.losses}</td>
                                <td>${t.goals_for}</td>
                                <td>${t.goals_against}</td>
                                <td style="font-weight: 600; color: ${t.goal_difference >= 0 ? '#00a854' : 'var(--pl-pink)'};">
                                    ${t.goal_difference > 0 ? '+' : ''}${t.goal_difference}
                                </td>
                                <td class="points-cell">${t.points}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="padding: 16px 24px; display: flex; gap: 20px; font-size: 0.75rem; color: var(--text-muted);">
                <span><span style="color: #2563eb;">●</span> Champions League</span>
                <span><span style="color: var(--pl-pink);">●</span> Relegation</span>
            </div>
        `;
    } catch (err) {
        tableBody.innerHTML = showEmpty('❌', `Failed to load league table: ${err.message}`);
    }
}

// ---------- Team Summary ----------
async function renderTeamSummary(container) {
    const teams = analyticsTeamsList;

    container.innerHTML = `
        <div class="section">
            <div class="section-header">
                <h3 class="section-title">📊 Team Performance Summary</h3>
                <select class="filter-select" id="teamSummarySelect" onchange="loadTeamSummary()">
                    <option value="">Select a team</option>
                    ${teams.map(t => `<option value="${t.id}">${escapeHTML(t.name)}</option>`).join('')}
                </select>
            </div>
            <div id="teamSummaryBody">
                ${showEmpty('📊', 'Select a team to view their performance summary')}
            </div>
        </div>
    `;
}

async function loadTeamSummary() {
    const teamId = document.getElementById('teamSummarySelect').value;
    const body = document.getElementById('teamSummaryBody');

    if (!teamId) {
        body.innerHTML = showEmpty('📊', 'Select a team to view their performance summary');
        return;
    }

    body.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

    try {
        const summary = await api(`/analytics/team-summary/${teamId}`);

        const winRate = summary.matches_played > 0
            ? ((summary.wins / summary.matches_played) * 100).toFixed(1)
            : 0;

        const gd = summary.goals_for - summary.goals_against;

        body.innerHTML = `
            <div style="padding: 24px;">
                <div class="team-detail-header" style="margin-bottom: 24px;">
                    <div class="team-detail-icon">🏟️</div>
                    <div class="team-detail-info">
                        <h3>${escapeHTML(summary.team_name)}</h3>
                        <p>All-time performance across all seasons</p>
                    </div>
                </div>

                <div class="stats-grid" style="margin-bottom: 24px;">
                    <div class="stat-card purple" style="padding: 18px;">
                        <div class="stat-card-value" style="font-size: 1.6rem;">${summary.matches_played}</div>
                        <div class="stat-card-label">Matches Played</div>
                    </div>
                    <div class="stat-card green" style="padding: 18px;">
                        <div class="stat-card-value" style="font-size: 1.6rem;">${summary.wins}</div>
                        <div class="stat-card-label">Wins</div>
                    </div>
                    <div class="stat-card cyan" style="padding: 18px;">
                        <div class="stat-card-value" style="font-size: 1.6rem;">${summary.draws}</div>
                        <div class="stat-card-label">Draws</div>
                    </div>
                    <div class="stat-card pink" style="padding: 18px;">
                        <div class="stat-card-value" style="font-size: 1.6rem;">${summary.losses}</div>
                        <div class="stat-card-label">Losses</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px;">
                    <div style="text-align: center; padding: 20px; background: var(--bg-primary); border-radius: 12px;">
                        <div style="font-size: 1.5rem; font-weight: 800; color: var(--pl-purple);">${summary.points}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Total Points</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: var(--bg-primary); border-radius: 12px;">
                        <div style="font-size: 1.5rem; font-weight: 800;">${summary.goals_for}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Goals For</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: var(--bg-primary); border-radius: 12px;">
                        <div style="font-size: 1.5rem; font-weight: 800;">${summary.goals_against}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Goals Against</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: var(--bg-primary); border-radius: 12px;">
                        <div style="font-size: 1.5rem; font-weight: 800; color: ${gd >= 0 ? '#00a854' : 'var(--pl-pink)'};">
                            ${gd > 0 ? '+' : ''}${gd}
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Goal Difference</div>
                    </div>
                    <div style="text-align: center; padding: 20px; background: var(--bg-primary); border-radius: 12px;">
                        <div style="font-size: 1.5rem; font-weight: 800;">${winRate}%</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">Win Rate</div>
                    </div>
                </div>
            </div>
        `;
    } catch (err) {
        body.innerHTML = showEmpty('❌', `Failed to load team summary: ${err.message}`);
    }
}
