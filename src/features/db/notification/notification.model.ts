import { IncludeFCMTokenQuery } from "./queries/include-fcm-token.query";

export class Notification {
  static includeFCMToken(fcmToken: string) {
    return new IncludeFCMTokenQuery(fcmToken).execute();
  }
}
