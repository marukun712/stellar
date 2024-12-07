import { ProfileView } from "~/generated/api/types/app/bsky/actor/defs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardHeader } from "../ui/card";

export const UserCard = ({ data }: { data: ProfileView }) => {
  return (
    <Card key={data.cid as string} className="md:w-[40vh] w-screen">
      <CardHeader>
        <a href={`/home/user?handle=${data.handle}`}>
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
