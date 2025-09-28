// Persistent Team Assignment Manager
// Handles loading and saving team assignments across matches

interface TeamAssignments {
  teams: Record<string, 'left' | 'right'>;
  players: Record<string, 'left' | 'right'>;
  settings: {
    autoAssign: boolean;
    lastUpdated: string;
  };
}

class PersistentTeamManager {
  private assignments: TeamAssignments = {
    teams: {},
    players: {},
    settings: {
      autoAssign: true,
      lastUpdated: new Date().toISOString()
    }
  };

  private readonly ASSIGNMENTS_FILE = '/team-assignments.json';

  constructor() {
    this.loadAssignments();
  }

  // Load assignments from JSON file
  async loadAssignments(): Promise<void> {
    try {
      const response = await fetch(this.ASSIGNMENTS_FILE);
      if (response.ok) {
        const data = await response.json();
        this.assignments = { ...this.assignments, ...data };
        console.log('✅ Loaded persistent team assignments:', this.assignments);
      }
    } catch (error) {
      console.log('📄 No existing team assignments file, using defaults');
    }
  }

  // Save assignments to localStorage (since we can't write to public files in browser)
  saveAssignments(): void {
    try {
      this.assignments.settings.lastUpdated = new Date().toISOString();
      localStorage.setItem('hud-team-assignments', JSON.stringify(this.assignments));
      console.log('💾 Saved team assignments to localStorage');
    } catch (error) {
      console.error('❌ Failed to save team assignments:', error);
    }
  }

  // Load from localStorage if available (overrides file)
  loadFromLocalStorage(): void {
    try {
      const saved = localStorage.getItem('hud-team-assignments');
      if (saved) {
        this.assignments = JSON.parse(saved);
        console.log('🔄 Loaded team assignments from localStorage:', this.assignments);
      }
    } catch (error) {
      console.error('❌ Failed to load from localStorage:', error);
    }
  }

  // Get team assignment by team name
  getTeamAssignment(teamName: string): 'left' | 'right' | null {
    // Try exact match first
    if (this.assignments.teams[teamName]) {
      return this.assignments.teams[teamName];
    }

    // Try partial match (case-insensitive)
    const normalizedTeam = teamName.toLowerCase();
    for (const [savedTeam, side] of Object.entries(this.assignments.teams)) {
      if (savedTeam.toLowerCase().includes(normalizedTeam) || 
          normalizedTeam.includes(savedTeam.toLowerCase())) {
        return side;
      }
    }

    return null;
  }

  // Get player assignment by steamid
  getPlayerAssignment(steamid: string): 'left' | 'right' | null {
    return this.assignments.players[steamid] || null;
  }

  // Set team assignment
  setTeamAssignment(teamName: string, side: 'left' | 'right'): void {
    this.assignments.teams[teamName] = side;
    this.saveAssignments();
    console.log(`📌 Set team "${teamName}" to ${side} side (persistent)`);
  }

  // Set player assignment
  setPlayerAssignment(steamid: string, side: 'left' | 'right'): void {
    this.assignments.players[steamid] = side;
    this.saveAssignments();
    console.log(`👤 Set player ${steamid} to ${side} side (persistent)`);
  }

  // Remove team assignment
  removeTeamAssignment(teamName: string): void {
    delete this.assignments.teams[teamName];
    this.saveAssignments();
    console.log(`🗑️ Removed team "${teamName}" assignment`);
  }

  // Remove player assignment
  removePlayerAssignment(steamid: string): void {
    delete this.assignments.players[steamid];
    this.saveAssignments();
    console.log(`🗑️ Removed player ${steamid} assignment`);
  }

  // Clear all assignments
  clearAllAssignments(): void {
    this.assignments.teams = {};
    this.assignments.players = {};
    this.saveAssignments();
    console.log('🧹 Cleared all persistent assignments');
  }

  // Get all assignments for display
  getAllAssignments(): TeamAssignments {
    return { ...this.assignments };
  }

  // Auto-assign players based on saved data
  autoAssignPlayers(players: any[]): Map<string, 'left' | 'right'> {
    const mapping = new Map<string, 'left' | 'right'>();

    if (!this.assignments.settings.autoAssign) {
      return mapping;
    }

    // First, try to assign based on team names
    const teamGroups = new Map<string, any[]>();
    players.forEach(player => {
      if (!teamGroups.has(player.team.name)) {
        teamGroups.set(player.team.name, []);
      }
      teamGroups.get(player.team.name)!.push(player);
    });

    // Assign teams first
    teamGroups.forEach((teamPlayers, teamName) => {
      const teamSide = this.getTeamAssignment(teamName);
      if (teamSide) {
        teamPlayers.forEach(player => {
          mapping.set(player.steamid, teamSide);
        });
        console.log(`🎯 Auto-assigned team "${teamName}" to ${teamSide} (${teamPlayers.length} players)`);
      }
    });

    // Then assign individual players (overrides team assignments)
    players.forEach(player => {
      const playerSide = this.getPlayerAssignment(player.steamid);
      if (playerSide) {
        mapping.set(player.steamid, playerSide);
        console.log(`🎯 Auto-assigned player ${player.name} to ${playerSide}`);
      }
    });

    return mapping;
  }

  // Export assignments to JSON string (for manual backup)
  exportAssignments(): string {
    return JSON.stringify(this.assignments, null, 2);
  }

  // Import assignments from JSON string
  importAssignments(jsonString: string): void {
    try {
      const imported = JSON.parse(jsonString);
      this.assignments = { ...this.assignments, ...imported };
      this.saveAssignments();
      console.log('📥 Imported team assignments successfully');
    } catch (error) {
      console.error('❌ Failed to import assignments:', error);
    }
  }
}

// Create global instance
const persistentTeamManager = new PersistentTeamManager();

// Load from localStorage on startup
persistentTeamManager.loadFromLocalStorage();

export default persistentTeamManager;