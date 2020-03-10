import { Component
  ,AfterViewInit
  , OnInit
  ,ViewChild
  ,ElementRef
  ,Renderer2
  ,OnDestroy 
} from '@angular/core';
import { timer,interval  } from 'rxjs';
import { Prediction } from './prediction';
import * as automl from '@tensorflow/tfjs-automl';

@Component({
  selector: 'app-video-analysis',
  templateUrl: './video-analysis.component.html',
  styleUrls: ['./video-analysis.component.scss']
})

export class VideoAnalysisComponent implements OnInit,OnDestroy {

  model;
  public modelloadedBool: boolean = false;
  OBJmodelUrl = './assets/modelcategories/model.json';
  predictions: Prediction[];
            
@ViewChild('video') videoElement: ElementRef;

get video(): HTMLVideoElement {
  return this.videoElement.nativeElement
}

public loading: boolean=false;

videoWidth = 0;
videoHeight = 0;
constraints = {
    video: {
        facingMode: "environment",
        width: { ideal: 600 },
        height: { ideal: 600 }
    }
};

subscriptionTimer;
subscription;
stream1;
timer = null;

public modelloaded: boolean = false;

  constructor(
    private renderer: Renderer2) { 
    }

    public async ngOnInit() {
      this.model=await automl.loadImageClassification(this.OBJmodelUrl);
      this.loading = false;
  
    }


    async   startCamera() {
      if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {

        await  navigator.mediaDevices
          .getUserMedia(this.constraints).then(
                                        this.attachVideo.bind(this)
          ).catch(this.handleError);
      } else {
          alert('Sorry, camera not available.');
      }
  }

  async attachVideo(stream) {
    this.toggleTimer();

      const video=this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
     await this.renderer.listen(this.videoElement.nativeElement, 'play', (event) => {

          this.videoHeight = this.videoElement.nativeElement.videoHeight;
          this.videoWidth = this.videoElement.nativeElement.videoWidth;

        if (navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
              // this.video.srcObject = stream;
              this.stream1 = stream;
              this.startTimer();
            })
            .catch((err0r) => {
              console.log('Something went wrong!');
            });
        }
      });
  }

  handleError(error) {
      console.log('Error: ', error);
  }

  async toggleTimer() {
    this.loading=true;
       const delay = timer(60000);
       this.subscriptionTimer = await delay.subscribe(val => { 
          this.stopCamera(this.videoElement)
       });
    }

    async startTimer() {
      this.subscription =await interval(10000)
      .subscribe((val) => {
        this.modelloaded=true;
          this.callmdl()
     });
    }
    stopTimer() {
      this.subscription.unsubscribe();
    }


  stopCamera(videoElem) {
    const stream = videoElem.srcObject;
    const tracks= stream.getTracks();  
    tracks.forEach(function(track) {
      track.stop();
    });
    videoElem.srcObject = null;
    this.loading=false;
    this.subscription.unsubscribe();
    this.modelloaded=false;
  }

  async callmdl(){
    const params = {"score_threshold": "0.88"}
    await this.model.classify(this.videoElement.nativeElement,params).then((res)=>{
       this.predictions=res;
       console.log(this.predictions);
    });
  }
  




ngOnDestroy() {
  if (this.stream1) {
    this.stopCamera(this.videoElement.nativeElement)
  // this.stream1.getTracks().forEach(function(track) {
  //   console.log('1')
  //   track.stop();
  // });
  }

//   Array.from(this.videoElement.nativeElement.children).forEach(child => {
//     console.log('children.length=' + this.videoElement.nativeElement.children.length);
//     this.renderer.removeChild(this.videoElement.nativeElement, child);
// }); 

  this.loading=false;
  if (this.subscriptionTimer) {this.subscriptionTimer.unsubscribe();}
  if (this.subscription) {this.subscription.unsubscribe();}
}

}
