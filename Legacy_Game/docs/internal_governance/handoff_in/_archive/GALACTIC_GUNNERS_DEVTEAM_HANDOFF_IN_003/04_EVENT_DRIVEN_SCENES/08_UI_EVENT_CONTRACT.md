# UI EVENT CONTRACT

The following are stateful runtime components:

- menu buttons;
- result-screen buttons;
- score counter;
- lives counter;
- nuke counter;
- rearm counter;
- replay counter;
- sound on/off;
- pause/resume;
- selection pointer;
- touch selector;
- info/back navigation.

Required state model where applicable:

```text
IDLE
FOCUSED / HOVERED
SELECTED / PRESSED
DISABLED
```

Events must work for:
- pointer/mouse;
- touch;
- keyboard;
- controller.

UI must not depend solely on colour to indicate state where a stronger cue is practical.
