import { APP_ROUTES } from "./routes.constant";

type AppRouteKey = keyof typeof APP_ROUTES;
type ExtractParams<S extends string> = S extends `${infer A}/${infer B}`
  ? ExtractParams<A> | ExtractParams<B>
  : S extends `:${infer C}`
    ? C
    : never;

type RouteWithNoParams = keyof {
  [K in AppRouteKey as ExtractParams<(typeof APP_ROUTES)[K]> extends never
    ? K
    : never]: (typeof APP_ROUTES)[K];
};
type RouteWithParams = Exclude<AppRouteKey, RouteWithNoParams>;

type GetRouteMethod = {
  (key: RouteWithNoParams): string;

  <T extends RouteWithParams>(
    key: T,
    params: Record<ExtractParams<(typeof APP_ROUTES)[T]>, string>,
  ): string;
};

export class AppRoutes {
  static getRawRoute<T extends AppRouteKey>(key: T) {
    return APP_ROUTES[key];
  }

  static getRoute: GetRouteMethod = function <T extends AppRouteKey>(
    key: T,
    params?: Record<ExtractParams<T>, string>,
  ): string {
    if (!params) {
      return APP_ROUTES[key];
    }

    const route = APP_ROUTES[key];
    return route
      .split("/")
      .map((part) => {
        if (!part.startsWith(":")) return part;

        return params[part.slice(1) as ExtractParams<AppRouteKey>];
      })
      .join("/");
  };

  static checkRouteMatch(routeKey: AppRouteKey, route: string) {
    const regex = new RegExp(
      `^${APP_ROUTES[routeKey].replace(/:\w+/g, "\\w+")}$`,
    );
    return regex.test(route);
  }
}
