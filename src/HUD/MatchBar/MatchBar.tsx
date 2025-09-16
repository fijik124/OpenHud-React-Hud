import * as I from "csgogsi";
import "./matchbar.scss";
import TeamScore from "./TeamScore";
import Bomb from "./../Timers/BombTimer";
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
  const { bomb, match, map, phase } = props;
  const amountOfMaps =
    (match && Math.floor(Number(match.matchType.substr(-1)) / 2) + 1) || 0;
  const time = stringToClock(phase.phase_ends_in);
  const pause = phase && phase.phase === "paused";
  const TimeoutT = phase && phase.phase === "timeout_t";
  const TimeoutCT = phase && phase.phase === "timeout_ct";
  const Timeout = TimeoutT || TimeoutCT;
  const left = map.team_ct.orientation === "left" ? map.team_ct : map.team_t;
  const right = map.team_ct.orientation === "left" ? map.team_t : map.team_ct;
  const isPlanted =
    bomb && (bomb.state === "defusing" || bomb.state === "planted");
  const bo = (match && Number(match.matchType.substr(-1))) || 0;

  const bombData = useBombTimer();
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

            <div className={`score right ${left.side}`}>{left.score}</div>
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

            <Bomb />
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

            <div className={`score right ${right.side}`}>{right.score}</div>
          </div>
          <TeamScore
            team={left}
            orientation={"right"}
            timer={left.side === "CT" ? defuseTimer : plantTimer}
            timeout={TimeoutT}
          />
        </div>
      </div>
    </>
  );
};

export default Matchbar;
