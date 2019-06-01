import { Component, OnInit, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';

@Component({
	selector: 'app-ship-log-snackbar',
	templateUrl: './ship-log-snackbar.component.html',
	styleUrls: ['./ship-log-snackbar.component.scss'],
})
export class ShipLogSnackbarComponent implements OnInit {
	constructor(
		@Inject(MAT_SNACK_BAR_DATA) public data: any,
		private snackBar: MatSnackBar
	) {}

	ngOnInit() {}

	onClose() {
		this.snackBar.dismiss();
	}
}
