export function useFindInNote() {
  const findBarOpen = useState<boolean>("findBarOpen", () => false)

  function openFindBar() {
    findBarOpen.value = true
  }

  function closeFindBar() {
    findBarOpen.value = false
  }

  return { findBarOpen, openFindBar, closeFindBar }
}
