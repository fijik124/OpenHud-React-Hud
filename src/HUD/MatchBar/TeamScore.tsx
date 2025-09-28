import * as I from "csgogsi";
import { Timer } from "./MatchBar";
import TeamLogo from "./TeamLogo";
import PlantDefuse from "../Timers/PlantDefuse";
import { ONGSI } from "../../API/contexts/actions";
import WinAnnouncement from "./WinIndicator";
import { useState } from "react";
import Bomb from "./../Timers/BombTimer";
import { useBombTimer } from "./../Timers/Countdown";

interface IProps {
  orientation: "left" | "right";
  timer: Timer | null;
  team: I.Team;
  timeout: boolean;
}

const TeamScore = ({ orientation, timer, team, timeout }: IProps) => {
  const [show, setShow] = useState(false);

  ONGSI(
    "roundEnd",
    (result) => {
      if (result.winner.orientation !== orientation) return;
      setShow(true);

      setTimeout(() => {
        setShow(false);
      }, 5000);
    },
    [orientation]
  );

  const isPlantingOrDefusing = timer?.active && timer?.player;
  const bombData = useBombTimer();

  // Determine what to display based on game state and team side
  const renderContent = (team: any, orientation: any) => {
    // Show bomb countdown timer if bomb is planted and this is the T side
    if (bombData.state === "planted" && team.side === "T") {
      return (
        <div className={`team-name ${orientation} ${team.side} bomb-countdown`}>
          <Bomb fullWidth={true} side={orientation} />
        </div>
      );
    }
    // Show defuse progress if someone is defusing and this is the CT side
    else if (bombData.state === "defusing" && team.side === "CT") {
      return (
        <div className={`team-name ${orientation} ${team.side} defusing`}>
          <PlantDefuse timer={timer} side={orientation} fullWidth={true} />
        </div>
      );
    }
    // Show plant/defuse progress for the team performing the action
    else if (isPlantingOrDefusing) {
      if (timer?.type === "planting" && team.side === "T") {
        return (
          <div className={`team-name ${orientation} ${team.side} planting`}>
            <PlantDefuse timer={timer} side={orientation} fullWidth={true} />
          </div>
        );
      }
      else if (timer?.type === "defusing" && team.side === "CT") {
        return (
          <div className={`team-name ${orientation} ${team.side} defusing`}>
            <PlantDefuse timer={timer} side={orientation} fullWidth={true} />
          </div>
        );
      }
    }
    
    // Default to showing the team name or timeout message
    return (
      <div className={`team-name ${orientation} ${team.side}`}>
        {timeout === true ? "TIMEOUT" : team?.name || null}
      </div>
    );
  };

  return (
    <>
      <div className={`team ${orientation}`}>
        <TeamLogo team={team} />
        {renderContent(team, orientation)}
      </div>
      <WinAnnouncement team={team} show={show} />
    </>
  );
};

export default TeamScore;