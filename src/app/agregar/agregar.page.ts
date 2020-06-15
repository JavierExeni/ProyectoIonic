import { File, FileEntry} from '@ionic-native/file/ngx';
import { Storage } from '@ionic/storage';
import { Component, OnInit} from '@angular/core';
import { DatabaseService, Diario } from '../services/database.service';
import { MediaCapture, MediaFile, CaptureError} from '@ionic-native/media-capture/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Vibration } from '@ionic-native/vibration/ngx';

const MEDIA_FOLDER_NAME = 'audio_app_media';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.page.html',
  styleUrls: ['./agregar.page.scss'],
})
export class AgregarPage implements OnInit {


  imgURL: string = 'nada'; 
  audioURL: string;
  //manejara los arcihvos de audio internamente
  files = [];
  // manejar un audio
  auxfile = []
  //falg
  flag = false;
  flagAudio = false;



  days: Diario[] = [];

  day = {}
  constructor(private db: DatabaseService, 
    private mediaCapture: MediaCapture,
    private storage: Storage,
    private media: Media,
    private file: File,
    private camera: Camera,
    private plt: Platform,
    private router: Router,
    private vibration: Vibration) { }

  ngOnInit() {
    this.plt.ready().then(() => {
      let path = this.file.dataDirectory;
      console.log('aqui el this.file.dataDirectory ', path)
      this.file.checkDir(path, MEDIA_FOLDER_NAME).then(
        () => {
          console.log('directorio existe')
          console.log('Aqui el path del file ', this.file)
          //this.loadFiles();
        },
        err => {
          console.log('directorio no existe')
          this.file.createDir(path, MEDIA_FOLDER_NAME, false);
        }
      );
    });
  }


  loadFiles() {
    this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME).then(
      res => {
          this.files = res;
          this.auxfile = res;
          let cantidad = this.files.length
          console.log('Aqui en cantidaaad ', cantidad)
         
          if(this.files.length > 0){
            for(let f of this.files){
              console.log('cada una ', f)
              if(cantidad){
                console.log('entro if')
                this.auxfile = f;
                console.log('dento del if el aux ', this.auxfile)
              }
            }
          }     

      },
      err => console.log('error loading files: ', err)
    );
  }

  capturarAudio(){
    this.mediaCapture.captureAudio().then(
      (data: MediaFile[]) => {
        if (data.length > 0) {
          this.copyFileToLocalDir(data[0].fullPath);
        }
      },
      (err: CaptureError) => console.error(err)
    );
  }

  copyFileToLocalDir(fullPath) {
    console.log('fullpath ', fullPath)
    let myPath = fullPath;
    // Make sure we copy from the right location
    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
      console.log('mypath entro ', myPath)
    }

    const ext = myPath.split('.').pop();
    console.log('ext ', ext)
    const d = Date.now();
    const newName = `${d}.${ext}`;
    console.log('newName ', newName)

    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    console.log('name ', name)
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    console.log('copyFrom ', copyFrom)
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;
    console.log('copyTo ', copyTo)

    this.file.copyFile(copyFrom, name, copyTo, newName).then(
      () => {
        this.loadFiles();
      },
      error => {
        console.log('error: ', error);
      }
    );
  }


  play(f: FileEntry){
    if (f.name.indexOf('.amr') > -1) {
      // We need to remove file:/// from the path for the audio plugin to work
      const path =  f.nativeURL.replace(/^file:\/\//, '');
      this.audioURL = path
      console.log('AUDIO CREADOO ', this.audioURL)
      const audioFile: MediaObject = this.media.create(path);
      audioFile.play();
    } 
  }

  deleteFile(f: FileEntry) {
    const path = f.nativeURL.substr(0, f.nativeURL.lastIndexOf('/') + 1);
    console.log('esto contiene ', this.auxfile)
    console.log('este es el path del audio ', path)
    console.log('este el el nombre ', f.name)
    this.auxfile.pop
    this.file.removeFile(path, f.name).then(() => {
      this.loadFiles();
    }, err => console.log('error remove: ', err));
  }

  capturarImagen(){
    this.camera.getPicture({
      saveToPhotoAlbum: true,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.camera.DestinationType.DATA_URL
    }).then((res) =>{
      this.imgURL = 'data:image/jpeg;base64,' + res;
      console.log('imagen sacada foto ', this.imgURL)
    }).catch(e =>{
      console.log(e);
    })
  }
  
  getGalery(){
    this.camera.getPicture({
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL
    }).then((res) =>{
      this.imgURL = 'data:image/jpeg;base64,' + res;
      console.log('imagen sacada galeria ', this.imgURL)
    }).catch(e =>{
      console.log(e);
    })
  }

  addDays(titulo: HTMLInputElement, photo, audio, descripcion: HTMLInputElement) {
    console.log('estos es lo que esta pasando foto', photo)
    console.log('estos es lo que esta pasando en audio', audio)
    console.log('estos es lo que esta pasando', titulo.value + ' - ' + descripcion.value)
    this.db.addDay(titulo.value, photo, audio, descripcion.value)
    .then(_ => {
      this.day = {};
      this.vibration.vibrate(1000);
      this.router.navigate(['/home']);
    });
  }



  verImg(): Boolean{
    if(this.imgURL == 'nada'){
      return this.flag
    }
    this.flag = true
    return this.flag
  }

  verAudio(){
    if(this.auxfile.length == 0){
      return this.flagAudio
    }
    this.flagAudio = true
    console.log('esto contiene audio ', this.auxfile)
    return this.flagAudio
  }

}
