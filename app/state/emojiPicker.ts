import { atom, useRecoilValue, useSetRecoilState } from "recoil";

export const isEmojiPickerOpenState = atom<boolean>({
  key: "isEmojiPickerOpen",
  default: false,
});

export const PickerState = atom({
  key: "PickerState",
  default: { uri: "", cid: "", position: { top: 0, left: 0 } },
});

export const usePickerState = () => useRecoilValue(PickerState);
export const useSetPickerState = () => useSetRecoilState(PickerState);

export const useIsEmojiPickerOpen = () =>
  useRecoilValue(isEmojiPickerOpenState);
export const useSetIsEmojiPickerOpen = () =>
  useSetRecoilState(isEmojiPickerOpenState);

export const useEmojiPicker = () => {
  const picker = usePickerState();

  const setPicker = useSetPickerState();
  const setIsOpen = useSetIsEmojiPickerOpen();

  const calculatePickerPosition = (element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    return {
      top: rect.bottom + scrollY,
      left: rect.left + scrollX,
    };
  };

  const toggleEmojiPicker = (
    uri: string,
    cid: string,
    element: HTMLDivElement
  ) => {
    const position = calculatePickerPosition(element);

    setIsOpen(true);

    setPicker({ uri, cid, position });
  };

  const handleEmojiClick = async (emoji: { shortcodes: string }) => {
    // 絵文字ピッカーを閉じる
    setIsOpen(false);

    await fetch("/api/reaction/", {
      method: "POST",
      body: JSON.stringify({
        subject: { uri: picker.uri, cid: picker.cid },
        emoji: emoji.shortcodes,
      }),
    });
  };

  return {
    toggleEmojiPicker,
    handleEmojiClick,
  };
};
