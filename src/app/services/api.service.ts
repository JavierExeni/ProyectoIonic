import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'observe': 'body',
      'responseType': 'json'
    })
  };

  imgUrl = "http://localhost:3000"
  //imgUrl = "http://inv-web1.herokuapp.com"

  getImages(): Observable<ImageApi[]> {
    return this.http.get<ImageApi[]>(`${this.imgUrl}/images`).pipe(
      tap(_ => console.log('Got images')),
      catchError(this.handleError<ImageApi[]>('getFile'))
    )
  }

  getImage(id: number): Observable<ImageApi> {
    return this.http.get<ImageApi>(`${this.imgUrl}/images/${id}`).pipe(
      tap(_ => console.log('Got image')),
      catchError(this.handleError<ImageApi>('getFile'))
    )
  }

  postFile(file) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post(`${this.imgUrl}/images`, formData, this.httpOptions)
      .pipe(
        tap(_ => console.log('file uploaded succesfully')),
        catchError(this.handleError<any>('postFile'))
      );
  }

  deleteImage(id: number) {
    return this.http.delete(`${this.imgUrl}/images/${id}`)
      .pipe(
        tap(_ => console.log('deleting image')),
        catchError(this.handleError<any>('deleteImage'))
      )
  }

  uploadImage(blobData, name, ext) {
    const formData = new FormData();
    const fileName = new Date().getTime();
    formData.append('file', blobData, `${fileName}.${ext}`);
    formData.append('name', name);

    return this.http.post(`${this.imgUrl}/images`, formData).pipe(
      tap(_ => console.log('file uploaded succesfully')),
      catchError(this.handleError<any>('uploadImage'))
    );
  }

  uploadImageFile(file: File) {
    const ext = file.name.split('.').pop();
    const formData = new FormData();
    const fileName = new Date().getTime();
    formData.append('file', file, `${fileName}.${ext}`);
    formData.append('name', file.name);

    return this.http.post(`${this.imgUrl}/images`, formData).pipe(
      tap(_ => console.log('file uploaded succesfully')),
      catchError(this.handleError<any>('uploadImageFile'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}

export interface ImageApi {
  id: number;
  name: string;
  contentType: string;
  url: string;
}