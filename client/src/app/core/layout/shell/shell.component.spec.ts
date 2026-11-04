import { BreakpointObserver, type BreakpointState } from '@angular/cdk/layout';
import { TestBed } from '@angular/core/testing';
import { MatSidenav } from '@angular/material/sidenav';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { ShellComponent } from './shell.component';

async function createShell(isHandset: boolean) {
  const state: BreakpointState = { matches: isHandset, breakpoints: {} };
  await TestBed.configureTestingModule({
    imports: [ShellComponent],
    providers: [
      provideRouter([]),
      { provide: BreakpointObserver, useValue: { observe: () => of(state) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ShellComponent);
  await fixture.whenStable();
  const element = fixture.nativeElement as HTMLElement;
  const sidenav = fixture.debugElement.query(By.directive(MatSidenav))
    .componentInstance as MatSidenav;
  return { fixture, element, sidenav };
}

describe('ShellComponent', () => {
  it('affiche le nom de l’application avec un lien vers l’accueil', async () => {
    const { element } = await createShell(false);

    const brand = element.querySelector<HTMLAnchorElement>('.brand');
    expect(brand?.textContent).toContain('StudyShare');
    expect(brand?.getAttribute('href')).toBe('/');
  });

  it('affiche le lien Accueil dans le menu', async () => {
    const { element } = await createShell(false);

    const titles = Array.from(element.querySelectorAll('mat-nav-list a [matListItemTitle]'));
    expect(titles.map((title) => title.textContent?.trim())).toEqual(['Accueil']);
    expect(element.querySelector('mat-nav-list a')?.getAttribute('href')).toBe('/');
  });

  it('garde le menu ouvert sur ordinateur, sans bouton ☰', async () => {
    const { element, sidenav } = await createShell(false);

    expect(sidenav.mode).toBe('side');
    expect(sidenav.opened).toBe(true);
    expect(element.querySelector('button[aria-label="Ouvrir ou fermer le menu"]')).toBeNull();
  });

  it('sur téléphone, ferme le menu et l’ouvre avec le bouton ☰', async () => {
    const { fixture, element, sidenav } = await createShell(true);
    expect(sidenav.mode).toBe('over');
    expect(sidenav.opened).toBe(false);

    element
      .querySelector<HTMLButtonElement>('button[aria-label="Ouvrir ou fermer le menu"]')
      ?.click();
    await fixture.whenStable();

    expect(sidenav.opened).toBe(true);
  });
});
