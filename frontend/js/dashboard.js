/* ============================================
   Dashboard Page
   ============================================ */

registerPage('dashboard', async () => {
    // Fetch counts in parallel
    const [players, teams, matches] = await Promise.all([
        api('/players/'),
        api('/teams/'),
        api('/matches/'),
    ]);

    const topScorers = await api('/analytics/top-scorers?limit=5');

    return `
        <div class="page-header">
            <h2>Dashboard</h2>
            <p>Overview of Premier League data at a glance</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card purple">
                <div class="stat-card-icon">👤</div>
                <div class="stat-card-value">${players.length}</div>
                <div class="stat-card-label">Total Players</div>
            </div>
            <div class="stat-card green">
                <div class="stat-card-icon">🏟️</div>
                <div class="stat-card-value">${teams.length}</div>
                <div class="stat-card-label">Teams</div>
            </div>
            <div class="stat-card pink">
                <div class="stat-card-icon">📅</div>
                <div class="stat-card-value">${matches.length.toLocaleString()}</div>
                <div class="stat-card-label">Matches Played</div>
            </div>
            <div class="stat-card cyan">
                <div class="stat-card-icon">⚽</div>
                <div class="stat-card-value">${matches.reduce((sum, m) => sum + m.home_goals + m.away_goals, 0).toLocaleString()}</div>
                <div class="stat-card-label">Total Goals</div>
            </div>
        </div>

        <div class="analytics-grid">
            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">🏆 Top Scorers</h3>
                    <button class="btn btn-outline btn-sm" onclick="navigateTo('analytics')">View All</button>
                </div>
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Player</th>
                                <th>Goals</th>
                                <th>Assists</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${topScorers.map((p, i) => `
                                <tr>
                                    <td><strong>${i + 1}</strong></td>
                                    <td>${escapeHTML(p.name)}</td>
                                    <td><strong>${p.goals}</strong></td>
                                    <td>${p.assists}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="section">
                <div class="section-header">
                    <h3 class="section-title">📋 Quick Navigation</h3>
                </div>
                <div class="section-body">
                    <div class="cards-grid" style="margin-bottom: 0;">
                        <div class="card" onclick="navigateTo('players')">
                            <div class="card-header">
                                <span class="card-title">👤 Players</span>
                                <span class="card-badge badge-purple">${players.length}</span>
                            </div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">Browse, search, and manage player records</p>
                        </div>
                        <div class="card" onclick="navigateTo('teams')">
                            <div class="card-header">
                                <span class="card-title">🏟️ Teams</span>
                                <span class="card-badge badge-green">${teams.length}</span>
                            </div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">View all Premier League teams</p>
                        </div>
                        <div class="card" onclick="navigateTo('matches')">
                            <div class="card-header">
                                <span class="card-title">📅 Matches</span>
                                <span class="card-badge badge-pink">${matches.length.toLocaleString()}</span>
                            </div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">Explore match results and statistics</p>
                        </div>
                        <div class="card" onclick="navigateTo('analytics')">
                            <div class="card-header">
                                <span class="card-title">📈 Analytics</span>
                            </div>
                            <p style="color: var(--text-secondary); font-size: 0.85rem;">League tables, top scorers, and insights</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
});
