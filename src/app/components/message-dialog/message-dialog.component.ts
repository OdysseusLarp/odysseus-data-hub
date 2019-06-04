import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export const DIALOG_SETTINGS = {
	hasBackdrop: true,
	width: '750px',
	panelClass: 'boxed',
};

@Component({
	selector: 'app-message-dialog',
	templateUrl: './message-dialog.component.html',
	styleUrls: ['./message-dialog.component.scss'],
})
export class MessageDialogComponent implements OnInit {
	constructor(
		private dialogRef: MatDialogRef<MessageDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {}

	close() {
		this.dialogRef.close();
	}
}
