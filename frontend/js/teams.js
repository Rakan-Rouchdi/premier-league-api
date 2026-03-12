/* ============================================
   Teams Page
   ============================================ */

registerPage('teams', async () => {
    const teams = await api('/teams/');

    return `
        <div class="page-header">
            <h2>Teams</h2>
            <p>All Premier League teams in the database</p>
        </div>

        <div class="toolbar">
            <input type="text" class="search-input" id="teamSearch" placeholder="Search teams...">
        </div>

        <div class="cards-grid" id="teamsGrid">
            ${teams.map(t => `
                <div class="card" onclick="viewTeamDetail(${t.id})">
                    <div class="card-header">
                        <span class="card-title">${escapeHTML(t.name)}</span>
                        <span class="card-badge badge-purple">ID: ${t.id}</span>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.85rem;">Click to view team details and performance summary</p>
                </div>
            `).join('')}
        </div>

        <div id="teamsEmpty" style="display: none;">
            ${showEmpty('🏟️', 'No teams found matching your search')}
        </div>
    `;
});

function init_teams() {
    const searchInput = document.getElementById('teamSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterTeams);
    }
}

function filterTeams() {
    const search = document.getElementById('teamSearch').value.toLowerCase();
    const grid = document.getElementById('teamsGrid');
    const emptyDiv = document.getElementById('teamsEmpty');
    const cards = grid.querySelectorAll('.card');
    let visibleCount = 0;

    cards.forEach(card => {
        const name = card.querySelector('.card-title').textContent.toLowerCase();
        const visible = name.includes(search);
        card.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
    });

    emptyDiv.style.display = visibleCount === 0 ? 'block' : 'none';
}

async function viewTeamDetail(teamId) {
    try {
        const [team, summary, players] = await Promise.all([
            api(`/teams/${teamId}`),
            api(`/analytics/team-summary/${teamId}`),
            api(`/players/?team_id=${teamId}`),
        ]);

        const modalHTML = `
            <div class="team-detail-header">
                <div class="team-detail-icon">🏟️</div>
                <div class="team-detail-info">
                    <h3>${escapeHTML(team.name)}</h3>
                    <p>Team ID: ${team.id}</p>
                </div>
            </div>

            <div class="stats-grid" style="margin-bottom: 20px;">
                <div class="stat-card purple" style="padding: 16px;">
                    <div class="stat-card-value" style="font-size: 1.5rem;">${summary.matches_played}</div>
                    <div class="stat-card-label">Played</div>
                </div>
                <div class="stat-card green" style="padding: 16px;">
                    <div class="stat-card-value" style="font-size: 1.5rem;">${summary.wins}</div>
                    <div class="stat-card-label">Wins</div>
                </div>
                <div class="stat-card cyan" style="padding: 16px;">
                    <div class="stat-card-value" style="font-size: 1.5rem;">${summary.draws}</div>
                    <div class="stat-card-label">Draws</div>
                </div>
                <div class="stat-card pink" style="padding: 16px;">
                    <div class="stat-card-value" style="font-size: 1.5rem;">${summary.losses}</div>
                    <div class="stat-card-label">Losses</div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                    <div style="font-size: 1.3rem; font-weight: 700;">${summary.goals_for}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Goals For</div>
                </div>
                <div style="text-align: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                    <div style="font-size: 1.3rem; font-weight: 700;">${summary.goals_against}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Goals Against</div>
                </div>
                <div style="text-align: center; padding: 12px; background: var(--bg-primary); border-radius: 8px;">
                    <div style="font-size: 1.3rem; font-weight: 700; color: var(--pl-purple);">${summary.points}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Total Points</div>
                </div>
            </div>

            ${players.length > 0 ? `
                <h4 style="margin-bottom: 12px; font-size: 0.95rem;">Squad (${players.length} players)</h4>
                <div class="table-wrapper" style="max-height: 250px; overflow-y: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Pos</th>
                                <th>Goals</th>
                                <th>Assists</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${players.map(p => `
                                <tr>
                                    <td>${escapeHTML(p.name)}</td>
                                    <td><span class="card-badge badge-purple">${escapeHTML(p.position || 'N/A')}</span></td>
                                    <td><strong>${p.goals}</strong></td>
                                    <td>${p.assists}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p style="color: var(--text-secondary); font-size: 0.9rem;">No players found for this team.</p>'}
        `;

        openModal(team.name, modalHTML);
    } catch (err) {
        showToast('Failed to load team details', 'error');
    }
}
