import { ProfileView } from "@atproto/api/dist/client/types/app/bsky/actor/defs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardHeader } from "../ui/card";

export const UserCard = ({ data }: { data: ProfileView }) => {
  if (data)
    return (
      <Card key={data.cid as string} className="rounded-none border-stone-700">
        <CardHeader>
          <a href={`/user/${data.handle}/posts`}>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={data.avatar} alt={data.displayName} />
                <AvatarFallback>
                  {data.displayName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{data.displayName}</p>
                <p className="text-sm text-muted-foreground">@{data.handle}</p>
              </div>
            </div>
          </a>
        </CardHeader>
      </Card>
    );
};
