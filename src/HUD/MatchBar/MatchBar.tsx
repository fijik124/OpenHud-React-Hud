import * as I from "csgogsi";
import "./matchbar.scss";
import TeamScore from "./TeamScore";

import { useBombTimer } from "./../Timers/Countdown";
import { Match } from "./../../API/types";

function stringToClock(time: string | number, pad = true) {
  if (typeof time === "string") {
    time = parseFloat(time);
  }
  const countdown = Math.abs(Math.ceil(time));
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown - minutes * 60;
  if (pad && seconds < 10) {
    return `${minutes}:0${seconds}`;
  }
  return `${minutes}:${seconds}`;
}

interface IProps {
  match: Match | null;
  map: I.Map;
  phase: I.CSGO["phase_countdowns"];
  bomb: I.Bomb | null;
  leftTeam?: I.Team;
  rightTeam?: I.Team;
}

export interface Timer {
  time: number;
  active: boolean;
  side: "left" | "right";
  type: "defusing" | "planting";
  player: I.Player | null;
}

const getRoundLabel = (mapRound: number) => {
  const round = mapRound + 1;
  if (round <= 24) {
    return `Round ${round} / 24`;
  }
  const additionalRounds = round - 24;
  const OT = Math.ceil(additionalRounds / 6);
  return `OT ${OT} (${additionalRounds - (OT - 1) * 6}/6)`;
};

const Matchbar = (props: IProps) => {
  const { bomb, match, map, phase, leftTeam, rightTeam } = props;
  const amountOfMaps =
    (match && Math.floor(Number(match.matchType.substr(-1)) / 2) + 1) || 0;
  const time = stringToClock(phase.phase_ends_in);
  const pause = phase && phase.phase === "paused";
  const TimeoutT = phase && phase.phase === "timeout_t";
  const TimeoutCT = phase && phase.phase === "timeout_ct";
  const Timeout = TimeoutT || TimeoutCT;
  // Create fallback team mapping only if teams aren't provided from parent
  const getTeamBySide = (targetSide: "left" | "right") => {
    // Try to match with match data first (persistent assignment)
    if (match) {
      if (targetSide === "left") {
        // Find which current team corresponds to the match's left team
        return map.team_ct.id === match.left.id ? map.team_ct : map.team_t;
      } else {
        // Find which current team corresponds to the match's right team
        return map.team_ct.id === match.right.id ? map.team_ct : map.team_t;
      }
    }
    
    // Fallback to orientation-based assignment if no match data
    return targetSide === "left" 
      ? (map.team_ct.orientation === "left" ? map.team_ct : map.team_t)
      : (map.team_ct.orientation === "left" ? map.team_t : map.team_ct);
  };

  // Use passed teams with current sides from Layout (preferred) or fallback to local detection
  const left = leftTeam || getTeamBySide("left");
  const right = rightTeam || getTeamBySide("right");
  
  const isPlanted =
    bomb && (bomb.state === "defusing" || bomb.state === "planted");
  const bo = (match && Number(match.matchType.substr(-1))) || 0;

  const bombData = useBombTimer();
  // const bombPlanted = bombData.state === "planted" || bombData.state === "defusing"; // Unused variable removed for cleaner code
  const plantTimer: Timer | null =
    bombData.state === "planting"
      ? {
          time: bombData.plantTime,
          active: true,
          side: bombData.player?.team.orientation || "right",
          player: bombData.player,
          type: "planting",
        }
      : null;
  const defuseTimer: Timer | null =
    bombData.state === "defusing"
      ? {
          time: bombData.defuseTime,
          active: true,
          side: bombData.player?.team.orientation || "left",
          player: bombData.player,
          type: "defusing",
        }
      : null;

  return (
    <>
      <div>
        <div id={`matchbar`}>
          <TeamScore
            team={left}
            orientation={"left"}
            timer={left.side === "CT" ? defuseTimer : plantTimer}
            timeout={TimeoutCT}
          />
          <div className="wins_box_container left">
            <div className="wins_box_flex">
              {new Array(amountOfMaps).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`wins_box ${
                    left.matches_won_this_series > i ? "win" : ""
                  } ${left.side}`}
                />
              ))}
            </div>

            {/* MODIFIED: Removed 'right' class from score to keep site layout but only use CT/T for color */}
            <div className={`score ${left.side}`}>{left.score}</div>
          </div>
          <div id="timer" className={bo === 0 ? "no-bo" : ""}>
            <div id="round_now" className={isPlanted ? "hide" : ""}>
              {getRoundLabel(map.round)}
            </div>
            {pause ? (
              <div id="pause_timer">PAUSED</div>
            ) : (
              time > "0" && (
                <div
                  id={`round_timer_text`}
                  className={isPlanted ? "hide" : ""}
                >
                  {time}
                </div>
              )
            )}

            
          </div>
          <div className="wins_box_container right">
            <div className="wins_box_flex">
              {new Array(amountOfMaps).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`wins_box ${
                    right.matches_won_this_series > i ? "win" : ""
                  } ${right.side}`}
                />
              ))}
            </div>

            {/* MODIFIED: Kept 'right' class and kept CT/T for color */}
            <div className={`score right ${right.side}`}>{right.score}</div>
          </div>
          <div>
          <TeamScore
            team={right}
            orientation={"right"}
            timer={right.side === "T" ? plantTimer : defuseTimer}
            timeout={TimeoutT}
          />
          </div>
        </div>
      </div>
    </>
  );
};

export default Matchbar;