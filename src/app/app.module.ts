import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { InputTrimModule } from 'ng2-trim-directive';
import { NgxAutoScrollModule } from 'ngx-auto-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgSelectModule } from '@ng-select/ng-select';
import { MarkdownModule } from 'ngx-markdown';

import { MatTabsModule } from '@angular/material/tabs';

import { AppRoutingModule } from './app-routing.module';
import { AuthGuard, routes } from './routes';

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
import { MapComponent } from '@components/map/map.component';
import { DottedListComponent } from '@components/map/components/dotted-list.component';
import { ObjectDetailsComponent } from '@components/map/components/object-details.component';
import { GridDetailsComponent } from '@components/map/components/grid-details.component';
import { ShipDetailsComponent } from '@components/map/components/ship-details.component';

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
		MapComponent,
		DottedListComponent,
		ObjectDetailsComponent,
		GridDetailsComponent,
		ShipDetailsComponent,
	],
	imports: [
		BrowserModule,
		// Screw animations
		NoopAnimationsModule,
		AppRoutingModule,
		InputTrimModule,
		RouterModule.forRoot(routes),
		ReactiveFormsModule,
		NgxAutoScrollModule,
		NgxDatatableModule,
		NgScrollbarModule,
		NgSelectModule,
		MarkdownModule.forRoot(),
		MatTabsModule,
		HttpClientModule,
	],
	providers: [StateService, MessagingService, AuthGuard, HttpClient],
	bootstrap: [AppComponent],
})
export class AppModule {}
