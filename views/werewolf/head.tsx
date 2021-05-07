import classNames from "classnames";
import { Fragment } from "react";
import { Player, PlayerStatus } from "./shared";

export function PlayerHead({
  disabled,
  isMarked,
  votes,
  isWerewolf,
  onClick,
  player,
  showName = true,
}: {
  disabled?: boolean;
  isMarked?: boolean;
  votes?: string[];
  isWerewolf?: boolean;
  onClick: () => void;
  player: Player;
  showName?: boolean;
}) {
  const isDead = player.status === PlayerStatus.DEAD;

  return (
    <button
      className="w-full group focus:outline-none"
      onClick={onClick}
      disabled={disabled || isDead}
    >
      <div className="relative w-full h-full aspect-w-1 aspect-h-1">
        {!isDead && (
          <Fragment>
            <img
              alt=""
              className={classNames("mask-image-nes", {
                "filter-grayscale-full": isMarked,
              })}
              loading="eager"
              src={`https://cdn.soapbox.social/images/${player.user.image}`}
            />

            <div
              className="group-focus opacity-0 group-focus:opacity-100 absolute left-0 top-0 right-0 bottom-0 golden-border pointer-events-none"
              aria-hidden
            />
          </Fragment>
        )}

        {isWerewolf && (
          <div className="absolute">
            <div className="absolute bottom-0 right-1">
              <img
                alt=""
                aria-hidden
                className="w-8 h-8 image-rendering-pixelated"
                loading="eager"
                src="/werewolf/wolf-icon.png"
              />
            </div>
          </div>
        )}

        {isMarked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl text-center text-systemRed-dark">Marked</p>
          </div>
        )}

        {votes.length >= 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xl text-center text-systemRed-dark">{`${votes.length} vote(s)`}</p>
          </div>
        )}

        {isDead && (
          <div className="absolute">
            <img
              alt=""
              aria-hidden
              className="w-full h-full image-rendering-pixelated"
              loading="eager"
              src="/werewolf/skull-icon.png"
            />
          </div>
        )}
      </div>

      {showName && (
        <p className="text-lg text-center truncate">
          {player.user?.display_name ?? player.user.username}
        </p>
      )}
    </button>
  );
}
