import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { InputTrimModule } from 'ng2-trim-directive';
import { NgxAutoScrollModule } from 'ngx-auto-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgSelectModule } from '@ng-select/ng-select';
import { MarkdownModule } from 'ngx-markdown';

import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { AuthGuard, PermissionGuard, routes } from './routes';

import { AppComponent } from './app.component';
import { NewsComponent } from '@components/news/news.component';
import { LoginComponent } from '@components/login/login.component';
import { PersonnelComponent } from '@components/personnel/personnel.component';
import { VoteComponent } from '@components/vote/vote.component';
import { MessagesComponent } from '@components/messages/messages.component';
import { ShipLogComponent } from '@components/ship-log/ship-log.component';
import { VoteDetailsComponent } from '@components/vote-details/vote-details.component';
import { StateService } from '@services/state.service';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { MessagingService } from '@app/services/messaging.service';
import { PersonnelDetailsComponent } from '@components/personnel-details/personnel-details.component';
import { ArtifactsComponent } from '@components/artifacts/artifacts.component';
import { ArtifactDetailsComponent } from '@components/artifact-details/artifact-details.component';
import { FleetComponent } from '@components/fleet/fleet.component';
import { FleetDetailsComponent } from '@components/fleet-details/fleet-details.component';
import { CaptainsLogComponent } from '@components/captains-log/captains-log.component';
import { PostFormComponent } from '@components/shared/post-form/post-form.component';
import { PostItemComponent } from '@components/shared/post-item/post-item.component';
import { VoteCreateComponent } from '@components/vote-create/vote-create.component';
import { TableComponent } from '@components/shared/table/table.component';
import { HackingComponent } from '@components/hacking/hacking.component';
import { StaticScreenComponent } from '@components/static-screen/static-screen.component';
import { ShipLogSnackbarComponent } from '@components/ship-log-snackbar/ship-log-snackbar.component';
import { ArtifactCreateComponent } from '@components/artifact-create/artifact-create.component';
import { DurationPipe } from './pipes/duration.pipe';
import { MatRadioModule, MatDialogModule } from '@angular/material';
import { MessageDialogComponent } from '@components/message-dialog/message-dialog.component';
import { PhoneComponent } from './components/phone/phone.component';
import { GmConfigComponent } from './components/gm-config/gm-config.component';
import { SipService } from './services/sip.service';
import { VelianComponent } from './components/velian/velian.component';
import { VelianConfirmDialogComponent } from './components/velian-confirm-dialog/velian-confirm-dialog.component';

@NgModule({
	declarations: [
		AppComponent,
		NewsComponent,
		LoginComponent,
		PersonnelComponent,
		VoteComponent,
		MessagesComponent,
		ShipLogComponent,
		VoteDetailsComponent,
		SidebarComponent,
		PersonnelDetailsComponent,
		ArtifactsComponent,
		ArtifactDetailsComponent,
		FleetComponent,
		FleetDetailsComponent,
		CaptainsLogComponent,
		PostFormComponent,
		PostItemComponent,
		VoteCreateComponent,
		TableComponent,
		HackingComponent,
		StaticScreenComponent,
		ShipLogSnackbarComponent,
		ArtifactCreateComponent,
		DurationPipe,
		MessageDialogComponent,
		PhoneComponent,
		GmConfigComponent,
		VelianComponent,
		VelianConfirmDialogComponent,
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		AppRoutingModule,
		InputTrimModule,
		RouterModule.forRoot(routes),
		ReactiveFormsModule,
		FormsModule,
		NgxAutoScrollModule,
		NgxDatatableModule,
		NgScrollbarModule,
		NgSelectModule,
		MarkdownModule.forRoot(),
		MatTabsModule,
		MatSnackBarModule,
		MatRadioModule,
		MatDialogModule,
		HttpClientModule,
	],
	providers: [
		StateService,
		MessagingService,
		AuthGuard,
		PermissionGuard,
		SipService,
		HttpClient,
	],
	bootstrap: [AppComponent],
	entryComponents: [
		ShipLogSnackbarComponent,
		MessageDialogComponent,
		VelianConfirmDialogComponent,
	],
})
export class AppModule {}
