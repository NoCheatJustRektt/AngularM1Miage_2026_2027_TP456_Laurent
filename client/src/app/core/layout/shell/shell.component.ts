import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

interface NavigationItem {
  label: string;
  icon: string;
  path: string;
}

/** Structure commune à toutes les pages : barre du haut, menu latéral et contenu. */
@Component({
  selector: 'app-shell',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  // Le menu s'enrichit à chaque étape de la feuille de route (docs/ROADMAP.md).
  protected readonly navigationItems: NavigationItem[] = [
    { label: 'Accueil', icon: 'home', path: '/' },
  ];

  protected readonly isHandset = toSignal(
    inject(BreakpointObserver)
      .observe(Breakpoints.Handset)
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  private readonly isMenuOpenOnHandset = signal(false);

  /** Sur ordinateur le menu est toujours ouvert ; sur téléphone il s'ouvre avec le bouton ☰. */
  protected readonly isMenuOpen = computed(() => !this.isHandset() || this.isMenuOpenOnHandset());

  protected toggleMenu(): void {
    this.isMenuOpenOnHandset.update((isOpen) => !isOpen);
  }

  protected closeMenuOnHandset(): void {
    this.isMenuOpenOnHandset.set(false);
  }
}
