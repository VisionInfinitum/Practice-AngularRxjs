import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError, combineLatest, BehaviorSubject, Subject, merge } from 'rxjs';


import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { on } from 'process';
import { map, catchError, tap, scan, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/productss';
  private suppliersUrl = this.supplierService.suppliersUrl;

  private productSelectedSubject$: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  public productSelectedAction$: Observable<number> = this.productSelectedSubject$.asObservable();
  private insertProductSubject$: Subject<Product> = new Subject<Product>();
  public insertProductAction$: Observable<Product> = this.insertProductSubject$.asObservable();

  public products$ =  this.http.get<Product[]>(this.productsUrl)
  .pipe(
    tap(data => console.log('Products: ', data)),
    catchError(this.handleError)
  );

  public productsWithCategory$: Observable<Product[]> = combineLatest([
    this.products$,
    this.productCategoryService.productCategories$
  ]).pipe(
    map(([products, categories]) =>
      products.map(product => ({
        ...product,
        price: product.price * 1.5,
        category: categories.find(category => category.id === product.categoryId)?.name,
        searchKey: [product.productName]
      }) as Product)),
      shareReplay(1)
  );

  public selectedProduct$: Observable<Product> = combineLatest([
    this.productsWithCategory$,
    this.productSelectedAction$
  ]).pipe(
    map(([products, selectedProductId]) => {
      return products.find(product => product.id === selectedProductId);
    }),
    shareReplay(1)
  );

  public addInsertedProduct$ = merge(
    this.productsWithCategory$,
    this.insertProductAction$
  ).pipe(
    scan((acc: Product[], value: Product) => [...acc, value])
  );

  constructor(private http: HttpClient,
              private supplierService: SupplierService,
              private productCategoryService: ProductCategoryService) { }


  selectedProductChange(selectedProductId: number): void {
    this.productSelectedSubject$.next(selectedProductId);
  }

  addInsertedProduct(): void {
    this.insertProductSubject$.next(this.fakeProduct());
  }

  public getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', data)),
      catchError(this.handleError)
    );
  }

  private fakeProduct() {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);

    return throwError(errorMessage);
  }

}
