import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import {
	Observable,
	interval,
	combineLatest,
	Subscription,
	BehaviorSubject,
} from 'rxjs';
import { filter, startWith, map } from 'rxjs/operators';
import { StateService, VelianState } from '@app/services/state.service';
import moment from 'moment';
import { autobind } from 'core-decorators';
import { DialogService } from '@app/services/dialog.service';
import { patchDataTypeId } from '@api/Data';
import { putStarmapVelianDistressSignal } from '@api/Starmap';
import { VelianConfirmDialogComponent } from '@components/velian-confirm-dialog/velian-confirm-dialog.component';
import { DIALOG_SETTINGS } from '@components/message-dialog/message-dialog.component';
import { VelianDialogComponent } from '@app/components/velian-dialog/velian-dialog.component';

@Component({
	selector: 'app-velian',
	templateUrl: './velian.component.html',
	styleUrls: ['./velian.component.scss'],
})
export class VelianComponent implements OnInit, OnDestroy {
	lifesupportRunsOutIn$: Observable<string>;
	velianState$: Subscription;
	meterPercentage$: Subscription;
	velianState: VelianState;
	distressSignal: string;
	lifesupportOffline$ = new BehaviorSubject<boolean>(false);
	confirmDialogRef: MatDialogRef<VelianConfirmDialogComponent>;

	constructor(
		public state: StateService,
		private dialog: DialogService,
		private matDialog: MatDialog
	) {}

	ngOnInit() {
		this.state.velianState$
			.pipe(filter(Boolean))
			.subscribe((velianState: VelianState) => {
				this.velianState = velianState;
				if (velianState.hasSentSignal && this.confirmDialogRef)
					this.confirmDialogRef.close();
			});

		const lifesupportUpdateInterval$ = interval(1000).pipe(startWith(0));
		this.lifesupportRunsOutIn$ = combineLatest(
			this.state.velianState$,
			lifesupportUpdateInterval$
		).pipe(
			filter(([velianState]) => !!velianState),
			map(([velianState]) => {
				this.lifesupportOffline$.next(
					Date.now() > velianState.lifesupportRunsOutAt
				);
				const runsOutat = moment(velianState.lifesupportRunsOutAt);
				const diff = runsOutat.diff(moment());
				if (diff < 0) return '00 HOURS 00 MINUTES 00 SECONDS';
				return moment.utc(diff).format('HH [HOURS] mm [MINUTES] ss [SECONDS]');
			})
		);

		this.meterPercentage$ = combineLatest(
			this.state.velianState$,
			lifesupportUpdateInterval$
		)
			.pipe(filter(([velianState]) => !!velianState))
			.subscribe(([velianState]) => {
				const { lifesupportRunsOutAt, lifesupportMaxTime } = velianState;
				const range = lifesupportRunsOutAt - lifesupportMaxTime;
				const passed = Date.now() - lifesupportMaxTime;
				let val = Math.ceil(100 * (passed / range));
				if (val > 100) val = 100;
				document.documentElement.style.setProperty(
					'--lifesupport-percentage',
					`${val}%`
				);
			});
	}

	ngOnDestroy() {
		this.velianState$.unsubscribe();
	}

	@autobind
	onCompleteHacking() {
		patchDataTypeId('velian', 'misc', {
			version: this.velianState.version,
			hackingComplete: true,
		} as any);
	}

	openCaptainsLogDialog() {
		// this.dialog.info(`Captain's log entry`, this.velianState.captainsLogText);
		this.matDialog.open(VelianDialogComponent, { ...DIALOG_SETTINGS });
	}

	openConfirmationDialog() {
		if (!this.distressSignal) return;
		this.confirmDialogRef = this.matDialog.open(VelianConfirmDialogComponent, {
			...DIALOG_SETTINGS,
			data: { onSubmit: this.sendDistressSignal, message: this.distressSignal },
		});
	}

	@autobind
	sendDistressSignal() {
		if (
			!this.velianState.canSendSignal ||
			this.velianState.hasSentSignal ||
			!this.distressSignal
		)
			return;
		putStarmapVelianDistressSignal({ message: this.distressSignal });
	}
}
