const findBarOpen = useState<boolean>("findBarOpen", () => false)

export function useFindInNote() {
  function openFindBar() {
    findBarOpen.value = true
  }

  function closeFindBar() {
    findBarOpen.value = false
  }

  return { findBarOpen, openFindBar, closeFindBar }
}
