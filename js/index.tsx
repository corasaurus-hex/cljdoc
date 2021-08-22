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
  addPrevNextPageKeyHandlers
} from "./cljdoc";

export type SidebarScrollPos = { page: string; scrollTop: number };

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

window.onbeforeunload = function () {
  var sidebar = Array.from(document.querySelectorAll(".js--main-sidebar"))[0];
  if (sidebar) {
    var scrollTop = sidebar.scrollTop;
    var page = window.location.pathname.split("/").slice(0, 5).join("/");
    var data: SidebarScrollPos = { page: page, scrollTop: scrollTop };
    localStorage.setItem("sidebarScrollPos", JSON.stringify(data));
  }
};
