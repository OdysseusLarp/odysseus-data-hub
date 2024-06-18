import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
	selector: 'app-velian-dialog',
	templateUrl: './velian-dialog.component.html',
	styleUrls: ['./velian-dialog.component.scss'],
})
export class VelianDialogComponent implements OnInit {
	constructor(
		private dialogRef: MatDialogRef<VelianDialogComponent>,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {}

	ngAfterViewInit() {
		setTimeout(() => {
			this.cdr.detectChanges();
			const captainsLogTitle = document.querySelector(
				'#velian-captains-log-title'
			);
			if (captainsLogTitle) {
				captainsLogTitle.scrollIntoView({ behavior: 'smooth' });
			}
		}, 300);
	}

	close() {
		this.dialogRef.close();
	}
}
