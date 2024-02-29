import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CircleNode } from './editor/node/node.component';
import { CircleSocket } from './editor/socket/socket.component';
import { CustomConnection } from './editor/connection/connection.component';

import { ReteModule } from 'rete-angular-plugin/16';

@NgModule({
  declarations: [
    AppComponent,
    CircleNode,
    CircleSocket,
    CustomConnection
  ],
  imports: [BrowserModule, ReteModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
