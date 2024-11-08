import { useEffect, useState } from "react";
import { useCursor } from "./useCusor";
import { TimelineState } from "@types";

export const useTimeline = (defaultTimeline: TimelineState[]) => {
  const [timeline, setTimeline] = useState(defaultTimeline);
  const { createCursor, readCursor, updateCursor } = useCursor();

  const updateTimelineItem = (id: string, updates: Partial<TimelineState>) => {
    setTimeline((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  //先頭50件の取得
  useEffect(() => {
    (async () => {
      await Promise.all(
        timeline.map(async (timelineItem) => {
          let endpoint = "";
          switch (timelineItem.type) {
            case "home":
              endpoint = "/api/getTimeline/";
              break;
            case "user":
              endpoint = `/api/getUserPost/?did=${timelineItem.did}`;
              break;
          }
          const res = await fetch(new URL(endpoint, window.origin));
          const json = await res.json();
          if (json.feed?.length) {
            updateTimelineItem(timelineItem.id, { posts: json.feed });
            createCursor(timelineItem.id, json.cursor);
            updateTimelineItem(timelineItem.id, { hasMore: !!json.cursor });
          }
        })
      );
    })();
  }, []);

  const fetcher = async (timelineItem: TimelineState) => {
    const currentCursor = readCursor(timelineItem.id)?.cursor;
    if (!currentCursor) return;

    let endpoint = "";
    switch (timelineItem.type) {
      case "home":
        endpoint = `/api/getTimeline?cursor=${currentCursor}`;
        break;
      case "user":
        endpoint = `/api/getUserPost?cursor=${currentCursor}&did=${timelineItem.did}`;
        break;
    }

    const res = await fetch(new URL(endpoint, window.origin));
    const json = await res.json();

    if (json.feed?.length) {
      updateTimelineItem(timelineItem.id, {
        posts: [...timelineItem.posts, ...json.feed],
      });
      updateCursor(timelineItem.id, json.cursor);
      updateTimelineItem(timelineItem.id, { hasMore: !!json.cursor });
    } else {
      updateTimelineItem(timelineItem.id, { hasMore: false });
    }
  };

  return {
    timeline,
    fetcher,
  };
};
