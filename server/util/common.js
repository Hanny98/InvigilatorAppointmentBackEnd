import { isNullOrUndefined } from "./validationHelper.js";

export function checkSkipLimit(req) {
  let filterSkip = 0;
  let filterLimit = 100;
  const { skip, limit } = req.body;
  if (!isNullOrUndefined(skip)) {
    if (parseInt(skip, 10) > 0) {
      filterSkip = parseInt(skip, 10);
    }
  }
  if (!isNullOrUndefined(limit)) {
    if (parseInt(limit, 10) > 0) {
      filterLimit = parseInt(limit, 10);
    }
  }
  return {
    skip: filterSkip,
    limit: filterLimit,
  };
}
