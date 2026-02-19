import { expect, test, type Page } from '@playwright/test';

const FIXED_NOW_ISO = '2026-02-19T00:00:00.000Z';
const STORAGE_KEY = 'novel-task-tracker/tasks';

async function openWithFixedClock(page: Page): Promise<void> {
  await page.addInitScript(({ fixedNowIso, storageKey }) => {
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

    window.localStorage.removeItem(storageKey);
  }, { fixedNowIso: FIXED_NOW_ISO, storageKey: STORAGE_KEY });

  await page.goto('/');
}

async function createTask(
  page: Page,
  {
    title,
    duration,
    energy,
    context
  }: { title: string; duration?: string; energy?: 'Low' | 'Medium' | 'High'; context?: 'Deep Work' | 'Admin' | 'Errands' | 'Calls' }
): Promise<void> {
  await page.locator('#task-title').fill(title);

  if (duration) {
    await page.locator('#task-duration').selectOption(duration);
  }

  if (energy) {
    await page.locator('#task-energy').selectOption(energy);
  }

  if (context) {
    await page.locator('#task-context').selectOption(context);
  }

  await page.getByRole('button', { name: 'Add task' }).click();
}

test('can add a task and mark it completed', async ({ page }) => {
  await openWithFixedClock(page);

  await createTask(page, { title: 'Write smoke tests' });

  const taskList = page.getByRole('list', { name: 'Task list' });
  await expect(taskList.getByRole('heading', { name: 'Write smoke tests' })).toBeVisible();
  await expect(taskList.getByText('Open')).toBeVisible();

  await page.getByRole('button', { name: 'Mark completed' }).click();

  await expect(taskList.getByText('Completed')).toBeVisible();
  await page.getByLabel('Status').selectOption('completed');
  await expect(taskList.getByRole('heading', { name: 'Write smoke tests' })).toBeVisible();
});

test('supports editing and search filter', async ({ page }) => {
  await openWithFixedClock(page);

  await createTask(page, { title: 'Draft release notes' });

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Edit title').fill('Draft sprint release notes');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByLabel('Search').fill('sprint');
  await expect(page.getByRole('list', { name: 'Task list' }).getByRole('heading', { name: 'Draft sprint release notes' })).toBeVisible();

  await page.getByLabel('Search').fill('nonexistent');
  await expect(page.getByText('No tasks match your current search or filters.')).toBeVisible();
});

test('shows TEFQ now queue and context fallback deterministically', async ({ page }) => {
  await openWithFixedClock(page);

  await createTask(page, {
    title: 'Call accountant',
    duration: '15',
    energy: 'Medium',
    context: 'Calls'
  });

  await createTask(page, {
    title: 'Inbox triage',
    duration: '15',
    energy: 'Medium',
    context: 'Admin'
  });

  const recommendations = page.getByRole('list', { name: 'Now queue recommendations' });
  await expect(recommendations.getByRole('heading', { name: 'Call accountant' })).toBeVisible();
  await expect(recommendations.getByRole('heading', { name: 'Inbox triage' })).toBeVisible();

  await page.getByLabel('Context (optional)').selectOption('Deep Work');

  await expect(page.getByText('No matches for the selected context. Try relaxing the context filter or review closest alternatives below.')).toBeVisible();

  const fallback = page.getByRole('list', { name: 'Now queue fallback' });
  await expect(fallback.getByRole('heading', { name: 'Call accountant' })).toBeVisible();
});
