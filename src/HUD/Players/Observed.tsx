import React, { useState } from "react";
import { Player } from "csgogsi";
import Weapon from "./../Weapon/Weapon";
import Avatar from "./Avatar";
import TeamLogo from "./../MatchBar/TeamLogo";
import "./observed.scss";
import { getCountry } from "./../countries";
import {
  ArmorHelmet,
  ArmorFull,
  HealthFull,
  Bullets,
} from "../../assets/Icons";
import { apiUrl } from "./../../API";
import { useAction } from "../../API/contexts/actions";
import { RoundKills } from "../Indicators/RoundKills";
import Bomb from "../Indicators/Bomb";
import Defuse from "../Indicators/Defuse";

const Statistic = React.memo(
  ({ label, value }: { label: string; value: string | number }) => {
    return (
      <div className="stat">
        <div className="label">{label}</div>
        <div className="value">{value}</div>
      </div>
    );
  }
);

const Observed = ({ player }: { player: Player | null }) => {
  const [showCam, setShowCam] = useState(true);

  useAction("toggleCams", () => {
    setShowCam((p) => !p);
  });

  if (!player) return null;

  const country = player.country || player.team.country;
  const currentWeapon = player.weapons.filter(
    (weapon) => weapon.state === "active"
  )[0];
  const grenades = player.weapons.filter((weapon) => weapon.type === "Grenade");
  const { stats } = player;
  const ratio = stats.deaths === 0 ? stats.kills : stats.kills / stats.deaths;
  const countryName = country ? getCountry(country) : null;
  const healthbarWidth = { width: `${player.state.health}%` };

  return (
    <div className="observed_container">
      <div className={`avatar_holder ${player.team.side}`}>
        <RoundKills player={player} />
        <Avatar
          teamId={player.team.id}
          steamid={player.steamid}
          height={140}
          width={140}
          showCam={showCam}
          slot={player.observer_slot}
          teamSide={player.team.side}
        />
      </div>
      <div className={`observed ${player.team.side}`}>
        <div className="main_row">
          <div className="username_container">
            <div className="username">{player.name}</div>
          </div>
        </div>
        <div className="utility_row">
          <div className="bomb_kit_container">
            <Bomb player={player} />
            <Defuse player={player} />
          </div>
          <div className="grenade_container">
            {grenades.map((grenade) => (
              <React.Fragment
                key={`${player.steamid}_${grenade.name}_${
                  grenade.ammo_reserve || 1
                }`}
              >
                <Weapon
                  weapon={grenade.name}
                  active={grenade.state === "active"}
                  isGrenade
                />
                {grenade.ammo_reserve === 2 ? (
                  <Weapon
                    weapon={grenade.name}
                    active={grenade.state === "active"}
                    isGrenade
                  />
                ) : null}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="ammo_row">
          {/* {currentWeapon &&
            currentWeapon.type !== "C4" &&
            currentWeapon.type !== "Knife" &&
            currentWeapon.type !== "Grenade" && ( */}
          <div className="ammo">
            <div className="ammo_icon_container">
              <Bullets />
            </div>
            <div className="ammo_counter">
              <div className="ammo_clip">
                {(currentWeapon && currentWeapon.ammo_clip) || "-"}
              </div>
              <div className="ammo_reserve">
                /{(currentWeapon && currentWeapon.ammo_reserve) || "-"}
              </div>
            </div>
          </div>
          {/* )} */}
        </div>
        <div className="health_row">
          <div className="health_armor_container">
            <div className="healthbar-container">
              <div className="healthbar" style={healthbarWidth}></div>
            </div>
            <div className="health-icon icon">
              <HealthFull />
            </div>
            <div className="health text">{player.state.health}</div>
            <div className="armor-icon icon">
              {player.state.helmet ? <ArmorHelmet /> : <ArmorFull />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Observed;
