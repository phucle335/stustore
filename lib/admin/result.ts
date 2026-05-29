export type ActionSuccess<T> = { ok: true; data: T };
export type ActionFailure = { ok: false; error: string };
export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

export function success<T>(data: T): ActionSuccess<T> {
  return { ok: true, data };
}

export function failure(error: string): ActionFailure {
  return { ok: false, error };
}
