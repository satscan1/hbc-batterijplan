"""Static security checks for the HACS review (pytest or plain python): nothing public, no free service calls, escaped frontend."""
import ast
import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), "..")
CC = os.path.join(ROOT, "custom_components", "batterijplan")
PY = [f for f in os.listdir(CC) if f.endswith(".py")]


def src(f):
    return open(os.path.join(CC, f), encoding="utf-8").read()


def test_nothing_written_to_www_or_public():
    """The integration only keeps data in .storage (Store) and never writes files; the static path holds code and images only."""
    for f in PY:
        s = src(f)
        assert "/www" not in s and "www/" not in s, f"{f} mentions www"
        assert not re.search(r"\bopen\(|write_text|write_bytes|os\.makedirs|mkdir\(|shutil\.|\.write\(", s), f"{f} writes files"
    ext = {os.path.splitext(n)[1] for n in os.listdir(os.path.join(CC, "frontend")) if os.path.isfile(os.path.join(CC, "frontend", n))}
    assert ext <= {".js", ".png", ".webp"}, ext
    init = src("__init__.py")
    assert init.count("StaticPathConfig(") == 1 and "FRONTEND_DIR" in init.split("StaticPathConfig(")[1].split(")")[0]


def test_service_calls_use_fixed_targets():
    """hass.services.async_call: fixed domain + service, and entity ids only from the HBC tables, never from a user setting."""
    for f in PY:
        tree = ast.parse(src(f))
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "async_call":
                a = node.args
                assert isinstance(a[0], ast.Constant) and a[0].value in ("input_select", "input_number", "logbook"), f"{f}:{node.lineno} domain"
                assert isinstance(a[1], ast.Constant), f"{f}:{node.lineno} service"
                text = ast.unparse(node)
                assert "self.settings" not in text and "setting_text" not in text and "CONF_" not in text, f"{f}:{node.lineno} user setting in service call"
    c = src("coordinator.py")
    assert "HBC_SETTINGS" in c and "steering.HBC_SELECTS" in c
    # the eids come from constants only
    assert all(v.startswith("input_") for v in re.findall(r'"(input_\w+\.\w+)"', src("const.py")))


def test_no_own_websocket_view_or_service():
    for f in PY:
        s = src(f)
        for bad in ("websocket_command", "async_register_command", "HomeAssistantView", "async_register_admin_service", "services.async_register", "async_register(\n"):
            assert bad not in s or f == "panel.py" and bad == "async_register(\n", f"{f}: {bad}"


def test_text_entity_accepts_only_sensor_ids():
    s = src("text.py")
    pat = re.search(r'SENSOR_ID = re\.compile\(r"(.+?)"\)', s).group(1)
    rx = re.compile(pat)
    for ok in ("sensor.power_net", "sensor.solcast_pv_forecast_forecast_today"):
        assert rx.match(ok)
    for bad in ("switch.x", "light.kitchen", "sensor.x; y", "script.turn_on", "sensor.x\n", "sensor.", "input_boolean.a", "{{ 1 }}", "<b>"):
        assert not rx.match(bad), bad
    assert "ServiceValidationError" in s


def test_manifest_and_hacs():
    m = json.load(open(os.path.join(CC, "manifest.json")))
    for k in ("domain", "name", "version", "documentation", "issue_tracker", "codeowners", "iot_class", "config_flow", "integration_type"):
        assert m.get(k) not in (None, "", []), k
    assert m["issue_tracker"].endswith("/issues") and m["codeowners"][0].startswith("@")
    h = json.load(open(os.path.join(ROOT, "hacs.json")))
    assert h["name"] and h.get("homeassistant")
    assert os.path.isfile(os.path.join(CC, "brand", "icon.png"))


def test_frontend_has_no_unsafe_sinks():
    for f in ("batterijplan-cards.js", "batterijplan-plan-card.js"):
        s = open(os.path.join(CC, "frontend", f), encoding="utf-8").read()
        for bad in ("eval(", "new Function", "insertAdjacentHTML", "unsafeHTML", "outerHTML ="):
            assert bad not in s, f"{f}: {bad}"
    plan = open(os.path.join(CC, "frontend", "batterijplan-plan-card.js"), encoding="utf-8").read()
    assert "this._c.titel ||" not in plan.replace("bpEsc(this._c.titel ||", ""), "titel from the card config must go through bpEsc"


if __name__ == "__main__":
    for n, fn in list(globals().items()):
        if n.startswith("test_"):
            fn()
            print("ok", n)
