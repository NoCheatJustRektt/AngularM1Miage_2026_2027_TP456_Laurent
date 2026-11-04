import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { catchError, map, type Observable, of, startWith, Subject, switchMap } from 'rxjs';

import { HealthApi } from '../../../../core/health/health.api';

type ApiStatus = 'checking' | 'online' | 'offline';

/** Page d'accueil. À l'étape 0, elle présente le projet et vérifie que l'API répond. */
@Component({
  selector: 'app-home-page',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly healthApi = inject(HealthApi);
  private readonly retry$ = new Subject<void>();

  protected readonly apiStatus = toSignal(
    this.retry$.pipe(
      startWith(undefined),
      switchMap(() => this.checkApi()),
    ),
    { initialValue: 'checking' as ApiStatus },
  );

  protected retry(): void {
    this.retry$.next();
  }

  private checkApi(): Observable<ApiStatus> {
    return this.healthApi.getHealth().pipe(
      map((): ApiStatus => 'online'),
      catchError(() => of<ApiStatus>('offline')),
      startWith<ApiStatus>('checking'),
    );
  }
}
