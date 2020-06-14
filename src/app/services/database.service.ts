import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { HttpClient } from '@angular/common/http';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Diario {
  id_diario: number,
  titulo: string,
  photo: string,
  audio: string,
  descripcion: string
}

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {
  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
 
  days = new BehaviorSubject([]);
 
  constructor(private plt: Platform, private sqlitePorter: SQLitePorter, 
    private sqlite: SQLite, private http: HttpClient) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'databaseIonic.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
          this.database = db;
          this.seedDatabase();
      });
    });
  }

  seedDatabase() {
    this.http.get('assets/seed.sql', { responseType: 'text'})
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.database, sql)
        .then(_ => {
          this.loadDays();
          this.dbReady.next(true);
        })
        .catch(e => console.error(e));
    });
  }

  getDatabaseState() {
    return this.dbReady.asObservable();
  }
 
  getDays(): Observable<Diario[]> {
    return this.days.asObservable();
  }

  loadDays(){
    return this.database.executeSql('SELECT * FROM tbl_diario', []).then(data => {
      let diario: Diario[] = [];
 
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          diario.push({ 
            id_diario: data.rows.item(i).id_diario,
            titulo: data.rows.item(i).titulo, 
            photo: data.rows.item(i).photo, 
            audio: data.rows.item(i).audio,
            descripcion: data.rows.item(i).descripcion
           });
        }
      }
      this.days.next(diario);
    });
  }

  
  addDay(titulo, photo, audio, descripcion) {
    let data = [titulo, photo, audio, descripcion];
    return this.database.executeSql('INSERT INTO tbl_diario (titulo, photo, audio, descripcion) VALUES (?, ?, ?, ?)', data).then(data => {
      this.loadDays();
    });
  }
 
  getDay(id): Promise<Diario> {
    return this.database.executeSql('SELECT * FROM tbl_diario WHERE id_diario = ?', [id]).then(data => {

      return {
        id_diario: data.rows.item(0).id_diario,
        titulo: data.rows.item(0).titulo, 
        photo: data.rows.item(0).photo, 
        audio: data.rows.item(0).audio,
        descripcion: data.rows.item(0).descripcion
      }
    });
  }
 
  deleteDay(id) {
    return this.database.executeSql('DELETE FROM tbl_diario WHERE id_diario = ?', [id]).then(_ => {
      this.loadDays();
    });
  }
 
  updateDay(diario: Diario) {
    let data = [diario.titulo, diario.photo, diario.audio, diario.descripcion];
    console.log('entre a update ', data)
    return this.database.executeSql(`UPDATE tbl_diario SET titulo = ?, photo = ?, audio = ?, descripcion = ? WHERE id_diario =` + diario.id_diario , data).then(data => {
      this.loadDays();
    })

    
  }
}