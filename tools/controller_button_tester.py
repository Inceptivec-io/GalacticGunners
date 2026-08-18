import ctypes
import json
import sys
import tkinter as tk
from pathlib import Path
from tkinter import ttk


MAXPNAMELEN = 32
MAX_JOYSTICKOEMVXDNAME = 260
JOY_RETURNX = 0x00000001
JOY_RETURNY = 0x00000002
JOY_RETURNZ = 0x00000004
JOY_RETURNR = 0x00000008
JOY_RETURNU = 0x00000010
JOY_RETURNV = 0x00000020
JOY_RETURNPOV = 0x00000040
JOY_RETURNBUTTONS = 0x00000080
JOY_RETURNALL = (
    JOY_RETURNX
    | JOY_RETURNY
    | JOY_RETURNZ
    | JOY_RETURNR
    | JOY_RETURNU
    | JOY_RETURNV
    | JOY_RETURNPOV
    | JOY_RETURNBUTTONS
)
JOYERR_NOERROR = 0
JOYERR_PARMS = 165
MMSYSERR_NODRIVER = 6
ERROR_SUCCESS = 0

XINPUT_GAMEPAD_DPAD_UP = 0x0001
XINPUT_GAMEPAD_DPAD_DOWN = 0x0002
XINPUT_GAMEPAD_DPAD_LEFT = 0x0004
XINPUT_GAMEPAD_DPAD_RIGHT = 0x0008
XINPUT_GAMEPAD_START = 0x0010
XINPUT_GAMEPAD_BACK = 0x0020
XINPUT_GAMEPAD_LEFT_THUMB = 0x0040
XINPUT_GAMEPAD_RIGHT_THUMB = 0x0080
XINPUT_GAMEPAD_LEFT_SHOULDER = 0x0100
XINPUT_GAMEPAD_RIGHT_SHOULDER = 0x0200
XINPUT_GAMEPAD_A = 0x1000
XINPUT_GAMEPAD_B = 0x2000
XINPUT_GAMEPAD_X = 0x4000
XINPUT_GAMEPAD_Y = 0x8000

XINPUT_BUTTON_MAP = {
    XINPUT_GAMEPAD_A: 0,
    XINPUT_GAMEPAD_B: 1,
    XINPUT_GAMEPAD_X: 2,
    XINPUT_GAMEPAD_Y: 3,
    XINPUT_GAMEPAD_LEFT_SHOULDER: 4,
    XINPUT_GAMEPAD_RIGHT_SHOULDER: 5,
    XINPUT_GAMEPAD_BACK: 8,
    XINPUT_GAMEPAD_START: 9,
    XINPUT_GAMEPAD_LEFT_THUMB: 10,
    XINPUT_GAMEPAD_RIGHT_THUMB: 11,
    XINPUT_GAMEPAD_DPAD_UP: 12,
    XINPUT_GAMEPAD_DPAD_DOWN: 13,
    XINPUT_GAMEPAD_DPAD_LEFT: 14,
    XINPUT_GAMEPAD_DPAD_RIGHT: 15,
}


PROFILE_PATH = Path(__file__).with_name("controller_profiles.json")


XBOX_TEMPLATE = {
    0: "A",
    1: "B",
    2: "X",
    3: "Y",
    4: "LB",
    5: "RB",
    6: "LT",
    7: "RT",
    8: "Back",
    9: "Start",
    10: "LS Click",
    11: "RS Click",
    12: "D-pad Up",
    13: "D-pad Down",
    14: "D-pad Left",
    15: "D-pad Right",
}

GALACTIC_GUNNERS_TEMPLATE = {
    0: "Laser",
    1: "Nuke",
    6: "LT",
    7: "RT",
    8: "Back",
    9: "Start / Pause",
    12: "Up",
    13: "Down",
    14: "Left",
    15: "Right",
}


class JoyCapsW(ctypes.Structure):
    _fields_ = [
        ("wMid", ctypes.c_ushort),
        ("wPid", ctypes.c_ushort),
        ("szPname", ctypes.c_wchar * MAXPNAMELEN),
        ("wXmin", ctypes.c_uint),
        ("wXmax", ctypes.c_uint),
        ("wYmin", ctypes.c_uint),
        ("wYmax", ctypes.c_uint),
        ("wZmin", ctypes.c_uint),
        ("wZmax", ctypes.c_uint),
        ("wNumButtons", ctypes.c_uint),
        ("wPeriodMin", ctypes.c_uint),
        ("wPeriodMax", ctypes.c_uint),
        ("wRmin", ctypes.c_uint),
        ("wRmax", ctypes.c_uint),
        ("wUmin", ctypes.c_uint),
        ("wUmax", ctypes.c_uint),
        ("wVmin", ctypes.c_uint),
        ("wVmax", ctypes.c_uint),
        ("wCaps", ctypes.c_uint),
        ("wMaxAxes", ctypes.c_uint),
        ("wNumAxes", ctypes.c_uint),
        ("wMaxButtons", ctypes.c_uint),
        ("szRegKey", ctypes.c_wchar * MAXPNAMELEN),
        ("szOEMVxD", ctypes.c_wchar * MAX_JOYSTICKOEMVXDNAME),
    ]


class JoyInfoEx(ctypes.Structure):
    _fields_ = [
        ("dwSize", ctypes.c_uint),
        ("dwFlags", ctypes.c_uint),
        ("dwXpos", ctypes.c_uint),
        ("dwYpos", ctypes.c_uint),
        ("dwZpos", ctypes.c_uint),
        ("dwRpos", ctypes.c_uint),
        ("dwUpos", ctypes.c_uint),
        ("dwVpos", ctypes.c_uint),
        ("dwButtons", ctypes.c_uint),
        ("dwButtonNumber", ctypes.c_uint),
        ("dwPOV", ctypes.c_uint),
        ("dwReserved1", ctypes.c_uint),
        ("dwReserved2", ctypes.c_uint),
    ]


class XInputGamepad(ctypes.Structure):
    _fields_ = [
        ("wButtons", ctypes.c_ushort),
        ("bLeftTrigger", ctypes.c_ubyte),
        ("bRightTrigger", ctypes.c_ubyte),
        ("sThumbLX", ctypes.c_short),
        ("sThumbLY", ctypes.c_short),
        ("sThumbRX", ctypes.c_short),
        ("sThumbRY", ctypes.c_short),
    ]


class XInputState(ctypes.Structure):
    _fields_ = [
        ("dwPacketNumber", ctypes.c_uint),
        ("Gamepad", XInputGamepad),
    ]


class ControllerState:
    def __init__(self, button_mask, axes, pov=0xFFFF):
        self.button_mask = button_mask
        self.axes = axes
        self.pov = pov


class WinMMJoystick:
    def __init__(self):
        self.winmm = ctypes.windll.winmm
        self.winmm.joyGetDevCapsW.argtypes = [
            ctypes.c_uint,
            ctypes.POINTER(JoyCapsW),
            ctypes.c_uint,
        ]
        self.winmm.joyGetDevCapsW.restype = ctypes.c_uint
        self.winmm.joyGetPosEx.argtypes = [ctypes.c_uint, ctypes.POINTER(JoyInfoEx)]
        self.winmm.joyGetPosEx.restype = ctypes.c_uint

    def devices(self):
        devices = []
        count = self.winmm.joyGetNumDevs()

        for device_id in range(count):
            caps = JoyCapsW()
            result = self.winmm.joyGetDevCapsW(
                device_id, ctypes.byref(caps), ctypes.sizeof(caps)
            )

            if result == JOYERR_NOERROR:
                devices.append(
                    {
                        "source": "winmm",
                        "id": device_id,
                        "name": caps.szPname.strip() or f"Joystick {device_id}",
                        "mid": caps.wMid,
                        "pid": caps.wPid,
                        "buttons": caps.wNumButtons,
                        "axes": {
                            "X": (caps.wXmin, caps.wXmax),
                            "Y": (caps.wYmin, caps.wYmax),
                            "Z": (caps.wZmin, caps.wZmax),
                            "R": (caps.wRmin, caps.wRmax),
                            "U": (caps.wUmin, caps.wUmax),
                            "V": (caps.wVmin, caps.wVmax),
                        },
                    }
                )

        return devices

    def state(self, device_id):
        info = JoyInfoEx()
        info.dwSize = ctypes.sizeof(info)
        info.dwFlags = JOY_RETURNALL
        result = self.winmm.joyGetPosEx(device_id, ctypes.byref(info))

        if result == JOYERR_NOERROR:
            return ControllerState(
                info.dwButtons,
                {
                    "X": info.dwXpos,
                    "Y": info.dwYpos,
                    "Z": info.dwZpos,
                    "R": info.dwRpos,
                    "U": info.dwUpos,
                    "V": info.dwVpos,
                },
                info.dwPOV,
            )

        return None


class XInputJoystick:
    def __init__(self):
        self.xinput = None

        for dll_name in ("xinput1_4.dll", "xinput1_3.dll", "xinput9_1_0.dll"):
            try:
                self.xinput = ctypes.WinDLL(dll_name)
                break
            except OSError:
                pass

        if self.xinput:
            self.xinput.XInputGetState.argtypes = [
                ctypes.c_uint,
                ctypes.POINTER(XInputState),
            ]
            self.xinput.XInputGetState.restype = ctypes.c_uint

    def devices(self):
        if not self.xinput:
            return []

        devices = []

        for device_id in range(4):
            if self.state(device_id):
                devices.append(
                    {
                        "source": "xinput",
                        "id": device_id,
                        "name": f"Xbox Controller {device_id + 1} (XInput)",
                        "mid": "xinput",
                        "pid": device_id,
                        "buttons": 16,
                        "axes": {
                            "X": (-32768, 32767),
                            "Y": (-32768, 32767),
                            "Z": (0, 255),
                            "R": (0, 255),
                            "U": (-32768, 32767),
                            "V": (-32768, 32767),
                        },
                    }
                )

        return devices

    def state(self, device_id):
        if not self.xinput:
            return None

        state = XInputState()
        result = self.xinput.XInputGetState(device_id, ctypes.byref(state))

        if result != ERROR_SUCCESS:
            return None

        buttons = state.Gamepad.wButtons
        button_mask = 0

        for xinput_button, button_number in XINPUT_BUTTON_MAP.items():
            if buttons & xinput_button:
                button_mask |= 1 << button_number

        if state.Gamepad.bLeftTrigger > 30:
            button_mask |= 1 << 6
        if state.Gamepad.bRightTrigger > 30:
            button_mask |= 1 << 7

        return ControllerState(
            button_mask,
            {
                "X": state.Gamepad.sThumbLX,
                "Y": state.Gamepad.sThumbLY,
                "Z": state.Gamepad.bLeftTrigger,
                "R": state.Gamepad.bRightTrigger,
                "U": state.Gamepad.sThumbRX,
                "V": state.Gamepad.sThumbRY,
            },
            self.pov_from_buttons(buttons),
        )

    @staticmethod
    def pov_from_buttons(buttons):
        up = bool(buttons & XINPUT_GAMEPAD_DPAD_UP)
        down = bool(buttons & XINPUT_GAMEPAD_DPAD_DOWN)
        left = bool(buttons & XINPUT_GAMEPAD_DPAD_LEFT)
        right = bool(buttons & XINPUT_GAMEPAD_DPAD_RIGHT)

        if up and right:
            return 4500
        if right and down:
            return 13500
        if down and left:
            return 22500
        if left and up:
            return 31500
        if up:
            return 0
        if right:
            return 9000
        if down:
            return 18000
        if left:
            return 27000

        return 0xFFFF


class ControllerReader:
    def __init__(self):
        self.readers = {
            "winmm": WinMMJoystick(),
            "xinput": XInputJoystick(),
        }

    def devices(self):
        devices = []

        for source in ("xinput", "winmm"):
            for device in self.readers[source].devices():
                if device["buttons"] > 0:
                    devices.append(device)

        return devices

    def state(self, device):
        reader = self.readers.get(device["source"])

        if not reader:
            return None

        return reader.state(device["id"])


class ControllerTester(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Controller Button Tester")
        self.geometry("900x640")
        self.minsize(780, 560)

        self.reader = ControllerReader()
        self.devices = []
        self.selected_device_id = None
        self.selected_caps = None
        self.selected_button = None
        self.profiles = self.load_profiles()
        self.current_profile = {}
        self.button_labels = []
        self.axis_rows = {}
        self.button_name_var = tk.StringVar(value="")
        self.selected_button_var = tk.StringVar(value="Press or click a button to name it")
        self.last_pressed = tk.StringVar(value="Press buttons on your controller")
        self.status = tk.StringVar(value="")
        self.left_stick_value = tk.StringVar(value="Left Stick: centered")
        self.right_stick_value = tk.StringVar(value="Right Stick: centered")

        self._build_ui()
        self.refresh_devices()
        self.poll()

    def _build_ui(self):
        root = ttk.Frame(self, padding=12)
        root.pack(fill="both", expand=True)

        top = ttk.Frame(root)
        top.pack(fill="x")

        ttk.Label(top, text="Device").pack(side="left")
        self.device_var = tk.StringVar()
        self.device_select = ttk.Combobox(
            top, textvariable=self.device_var, state="readonly", width=52
        )
        self.device_select.pack(side="left", padx=(8, 8))
        self.device_select.bind("<<ComboboxSelected>>", self.select_device)

        ttk.Button(top, text="Refresh", command=self.refresh_devices).pack(side="left")
        ttk.Button(top, text="Xbox Template", command=self.apply_xbox_template).pack(
            side="left", padx=(8, 0)
        )
        ttk.Button(
            top,
            text="Game Template",
            command=self.apply_galactic_gunners_template,
        ).pack(side="left", padx=(8, 0))

        ttk.Label(root, textvariable=self.status).pack(fill="x", pady=(8, 0))
        ttk.Label(
            root,
            textvariable=self.last_pressed,
            font=("Segoe UI", 14, "bold"),
        ).pack(fill="x", pady=(8, 12))

        content = ttk.Frame(root)
        content.pack(fill="both", expand=True)

        buttons_box = ttk.LabelFrame(content, text="Buttons")
        buttons_box.pack(side="left", fill="both", expand=True, padx=(0, 8))

        for index in range(32):
            label = tk.Label(
                buttons_box,
                text=f"{index}\nUnlabeled",
                width=10,
                height=3,
                relief="ridge",
                bg="#222222",
                fg="#eeeeee",
                font=("Segoe UI", 9, "bold"),
            )
            label.grid(row=index // 4, column=index % 4, sticky="nsew", padx=4, pady=4)
            label.bind("<Button-1>", lambda _event, button=index: self.select_button(button))
            self.button_labels.append(label)

        for col in range(4):
            buttons_box.columnconfigure(col, weight=1)

        axes_box = ttk.LabelFrame(content, text="Axes and POV")
        axes_box.pack(side="right", fill="both", expand=True, padx=(8, 0))

        ttk.Label(
            axes_box,
            text="Labels are saved per controller type. Press a button, name it, then Save Label.",
            wraplength=310,
        ).pack(fill="x", padx=8, pady=(8, 10))

        editor = ttk.LabelFrame(axes_box, text="Button Label")
        editor.pack(fill="x", padx=8, pady=(0, 10))
        ttk.Label(editor, textvariable=self.selected_button_var).pack(
            anchor="w", padx=8, pady=(8, 4)
        )
        name_row = ttk.Frame(editor)
        name_row.pack(fill="x", padx=8, pady=(0, 8))
        ttk.Entry(name_row, textvariable=self.button_name_var).pack(
            side="left", fill="x", expand=True
        )
        ttk.Button(name_row, text="Save Label", command=self.save_button_label).pack(
            side="left", padx=(8, 0)
        )
        ttk.Button(name_row, text="Clear", command=self.clear_button_label).pack(
            side="left", padx=(8, 0)
        )

        for axis in ["X", "Y", "Z", "R", "U", "V"]:
            row = ttk.Frame(axes_box)
            row.pack(fill="x", padx=8, pady=5)
            ttk.Label(row, text=axis, width=3).pack(side="left")
            value = tk.StringVar(value="-")
            bar = ttk.Progressbar(row, maximum=100, length=220)
            bar.pack(side="left", fill="x", expand=True, padx=8)
            ttk.Label(row, textvariable=value, width=10).pack(side="right")
            self.axis_rows[axis] = {"bar": bar, "value": value}

        ttk.Label(axes_box, textvariable=self.left_stick_value, font=("Segoe UI", 11)).pack(
            anchor="w", padx=8, pady=(12, 0)
        )
        ttk.Label(axes_box, textvariable=self.right_stick_value, font=("Segoe UI", 11)).pack(
            anchor="w", padx=8, pady=(4, 0)
        )

        self.pov_value = tk.StringVar(value="POV: -")
        ttk.Label(axes_box, textvariable=self.pov_value, font=("Segoe UI", 11)).pack(
            anchor="w", padx=8, pady=(12, 0)
        )

    def load_profiles(self):
        if not PROFILE_PATH.exists():
            return {}

        try:
            with PROFILE_PATH.open("r", encoding="utf-8") as handle:
                return json.load(handle)
        except (OSError, json.JSONDecodeError):
            return {}

    def save_profiles(self):
        with PROFILE_PATH.open("w", encoding="utf-8") as handle:
            json.dump(self.profiles, handle, indent=2, sort_keys=True)

    def profile_key(self, device):
        name = device["name"].strip() or "Unknown Controller"
        return f"{device['source']}|{name}|mid:{device['mid']}|pid:{device['pid']}|buttons:{device['buttons']}"

    def profile_title(self):
        if not self.selected_caps:
            return ""

        return self.profile_key(self.selected_caps)

    def get_button_name(self, button):
        return self.current_profile.get(str(button), "")

    def set_button_name(self, button, name):
        key = self.profile_title()

        if not key:
            return

        if key not in self.profiles:
            self.profiles[key] = {}

        name = name.strip()

        if name:
            self.profiles[key][str(button)] = name
        else:
            self.profiles[key].pop(str(button), None)

        self.current_profile = self.profiles[key]
        self.save_profiles()
        self.refresh_button_text()

    def refresh_button_text(self):
        for index, label in enumerate(self.button_labels):
            name = self.get_button_name(index) or "Unlabeled"
            label.configure(text=f"{index}\n{name}")
        self.refresh_button_styles(0)

    def select_button(self, button):
        self.selected_button = button
        name = self.get_button_name(button)
        self.button_name_var.set(name)
        self.selected_button_var.set(f"Button {button}")
        self.refresh_button_styles(0)

    def save_button_label(self):
        if self.selected_button is None:
            return

        self.set_button_name(self.selected_button, self.button_name_var.get())

    def clear_button_label(self):
        if self.selected_button is None:
            return

        self.button_name_var.set("")
        self.set_button_name(self.selected_button, "")

    def apply_template(self, template):
        key = self.profile_title()

        if not key:
            return

        if key not in self.profiles:
            self.profiles[key] = {}

        for button, name in template.items():
            self.profiles[key][str(button)] = name

        self.current_profile = self.profiles[key]
        self.save_profiles()
        self.refresh_button_text()
        self.status.set(f"Saved labels for {self.selected_caps['name']}")

    def apply_xbox_template(self):
        self.apply_template(XBOX_TEMPLATE)

    def apply_galactic_gunners_template(self):
        self.apply_template(GALACTIC_GUNNERS_TEMPLATE)

    def refresh_devices(self):
        self.devices = self.reader.devices()

        if not self.devices:
            self.device_select["values"] = []
            self.device_var.set("")
            self.selected_device_id = None
            self.selected_caps = None
            self.status.set(
                "No Windows game controller found. Plug it in, press a button, then Refresh."
            )
            return

        choices = [
            f"{device['source']} {device['id']}: {device['name']} ({device['buttons']} buttons)"
            for device in self.devices
        ]
        self.device_select["values"] = choices
        self.device_select.current(0)
        self.select_device()

    def select_device(self, _event=None):
        index = self.device_select.current()

        if index < 0 or index >= len(self.devices):
            return

        self.selected_caps = self.devices[index]
        self.selected_device_id = self.selected_caps["id"]
        key = self.profile_title()
        self.current_profile = self.profiles.setdefault(key, {})
        self.selected_button = None
        self.button_name_var.set("")
        self.selected_button_var.set("Press or click a button to name it")
        self.refresh_button_text()
        self.status.set(
            f"Reading {self.selected_caps['source']} device {self.selected_device_id}: {self.selected_caps['name']} - {len(self.current_profile)} saved labels"
        )

    def poll(self):
        if self.selected_caps is not None:
            state = self.reader.state(self.selected_caps)

            if state:
                self.update_buttons(state.button_mask)
                self.update_axes(state)
                self.update_pov(state.pov)
            else:
                self.status.set("Controller was disconnected or is not responding.")

        self.after(30, self.poll)

    def update_buttons(self, button_mask):
        pressed = []

        self.refresh_button_styles(button_mask)

        for index in range(len(self.button_labels)):
            is_pressed = bool(button_mask & (1 << index))
            name = self.get_button_name(index)

            if is_pressed:
                if self.selected_button != index:
                    self.select_button(index)
                pressed.append(f"{index}" + (f" ({name})" if name else ""))

        self.refresh_button_styles(button_mask)

        if pressed:
            self.last_pressed.set("Pressed: " + ", ".join(pressed))
        else:
            self.last_pressed.set("Press buttons on your controller")

    def refresh_button_styles(self, button_mask):
        for index, label in enumerate(self.button_labels):
            is_pressed = bool(button_mask & (1 << index))

            if is_pressed:
                label.configure(bg="#00a651", fg="#ffffff")
            elif self.selected_button == index:
                label.configure(bg="#31446f", fg="#ffffff")
            else:
                label.configure(bg="#222222", fg="#eeeeee")

    def update_axes(self, state):
        values = {
            "X": state.axes["X"],
            "Y": state.axes["Y"],
            "Z": state.axes["Z"],
            "R": state.axes["R"],
            "U": state.axes["U"],
            "V": state.axes["V"],
        }

        for axis, raw in values.items():
            low, high = self.selected_caps["axes"][axis]
            percent = self.scale_axis(raw, low, high)
            self.axis_rows[axis]["bar"]["value"] = percent
            self.axis_rows[axis]["value"].set(str(raw))

        self.left_stick_value.set(
            "Left Stick: " + self.stick_direction(values["X"], values["Y"], "left")
        )
        self.right_stick_value.set(
            "Right Stick: " + self.stick_direction(values["U"], values["V"], "right")
        )

    def update_pov(self, pov):
        if pov == 0xFFFF:
            self.pov_value.set("POV: centered")
            return

        degrees = pov / 100
        self.pov_value.set(f"POV: {degrees:.0f} degrees")

    @staticmethod
    def scale_axis(value, low, high):
        if high <= low:
            return 0

        return max(0, min(100, ((value - low) / (high - low)) * 100))

    def stick_direction(self, x_value, y_value, stick):
        x_low, x_high = self.selected_caps["axes"]["X" if stick == "left" else "U"]
        y_low, y_high = self.selected_caps["axes"]["Y" if stick == "left" else "V"]
        x_center = (x_low + x_high) / 2
        y_center = (y_low + y_high) / 2
        x_span = max(1, (x_high - x_low) / 2)
        y_span = max(1, (y_high - y_low) / 2)
        x = (x_value - x_center) / x_span
        y = (y_value - y_center) / y_span
        deadzone = 0.28
        horizontal = ""
        vertical = ""

        if x < -deadzone:
            horizontal = "Left"
        elif x > deadzone:
            horizontal = "Right"

        if self.selected_caps and self.selected_caps["source"] == "xinput":
            if y > deadzone:
                vertical = "Up"
            elif y < -deadzone:
                vertical = "Down"
        else:
            if y < -deadzone:
                vertical = "Up"
            elif y > deadzone:
                vertical = "Down"

        if vertical and horizontal:
            return f"{vertical}-{horizontal}"
        if vertical:
            return vertical
        if horizontal:
            return horizontal

        return "centered"


def main():
    if sys.platform != "win32":
        print("This tester uses the Windows joystick API and must be run on Windows.")
        return 1

    app = ControllerTester()
    app.mainloop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
