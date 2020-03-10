import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { About } from './about/about.component';

import { VideoAnalysisComponent } from './video-analysis/video-analysis.component';

import { ErrorComponent } from './error/error.component';

const routes: Routes = [
  { path: '', component: About },
  { path: 'VideoAnalysis',  component: VideoAnalysisComponent },

  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
