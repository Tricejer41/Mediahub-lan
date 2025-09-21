import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://192.168.1.25:3000';
const API  = process.env.API_URL  ?? 'http://192.168.1.25:8000';

// Antes de cada test: escoger un perfil y fijar la cookie "profile_id"
test.beforeEach(async ({ context, request }) => {
  // 1) pedir perfiles al backend
  const r = await request.get(`${API}/api/profiles`);
  const profiles: Array<{ id: number }> = await r.json();

  if (!profiles.length) {
    test.skip(true, 'No hay perfiles creados en el backend');
    return;
  }

  const pid = String(profiles[0].id);
  const url = new URL(BASE);

  // 2) poner cookie para el dominio del FRONT (BASE)
  await context.addCookies([{
    name: 'profile_id',
    value: pid,
    domain: url.hostname, // ej. 192.168.1.25
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax'
  }]);
});

test('home muestra grid y entra a una serie', async ({ page }) => {
  await page.goto(BASE);

  // Espera a que haya al menos una tarjeta de serie (enlaza a /series/:id)
  const firstSeries = page.locator('a[href^="/series/"]').first();
  await expect(firstSeries).toBeVisible({ timeout: 15000 });

  // Entra a la primera serie
  await firstSeries.click();

  // Debe existir algún enlace a /watch/:id (episodio)
  const firstWatch = page.locator('a[href^="/watch/"]').first();
  await expect(firstWatch).toBeVisible({ timeout: 15000 });
});

test('reproductor carga video (existe <video>)', async ({ page, request }) => {
  // 1) Obtener un episodio válido desde el backend
  const API = process.env.API_URL ?? 'http://192.168.1.25:8000';

  // lista de series
  const rs = await request.get(`${API}/api/catalog/series`);
  const series: Array<{ id: number }> = await rs.json();
  expect(series.length).toBeGreaterThan(0);

  // detalle de la primera serie con episodios
  let epId: number | null = null;
  for (const s of series) {
    const rd = await request.get(`${API}/api/catalog/series/${s.id}`);
    const detail = await rd.json();
    for (const season of detail.seasons ?? []) {
      if (season.episodes?.length) {
        epId = season.episodes[0].id;
        break;
      }
    }
    if (epId) break;
  }
  expect(epId, 'No se encontró ningún episodio en el catálogo').not.toBeNull();

  // 2) Ir directo al watch
  const BASE = process.env.BASE_URL ?? 'http://192.168.1.25:3000';
  await page.goto(`${BASE}/watch/${epId}`);

  // 3) Esperas robustas
  await expect(page).toHaveURL(/\/watch\/\d+/, { timeout: 15000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // 4) Poll: el <video> debe existir (aunque tarde en hidratar)
  await expect
    .poll(async () => await page.evaluate(() => !!document.querySelector('video')), {
      timeout: 15000,
      intervals: [300, 500, 800, 1200]
    })
    .toBe(true);

  // (opcional) Confirmar que el stream ha respondido 200/206 en algún momento
  // await page.waitForResponse(
  //   resp => resp.url().includes('/api/stream/') && [200, 206].includes(resp.status()),
  //   { timeout: 15000 }
  // );
});
