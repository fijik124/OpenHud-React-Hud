# Team Persistence Changes

## Overview
Modified the CS:GO overlay to ensure teams remain persistent on their designated sides throughout the match, while only the colors change based on their current CT/T status.

## What Was Changed

### 1. App.tsx - Team Assignment Logic
**Before**: Teams were swapped between left/right sides based on the `isReversed` flag from match vetos.
**After**: Teams are always assigned to their consistent sides:
- Match left team → Always displayed on left side
- Match right team → Always displayed on right side

```tsx
// OLD CODE - Teams swapped based on isReversed
if (!isReversed) {
  GSI.teams.left = gsiTeamData;
} else {
  GSI.teams.right = gsiTeamData;
}

// NEW CODE - Teams stay persistent
GSI.teams.left = gsiTeamData; // Always assign left team to left side
```

### 2. Layout.tsx - Team Display Logic
**Before**: Teams were assigned to left/right based on their CT/T orientation.
**After**: Teams are assigned based on match data, ensuring consistency.

```tsx
// OLD CODE - Based on CT/T orientation
const left = game.map.team_ct.orientation === "left" ? game.map.team_ct : game.map.team_t;

// NEW CODE - Based on match team assignment
const getTeamBySide = (targetSide: "left" | "right") => {
  if (match) {
    return targetSide === "left" 
      ? (game.map.team_ct.id === match.left.id ? game.map.team_ct : game.map.team_t)
      : (game.map.team_ct.id === match.right.id ? game.map.team_ct : game.map.team_t);
  }
  // Fallback to orientation if no match data
  return targetSide === "left" 
    ? (game.map.team_ct.orientation === "left" ? game.map.team_ct : game.map.team_t)
    : (game.map.team_ct.orientation === "left" ? game.map.team_t : game.map.team_ct);
};
```

**Player Filtering Fix**:
**Before**: Players were filtered by their current CT/T side, causing them to swap teams.
**After**: Players are filtered by their team ID to stay with their persistent teams.

```tsx
// OLD CODE - Players filtered by current side (causes swapping)
const leftPlayers = game.players.filter(player => player.team.side === left.side);

// NEW CODE - Players filtered by team ID (persistent)
const leftPlayers = game.players.filter(player => {
  if (match) {
    return player.team.id === match.left.id; // Filter by match team ID
  }
  return player.team.side === left.side; // Fallback
});
```

### 3. MatchBar.tsx - Same Persistent Logic
Applied the same team persistence logic to the match bar component.

### 4. SideBoxes/UtilityLevel.tsx - Fixed Player Filtering
**Before**: Component filtered players by CT/T side internally, causing utility data to swap.
**After**: Component now receives pre-filtered players from Layout, ensuring consistent utility display.

```tsx
// OLD CODE - Internal filtering by side (causes swapping)
function parseGrenades(players: Player[], side: Side) {
  const grenades = players
    .filter((player) => player.team.side === side) // This caused swapping
    .map(player => ...)
}

// NEW CODE - Uses pre-filtered players
function parseGrenades(players: Player[], side: Side) {
  // Players are already filtered by the parent component
  const grenades = players
    .map(player => ...)
}
```

## How It Works Now

### Team Positioning
- **Team 1** (match.left): Always appears on the left side of the overlay
- **Team 2** (match.right): Always appears on the right side of the overlay

### Color System
Colors are determined by the team's current CT/T status:
- **CT Side**: Blue color (`var(--color-new-ct)`)
- **T Side**: Red color (`var(--color-new-t)`)

### CSS Classes
The existing CSS system automatically handles color changes:
```scss
.teambox {
  &.CT {
    .player .hp_bar, .obs_slot {
      background-color: var(--color-new-ct); // Blue
    }
  }
  &.T {
    .player .hp_bar, .obs_slot {
      background-color: var(--color-new-t); // Red
    }
  }
}
```

## Player Swapping Issue - FIXED ✅

### The Problem
Initially, teams stayed on their sides but **players were swapping** between the left and right teams when sides changed (CT/T swap). This happened because:

1. **Team objects** were correctly persistent based on match data
2. **Player filtering** was still using `player.team.side === left.side` 
3. When teams switched from CT to T (or vice versa), the `left.side` value changed
4. This caused players to be filtered into the opposite team's display

### The Solution
1. **Filter players by team ID**: Use `player.team.id === match.left.id` instead of side-based filtering
2. **Pre-filter players**: Pass filtered player arrays to child components instead of letting them filter by side
3. **Remove redundant filtering**: Updated UtilityLevel component to use pre-filtered players

### Result
- ✅ Teams stay on their designated sides
- ✅ Players stay with their teams throughout the match  
- ✅ Colors correctly change based on current CT/T status (fixed!)
- ✅ All stats, utilities, and money displays remain with the correct teams

### Color System Fix
**Additional Fix**: Updated color assignment to use current player states instead of persistent team objects:

```tsx
// Detect current CT/T sides from actual players
const leftCurrentSide = leftPlayers.length > 0 ? leftPlayers[0].team.side : left.side;
const rightCurrentSide = rightPlayers.length > 0 ? rightPlayers[0].team.side : right.side;

// Use current sides for all color-dependent components
<TeamBox team={{...left, side: leftCurrentSide}} />
```

## Benefits
1. **Consistent Team Identity**: Viewers always know which team is which
2. **Consistent Player Rosters**: Players never swap between team displays
3. **Clear Visual Feedback**: Colors change to show which side each team is currently playing
4. **Better Broadcasting**: Commentators and viewers can refer to "left team" and "right team" consistently
5. **Maintains Game Logic**: All existing functionality (bomb timers, player stats, etc.) works unchanged

## Example Scenario
- **First Half**: Team A (left) plays as Terrorists (red), Team B (right) plays as Counter-Terrorists (blue)
- **Second Half**: Team A (left) plays as Counter-Terrorists (blue), Team B (right) plays as Terrorists (red)
- **Result**: Team positions stay the same, only colors swap to reflect their current roles

## Fallback Behavior
If match data is unavailable, the system falls back to the original orientation-based assignment to prevent breaking functionality.