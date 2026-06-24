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
        
        # -> Navigate directly to the athlete registration path '/atletas/agregar' and verify that the login page is displayed and the athlete registration form is not accessible to an unauthenticated user.
        await page.goto("http://localhost:3000/atletas/agregar")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # --> Assertions to verify final state
        
        # --> Verify the login page is displayed
        # Assert: The URL contains '/login', confirming the login page is displayed.
        await expect(page).to_have_url(re.compile("/login"), timeout=15000), "The URL contains '/login', confirming the login page is displayed."
        await page.locator("xpath=/html/body/main/div/div/div[2]/form/div/input").nth(0).scroll_into_view_if_needed()
        # Assert: The access code input field is visible on the login page.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/form/div/input").nth(0)).to_be_visible(timeout=15000), "The access code input field is visible on the login page."
        # Assert: The login button 'Entrar al Sistema' is visible on the page.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/form/button").nth(0)).to_have_text("Entrar al Sistema", timeout=15000), "The login button 'Entrar al Sistema' is visible on the page."
        
        # --> Verify athlete registration is not accessible
        # Assert: La URL contiene '/login', confirmando la redirección a la página de inicio de sesión.
        await expect(page).to_have_url(re.compile("/login"), timeout=15000), "La URL contiene '/login', confirmando la redirecci\u00f3n a la p\u00e1gina de inicio de sesi\u00f3n."
        await page.locator("xpath=/html/body/main/div/div/div[2]/form/div/input").nth(0).scroll_into_view_if_needed()
        # Assert: El campo 'Código de Acceso' está visible en la página de inicio de sesión.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/form/div/input").nth(0)).to_be_visible(timeout=15000), "El campo 'C\u00f3digo de Acceso' est\u00e1 visible en la p\u00e1gina de inicio de sesi\u00f3n."
        await page.locator("xpath=/html/body/main/div/div/div[2]/form/button").nth(0).scroll_into_view_if_needed()
        # Assert: El botón 'Entrar al Sistema' está visible en la página de inicio de sesión.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/form/button").nth(0)).to_be_visible(timeout=15000), "El bot\u00f3n 'Entrar al Sistema' est\u00e1 visible en la p\u00e1gina de inicio de sesi\u00f3n."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    