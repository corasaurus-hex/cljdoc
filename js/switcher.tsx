import { h } from "preact";
import fuzzysort from "fuzzysort";
import { ResultsView, ResultViewComponent } from "./listselect";
import {
  addProjectId,
  clamp,
  CljdocProject,
  parseProject,
  resultUri
} from "./cljdoc";
import { useEffect, useRef, useState } from "preact/compat";

const MAX_MOST_RECENT_PROJECTS_OPENED_TRACKED = 15;

const isDifferentProject = (p1: CljdocProject, p2: CljdocProject): boolean =>
  p1.group_id !== p2.group_id || p1.artifact_id !== p2.artifact_id;

const parseCljdocURI = (uri: string): CljdocProject | void => {
  const splitted = uri.split("/");

  if (splitted.length >= 5 && splitted[1] === "d") {
    return {
      group_id: splitted[2],
      artifact_id: splitted[3],
      version: splitted[4]
    };
  }
};

const trackProjectOpened = () => {
  const project = parseCljdocURI(window.location.pathname);

  if (project) {
    const projects = JSON.parse(
      localStorage.getItem("previouslyOpened") || "[]"
    )
      // remove other versions of `project`
      .filter((p: CljdocProject) => isDifferentProject(p, project))
      // add project to the end of the list
      .concat([project])
      // shrink to at most the last N items in the array
      .slice(-MAX_MOST_RECENT_PROJECTS_OPENED_TRACKED);

    localStorage.setItem("previouslyOpened", JSON.stringify(projects));
  }
};

const SwitcherSingleResultView: ResultViewComponent = props => {
  const { result, isSelected, selectResult } = props;
  const project = parseProject(result);
  const docsUri = resultUri(result);
  return (
    <a className="no-underline black" href={docsUri} onMouseOver={selectResult}>
      <div
        className={`pa3 bb b--light-gray ${isSelected ? "bg-light-blue" : ""}`}
      >
        <h4 className="dib ma0">
          #{project} <span className="ml2 gray normal">{result.version}</span>
        </h4>
        <a className="link blue ml2" href={docsUri}>
          view docs
        </a>
      </div>
    </a>
  );
};

const Switcher = () => {
  const inputNode = useRef<HTMLInputElement>(null);
  const backgroundNode = useRef<HTMLDivElement>(null);

  const [switcherState, setSwitcherState] = useState(() => {
    const projects = JSON.parse(
      localStorage.getItem("previouslyOpened") || "[]"
    )
      .map(addProjectId)
      .reverse();

    return {
      previouslyOpened: projects,
      results: [] as CljdocProject[],
      selectedIndex: 0,
      show: false
    };
  });

  const maybeChangeSelection = (e: KeyboardEvent) => {
    if (
      (e.key === "ArrowDown" || e.key === "ArrowUp") &&
      e.target === inputNode.current
    ) {
      e.preventDefault();

      const newIndex =
        switcherState.selectedIndex + (e.key === "ArrowDown" ? 1 : -1);

      const maxIndex = switcherState.results.length - 1;

      setSwitcherState({
        ...switcherState,
        selectedIndex: clamp(newIndex, 0, maxIndex)
      });
    }
  };

  const maybeActivateSwitcher = (e: KeyboardEvent) => {
    if (
      e.key === "k" &&
      (e.metaKey || e.ctrlKey) &&
      e.target === document.body
    ) {
      setSwitcherState({
        ...switcherState,
        show: true,
        results: switcherState.previouslyOpened
      });
    }
  };

  const maybeKeyboardDeactivateSwitcher = (e: KeyboardEvent) => {
    if (e.key === "Escape" && switcherState.show) {
      setSwitcherState({
        ...switcherState,
        show: false,
        results: []
      });
    }
  };

  const maybeMouseDeactivateSwitcher = (e: MouseEvent) => {
    if (e.target === backgroundNode.current) {
      setSwitcherState({
        ...switcherState,
        show: false,
        results: []
      });
    }
  };

  const maybeSelectResult = (e: KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      switcherState.show &&
      e.target === inputNode.current
    ) {
      window.location.href = resultUri(
        switcherState.results[switcherState.selectedIndex]
      );
    }
  };

  const onDocumentKeydown = (e: KeyboardEvent) => {
    maybeActivateSwitcher(e);
    maybeChangeSelection(e);
    maybeKeyboardDeactivateSwitcher(e);
  };

  const updateResults = (e: Event) => {
    const target = e.target as HTMLFormElement;
    const fuzzysortOptions = {
      allowTypo: false,
      key: "project_id"
      //keys: ['group_id', 'artifact_id']
    };
    const results = fuzzysort.go<CljdocProject>(
      target.value,
      switcherState.previouslyOpened,
      fuzzysortOptions
    );

    setSwitcherState({
      ...switcherState,
      results: results.map(r => r.obj),
      selectedIndex: 0
    });
  };

  useEffect(() => {
    document.addEventListener("keydown", onDocumentKeydown);

    return () => document.removeEventListener("keydown", onDocumentKeydown);
  }, []);

  useEffect(() => {
    switcherState.show && inputNode.current && inputNode.current.focus();
  }, [switcherState.show, inputNode.current]);

  if (!switcherState.show) {
    return null;
  }

  return (
    <div
      className="bg-black-30 fixed top-0 right-0 bottom-0 left-0 sans-serif"
      ref={backgroundNode}
      onClick={maybeMouseDeactivateSwitcher}
    >
      <div className="mw7 center mt6 bg-white pa3 br2 shadow-3">
        <input
          placeholder="Jump to recently viewed docs..."
          className="pa2 w-100 br1 border-box b--blue ba input-reset"
          ref={inputNode}
          onKeyUp={maybeSelectResult}
          onInput={updateResults}
        />
        {switcherState.results.length > 0 && (
          <ResultsView
            results={switcherState.results}
            selectedIndex={switcherState.selectedIndex}
            onMouseOver={index =>
              setSwitcherState({ ...switcherState, selectedIndex: index })
            }
            resultView={SwitcherSingleResultView}
          />
        )}
      </div>
    </div>
  );
};

export { trackProjectOpened, Switcher };
