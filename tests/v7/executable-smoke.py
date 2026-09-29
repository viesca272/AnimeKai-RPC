"""Exercise the built Windows executable using real Native Messaging framing."""
import json
import struct
import subprocess
import sys

payload = json.dumps({"type": "health"}).encode()
result = subprocess.run([sys.argv[1]], input=struct.pack("<I", len(payload)) + payload,
                        capture_output=True, timeout=40, check=True)
data = result.stdout
messages = []
while data:
    assert len(data) >= 4, "Incomplete native header"
    size = struct.unpack("<I", data[:4])[0]
    assert len(data) >= size + 4, "Incomplete native body"
    messages.append(json.loads(data[4:4+size]))
    data = data[4+size:]
health = next(message for message in messages if message["type"] == "health")
assert health["installationOk"], health
assert not health["runtimeOk"], "CI unexpectedly has a running Discord session"
assert any(message.get("hostVersion") == "7.0.0-alpha.1" for message in messages)
print("Built helper answered framed health messages; installation OK, Discord unavailable as expected.")
