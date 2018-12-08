import { Routes } from '@angular/router';
import { NewsComponent } from './components/news/news.component';
import { LoginComponent } from './components/login/login.component';
import { PersonnelComponent } from '@app/components/personnel/personnel.component';
import { VoteComponent } from '@app/components/vote/vote.component';
import { MessagesComponent } from '@app/components/messages/messages.component';
import { ShipLogComponent } from '@app/components/ship-log/ship-log.component';
import { VoteDetailsComponent } from '@app/components/vote-details/vote-details.component';

export const routes: Routes = [
	{ path: '', component: LoginComponent },
	{ path: 'news', component: NewsComponent },
	{ path: 'personnel', component: PersonnelComponent },
	{ path: 'vote', component: VoteComponent },
	{ path: 'vote/:id', component: VoteDetailsComponent },
	{ path: 'messages', component: MessagesComponent },
	{ path: 'ship-log', component: ShipLogComponent },
];
