import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Dot, Heart, MessageCircle, Repeat, User } from "lucide-react";
import { Notification } from "@atproto/api/src/client/types/app/bsky/notification/listNotifications";

interface NotificationCardProps {
  notification: Notification;
}

const getNotificationIcon = (reason: string) => {
  switch (reason) {
    case "like":
      return <Heart className="w-4 h-4 text-red-500" />;
    case "repost":
      return <Repeat className="w-4 h-4 text-green-500" />;
    case "reply":
      return <MessageCircle className="w-4 h-4 text-blue-500" />;
    case "follow":
      return <User className="w-4 h-4 text-purple-500" />;
    default:
      return null;
  }
};

const getNotificationText = (notification: Notification) => {
  switch (notification.reason) {
    case "like":
      return "liked your post";
    case "repost":
      return "reposted your post";
    case "reply":
      return "replied to your post";
    case "follow":
      return "followed you";
    default:
      return "interacted with you";
  }
};

export default function NotificationCard({
  notification,
}: NotificationCardProps) {
  return (
    <Card className="rounded-none border-stone-700">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
        <a href={`/user/${notification.author.did}/posts`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={notification.author.avatar} />
            <AvatarFallback>
              {notification.author.displayName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </a>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {notification.author.displayName}
            </span>
            {getNotificationIcon(notification.reason)}
          </div>
          <CardDescription>{getNotificationText(notification)}</CardDescription>
        </div>

        {notification.isRead ? " " : <Dot className="text-red-500 w-12 h-12" />}
      </CardHeader>

      <div className="justify-end">
        {notification.record.text && (
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-sm p-3 rounded-md">
              {notification.record.text}
            </div>
          </CardContent>
        )}
      </div>

      <CardContent className="pt-0 px-4 pb-4">
        <time className="text-xs">
          {new Date(notification.indexedAt).toLocaleString()}
        </time>
      </CardContent>
    </Card>
  );
}
