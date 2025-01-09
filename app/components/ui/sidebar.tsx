import { Home, Bell, Smile } from "lucide-react";
import { useProfile } from "~/state/profile";
import PostButton from "../buttons/postButton";

export default function SideBar() {
  const profile = useProfile();

  return (
    <div className="min-h-screen w-64 pt-12 fixed">
      {profile ? (
        <div className="space-y-6">
          <a href={`/user/${profile.handle}/posts`}>
            <img
              src={profile.avatar}
              alt="icon"
              className="rounded-full w-24 h-24"
            />
          </a>
          <a
            href={`/`}
            className="flex items-center space-x-4 hover:bg-gray-800 p-2 rounded-lg cursor-pointer"
          >
            <Home size={24} />
            <span className="text-lg font-medium">Home</span>
          </a>
          <div className="flex items-center space-x-4 hover:bg-gray-800 p-2 rounded-lg cursor-pointer">
            <Bell size={24} />
            <span className="text-lg font-medium">Notifications</span>
          </div>
          <a
            href={`/emoji/list`}
            className="flex items-center space-x-4 hover:bg-gray-800 p-2 rounded-lg cursor-pointer"
          >
            <Smile size={24} />
            <span className="text-lg font-medium">Bluemoji</span>
          </a>
          <div>
            <PostButton />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
