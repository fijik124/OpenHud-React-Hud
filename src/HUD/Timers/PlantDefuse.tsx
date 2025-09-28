import { Timer } from "../MatchBar/MatchBar";
import { Player } from "csgogsi";
import * as I from "../../assets/Icons";
import { MAX_TIMER } from "./Countdown";

interface IProps {
  timer: Timer | null;
  side: "right" | "left";
  fullWidth?: boolean; // New prop for team name replacement mode
}

const getCaption = (type: "defusing" | "planting", player: Player | null) => {
  if (!player) return null;
  if (type === "defusing") {
    return (
      <>
        <div className="player-name">{player.name}</div>
        <div className="action-row">
          <I.Defuse height={18} width={18} fill="white" />
          <div>DEFUSING</div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="player-name">{player.name}</div>
      <div className="action-row">
        <I.SmallBomb height={18} fill="white" />
        <div>PLANTING</div>
      </div>
    </>
  );
};

const PlantDefuse = ({ timer, side, fullWidth = false }: IProps) => {
  if (!timer) return null;
  
  const progressPercentage = (timer.time * 100) /
    (timer.type === "planting"
      ? MAX_TIMER.planting
      : timer.player?.state.defusekit
      ? MAX_TIMER.defuse_kit
      : MAX_TIMER.defuse_nokit);
  
  if (fullWidth) {
    // Full width mode for team name replacement
    return (
      <div className={`plant-defuse-fullwidth ${timer.type} ${side}`}>
        <div 
          className={`expanding-color-bar ${timer.type}`}
          style={{
            width: `${progressPercentage}%`
          }}
        ></div>
        <div className="plant-defuse-content">
          {getCaption(timer.type, timer.player)}
        </div>
      </div>
    );
  }
  
  // Original popup mode
  return (
    <div
      className={`defuse_plant_container ${side} ${
        timer && timer.active ? "show" : "hide"
      }`}
    >
      {timer ? (
        <div className={`defuse_plant_caption`}>
          {getCaption(timer.type, timer.player)}
        </div>
      ) : null}

      <div
        className={`defuse_plant_bar ${timer.type}`}
        style={{
          width: `${progressPercentage}%`,
        }}
      ></div>
    </div>
  );
};

export default PlantDefuse;
