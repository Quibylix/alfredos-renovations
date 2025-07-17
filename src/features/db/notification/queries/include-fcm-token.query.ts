import { prisma } from "../../prisma/db";
import { User } from "../../user/user.model";
import { NOTIFICATION_STATUS_MESSAGES } from "../notification.constant";

export class IncludeFCMTokenQuery {
  constructor(private fcmToken: string) {}

  async execute() {
    const userId = await User.getCurrentUserId();
    const userRole = await User.getRole(userId);

    if (userRole === "anon") {
      return NOTIFICATION_STATUS_MESSAGES.NOT_AUTHORIZED;
    }

    const result = await prisma.profile_fcm_token.findUnique({
      where: {
        token: this.fcmToken,
      },
      select: {
        profile_id: true,
      },
    });

    if (result && result.profile_id !== userId) {
      await prisma.profile_fcm_token.delete({
        where: {
          token: this.fcmToken,
        },
      });
    }

    if (!result || result.profile_id !== userId) {
      await prisma.profile_fcm_token.create({
        data: {
          token: this.fcmToken,
          profile_id: userId!,
        },
      });
      return NOTIFICATION_STATUS_MESSAGES.OK;
    }

    await prisma.profile_fcm_token.update({
      where: {
        token: this.fcmToken,
        profile_id: userId!,
      },
      data: {
        updated_at: new Date(),
      },
    });

    return NOTIFICATION_STATUS_MESSAGES.OK;
  }
}
