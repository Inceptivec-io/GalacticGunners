# Game atlas

`msdf-atlas.png` is a three-channel directional signed-distance atlas generated from the production TTF. `msdf-atlas.json` contains UV rectangles, advances and plane bounds. Use median(R,G,B) around the 0.5 threshold in the shader. Distance range: 12 px.
