import { useState } from "react";
import TeamBox from "./../Players/TeamBox";
import MatchBar from "../MatchBar/MatchBar";
import Observed from "./../Players/Observed";
import RadarMaps from "./../Radar/RadarMaps";
import Trivia from "../Trivia/Trivia";
import SideBox from "../SideBoxes/SideBox";
import MoneyBox from "../SideBoxes/Money";
import UtilityLevel from "../SideBoxes/UtilityLevel";
import Killfeed from "../Killfeed/Killfeed";
import MapSeries from "../MapSeries/MapSeries";
// import Overview from "../Overview/Overview";
// import Tournament from "../Tournament/Tournament";
import { CSGO } from "csgogsi";
import { Match } from "../../API/types";
import { useAction } from "../../API/contexts/actions";
import persistentTeamManager from "./PersistentTeamManager";
interface Props {
  game: CSGO;
  match: Match | null;
}
/*
interface State {
  winner: Team | null,
  showWin: boolean,
  forceHide: boolean
}*/

// Persistent player team mapping - tracks which steamids belong to which match side
const playerTeamMapping = new Map<string, 'left' | 'right'>();

// Global function to reset player mapping (useful for debugging)
(window as any).resetPlayerMapping = () => {
  playerTeamMapping.clear();
  teamNameMapping.clear();
  persistentTeamManager.clearAllAssignments();
};

// Team name to side mapping
const teamNameMapping = new Map<string, 'left' | 'right'>();

// Global function to assign entire teams by team name (now persistent!)
(window as any).setTeamSide = (teamName: string, side: 'left' | 'right') => {
  const players = (window as any).lastGameState?.players || [];
  const teamPlayers = players.filter((p: any) => 
    p.team.name.toLowerCase().includes(teamName.toLowerCase()) ||
    teamName.toLowerCase().includes(p.team.name.toLowerCase())
  );
  
  if (teamPlayers.length > 0) {
    // Store team name mapping (persistent)
    const actualTeamName = teamPlayers[0].team.name;
    teamNameMapping.set(actualTeamName, side);
    persistentTeamManager.setTeamAssignment(actualTeamName, side);
    
    // Assign all players from this team (session + persistent)
    teamPlayers.forEach((player: any) => {
      playerTeamMapping.set(player.steamid, side);
      persistentTeamManager.setPlayerAssignment(player.steamid, side);
    });
  }
};

// Global function to manually assign individual players to teams (now persistent!)
(window as any).setPlayerTeam = (playerName: string, side: 'left' | 'right') => {
  // Find player by name and set their assignment
  const players = (window as any).lastGameState?.players || [];
  const player = players.find((p: any) => p.name.toLowerCase().includes(playerName.toLowerCase()));
  
  if (player) {
    playerTeamMapping.set(player.steamid, side);
    persistentTeamManager.setPlayerAssignment(player.steamid, side);
  }
};

// Global function to show available teams
(window as any).showAvailableTeams = () => {
  const players = (window as any).lastGameState?.players || [];
  const teams = [...new Set(players.map((p: any) => p.team.name))] as string[];
  teams.forEach((teamName) => {
    const teamPlayers = players.filter((p: any) => p.team.name === teamName);
    const currentSide = teamNameMapping.get(teamName) || 'unmapped';
  });
};

// Global function to show current mapping
(window as any).showPlayerMapping = () => {
  const players = (window as any).lastGameState?.players || [];
  
  // Group by team names
  const teamGroups = new Map<string, any[]>();
  players.forEach((player: any) => {
    if (!teamGroups.has(player.team.name)) {
      teamGroups.set(player.team.name, []);
    }
    teamGroups.get(player.team.name)!.push(player);
  });
  
  teamGroups.forEach((teamPlayers, teamName) => {
    const side = teamNameMapping.get(teamName) || playerTeamMapping.get(teamPlayers[0].steamid) || 'unmapped';
    teamPlayers.forEach((player: any) => {
      const playerSide = playerTeamMapping.get(player.steamid) || 'unmapped';
    });
  });
};

// New persistent management functions
(window as any).showPersistentAssignments = () => {
  const assignments = persistentTeamManager.getAllAssignments();
  console.log('💾 Persistent Team Assignments:');
  console.log('Teams:', assignments.teams);
  console.log('Players:', assignments.players);
  console.log('Settings:', assignments.settings);
};

(window as any).exportTeamAssignments = () => {
  const exported = persistentTeamManager.exportAssignments();
  console.log('📋 Copy this JSON to backup your assignments:');
  console.log(exported);
  return exported;
};

(window as any).importTeamAssignments = (jsonString: string) => {
  persistentTeamManager.importAssignments(jsonString);
};

(window as any).removeTeamAssignment = (teamName: string) => {
  persistentTeamManager.removeTeamAssignment(teamName);
  teamNameMapping.delete(teamName);
};

(window as any).removePlayerAssignment = (playerName: string) => {
  const players = (window as any).lastGameState?.players || [];
  const player = players.find((p: any) => p.name.toLowerCase().includes(playerName.toLowerCase()));
  if (player) {
    persistentTeamManager.removePlayerAssignment(player.steamid);
    playerTeamMapping.delete(player.steamid);
  }
};

const Layout = ({ game, match }: Props) => {
  const [forceHide, setForceHide] = useState(false);
  
  // Store game state for manual player assignment functions
  (window as any).lastGameState = game;

  useAction("boxesState", (state) => {
    if (state === "show") {
      setForceHide(false);
    } else if (state === "hide") {
      setForceHide(true);
    }
  });

  // Create persistent team mapping - teams stay on their assigned sides regardless of CT/T
  const getTeamBySide = (targetSide: "left" | "right") => {
    // Try to match with GSI team data first (persistent assignment)
    if (match) {
      const gsiLeftTeam = game.map.team_ct.id || game.map.team_t.id;
      const gsiRightTeam = game.map.team_t.id || game.map.team_ct.id;
      
      if (targetSide === "left") {
        // Find which current team corresponds to the match's left team
        return game.map.team_ct.id === match.left.id ? game.map.team_ct : game.map.team_t;
      } else {
        // Find which current team corresponds to the match's right team
        return game.map.team_ct.id === match.right.id ? game.map.team_ct : game.map.team_t;
      }
    }
    
    // Fallback to orientation-based assignment if no match data
    return targetSide === "left" 
      ? (game.map.team_ct.orientation === "left" ? game.map.team_ct : game.map.team_t)
      : (game.map.team_ct.orientation === "left" ? game.map.team_t : game.map.team_ct);
  };

  const left = getTeamBySide("left");
  const right = getTeamBySide("right");

  // Initialize persistent player mapping based on multiple strategies
  if (match && game.players.length > 0) {
    const needsMapping = game.players.some(player => !playerTeamMapping.has(player.steamid));
    
    if (needsMapping) {
      // Don't clear if we have team name mappings - preserve manual assignments
      if (teamNameMapping.size === 0) {
        playerTeamMapping.clear();
      }
      
      // Strategy 0: Use persistent assignments first (highest priority)
      const persistentMappings = persistentTeamManager.autoAssignPlayers(game.players);
      if (persistentMappings.size > 0) {
        persistentMappings.forEach((side, steamid) => {
          playerTeamMapping.set(steamid, side);
        });
        
        // Also update team name mappings from persistent data
        const teamGroups = new Map<string, any[]>();
        game.players.forEach(player => {
          if (!teamGroups.has(player.team.name)) {
            teamGroups.set(player.team.name, []);
          }
          teamGroups.get(player.team.name)!.push(player);
        });
        
        teamGroups.forEach((teamPlayers, teamName) => {
          const persistentSide = persistentTeamManager.getTeamAssignment(teamName);
          if (persistentSide) {
            teamNameMapping.set(teamName, persistentSide);
          }
        });
        
        return; // Skip other strategies - persistent data takes precedence
      }
      
      // Strategy 1: Use existing team name mappings
      if (teamNameMapping.size > 0) {
        game.players.forEach(player => {
          const teamSide = teamNameMapping.get(player.team.name);
          if (teamSide) {
            playerTeamMapping.set(player.steamid, teamSide);
          }
        });
        
        if (playerTeamMapping.size > 0) {
          return; // Skip other strategies
        }
      }
      
      // Strategy 2: Try to use match team IDs
      let mappingStrategy = 'team_id';
      game.players.forEach(player => {
        let assignedSide: 'left' | 'right' | null = null;
        
        if (player.team.id === match.left.id) {
          assignedSide = 'left';
        } else if (player.team.id === match.right.id) {
          assignedSide = 'right';
        }
        
        if (assignedSide) {
          playerTeamMapping.set(player.steamid, assignedSide);
          // Also store team name mapping for future use
          teamNameMapping.set(player.team.name, assignedSide);
        }
      });
      
      // Strategy 3: If team ID mapping failed, use orientation
      if (playerTeamMapping.size === 0) {
        mappingStrategy = 'orientation';
        game.players.forEach(player => {
          const assignedSide = player.team.orientation === 'left' ? 'left' : 'right';
          playerTeamMapping.set(player.steamid, assignedSide);
          teamNameMapping.set(player.team.name, assignedSide);
        });
      }
      
      // Strategy 4: If still no mapping, use CT/T sides (assumes left=CT initially)
      if (playerTeamMapping.size === 0) {
        mappingStrategy = 'ct_t_sides';
        game.players.forEach(player => {
          const assignedSide = player.team.side === 'CT' ? 'left' : 'right';
          playerTeamMapping.set(player.steamid, assignedSide);
          teamNameMapping.set(player.team.name, assignedSide);
        });
      }
    }
  }

  // Filter players using persistent steamid mapping
  const leftPlayers = game.players.filter((player) => {
    if (playerTeamMapping.has(player.steamid)) {
      return playerTeamMapping.get(player.steamid) === 'left';
    }
    // Fallback for unmapped players
    return player.team.orientation === 'left';
  });
  
  const rightPlayers = game.players.filter((player) => {
    if (playerTeamMapping.has(player.steamid)) {
      return playerTeamMapping.get(player.steamid) === 'right';
    }
    // Fallback for unmapped players
    return player.team.orientation === 'right';
  });

  // Determine current CT/T sides based on actual player states (for dynamic colors)
  const leftCurrentSide = leftPlayers.length > 0 ? leftPlayers[0].team.side : left.side;
  const rightCurrentSide = rightPlayers.length > 0 ? rightPlayers[0].team.side : right.side;
  
  // Create team objects with correct current sides for color display
  const leftTeamWithCurrentSide = { ...left, side: leftCurrentSide };
  const rightTeamWithCurrentSide = { ...right, side: rightCurrentSide };
  const isFreezetime =
    (game.round && game.round.phase === "freezetime") ||
    game.phase_countdowns.phase === "freezetime";
  return (
    <div className="layout">
      <div className={`players_alive`}>
        <div className="title_container">Sponsors:</div>
        <div className="counter_container">
          <div className={`team_counter ${leftCurrentSide}`}>
            {leftPlayers.filter((player) => player.state.health > 0).length}
          </div>
          <div className={`vs_counter`}>VS</div>
          <div className={`team_counter ${rightCurrentSide}`}>
            {rightPlayers.filter((player) => player.state.health > 0).length}
          </div>
        </div>
      </div>
      <Killfeed />
      {/* <Overview match={match} map={game.map} players={game.players || []} /> */}
      <RadarMaps match={match} map={game.map} game={game} />
      <MatchBar
        map={game.map}
        phase={game.phase_countdowns}
        bomb={game.bomb}
        match={match}
        leftTeam={leftTeamWithCurrentSide}
        rightTeam={rightTeamWithCurrentSide}
      />

      {/* <Tournament /> */}

      <Observed player={game.player} />

      <TeamBox
        team={leftTeamWithCurrentSide}
        players={leftPlayers}
        side="left"
        current={game.player}
      />
      <TeamBox
        team={rightTeamWithCurrentSide}
        players={rightPlayers}
        side="right"
        current={game.player}
      />

      <Trivia />
      {/* <Scout left={left.side} right={right.side} /> */}
      <MapSeries
        teams={[leftTeamWithCurrentSide, rightTeamWithCurrentSide]}
        match={match}
        isFreezetime={isFreezetime}
        map={game.map}
      />
      <div className={"boxes left"}>
        <UtilityLevel
          side={leftCurrentSide}
          players={leftPlayers}
          show={isFreezetime && !forceHide}
        />
        <SideBox side="left" hide={forceHide} />
        <MoneyBox
          team={leftCurrentSide}
          side="left"
          loss={Math.min(left.consecutive_round_losses * 500 + 1400, 3400)}
          equipment={leftPlayers
            .map((player) => player.state.equip_value)
            .reduce((pre, now) => pre + now, 0)}
          money={leftPlayers
            .map((player) => player.state.money)
            .reduce((pre, now) => pre + now, 0)}
          show={isFreezetime && !forceHide}
        />
      </div>
      <div className={"boxes right"}>
        <UtilityLevel
          side={rightCurrentSide}
          players={rightPlayers}
          show={isFreezetime && !forceHide}
        />
        <SideBox side="right" hide={forceHide} />
        <MoneyBox
          team={rightCurrentSide}
          side="right"
          loss={Math.min(right.consecutive_round_losses * 500 + 1400, 3400)}
          equipment={rightPlayers
            .map((player) => player.state.equip_value)
            .reduce((pre, now) => pre + now, 0)}
          money={rightPlayers
            .map((player) => player.state.money)
            .reduce((pre, now) => pre + now, 0)}
          show={isFreezetime && !forceHide}
        />
      </div>
    </div>
  );
};
export default Layout;
