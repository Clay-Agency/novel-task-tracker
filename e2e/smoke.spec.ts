import { expect, test, type Page } from '@playwright/test';

const FIXED_NOW_ISO = '2026-02-19T00:00:00.000Z';
const STORAGE_KEY = 'novel-task-tracker/tasks';

async function openWithFixedClock(page: Page): Promise<void> {
  await page.addInitScript(({ fixedNowIso }) => {
    const fixedNowMs = new Date(fixedNowIso).valueOf();
    const RealDate = Date;

    class MockDate extends RealDate {
      constructor(...args: ConstructorParameters<DateConstructor>) {
        if (args.length === 0) {
          super(fixedNowMs);
          return;
        }

        super(...args);
      }

      static now(): number {
        return fixedNowMs;
      }
    }

    Object.setPrototypeOf(MockDate, RealDate);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Date = MockDate;

  }, { fixedNowIso: FIXED_NOW_ISO });

  await page.goto('/');
  await page.evaluate((storageKey) => window.localStorage.removeItem(storageKey), STORAGE_KEY);
  await page.reload();
}

async function createTask(
  page: Page,
  {
    title,
    dueDate,
    priority,
    duration,
    energy,
    context
  }: {
    title: string;
    dueDate?: string;
    priority?: 'Normal' | 'High';
    duration?: string;
    energy?: 'Low' | 'Medium' | 'High';
    context?: 'Deep Work' | 'Admin' | 'Errands' | 'Calls';
  }
): Promise<void> {
  await page.locator('#task-title').fill(title);

  if (dueDate) {
    await page.locator('#task-due-date').fill(dueDate);
  }

  if (priority) {
    await page.locator('#task-priority').selectOption(priority);
  }

  if (duration) {
    await page.locator('#task-duration').selectOption(duration);
  }

  if (energy) {
    await page.locator('#task-energy').selectOption(energy);
  }

  if (context) {
    await page.locator('#task-context').selectOption(context);
  }

  await page.getByRole('button', { name: /add task/i }).click();
}

test('supports core task lifecycle and persistence across reload', async ({ page }) => {
  await openWithFixedClock(page);

  await createTask(page, { title: 'Persistent smoke task' });

  const taskList = page.getByRole('list', { name: 'Task list' });
  await expect(taskList.getByRole('heading', { name: 'Persistent smoke task' })).toBeVisible();

  await page.reload();
  await expect(taskList.getByRole('heading', { name: 'Persistent smoke task' })).toBeVisible();

  await page.getByRole('button', { name: /mark completed/i }).click();
  await expect(taskList.getByText('Completed')).toBeVisible();

  await page.getByRole('button', { name: /reopen/i }).click();
  await expect(taskList.getByText('Open')).toBeVisible();

  await page.getByRole('button', { name: /delete/i }).click();
  await expect(taskList.getByRole('heading', { name: 'Persistent smoke task' })).toHaveCount(0);
});

test('supports search, status filtering, and title sorting', async ({ page }) => {
  await openWithFixedClock(page);

  await createTask(page, { title: 'Zeta draft notes' });
  await createTask(page, { title: 'Alpha sprint notes' });

  const taskList = page.getByRole('list', { name: 'Task list' });

  await page.locator('#sort-by').selectOption('title-asc');
  await expect(taskList.locator('li').first().getByRole('heading')).toHaveText('Alpha sprint notes');

  await page.locator('#search-tasks').fill('sprint');
  await expect(taskList.getByRole('heading', { name: 'Alpha sprint notes' })).toBeVisible();
  await expect(taskList.getByRole('heading', { name: 'Zeta draft notes' })).toHaveCount(0);

  await page.getByRole('button', { name: /mark completed/i }).click();
  await page.locator('#status-filter').selectOption('completed');
  await expect(taskList.getByRole('heading', { name: 'Alpha sprint notes' })).toBeVisible();
});


test('exports task JSON and imports replacement task list', async ({ page }) => {
  await openWithFixedClock(page);

  await createTask(page, { title: 'Export me first' });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/novel-task-tracker-tasks-\d{4}-\d{2}-\d{2}\.json/);

  const importedPayload = {
    version: 2,
    payload: {
      tasks: [
        {
          id: 'import-e2e-1',
          title: 'Imported via e2e',
          status: 'open',
          createdAt: FIXED_NOW_ISO,
          updatedAt: FIXED_NOW_ISO,
          description: null,
          completedAt: null,
          dueDate: null,
          priority: 'normal',
          estimatedDurationMin: 15,
          energy: 'low',
          context: 'admin'
        }
      ]
    }
  };

  await page.locator('input[type="file"]').setInputFiles({
    name: 'import.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(importedPayload), 'utf8')
  });

  const taskList = page.getByRole('list', { name: 'Task list' });
  await expect(taskList.getByRole('heading', { name: 'Imported via e2e' })).toBeVisible();
  await expect(taskList.getByRole('heading', { name: 'Export me first' })).toHaveCount(0);
});

test('shows deterministic TEFQ now queue ordering and context fallback', async ({ page }) => {
  await openWithFixedClock(page);

  await createTask(page, {
    title: 'Urgent client call',
    dueDate: '2026-02-19',
    priority: 'High',
    duration: '15',
    energy: 'Medium',
    context: 'Calls'
  });

  await createTask(page, {
    title: 'Long backlog call',
    duration: '60',
    energy: 'Medium',
    context: 'Calls'
  });

  const recommendations = page.getByRole('list', { name: 'Now queue recommendations' });
  await expect(recommendations.locator('li').first().getByRole('heading')).toHaveText('Urgent client call');

  await page.getByLabel('Context (optional)').selectOption('Deep Work');
  await expect(page.getByText('No matches for the selected context. Try relaxing the context filter or review closest alternatives below.')).toBeVisible();

  const fallback = page.getByRole('list', { name: 'Now queue fallback' });
  await expect(fallback.locator('li').first().getByRole('heading')).toHaveText('Urgent client call');
});
