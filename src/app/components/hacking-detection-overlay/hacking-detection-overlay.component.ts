import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { Observable, Subscription, of, timer } from 'rxjs';
import { finalize, map, takeWhile } from 'rxjs/operators';
import { get } from 'lodash';
import { Router } from '@angular/router';

const TICK_RATE_MS = 200;

@Component({
	selector: 'app-hacking-detection-overlay',
	templateUrl: './hacking-detection-overlay.component.html',
	styleUrls: ['./hacking-detection-overlay.component.scss'],
})
export class HackingDetectionOverlayComponent implements OnInit, OnDestroy {
	userSubscription: Subscription;
	detectionTimeMs$: Observable<number>;
	elapsedTimePercentage$: Observable<number>;
	roundedElapsedTimePercentage$: Observable<number>;

	constructor(private state: StateService, private router: Router) {}

	ngOnInit() {
		this.userSubscription = this.state.user.subscribe(user => {
			const detectionTimeMs = get(user, 'hacker.detectionTimeMs');
			if (detectionTimeMs) {
				const endTime = Date.now() + detectionTimeMs;

				this.detectionTimeMs$ = timer(0, TICK_RATE_MS).pipe(
					map(() => endTime - Date.now()),
					takeWhile(timeLeft => timeLeft > 0),
					finalize(() => {
						// Logout when time runs out
						this.state.logout.next();
						this.router.navigate(['/']);
					})
				);

				this.elapsedTimePercentage$ = this.detectionTimeMs$.pipe(
					map(timeLeft => (1 - timeLeft / detectionTimeMs) * 100)
				);

				this.roundedElapsedTimePercentage$ = this.elapsedTimePercentage$.pipe(
					map(percentage => Math.round(percentage))
				);
			} else {
				this.detectionTimeMs$ = of(null);
				this.elapsedTimePercentage$ = of(null);
				this.roundedElapsedTimePercentage$ = of(null);
			}
		});
	}

	ngOnDestroy() {
		this.userSubscription.unsubscribe();
		if (this.detectionTimeMs$) {
			this.detectionTimeMs$.subscribe().unsubscribe();
		}
		if (this.elapsedTimePercentage$) {
			this.elapsedTimePercentage$.subscribe().unsubscribe();
		}
		if (this.roundedElapsedTimePercentage$) {
			this.roundedElapsedTimePercentage$.subscribe().unsubscribe();
		}
	}
}
