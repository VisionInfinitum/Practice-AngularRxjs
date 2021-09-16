import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from '../product.service';
import { catchError } from 'rxjs/operators';
import { EMPTY, Subject, Observable } from 'rxjs';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  product;

  private errorMessageSubject$: Subject<string> = new Subject<string>();
  errorMessage$: Observable<string> = this.errorMessageSubject$.asObservable();

  product$ = this.productService.selectedProduct$.pipe(
    catchError(err => {
      this.errorMessageSubject$.next(err);
      return EMPTY;
    })
  );
  constructor(private productService: ProductService) { }

}
