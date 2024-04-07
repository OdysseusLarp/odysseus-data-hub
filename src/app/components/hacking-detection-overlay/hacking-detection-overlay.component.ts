import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '@app/services/state.service';
import { Observable, Subscription, of, timer } from 'rxjs';
import { finalize, map, takeWhile } from 'rxjs/operators';
import { get } from 'lodash';

const TICK_RATE_MS = 200;

const hackerAnalysisMessages: string[] = [
	'Anomaly detected. EVA is initiating security protocols.',
	'EVA is reviewing user activity for irregularities.',
	'EVA is initiating an identity confirmation sequence.',
	'EVA is conducting a deep system analysis of recent command entries.',
	'EVA is commencing the authorization verification process.',
	'EVA is performing an unscheduled security audit.',
	'EVA is cross-referencing user access logs.',
	'System integrity check is underway. Please stand by.',
	'User commands are under scrutiny by EVA for compliance with security standards.',
	'EVA is performing a heuristic analysis of user behavior.',
	'Access patterns are undergoing real-time analysis by EVA.',
	'EVA is verifying user credentials against the security matrix.',
	'A system sweep is in progress to validate current operations.',
	'EVA is engaging countermeasures for potential threats.',
	'User actions are being compiled by EVA for a comprehensive security review.',
	'EVA is running diagnostics on recent network activity.',
	' EVA is initiating a forensic examination of system access.',
	'A security evaluation is in progress. User activity is temporarily on hold.',
	'EVA is matching user activity with security profiles.',
	'EVA is preparing to enforce security protocols. Verification required.',
];

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
	hackerAnalysisMessage =
		hackerAnalysisMessages[
			Math.floor(Math.random() * hackerAnalysisMessages.length)
		];
	hasBeenDetected = false;

	constructor(private state: StateService) {}

	ngOnInit() {
		this.userSubscription = this.state.user.subscribe(user => {
			const detectionTimeMs = get(user, 'hacker.detectionTimeMs');
			const intrusionDetectedMessage = get(
				user,
				'hacker.intrusionDetectedMessage'
			);
			if (detectionTimeMs) {
				const endTime = Date.now() + detectionTimeMs;
				this.hasBeenDetected = false;

				this.detectionTimeMs$ = timer(0, TICK_RATE_MS).pipe(
					map(() => endTime - Date.now()),
					takeWhile(timeLeft => timeLeft > 0),
					finalize(() => {
						if (intrusionDetectedMessage) {
							this.hackerAnalysisMessage = intrusionDetectedMessage;
						}
						this.hasBeenDetected = true;
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
