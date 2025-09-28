# Player Team Assignment Guide

## Problem Solved ✅
Players were swapping between left and right teams when the match changed sides (CT/T swap). This new system creates **persistent player assignments** based on steamid mapping that **automatically saves and loads across matches**.

## How It Works

### Team-Based Assignment (New! ✨)
The easiest way to assign teams is by team name:

1. **Automatic Detection**: System detects team names and assigns all players from each team
2. **Manual Override**: Use `setTeamSide("TeamName", "left/right")` to assign entire teams at once
3. **Persistent Storage**: Team assignments are remembered and applied to all team members
4. **Partial Matching**: You can use part of the team name (case-insensitive)

### Automatic Assignment
The system tries multiple strategies to assign players to teams:

1. **Persistent Data Strategy** (NEW!): Uses saved assignments from previous matches (highest priority)
2. **Team ID Strategy**: Uses `match.left.id` and `match.right.id` to determine which players belong to which side
3. **Orientation Strategy**: Uses `player.team.orientation` (left/right) 
4. **CT/T Strategy**: Fallback that assigns CT players to left, T players to right

### Manual Override Functions
You can manually control player assignments using browser console commands:

#### View Current Assignments
```javascript
showPlayerMapping()
```
This shows which players are assigned to which teams.

#### Reset Player Mapping
```javascript
resetPlayerMapping()
```
Clears all assignments and forces re-detection on next update.

#### Assign Entire Teams (Recommended)
```javascript
setTeamSide("TeamName", "left")       // Assign entire team to left side
setTeamSide("TeamName", "right")      // Assign entire team to right side
```

#### View Available Teams
```javascript
showAvailableTeams()                  // Shows all team names and current assignments
```

#### Manually Assign Individual Players (Backup)
```javascript
setPlayerTeam("PlayerName", "left")   // Assign individual player to left team
setPlayerTeam("PlayerName", "right")  // Assign individual player to right team
```

#### Persistent Assignment Management (NEW! 🔥)
```javascript
showPersistentAssignments()           // Show all saved assignments
exportTeamAssignments()               // Export assignments as JSON backup
importTeamAssignments(jsonString)     // Import assignments from JSON
removeTeamAssignment("TeamName")      // Remove saved team assignment
removePlayerAssignment("PlayerName")  // Remove saved player assignment
```

## Usage Examples

### Scenario 1: Teams are on wrong sides (Easy Method)
1. Open browser console (F12)
2. Type `showAvailableTeams()` to see team names
3. Use `setTeamSide("TeamA", "left")` to assign entire team
4. Use `setTeamSide("TeamB", "right")` to assign entire team

### Scenario 1b: Individual players are on wrong teams
1. Open browser console (F12)  
2. Type `showPlayerMapping()` to see current assignments
3. Use `setPlayerTeam("player1", "left")` to fix assignments
4. Use `setPlayerTeam("player2", "right")` to fix assignments

### Scenario 2: Match starts with wrong setup
1. Open console and type `resetPlayerMapping()`
2. Wait for next game state update (should happen automatically)
3. Check with `showPlayerMapping()` if assignments look correct
4. If not, use manual assignment commands

### Scenario 3: Swapping teams to different sides
If you want to move teams to opposite sides:

**Example**: Team Alpha is on left (blue/CT), Team Bravo is on right (red/T)
To swap them:
```javascript
setTeamSide("Team Alpha", "right")  // Move Team Alpha to right side
setTeamSide("Team Bravo", "left")   // Move Team Bravo to left side
```
**Result**: Team Alpha now on right (red/T), Team Bravo now on left (blue/CT)

### Scenario 4: Mid-match correction
Teams and players stay assigned throughout the match, but if something goes wrong:
1. **Quick fix**: Use `setTeamSide("TeamName", "side")` to reassign entire team
2. **Individual fix**: Use `setPlayerTeam("PlayerName", "side")` to fix individual players
3. The assignment will persist for the rest of the match

### Scenario 5: Setting up for a tournament (NEW!)
Once per tournament, set up all teams:
```javascript
// Set up all teams once
setTeamSide("Natus Vincere", "left")
setTeamSide("G2 Esports", "left") 
setTeamSide("FaZe Clan", "right")
setTeamSide("Team Liquid", "right")

// Export as backup
exportTeamAssignments()  // Copy the JSON output
```
**Result**: All future matches automatically assign teams correctly!

### Scenario 6: Sharing assignments between setups
Copy assignments between computers or backup your config:
```javascript
// On first computer - export
const backup = exportTeamAssignments()

// On second computer - import  
importTeamAssignments(backup)
```

### Scenario 7: Team name variations
System handles team name changes automatically:
```javascript
setTeamSide("Natus Vincere", "left")  // Saves "Natus Vincere"

// All these will auto-match to left side:
// ✅ "NAVI" 
// ✅ "Na'Vi"
// ✅ "Natus Vincere"
// ✅ "NaVi.GG"
```

## Persistent Assignments Across Matches 🔥

### NEW: Automatic Assignment System
The system now **automatically saves and loads team assignments** across matches! Once you assign teams, they'll be remembered forever.

#### How It Works
1. **Set team once** - `setTeamSide("Team Alpha", "left")`
2. **Automatic detection** - System recognizes teams in future matches
3. **Instant assignment** - Players automatically go to their saved sides
4. **Cross-match memory** - Works across different matches, maps, and sessions

#### Benefits
- ✅ **Set once, use forever** - No need to reassign teams every match
- ✅ **Automatic team recognition** - System finds teams even with slight name variations
- ✅ **Individual overrides** - Can still manually assign specific players
- ✅ **Backup and restore** - Export/import assignments as JSON
- ✅ **Match-independent** - Works across different tournaments and series

#### Storage System
- **Browser localStorage** - Assignments saved locally in your browser
- **JSON format** - Easy to backup and share with others
- **Team + Player mapping** - Supports both team names and individual steamids
- **Fallback system** - Still works if saved data is unavailable

### Example Workflow
```javascript
// First time setup (once per team)
setTeamSide("Natus Vincere", "left")   // Save Na'Vi to left side
setTeamSide("FaZe Clan", "right")      // Save FaZe to right side

// Future matches automatically detect:
// ✅ "NAVI" → left side (partial match)
// ✅ "Natus Vincere" → left side (exact match)  
// ✅ "FaZe" → right side (partial match)
// ✅ "FaZe Clan" → right side (exact match)
```

## Technical Details

### Session Storage (Temporary)
- Player assignments are stored in a `Map<steamid, 'left'|'right'>`
- Assignments persist throughout the match until reset
- Based on steamid (unique player identifier)

### Persistent Storage (Permanent)
- **localStorage**: Browser-based permanent storage
- **Team mappings**: `{"Team Name": "left|right"}`
- **Player mappings**: `{"steamid": "left|right"}`
- **Auto-assignment**: Enabled by default, can be toggled
- **JSON backup**: Export/import for sharing between setups

### Fallback System
If automatic detection fails:
1. System tries team ID matching first
2. Falls back to player orientation
3. Last resort uses CT/T sides
4. Manual override always takes precedence

### Console Output
The system logs all assignments:
```
Player mapping strategy: team_id
Player assignments:
  Player1 → left (team: CT, orientation: left)
  Player2 → right (team: T, orientation: right)
```

## Common Issues & Solutions

### Issue: Teams/Players still swapping
**Solution**: Use team assignment (easier) or manual assignment
```javascript
// Easy fix - assign entire teams
setTeamSide("Team A", "left")
setTeamSide("Team B", "right")

// Individual fix
setPlayerTeam("player1", "left")
setPlayerTeam("player2", "right")
```

### Issue: Can't find team/player name
**Solution**: Check available teams and players
```javascript
showAvailableTeams()  // Shows all team names and assignments
showPlayerMapping()   // Shows all players and current assignments
```

### Issue: Assignment not working
**Solution**: Reset and try again
```javascript
resetPlayerMapping()
// Wait 5-10 seconds for re-detection
showPlayerMapping()
```

## Best Practices

### For Tournament Organizers 🏆
1. **Set up teams once per tournament** - Use `setTeamSide()` for all teams at tournament start
2. **Export assignments as backup** - Use `exportTeamAssignments()` and save the JSON
3. **Import on new setups** - Use `importTeamAssignments()` to copy settings between computers
4. **Use team names, not individual players** - Easier to manage and more reliable

### For Match Operations 📺  
1. **Let auto-assignment work** - System will detect teams automatically in most cases
2. **Check assignments before going live** - Use `showPersistentAssignments()` to verify
3. **Use partial team names for flexibility** - System finds "NAVI" even if saved as "Natus Vincere"
4. **Keep consistent team names** - Try to use the same names across matches for better detection

### For Troubleshooting 🔧
1. **Check persistent data first** - `showPersistentAssignments()` shows what's saved
2. **Verify current state** - `showPlayerMapping()` shows active assignments  
3. **Reset only if needed** - `resetPlayerMapping()` clears everything (use sparingly)
4. **Remove bad assignments** - `removeTeamAssignment()` for specific fixes

## Dynamic Color System ✅

### How Colors Work
The system uses **dynamic colors** that change based on which team is currently playing which side:

### Color Logic
- **Team playing CT** → Gets **BLUE** colors (Counter-Terrorist theme)
- **Team playing T** → Gets **RED** colors (Terrorist theme)

### What This Means
1. **Teams stay on assigned sides** (left/right) but colors change with CT/T roles
2. **Easy team swapping** - use `setTeamSide()` to move teams between left/right
3. **Automatic color updates** - colors reflect current CT/T status
4. **Realistic representation** - colors match actual game roles

### Result
- **Left side team** → Blue when playing CT, Red when playing T
- **Right side team** → Blue when playing CT, Red when playing T  
- When you swap teams with `setTeamSide()`, **players move and colors update automatically**
- Colors always match the team's current game role (CT/T)

## Integration with Existing Features

- ✅ **Persistent assignment system** - team assignments saved across matches automatically
- ✅ **Dynamic color system** - colors change based on CT/T roles  
- ✅ **MatchBar colors** automatically update with team roles (scores, team names, borders)
- ✅ **Team logos and names** stay persistent on their sides
- ✅ **Player stats, utilities, money** follow the players correctly
- ✅ **All HUD elements** respect the new assignments and color correctly
- ✅ **Cross-match memory** - once assigned, teams automatically detected in future matches
- ✅ **Backup and restore** - export/import assignments between setups