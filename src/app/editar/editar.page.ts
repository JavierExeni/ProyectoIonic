import { Component, OnInit } from '@angular/core';
import { DatabaseService, Diario } from '../services/database.service';
import { ActivatedRoute, Router } from "@angular/router";
import { Camera } from '@ionic-native/camera/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { MediaCapture, MediaFile, CaptureError} from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/file/ngx';


const MEDIA_FOLDER_NAME = 'audio_app_media';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
})
export class EditarPage implements OnInit {

  imgURL: string; 
  audioURL: string;
  files = [];
  flagAudio = false;

  day: Diario;


  dayNew: Diario;
  dia = {}
  constructor(private db: DatabaseService, 
    private router: Router,  
    private activatedRoute: ActivatedRoute,
    private camera: Camera,
    private mediaCapture: MediaCapture,
    private file: File,
    private media: Media) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      const recipeId = paramMap.get('id');
      console.log('Este es el id que pasa ',recipeId)
      this.db.getDay(recipeId).then(data =>{
        this.day = data
        this.imgURL = this.day.photo
        this.audioURL = this.day.audio
      })
    });
  }

  loadFiles() {
    this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME).then(
      res => {
        this.files = res;
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
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME + '/';
    console.log('copyTo ', copyTo)

    const path =  copyTo.replace(/^file:\/\//, '');
    this.audioURL = path + newName
    console.log('audioURLLLLLLL ', this.audioURL)

    this.file.copyFile(copyFrom, name, copyTo, newName).then(
      () => {
        this.loadFiles();
      },
      error => {
        console.log('error: ', error);
      }
    );
  }


  play(f: string){
      const audioFile: MediaObject = this.media.create(f);
      audioFile.play();
  }

  deleteFile(path: string) {
    console.log('path del audio ', path);
    let myPath = path;
    this.audioURL = "Nada";
    // Make sure we copy from the right location
    if (path.indexOf('file://') < 0) {
      myPath = 'file://' + path;
      console.log('mypath entro ', myPath)
    }

    const ext = myPath.split('/').pop();
    const Name = ext;
    console.log('el nombre del audio ', Name)

    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    console.log('copyFrom ', copyFrom)

    this.file.removeFile(copyFrom, Name).then(() => {
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

  UpdateDay(id_diario, titulo: HTMLInputElement, photo, audio, descripcion: HTMLInputElement) {
    console.log('estos es lo que esta pasando foto', photo)
    console.log('estos es lo que esta pasando en audio', audio)
    console.log('estos es lo que esta pasando', titulo.value + ' - ' + descripcion.value)
    this.dayNew = {
      id_diario: id_diario,
      titulo: titulo.value,
      photo: photo,
      audio: audio,
      descripcion: descripcion.value
    }
    this.db.updateDay(this.dayNew)
    .then(_ => {
      this.dia = {};
    });
    this.router.navigate(['/home']);
  }

  verAudio(){
    if(this.audioURL.length == 0 || this.audioURL == 'Nada'){
      console.log('entro', this.flagAudio)
      this.flagAudio = false;
      return this.flagAudio
    }
    this.flagAudio = true;
    console.log('esto contiene audio editar', this.audioURL)
    return this.flagAudio
  }

  eliminarImg(){
    console.log('Entreee 1 ', this.imgURL)
    this.imgURL = 'Nada'
    console.log('Entreee 2 ', this.imgURL)
  }
}
