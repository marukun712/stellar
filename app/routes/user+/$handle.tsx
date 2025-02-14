import { LoaderFunction, redirect } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Outlet,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import Main from "~/components/layout/main";
import Profile from "~/components/profile/profile";
import NotFound from "~/components/ui/404";
import Alert from "~/components/ui/alert";
import { resolveHandleOrDid } from "~/lib/actor/resolveHandleOrDid";
import { getSessionAgent } from "~/lib/auth/session";

export const loader: LoaderFunction = async ({ request, params }) => {
  const agent = await getSessionAgent(request);
  if (!agent) return redirect("/login");

  const { handle } = params;
  if (!handle) return new Response(null, { status: 404 });

  const { profile, did, error } = await resolveHandleOrDid(handle, agent);

  return { profile, did, error };
};

export default function Threads() {
  const { profile, did, error } = useLoaderData<typeof loader>();
  const location = useLocation();

  const tabs = [
    {
      path: `posts`,
      label: "Posts",
    },
    {
      path: `follow`,
      label: "Follow",
    },
    {
      path: `follower`,
      label: "Follower",
    },
    {
      path: `reactions`,
      label: "Reactions",
    },
  ];

  if (!error)
    return (
      <Main>
        <Profile profile={profile.data} />
        <div className="flex space-x-2 mb-6 overflow-scroll">
          {tabs.map(({ path, label }) => (
            <a
              key={path}
              href={path}
              className={`
                flex items-center px-4 py-2 rounded-lg flex-1 
                justify-center transition-colors
                ${
                  location.pathname.slice(
                    location.pathname.lastIndexOf("/") + 1,
                    location.pathname.length
                  ) === path
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : ""
                }
              `}
            >
              {label}
            </a>
          ))}
        </div>
        <Outlet context={{ profile, did, error }} />
      </Main>
    );

  return <Alert message="ユーザーが見つかりませんでした。" />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div>
      {isRouteErrorResponse(error) ? (
        error.status === 404 ? (
          <NotFound />
        ) : (
          <Alert message="ユーザーデータの取得に失敗しました。" />
        )
      ) : (
        <Alert message="ユーザーデータの取得に失敗しました。" />
      )}
    </div>
  );
}
