import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
	selector: 'app-velian-dialog',
	templateUrl: './velian-dialog.component.html',
	styleUrls: ['./velian-dialog.component.scss'],
})
export class VelianDialogComponent implements OnInit {
	constructor(private dialogRef: MatDialogRef<VelianDialogComponent>) {}

	ngOnInit() {}

	close() {
		this.dialogRef.close();
	}
}
