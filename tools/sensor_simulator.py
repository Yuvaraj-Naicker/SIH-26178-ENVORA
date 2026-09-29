"""Simulate leaf nodes without hardware. Prints decoded packets, optionally POSTs JSON.

Usage: python tools/sensor_simulator.py --nodes 3 --count 5 [--url http://localhost:8000/api/ingest]
"""
import argparse, json, random, time, urllib.request
from envora_packet import encode, decode, pack_sensor, unpack_sensor, PKT_SENSOR


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--nodes", type=int, default=3)
    ap.add_argument("--count", type=int, default=5, help="packets per node")
    ap.add_argument("--interval", type=float, default=0.5)
    ap.add_argument("--url", help="optional HTTP endpoint to POST JSON to")
    args = ap.parse_args()

    for seq in range(args.count):
        for node in range(1, args.nodes + 1):
            payload = pack_sensor(random.uniform(20, 45), random.uniform(30, 90),
                                  random.uniform(5, 120), random.randint(0, 200))
            raw = encode(node, seq, 0, 4, PKT_SENSOR, payload)
            pkt = decode(raw)
            record = {"node": pkt["node_id"], "seq": pkt["seq"], **unpack_sensor(pkt["payload"])}
            print(raw.hex(), json.dumps(record))
            if args.url:
                req = urllib.request.Request(args.url, json.dumps(record).encode(),
                                             {"Content-Type": "application/json"})
                try:
                    urllib.request.urlopen(req, timeout=5)
                except Exception as e:
                    print("POST failed:", e)
            time.sleep(args.interval)


if __name__ == "__main__":
    main()
