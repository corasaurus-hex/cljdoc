import { h } from "preact";
import { useMemo, useState } from "preact/compat";

const MobileNavBar = (props: {
  message: string;
  icon: string;
  onClick: h.JSX.MouseEventHandler<HTMLButtonElement>;
}) => (
  <div class="bg-light-gray">
    <button
      class="outline-0 bw0 bg-transparent w-100 tl pa2 pointer"
      onClick={props.onClick}
    >
      <img
        class="dib mr2 v-mid"
        src={"https://microicon-clone.vercel.app/" + props.icon + "/32"}
        height="32"
      />
      <span class="dib">{props.message}</span>
    </button>
  </div>
);

const findMainScrollView = () =>
  document.querySelector(".js--main-scroll-view")!;

const findSidebar = () => document.querySelector(".js--main-sidebar")!;

export const MobileNav = () => {
  const [navState, setNavState] = useState({
    showNav: false,
    navViewScrollPos: 0,
    mainViewScrollPos: 0
  });

  const mainScrollView = useMemo(findMainScrollView, []);
  const mainSidebar = useMemo(findSidebar, []);

  const toggleNav = () => {
    const scrollPos = window.scrollY;
    const isNavShown = mainScrollView.classList.contains("dn");

    if (isNavShown) {
      mainScrollView.classList.remove("dn"); // show main scroll view / content area
      mainSidebar.classList.replace("db", "dn"); // hide sidebar
      mainSidebar.classList.remove("flex-grow-1"); // remove class we add in other branch
      window.scrollTo(0, navState.mainViewScrollPos); // scroll after(!) swapping content
      setNavState({ ...navState, showNav: false, navViewScrollPos: scrollPos });
    } else {
      mainScrollView.classList.add("dn"); // hide main scroll view / content area
      mainSidebar.classList.add("flex-grow-1"); // make sure nav fills width of screen
      mainSidebar.classList.replace("dn", "db"); // show sidebar
      window.scrollTo(0, navState.navViewScrollPos); // scroll after(!) swapping content
      setNavState({ ...navState, showNav: true, mainViewScrollPos: scrollPos });
    }
  };

  if (navState.showNav) {
    return (
      <MobileNavBar
        message={"Back to Content"}
        icon={"chevronLeft"}
        onClick={toggleNav}
      />
    );
  }

  return (
    <MobileNavBar
      message={"Tap for Articles & Namespaces"}
      icon={"list"}
      onClick={toggleNav}
    />
  );
};
