import { h, FunctionComponent } from "preact";
import { useEffect, useRef } from "preact/compat";
import { CljdocProject } from "./switcher";

// Various functions and components used to show lists of results

// Navigating this list is done via events from the respective
// input components and thus not part of this code. Instead it is
// expected that a selectedIndex is passed to indicate which result
// is the currently selected one.

const restrictToViewport = (container: Element, selectedIndex: number) => {
  const containerRect = container.getBoundingClientRect();
  const selectedRect =
    container.children[selectedIndex].getBoundingClientRect();
  const deltaTop = selectedRect.top - containerRect.top;
  const deltaBottom = selectedRect.bottom - containerRect.bottom;
  if (deltaTop < 0) {
    container.scrollBy(0, deltaTop);
  } else if (deltaBottom > 0) {
    container.scrollBy(0, deltaBottom);
  }
};

// Props required by ResultsView
// - results: list of results to render
// - selectedIndex: index of currently selected result
// - onMouseOver: what should happen when hovering a single result
// - resultView: view for single result,

// `resultView` expects the following args (not props)
//   - result: result to be rendered
//   - isSelected: whether the result should be displayed as currently selected
//   - onMouseOver: a no-args function to call when hovering the result

export type ResultViewComponent = FunctionComponent<{
  result: CljdocProject;
  isSelected: boolean;
  selectResult: () => any;
}>;

type ResultsViewProps = {
  resultView: ResultViewComponent;
  results: CljdocProject[];
  selectedIndex: number;
  onMouseOver: (index: number) => any;
};

export const ResultsView = (props: ResultsViewProps) => {
  const { results, resultView: ResultView, selectedIndex, onMouseOver } = props;

  const resultsViewNode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    restrictToViewport(resultsViewNode.current!, selectedIndex);
  }, [selectedIndex]);

  return (
    <div
      className="bg-white br1 br--bottom bb bl br b--blue w-100 overflow-y-scroll"
      style={{ maxHeight: "20rem" }}
      ref={resultsViewNode}
    >
      {results.map((result, idx) => (
        <ResultView
          result={result}
          isSelected={selectedIndex === idx}
          selectResult={() => onMouseOver(idx)}
        />
      ))}
    </div>
  );
};
