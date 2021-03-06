import { Component, OnInit } from '@angular/core';
import { DatabaseService, Diario } from '../services/database.service';
import { Router } from '@angular/router';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { Vibration } from '@ionic-native/vibration/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  days: Diario[] = [];

  currentDay = new Date().toISOString();

  constructor(private db: DatabaseService, private router: Router, 
    private media: Media, private vibration: Vibration, private alertController: AlertController) {}

  ngOnInit() {
    this.db.getDatabaseState().subscribe(ready => {
      if(ready){
        this.db.getDays().subscribe(dias => {
          console.log('dias cmabiado ' + dias);
          this.days = dias;
        })
      }
    })
  }

  addDays() {
    this.router.navigate(['/agregar'])
  }

  editDay(id_diario){
    this.router.navigate(['/editar/' + id_diario])
  }

  async deleteDay(id_diario){
    const alert = await this.alertController.create({
      header: '¿Estas seguro que quieres eliminar este día?',
      message: 'Cuidado...',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () =>{
            this.db.deleteDay(id_diario)
            this.vibration.vibrate(1500);
            this.ngOnInit()
          }
        }
      ]
    });
    await alert.present();
  }

  play(audio: string){
    console.log('entreee', audio)
      // We need to remove file:/// from the path for the audio plugin to work
      const audioFile: MediaObject = this.media.create(audio);
      audioFile.play();
  }
 
}
