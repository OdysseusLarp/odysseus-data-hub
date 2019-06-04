import { Injectable } from '@angular/core';
import {
	MessageDialogComponent,
	DIALOG_SETTINGS,
} from '@components/message-dialog/message-dialog.component';
import { MatDialog } from '@angular/material';

@Injectable({
	providedIn: 'root',
})
export class DialogService {
	constructor(private matDialog: MatDialog) {}

	info(title: string, message: string) {
		return this.openMessageDialog('INFO', title, message);
	}

	warning(title: string, message: string) {
		return this.openMessageDialog('WARNING', title, message);
	}

	error(title: string, message: string) {
		return this.openMessageDialog('ERROR', title, message);
	}

	success(title: string, message: string) {
		return this.openMessageDialog('SUCCESS', title, message);
	}

	openMessageDialog(type: string, title: string, message: string) {
		return this.matDialog.open(MessageDialogComponent, {
			...DIALOG_SETTINGS,
			data: { type, title, message },
		});
	}
}
