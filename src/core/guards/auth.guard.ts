import { CanMatchFn, GuardResult, MaybeAsync } from '@angular/router';

export const authGuard: CanMatchFn = (route, segments): MaybeAsync<GuardResult> => {
  return true;
};
