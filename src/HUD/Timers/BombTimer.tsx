import { MAX_TIMER, useBombTimer } from "./Countdown";
import { C4 } from "../../assets/Icons";
import { useState, useRef, useEffect } from "react";

interface IProps {
  fullWidth?: boolean; // New prop for team name replacement mode
  side?: "left" | "right"; // New prop to know which side T team is on
}

const Bomb = ({ fullWidth = false, side = "right" }: IProps = {}) => {
  const bombData = useBombTimer();
  const show = bombData.state === "planted" || bombData.state === "defusing";
  const percentage = (bombData.bombTime * 100) / MAX_TIMER.bomb;
  
  const timerStyle = {
    width: `${percentage}%`,
  };

  if (fullWidth) {
    // Full width mode for team name replacement - shows bomb countdown
    return (
      <div className={`bomb-timer-fullwidth ${side}`}>
        <div 
          className="bomb-countdown-bar"
          style={{
            width: `${100 - percentage}%` // Countdown from 100% to 0%
          }}
        ></div>
        <div className="bomb-timer-content">
          <C4 fill="white" />
          <div>BOMB</div>
          <div>{Math.ceil(bombData.bombTime)}s</div>
        </div>
      </div>
    );
  }

  // Original bomb timer display
  return (
    <div id={`bomb_container`}>
      <div 
        className={`bomb_timer ${show ? "show" : "hide"}`}
        style={timerStyle}
      ></div>
      <div className={`bomb_icon ${show ? "show" : "hide"}`}>
        <C4 fill="white" />
      </div>
      <div className="bomb_text">
        <h3>PLANTED</h3>
      </div>
    </div>
  );
};

export default Bomb;
