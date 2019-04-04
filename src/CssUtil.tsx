import { CSSProperties } from '@material-ui/styles/withStyles';

export function makeTypeCheckProperties<MemberType>(): <
  S extends { [key in K]: MemberType },
  K extends keyof S
>(
  ss: S
) => S {
  return s => s;
}
export const checkSheet = makeTypeCheckProperties<CSSProperties>();
