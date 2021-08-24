import { FunctionComponent, Fragment } from "preact/compat";

const isNSPage = () => !!document.querySelector(".ns-page");

const pathSegments = () => window.location.pathname.split("/");

const isProjectDocumentationPage = () =>
  pathSegments().length > 5 && pathSegments()[1] === "d";

const isElementVisible = (container: Element, element: Element) => {
  const { y: elementTop, height: elementHeight } =
      element.getBoundingClientRect(),
    elementBottom = elementTop + elementHeight,
    containerBottom = window.innerHeight,
    containerTop = containerBottom - container.clientHeight;
  return elementTop <= containerBottom && elementBottom >= containerTop;
};

const initScrollIndicator = () => {
  const mainScrollView = document.querySelector(".js--main-scroll-view");
  const sidebarScrollView = document.querySelector(
    ".js--namespace-contents-scroll-view"
  );
  const defBlocks = Array.from(document.querySelectorAll(".def-block"));
  const defItems = Array.from(document.querySelectorAll(".def-item"));

  const drawScrollIndicator = () => {
    defBlocks.forEach((defBlock: Element, idx) => {
      const defItem = defItems[idx];

      if (
        mainScrollView &&
        sidebarScrollView &&
        isElementVisible(mainScrollView, defBlock)
      ) {
        defItem.classList.add("scroll-indicator");
        if (idx === 0) {
          sidebarScrollView.scrollTop = 1;
        } else if (!isElementVisible(sidebarScrollView, defItem)) {
          defItem.scrollIntoView();
        }
      } else {
        defItem.classList.remove("scroll-indicator");
      }
    });
  };

  mainScrollView &&
    mainScrollView.addEventListener("scroll", drawScrollIndicator);

  drawScrollIndicator();
};

const initToggleRaw = () => {
  const toggleRaw = (event: MouseEvent) => {
    const toggle = event.target as HTMLAnchorElement;
    const parent = toggle.parentElement!;
    const markdowns = parent.querySelectorAll(".markdown");
    const raws = parent.querySelectorAll(".raw");

    markdowns &&
      markdowns.forEach((markdown, idx) => {
        const raw = raws[idx];
        if (markdown.classList.contains("dn")) {
          markdown.classList.remove("dn");
          raw.classList.add("dn");
          toggle.innerText = "raw docstring";
        } else {
          markdown.classList.add("dn");
          raw.classList.remove("dn");
          toggle.innerText = "formatted docstring";
        }
      });
  };

  const toggles: HTMLElement[] = Array.from(
    document.querySelectorAll(".js--toggle-raw")
  );

  toggles.forEach(toggle => {
    toggle.addEventListener("click", toggleRaw);
  });
};

const restoreSidebarScrollPos = () => {
  const scrollPosData = JSON.parse(
    localStorage.getItem("sidebarScrollPos") || "null"
  );
  const page = window.location.pathname.split("/").slice(0, 5).join("/");

  if (scrollPosData && scrollPosData.page === page) {
    const mainSidebar = document.querySelector(".js--main-sidebar");
    if (mainSidebar) {
      mainSidebar.scrollTop = scrollPosData.scrollTop;
    }
  }

  localStorage.removeItem("sidebarScrollPos");
};

function toggleMetaDialog() {
  if (document.querySelector(".js--main-scroll-view")) {
    const metaIcon = document.getElementById("js--meta-icon");
    const metaDialog = document.getElementById("js--meta-dialog");
    const metaClose = document.getElementById("js--meta-close");

    if (metaIcon) {
      metaIcon.onclick = () => {
        metaIcon.classList.replace("db-ns", "dn");
        metaDialog && metaDialog.classList.replace("dn", "db-ns");
      };
    }

    if (metaClose) {
      metaClose.onclick = () => {
        metaDialog && metaDialog.classList.replace("db-ns", "dn");
        metaIcon && metaIcon.classList.replace("dn", "db-ns");
      };
    }
  }
}

const addPrevNextPageKeyHandlers = () => {
  const prevLink: HTMLAnchorElement | null = document.querySelector(
    "a#prev-article-page-link"
  );
  const nextLink: HTMLAnchorElement | null = document.querySelector(
    "a#next-article-page-link"
  );

  if (prevLink || nextLink) {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (prevLink && e.key === "ArrowLeft") {
        document.location.href = prevLink.href;
      }
      if (nextLink && e.key === "ArrowRight") {
        document.location.href = nextLink.href;
      }
    });
  }
};

export type SidebarScrollPos = { page: string; scrollTop: number };

const trackSidebarScrollPos = () => {
  window.onbeforeunload = () => {
    var sidebar = document.querySelector(".js--main-sidebar");
    if (sidebar) {
      var scrollTop = sidebar.scrollTop;
      var page = window.location.pathname.split("/").slice(0, 5).join("/");
      var data: SidebarScrollPos = { page: page, scrollTop: scrollTop };
      localStorage.setItem("sidebarScrollPos", JSON.stringify(data));
    }
  };
};

export type CljdocProject = {
  group_id: string;
  artifact_id: string;
  version: string;
  project_id?: string;
};

const parseProject = (result: CljdocProject) =>
  result.group_id === result.artifact_id
    ? result.group_id
    : result.group_id + "/" + result.artifact_id;

const addProjectId = (result: CljdocProject): CljdocProject => ({
  ...result,
  project_id: parseProject(result)
});

const resultUri = (result: CljdocProject) =>
  "/d/" + result.group_id + "/" + result.artifact_id + "/" + result.version;

const When: FunctionComponent<{ condition: boolean }> = props =>
  props.condition ? <>{props.children}</> : null;

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export {
  initScrollIndicator,
  initToggleRaw,
  restoreSidebarScrollPos,
  toggleMetaDialog,
  isNSPage,
  isProjectDocumentationPage,
  addPrevNextPageKeyHandlers,
  trackSidebarScrollPos,
  parseProject,
  addProjectId,
  resultUri,
  When,
  clamp
};
