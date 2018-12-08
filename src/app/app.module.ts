import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InputTrimModule } from 'ng2-trim-directive';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NewsComponent } from './components/news/news.component';
import { LoginComponent } from './components/login/login.component';

import { routes } from './routes';
import { PersonnelComponent } from './components/personnel/personnel.component';
import { VoteComponent } from './components/vote/vote.component';
import { MessagesComponent } from './components/messages/messages.component';
import { ShipLogComponent } from './components/ship-log/ship-log.component';
import { VoteDetailsComponent } from './components/vote-details/vote-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { StateService } from '@app/services/state.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';

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
		SidebarComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		InputTrimModule,
		RouterModule.forRoot(routes),
		ReactiveFormsModule
	],
	providers: [StateService],
	bootstrap: [AppComponent]
})
export class AppModule { }
