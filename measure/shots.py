import asyncio
from playwright.async_api import async_playwright
OUT="/home/claude/cro-asset/out/shots"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={"width":390,"height":844}, device_scale_factor=2)
        for n in ("before","after","lp"):
            await pg.goto(f"file:///home/claude/cro-asset/proto/{n}.html"); await pg.wait_for_timeout(200)
            await pg.screenshot(path=f"{OUT}/{n}-full.png", full_page=True)
        await b.close()
asyncio.run(main())
