/* ============================================
   Players Page — Full CRUD
   ============================================ */

let allPlayers = [];
let allTeamsCache = [];

registerPage('players', async () => {
    const [players, teams] = await Promise.all([
        api('/players/'),
        api('/teams/'),
    ]);

    allPlayers = players;
    allTeamsCache = teams;

    return `
        <div class="page-header">
            <h2>Players</h2>
            <p>Browse, search, and manage player records</p>
        </div>

        <div class="toolbar">
            <input type="text" class="search-input" id="playerSearch" placeholder="Search players by name...">
            <select class="filter-select" id="playerTeamFilter">
                <option value="">All Teams</option>
                ${teams.map(t => `<option value="${t.id}">${escapeHTML(t.name)}</option>`).join('')}
            </select>
            <select class="filter-select" id="playerPositionFilter">
                <option value="">All Positions</option>
                <option value="FWD">Forward</option>
                <option value="MID">Midfielder</option>
                <option value="DEF">Defender</option>
                <option value="GKP">Goalkeeper</option>
            </select>
            <button class="btn btn-primary" onclick="openCreatePlayerModal()">+ Add Player</button>
        </div>

        <div class="section">
            <div class="table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Team</th>
                            <th>Position</th>
                            <th>Apps</th>
                            <th>Mins</th>
                            <th>Goals</th>
                            <th>Assists</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="playersTableBody">
                        ${renderPlayersRows(players, teams)}
                    </tbody>
                </table>
            </div>
            <div id="playersEmpty" style="display: none;">
                ${showEmpty('👤', 'No players found matching your filters')}
            </div>
        </div>
    `;
});

function init_players() {
    const searchInput = document.getElementById('playerSearch');
    const teamFilter = document.getElementById('playerTeamFilter');
    const positionFilter = document.getElementById('playerPositionFilter');

    if (searchInput) searchInput.addEventListener('input', filterPlayers);
    if (teamFilter) teamFilter.addEventListener('change', filterPlayers);
    if (positionFilter) positionFilter.addEventListener('change', filterPlayers);
}

function renderPlayersRows(players, teams) {
    const teamMap = {};
    teams.forEach(t => teamMap[t.id] = t.name);

    if (players.length === 0) return '';

    return players.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><strong>${escapeHTML(p.name)}</strong></td>
            <td>${escapeHTML(teamMap[p.team_id] || 'Unknown')}</td>
            <td><span class="card-badge badge-purple">${escapeHTML(p.position || 'N/A')}</span></td>
            <td>${p.appearances}</td>
            <td>${p.minutes.toLocaleString()}</td>
            <td><strong>${p.goals}</strong></td>
            <td>${p.assists}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit" onclick="openEditPlayerModal(${p.id})">Edit</button>
                    <button class="action-btn delete" onclick="confirmDeletePlayer(${p.id}, '${escapeHTML(p.name).replace(/'/g, "\\'")}')">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterPlayers() {
    const search = document.getElementById('playerSearch').value.toLowerCase();
    const teamId = document.getElementById('playerTeamFilter').value;
    const position = document.getElementById('playerPositionFilter').value;

    let filtered = allPlayers;

    if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search));
    }
    if (teamId) {
        filtered = filtered.filter(p => p.team_id === parseInt(teamId));
    }
    if (position) {
        filtered = filtered.filter(p => p.position === position);
    }

    const tbody = document.getElementById('playersTableBody');
    const emptyDiv = document.getElementById('playersEmpty');

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        emptyDiv.style.display = 'block';
    } else {
        tbody.innerHTML = renderPlayersRows(filtered, allTeamsCache);
        emptyDiv.style.display = 'none';
    }
}

function getPlayerFormHTML(player = null) {
    const isEdit = player !== null;
    return `
        <form id="playerForm" onsubmit="handlePlayerSubmit(event, ${isEdit ? player.id : 'null'})">
            <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-input" name="name" value="${isEdit ? escapeHTML(player.name) : ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Team</label>
                <select class="form-select" name="team_id" required>
                    <option value="">Select a team</option>
                    ${allTeamsCache.map(t => `
                        <option value="${t.id}" ${isEdit && player.team_id === t.id ? 'selected' : ''}>${escapeHTML(t.name)}</option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Position</label>
                <select class="form-select" name="position">
                    <option value="">Select position</option>
                    <option value="FWD" ${isEdit && player.position === 'FWD' ? 'selected' : ''}>Forward</option>
                    <option value="MID" ${isEdit && player.position === 'MID' ? 'selected' : ''}>Midfielder</option>
                    <option value="DEF" ${isEdit && player.position === 'DEF' ? 'selected' : ''}>Defender</option>
                    <option value="GKP" ${isEdit && player.position === 'GKP' ? 'selected' : ''}>Goalkeeper</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Appearances</label>
                <input type="number" class="form-input" name="appearances" value="${isEdit ? player.appearances : 0}" min="0">
            </div>
            <div class="form-group">
                <label class="form-label">Minutes</label>
                <input type="number" class="form-input" name="minutes" value="${isEdit ? player.minutes : 0}" min="0">
            </div>
            <div class="form-group">
                <label class="form-label">Goals</label>
                <input type="number" class="form-input" name="goals" value="${isEdit ? player.goals : 0}" min="0">
            </div>
            <div class="form-group">
                <label class="form-label">Assists</label>
                <input type="number" class="form-input" name="assists" value="${isEdit ? player.assists : 0}" min="0">
            </div>
        </form>
    `;
}

function getPlayerFormFooter(isEdit) {
    return `
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button type="submit" form="playerForm" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Player</button>
    `;
}

function openCreatePlayerModal() {
    openModal('Add New Player', getPlayerFormHTML(), getPlayerFormFooter(false));
}

async function openEditPlayerModal(playerId) {
    try {
        const player = await api(`/players/${playerId}`);
        openModal('Edit Player', getPlayerFormHTML(player), getPlayerFormFooter(true));
    } catch (err) {
        showToast('Failed to load player details', 'error');
    }
}

async function handlePlayerSubmit(event, playerId) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const data = {
        name: formData.get('name'),
        team_id: parseInt(formData.get('team_id')),
        position: formData.get('position') || null,
        appearances: parseInt(formData.get('appearances')) || 0,
        minutes: parseInt(formData.get('minutes')) || 0,
        goals: parseInt(formData.get('goals')) || 0,
        assists: parseInt(formData.get('assists')) || 0,
    };

    try {
        if (playerId) {
            await api(`/players/${playerId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            showToast('Player updated successfully', 'success');
        } else {
            await api('/players/', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            showToast('Player created successfully', 'success');
        }
        closeModal();
        navigateTo('players');
    } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
    }
}

function confirmDeletePlayer(playerId, playerName) {
    openModal('Delete Player', `
        <div style="text-align: center; padding: 12px 0;">
            <div style="font-size: 3rem; margin-bottom: 16px;">⚠️</div>
            <p style="font-size: 1rem; margin-bottom: 8px;">Are you sure you want to delete</p>
            <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 16px;">${playerName}?</p>
            <p style="color: var(--text-secondary); font-size: 0.85rem;">This action cannot be undone.</p>
        </div>
    `, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="deletePlayer(${playerId})">Delete</button>
    `);
}

async function deletePlayer(playerId) {
    try {
        await api(`/players/${playerId}`, { method: 'DELETE' });
        showToast('Player deleted successfully', 'success');
        closeModal();
        navigateTo('players');
    } catch (err) {
        showToast(`Error: ${err.message}`, 'error');
    }
}
