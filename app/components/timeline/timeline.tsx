import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon, Trash } from "lucide-react";
import { TimelineState, TimelineStorage } from "@types";
import InfiniteScroll from "react-infinite-scroll-component";
import { PostView } from "@atproto/api/dist/client/types/app/bsky/feed/defs";
import { Post } from "./post";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useTimeline } from "~/hooks/useTimeline";
import { v4 as uuidv4 } from "uuid";
import { ClientOnly } from "remix-utils/client-only";

function SNSTimelineComponent() {
  const [savedTimeline, setSavedTimeline] =
    useLocalStorage<TimelineStorage[]>("timeline");

  //初回ロード時にhomeタイムラインを追加
  if (savedTimeline.length) {
    null;
  } else {
    setSavedTimeline([{ id: uuidv4(), type: "home", did: "null" }]);
  }

  //timelineのStateを生成
  const { timeline, fetcher } = useTimeline(
    savedTimeline.map((prev: TimelineStorage) => {
      return { ...prev, posts: [], hasMore: true };
    })
  );

  const [columns, setColumns] = useState<TimelineState[]>(timeline);

  useEffect(() => {
    setColumns(timeline);
  }, [timeline]);

  const moveColumn = (index: number, direction: "left" | "right") => {
    if (
      (direction === "left" && index === 0) ||
      (direction === "right" && index === columns.length - 1)
    ) {
      return;
    }
    const newColumns = [...columns];
    const swapIndex = direction === "left" ? index - 1 : index + 1;
    [newColumns[index], newColumns[swapIndex]] = [
      newColumns[swapIndex],
      newColumns[index],
    ];
    setColumns(newColumns);
  };

  const deleteTimeline = (id: string) => {
    setSavedTimeline((prev) => prev.filter((data) => data.id !== id));
  };

  return (
    <div className="flex">
      {columns.map((timelineItem: TimelineState, index) => (
        <motion.div
          key={timelineItem.id}
          id={`scrollable-timeline-${timelineItem.id}`}
          className="w-96"
          initial={{ x: 60 * index }}
          animate={{ x: 60 * index }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="h-screen overflow-y-scroll">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                {timelineItem.type == "home"
                  ? "ホームタイムライン"
                  : "ユーザータイムライン"}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveColumn(index, "left")}
                  disabled={index === 0}
                  aria-label={`Move ${timelineItem.id} column left`}
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => moveColumn(index, "right")}
                  disabled={index === columns.length - 1}
                  aria-label={`Move ${timelineItem.id} column right`}
                >
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteTimeline(timelineItem.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="h-[calc(100vh-8rem)]">
              <InfiniteScroll
                dataLength={timelineItem.posts.length}
                next={() => fetcher(timelineItem)}
                hasMore={timelineItem.hasMore}
                scrollableTarget={`scrollable-timeline-${timelineItem.id}`}
                loader={
                  <div className="m-auto my-16 animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                }
                height="calc(100vh - 8rem)"
                className="pr-4"
              >
                <div className="space-y-8">
                  {timelineItem.posts.map((postItem) => {
                    const postData = postItem.post as PostView;
                    return <Post key={postData.cid} post={postData} />;
                  })}
                </div>
              </InfiniteScroll>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

//client only
export default function SNSTimeline() {
  return (
    <ClientOnly fallback={<div>Loading...</div>}>
      {() => <SNSTimelineComponent />}
    </ClientOnly>
  );
}
