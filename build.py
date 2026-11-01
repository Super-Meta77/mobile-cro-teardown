#!/usr/bin/env python3
"""Assemble the teardown site: copy prototypes + screenshots, write site/data.js from out/metrics.json."""
import json, shutil, pathlib
R = pathlib.Path(__file__).parent
m = json.loads((R / "out/metrics.json").read_text())
site = R / "site"
shutil.rmtree(site / "proto", ignore_errors=True); shutil.copytree(R / "proto", site / "proto")
(site / "img").mkdir(exist_ok=True)
for f in (R / "out/shots").glob("*.png"): shutil.copy(f, site / "img" / f.name)
P = m["pages"]; keys = m["keys"]
def fs(n): return [k for k in keys if P[n]["first"].get(k, {}).get("first_screen")]
data = {
  "viewport": m["viewport"], "keys": keys, "labels": m["labels"],
  "first": {n: {k: P[n]["first"].get(k, {}) for k in keys + ["terms", "ingredients", "evidence", "reviews", "different"]} for n in ("before", "after", "lp")},
  "first_count": {n: len(fs(n)) for n in ("before", "after", "lp")},
  "reach": {n: P[n]["reach"] for n in ("before", "after", "lp")},
  "targets": {n: P[n]["targets"] for n in ("before", "after", "lp")},
  "doc": {n: P[n]["first"]["_doc_height"] for n in ("before", "after", "lp")},
  "task": m["task"], "kit_param": m["kit_param"],
}
(site / "data.js").write_text("window.T = " + json.dumps(data) + ";\n")
print("first screen:", data["first_count"], "| reach:", {n: round(v["reachable_share"] * 100) for n, v in data["reach"].items()},
      "| taps:", m["task"]["before"]["taps"], "->", m["task"]["after"]["taps"], "| small targets:", {n: v["under44"] for n, v in data["targets"].items()})
