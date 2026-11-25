"""Tiny local SMTP server for tests: saves every message it receives into a folder."""
import asyncio, pathlib, sys, time
from aiosmtpd.controller import Controller

out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)

class Sink:
    async def handle_DATA(self, server, session, envelope):
        (out / f"{time.time_ns()}.eml").write_bytes(envelope.original_content or envelope.content)
        return "250 OK"

c = Controller(Sink(), hostname="127.0.0.1", port=8025)
c.start()
try:
    asyncio.new_event_loop().run_forever()
finally:
    c.stop()
