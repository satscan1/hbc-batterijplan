"""Offline checks on the recorder load (pytest or plain python): big/changing attributes are not recorded, and nothing
reads their history."""
import ast
import os
import re

CC = os.path.join(os.path.dirname(__file__), "..", "custom_components", "batterijplan")


def _unrecorded():
    tree = ast.parse(open(os.path.join(CC, "sensor.py"), encoding="utf-8").read())
    for n in ast.walk(tree):
        if isinstance(n, ast.Assign) and any(getattr(t, "id", "") == "UNRECORDED" for t in n.targets):
            return {c.value for c in n.value.args[0].elts}
    raise AssertionError("UNRECORDED not found")


def test_big_and_changing_attributes_are_unrecorded():
    u = _unrecorded()
    for k in ("punten", "uitleg", "kosten_hbc", "kosten_plan", "lading", "start", "lading_plan", "eur_live", "eur_schaduw"):
        assert k in u, k
    for k in ("actie", "hbc_actie", "modus", "hbc_strategie", "sinds", "voorlopig", "vanaf_vandaag"):
        assert k not in u, k  # decisions and small stable fields stay recorded


def test_sensor_class_uses_it():
    src = open(os.path.join(CC, "sensor.py"), encoding="utf-8").read()
    assert "_unrecorded_attributes = UNRECORDED" in src


def test_no_history_of_attributes_in_the_cards():
    """History calls in the integration's own cards must not ask for attributes (their history is not stored)."""
    fe = os.path.join(CC, "frontend")
    for f in os.listdir(fe):
        if not f.endswith(".js"):
            continue
        s = open(os.path.join(fe, f), encoding="utf-8").read()
        for m in re.finditer(r'history/history_during_period.{0,400}', s, re.S):
            assert "no_attributes: true" in m.group(0), f + ": history call that reads attributes"
        assert "lading_kwh" not in s


def test_no_timestamp_attributes_on_recorded_sensors():
    """Recorded sensors carry no attribute that changes on every update (timestamps)."""
    src = open(os.path.join(CC, "sensor.py"), encoding="utf-8").read()
    assert "isoformat" not in src and "now()" not in src


if __name__ == "__main__":
    for k, v in list(globals().items()):
        if k.startswith("test_"):
            v()
            print("ok", k)
