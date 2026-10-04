# Grand Tide

Browser and Android-browser pirate action game. Complete game source and PNG artwork are included.

## Play locally

From this repository folder, run:

```bash
python -m http.server 8000
```

Open http://localhost:8000 in your browser. No build step or npm installation is required.

## Island controls

- WASD / arrow keys: move
- J: sword attack
- Space: animated dodge roll
- E / M: sea chart after conquest
- Escape: pause
- Touch: movement joystick and action buttons

## Boat battles

Select **Boat Battle** for three waves of naval combat.

- WASD / arrows: steer
- Mouse: aim; hold click to fire
- J / Space: fire cannons
- Shift / Full sail: speed boost
- Touch: joystick, Fire Cannons, and Full sail buttons

The third wave includes Blackwake's flagship. Reduce its hull to 30%, defeat its escorts, sail within boarding range, and press E or tap **Board Ship**. Defeat two deck guards and Captain Blackwake using sword attacks and rolls to capture the ship. The final island passage also includes the flagship.

## Included

- Four distinct mountain island layouts with collision and conquest progression
- Different island enemy sprites and attack animations
- Six PNG roll frames per direction
- Ship battles, three waves, aimed cannon fire, enemy shot warnings, and repairs
- Boss boarding deck and captain fight

Island progress is stored in the browser on the current device. This is a browser game, not a native Android APK.

## Files

`index.html`, `style.css`, `game.js`, `terrain.js`, `campaign.js`, `naval.js`, `boarding.js`, and `assets/` form the complete game. The artwork in this repository is the artwork used by this version.

## Footstep audio

Eight original synthesized gravel WAV variations play with player walking distance (two steps per walk cycle), without consecutive sample repeats. Audio unlocks on a key press or tap. Footsteps stop while idle, blocked, rolling, attacking, casting, paused, or sailing; walking during boarding also uses these gravel samples. Files are in `assets/audio/footsteps/`, with playback in `footsteps.js`.

## Sword audio

Four synthesized slash WAV variations in `assets/audio/sword/` play once per accepted J/mobile sword attack, avoiding consecutive repeats. Cancelling into a roll, pausing, or leaving the tab stops the sound. `sword-audio.js` preloads the clips; playback errors do not block combat.

## Background music

The soothing pirate theme with soft drums loops continuously across island exploration and boat battles. It starts after the first key press or tap, at 35% gain. The Music button toggles it independently of sound effects and remembers the setting. Switching away suspends playback; returning resumes from the same position. `music.js` uses a decoded Web Audio buffer for continuous looping; the compressed Ogg asset is in `assets/audio/music/`.
