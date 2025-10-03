export class DateRangerValidator {
  validate(value: any, args: any) {
    const object = args.object;
    if (object.startDate && object.endDate) {
      return new Date(object.startDate) <= new Date(object.endDate);
    }
    return true;
  }
}
