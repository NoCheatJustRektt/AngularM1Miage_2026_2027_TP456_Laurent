import { TestBed } from '@angular/core/testing';
import { type Observable, of, Subject, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import type { HealthResponse } from '@studyshare/shared';

import { HealthApi } from '../../../../core/health/health.api';
import { HomePage } from './home.page';

async function createPage(getHealth: () => Observable<HealthResponse>) {
  const healthApi = { getHealth: vi.fn(getHealth) };
  await TestBed.configureTestingModule({
    imports: [HomePage],
    providers: [{ provide: HealthApi, useValue: healthApi }],
  }).compileComponents();

  const fixture = TestBed.createComponent(HomePage);
  await fixture.whenStable();
  return { fixture, healthApi, element: fixture.nativeElement as HTMLElement };
}

function statusText(element: HTMLElement): string {
  return element.querySelector('[role="status"]')?.textContent?.trim() ?? '';
}

describe('HomePage', () => {
  it('affiche le titre de bienvenue', async () => {
    const { element } = await createPage(() => of({ status: 'ok', uptime: 1 }));

    expect(element.querySelector('h1')?.textContent).toContain('Bienvenue sur StudyShare');
  });

  it('indique que la connexion est en cours tant que le serveur n’a pas répondu', async () => {
    const { element } = await createPage(() => new Subject<HealthResponse>());

    expect(statusText(element)).toContain('Connexion au serveur');
  });

  it('indique que le serveur répond', async () => {
    const { element } = await createPage(() => of({ status: 'ok', uptime: 42 }));

    expect(statusText(element)).toContain('Le serveur répond.');
    expect(element.querySelector('button')).toBeNull();
  });

  it('indique que le serveur ne répond pas et propose de réessayer', async () => {
    const { element } = await createPage(() => throwError(() => new Error('hors ligne')));

    expect(statusText(element)).toContain('Le serveur ne répond pas.');
    expect(element.querySelector('button')?.textContent).toContain('Réessayer');
  });

  it('relance la vérification avec le bouton Réessayer', async () => {
    let isServerUp = false;
    const { fixture, element, healthApi } = await createPage(() =>
      isServerUp ? of({ status: 'ok', uptime: 3 }) : throwError(() => new Error('hors ligne')),
    );

    isServerUp = true;
    element.querySelector('button')?.click();
    await fixture.whenStable();

    expect(healthApi.getHealth).toHaveBeenCalledTimes(2);
    expect(statusText(element)).toContain('Le serveur répond.');
  });
});
