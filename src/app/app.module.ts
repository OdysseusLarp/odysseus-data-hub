import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTrimModule } from 'ng2-trim-directive';
import { NgxAutoScrollModule } from 'ngx-auto-scroll';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppRoutingModule } from './app-routing.module';
import { routes } from './routes';

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
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		InputTrimModule,
		RouterModule.forRoot(routes),
		ReactiveFormsModule,
		NgxAutoScrollModule,
		NgxDatatableModule,
		NgScrollbarModule,
		NgSelectModule,
	],
	providers: [StateService, MessagingService],
	bootstrap: [AppComponent],
})
export class AppModule {}
