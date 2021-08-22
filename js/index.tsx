import { h, render } from "preact";
import { trackProjectOpened, Switcher } from "./switcher";
import { App } from "./search";
import { MobileNav } from "./mobile";
import { Navigator } from "./navigator";
import {
  isNSPage,
  isProjectDocumentationPage,
  initScrollIndicator,
  initToggleRaw,
  restoreSidebarScrollPos,
  toggleMetaDialog,
  addPrevNextPageKeyHandlers,
  trackSidebarScrollPos
} from "./cljdoc";

trackProjectOpened();
restoreSidebarScrollPos();

const switcher = document.querySelector("#cljdoc-switcher");
switcher && render(<Switcher />, switcher);

const searchNode: HTMLElement | null = document.querySelector("#cljdoc-search");
if (searchNode && searchNode.dataset) {
  render(
    <App
      initialValue={searchNode.dataset.initialValue}
      results={[]}
      focused={false}
      selectedIndex={0}
    />,
    searchNode
  );
}

render(<Navigator />, document.querySelector("#js--cljdoc-navigator")!);

if (isNSPage()) {
  initScrollIndicator();
  initToggleRaw();
}

if (isProjectDocumentationPage()) {
  render(<MobileNav />, document.querySelector("#js--mobile-nav")!);
  toggleMetaDialog();
  addPrevNextPageKeyHandlers();
}

trackSidebarScrollPos();
