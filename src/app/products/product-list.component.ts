import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { Observable, EMPTY, Subject, combineLatest, BehaviorSubject } from 'rxjs';

import { Product } from './product';
import { ProductService } from './product.service';
import { catchError, map } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { ProductCategory } from '../product-categories/product-category';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  categories;

  private errorMessageSubject$: Subject<string> = new Subject<string>();
  errorMessage$: Observable<string> = this.errorMessageSubject$.asObservable();

  private categorySelectedSubject$ =  new BehaviorSubject<number>(0);
  categorySelectedAction = this.categorySelectedSubject$.asObservable();

  // combineLatest only emits when both streams have emitted a value
  products$: Observable<Product[]> = combineLatest([
    this.productService.addInsertedProduct$,
    this.categorySelectedAction
  ]).pipe(
    map(([products, selectedCategoryId]) =>
    products.filter(product => selectedCategoryId ? product.categoryId === selectedCategoryId : true)),
    catchError(err => {
      this.errorMessageSubject$.next(err);
      return EMPTY;
    })
  );

  categories$: Observable<ProductCategory[]> = this.productCategoryService.productCategories$.pipe(
    catchError(err => {
      this.errorMessageSubject$.next(err);
      return EMPTY;
    })
  );


  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) { }


  onAdd(): void {
    this.productService.addInsertedProduct();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject$.next(+categoryId);
  }
}
