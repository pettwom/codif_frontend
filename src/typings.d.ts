import 'select2';

declare global {
  interface JQuery {
    select2(options?: Select2Options): JQuery;
  }
}