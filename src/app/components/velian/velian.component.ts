import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { StateService, VelianState } from '@app/services/state.service';
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
	velianState$: Subscription;
	velianState: VelianState;
	distressSignal: string;
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
