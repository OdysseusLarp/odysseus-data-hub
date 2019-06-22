import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-velian-confirm-dialog',
	templateUrl: './velian-confirm-dialog.component.html',
	styleUrls: ['./velian-confirm-dialog.component.scss'],
})
export class VelianConfirmDialogComponent implements OnInit {
	constructor(
		private dialogRef: MatDialogRef<VelianConfirmDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	ngOnInit() {}

	close() {
		this.dialogRef.close();
	}
}
