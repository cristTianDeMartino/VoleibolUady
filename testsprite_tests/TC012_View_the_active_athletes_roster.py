import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Ver Roster →' button on the homepage to open the roster page and display athletes.
        # Ver Roster → link
        elem = page.get_by_role('link', name='Ver Roster →', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Activos' filter button to (re)select the Active athletes filter and ensure only active athletes are displayed.
        # Activos link
        elem = page.get_by_role('link', name='Activos', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify active athletes are displayed
        # Assert: URL indicates the active athletes filter is selected.
        await expect(page).to_have_url(re.compile("estado=ACTIVO"), timeout=15000), "URL indicates the active athletes filter is selected."
        # Assert: The roster count displays 13 active athletes.
        await expect(page.locator("xpath=/html/body/main/div/div[3]/div[4]/p/span").nth(0)).to_have_text("13", timeout=15000), "The roster count displays 13 active athletes."
        await page.locator("xpath=/html/body/main/div/div[3]/div[5]/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert: An active athlete card (Valeria Castillo May) is visible in the roster.
        await expect(page.locator("xpath=/html/body/main/div/div[3]/div[5]/a[1]").nth(0)).to_be_visible(timeout=15000), "An active athlete card (Valeria Castillo May) is visible in the roster."
        
        # --> Verify the roster list is visible
        await page.locator("xpath=/html/body/main/div/div[3]/div[5]/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert: At least one athlete card in the roster is visible.
        await expect(page.locator("xpath=/html/body/main/div/div[3]/div[5]/a[1]").nth(0)).to_be_visible(timeout=15000), "At least one athlete card in the roster is visible."
        # Assert: The roster count displays '13' athletes.
        await expect(page.locator("xpath=/html/body/main/div/div[3]/div[4]/p/span").nth(0)).to_have_text("13", timeout=15000), "The roster count displays '13' athletes."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    